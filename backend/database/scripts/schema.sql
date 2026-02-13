-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS Table (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'data_scientist')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS Table
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'team')),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DATASETS Table
CREATE TABLE public.datasets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT, -- csv, json, parquet, image, etc.
  row_count INTEGER,
  size_bytes BIGINT,
  schema JSONB, -- Stores column names and types
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTEBOOKS Table
CREATE TABLE public.notebooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb, -- Stores cell data and metadata
  kernel TEXT DEFAULT 'python3',
  status TEXT DEFAULT 'idle', -- idle, running, error
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MODELS Table (Model Registry)
CREATE TABLE public.models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  framework TEXT, -- sklearn, pytorch, tensorflow
  status TEXT DEFAULT 'staging' CHECK (status IN ('staging', 'production', 'archived')),
  metrics JSONB, -- Accuracy, F1, etc.
  artifact_path TEXT, -- Path to .pkl, .onnx, etc.
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPERIMENTS Table (MLflow tracking metadata)
CREATE TABLE public.experiments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  params JSONB,
  metrics JSONB,
  status TEXT,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ
);

-- ANNOTATIONS Table
CREATE TABLE public.annotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL, -- Reference to specific image/text ID within dataset
  data JSONB NOT NULL, -- Bounding boxes, labels, etc.
  annotator_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Basic Policy: Users can see their own data (Simplified for MVP)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own projects." ON public.projects FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create projects." ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view own notebooks." ON public.notebooks FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create notebooks." ON public.notebooks FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own datasets." ON public.datasets FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create datasets." ON public.datasets FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own models." ON public.models FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create models." ON public.models FOR INSERT WITH CHECK (auth.uid() = created_by);
