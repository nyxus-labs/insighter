-- Fix profiles table role constraint to include all workspace roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'data_scientist', 'data_analyst', 'ai_ml_engineer', 'data_engineer', 'labeling_specialist'));

-- Update existing profiles to use underscores if they have hyphens (unlikely but good for consistency)
UPDATE public.profiles SET role = REPLACE(role, '-', '_') WHERE role LIKE '%-%';
