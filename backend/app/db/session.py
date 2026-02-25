from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from app.core.config import settings

# Primary: Use Supabase PostgreSQL if available (production)
# Fallback: Use local SQLite for development/testing without Supabase
if settings.DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
else:
    # Local development with SQLite - Supabase client in supabase.py is the primary DB
    SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL connection pooling for production
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
