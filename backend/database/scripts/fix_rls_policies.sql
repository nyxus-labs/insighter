-- Enable RLS on tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- PROJECTS POLICIES
-- Allow users to view their own projects
CREATE POLICY "Users can view own projects" 
ON projects FOR SELECT 
TO authenticated 
USING (auth.uid() = owner_id);

-- Allow users to create projects (must assign themselves as owner)
CREATE POLICY "Users can create projects" 
ON projects FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

-- DATASETS POLICIES
-- Allow users to view own datasets
CREATE POLICY "Users can view own datasets" 
ON datasets FOR SELECT 
TO authenticated 
USING (auth.uid() = created_by);

-- Allow users to create datasets
CREATE POLICY "Users can create datasets" 
ON datasets FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

-- MODELS POLICIES
-- Allow users to view own models
CREATE POLICY "Users can view own models" 
ON models FOR SELECT 
TO authenticated 
USING (auth.uid() = created_by);

-- Allow users to create models
CREATE POLICY "Users can create models" 
ON models FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

-- STORAGE POLICIES (datasets bucket)
-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload to their own folder: uploads/{user_id}/*
CREATE POLICY "Users can upload own datasets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'datasets' AND 
  name LIKE 'uploads/' || auth.uid() || '/%'
);

-- Allow users to download their own datasets
CREATE POLICY "Users can view own datasets files" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'datasets' AND 
  name LIKE 'uploads/' || auth.uid() || '/%'
);
