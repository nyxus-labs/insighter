from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from app.core.security import User, get_current_user
from app.db.supabase import SupabaseManager

router = APIRouter()

class WorkflowCreate(BaseModel):
    project_id: str
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    config: Optional[dict] = {}

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    config: Optional[dict] = None

class Workflow(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    status: str
    config: dict
    created_by: str
    created_at: str

@router.get("/", response_model=List[Workflow])
async def list_workflows(project_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    """List workflows, optionally filtered by project_id."""
    supabase = SupabaseManager.get_client()
    try:
        query = supabase.table('workflows').select("*")
        if project_id:
            query = query.eq('project_id', project_id)
        
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Workflow)
async def create_workflow(workflow: WorkflowCreate, current_user: User = Depends(get_current_user)):
    """Create a new workflow."""
    supabase = SupabaseManager.get_client()
    try:
        data = {
            "project_id": workflow.project_id,
            "name": workflow.name,
            "description": workflow.description,
            "config": workflow.config,
            "created_by": current_user.user_id,
            "status": "draft"
        }
        response = supabase.table('workflows').insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create workflow")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str, current_user: User = Depends(get_current_user)):
    """Get workflow details."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('workflows').select("*").eq('id', workflow_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, workflow: WorkflowUpdate, current_user: User = Depends(get_current_user)):
    """Update workflow."""
    supabase = SupabaseManager.get_client()
    try:
        data = workflow.dict(exclude_unset=True)
        response = supabase.table('workflows').update(data).eq('id', workflow_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Workflow not found or update failed")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str, current_user: User = Depends(get_current_user)):
    """Delete workflow."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('workflows').delete().eq('id', workflow_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
