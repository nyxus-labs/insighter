-- Add 'type' column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'General';

-- Update existing projects to have a default type if needed
UPDATE projects SET type = 'General' WHERE type IS NULL;
