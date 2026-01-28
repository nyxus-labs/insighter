import mlflow
import os

def log_experiment(project_id: str, metrics: dict, params: dict):
    mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000"))
    mlflow.set_experiment(f"project_{project_id}")
    
    with mlflow.start_run():
        mlflow.log_params(params)
        mlflow.log_metrics(metrics)
        return mlflow.active_run().info.run_id
