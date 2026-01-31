import requests
import time
import json

AI_SERVICE_URL = "http://127.0.0.1:8000"
SPRINGBOOT_URL = "http://localhost:8080"
TEST_EMAIL = "test_user@example.com"

def verify():
    print("--- 1. Registering Test User in Spring Boot ---")
    user_payload = {
        "username": "testuser",
        "email": TEST_EMAIL,
        "password": "password123"
    }
    try:
        resp = requests.post(f"{SPRINGBOOT_URL}/api/users/register", json=user_payload)
        if resp.status_code == 200 or resp.status_code == 409: # 409 if already exists
            print("User registered or already exists.")
        else:
            print(f"Failed to register user: {resp.status_code} - {resp.text}")
            return
    except Exception as e:
        print(f"Error connecting to Spring Boot: {e}")
        return

    print("\n--- 2. Sending Analysis Request to AI Service ---")
    # We'll use a dummy image bytes if possible, or just a small valid image file
    # For testing the logic, we can also mock the Groq response if we wanted to be fast, 
    # but let's try a real call if the user has keys.
    
    # Create a tiny 1x1 black JPEG
    import io
    from PIL import Image
    buf = io.BytesIO()
    Image.new('RGB', (1, 1)).save(buf, format='JPEG')
    img_bytes = buf.getvalue()

    files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
    params = {'user_email': TEST_EMAIL}
    
    try:
        print("Sending analysis request...")
        resp = requests.post(f"{AI_SERVICE_URL}/api/analyze", files=files, params=params)
        if resp.ok:
            print("Analysis successful!")
            print(json.dumps(resp.json(), indent=2))
        else:
            print(f"Analysis failed: {resp.status_code} - {resp.text}")
            return
    except Exception as e:
        print(f"Error connecting to AI Service: {e}")
        return

    print("\n--- 3. Verifying History in Spring Boot ---")
    try:
        time.sleep(1) # Give it a second to save
        resp = requests.get(f"{SPRINGBOOT_URL}/api/history/user/{TEST_EMAIL}")
        if resp.ok:
            history = resp.json()
            if len(history) > 0:
                print(f"History found! Count: {len(history)}")
                latest = history[-1]
                print(f"Latest Action: {latest.get('action')}")
                print(f"Food Items: {latest.get('foodItems')}")
                print(f"Calories: {latest.get('calories')}")
                print("SUCCESS: Integration verified!")
            else:
                print("FAILED: History is empty for this user.")
        else:
            print(f"Failed to fetch history: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Error verifying history: {e}")

if __name__ == "__main__":
    verify()
