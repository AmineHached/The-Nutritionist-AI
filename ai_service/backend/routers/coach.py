import os
import requests
from fastapi import APIRouter, HTTPException
from backend.models import CoachRequest, CoachResponse, TitleRequest, TitleResponse
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# RAG Integration
try:
    from backend.rag.vector_store import get_vector_store
    vector_store = get_vector_store()
except Exception as e:
    vector_store = None

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL_ID = "llama-3.3-70b-versatile"
SPRINGBOOT_API_URL = os.getenv("SPRINGBOOT_API_URL", "http://localhost:8080")

SYSTEM_PROMPT = """
You are 'The Nutritionist Coach', an empathetic and knowledgeable AI health assistant.
Keep answers concise, motivating, and actionable.
"""

@router.post("/coach/chat", response_model=CoachResponse)
async def chat_with_coach(request: CoachRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    session_id = request.session_id

    # Create session if it doesn't exist
    if not session_id:
        try:
            session_resp = requests.post(f"{SPRINGBOOT_API_URL}/api/chat/session", 
                                       json={"email": request.user_email, "title": "New Conversation"}, timeout=5)
            if session_resp.ok:
                session_id = session_resp.json().get("id")
        except Exception as e:
            print(f"ERROR: Could not create session: {e}")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in request.history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    messages.append({"role": "user", "content": request.message})
    
    # Save User Message
    if session_id:
        try:
            requests.post(f"{SPRINGBOOT_API_URL}/api/chat/message", 
                         json={"sessionId": session_id, "role": "user", "content": request.message}, timeout=5)
        except: pass

    try:
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        payload = {"model": GROQ_MODEL_ID, "messages": messages, "max_tokens": 512, "temperature": 0.7}
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=30)
        response.raise_for_status()
            
        reply = response.json()['choices'][0]['message']['content']
        
        # Save Assistant Message
        if session_id:
            try:
                requests.post(f"{SPRINGBOOT_API_URL}/api/chat/message", 
                             json={"sessionId": session_id, "role": "assistant", "content": reply}, timeout=5)
            except: pass

        return CoachResponse(reply=reply, session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coach/title", response_model=TitleResponse)
async def generate_title(request: TitleRequest):
    if not GROQ_API_KEY:
        return TitleResponse(title="Nutrition Chat")

    messages = [
        {"role": "system", "content": "Create a TINY title (MAX 3 words) for this chat. Return ONLY the title."},
    ]
    for msg in request.history[:3]: 
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    
    try:
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        payload = {"model": GROQ_MODEL_ID, "messages": messages, "max_tokens": 20, "temperature": 0.5}
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        if response.ok:
            title = response.json()['choices'][0]['message']['content'].strip().strip('"').strip('.')
            if request.session_id:
                requests.put(f"{SPRINGBOOT_API_URL}/api/chat/session/{request.session_id}/title", json={"title": title}, timeout=5)
            return TitleResponse(title=title)
    except: pass
    return TitleResponse(title="Nutrition Chat")
