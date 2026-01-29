import mlflow
import time
import logging

logger = logging.getLogger(__name__)

class MLMonitor:
    def __init__(self, experiment_name="Inference_Monitoring"):
        try:
            mlflow.set_experiment(experiment_name)
        except Exception as e:
            logger.error(f"Failed to set MLflow experiment for monitoring: {e}")

    def log_inference(self, model_name, inference_time, confidence, status="success"):
        """
        Logs inference metrics to MLflow.
        """
        try:
            with mlflow.start_run(run_name=f"inference_{int(time.time())}", nested=True):
                mlflow.log_param("model_name", model_name)
                mlflow.log_metric("inference_time_ms", inference_time * 1000)
                mlflow.log_metric("confidence", confidence)
                mlflow.log_tag("status", status)
        except Exception as e:
            # We don't want monitoring to break the main application flow
            logger.warning(f"Failed to log inference metrics to MLflow: {e}")

monitor = MLMonitor()
