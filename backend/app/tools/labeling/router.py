from fastapi import APIRouter
from app.tools.labeling.service import LabelingTool
from app.tools.base import ToolConfig

router = APIRouter()

config = ToolConfig(
    id="label-studio-lite",
    name="Label Studio Lite",
    version="1.0.0"
)

tool_instance = LabelingTool(config)

@router.post("/initialize/{project_id}")
async def initialize(project_id: str):
    return await tool_instance.initialize(project_id)

@router.post("/execute/{action}")
async def execute(action: str, payload: dict):
    return await tool_instance.execute(action, payload)
