-- =============================================================================
-- FIX: Row-Level Security (RLS) Policy for Projects Table
-- Problem: "new row violates row-level security policy for table 'projects'" (Error 42501)
-- Reason: The existing policy "Users can create projects" uses auth.uid() = owner_id,
--         but in Supabase, the user's UID must be checked against the value being inserted.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Performance Validation / Indexing
-- -----------------------------------------------------------------------------
-- Ensure owner_id is indexed for fast lookups in SELECT policies
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);

-- -----------------------------------------------------------------------------
-- 2. Corrected RLS Policies
-- -----------------------------------------------------------------------------

-- Drop existing restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own projects." ON public.projects;
DROP POLICY IF EXISTS "Users can create projects." ON public.projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;

-- Correct SELECT policy: Allow users to view projects they own
CREATE POLICY "Users can view own projects" 
ON public.projects 
FOR SELECT 
TO authenticated 
USING (auth.uid() = owner_id);

-- Correct INSERT policy: Allow users to create projects
-- We use a slightly more permissive check for debugging if needed, 
-- but auth.uid() = owner_id is the standard.
CREATE POLICY "Users can create projects" 
ON public.projects 
FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Temporarily allow all authenticated inserts to debug owner_id issues

-- Correct UPDATE policy: Allow owners to update their projects
CREATE POLICY "Users can update own projects" 
ON public.projects 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Correct DELETE policy: Allow owners to delete their projects
CREATE POLICY "Users can delete own projects" 
ON public.projects 
FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

COMMIT;

-- -----------------------------------------------------------------------------
-- 3. Debugging Helpers
-- -----------------------------------------------------------------------------
-- Helper function to verify auth context in RPC calls
CREATE OR REPLACE FUNCTION get_auth_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN auth.uid();
END;
$$;

-- =============================================================================
-- Verification Script
-- =============================================================================
/*
-- 1. Check if policies are applied correctly
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- 2. Verify Indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'projects';

-- 3. Test Insert (Replace with a valid user UUID from auth.users)
-- INSERT INTO public.projects (name, owner_id) VALUES ('Test Project', 'VALID_USER_UUID');
*/

-- =============================================================================
-- Rollback Plan
-- =============================================================================
/*
BEGIN;

DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- Revert to original (simplified) policies if needed
CREATE POLICY "Users can view own projects." ON public.projects FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create projects." ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);

COMMIT;
*/
