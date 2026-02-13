-- Update profiles role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'data_scientist', 'labeler', 'specialist'));

-- Create COLLABORATORS Table
CREATE TABLE IF NOT EXISTS public.collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'share', 'update', 'system'
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create PROJECT_HISTORY Table (Version Control)
CREATE TABLE IF NOT EXISTS public.project_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'share'
  entity_type TEXT NOT NULL, -- 'project', 'dataset', 'notebook', 'model'
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Collaborators
CREATE POLICY "Users can view their own collaborations." ON public.collaborators
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Project owners can manage collaborators." ON public.collaborators
  FOR ALL USING (auth.uid() IN (SELECT owner_id FROM public.projects WHERE id = project_id));

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications." ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications." ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Project History
CREATE POLICY "Collaborators can view project history." ON public.project_history
  FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM public.projects WHERE id = project_id) OR
    auth.uid() IN (SELECT user_id FROM public.collaborators WHERE project_id = project_id)
  );
