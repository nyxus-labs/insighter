from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from app.core.security import User, get_current_user
from app.db.supabase import SupabaseManager

router = APIRouter()

class NotebookCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Notebook name")
    description: Optional[str] = None
    project_id: str
    kernel: str = "python3"

class Notebook(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    project_id: str
    kernel: str
    status: str
    content: Optional[dict] = {}
    created_by: str
    created_at: str
    updated_at: str

class CodeRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=10000, description="Python code to execute")

@router.get("/", response_model=List[Notebook])
async def list_notebooks(project_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    """List notebooks. Optionally filter by project_id."""
    supabase = SupabaseManager.get_client()
    try:
        query = supabase.table('notebooks').select("*").eq('created_by', current_user.user_id)
        if project_id:
            query = query.eq('project_id', project_id)
        
        response = query.order('updated_at', desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Notebook)
async def create_notebook(notebook: NotebookCreate, current_user: User = Depends(get_current_user)):
    """Create a new notebook."""
    supabase = SupabaseManager.get_client()
    try:
        # Verify project ownership first
        proj = supabase.table('projects').select('id').eq('id', notebook.project_id).eq('owner_id', current_user.user_id).execute()
        if not proj.data:
             raise HTTPException(status_code=404, detail="Project not found or access denied")

        data = {
            "name": notebook.name,
            "description": notebook.description,
            "project_id": notebook.project_id,
            "kernel": notebook.kernel,
            "created_by": current_user.user_id,
            "status": "idle"
        }
        response = supabase.table('notebooks').insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{notebook_id}", response_model=Notebook)
async def get_notebook(notebook_id: str, current_user: User = Depends(get_current_user)):
    """Get notebook details."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('notebooks').select("*").eq('id', notebook_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Notebook not found")
        if response.data['created_by'] != current_user.user_id:
             raise HTTPException(status_code=403, detail="Not authorized")
        return response.data
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute")
async def execute_code(code_request: CodeRequest, current_user: User = Depends(get_current_user)):
    """
    Execute code in a Jupyter environment. Requires authentication.
    """
    # ... (Keep existing safety checks)
    dangerous_ops = ['__import__', 'exec', 'eval', 'compile', 'open', 'file', 'input', 'raw_input']
    code_lower = code_request.code.lower()
    
    for op in dangerous_ops:
        if op in code_lower:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Operation '{op}' is not allowed for security reasons"
            )
    
    return {
        "output": "Execution result placeholder (Backend Integration Pending)", 
        "status": "success",
        "executed_by": current_user.user_id
    }
