import os
import secrets
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "The Insighter Enterprise"
    API_V1_STR: str = "/api/v1"
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    
    # Security - Require strong SECRET_KEY in production
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database
    DATABASE_URL: str = ""

    def __init__(self, **data):
        super().__init__(**data)
        # Validate SECRET_KEY in production
        if not self.SECRET_KEY:
            import sys
            if os.getenv("ENVIRONMENT", "development") == "production":
                raise ValueError("SECRET_KEY environment variable is required in production")
            # Generate a temporary key for development only
            self.SECRET_KEY = secrets.token_urlsafe(32)
            print("⚠️  WARNING: Using auto-generated SECRET_KEY for development. Set SECRET_KEY env var for production.")
        
        if len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
# Trigger reload
