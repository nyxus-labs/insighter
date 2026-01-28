'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Cpu } from 'lucide-react';

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate creation delay
    setTimeout(() => {
        const randomId = Math.random().toString(36).substring(7);
        router.push(`/studio/${randomId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-onyx-950 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-30"></div>
      
      <div className="glass-panel p-10 rounded-3xl w-full max-w-lg relative z-10 border border-onyx-800 shadow-cyber-panel">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-electric-600 to-neon-blue rounded-2xl flex items-center justify-center shadow-glow-cyan animate-pulse-slow">
                <Cpu className="w-8 h-8 text-white" />
            </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2 text-glow-subtle">Initialize Project</h1>
        <p className="text-center text-slate-400 mb-8 font-mono text-sm">Configure a new workspace for your mission.</p>

        <form onSubmit={handleCreate} className="space-y-6">
            <div>
                <label className="block text-xs font-mono text-electric-400 mb-2 uppercase tracking-widest">Project Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition" 
                  placeholder="e.g. Neural Network Analysis" 
                  required
                  autoFocus
                />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-electric-600 hover:bg-electric-500 text-white font-bold py-3.5 rounded-xl shadow-glow-cyan hover:shadow-glow-cyan-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? 'INITIALIZING...' : <><Plus className="w-5 h-5" /> CREATE WORKSPACE</>}
            </button>
        </form>
        
        <div className="mt-6 text-center">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white transition flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Cancel & Return
            </Link>
        </div>
      </div>
    </div>
  );
}
