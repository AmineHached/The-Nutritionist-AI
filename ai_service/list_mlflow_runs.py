import os
from mlflow.tracking import MlflowClient

mlruns_path = os.path.abspath("mlruns")
print(f"Using mlruns path: {mlruns_path}")
client = MlflowClient(tracking_uri=mlruns_path)
exps = client.list_experiments()
print(f"Found {len(exps)} experiments")
for e in exps:
    print(f"Experiment {e.experiment_id}: {e.name}")
    runs = client.search_runs([e.experiment_id], "", max_results=100)
    for r in runs:
        print(f"  Run {r.info.run_id}  status={r.info.status} start_time={r.info.start_time}")
        try:
            arts = client.list_artifacts(r.info.run_id, path="")
            print("   Artifacts:", [a.path for a in arts])
        except Exception as ex:
            print("   Could not list artifacts:", ex)
