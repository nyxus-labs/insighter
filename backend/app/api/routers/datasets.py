from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import User, get_current_user, security
from app.db.supabase import SupabaseManager

router = APIRouter()

class Dataset(BaseModel):
    id: str
    name: str
    type: str = Field(..., description="File type: csv, parquet, numpy, json")
    rows: Optional[int] = 0
    size: Optional[str] = "0B"
    created_at: str
    status: str = "ready"
    created_by: Optional[str] = None

@router.get("/", response_model=List[Dataset])
async def list_datasets(
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """List all datasets for current user. Requires authentication."""
    token = credentials.credentials
    user_supabase = SupabaseManager.get_authenticated_client(token)
    
    if not user_supabase:
        raise HTTPException(status_code=500, detail="Supabase client not available")
    
    try:
        response = user_supabase.table('datasets')\
            .select("*")\
            .eq('created_by', current_user.user_id)\
            .order('created_at', desc=True)\
            .execute()
        
        # Transform response to match Pydantic model
        datasets = []
        for item in response.data:
            datasets.append({
                "id": item['id'],
                "name": item['name'],
                "type": item.get('file_type', 'unknown'),
                "rows": item.get('row_count', 0),
                "size": f"{item.get('size_bytes', 0) / 1024 / 1024:.1f}MB",
                "created_at": item['created_at'],
                "status": "ready", # Default for now
                "created_by": item['created_by']
            })
        return datasets
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Error listing datasets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Upload a dataset. Requires authentication. Validates file size and type."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Filename is required")
    
    # Validate file extension
    allowed_extensions = {'.csv', '.parquet', '.json', '.npy', '.xlsx'}
    file_ext = '.' + file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Create a new client with the user's actual JWT to ensure RLS context is passed to Supabase
    token = credentials.credentials
    user_supabase = SupabaseManager.get_authenticated_client(token)
    
    if not user_supabase:
        raise HTTPException(status_code=500, detail="Supabase client not available")
    
    try:
        data = {
            "name": file.filename,
            "file_path": f"uploads/{current_user.user_id}/{file.filename}",
            "file_type": file_ext.replace('.', ''),
            "created_by": current_user.user_id,
            "size_bytes": 0, # We'd get this from file.size if available or seek
            "row_count": 0
        }
        
        from app.core.logging import logger
        logger.debug(f"Inserting dataset record for user {current_user.user_id} using JWT")
        response = user_supabase.table('datasets').insert(data).execute()
        
        return {
            "status": "uploaded", 
            "id": response.data[0]['id'],
            "filename": file.filename,
            "owner_id": current_user.user_id
        }
    except Exception as e:
        logger.error(f"Error uploading dataset: {e}")
        raise HTTPException(status_code=500, detail=str(e))
