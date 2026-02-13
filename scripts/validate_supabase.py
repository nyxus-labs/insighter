import os
import sys
import httpx
import asyncio
from dotenv import load_dotenv
from typing import Dict, List, Any

# Load environment variables with priority: .env.local > .env
import os

def load_env_with_priority():
    # 1. Load from root .env
    root_env = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(root_env):
        load_dotenv(root_env)
        
    # 2. Load from root .env.local (overriding .env)
    root_env_local = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    if os.path.exists(root_env_local):
        load_dotenv(root_env_local, override=True)
        
    # 3. Load from current working directory (e.g. if run from backend/)
    cwd_env = os.path.join(os.getcwd(), '.env')
    if os.path.exists(cwd_env):
        load_dotenv(cwd_env, override=True)
        
    cwd_env_local = os.path.join(os.getcwd(), '.env.local')
    if os.path.exists(cwd_env_local):
        load_dotenv(cwd_env_local, override=True)

load_env_with_priority()

class SupabaseValidator:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.anon_key = os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self.service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.db_url = os.getenv("DATABASE_URL")
        self.jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        
        # S3 Compatibility
        self.s3_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.s3_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.s3_endpoint = os.getenv("AWS_ENDPOINT_URL")

    async def validate_all(self):
        print("🚀 Starting Supabase Integration Audit & Validation\n")
        
        results = []
        results.append(await self.check_env_vars())
        results.append(await self.test_connectivity())
        results.append(await self.test_auth_service())
        results.append(await self.test_database_access())
        results.append(await self.test_storage_service())
        
        print("\n" + "="*50)
        print("FINAL AUDIT SUMMARY")
        print("="*50)
        for res in results:
            print(res)
        print("="*50)

    async def check_env_vars(self) -> str:
        print("📋 Step 1: Environment Variable Inventory Check")
        missing = []
        if not self.url: missing.append("SUPABASE_URL")
        if not self.anon_key: missing.append("SUPABASE_ANON_KEY")
        if not self.service_key: missing.append("SUPABASE_SERVICE_ROLE_KEY (Optional but recommended for backend)")
        if not self.db_url: missing.append("DATABASE_URL (Required for direct SQL)")
        
        if missing:
            return f"❌ Env Vars: Missing {', '.join(missing)}"
        return "✅ Env Vars: All primary variables present"

    async def test_connectivity(self) -> str:
        print("\n🌐 Step 2: API Connectivity Test")
        if not self.url or not self.anon_key:
            return "⏭️  Connectivity: Skipped (Missing URL/Key)"
            
        async with httpx.AsyncClient() as client:
            try:
                # Test basic endpoint
                resp = await client.get(f"{self.url}/rest/v1/", headers={"apikey": self.anon_key})
                if resp.status_code == 200:
                    return "✅ Connectivity: Supabase API is reachable"
                return f"❌ Connectivity: API returned {resp.status_code}"
            except Exception as e:
                return f"❌ Connectivity: Error {str(e)}"

    async def test_auth_service(self) -> str:
        print("\n🔐 Step 3: Auth Service Health Check")
        if not self.url: return "⏭️  Auth: Skipped"
        
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{self.url}/auth/v1/health")
                if resp.status_code == 200:
                    return "✅ Auth Service: Healthy"
                return f"❌ Auth Service: Degraded ({resp.status_code})"
            except Exception as e:
                return f"❌ Auth Service: Error {str(e)}"

    async def test_database_access(self) -> str:
        print("\n📊 Step 4: Database/PostgREST Access Test")
        if not self.url or not self.anon_key: return "⏭️  Database: Skipped"
        
        async with httpx.AsyncClient() as client:
            try:
                # Attempt to read from a public or semi-public table if possible, 
                # or just check schema info
                resp = await client.get(
                    f"{self.url}/rest/v1/projects?select=id", 
                    headers={"apikey": self.anon_key, "Authorization": f"Bearer {self.anon_key}"}
                )
                if resp.status_code in [200, 401, 403]: # 401/403 means RLS is working, which is good
                    status = "Healthy" if resp.status_code == 200 else "Healthy (RLS Active)"
                    return f"✅ Database: {status}"
                return f"❌ Database: Unexpected response {resp.status_code}"
            except Exception as e:
                return f"❌ Database: Error {str(e)}"

    async def test_storage_service(self) -> str:
        print("\n📦 Step 5: Storage Service Health Check")
        if not self.url: return "⏭️  Storage: Skipped"
        
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{self.url}/storage/v1/health")
                if resp.status_code == 200:
                    return "✅ Storage Service: Healthy"
                return f"❌ Storage Service: Degraded ({resp.status_code})"
            except Exception as e:
                return f"❌ Storage Service: Error {str(e)}"

if __name__ == "__main__":
    validator = SupabaseValidator()
    asyncio.run(validator.validate_all())
