'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface NotebookCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (notebook: any) => void;
}

export default function NotebookCreateModal({ isOpen, onClose, onSuccess }: NotebookCreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [kernel, setKernel] = useState('python3');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) return;

      const res = await fetch('http://localhost:8000/api/projects/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) setProjectId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProjectsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch('http://localhost:8000/api/notebooks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          project_id: projectId,
          kernel
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create notebook');
      }

      const newNotebook = await res.json();
      onSuccess(newNotebook);
      onClose();
      setName('');
      setDescription('');
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
            <h2 className="text-xl font-bold text-white">New Notebook</h2>
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
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Notebook Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-electric-400 transition"
                placeholder="e.g. EDA_v1.ipynb"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Project</label>
              {projectsLoading ? (
                <div className="w-full h-10 bg-onyx-950 rounded-lg animate-pulse"></div>
              ) : (
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-electric-400 transition"
                  required
                >
                  <option value="" disabled>Select a project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Kernel</label>
              <select
                value={kernel}
                onChange={(e) => setKernel(e.target.value)}
                className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-electric-400 transition"
              >
                <option value="python3">Python 3 (Standard)</option>
                <option value="python3-gpu">Python 3 (GPU)</option>
                <option value="r">R 4.2</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-electric-400 transition min-h-[80px]"
                placeholder="Optional description..."
              />
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
                disabled={loading || projectsLoading || !projectId}
                className="px-6 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white font-medium transition shadow-glow-cyan flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Notebook
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
