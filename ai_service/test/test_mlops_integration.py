import os
import sys

# Add ai_service to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(os.path.join(project_root, "ai_service"))

def test_mvc_imports():
    print("Testing MVC imports...")
    try:
        from backend.vision.model_arch import get_food_model
        model = get_food_model(num_classes=10, pretrained=False)
        print("✓ model_arch import and model creation successful.")
    except Exception as e:
        print(f"✗ model_arch import failed: {e}")
        return False
    return True

def test_inference_service():
    print("\nTesting Inference Service loading...")
    try:
        from backend.vision.inference import vision_service
        # Try to load with a non-existent path to trigger the "fallback" mode it has
        vision_service.load_model("non_existent.pth")
        print("✓ Inference service initialized and loaded (fallback/mock mode).")
    except Exception as e:
        print(f"✗ Inference service failed: {e}")
        return False
    return True

if __name__ == "__main__":
    success = True
    success &= test_mvc_imports()
    success &= test_inference_service()
    
    if success:
        print("\nSUCCESS: MVC structure is correct.")
    else:
        print("\nFAILURE: One or more tests failed.")
        sys.exit(1)
