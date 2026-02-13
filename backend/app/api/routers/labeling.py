from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import User, get_current_user, security

from supabase import create_client
from app.core.config import settings

router = APIRouter()

class LabelingTask(BaseModel):
    id: str
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., description="image, text, audio")
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    status: str
    annotators: Optional[int] = 1
    owner_id: Optional[str] = None
    project_id: Optional[str] = None

@router.get("/", response_model=List[LabelingTask])
async def list_tasks(
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """List all labeling tasks for current user. Requires authentication."""
    token = credentials.credentials
    user_supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    user_supabase.postgrest.auth(token)
    
    try:
        response = user_supabase.table('labeling_projects')\
            .select("*")\
            .execute()
        
        tasks = []
        for item in response.data:
            tasks.append({
                "id": str(item['id']),
                "name": item['name'],
                "type": item['type'],
                "progress": item.get('progress', 0.0),
                "status": item['status'],
                "annotators": item.get('annotators_count', 1),
                "owner_id": item['owner_id'],
                "project_id": item.get('project_id')
            })
        return tasks
    except Exception as e:
        print(f"Error listing labeling tasks: {e}")
        # If table doesn't exist yet or other error, return empty list
        return []

@router.post("/create", response_model=LabelingTask)
async def create_task(
    name: str, 
    type: str,
    project_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new labeling task. Requires authentication."""
    if not name or len(name.strip()) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Task name cannot be empty")
    
    if type not in ["image", "text", "audio"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid task type. Must be: image, text, or audio")
    
    token = credentials.credentials
    user_supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    user_supabase.postgrest.auth(token)
    
    new_project = {
        "name": name,
        "type": type,
        "owner_id": current_user.user_id,
        "project_id": project_id,
        "status": "active",
        "progress": 0.0,
        "annotators_count": 1
    }
    
    try:
        response = user_supabase.table('labeling_projects').insert(new_project).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create labeling project")
            
        item = response.data[0]
        return {
            "id": str(item['id']),
            "name": item['name'],
            "type": item['type'],
            "progress": item.get('progress', 0.0),
            "status": item['status'],
            "annotators": item.get('annotators_count', 1),
            "owner_id": item['owner_id'],
            "project_id": item.get('project_id')
        }
    except Exception as e:
        print(f"Error creating labeling project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

