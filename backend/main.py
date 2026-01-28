from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, projects, notebooks, labeling, experiments, deployment

app = FastAPI(title="The Insighter Enterprise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect All Modules
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(notebooks.router, prefix="/api/v1/notebooks", tags=["Notebooks"])
app.include_router(labeling.router, prefix="/api/v1/labeling", tags=["Labeling"])
app.include_router(experiments.router, prefix="/api/v1/experiments", tags=["MLflow"])
app.include_router(deployment.router, prefix="/api/v1/deploy", tags=["ONNX/Docker"])

@app.get("/")
def health():
    return {"status": "online", "modules": ["Auth", "Jupyter", "Labeling", "MLflow", "ONNX"]}
