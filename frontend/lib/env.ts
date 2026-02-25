import { z } from 'zod';

/**
 * Environment variable schema for The Insighter Enterprise.
 * This ensures that the application has all required settings before starting.
 * 
 * NEXT_PUBLIC_ variables are available in the browser.
 */
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:8000'),
  
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1, "Supabase URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase Anon Key is required"),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),
  
  // App Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Validate process.env against the schema
const result = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NODE_ENV: process.env.NODE_ENV,
});

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
  
  // Only throw in production or if critical vars are missing
  const criticalMissing = result.error.issues.some(issue => 
    issue.path.includes('NEXT_PUBLIC_SUPABASE_URL') || 
    issue.path.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  );

  if (process.env.NODE_ENV === 'production' || criticalMissing) {
    throw new Error('Invalid environment variables. Check the console for details.');
  }
}

export const env = result.success ? result.data : envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder',
});
