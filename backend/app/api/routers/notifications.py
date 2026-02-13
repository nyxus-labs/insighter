from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.core.security import User, get_current_user
from app.db.supabase import SupabaseManager

router = APIRouter()

class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    read: bool
    link: Optional[str] = None
    created_at: str

@router.get("/", response_model=List[Notification])
async def list_notifications(unread_only: bool = False, current_user: User = Depends(get_current_user)):
    """List notifications for the current user."""
    supabase = SupabaseManager.get_client()
    try:
        query = supabase.table('notifications').select("*").eq('user_id', current_user.user_id)
        if unread_only:
            query = query.eq('read', False)
        
        response = query.order('created_at', desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: User = Depends(get_current_user)):
    """Mark notification as read."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('notifications').update({"read": True}).eq('id', notification_id).eq('user_id', current_user.user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/read-all")
async def mark_all_as_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read."""
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('notifications').update({"read": True}).eq('user_id', current_user.user_id).execute()
        return {"status": "success", "count": len(response.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
