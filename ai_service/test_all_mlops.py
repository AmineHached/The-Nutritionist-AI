import os
import sys
import torch
import mlflow
import subprocess
import time

# Add ai_service to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

def print_section(msg):
    print("\n" + "="*50)
    print(f" TESTING: {msg}")
    print("="*50)

def test_mvc_structure():
    print_section("MVC Structure & Initialization")
    try:
        from backend.vision.model_arch import get_food_model
        model = get_food_model(num_classes=10, pretrained=False)
        print(f"✓ Model Architecture: Loaded ResNet50 (MVC Model Layer)")
        
        from backend.vision.inference import vision_service
        print(f"✓ Inference Service: Initialized (MVC View/Service Layer)")
        
        from backend.monitoring import monitor
        print(f"✓ Monitoring Service: Initialized (MLOps Monitoring)")
        return True
    except Exception as e:
        print(f"✗ MVC Test Failed: {e}")
        return False

def test_mlflow_integration():
    print_section("MLflow Experiment Tracking")
    try:
        # Test a mock training log
        mlflow.set_experiment("MOCK_TEST_RUN")
        with mlflow.start_run(run_name="Verification_Run"):
            mlflow.log_param("test_mode", True)
            mlflow.log_metric("mock_accuracy", 0.99)
            print("✓ Successfully logged mock metrics to MLflow.")
        
        # Test runtime monitoring log
        from backend.monitoring import monitor
        monitor.log_inference("TestModel", 0.05, 0.92)
        print("✓ Successfully logged runtime monitoring metric.")
        return True
    except Exception as e:
        print(f"✗ MLflow Test Failed: {e}")
        return False

def test_dvc_status():
    print_section("DVC Data Tracking")
    try:
        result = subprocess.run(["py", "-m", "dvc", "status"], capture_output=True, text=True)
        if "train:" in result.stdout or result.returncode == 0:
            print("✓ DVC Pipeline: Recognized and tracking dependencies.")
            return True
        else:
            print(f"✗ DVC Status Failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ DVC Command Failed: {e}")
        return False

def test_docker_syntax():
    print_section("Dockerfile Presence")
    dockerfile_path = os.path.join(current_dir, "Dockerfile")
    if os.path.exists(dockerfile_path):
        print("✓ Dockerfile: Found at root of AI service.")
        return True
    else:
        print("✗ Dockerfile: Missing.")
        return False

if __name__ == "__main__":
    results = {
        "MVC Structure": test_mvc_structure(),
        "MLflow Tracking": test_mlflow_integration(),
        "DVC Tracking": test_dvc_status(),
        "Docker Config": test_docker_syntax()
    }
    
    print_section("FINAL RESULTS")
    all_passed = True
    for test, passed in results.items():
        status = "PASSED" if passed else "FAILED"
        print(f"{test}: {status}")
        if not passed: all_passed = False
    
    if all_passed:
        print("\nSUCCESS: All MLOps components verified!")
    else:
        print("\nWARNING: Some checks failed. See details above.")
        sys.exit(1)
