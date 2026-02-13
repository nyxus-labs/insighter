from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import User, get_current_user, security

router = APIRouter()

class DeploymentConfig(BaseModel):
    model_id: str = Field(..., min_length=1)
    target: str = Field(default="docker", description="docker, k8s, serverless")
    replicas: int = Field(default=1, ge=1, le=10)
    cpu: str = Field(default="1", description="CPU allocation")
    memory: str = Field(default="2Gi", description="Memory allocation")

class DeploymentStatus(BaseModel):
    id: str
    model_id: str
    status: str
    endpoint_url: Optional[str] = None
    created_at: str
    cpu: Optional[str] = "1"
    memory: Optional[str] = "2Gi"
    owner_id: Optional[str] = None

# In-memory storage for mock data
mock_deployments = [
    {
        "id": "dep_1",
        "model_id": "m1",
        "status": "running",
        "endpoint_url": "https://api.insighter.ai/v1/models/churn-v1",
        "created_at": "2023-10-25T10:00:00",
        "cpu": "1",
        "memory": "2Gi",
        "owner_id": "demo"
    },
    {
        "id": "dep_2",
        "model_id": "m3",
        "status": "failed",
        "endpoint_url": None,
        "created_at": "2023-10-26T14:30:00",
        "cpu": "2",
        "memory": "4Gi",
        "owner_id": "demo"
    }
]

@router.post("/deploy", response_model=DeploymentStatus)
async def deploy_model(config: DeploymentConfig, current_user: User = Depends(get_current_user)):
    """Deploy a model to production. Requires authentication."""
    if not config.model_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="model_id is required")
    
    new_deployment = {
        "id": f"deploy_{current_user.user_id}_{int(datetime.now().timestamp())}",
        "model_id": config.model_id,
        "status": "provisioning",
        "endpoint_url": None,
        "created_at": datetime.now().isoformat(),
        "cpu": config.cpu,
        "memory": config.memory,
        "owner_id": current_user.user_id
    }
    mock_deployments.append(new_deployment)
    return new_deployment

@router.get("/", response_model=List[DeploymentStatus])
async def list_deployments(current_user: User = Depends(get_current_user)):
    """List all deployments for current user. Requires authentication."""
    # Filter by user for non-admin, return all for admin
    if current_user.role == "admin":
        return mock_deployments
    return [d for d in mock_deployments if d.get("owner_id") == current_user.user_id]

@router.delete("/{deployment_id}")
async def delete_deployment(deployment_id: str, current_user: User = Depends(get_current_user)):
    """Delete a deployment. Requires authentication and ownership."""
    if not deployment_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="deployment_id is required")
    
    # Find and remove deployment (check ownership)
    global mock_deployments
    deployment = next((d for d in mock_deployments if d["id"] == deployment_id), None)
    
    if not deployment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    
    if deployment.get("owner_id") != current_user.user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete deployment you don't own")
    
    mock_deployments = [d for d in mock_deployments if d["id"] != deployment_id]
    return {"status": "deleted", "id": deployment_id}

