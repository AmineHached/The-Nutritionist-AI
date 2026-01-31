import mlflow
import os

def test_mlflow_logging():
    print("Testing MLflow logging...")
    try:
        mlflow.set_experiment("Integration_Test")
        with mlflow.start_run():
            mlflow.log_param("test_param", 123)
            mlflow.log_metric("test_metric", 0.95)
            print("✓ Successfully logged parameter and metric to MLflow.")
            
        # Check if mlruns directory exists
        if os.path.exists("mlruns"):
            print("✓ 'mlruns' directory created successfully.")
        else:
            print("✗ 'mlruns' directory not found.")
            return False
    except Exception as e:
        print(f"✗ MLflow logging failed: {e}")
        return False
    return True

if __name__ == "__main__":
    if test_mlflow_logging():
        print("\nSUCCESS: MLflow is operational.")
    else:
        sys.exit(1)
