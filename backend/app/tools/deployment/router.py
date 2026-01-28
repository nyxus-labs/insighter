from fastapi import APIRouter
from app.tools.deployment.service import DeploymentTool
from app.tools.base import ToolConfig

router = APIRouter()

config = ToolConfig(
    id="k8s-deployer",
    name="K8s Deployer",
    version="1.4.2"
)

tool_instance = DeploymentTool(config)

@router.post("/initialize/{project_id}")
async def initialize(project_id: str):
    return await tool_instance.initialize(project_id)

@router.post("/execute/{action}")
async def execute(action: str, payload: dict):
    return await tool_instance.execute(action, payload)
