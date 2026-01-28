from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.security import User, get_current_user
from app.db.supabase import SupabaseManager

router = APIRouter()

class ModelTrainConfig(BaseModel):
    model_name: str = Field(..., min_length=1, max_length=255)
    algorithm: str = Field(..., description="ML algorithm to use")
    hyperparameters: Optional[dict] = Field(default={})
    project_id: str

class Model(BaseModel):
    id: str
    name: str
    version: str
    framework: Optional[str] = None
    status: str
    metrics: Optional[dict] = None
    owner_id: Optional[str] = None
    created_at: str

@router.post("/train")
async def train_model(config: ModelTrainConfig, current_user: User = Depends(get_current_user)):
    """Start a model training job. Requires authentication."""
    if not config.model_name or len(config.model_name.strip()) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Model name is required")
    
    supabase = SupabaseManager.get_client()
    try:
        # Create a new model entry in 'staging' status
        data = {
            "name": config.model_name,
            "version": "v1.0", # Naive versioning
            "framework": config.algorithm, # e.g. 'xgboost'
            "status": "staging",
            "project_id": config.project_id,
            "created_by": current_user.user_id,
            "metrics": {"accuracy": 0.0} # Placeholder
        }
        response = supabase.table('models').insert(data).execute()
        
        return {
            "job_id": response.data[0]['id'], 
            "status": "started",
            "owner_id": current_user.user_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models", response_model=List[Model])
async def list_models(current_user: User = Depends(get_current_user)):
    """List all models for current user. Requires authentication."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('models')\
            .select("*")\
            .eq('created_by', current_user.user_id)\
            .order('created_at', desc=True)\
            .execute()
        
        models = []
        for item in response.data:
            models.append({
                "id": item['id'],
                "name": item['name'],
                "version": item['version'],
                "framework": item.get('framework'),
                "status": item['status'],
                "metrics": item.get('metrics'),
                "owner_id": item['created_by'],
                "created_at": item['created_at']
            })
        return models
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
