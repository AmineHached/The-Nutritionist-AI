
import os
import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health Check Passed")
            print(response.json())
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health Check Error: {e}")

def test_analyze():
    # Since we might not have a test image readily available in a known path,
    # we'll look for one or skip if not found.
    # We will try to find an image in the current directory or subdirectories
    image_path = None
    for root, dirs, files in os.walk("."):
        for file in files:
            if file.endswith((".jpg", ".jpeg", ".png")):
                image_path = os.path.join(root, file)
                break
        if image_path:
            break
            
    if not image_path:
        print("⚠️ No image found for analysis test. Skipping.")
        return

    print(f"Testing analysis with image: {image_path}")
    try:
        with open(image_path, "rb") as f:
            files = {"file": (image_path, f, "image/jpeg")}
            response = requests.post(f"{BASE_URL}/api/analyze", files=files)
            
        if response.status_code == 200:
            print("✅ Analysis Test Passed")
            # Truncate output for readability
            print(str(response.json())[:200] + "...") 
        else:
            print(f"❌ Analysis Test Failed: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"❌ Analysis Test Error: {e}")

if __name__ == "__main__":
    print("Waiting for server to be ready...")
    # we assume the user will start the server or we can't test
    test_health()
    test_analyze()
