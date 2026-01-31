import os
import requests
import base64
import json
import io
from PIL import Image
from datetime import datetime
from backend.models import AnalysisResponse, FoodItem, MacroNutrients
from backend.vision.inference import vision_service as local_vision
from backend.socket_manager import manager

# Load env vars manually just in case
from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Use a maintained default model; allow override via env
GROQ_MODEL_ID = os.getenv("GROQ_MODEL_ID", "llama-3.3-70b-versatile")
SPRINGBOOT_API_URL = os.getenv("SPRINGBOOT_API_URL", "http://localhost:8080")

SYSTEM_PROMPT = """
You are an expert nutritionist and computer vision AI. 
Analyze the image of food provided. 
Return ONLY valid JSON matching this structure exactly:
{
  "food_items": [
    {
      "name": "string",
      "confidence": float (0-1),
      "portion_desc": "string (e.g. 1 cup, 2 slices)",
      "weight_g": float (estimated),
      "nutrition": {
        "calories_kcal": float,
        "protein_g": float,
        "carbs_g": float,
        "fat_g": float,
        "sugar_g": float,
        "fiber_g": float
      },
      "health_rating": "string (Healthy/Moderate/Unhealthy)"
    }
  ],
  "total_nutrition": {
    "calories_kcal": float,
    "protein_g": float,
    "carbs_g": float,
    "fat_g": float,
    "sugar_g": float,
    "fiber_g": float
  },
  "health_score": int (0-100),
  "health_summary": "string (1-2 sentences)",
  "recommendations": ["string", "string"],
  "warnings": ["string"]
}
Do not add any markdown formatting (like ```json), just the raw JSON string.
"""

def java_iso_now():
    return datetime.now().isoformat()

async def analyze_image(image_bytes: bytes, media_type: str = "image/jpeg", user_email: str = "user@example.com") -> AnalysisResponse:
    await manager.broadcast("LOG: Starting Image Analysis...")
    
    if not GROQ_API_KEY:
        await manager.broadcast("WARN: GROQ_API_KEY is not set. Skipping Groq requests and using local fallbacks.")
        use_groq = False
    else:
        use_groq = True

    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        max_size = 1024
        if max(img.size) > max_size:
            img.thumbnail((max_size, max_size))
        
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        processed_image_bytes = buffer.getvalue()
        final_media_type = "image/jpeg"
    except Exception as e:
        print(f"Image processing error: {e}")
        processed_image_bytes = image_bytes
        final_media_type = media_type

    await manager.broadcast("LOG: Running Local Vision Model...")
    local_prediction = local_vision.predict_image(processed_image_bytes)
    
    confidence_threshold = 0.5
    conf_score = local_prediction.get("confidence", 0) if local_prediction else 0
    label = local_prediction.get("label", "Unknown") if local_prediction else "Unknown"
    
    await manager.broadcast(f"LOG: Local Model Result: '{label}' (Confidence: {conf_score:.2f})")
    
    current_model = GROQ_MODEL_ID
    if conf_score >= confidence_threshold:
        food_label = label
        msg = f"LOG: High Confidence. Using TEXT-ONLY Path."
        await manager.broadcast(msg)
        current_model = "llama-3.3-70b-versatile"
        
        prompt_content = f"You are a nutritionist. Estimate nutrition for: {food_label}. Return JSON." # Shortened for logic
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"The user has consumed: {food_label}. Provide full nutritional breakdown in JSON."}
        ]
    else:
        msg = "LOG: Low Confidence. Using VISION Fallback."
        await manager.broadcast(msg)
        current_model = "llama-3.2-11b-vision-preview"
        base64_image = base64.b64encode(processed_image_bytes).decode('utf-8')
        messages = [
            {
                "role": "user", 
                "content": [
                    {"type": "text", "text": SYSTEM_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{final_media_type};base64,{base64_image}"}
                    }
                ]
            }
        ]

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}" if GROQ_API_KEY else "", "Content-Type": "application/json"}
    payload = {"model": current_model, "messages": messages, "max_tokens": 1024, "temperature": 0.1}

    try:
        if use_groq:
            await manager.broadcast(f"LOG: Sending request to Groq API with model: {current_model}...")
            response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=60)
            # Debug: print full response if error
            if response.status_code != 200:
                print(f"Groq API Error {response.status_code}: {response.text}")
                await manager.broadcast(f"LOG: Groq Error: {response.status_code}")

                # Fallback to text-only if vision fails and we were attempting vision model
                if current_model and "vision" in current_model:
                    await manager.broadcast("LOG: Vision failed, trying text-only fallback...")
                    fallback_model = "llama-3.3-70b-versatile"
                    fallback_messages = [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Analyze a typical meal photo. Provide general nutritional breakdown for a balanced meal in JSON format."}
                    ]
                    fallback_payload = {"model": fallback_model, "messages": fallback_messages, "max_tokens": 1024, "temperature": 0.1}
                    response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=fallback_payload, timeout=60)

            response.raise_for_status()

            try:
                content = response.json().get('choices', [])[0].get('message', {}).get('content', '')
                content = content.replace("```json", "").replace("```", "").strip()
                data = json.loads(content)
                await manager.broadcast("LOG: Analysis Complete.")
                analysis_result = AnalysisResponse(**data)
            except Exception as parse_exc:
                print(f"Groq parsing error: {parse_exc}")
                raise parse_exc
        else:
            # No Groq API key: skip external call and build a fallback below
            raise RuntimeError("Groq not available; using local fallback")
        
        # --- Save to Spring Boot Backend ---
        try:
            history_payload = {
                "user": {"email": user_email},
                "action": "Food Analysis",
                "calories": analysis_result.total_nutrition.calories_kcal,
                "protein": analysis_result.total_nutrition.protein_g,
                "carbs": analysis_result.total_nutrition.carbs_g,
                "fat": analysis_result.total_nutrition.fat_g,
                "foodItems": ", ".join([item.name for item in analysis_result.food_items])
            }
            try:
                resp = requests.post(f"{SPRINGBOOT_API_URL}/api/history/save", json=history_payload, timeout=5)
                if resp.status_code not in (200, 201):
                    print(f"Save history failed: {resp.status_code} {resp.text}")
                    await manager.broadcast(f"WARN: Failed to save history: {resp.status_code}")
                else:
                    await manager.broadcast("LOG: Saved to history.")
            except Exception as e:
                print(f"Save history error: {e}")
                await manager.broadcast(f"WARN: Save history exception: {e}")
        except Exception as e:
            print(f"Save history error: {e}")

        return analysis_result
    except Exception as e:
        print(f"Vision service error: {e}")
        await manager.broadcast(f"ERROR: Vision service failed - {str(e)}")
        # Fallback: return a minimal AnalysisResponse based on local prediction so Spring Boot + UI doesn't crash
        try:
            fallback_item = {
                "name": label if label else "Unknown",
                "confidence": float(conf_score or 0),
                "portion_desc": "Unknown",
                "weight_g": 0.0,
                "nutrition": {
                    "calories_kcal": 0.0,
                    "protein_g": 0.0,
                    "carbs_g": 0.0,
                    "fat_g": 0.0,
                    "sugar_g": 0.0,
                    "fiber_g": 0.0
                },
                "health_rating": "Unknown"
            }

            fallback_data = {
                "food_items": [fallback_item],
                "total_nutrition": {
                    "calories_kcal": 0.0,
                    "protein_g": 0.0,
                    "carbs_g": 0.0,
                    "fat_g": 0.0,
                    "sugar_g": 0.0,
                    "fiber_g": 0.0
                },
                "health_score": 0,
                "health_summary": "Analysis unavailable; showing best-effort local label.",
                "recommendations": [],
                "warnings": []
            }
            # Try to provide a best-effort nutritional estimate from a small local lookup
            try:
                estimates = {
                    "salad": {"calories_kcal": 250, "protein_g": 6, "carbs_g": 20, "fat_g": 15, "fiber_g": 5, "sugar_g": 4},
                    "pizza": {"calories_kcal": 285, "protein_g": 12, "carbs_g": 36, "fat_g": 10, "fiber_g": 2, "sugar_g": 3},
                    "burger": {"calories_kcal": 354, "protein_g": 17, "carbs_g": 29, "fat_g": 20, "fiber_g": 1, "sugar_g": 6},
                    "rice": {"calories_kcal": 206, "protein_g": 4.2, "carbs_g": 45, "fat_g": 0.4, "fiber_g": 0.6, "sugar_g": 0.1},
                    "egg": {"calories_kcal": 78, "protein_g": 6.3, "carbs_g": 0.6, "fat_g": 5.3, "fiber_g": 0, "sugar_g": 0.6},
                    "unknown": None
                }

                key = (label or "").lower()
                found = None
                if key in estimates:
                    found = estimates[key]
                else:
                    for k in estimates:
                        if k != "unknown" and k in key:
                            found = estimates[k]
                            break

                if found:
                    fallback_data["food_items"][0]["nutrition"] = {
                        "calories_kcal": found["calories_kcal"],
                        "protein_g": found["protein_g"],
                        "carbs_g": found["carbs_g"],
                        "fat_g": found["fat_g"],
                        "sugar_g": found["sugar_g"],
                        "fiber_g": found["fiber_g"]
                    }
                    fallback_data["total_nutrition"] = fallback_data["food_items"][0]["nutrition"].copy()
                    fallback_data["health_score"] = 60
                    fallback_data["health_summary"] = "Estimated from a local heuristic match."
            except Exception:
                pass

            return AnalysisResponse(**fallback_data)
        except Exception:
            # As last resort re-raise
            raise e

