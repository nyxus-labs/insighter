'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { createClient } from '@/utils/supabase/client';
import { CATEGORIES } from '@/lib/constants/tools';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
}

export default function ProjectCreateModal({ isOpen, onClose, onSuccess }: ProjectCreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [type, setType] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const supabase = createClient();

  if (!isOpen) return null;

  const categories = CATEGORIES.filter(c => c !== 'All');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          visibility,
          type: type === 'General' ? 'General' : type,
          tags: type !== 'General' ? [type.toLowerCase()] : []
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create project');
      }

      const newProject = await res.json();
      onSuccess(newProject);
      onClose();
      setName('');
      setDescription('');
      setType('General');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-onyx-900 border border-onyx-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-400 to-neon-purple"></div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">New Project</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-electric-400 transition"
                placeholder="e.g. Churn Analysis 2024"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-electric-400 transition appearance-none"
              >
                <option value="General">General</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-electric-400 transition min-h-[100px]"
                placeholder="What is this project about?"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-electric-400 transition"
              >
                <option value="private">Private</option>
                <option value="team">Team</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-onyx-800 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white font-medium transition shadow-glow-cyan flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
