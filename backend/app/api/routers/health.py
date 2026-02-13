from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any, List
import os
import httpx
import time
from app.db.supabase import SupabaseManager
from app.core.config import settings

router = APIRouter()

class HealthStatus(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, Any]
    environment_audit: Dict[str, bool]

@router.get("/health/supabase", response_model=HealthStatus)
async def check_supabase_health():
    """
    Comprehensive health check for Supabase services and environment configuration.
    """
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    
    services_status = {
        "auth": {"status": "unknown"},
        "rest": {"status": "unknown"},
        "storage": {"status": "unknown"},
        "database": {"status": "unknown"}
    }
    
    audit = {
        "SUPABASE_URL": bool(url),
        "SUPABASE_KEY": bool(key),
        "SUPABASE_SERVICE_ROLE_KEY": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY")),
        "DATABASE_URL": bool(os.getenv("DATABASE_URL")),
        "AWS_S3_CONFIG": all([
            os.getenv("AWS_ACCESS_KEY_ID"),
            os.getenv("AWS_SECRET_ACCESS_KEY"),
            os.getenv("AWS_ENDPOINT_URL")
        ])
    }

    if not url or not key:
        return HealthStatus(
            status="unconfigured",
            timestamp=str(time.time()),
            services=services_status,
            environment_audit=audit
        )

    async with httpx.AsyncClient() as client:
        # Check Auth
        try:
            resp = await client.get(f"{url}/auth/v1/health", headers={"apikey": key})
            services_status["auth"] = {"status": "healthy" if resp.status_code == 200 else "unhealthy", "code": resp.status_code}
        except Exception as e:
            services_status["auth"] = {"status": "error", "error": str(e)}

        # Check REST (PostgREST)
        try:
            resp = await client.get(f"{url}/rest/v1/", headers={"apikey": key})
            services_status["rest"] = {"status": "healthy" if resp.status_code == 200 else "unhealthy", "code": resp.status_code}
        except Exception as e:
            services_status["rest"] = {"status": "error", "error": str(e)}

        # Check Storage
        try:
            resp = await client.get(f"{url}/storage/v1/health", headers={"apikey": key})
            services_status["storage"] = {"status": "healthy" if resp.status_code == 200 else "unhealthy", "code": resp.status_code}
        except Exception as e:
            services_status["storage"] = {"status": "error", "error": str(e)}

    # Check Database Connection via Supabase Client
    try:
        supabase = SupabaseManager.get_client()
        if supabase:
            # Try a simple query
            # Note: This might fail if RLS is on and no auth header, but 401/403 still means DB is alive
            db_resp = supabase.table('projects').select("id").limit(1).execute()
            services_status["database"] = {"status": "healthy"}
        else:
            services_status["database"] = {"status": "uninitialized"}
    except Exception as e:
        # If it's just a permission error, the DB is up
        if "401" in str(e) or "403" in str(e) or "PGRST301" in str(e):
            services_status["database"] = {"status": "healthy (restricted)"}
        else:
            services_status["database"] = {"status": "error", "error": str(e)}

    overall_status = "healthy" if all(s["status"] in ["healthy", "healthy (restricted)"] for s in services_status.values()) else "degraded"

    return HealthStatus(
        status=overall_status,
        timestamp=str(time.time()),
        services=services_status,
        environment_audit=audit
    )
