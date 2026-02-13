-- =============================================================================
-- Database Update Script: Datasets Table Enhancement for Arbitrary Data Types
-- Description: Modifies the 'datasets' table to support storing data directly 
--              in the database (text, numeric, json, binary, etc.) in addition 
--              to the existing file-based storage.
-- Date: 2026-01-27
-- Author: Trae AI
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Schema Modifications
-- -----------------------------------------------------------------------------

-- Step 1.1: Make file_path nullable to allow non-file datasets
-- Explanation: Originally, all datasets were files. Now, a dataset can be a direct value.
ALTER TABLE public.datasets 
ALTER COLUMN file_path DROP NOT NULL;

-- Step 1.2: Add storage metadata columns
-- storage_mode: Defines if the dataset is a reference to a file ('file') or stored directly ('value')
-- value_type: Defines the data type of the stored value (text, numeric, json, etc.)
ALTER TABLE public.datasets 
ADD COLUMN IF NOT EXISTS storage_mode TEXT DEFAULT 'file' CHECK (storage_mode IN ('file', 'value')),
ADD COLUMN IF NOT EXISTS value_type TEXT CHECK (value_type IN ('text', 'numeric', 'boolean', 'date', 'json', 'binary'));

-- Step 1.3: Add generic data storage columns (Polymorphic Pattern)
-- We use separate columns for each primitive type to ensure proper SQL typing and indexing.
ALTER TABLE public.datasets 
ADD COLUMN IF NOT EXISTS value_text TEXT,
ADD COLUMN IF NOT EXISTS value_numeric NUMERIC,
ADD COLUMN IF NOT EXISTS value_boolean BOOLEAN,
ADD COLUMN IF NOT EXISTS value_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS value_json JSONB,
ADD COLUMN IF NOT EXISTS value_binary BYTEA;

-- -----------------------------------------------------------------------------
-- 2. Indexes and Performance Optimization
-- -----------------------------------------------------------------------------

-- Index for searching datasets by storage mode and type
CREATE INDEX IF NOT EXISTS idx_datasets_storage_type ON public.datasets(storage_mode, value_type);

-- GIN Index for JSONB data querying (allows efficient searching within JSON structure)
CREATE INDEX IF NOT EXISTS idx_datasets_value_json ON public.datasets USING gin (value_json);

-- Index for date-based range queries
CREATE INDEX IF NOT EXISTS idx_datasets_value_date ON public.datasets(value_date);

-- -----------------------------------------------------------------------------
-- 3. Data Integrity and Validation (Constraints)
-- -----------------------------------------------------------------------------

-- Constraint: Ensure file_path is present if storage_mode is 'file'
ALTER TABLE public.datasets 
ADD CONSTRAINT check_file_storage_requires_path 
CHECK (
    (storage_mode = 'file' AND file_path IS NOT NULL) OR 
    (storage_mode = 'value')
);

-- Constraint: Ensure value_type is present if storage_mode is 'value'
ALTER TABLE public.datasets 
ADD CONSTRAINT check_value_storage_requires_type 
CHECK (
    (storage_mode = 'value' AND value_type IS NOT NULL) OR 
    (storage_mode = 'file')
);

-- Note: We intentionally avoid strict constraints like "if value_type='text' then value_text NOT NULL"
-- to allow for nullable/empty values if desired, and to simplify flexibility. 
-- However, application logic should ensure the correct column is populated.

-- -----------------------------------------------------------------------------
-- 4. Test Data Insertion
-- -----------------------------------------------------------------------------

-- Test 1: Insert a Text Value (Configuration Snippet)
INSERT INTO public.datasets (
    project_id, name, description, storage_mode, value_type, value_text, created_by
) VALUES (
    (SELECT id FROM public.projects LIMIT 1), -- Use existing project
    'Global Config', 
    'System configuration in text format', 
    'value', 
    'text', 
    'param1=value1;param2=value2',
    (SELECT id FROM public.profiles LIMIT 1) -- Use existing user
);

-- Test 2: Insert a Numeric Value (Threshold)
INSERT INTO public.datasets (
    project_id, name, description, storage_mode, value_type, value_numeric, created_by
) VALUES (
    (SELECT id FROM public.projects LIMIT 1),
    'Risk Threshold', 
    'Global risk threshold value', 
    'value', 
    'numeric', 
    0.85,
    (SELECT id FROM public.profiles LIMIT 1)
);

-- Test 3: Insert a JSON Value (Metadata)
INSERT INTO public.datasets (
    project_id, name, description, storage_mode, value_type, value_json, created_by
) VALUES (
    (SELECT id FROM public.projects LIMIT 1),
    'Model Hyperparameters', 
    'Best parameters from last run', 
    'value', 
    'json', 
    '{"learning_rate": 0.01, "layers": [64, 32, 16], "active": true}'::jsonb,
    (SELECT id FROM public.profiles LIMIT 1)
);

COMMIT;

-- =============================================================================
-- Rollback Plan
-- =============================================================================
/*
To rollback these changes, execute the following SQL:

BEGIN;

-- 1. Remove Test Data (Optional, or by ID if tracked)
DELETE FROM public.datasets WHERE name IN ('Global Config', 'Risk Threshold', 'Model Hyperparameters');

-- 2. Drop Constraints
ALTER TABLE public.datasets DROP CONSTRAINT IF EXISTS check_file_storage_requires_path;
ALTER TABLE public.datasets DROP CONSTRAINT IF EXISTS check_value_storage_requires_type;

-- 3. Drop Indexes
DROP INDEX IF EXISTS idx_datasets_storage_type;
DROP INDEX IF EXISTS idx_datasets_value_json;
DROP INDEX IF EXISTS idx_datasets_value_date;

-- 4. Drop Columns
ALTER TABLE public.datasets 
DROP COLUMN IF EXISTS value_binary,
DROP COLUMN IF EXISTS value_json,
DROP COLUMN IF EXISTS value_date,
DROP COLUMN IF EXISTS value_boolean,
DROP COLUMN IF EXISTS value_numeric,
DROP COLUMN IF EXISTS value_text,
DROP COLUMN IF EXISTS value_type,
DROP COLUMN IF EXISTS storage_mode;

-- 5. Restore NOT NULL constraint on file_path (WARNING: Ensure no 'value' rows exist)
-- DELETE FROM public.datasets WHERE file_path IS NULL; -- Safety cleanup
ALTER TABLE public.datasets ALTER COLUMN file_path SET NOT NULL;

COMMIT;
*/
