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
    
    Authentication is delegated to Supabase Auth (managed via @get_current_user dependency).
    This endpoint validates credentials against Supabase's user database.
    
    To authenticate:
    1. Sign up via Supabase Auth (frontend)
    2. Use returned JWT token in Authorization: Bearer <token> header
    3. Backend validates token with Supabase
    """
    # This endpoint is a legacy stub. Modern auth uses Supabase JWT tokens.
    # MOCK_USERS is intentionally empty - all auth goes through Supabase.
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Use Supabase Auth. Sign up on the frontend to obtain a JWT token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

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
