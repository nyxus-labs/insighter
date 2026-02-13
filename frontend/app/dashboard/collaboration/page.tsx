'use client';

import { useState, useEffect, Suspense } from 'react';
import { Users, Share2, Shield, Clock, Search, Filter, Plus, UserPlus, MoreVertical, Trash2, Edit2, Check, X, Loader2, Folder } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/contexts/UserContext';
import api from '@/lib/api';
import { toast } from 'sonner';

function CollaborationContent() {
  const { user: profile } = useUser();
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total_collaborators: 0, shared_with_you: 0, pending_invitations: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [userProjects, setUserProjects] = useState<{id: string, name: string}[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchSharedProjects();
    fetchUserProjects();
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    if (!profile) return;
    try {
      const { data } = await api.get('/api/collaboration/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ total_collaborators: 0, shared_with_you: 0, pending_invitations: 0 });
    }
  };

  const fetchUserProjects = async () => {
    if (!profile) return;
    setIsLoadingProjects(true);
    try {
      const { data } = await api.get('/api/projects/');
      setUserProjects(data || []);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      setUserProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchSharedProjects = async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const { data } = await api.get('/api/collaboration/shared');
      setSharedProjects(data || []);
    } catch (error) {
      console.error('Error fetching shared projects:', error);
      setSharedProjects([]);
      toast.error('Failed to load shared projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !selectedProjectId) return;
    setIsInviting(true);
    try {
      await api.post('/api/collaboration/invite', {
        project_id: selectedProjectId,
        email: inviteEmail,
        role: inviteRole
      });
      
      toast.success(`Invitation sent to ${inviteEmail}`);
      setIsShareModalOpen(false);
      setInviteEmail('');
      setSelectedProjectId(null);
      
      // Refresh list in case user invited themselves or for general consistency
      fetchSharedProjects();
    } catch (error: any) {
      console.error('Error inviting collaborator:', error);
      toast.error(error.response?.data?.detail || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const filteredProjects = sharedProjects.filter(p => 
    p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">COLLABORATION <span className="text-electric-400">HUB</span></h1>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Secure Project Sharing & Team Sync</p>
        </div>
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="bg-electric-500 hover:bg-electric-400 text-black px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-electric-500/20"
        >
          <UserPlus className="w-4 h-4" /> SHARE PROJECT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-onyx-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-electric-500/10 flex items-center justify-center text-electric-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Collaborators</p>
            <p className="text-2xl font-black text-white">{stats.total_collaborators}</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-onyx-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Shared With You</p>
            <p className="text-2xl font-black text-white">{stats.shared_with_you}</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-onyx-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pending Invitations</p>
            <p className="text-2xl font-black text-white">{stats.pending_invitations}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-onyx-800 overflow-hidden">
        <div className="p-6 border-b border-onyx-800 bg-onyx-900/30 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="SEARCH SHARED PROJECTS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-onyx-950 border border-onyx-800 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-electric-400/50 transition font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-onyx-950 border border-onyx-800 rounded-xl text-slate-400 hover:text-white transition">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-onyx-950 border border-onyx-800 rounded-xl text-slate-400 hover:text-white transition">
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-onyx-950/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Shared At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-onyx-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-electric-400 mb-4" />
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Loading collaboration data...</p>
                  </td>
                </tr>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-onyx-800/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-onyx-900 border border-onyx-800 flex items-center justify-center text-electric-400">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-electric-400 transition">{project.project_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {project.project_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-onyx-800 border border-onyx-700 flex items-center justify-center text-[10px] text-slate-300">
                          {project.owner_name.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-300">{project.owner_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        project.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        project.role === 'editor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {project.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-500 font-mono">
                      {new Date(project.shared_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-500 hover:text-electric-400 hover:bg-electric-500/10 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-onyx-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 mb-1">No Shared Projects Found</p>
                    <p className="text-xs text-slate-600 font-mono">Shared projects and team invitations will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-onyx-800 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-6 border-b border-onyx-800 flex justify-between items-center bg-onyx-900/50">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">SHARE PROJECT</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Invite Collaborators</p>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select Project</label>
                <select 
                  className="w-full bg-onyx-950 border border-onyx-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-electric-400/50 transition"
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={isLoadingProjects}
                >
                  <option value="" disabled>{isLoadingProjects ? 'Loading projects...' : 'Choose a project...'}</option>
                  {userProjects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Collaborator Email</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-onyx-950 border border-onyx-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-electric-400/50 transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Permission Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['viewer', 'editor', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={`py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        inviteRole === role 
                        ? 'bg-electric-500 border-electric-400 text-black shadow-lg shadow-electric-500/20' 
                        : 'bg-onyx-950 border-onyx-800 text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-2 px-1">
                  {inviteRole === 'viewer' && 'Can only view project data and results.'}
                  {inviteRole === 'editor' && 'Can edit notebooks, datasets, and run experiments.'}
                  {inviteRole === 'admin' && 'Full access including managing other collaborators.'}
                </p>
              </div>
            </div>

            <div className="p-6 bg-onyx-900/30 border-t border-onyx-800 flex gap-3">
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="flex-1 py-3 bg-onyx-950 border border-onyx-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
              >
                CANCEL
              </button>
              <button 
                onClick={handleInvite}
                disabled={!inviteEmail || !selectedProjectId || isInviting}
                className="flex-[2] py-3 bg-white text-black hover:bg-electric-400 rounded-xl text-xs font-bold transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                {isInviting ? 'INVITING...' : 'SEND INVITATION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SharedProject {
  id: string;
  project_id: string;
  project_name: string;
  owner_name: string;
  role: 'viewer' | 'editor' | 'admin';
  shared_at: string;
}

export default function CollaborationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-electric-400" />
      </div>
    }>
      <CollaborationContent />
    </Suspense>
  );
}
