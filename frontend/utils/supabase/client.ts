import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import config from '@/lib/config';

let client: SupabaseClient | null = null;

export function createClient() {
  if (client) return client;

  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Supabase configuration is missing. Check your environment variables.');
  }

  client = createBrowserClient(
    config.supabase.url,
    config.supabase.anonKey
  );
  
  return client;
}
