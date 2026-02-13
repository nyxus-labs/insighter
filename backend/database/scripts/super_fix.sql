-- ============================================================================
-- SUPER_FIX.SQL
-- COMPREHENSIVE SCHEMA HARDENING AND RLS REFINEMENT
-- ============================================================================

-- 1. AUTH HELPERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN auth.uid();
END;
$$;

-- 2. SCHEMA ADJUSTMENTS
-- ----------------------------------------------------------------------------
-- Ensure projects table has correct owner_id type and constraints
DO $$ 
BEGIN
    -- Check if owner_id references public.profiles, if so, we might want to change it to auth.users for direct RLS
    -- but we'll stick to the current schema and just ensure RLS is robust.
END $$;

-- 3. RLS REFINEMENT (CLEANUP & REBUILD)
-- ----------------------------------------------------------------------------

-- Drop existing policies to ensure a clean state
DROP POLICY IF EXISTS "Users can view own projects." ON public.projects;
DROP POLICY IF EXISTS "Users can create projects." ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects; -- From fix_projects_rls.sql
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- PROJECTS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" 
ON public.projects FOR SELECT 
TO authenticated 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own projects" 
ON public.projects FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" 
ON public.projects FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" 
ON public.projects FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

-- TOOL SETTINGS
DROP POLICY IF EXISTS "Users can view own tool settings." ON public.tool_settings;
DROP POLICY IF EXISTS "Users can manage own tool settings." ON public.tool_settings;

ALTER TABLE public.tool_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tool settings" 
ON public.tool_settings FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DATASETS
DROP POLICY IF EXISTS "Users can view own datasets." ON public.datasets;
DROP POLICY IF EXISTS "Users can create datasets." ON public.datasets;

ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own datasets" 
ON public.datasets FOR ALL 
TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- NOTEBOOKS
DROP POLICY IF EXISTS "Users can view own notebooks." ON public.notebooks;
DROP POLICY IF EXISTS "Users can create notebooks." ON public.notebooks;

ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notebooks" 
ON public.notebooks FOR ALL 
TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- MODELS
DROP POLICY IF EXISTS "Users can view own models." ON public.models;
DROP POLICY IF EXISTS "Users can create models." ON public.models;

ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own models" 
ON public.models FOR ALL 
TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- 4. STORAGE BUCKETS (Ensuring they exist)
-- ----------------------------------------------------------------------------
-- Note: This usually requires service_role or admin rights in Supabase
-- but we include it for completeness if running via dashboard.

INSERT INTO storage.buckets (id, name, public)
SELECT 'datasets', 'datasets', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'datasets'
);

INSERT INTO storage.buckets (id, name, public)
SELECT 'models', 'models', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'models'
);

-- STORAGE RLS
CREATE POLICY "Authenticated users can upload datasets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own datasets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. TRIGGER FOR PROFILES
-- ----------------------------------------------------------------------------
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
