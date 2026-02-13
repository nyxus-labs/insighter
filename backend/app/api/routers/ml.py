from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import User, get_current_user, security
from app.db.supabase import SupabaseManager
from app.services.model_key_service import model_key_service, APIKeyCreate, APIKeyResponse

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
async def train_model(
    config: ModelTrainConfig, 
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Start a model training job. Requires authentication."""
    if not config.model_name or len(config.model_name.strip()) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Model name is required")
    
    token = credentials.credentials
    user_supabase = SupabaseManager.get_authenticated_client(token)
    
    if not user_supabase:
        raise HTTPException(status_code=500, detail="Supabase client not available")
    
    try:
        from app.core.logging import logger
        logger.debug(f"Starting model training for user {current_user.user_id} using JWT context")
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
        response = user_supabase.table('models').insert(data).execute()
        
        return {
            "job_id": response.data[0]['id'], 
            "status": "started",
            "owner_id": current_user.user_id
        }
    except Exception as e:
        logger.error(f"Error starting model training: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models", response_model=List[Model])
async def list_models(
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """List all models for current user. Requires authentication."""
    token = credentials.credentials
    user_supabase = SupabaseManager.get_authenticated_client(token)
    
    if not user_supabase:
        raise HTTPException(status_code=500, detail="Supabase client not available")
    
    try:
        from app.core.logging import logger
        logger.debug(f"Listing models for user {current_user.user_id} using JWT context")
        response = user_supabase.table('models')\
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
        logger.error(f"Error listing models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/keys", response_model=APIKeyResponse)
async def create_model_api_key(config: APIKeyCreate, current_user: User = Depends(get_current_user)):
    """Generate a new secure API key for an Insighter model."""
    try:
        # Verify ownership of the model
        supabase = SupabaseManager.get_client()
        model = supabase.table('models').select('id').eq('id', config.model_id).eq('created_by', current_user.user_id).execute()
        
        if not model.data:
            raise HTTPException(status_code=404, detail="Model not found or access denied")
            
        key_response = await model_key_service.create_key(current_user.user_id, config)
        return key_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Key generation failed: {str(e)}")

@router.get("/keys/{model_id}")
async def list_model_keys(model_id: str, current_user: User = Depends(get_current_user)):
    """List all API keys for a specific model."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('model_api_keys')\
            .select("id, name, scopes, created_at, expires_at, last_used_at, is_active")\
            .eq('model_id', model_id)\
            .eq('user_id', current_user.user_id)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
