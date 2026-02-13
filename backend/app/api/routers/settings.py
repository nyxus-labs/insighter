from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.core.security import User, get_current_user
from app.db.supabase import SupabaseManager
import datetime

router = APIRouter()

class SettingUpdate(BaseModel):
    tool_id: str
    key: str
    value: str
    is_secret: bool = True

class SettingResponse(BaseModel):
    tool_id: str
    key: str
    value: str # Masked if secret
    is_secret: bool
    updated_at: str

@router.get("/secrets", response_model=List[SettingResponse])
async def get_secrets(current_user: User = Depends(get_current_user)):
    supabase = SupabaseManager.get_client()
    try:
        response = supabase.table('tool_settings')\
            .select("*")\
            .eq('user_id', current_user.user_id)\
            .execute()
        
        settings = []
        for item in response.data:
            val = item['setting_value']
            if item['is_secret'] and val:
                val = "********" # Mask secret values in list
            
            settings.append({
                "tool_id": item['tool_id'],
                "key": item['setting_key'],
                "value": val,
                "is_secret": item['is_secret'],
                "updated_at": item['updated_at']
            })
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/secrets")
async def update_secret(setting: SettingUpdate, current_user: User = Depends(get_current_user)):
    supabase = SupabaseManager.get_client()
    try:
        # Upsert logic
        data = {
            "user_id": current_user.user_id,
            "tool_id": setting.tool_id,
            "setting_key": setting.key,
            "setting_value": setting.value,
            "is_secret": setting.is_secret,
            "updated_at": datetime.datetime.now().isoformat()
        }
        
        # Check if exists
        existing = supabase.table('tool_settings')\
            .select("id")\
            .eq('user_id', current_user.user_id)\
            .eq('tool_id', setting.tool_id)\
            .eq('setting_key', setting.key)\
            .execute()
            
        if existing.data:
            response = supabase.table('tool_settings')\
                .update(data)\
                .eq('id', existing.data[0]['id'])\
                .execute()
        else:
            response = supabase.table('tool_settings')\
                .insert(data)\
                .execute()
                
        return {"status": "success", "message": f"Setting {setting.key} for {setting.tool_id} updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/secrets/{tool_id}/{key}")
async def delete_secret(tool_id: str, key: str, current_user: User = Depends(get_current_user)):
    supabase = SupabaseManager.get_client()
    try:
        supabase.table('tool_settings')\
            .delete()\
            .eq('user_id', current_user.user_id)\
            .eq('tool_id', tool_id)\
            .eq('setting_key', key)\
            .execute()
        return {"status": "success", "message": f"Setting {key} for {tool_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
