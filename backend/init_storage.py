import os
import sys
from supabase import create_client, Client

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def init_storage():
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    
    if not url or not key:
        print("Error: SUPABASE_URL or SUPABASE_KEY not found in settings.")
        return

    print(f"Connecting to Supabase at {url}...")
    supabase: Client = create_client(url, key)

    bucket_name = "avatars"
    
    try:
        # Try to get the bucket to see if it exists
        print(f"Checking for bucket '{bucket_name}'...")
        buckets = supabase.storage.list_buckets()
        existing_bucket = next((b for b in buckets if b.name == bucket_name), None)
        
        if existing_bucket:
            print(f"Bucket '{bucket_name}' already exists.")
        else:
            print(f"Creating bucket '{bucket_name}'...")
            supabase.storage.create_bucket(bucket_name, options={"public": True})
            print(f"Bucket '{bucket_name}' created successfully.")
            
    except Exception as e:
        print(f"Error initializing storage: {e}")
        print("\nIf this fails with a permission error, please run the SQL script located at backend/app/db/init_storage.sql in your Supabase SQL Editor.")

if __name__ == "__main__":
    init_storage()
