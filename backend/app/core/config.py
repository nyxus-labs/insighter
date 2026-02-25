import os
import secrets
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, field_validator, ValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load environment variables with priority: .env.local > .env
# load_dotenv with override=True ensures that the first file loaded doesn't block the second
# but we want the opposite: .env.local to override .env.
# So we load .env first, then .env.local with override=True.
load_dotenv(".env")
load_dotenv(".env.local", override=True)

class Settings(BaseSettings):
    # Base configuration
    PROJECT_NAME: str = "The Insighter Enterprise"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Supabase Configuration
    # We allow these to be empty in development but will warn/error if needed
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    
    # Security
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Database
    DATABASE_URL: str = ""
    
    # Storage (S3 Compatible)
    STORAGE_TYPE: str = "supabase"
    STORAGE_BUCKET: str = "insighter-datasets"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-southeast-1"
    AWS_ENDPOINT_URL: str = ""

    # Third-Party
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"

    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    def __init__(self, **data):
        super().__init__(**data)
        self._validate_required_vars()

    def _validate_required_vars(self):
        """Custom validation for required variables with helpful error messages."""
        import logging
        logger = logging.getLogger("insighter")
        missing = []
        
        # Check critical Supabase vars
        if not self.SUPABASE_URL: missing.append("SUPABASE_URL")
        if not self.SUPABASE_KEY: missing.append("SUPABASE_KEY")
        
        if missing:
            error_msg = f"\n❌ CONFIGURATION ERROR: Missing required environment variables: {', '.join(missing)}"
            error_msg += "\nPlease ensure they are defined in .env or .env.local"
            if self.ENVIRONMENT == "production":
                raise ValueError(error_msg)
            else:
                logger.warning(error_msg)

        # Validate SECRET_KEY
        if not self.SECRET_KEY:
            if self.ENVIRONMENT == "production":
                raise ValueError("SECRET_KEY is required in production!")
            self.SECRET_KEY = secrets.token_urlsafe(32)
            logger.warning("Using auto-generated SECRET_KEY for development.")
        
        if len(self.SECRET_KEY) < 32:
            logger.warning("SECRET_KEY should be at least 32 characters for security.")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

settings = Settings()
# Trigger reload
