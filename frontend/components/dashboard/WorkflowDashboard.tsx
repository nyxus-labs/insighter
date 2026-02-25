'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  created_at: string;
}

export default function WorkflowDashboard({ role }: { role: string }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/workflows/');
      setWorkflows(res.data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10';
      case 'completed': return 'text-blue-400 bg-blue-400/10';
      case 'failed': return 'text-rose-400 bg-rose-400/10';
      case 'paused': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Workflow <span className="text-electric-400">Control Center</span>
          </h2>
          <p className="text-slate-400 font-mono text-sm mt-1">
            Role: <span className="text-neon-violet uppercase font-bold">{role.replace('_', ' ')}</span>
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-electric-500 hover:bg-electric-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-electric-500/20">
          <Plus className="w-5 h-5" />
          New Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-white">12</span>
          </div>
          <h3 className="text-slate-400 font-medium mt-4">Active Missions</h3>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-white">5</span>
          </div>
          <h3 className="text-slate-400 font-medium mt-4">Pending Approvals</h3>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">84</span>
          </div>
          <h3 className="text-slate-400 font-medium mt-4">Completed Cycles</h3>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search workflows..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-slate-300 focus:outline-none focus:border-electric-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/60 text-slate-500 font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Mission Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-48"></div></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-800 rounded-full w-20"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                    <td className="px-6 py-6 text-right"><div className="h-8 bg-slate-800 rounded-lg w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : workflows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-mono">
                    No active mission protocols found.
                  </td>
                </tr>
              ) : (
                workflows.map((workflow) => (
                  <tr key={workflow.id} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-white font-bold group-hover:text-electric-400 transition-colors">{workflow.name}</span>
                        <span className="text-slate-500 text-sm truncate max-w-xs">{workflow.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-slate-400 font-mono text-sm">
                      {new Date(workflow.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button className="text-slate-500 hover:text-electric-400 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
