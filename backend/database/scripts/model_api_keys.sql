-- SQL for Insighter Model API Keys
CREATE TABLE IF NOT EXISTS public.model_api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model_id UUID REFERENCES public.models(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL, -- First 8 chars for identification
    name TEXT, -- Optional name for the key
    scopes JSONB DEFAULT '["model:predict"]', -- Permissions
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Index for fast lookup by prefix
CREATE INDEX IF NOT EXISTS idx_model_api_keys_prefix ON public.model_api_keys(key_prefix);

-- RLS Policies
ALTER TABLE public.model_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage keys for their own models." 
ON public.model_api_keys 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Internal service can view keys." 
ON public.model_api_keys 
FOR SELECT 
USING (true); -- Usually restricted by service role, but for this demo we'll keep it simple
