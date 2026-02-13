from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.services.model_key_service import model_key_service
import logging

logger = logging.getLogger("insighter")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer scheme
security = HTTPBearer()

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    user_id: str
    username: str
    role: str
    email: Optional[str] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Dependency to extract and verify JWT token or Model API Key from request."""
    token = credentials.credentials
    
    # 1. Check if it's an Insighter Model API Key
    if token.startswith("ins_model_"):
        is_valid, key_data = await model_key_service.validate_key(token)
        if is_valid and key_data:
            # Return a special service user for API key access
            return User(
                user_id=key_data['user_id'],
                username=f"api_key_{key_data['key_prefix']}",
                role="api_client",
                email=None
            )

    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Try local validation if SECRET_KEY matches Supabase JWT Secret
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET, 
                algorithms=[settings.ALGORITHM],
                audience="authenticated"
            )
            user_id = payload.get("sub")
            email = payload.get("email")
            role = payload.get("role", "authenticated")
            
            if user_id:
                return User(
                    user_id=user_id,
                    username=email.split('@')[0] if email else user_id,
                    role=role,
                    email=email
                )
        except JWTError as jwt_err:
            logger.debug(f"Local JWT validation failed: {jwt_err}")
            # Fall through to Supabase API check
    
    from app.db.supabase import SupabaseManager
    supabase = SupabaseManager.get_client()
    
    if not supabase:
        logger.error("Supabase client not initialized")
        raise credential_exception

    try:
        # Verify token with Supabase Auth
        # Note: supabase-py 2.x get_user(token) works
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
             raise credential_exception
        
        user = user_response.user
        
        # Extract user info
        user_id = user.id
        email = user.email
        # Role is often in user.role or app_metadata
        role = user.role if hasattr(user, 'role') else 'user'
        
        # Map to our User model
        return User(
            user_id=user_id, 
            username=email.split('@')[0] if email else user_id, # Fallback username
            role=role,
            email=email
        )
            
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise credential_exception

def require_role(required_role: str):
    """Dependency to check user role."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role}"
            )
        return current_user
    return role_checker
