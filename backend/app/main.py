import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import logger
from app.api.routers import auth, projects, datasets, notebooks, ml, deployment, labeling, search, environment, health, settings as settings_router, workflows, tasks, notifications, collaboration
from app.tools.notebook import router as notebook_tool_router
from app.tools.data import router as data_tool_router
from app.tools.experiments import router as experiments_tool_router
from app.tools.labeling import router as labeling_tool_router
from app.tools.deployment import router as deployment_tool_router
from app.core.config import settings

app = FastAPI(
    title="The Insighter Enterprise API",
    description="Backend API for The Insighter Data Science Platform",
    version="1.0.0"
)

# CORS Configuration - More permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(notebooks.router, prefix="/api/notebooks", tags=["Notebooks"])
app.include_router(ml.router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(deployment.router, prefix="/api/deployment", tags=["Deployment"])
app.include_router(labeling.router, prefix="/api/labeling", tags=["Labeling"])
app.include_router(environment.router, prefix="/api/environment", tags=["Environment"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["Settings"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(collaboration.router, prefix="/api/collaboration", tags=["Collaboration"])
app.include_router(notebook_tool_router.router, prefix="/api/tools/notebook", tags=["Tools: Notebook"])
app.include_router(data_tool_router.router, prefix="/api/tools/data", tags=["Tools: Data"])
app.include_router(experiments_tool_router.router, prefix="/api/tools/experiment", tags=["Tools: Experiments"])
app.include_router(labeling_tool_router.router, prefix="/api/tools/labeling", tags=["Tools: Labeling"])
app.include_router(deployment_tool_router.router, prefix="/api/tools/deployment", tags=["Tools: Deployment"])

@app.get("/")
async def root():
    return {"status": "online", "system": "The Insighter Enterprise Core"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

