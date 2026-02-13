from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import User, get_current_user, security
from app.db.supabase import SupabaseManager
from app.services.jupyter_manager import kernel_service
from app.services.settings_service import settings_service

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
    project_id: str

@router.get("/", response_model=List[Notebook])
async def list_notebooks(
    project_id: Optional[str] = None, 
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """List notebooks. Optionally filter by project_id."""
    from supabase import create_client
    from app.core.config import settings
    
    token = credentials.credentials
    user_supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    user_supabase.postgrest.auth(token)
    
    try:
        query = user_supabase.table('notebooks').select("*").eq('created_by', current_user.user_id)
        if project_id:
            query = query.eq('project_id', project_id)
        
        response = query.order('updated_at', desc=True).execute()
        return response.data
    except Exception as e:
        print(f"Error listing notebooks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Notebook)
async def create_notebook(
    notebook: NotebookCreate, 
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new notebook."""
    from supabase import create_client
    from app.core.config import settings
    
    token = credentials.credentials
    user_supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    user_supabase.postgrest.auth(token)
    
    try:
        # Verify project ownership first
        proj = user_supabase.table('projects').select('id').eq('id', notebook.project_id).eq('owner_id', current_user.user_id).execute()
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
        response = user_supabase.table('notebooks').insert(data).execute()
        return response.data[0]
    except Exception as e:
        print(f"Error creating notebook: {e}")
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
    Execute code in a Jupyter environment. Requires authentication and injects user secrets.
    """
    # Security checks
    dangerous_ops = ['__import__', 'exec', 'eval', 'compile', 'open', 'file', 'input', 'raw_input']
    code_lower = code_request.code.lower()
    
    for op in dangerous_ops:
        if op in code_lower:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Operation '{op}' is not allowed for security reasons"
            )
    
    try:
        # Fetch user secrets to inject as environment variables
        secrets = settings_service.get_user_secrets(current_user.user_id)
        
        # Execute code via Jupyter service
        output = kernel_service.execute(
            project_id=code_request.project_id,
            code=code_request.code,
            env=secrets
        )
        
        return {
            "output": output,
            "status": "success",
            "executed_by": current_user.user_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")
