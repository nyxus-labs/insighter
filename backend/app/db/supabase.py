from supabase import create_client, Client
from app.core.config import settings

class SupabaseManager:
    _client: Client = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._client is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                # Return a mock or raise warning if credentials missing in dev
                print("Warning: Supabase credentials missing. Some features may not work.")
                return None
            cls._client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        return cls._client

supabase = SupabaseManager.get_client()
