from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.jupyter_manager import kernel_service

router = APIRouter()

class CodeRequest(BaseModel):
    project_id: str
    code: str

@router.post("/execute")
def run_code(payload: CodeRequest):
    try:
        result = kernel_service.execute(payload.project_id, payload.code)
        return {"output": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
