-- Update profiles role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'manager', 'employee', 'data_scientist', 'data_analyst', 'ai_ml_engineer', 'data_engineer'));

-- WORKFLOWS Table
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed')),
    config JSONB DEFAULT '{}'::jsonb, -- Stores nodes and edges for visualization
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS Table (Workflow Steps)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'rejected')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    read BOOLEAN DEFAULT FALSE,
    link TEXT, -- Link to relevant page (e.g., workflow or task)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Workflow Policies
CREATE POLICY "Users can view workflows in their projects." ON public.workflows 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE projects.id = workflows.project_id AND projects.owner_id = auth.uid()
    ) OR created_by = auth.uid()
);

CREATE POLICY "Users can create workflows." ON public.workflows 
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Task Policies
CREATE POLICY "Users can view assigned or owned tasks." ON public.tasks 
FOR SELECT USING (
    assigned_to = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.workflows 
        WHERE workflows.id = tasks.workflow_id AND workflows.created_by = auth.uid()
    )
);

CREATE POLICY "Users can update their assigned tasks." ON public.tasks 
FOR UPDATE USING (assigned_to = auth.uid());

-- Notification Policies
CREATE POLICY "Users can view own notifications." ON public.notifications 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications." ON public.notifications 
FOR UPDATE USING (user_id = auth.uid());

-- Realtime enablement
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
