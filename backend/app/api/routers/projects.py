from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.security import User, get_current_user
from app.db.supabase import SupabaseManager

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, max_length=1000)
    type: str = Field('General', description="Project category/type")
    visibility: str = Field('private', description="Project visibility: public, private, team")
    tags: List[str] = []

class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    type: Optional[str] = 'General'
    visibility: str
    tags: Optional[List[str]] = []
    owner_id: str
    created_at: str

@router.get("/", response_model=List[Project])
async def list_projects(current_user: User = Depends(get_current_user)):
    """List all projects for the current user. Requires authentication."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('projects')\
            .select("*")\
            .eq('owner_id', current_user.user_id)\
            .order('created_at', desc=True)\
            .execute()
        
        projects = []
        for p in response.data:
            # Derive type from tags if available, otherwise default to 'General'
            project_type = 'General'
            if p.get('tags') and len(p['tags']) > 0:
                # Naive mapping: assume first tag is the category
                # "data science" -> "Data Science"
                project_type = p['tags'][0].title()
            
            p['type'] = project_type
            projects.append(p)
            
        return projects
    except Exception as e:
        print(f"Error listing projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Project)
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user)):
    """Create a new project. Requires authentication."""
    if not project.name or len(project.name.strip()) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project name cannot be empty")
    
    supabase = SupabaseManager.get_client()
    try:
        # Note: We rely on 'tags' to store the category/type to avoid schema migration issues
        # The 'type' field from the request is used to ensure the tag is present
        
        tags = project.tags
        if project.type and project.type != 'General':
            # Ensure the type is in tags (lowercase)
            type_tag = project.type.lower()
            if type_tag not in tags:
                tags.insert(0, type_tag)
                
        data = {
            "name": project.name,
            "description": project.description,
            # "type": project.type, # Removed: 'type' column might not exist in DB
            "visibility": project.visibility,
            "tags": tags,
            "owner_id": current_user.user_id
        }
        response = supabase.table('projects').insert(data).execute()
        if not response.data:
             raise HTTPException(status_code=500, detail="Failed to create project")
        
        created_project = response.data[0]
        # Re-attach type for the response model
        created_project['type'] = project.type
        
        return created_project
    except Exception as e:
        print(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user: User = Depends(get_current_user)):
    """Get project details."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('projects')\
            .select("*")\
            .eq('id', project_id)\
            .single()\
            .execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Project not found")
        # Check ownership (simplified)
        if response.data['owner_id'] != current_user.user_id:
             raise HTTPException(status_code=403, detail="Not authorized")
        
        project = response.data
        # Derive type from tags
        project_type = 'General'
        if project.get('tags') and len(project['tags']) > 0:
            project_type = project['tags'][0].title()
        project['type'] = project_type
        
        return project
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
