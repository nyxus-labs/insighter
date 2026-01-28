from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from app.core.security import (
    UserLogin, Token, User, get_password_hash, verify_password, 
    create_access_token, get_current_user
)
from app.core.config import settings

router = APIRouter()

# Mock user database - in production, use real database
MOCK_USERS = {}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return current_user

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """
    Login endpoint - authenticate user and return JWT token.
    
    **IMPORTANT**: Default credentials are for demo/testing only.
    - demo / demo123
    - admin / admin123
    
    Change immediately in production!
    """
    user = MOCK_USERS.get(credentials.username)
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=Token)
async def register(credentials: UserLogin):
    """
    Register a new user - disabled by default for security.
    Implement with proper validation and rate limiting.
    """
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Registration is disabled. Contact administrator."
    )
