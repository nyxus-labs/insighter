import { env } from './env';

const config = {
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
  },
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  features: {
    enableAnalytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  },
  isProduction: env.NODE_ENV === 'production',
};

export default config;
