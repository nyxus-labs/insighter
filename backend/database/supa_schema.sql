-- =============================================================================
-- The Insighter Enterprise - Comprehensive Database Schema
-- Description: Systematically recreates all tables with production-grade 
--              integrity, security, and performance optimizations.
-- Date: 2026-02-12
-- Author: Assistant
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions and Initial Configuration
-- -----------------------------------------------------------------------------

-- Enable UUID extension for unique identifier generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Table Definitions
-- -----------------------------------------------------------------------------

-- 1.1 PROFILES
-- Extends Supabase Auth users with application-specific profile data
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'manager', 'employee', 'data_scientist', 'data_analyst', 'ai_ml_engineer', 'data_engineer'))
);

COMMENT ON TABLE public.profiles IS 'Stores application-specific user profile information.';

-- 1.2 PROJECTS
-- Core containers for all workspace activities
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    visibility TEXT DEFAULT 'private' NOT NULL,
    type TEXT DEFAULT 'General' NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT projects_visibility_check CHECK (visibility IN ('public', 'private', 'team'))
);

COMMENT ON TABLE public.projects IS 'Top-level containers for user work, datasets, and experiments.';

-- 1.3 COLLABORATORS
-- Manages project sharing and role-based access for non-owners
CREATE TABLE public.collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'viewer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(project_id, user_id),
    CONSTRAINT collaborators_role_check CHECK (role IN ('viewer', 'editor', 'admin'))
);

COMMENT ON TABLE public.collaborators IS 'Maps users to projects they do not own with specific permission levels.';

-- 1.4 DATASETS
-- Storage metadata for both files and direct values (Polymorphic Pattern)
CREATE TABLE public.datasets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT, -- Nullable for 'value' storage mode
    file_type TEXT, -- e.g., csv, json, parquet
    row_count INTEGER,
    size_bytes BIGINT,
    schema JSONB, -- Stores column names and types
    storage_mode TEXT DEFAULT 'file' NOT NULL,
    value_type TEXT,
    value_text TEXT,
    value_numeric NUMERIC,
    value_boolean BOOLEAN,
    value_date TIMESTAMPTZ,
    value_json JSONB,
    value_binary BYTEA,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT datasets_storage_mode_check CHECK (storage_mode IN ('file', 'value')),
    CONSTRAINT datasets_value_type_check CHECK (value_type IN ('text', 'numeric', 'boolean', 'date', 'json', 'binary')),
    CONSTRAINT check_file_storage_requires_path CHECK (
        (storage_mode = 'file' AND file_path IS NOT NULL) OR (storage_mode = 'value')
    ),
    CONSTRAINT check_value_storage_requires_type CHECK (
        (storage_mode = 'value' AND value_type IS NOT NULL) OR (storage_mode = 'file')
    )
);

COMMENT ON TABLE public.datasets IS 'Metadata and data storage for datasets, supporting both S3 files and direct values.';

-- 1.5 NOTEBOOKS
-- Metadata and state for interactive code execution environments
CREATE TABLE public.notebooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}'::jsonb NOT NULL,
    kernel TEXT DEFAULT 'python3' NOT NULL,
    status TEXT DEFAULT 'idle' NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT notebooks_status_check CHECK (status IN ('idle', 'running', 'error', 'busy'))
);

COMMENT ON TABLE public.notebooks IS 'Configuration and state for Jupyter-like interactive notebooks.';

-- 1.6 MODELS
-- Model registry for tracking trained ML models
CREATE TABLE public.models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    framework TEXT, -- e.g., sklearn, pytorch, tensorflow
    status TEXT DEFAULT 'staging' NOT NULL,
    metrics JSONB DEFAULT '{}'::jsonb,
    artifact_path TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT models_status_check CHECK (status IN ('staging', 'production', 'archived'))
);

COMMENT ON TABLE public.models IS 'Registry for machine learning model artifacts and metadata.';

-- 1.7 EXPERIMENTS
-- MLflow-style tracking for individual model training runs
CREATE TABLE public.experiments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    params JSONB DEFAULT '{}'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'running' NOT NULL,
    start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    end_time TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT experiments_status_check CHECK (status IN ('running', 'completed', 'failed', 'killed'))
);

COMMENT ON TABLE public.experiments IS 'Tracks hyperparameter tuning and model performance metrics across training runs.';

-- 1.8 ANNOTATIONS
-- Data labeling results
CREATE TABLE public.annotations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE NOT NULL,
    item_id TEXT NOT NULL,
    data JSONB NOT NULL,
    annotator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.annotations IS 'Stores labeling and annotation data for supervised learning tasks.';

-- 1.9 WORKFLOWS
-- Pipeline orchestration for automated tasks
CREATE TABLE public.workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' NOT NULL,
    config JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT workflows_status_check CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed'))
);

COMMENT ON TABLE public.workflows IS 'Defines orchestrated pipelines of data and ML tasks.';

-- 1.10 TASKS
-- Granular steps within a workflow or project
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    priority TEXT DEFAULT 'medium' NOT NULL,
    due_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT tasks_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'rejected')),
    CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

COMMENT ON TABLE public.tasks IS 'Individual actionable items assigned to users within a workspace.';

-- 1.11 NOTIFICATIONS
-- User-facing alerts and messages
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT notifications_type_check CHECK (type IN ('info', 'success', 'warning', 'error', 'share', 'task'))
);

COMMENT ON TABLE public.notifications IS 'Asynchronous alerts delivered to users for relevant system events.';

-- 1.12 TOOL_SETTINGS
-- External service credentials and configuration (Encrypted in transit/storage)
CREATE TABLE public.tool_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tool_id TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, tool_id, setting_key)
);

COMMENT ON TABLE public.tool_settings IS 'Stores API keys and configuration for external tool integrations.';

-- 1.13 PROJECT_HISTORY
-- Audit log for project-related actions
CREATE TABLE public.project_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.project_history IS 'Detailed audit trail for all significant actions within a project.';

-- 1.14 LABELING_PROJECTS
-- High-level labeling jobs/tasks
CREATE TABLE public.labeling_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- image, text, audio
    description TEXT,
    labels TEXT[] DEFAULT '{}'::TEXT[], -- Array of allowed labels
    status TEXT DEFAULT 'active' NOT NULL,
    progress FLOAT DEFAULT 0.0,
    annotators_count INTEGER DEFAULT 1,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT labeling_projects_status_check CHECK (status IN ('active', 'completed', 'paused', 'archived')),
    CONSTRAINT labeling_projects_type_check CHECK (type IN ('image', 'text', 'audio'))
);

COMMENT ON TABLE public.labeling_projects IS 'High-level labeling jobs or projects containing multiple items to be annotated.';

-- 1.15 LABELING_ITEMS
-- Individual items (images, text snippets) within a labeling project
CREATE TABLE public.labeling_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    labeling_project_id UUID REFERENCES public.labeling_projects(id) ON DELETE CASCADE NOT NULL,
    data_url TEXT, -- URL to image, audio, or the text itself
    content TEXT, -- For text-based labeling
    predicted_label TEXT,
    confidence FLOAT,
    manual_label TEXT,
    status TEXT DEFAULT 'pending' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT labeling_items_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'flagged'))
);

COMMENT ON TABLE public.labeling_items IS 'Individual data points within a labeling project that require annotation.';

-- 1.16 TEAMS
-- Groups for shared project access and organizational structure
CREATE TABLE public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.teams IS 'Organizational groups for managing multiple users and projects.';

-- 1.17 TEAM_MEMBERS
CREATE TABLE public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(team_id, user_id),
    CONSTRAINT team_members_role_check CHECK (role IN ('owner', 'admin', 'member'))
);

COMMENT ON TABLE public.team_members IS 'Maps users to teams with specific roles.';

-- -----------------------------------------------------------------------------
-- 2. Performance Optimization: Indexes
-- -----------------------------------------------------------------------------

-- Profiles
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Projects
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_visibility ON public.projects(visibility);
CREATE INDEX idx_projects_type ON public.projects(type);

-- Collaborators
CREATE INDEX idx_collaborators_project_id ON public.collaborators(project_id);
CREATE INDEX idx_collaborators_user_id ON public.collaborators(user_id);

-- Datasets
CREATE INDEX idx_datasets_project_id ON public.datasets(project_id);
CREATE INDEX idx_datasets_created_by ON public.datasets(created_by);
CREATE INDEX idx_datasets_storage_type ON public.datasets(storage_mode, value_type);
CREATE INDEX idx_datasets_value_json ON public.datasets USING gin (value_json);
CREATE INDEX idx_datasets_value_date ON public.datasets(value_date);

-- Notebooks
CREATE INDEX idx_notebooks_project_id ON public.notebooks(project_id);
CREATE INDEX idx_notebooks_created_by ON public.notebooks(created_by);

-- Models
CREATE INDEX idx_models_project_id ON public.models(project_id);
CREATE INDEX idx_models_created_by ON public.models(created_by);
CREATE INDEX idx_models_status ON public.models(status);

-- Experiments
CREATE INDEX idx_experiments_project_id ON public.experiments(project_id);
CREATE INDEX idx_experiments_created_by ON public.experiments(created_by);

-- Annotations
CREATE INDEX idx_annotations_dataset_id ON public.annotations(dataset_id);
CREATE INDEX idx_annotations_annotator_id ON public.annotations(annotator_id);

-- Workflows
CREATE INDEX idx_workflows_project_id ON public.workflows(project_id);
CREATE INDEX idx_workflows_created_by ON public.workflows(created_by);

-- Tasks
CREATE INDEX idx_tasks_workflow_id ON public.tasks(workflow_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);

-- Labeling
CREATE INDEX idx_labeling_projects_owner ON public.labeling_projects(owner_id);
CREATE INDEX idx_labeling_projects_project ON public.labeling_projects(project_id);
CREATE INDEX idx_labeling_items_project ON public.labeling_items(labeling_project_id);
CREATE INDEX idx_labeling_items_status ON public.labeling_items(status);

-- Notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Tool Settings
CREATE INDEX idx_tool_settings_user_id ON public.tool_settings(user_id, tool_id);

-- Project History
CREATE INDEX idx_project_history_project_id ON public.project_history(project_id);
CREATE INDEX idx_project_history_created_at ON public.project_history(created_at);

-- Teams
CREATE INDEX idx_teams_owner ON public.teams(owner_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);

-- -----------------------------------------------------------------------------
-- 3. Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labeling_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labeling_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 3.1 PROFILES
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3.2 PROJECTS
-- Users can view projects they own or are collaborators on
CREATE POLICY "View projects" ON public.projects FOR SELECT 
USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid())
);
CREATE POLICY "Create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Update projects" ON public.projects FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Delete projects" ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- 3.3 COLLABORATORS
CREATE POLICY "View collaborators" ON public.collaborators FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = collaborators.project_id AND owner_id = auth.uid()) OR
    user_id = auth.uid()
);
CREATE POLICY "Manage collaborators" ON public.collaborators FOR ALL 
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = collaborators.project_id AND owner_id = auth.uid()));

-- 3.4 DATASETS, NOTEBOOKS, MODELS, EXPERIMENTS, WORKFLOWS, TASKS (Project-based RLS)
-- Policy helper pattern: Viewable if owner of project or collaborator
CREATE POLICY "View project resources" ON public.datasets FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = datasets.project_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid()))));

CREATE POLICY "Manage project resources" ON public.datasets FOR ALL 
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = datasets.project_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('editor', 'admin')))));

-- Repeat for others (Simplified for supa_schema.sql consolidation)
CREATE POLICY "Manage notebooks" ON public.notebooks FOR ALL USING (EXISTS (SELECT 1 FROM public.projects WHERE id = notebooks.project_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('editor', 'admin')))));
CREATE POLICY "Manage models" ON public.models FOR ALL USING (EXISTS (SELECT 1 FROM public.projects WHERE id = models.project_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('editor', 'admin')))));
CREATE POLICY "Manage experiments" ON public.experiments FOR ALL USING (EXISTS (SELECT 1 FROM public.projects WHERE id = experiments.project_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('editor', 'admin')))));
CREATE POLICY "Manage workflows" ON public.workflows FOR ALL USING (EXISTS (SELECT 1 FROM public.projects WHERE id = workflows.project_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('editor', 'admin')))));
CREATE POLICY "Manage tasks" ON public.tasks FOR ALL USING (auth.uid() = assigned_to OR EXISTS (SELECT 1 FROM public.projects WHERE id = tasks.project_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('editor', 'admin')))));

-- 3.5 ANNOTATIONS
CREATE POLICY "Manage annotations" ON public.annotations FOR ALL USING (EXISTS (SELECT 1 FROM public.datasets d JOIN public.projects p ON d.project_id = p.id WHERE d.id = annotations.dataset_id AND (p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = p.id AND user_id = auth.uid()))));

-- 3.6 NOTIFICATIONS & TOOL SETTINGS
CREATE POLICY "Manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own tool settings" ON public.tool_settings FOR ALL USING (auth.uid() = user_id);

-- 3.7 PROJECT HISTORY
CREATE POLICY "View project history" ON public.project_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_history.project_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid()))));

-- 3.8 LABELING
CREATE POLICY "Manage labeling projects" ON public.labeling_projects FOR ALL 
USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM public.projects WHERE id = labeling_projects.project_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('editor', 'admin'))))
);

CREATE POLICY "Manage labeling items" ON public.labeling_items FOR ALL 
USING (EXISTS (SELECT 1 FROM public.labeling_projects lp WHERE lp.id = labeling_items.labeling_project_id AND (lp.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = lp.project_id AND (p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.collaborators c WHERE c.project_id = p.id AND c.user_id = auth.uid()))))));

-- 3.9 TEAMS
CREATE POLICY "View teams" ON public.teams FOR SELECT 
USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid())
);
CREATE POLICY "Manage teams" ON public.teams FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "View team members" ON public.team_members FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()))));
CREATE POLICY "Manage team members" ON public.team_members FOR ALL 
USING (EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND owner_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 4. Automation: Triggers and Functions
-- -----------------------------------------------------------------------------

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_datasets_updated_at BEFORE UPDATE ON public.datasets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_notebooks_updated_at BEFORE UPDATE ON public.notebooks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_models_updated_at BEFORE UPDATE ON public.models FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_experiments_updated_at BEFORE UPDATE ON public.experiments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_tool_settings_updated_at BEFORE UPDATE ON public.tool_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_labeling_projects_updated_at BEFORE UPDATE ON public.labeling_projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_labeling_items_updated_at BEFORE UPDATE ON public.labeling_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_annotations_updated_at BEFORE UPDATE ON public.annotations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. Realtime Configuration
-- -----------------------------------------------------------------------------

-- Enable Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.experiments;

-- -----------------------------------------------------------------------------
-- 6. Storage Configuration
-- -----------------------------------------------------------------------------

-- Ensure datasets bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Users can upload own datasets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'datasets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own datasets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'datasets' AND (storage.foldername(name))[1] = auth.uid()::text);
