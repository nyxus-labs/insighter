import os
import sys
import httpx
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path for imports
sys.path.append(os.path.join(os.getcwd(), "backend"))

async def test_supabase_connection():
    print("--- Supabase Connection Audit ---")
    
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url:
        print("❌ FAILED: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL is missing")
    else:
        print(f"✅ FOUND: SUPABASE_URL: {url}")

    if not key:
        print("❌ FAILED: SUPABASE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY is missing")
    else:
        print("✅ FOUND: SUPABASE_ANON_KEY")

    if not service_key:
        print("⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY is missing (Required for some backend operations)")
    else:
        print("✅ FOUND: SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        return

    print("\n--- Testing API Connectivity ---")
    async with httpx.AsyncClient() as client:
        try:
            # Test Auth API
            auth_resp = await client.get(f"{url}/auth/v1/health", headers={"apikey": key})
            if auth_resp.status_code == 200:
                print("✅ Auth API: Healthy")
            else:
                print(f"❌ Auth API: Error {auth_resp.status_code}")

            # Test Rest API (PostgREST)
            rest_resp = await client.get(f"{url}/rest/v1/", headers={"apikey": key})
            if rest_resp.status_code == 200:
                print("✅ Rest API (PostgREST): Healthy")
            else:
                print(f"❌ Rest API: Error {rest_resp.status_code}")

            # Test Storage API
            storage_resp = await client.get(f"{url}/storage/v1/health", headers={"apikey": key})
            if storage_resp.status_code == 200:
                print("✅ Storage API: Healthy")
            else:
                print(f"❌ Storage API: Error {storage_resp.status_code}")

        except Exception as e:
            print(f"❌ Connectivity Test Failed: {e}")

async def test_database_url():
    print("\n--- Database URL Audit ---")
    db_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
    if not db_url:
        print("⚠️  WARNING: DATABASE_URL is missing (Required for direct Postgres connections)")
    else:
        print(f"✅ FOUND: DATABASE_URL (Format: {db_url.split('@')[0].split(':')[0]}...)")

async def test_storage_s3():
    print("\n--- Storage S3 Audit ---")
    s3_key = os.getenv("AWS_ACCESS_KEY_ID")
    s3_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    s3_endpoint = os.getenv("AWS_ENDPOINT_URL")
    
    if s3_key and s3_secret and s3_endpoint:
        print("✅ FOUND: S3 Compatibility Credentials")
    else:
        print("⚠️  WARNING: S3 Compatibility Credentials missing (Required for MLflow/Dataset tools)")

if __name__ == "__main__":
    asyncio.run(test_supabase_connection())
    asyncio.run(test_database_url())
    asyncio.run(test_storage_s3())
