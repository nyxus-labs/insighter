from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.security import User, get_current_user
from app.db.supabase import SupabaseManager

router = APIRouter()

class TaskCreate(BaseModel):
    workflow_id: str
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: str = 'medium'
    due_date: Optional[str] = None
    metadata: Optional[dict] = {}

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    metadata: Optional[dict] = None

class Task(BaseModel):
    id: str
    workflow_id: str
    name: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[str] = None
    metadata: dict
    created_at: str

@router.get("/", response_model=List[Task])
async def list_tasks(workflow_id: Optional[str] = None, assigned_to: Optional[str] = None, current_user: User = Depends(get_current_user)):
    """List tasks, optionally filtered by workflow_id or assigned_to."""
    supabase = SupabaseManager.get_client()
    try:
        query = supabase.table('tasks').select("*")
        if workflow_id:
            query = query.eq('workflow_id', workflow_id)
        if assigned_to:
            query = query.eq('assigned_to', assigned_to)
        
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Task)
async def create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    """Create a new task."""
    supabase = SupabaseManager.get_client()
    try:
        data = task.dict()
        data["status"] = "pending"
        response = supabase.table('tasks').insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create task")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{task_id}", response_model=Task)
async def update_task(task_id: str, task: TaskUpdate, current_user: User = Depends(get_current_user)):
    """Update task."""
    supabase = SupabaseManager.get_client()
    try:
        data = task.dict(exclude_unset=True)
        response = supabase.table('tasks').update(data).eq('id', task_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found or update failed")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: User = Depends(get_current_user)):
    """Delete task."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('tasks').delete().eq('id', task_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
