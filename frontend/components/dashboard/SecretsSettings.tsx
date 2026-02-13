'use client';

import { useState, useEffect } from 'react';
import { Key, Save, Trash2, Loader2, Plus, ExternalLink, ShieldCheck } from 'lucide-react';
import { settingsService, SecretSetting } from '@/lib/services/settingsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const SUGGESTED_KEYS = [
  { tool_id: 'openai', key: 'api_key', label: 'OpenAI API Key', description: 'Used for AI-assisted data analysis and code generation.' },
  { tool_id: 'roboflow', key: 'api_key', label: 'Roboflow API Key', description: 'Required for image labeling and dataset management.' },
  { tool_id: 'mlflow', key: 'tracking_uri', label: 'MLflow Tracking URI', description: 'Remote server address for experiment tracking.' },
  { tool_id: 'huggingface', key: 'api_token', label: 'Hugging Face Token', description: 'Access private models and datasets.' },
  { tool_id: 'aws', key: 'access_key_id', label: 'AWS Access Key ID', description: 'Cloud storage and compute access.' },
  { tool_id: 'aws', key: 'secret_access_key', label: 'AWS Secret Access Key', description: 'Cloud storage and compute access.' },
];

export function SecretsSettings() {
  const [secrets, setSecrets] = useState<SecretSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // New Secret Form
  const [newToolId, setNewToolId] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    try {
      const data = await settingsService.getSecrets();
      setSecrets(data);
    } catch (error) {
      console.error('Failed to fetch secrets:', error);
      toast.error('Failed to load tool settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (toolId: string, key: string, value: string) => {
    const id = `${toolId}-${key}`;
    setSaving(id);
    try {
      await settingsService.updateSecret(toolId, key, value);
      toast.success(`Updated ${key} for ${toolId}`);
      await fetchSecrets();
    } catch (error) {
      toast.error('Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (toolId: string, key: string) => {
    if (!confirm(`Are you sure you want to delete ${key} for ${toolId}?`)) return;
    
    try {
      await settingsService.deleteSecret(toolId, key);
      toast.success('Setting deleted');
      await fetchSecrets();
    } catch (error) {
      toast.error('Failed to delete setting');
    }
  };

  const handleAddSuggested = (suggested: typeof SUGGESTED_KEYS[0]) => {
    setNewToolId(suggested.tool_id);
    setNewKey(suggested.key);
    setNewValue('');
  };

  const isConfigured = (toolId: string, key: string) => {
    return secrets.some(s => s.tool_id === toolId && s.key === key);
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8 rounded-2xl border border-onyx-800 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-electric-600"></div>
        <div className="flex items-center justify-between border-b border-onyx-800 pb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-electric-400" />
            <h2 className="text-lg font-bold text-white">Tool API Keys & Secrets</h2>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] text-slate-500">
            SECURE STORAGE
          </Badge>
        </div>

        <p className="text-sm text-slate-400 max-w-2xl">
          Configure API keys and external service credentials. These are used by tools in the workspace to connect to real-world services. 
          All secrets are encrypted and never exposed in clear text after saving.
        </p>

        <div className="grid gap-6">
          {/* Active Secrets List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Configurations</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-electric-400" />
              </div>
            ) : secrets.length === 0 ? (
              <div className="p-8 border border-dashed border-onyx-800 rounded-xl text-center text-slate-500 text-sm">
                No secrets configured yet. Use the form below to add one.
              </div>
            ) : (
              <div className="grid gap-3">
                {secrets.map((secret) => (
                  <div key={`${secret.tool_id}-${secret.key}`} className="flex items-center gap-4 p-4 bg-onyx-900/50 rounded-xl border border-onyx-800 group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white uppercase tracking-tight">{secret.tool_id}</span>
                        <span className="text-[10px] text-slate-500">/</span>
                        <span className="text-xs text-slate-400">{secret.key}</span>
                      </div>
                      <code className="text-xs text-electric-400/70 font-mono">{secret.value}</code>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(secret.tool_id, secret.key)}
                        className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                        aria-label={`Delete ${secret.key} for ${secret.tool_id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Keys */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suggested Integrations</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {SUGGESTED_KEYS.map((suggested) => {
                const configured = isConfigured(suggested.tool_id, suggested.key);
                return (
                  <button
                    key={`${suggested.tool_id}-${suggested.key}`}
                    onClick={() => handleAddSuggested(suggested)}
                    disabled={configured}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition text-left ${
                      configured 
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60 cursor-default' 
                        : 'bg-onyx-900/30 border-onyx-800 hover:border-electric-600/30 hover:bg-onyx-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${configured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-onyx-800 text-slate-400'}`}>
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{suggested.label}</span>
                        {configured && <Badge className="bg-emerald-500/20 text-emerald-400 border-none h-4 px-1 text-[8px]">ACTIVE</Badge>}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{suggested.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add New Form */}
          <div className="pt-6 border-t border-onyx-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Add / Update Setting</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tool ID</label>
                <Input 
                  placeholder="e.g. openai" 
                  value={newToolId} 
                  onChange={e => setNewToolId(e.target.value)}
                  className="bg-onyx-900 border-onyx-700 text-white text-xs h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Key Name</label>
                <Input 
                  placeholder="e.g. api_key" 
                  value={newKey} 
                  onChange={e => setNewKey(e.target.value)}
                  className="bg-onyx-900 border-onyx-700 text-white text-xs h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Secret Value</label>
                <Input 
                  type="password"
                  placeholder="Enter value..." 
                  value={newValue} 
                  onChange={e => setNewValue(e.target.value)}
                  className="bg-onyx-900 border-onyx-700 text-white text-xs h-10"
                />
              </div>
            </div>
            <Button 
              onClick={() => handleUpdate(newToolId, newKey, newValue)}
              disabled={!newToolId || !newKey || !newValue || !!saving}
              className="w-full bg-electric-600 hover:bg-electric-500 text-white font-bold h-10 shadow-lg shadow-electric-600/20"
            >
              {saving === `${newToolId}-${newKey}` ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
