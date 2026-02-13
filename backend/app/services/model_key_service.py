import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Tuple, List
from pydantic import BaseModel
from app.db.supabase import SupabaseManager
from app.core.config import settings

class APIKeyCreate(BaseModel):
    model_id: str
    name: Optional[str] = "Default Key"
    expires_in_days: Optional[int] = 365
    scopes: List[str] = ["model:predict"]

class APIKeyResponse(BaseModel):
    id: str
    key: str # Only returned once upon creation
    name: str
    scopes: List[str]
    created_at: str
    expires_at: Optional[str]

class ModelKeyService:
    @staticmethod
    def generate_key_pair() -> Tuple[str, str]:
        """
        Generates a secure API key and its hash.
        Key format: ins_model_<32_random_chars>
        """
        raw_key = f"ins_model_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        return raw_key, key_hash

    @staticmethod
    async def create_key(user_id: str, config: APIKeyCreate) -> APIKeyResponse:
        supabase = SupabaseManager.get_client()
        raw_key, key_hash = ModelKeyService.generate_key_pair()
        
        expires_at = None
        if config.expires_in_days:
            expires_at = (datetime.utcnow() + timedelta(days=config.expires_in_days)).isoformat()

        data = {
            "model_id": config.model_id,
            "user_id": user_id,
            "key_hash": key_hash,
            "key_prefix": raw_key[:12], # 'ins_model_' + first few chars
            "name": config.name,
            "scopes": config.scopes,
            "expires_at": expires_at,
            "is_active": True
        }

        response = supabase.table('model_api_keys').insert(data).execute()
        if not response.data:
            raise Exception("Failed to create API key in database")

        new_key = response.data[0]
        return APIKeyResponse(
            id=new_key['id'],
            key=raw_key,
            name=new_key['name'],
            scopes=new_key['scopes'],
            created_at=new_key['created_at'],
            expires_at=new_key['expires_at']
        )

    @staticmethod
    async def validate_key(raw_key: str) -> Tuple[bool, Optional[dict]]:
        """
        Validates an API key against the database.
        Returns (is_valid, metadata)
        """
        if not raw_key.startswith("ins_model_"):
            return False, None

        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        key_prefix = raw_key[:12]

        supabase = SupabaseManager.get_client()
        response = supabase.table('model_api_keys')\
            .select("*, models(name)")\
            .eq('key_prefix', key_prefix)\
            .eq('key_hash', key_hash)\
            .eq('is_active', True)\
            .execute()

        if not response.data:
            return False, None

        key_data = response.data[0]
        
        # Check expiration
        if key_data['expires_at']:
            expires_at = datetime.fromisoformat(key_data['expires_at'].replace('Z', '+00:00'))
            if expires_at < datetime.now(expires_at.timezone):
                return False, None

        # Update last used
        supabase.table('model_api_keys')\
            .update({"last_used_at": datetime.utcnow().isoformat()})\
            .eq('id', key_data['id'])\
            .execute()

        return True, key_data

model_key_service = ModelKeyService()
