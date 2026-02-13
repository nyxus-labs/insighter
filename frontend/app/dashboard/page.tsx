
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  ArrowRight, 
  Trophy, 
  Target, 
  ChevronRight,
  Activity,
  Box,
  Layout, 
  Zap,
  Rocket,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/contexts/UserContext';
import { getFullName } from '@/utils/user';
import { createClient } from '@/utils/supabase/client';
import api from '@/lib/api';
import { ROLES, RoleConfig } from '@/lib/constants/roles';
import { TOOLS } from '@/lib/constants/tools';
import { toast } from 'sonner';

function DashboardContent() {
  const { user: userProfile, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [creatingRole, setCreatingRole] = useState<string | null>(null);
  const router = useRouter();

  const welcomeName = userLoading ? '...' : (userProfile ? getFullName(userProfile) : 'Commander');

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, telemetryRes, achievementsRes] = await Promise.all([
        api.get('/api/projects/').catch(() => ({ data: [] })),
        api.get('/api/projects/stats/telemetry').catch(() => ({ data: [] })),
        api.get('/api/projects/stats/achievements').catch(() => ({ data: [] }))
      ]);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data.slice(0, 4) : []);
      setTelemetry(Array.isArray(telemetryRes.data) ? telemetryRes.data : []);
      setAchievements(Array.isArray(achievementsRes.data) ? achievementsRes.data : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      setProjects([]);
      setTelemetry([]);
      setAchievements([]);
    }
  };

  useEffect(() => {
    if (!userLoading && userProfile) {
      fetchDashboardData();
    }
  }, [userLoading, userProfile]);

  const handleSelectRole = (role: RoleConfig) => {
    router.push(`/workspaces/${role.id}`);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">
            Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-neon-violet">Mission Protocol</span>
          </h1>
          <p className="text-slate-400 font-mono text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            Active User: <span className="text-electric-400 font-bold">{welcomeName}</span> • System Status: <span className="text-neon-emerald">READY</span>
          </p>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="list" aria-label="Mission Protocols">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isCreating = creatingRole === role.id;
          
          return (
            <div 
              key={role.id}
              role="button"
              tabIndex={0}
              aria-label={`Select ${role.title} protocol`}
              onClick={() => !isCreating && handleSelectRole(role)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!isCreating) handleSelectRole(role);
                }
              }}
              className={`group relative glass-panel overflow-hidden rounded-3xl border border-onyx-800 hover:border-electric-500/50 transition-all duration-500 cursor-pointer hover:shadow-glow-cyan/20 hover:-translate-y-2 flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500/50`}
            >
              {/* Background Gradient */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${role.color}`}></div>
              <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-700 rounded-full blur-3xl`}></div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-electric-400 transition-colors">{role.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">{role.description}</p>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {role.tools.slice(0, 3).map(toolId => {
                      const tool = TOOLS.find(t => t.id === toolId);
                      return (
                        <span key={toolId} className="px-2 py-1 bg-onyx-900 border border-onyx-800 rounded text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          {tool?.name || toolId}
                        </span>
                      );
                    })}
                  </div>
                  
                  <div className="pt-4 border-t border-onyx-800/50 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">INITIATE WORKSPACE</span>
                    {isCreating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-electric-400"></div>
                    ) : (
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-electric-400 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats / Recent Activity - Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Missions Section */}
          <div className="glass-panel p-8 rounded-3xl border border-onyx-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Layout className="w-6 h-6 text-electric-400" />
                Active Missions
              </h2>
              <button 
                onClick={() => router.push('/dashboard/projects')}
                className="text-xs font-mono text-electric-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electric-400/50 rounded"
              >
                VIEW ALL PROJECTS
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <RecentProjectCard 
                    key={project.id}
                    id={project.id}
                    name={project.name} 
                    role={project.type || 'General'} 
                    status={project.visibility === 'public' ? 'Public' : 'Private'} 
                    progress={Math.floor(Math.random() * 40) + 60} // Keep some flavor or use real progress if available
                    lastModified={formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                  />
                ))
              ) : (
                <div className="col-span-2 py-12 text-center text-slate-500 font-mono text-sm border border-dashed border-onyx-800 rounded-2xl">
                  NO ACTIVE MISSIONS FOUND. INITIATE PROTOCOL TO START.
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-onyx-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Activity className="w-6 h-6 text-neon-emerald" />
                Progress Telemetry
              </h2>
              <button 
                onClick={() => router.push('/dashboard/models')}
                className="text-xs font-mono text-electric-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electric-400/50 rounded"
              >
                VIEW ALL METRICS
              </button>
            </div>
            
            <div className="space-y-6">
              {telemetry.length > 0 ? telemetry.map((stat: any, i: number) => (
                <div key={stat.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-mono">{stat.name}</span>
                    <span className="text-white font-bold">{stat.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-onyx-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.color}`} 
                      style={{ width: `${stat.value}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                ['Model Accuracy', 'Data Pipeline Health', 'Deployment Uptime'].map((stat, i) => (
                  <div key={stat} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-mono">{stat}</span>
                      <span className="text-white font-bold">{[94, 100, 99][i]}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-onyx-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${i === 0 ? 'from-blue-500 to-cyan-500' : i === 1 ? 'from-emerald-500 to-teal-500' : 'from-purple-500 to-pink-500'}`} 
                        style={{ width: `${[94, 100, 99][i]}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-onyx-800 bg-gradient-to-b from-onyx-900/50 to-transparent">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Recent Achievements
          </h2>
          <div className="space-y-4">
            {achievements.length > 0 ? achievements.map((ach: any, i: number) => {
              const Icon = ach.icon === 'Zap' ? Zap : 
                           ach.icon === 'Target' ? Target : 
                           ach.icon === 'Plus' ? Plus : 
                           ach.icon === 'Rocket' ? Rocket : Trophy;
              const color = ach.color || 'text-purple-400';
              const dateStr = ach.date === 'Initial' ? 'Initial' : formatDistanceToNow(new Date(ach.date), { addSuffix: true });
              
              return (
                <button 
                  key={i} 
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-onyx-900/50 transition-colors cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400/50"
                  aria-label={`View achievement: ${ach.title}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-onyx-900 border border-onyx-800 flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-electric-400 transition-colors">{ach.title}</h4>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">{dateStr}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              );
            }) : (
              [
                { title: 'Neural Architect', date: '2h ago', icon: Zap, color: 'text-yellow-400' },
                { title: 'Data Voyager', date: '1d ago', icon: Target, color: 'text-blue-400' },
                { title: 'Inference Master', date: '3d ago', icon: Trophy, color: 'text-purple-400' },
              ].map((ach, i) => (
                <button 
                  key={i} 
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-onyx-900/50 transition-colors cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400/50"
                  aria-label={`View achievement: ${ach.title}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-onyx-900 border border-onyx-800 flex items-center justify-center ${ach.color}`}>
                    <ach.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-electric-400 transition-colors">{ach.title}</h4>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">{ach.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentProjectCard({ name, role, status, progress, lastModified }: any) {
  return (
    <div className="p-4 rounded-2xl bg-onyx-900/50 border border-onyx-800 hover:border-electric-400/30 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-white font-bold group-hover:text-electric-400 transition-colors">{name}</h4>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{role}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>PROGRESS</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 w-full bg-onyx-950 rounded-full overflow-hidden">
          <div 
            className="h-full bg-electric-400 transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-[10px] text-slate-600 font-mono">
        <span>LAST SYNC: {lastModified}</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-electric-400" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
