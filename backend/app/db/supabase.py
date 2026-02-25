from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger("insighter")

class SupabaseManager:
    _client: Client = None
    _service_client: Client = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._client is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                # Return a mock or raise warning if credentials missing in dev
                logger.warning("Supabase credentials missing. Some features may not work.")
                return None
            cls._client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        return cls._client

    @classmethod
    def get_service_client(cls) -> Client:
        if cls._service_client is None:
            # Prefer SERVICE_ROLE_KEY for administrative tasks
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
            if not settings.SUPABASE_URL or not key:
                logger.warning("Supabase service credentials missing.")
                return None
            cls._service_client = create_client(settings.SUPABASE_URL, key)
        return cls._service_client

    @classmethod
    def get_authenticated_client(cls, token: str) -> Client:
        """Get a client authenticated with a user's JWT."""
        # We create a new client instance because the auth state is attached to the client
        # and we don't want to share auth state between requests in a multi-threaded environment.
        # However, we use the service role key as the base so that we have full power
        # if needed, but the JWT will restrict it according to RLS.
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        
        if not url or not key:
            return None
            
        client = create_client(url, key)
        client.postgrest.auth(token)
        return client

supabase = SupabaseManager.get_client()
