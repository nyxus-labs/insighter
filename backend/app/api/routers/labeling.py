from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from app.core.security import User, get_current_user

router = APIRouter()

class LabelingTask(BaseModel):
    id: str
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., description="image, text, audio")
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    status: str
    annotators: Optional[int] = 1
    owner_id: Optional[str] = None

mock_tasks = [
    {
        "id": "task_1",
        "name": "Satellite Imagery Classification",
        "type": "image",
        "progress": 0.75,
        "status": "active",
        "annotators": 3,
        "owner_id": "demo"
    },
    {
        "id": "task_2",
        "name": "Sentiment Analysis Dataset",
        "type": "text",
        "progress": 1.0,
        "status": "completed",
        "annotators": 1,
        "owner_id": "demo"
    }
]

@router.get("/", response_model=List[LabelingTask])
async def list_tasks(current_user: User = Depends(get_current_user)):
    """List all labeling tasks for current user. Requires authentication."""
    # Filter by user for non-admin
    if current_user.role == "admin":
        return mock_tasks
    return [t for t in mock_tasks if t.get("owner_id") == current_user.user_id]

@router.post("/create", response_model=LabelingTask)
async def create_task(name: str, type: str, current_user: User = Depends(get_current_user)):
    """Create a new labeling task. Requires authentication."""
    if not name or len(name.strip()) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Task name cannot be empty")
    
    if type not in ["image", "text", "audio"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid task type. Must be: image, text, or audio")
    
    new_task = {
        "id": f"task_{current_user.user_id}_{len(mock_tasks) + 1}",
        "name": name,
        "type": type,
        "progress": 0.0,
        "status": "active",
        "annotators": 1,
        "owner_id": current_user.user_id
    }
    mock_tasks.append(new_task)
    return new_task

