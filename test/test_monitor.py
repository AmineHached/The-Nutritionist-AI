import asyncio
import websockets
import requests
import threading
import time

async def monitor_logs():
    uri = "ws://localhost:8000/api/ws/monitor"
    print(f"🔌 Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected! Waiting for logs...")
            while True:
                message = await websocket.recv()
                print(f"📡 [MONITOR]: {message}")
    except Exception as e:
        print(f"❌ WebSocket Error: {e}")

def trigger_analysis():
    # Wait a bit for socket to connect
    time.sleep(2)
    print("\n🚀 Triggering Analysis Request...")
    
    # Use existing image if possible
    import os
    image_path = "images/image1.jpg"
    if not os.path.exists(image_path):
        # Fallback to creating a dummy image or searching
        for root, _, files in os.walk("."):
            for f in files:
                if f.endswith(".jpg"):
                    image_path = os.path.join(root, f) 
                    break
    
    if image_path:
        try:
            with open(image_path, "rb") as f:
                files = {"file": (image_path, f, "image/jpeg")}
                response = requests.post("http://localhost:8000/api/analyze", files=files)
                if response.status_code == 200:
                    print("✅ Analysis Request Complete")
                else:
                    print(f"❌ Analysis Request Failed: {response.text}")
        except Exception as e:
            print(f"❌ HTTTP Error: {e}")
    else:
        print("⚠️ No image found to test analysis.")

if __name__ == "__main__":
    # Start analysis trigger in a background thread
    t = threading.Thread(target=trigger_analysis)
    t.start()
    
    # Run the async monitor in main thread
    try:
        asyncio.run(monitor_logs())
    except KeyboardInterrupt:
        print("Stopping monitor...")
