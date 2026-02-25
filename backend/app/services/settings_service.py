<<<<<<< HEAD
from app.db.supabase import SupabaseManager
from typing import Dict, List, Optional

class SettingsService:
    @staticmethod
    def get_user_secrets(user_id: str) -> Dict[str, str]:
        """
        Retrieves all secrets for a specific user as a dictionary of key-value pairs.
        The keys are formatted as TOOL_ID_SETTING_KEY (e.g., OPENAI_API_KEY).
        """
        supabase = SupabaseManager.get_client()
        try:
            response = supabase.table('tool_settings')\
                .select("tool_id, setting_key, setting_value")\
                .eq('user_id', user_id)\
                .execute()
            
            secrets = {}
            for item in response.data:
                # Create a standardized environment variable name
                env_name = f"{item['tool_id'].upper()}_{item['setting_key'].upper()}"
                secrets[env_name] = item['setting_value']
            
            return secrets
        except Exception as e:
            print(f"Error fetching secrets for user {user_id}: {e}")
            return {}

    @staticmethod
    def get_tool_setting(user_id: str, tool_id: str, key: str) -> Optional[str]:
        """
        Retrieves a specific tool setting for a user.
        """
        supabase = SupabaseManager.get_client()
        try:
            response = supabase.table('tool_settings')\
                .select("setting_value")\
                .eq('user_id', user_id)\
                .eq('tool_id', tool_id)\
                .eq('setting_key', key)\
                .single()\
                .execute()
            
            if response.data:
                return response.data['setting_value']
            return None
        except Exception:
            return None

settings_service = SettingsService()
=======
from app.db.supabase import SupabaseManager
from typing import Dict, List, Optional

class SettingsService:
    @staticmethod
    def get_user_secrets(user_id: str) -> Dict[str, str]:
        """
        Retrieves all secrets for a specific user as a dictionary of key-value pairs.
        The keys are formatted as TOOL_ID_SETTING_KEY (e.g., OPENAI_API_KEY).
        """
        supabase = SupabaseManager.get_client()
        try:
            response = supabase.table('tool_settings')\
                .select("tool_id, setting_key, setting_value")\
                .eq('user_id', user_id)\
                .execute()
            
            secrets = {}
            for item in response.data:
                # Create a standardized environment variable name
                env_name = f"{item['tool_id'].upper()}_{item['setting_key'].upper()}"
                secrets[env_name] = item['setting_value']
            
            return secrets
        except Exception as e:
            from app.core.logging import logger
            logger.error(f"Error fetching secrets for user {user_id}: {e}")
            return {}

    @staticmethod
    def get_tool_setting(user_id: str, tool_id: str, key: str) -> Optional[str]:
        """
        Retrieves a specific tool setting for a user.
        """
        supabase = SupabaseManager.get_client()
        try:
            response = supabase.table('tool_settings')\
                .select("setting_value")\
                .eq('user_id', user_id)\
                .eq('tool_id', tool_id)\
                .eq('setting_key', key)\
                .single()\
                .execute()
            
            if response.data:
                return response.data['setting_value']
            return None
        except Exception:
            return None

settings_service = SettingsService()
>>>>>>> 6ed0e1967af29b666b40c0ee002df73ca8b9888f
