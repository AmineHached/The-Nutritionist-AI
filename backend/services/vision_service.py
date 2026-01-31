import os
import requests
import base64
import json
from backend.models import AnalysisResponse, FoodItem, MacroNutrients
from backend.vision.inference import vision_service as local_vision


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL_ID = os.getenv("GROQ_MODEL_ID", "llama-3.3-70b-versatile")

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

from PIL import Image
import io

from backend.socket_manager import manager
    
async def analyze_image(image_bytes: bytes, media_type: str = "image/jpeg") -> AnalysisResponse:
    await manager.broadcast("LOG: Starting Image Analysis...")
    
    final_media_type = media_type
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set.")

    # Validate and Resize Image (Groq has limits and smaller is faster)
    try:
        img = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if needed (e.g. PNG with alpha)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Resize if dimension > 1024 to save tokens/bandwidth
        max_size = 1024
        if max(img.size) > max_size:
            img.thumbnail((max_size, max_size))
        
        # Save back to bytes as JPEG for consistency
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        processed_image_bytes = buffer.getvalue()
        final_media_type = "image/jpeg" # We converted to JPEG
    except Exception as e:
        print(f"Image processing error: {e}")
        await manager.broadcast(f"ERROR: Image processing failed - {str(e)}")
        # Fallback to original bytes if PIL fails
        processed_image_bytes = image_bytes

    # Local Model Inference (Primary Identifier)
    await manager.broadcast("LOG: Running Local Vision Model...")
    local_prediction = local_vision.predict_image(processed_image_bytes)
    
    # Logic: If Local Model is confident, use Text-Only LLM. Otherwise, fallback to Vision LLM.
    confidence_threshold = 0.5
    
    # Safely get confidence
    conf_score = local_prediction.get("confidence", 0) if local_prediction else 0
    label = local_prediction.get("label", "Unknown") if local_prediction else "Unknown"
    
    await manager.broadcast(f"LOG: Local Model Result: '{label}' (Confidence: {conf_score:.2f})")
    
    if conf_score >= confidence_threshold:
        # PATH A: Local Model Success -> Text to LLM
        food_label = label
        msg = f"LOG: High Confidence (> {confidence_threshold}). Using TEXT-ONLY Path (Model: llama-3.3-70b)."
        print(msg)
        await manager.broadcast(msg)
        
        # Use configured Groq model (text-capable)
        groq_model = GROQ_MODEL_ID
        
        # Text-Only Prompt
        prompt_content = f"""
        You are an expert nutritionist.
        The user has consumed: {food_label}.
        
        Please estimate the nutritional content for a standard serving size of this food.
        Return ONLY valid JSON matching this structure exactly:
        {{
          "food_items": [
            {{
              "name": "{food_label}",
              "confidence": {conf_score},
              "portion_desc": "Standard serving",
              "weight_g": 0.0,
              "nutrition": {{
                "calories_kcal": 0.0,
                "protein_g": 0.0,
                "carbs_g": 0.0,
                "fat_g": 0.0,
                "sugar_g": 0.0,
                "fiber_g": 0.0
              }},
              "health_rating": "string (Healthy/Moderate/Unhealthy)"
            }}
          ],
          "total_nutrition": {{
             "calories_kcal": 0.0,
             "protein_g": 0.0,
             "carbs_g": 0.0,
             "fat_g": 0.0,
             "sugar_g": 0.0,
             "fiber_g": 0.0
          }},
          "health_score": 0,
          "health_summary": "string (1-2 sentences)",
          "recommendations": ["string", "string"],
          "warnings": ["string"]
        }}
        Do not add any markdown formatting.
        """
        
        messages = [
            {"role": "system", "content": "You are a helpful nutrition assistant."},
            {"role": "user", "content": prompt_content}
        ]
        
    else:
        # PATH B: Local Model Unsure -> Fallback to Vision LLM
        msg = "LOG: Low Confidence. Using VISION Fallback (Model: Llama 4 Maverick)."
        print(msg)
        await manager.broadcast(msg)
        # Use configured Groq model (vision-capable if provided)
        groq_model = GROQ_MODEL_ID
        
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

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": groq_model,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.1
    }
    
    try:
      await manager.broadcast("LOG: Sending request to Groq API...")
      # Debug: log a trimmed payload so we can inspect failures
      try:
        debug_payload = json.dumps(payload)[:4000]
      except Exception:
        debug_payload = str(payload)
      print("DEBUG: Groq payload:\n", debug_payload)
      await manager.broadcast(f"DEBUG: Sending payload to Groq (trimmed): {debug_payload[:1000]}")

      response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=60,
      )

      # If API returned a non-OK status, capture and broadcast full response text for debugging
      if not response.ok:
        resp_text = response.text
        error_msg = f"Groq API Error: {response.status_code} - {resp_text}"
        print(error_msg)
        await manager.broadcast(f"ERROR: {error_msg}")
        raise RuntimeError(f"Groq API returned {response.status_code}: {resp_text}")

      # Otherwise parse the successful response safely
      resp_json = response.json()
      choices = resp_json.get("choices") if isinstance(resp_json, dict) else None
      if not choices or not isinstance(choices, list) or not choices[0].get("message"):
        raise RuntimeError(f"Unexpected Groq response structure: {resp_json}")

      content = choices[0]["message"].get("content", "")
      # Clean potential markdown
      content = content.replace("```json", "").replace("```", "").strip()

      # Parse JSON
      data = json.loads(content)

      await manager.broadcast("LOG: Analysis Complete.")
      # Validate with Pydantic
      return AnalysisResponse(**data)

    except Exception as e:
      print(f"Error in vision service: {e}")
      await manager.broadcast(f"ERROR: Vision service failed - {str(e)}")
      # Fallback: return a minimal AnalysisResponse based on local prediction so UI doesn't crash
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
          # simple hardcoded estimates (per common meal item)
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
          # exact match or substring match
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
        # As last resort re-raise the original exception
        raise
