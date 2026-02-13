-- TOOL_SETTINGS Table
CREATE TABLE IF NOT EXISTS public.tool_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tool_id TEXT NOT NULL, -- e.g. 'openai', 'roboflow', 'mlflow'
  setting_key TEXT NOT NULL, -- e.g. 'api_key', 'endpoint', 'region'
  setting_value TEXT NOT NULL, -- This should be encrypted in a production environment
  is_secret BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id, setting_key)
);

-- RLS for tool_settings
ALTER TABLE public.tool_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tool settings." ON public.tool_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tool settings." ON public.tool_settings FOR ALL USING (auth.uid() = user_id);
