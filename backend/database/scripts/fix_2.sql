-- =============================================================================
-- FIX_2: Comprehensive Security (RLS) and Performance Hardening
-- This script addresses missing RLS policies, adds ownership tracking to 
-- experiments, and optimizes database performance via indexing.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Schema Hardening: Ownership Tracking
-- -----------------------------------------------------------------------------

-- Add created_by to experiments to enable direct RLS policies
ALTER TABLE public.experiments 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Migration: Backfill created_by from project owner for existing experiments
UPDATE public.experiments e
SET created_by = p.owner_id
FROM public.projects p
WHERE e.project_id = p.id AND e.created_by IS NULL;

-- -----------------------------------------------------------------------------
-- 2. Performance Optimization: Indexes
-- -----------------------------------------------------------------------------

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON public.projects(visibility);

-- Datasets
CREATE INDEX IF NOT EXISTS idx_datasets_project_id ON public.datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_by ON public.datasets(created_by);

-- Notebooks
CREATE INDEX IF NOT EXISTS idx_notebooks_project_id ON public.notebooks(project_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_created_by ON public.notebooks(created_by);

-- Models
CREATE INDEX IF NOT EXISTS idx_models_project_id ON public.models(project_id);
CREATE INDEX IF NOT EXISTS idx_models_created_by ON public.models(created_by);
CREATE INDEX IF NOT EXISTS idx_models_status ON public.models(status);

-- Experiments
CREATE INDEX IF NOT EXISTS idx_experiments_project_id ON public.experiments(project_id);
CREATE INDEX IF NOT EXISTS idx_experiments_created_by ON public.experiments(created_by);

-- Annotations
CREATE INDEX IF NOT EXISTS idx_annotations_dataset_id ON public.annotations(dataset_id);
CREATE INDEX IF NOT EXISTS idx_annotations_annotator_id ON public.annotations(annotator_id);

-- -----------------------------------------------------------------------------
-- 3. Security Hardening: Row-Level Security (RLS)
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

-- EXPERIMENTS POLICIES
DROP POLICY IF EXISTS "Users can view own experiments" ON public.experiments;
DROP POLICY IF EXISTS "Users can create experiments" ON public.experiments;

CREATE POLICY "Users can view own experiments" 
ON public.experiments FOR SELECT 
TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create experiments" 
ON public.experiments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own experiments" 
ON public.experiments FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own experiments" 
ON public.experiments FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);

-- ANNOTATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own annotations" ON public.annotations;
DROP POLICY IF EXISTS "Users can create annotations" ON public.annotations;

CREATE POLICY "Users can view own annotations" 
ON public.annotations FOR SELECT 
TO authenticated 
USING (auth.uid() = annotator_id);

CREATE POLICY "Users can create annotations" 
ON public.annotations FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = annotator_id);

CREATE POLICY "Users can update own annotations" 
ON public.annotations FOR UPDATE 
TO authenticated 
USING (auth.uid() = annotator_id);

CREATE POLICY "Users can delete own annotations" 
ON public.annotations FOR DELETE 
TO authenticated 
USING (auth.uid() = annotator_id);

COMMIT;

-- =============================================================================
-- Verification Script
-- =============================================================================
/*
-- 1. Check for RLS status on all public tables
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- 2. Verify existence of created_by in experiments
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'experiments' AND column_name = 'created_by';

-- 3. Verify newly created indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename IN ('experiments', 'annotations', 'projects', 'datasets', 'notebooks', 'models');
*/

-- =============================================================================
-- Rollback Plan
-- =============================================================================
/*
BEGIN;

-- 1. Drop Policies
DROP POLICY IF EXISTS "Users can view own experiments" ON public.experiments;
DROP POLICY IF EXISTS "Users can create experiments" ON public.experiments;
DROP POLICY IF EXISTS "Users can update own experiments" ON public.experiments;
DROP POLICY IF EXISTS "Users can delete own experiments" ON public.experiments;

DROP POLICY IF EXISTS "Users can view own annotations" ON public.annotations;
DROP POLICY IF EXISTS "Users can create annotations" ON public.annotations;
DROP POLICY IF EXISTS "Users can update own annotations" ON public.annotations;
DROP POLICY IF EXISTS "Users can delete own annotations" ON public.annotations;

-- 2. Drop Indexes
DROP INDEX IF EXISTS idx_projects_owner_id;
DROP INDEX IF EXISTS idx_projects_visibility;
DROP INDEX IF EXISTS idx_datasets_project_id;
DROP INDEX IF EXISTS idx_datasets_created_by;
DROP INDEX IF EXISTS idx_notebooks_project_id;
DROP INDEX IF EXISTS idx_notebooks_created_by;
DROP INDEX IF EXISTS idx_models_project_id;
DROP INDEX IF EXISTS idx_models_created_by;
DROP INDEX IF EXISTS idx_models_status;
DROP INDEX IF EXISTS idx_experiments_project_id;
DROP INDEX IF EXISTS idx_experiments_created_by;
DROP INDEX IF EXISTS idx_annotations_dataset_id;
DROP INDEX IF EXISTS idx_annotations_annotator_id;

-- 3. Remove Schema Changes
-- WARNING: This will remove ownership tracking for experiments
ALTER TABLE public.experiments DROP COLUMN IF EXISTS created_by;

-- 4. Disable RLS if it was previously disabled (optional)
-- ALTER TABLE public.experiments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.annotations DISABLE ROW LEVEL SECURITY;

COMMIT;
*/
