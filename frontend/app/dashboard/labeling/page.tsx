'use client';

import { useState, useEffect } from 'react';
import { 
  Tag, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Database,
  Layers,
  ShieldCheck,
  History,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { TOOLS } from '@/lib/constants/tools';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function LabelingToolsPage() {
  const { user: profile } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tools' | 'tasks'>('tools');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const labelingTools = TOOLS.filter(tool => 
    tool.category === 'Labeling' && 
    (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await api.get('/api/labeling/');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching labeling tasks:', error);
      toast.error('Failed to load labeling tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
            Labelling <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Specialist Center</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Active Protocol: <span className="text-orange-400 font-bold">DATA_ANNOTATION_V2</span>
            {profile?.role && (
              <>
                <span className="text-onyx-700">|</span>
                <span className="text-slate-500 uppercase">Role: {profile.role}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex bg-onyx-900/50 p-1 rounded-xl border border-onyx-800">
          <button 
            onClick={() => setActiveTab('tools')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'tools' ? 'bg-orange-500 text-black' : 'text-slate-500 hover:text-white'}`}
          >
            AVAILABLE TOOLS
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'tasks' ? 'bg-orange-500 text-black' : 'text-slate-500 hover:text-white'}`}
          >
            SAVED TASKS
          </button>
        </div>
      </div>

      {activeTab === 'tools' ? (
        <>
          {/* Search & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search annotation tools..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-onyx-900 border border-onyx-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-orange-500/50 transition shadow-lg"
              />
            </div>
            <div className="bg-onyx-900 border border-onyx-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Tools</p>
                <p className="text-2xl font-bold text-white">{labelingTools.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labelingTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.id} className="group glass-panel rounded-3xl border border-onyx-800 hover:border-orange-500/30 transition-all duration-500 p-8 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors"></div>
                  
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{tool.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">{tool.description}</p>

                  <div className="flex items-center justify-between pt-6 border-t border-onyx-800/50">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">v{tool.version || '1.0'}</span>
                    <Link href={`/dashboard/labeling/${tool.id}`} className="flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
                      LAUNCH TOOL <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Tasks View */
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" />
              Annotation History
            </h2>
            <button 
              onClick={fetchTasks}
              disabled={isLoadingTasks}
              className="p-2 text-slate-500 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingTasks ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-onyx-800 overflow-hidden">
            {isLoadingTasks ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-orange-500" />
                <p className="text-sm font-bold uppercase tracking-widest">Syncing Task Database...</p>
              </div>
            ) : tasks.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-onyx-800 bg-onyx-950/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-onyx-800">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-onyx-900/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-onyx-900 border border-onyx-800 flex items-center justify-center text-orange-400">
                            <Tag className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{task.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-400 uppercase">{task.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[100px] h-1.5 bg-onyx-900 rounded-full overflow-hidden border border-onyx-800">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${task.progress * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 mt-1 block">{(task.progress * 100).toFixed(0)}% COMPLETE</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {task.status === 'completed' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" /> COMPLETED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center gap-1.5">
                              <Clock className="w-3 h-3" /> ACTIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-bold text-orange-400 hover:text-white transition-colors">CONTINUE MISSION</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-white mb-1">No tasks found</h3>
                <p className="text-sm">Initiate a new labeling project to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
