import requests
import time
import json
import io
from PIL import Image

AI_SERVICE_URL = "http://127.0.0.1:8000"
SPRINGBOOT_URL = "http://localhost:8080"
TEST_EMAIL = "test_user@example.com"

def verify_all():
    print("--- 1. Registering/Checking Test User ---")
    u_resp = requests.post(f"{SPRINGBOOT_URL}/api/users/register", json={"username": "testuser", "email": TEST_EMAIL, "password": "password123"})
    print(f"Register Response: {u_resp.status_code}")

    print("\n--- 2. Testing Food Analysis Persistence ---")
    buf = io.BytesIO()
    Image.new('RGB', (100, 100)).save(buf, format='JPEG') # 100x100 to be safer
    files = {'file': ('test.jpg', buf.getvalue(), 'image/jpeg')}
    
    print("Sending analysis request...")
    a_resp = requests.post(f"{AI_SERVICE_URL}/api/analyze", files=files, params={'user_email': TEST_EMAIL})
    print(f"Analysis Status: {a_resp.status_code}")
    if a_resp.ok:
        print("Analysis response received.")
    else:
        print(f"Analysis Error: {a_resp.text}")

    print("Checking history in Spring Boot...")
    time.sleep(2) # Wait for potential async save
    h_resp = requests.get(f"{SPRINGBOOT_URL}/api/history/user/{TEST_EMAIL}")
    if h_resp.ok:
        history = h_resp.json()
        print(f"History entries found: {len(history)}")
        if len(history) > 0:
            print("LATEST HISTORY ENTRY:")
            print(json.dumps(history[-1], indent=2))
        else:
            print("History is EMPTY.")
    else:
        print(f"Failed to fetch history: {h_resp.status_code} - {h_resp.text}")

    print("\n--- 3. Testing Chatbot Persistence ---")
    chat_payload = {
        "message": "Hello AI Coach! Tell me about protein.",
        "history": [],
        "user_email": TEST_EMAIL
    }
    print("Sending chat request...")
    c_resp = requests.post(f"{AI_SERVICE_URL}/api/coach/chat", json=chat_payload)
    print(f"Chat Status: {c_resp.status_code}")
    if c_resp.ok:
        data = c_resp.json()
        session_id = data.get("session_id")
        print(f"Chat successful! Session ID: {session_id}")
        
        if session_id:
            print("Checking session in Spring Boot...")
            time.sleep(2)
            db_resp = requests.get(f"{SPRINGBOOT_URL}/api/chat/session/{session_id}")
            if db_resp.ok:
                session_data = db_resp.json()
                messages = session_data.get("messages", [])
                print(f"Messages found in DB for session {session_id}: {len(messages)}")
                for m in messages:
                    print(f"  [{m.get('role')}]: {m.get('content')[:50]}...")
            else:
                print(f"FAILED to fetch session {session_id} from DB: {db_resp.status_code}")
        else:
            print("FAILED: No session_id returned from AI service.")
    else:
        print(f"Chat request FAILED: {c_resp.text}")

if __name__ == "__main__":
    verify_all()
