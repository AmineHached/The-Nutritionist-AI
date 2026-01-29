from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(title="The Nutritionist API", description="AI-powered Food Analysis & Coach")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from backend.routers import analysis, coach

app.include_router(analysis.router, prefix="/api")
app.include_router(coach.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    from backend.vision.inference import vision_service
    # Assuming running from root directory where food_model.pth is located
    model_loaded = vision_service.load_model("food_model.pth")
    if model_loaded:
        print("Startup: Vision model loaded successfully.")
    else:
        print("Startup: Warning - Vision model could not be loaded.")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "The Nutritionist AI"}

# Mount frontend
if os.path.exists("frontend"):
    app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
else:
    print("Startup: Warning - 'frontend' directory not found. Static files not mounted.")
