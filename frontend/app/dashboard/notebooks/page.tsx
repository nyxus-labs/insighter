'use client';

import { useState, useEffect } from 'react';
import { Code, Search, Filter, Plus, Play, MoreVertical, Clock, Cpu, Share2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { createClient } from '@/utils/supabase/client';
import NotebookCreateModal from '@/components/dashboard/NotebookCreateModal';

export default function NotebooksPage() {
  const { user: userProfile, loading: userLoading } = useUser();
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const fetchNotebooks = async () => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) return;

      const res = await fetch('http://localhost:8000/api/notebooks/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotebooks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && userProfile) {
      fetchNotebooks();
    }
  }, [userLoading, userProfile]);

  const handleNotebookCreated = (newNotebook: any) => {
    setNotebooks([newNotebook, ...notebooks]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notebook Registry</h1>
          <p className="text-slate-400 font-mono text-sm">Manage Jupyter environments and collaborative scripts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-electric-600 hover:bg-electric-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-glow-cyan transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Notebook
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search notebooks..." 
            className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl py-3 pl-10 pr-4 text-slate-300 focus:outline-none focus:border-electric-400 transition"
          />
        </div>
        <button className="px-4 py-2 bg-onyx-900 border border-onyx-800 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-electric-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {notebooks.map((nb) => (
              <div key={nb.id} className="glass-panel p-6 rounded-2xl border border-onyx-800 hover:border-electric-600/50 transition group relative overflow-hidden">
                 <div className="absolute top-4 right-4 flex gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                       nb.status === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-onyx-800 text-slate-500 border border-onyx-700'
                    }`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${nb.status === 'Running' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                       {nb.status || 'Idle'}
                    </span>
                 </div>
  
                 <div className="mb-4">
                    <div className="w-12 h-12 bg-electric-600/10 rounded-xl flex items-center justify-center text-electric-400 mb-4 group-hover:scale-110 transition shadow-glow-cyan-sm">
                       <Code className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 truncate pr-16">{nb.name}</h3>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                       <Clock className="w-3 h-3" /> Updated {new Date(nb.updated_at || Date.now()).toLocaleDateString()}
                    </p>
                 </div>
  
                 <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                       <span>Kernel</span>
                       <span className="text-slate-200">{nb.kernel}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                       <span>Resources</span>
                       <span className="text-slate-200 flex items-center gap-1"><Cpu className="w-3 h-3" /> {nb.cpu || '2 vCPU'} / {nb.ram || '4 GB'}</span>
                    </div>
                 </div>
  
                 <div className="flex gap-2 mt-auto">
                    <Link href={`/studio/${nb.project_id}/tool/notebook?notebookId=${nb.id}`} className="flex-1 bg-onyx-800 hover:bg-electric-600 hover:text-white text-slate-300 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 border border-onyx-700 hover:border-electric-500">
                       <Play className="w-3 h-3 fill-current" /> Open
                    </Link>
                    <button className="p-2 bg-onyx-800 hover:bg-onyx-700 rounded-lg text-slate-400 hover:text-white transition border border-onyx-700">
                       <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-onyx-800 hover:bg-onyx-700 rounded-lg text-slate-400 hover:text-white transition border border-onyx-700">
                       <MoreVertical className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           ))}
           
           {/* Create New Card */}
           <button 
              onClick={() => setIsModalOpen(true)}
              className="border border-dashed border-onyx-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-electric-400 hover:border-electric-400/50 hover:bg-onyx-900/30 transition min-h-[240px] group"
           >
              <div className="w-14 h-14 rounded-full bg-onyx-900 flex items-center justify-center mb-4 group-hover:scale-110 transition border border-onyx-800 group-hover:border-electric-400/30 shadow-lg">
                 <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold tracking-wide text-sm">CREATE NEW NOTEBOOK</span>
           </button>
        </div>
      )}

      <NotebookCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleNotebookCreated} 
      />
    </div>
  );
}
