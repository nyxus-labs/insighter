from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.core.security import User, get_current_user
from app.db.supabase import SupabaseManager
import uuid

router = APIRouter()

class CollaboratorBase(BaseModel):
    project_id: str
    user_id: str
    role: str

class CollaboratorCreate(BaseModel):
    project_id: str
    email: str
    role: str

class SharedProject(BaseModel):
    id: str
    project_id: str
    project_name: str
    owner_name: str
    role: str
    shared_at: str

@router.get("/stats")
async def get_collaboration_stats(current_user: User = Depends(get_current_user)):
    """Get collaboration statistics for the current user."""
    supabase = SupabaseManager.get_client()
    try:
        # 1. Total Collaborators (distinct users who collaborate on projects owned by current user)
        # First, get all projects owned by the user
        projects_response = supabase.table('projects').select("id").eq('owner_id', current_user.user_id).execute()
        project_ids = [p['id'] for p in projects_response.data]
        
        total_collaborators = 0
        if project_ids:
            collab_response = supabase.table('collaborators').select("user_id", count='exact').in_('project_id', project_ids).execute()
            # Count distinct user_ids
            distinct_users = set(c['user_id'] for c in collab_response.data)
            total_collaborators = len(distinct_users)
        
        # 2. Shared With You (count from list_shared_projects logic)
        shared_response = supabase.table('collaborators').select("id", count='exact').eq('user_id', current_user.user_id).execute()
        shared_with_you = shared_response.count if shared_response.count is not None else 0
        
        # 3. Pending Invitations (from notifications table)
        notif_response = supabase.table('notifications')\
            .select("id", count='exact')\
            .eq('user_id', current_user.user_id)\
            .eq('type', 'share')\
            .eq('read', False)\
            .execute()
        pending_invitations = notif_response.count if notif_response.count is not None else 0
        
        return {
            "total_collaborators": total_collaborators,
            "shared_with_you": shared_with_you,
            "pending_invitations": pending_invitations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shared", response_model=List[SharedProject])
async def list_shared_projects(current_user: User = Depends(get_current_user)):
    """List projects shared with the current user."""
    supabase = SupabaseManager.get_client()
    try:
        # Get collaborations for the current user
        collab_response = supabase.table('collaborators').select("*, projects(name, owner_id, profiles!projects_owner_id_fkey(full_name))").eq('user_id', current_user.user_id).execute()
        
        shared_projects = []
        for collab in collab_response.data:
            project = collab.get('projects')
            if project:
                owner = project.get('profiles', {})
                shared_projects.append({
                    "id": collab['id'],
                    "project_id": collab['project_id'],
                    "project_name": project['name'],
                    "owner_name": owner.get('full_name', 'Unknown'),
                    "role": collab['role'],
                    "shared_at": collab['created_at']
                })
        
        return shared_projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_collaborator(invite: CollaboratorCreate, current_user: User = Depends(get_current_user)):
    """Invite a collaborator to a project by email."""
    supabase = SupabaseManager.get_client()
    try:
        # 1. Verify current user is the owner of the project
        project_response = supabase.table('projects').select("owner_id").eq('id', invite.project_id).single().execute()
        if not project_response.data or project_response.data['owner_id'] != current_user.user_id:
            raise HTTPException(status_code=403, detail="Only project owners can invite collaborators")
        
        # 2. Find user by email
        user_response = supabase.table('profiles').select("id").eq('email', invite.email).single().execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found with this email")
        
        target_user_id = user_response.data['id']
        
        # 3. Add to collaborators table
        collab_data = {
            "project_id": invite.project_id,
            "user_id": target_user_id,
            "role": invite.role
        }
        supabase.table('collaborators').insert(collab_data).execute()
        
        # 4. Create notification for the target user
        notification_data = {
            "user_id": target_user_id,
            "title": "New Project Shared",
            "message": f"{current_user.full_name} shared the project with you.",
            "type": "share",
            "link": f"/studio/{invite.project_id}/workflow"
        }
        supabase.table('notifications').insert(notification_data).execute()
        
        # 5. Log history
        history_data = {
            "project_id": invite.project_id,
            "user_id": current_user.user_id,
            "action": "share",
            "entity_type": "project",
            "entity_id": invite.project_id,
            "metadata": {"collaborator_email": invite.email, "role": invite.role}
        }
        supabase.table('project_history').insert(history_data).execute()
        
        return {"status": "success", "message": "Collaborator invited successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{collab_id}")
async def remove_collaborator(collab_id: str, current_user: User = Depends(get_current_user)):
    """Remove a collaborator from a project."""
    supabase = SupabaseManager.get_client()
    try:
        # Get collaboration details to check ownership
        collab_response = supabase.table('collaborators').select("project_id").eq('id', collab_id).single().execute()
        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration record not found")
        
        project_id = collab_response.data['project_id']
        
        # Verify current user is the owner of the project
        project_response = supabase.table('projects').select("owner_id").eq('id', project_id).single().execute()
        if not project_response.data or project_response.data['owner_id'] != current_user.user_id:
            raise HTTPException(status_code=403, detail="Only project owners can remove collaborators")
        
        # Delete the record
        supabase.table('collaborators').delete().eq('id', collab_id).execute()
        
        return {"status": "success", "message": "Collaborator removed"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}/history")
async def get_project_history(project_id: str, current_user: User = Depends(get_current_user)):
    """Get history of actions for a specific project."""
    supabase = SupabaseManager.get_client()
    try:
        # RLS will handle permission check
        response = supabase.table('project_history').select("*, profiles(full_name)").eq('project_id', project_id).order('created_at', desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
