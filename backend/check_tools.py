
import importlib.util
import sys
import subprocess

tools = {
    "Python": "sys",
    "Jupyter": "jupyter_client",
    "Pandas": "pandas",
    "NumPy": "numpy",
    "SciPy": "scipy",
    "Statsmodels": "statsmodels",
    "DuckDB": "duckdb",
    "Apache Arrow": "pyarrow",
    "Scikit-learn": "sklearn",
    "TensorFlow": "tensorflow",
    "Keras": "keras",
    "PyTorch": "torch",
    "XGBoost": "xgboost",
    "LightGBM": "lightgbm",
    "CatBoost": "catboost",
    "ONNX": "onnx",
    "MLflow": "mlflow",
    "Pandas Profiling": "ydata_profiling", 
    "Great Expectations": "great_expectations",
    "Missingno": "missingno",
    "Pyjanitor": "janitor",
    "Matplotlib": "matplotlib",
    "Seaborn": "seaborn",
    "Plotly": "plotly",
    "Altair": "altair",
    "Bokeh": "bokeh",
    "Dash": "dash",
    "Streamlit": "streamlit",
    "Label Studio": "label_studio",
    "Doccano": "doccano",
    "Roboflow": "roboflow",
    "FastAPI": "fastapi",
    "Flask": "flask",
    "ONNX Runtime": "onnxruntime",
    "Apache Airflow": "airflow",
    "Prefect": "prefect",
    "Dagster": "dagster"
}

print(f"{'Tool':<25} | {'Status':<15} | {'Version':<15} | {'Verification Method'}")
print("-" * 80)

for name, module_name in tools.items():
    if name == "Python":
        print(f"{name:<25} | Installed       | {sys.version.split()[0]:<15} | sys.version")
        continue
        
    found = importlib.util.find_spec(module_name) is not None
    if found:
        try:
            mod = __import__(module_name)
            version = getattr(mod, "__version__", "Unknown")
            print(f"{name:<25} | Installed       | {version:<15} | import {module_name}")
        except Exception as e:
            print(f"{name:<25} | Error           | {str(e)[:15]:<15} | import {module_name}")
    else:
        print(f"{name:<25} | Missing         | N/A             | import {module_name}")

