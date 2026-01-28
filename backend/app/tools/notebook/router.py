from fastapi import APIRouter, HTTPException
from app.tools.notebook.service import NotebookTool
from app.tools.base import ToolConfig

router = APIRouter()

# Mock Config
notebook_config = ToolConfig(
    id="jupyter-notebook",
    name="Jupyter Notebook",
    version="1.0.0"
)

tool_instance = NotebookTool(notebook_config)

@router.post("/initialize/{project_id}")
async def initialize_notebook(project_id: str):
    try:
        result = await tool_instance.initialize(project_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute/{action}")
async def execute_action(action: str, payload: dict):
    return await tool_instance.execute(action, payload)

@router.get("/status/{project_id}")
async def get_status(project_id: str):
    return await tool_instance.get_status(project_id)
