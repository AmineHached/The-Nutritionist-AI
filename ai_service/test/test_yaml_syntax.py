import yaml
import os

def check_yaml_syntax(directory):
    print(f"Checking YAML files in {directory}...")
    for filename in os.listdir(directory):
        if filename.endswith(".yml") or filename.endswith(".yaml"):
            filepath = os.path.join(directory, filename)
            try:
                with open(filepath, 'r') as f:
                    yaml.safe_load(f)
                print(f"✓ {filename}: Syntax is correct.")
            except Exception as e:
                print(f"✗ {filename}: Syntax error - {e}")

if __name__ == "__main__":
    check_yaml_syntax(".github/workflows")
    if os.path.exists("dvc.yaml"):
        check_yaml_syntax(".")
