'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Clock, LayoutGrid, MoreVertical, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { getFullName } from '@/utils/user';
import ProjectCreateModal from '@/components/dashboard/ProjectCreateModal';
import { createClient } from '@/utils/supabase/client';
import { CATEGORIES } from '@/lib/constants/tools';

export default function Dashboard() {
  const { user: userProfile, loading: userLoading } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const welcomeName = userLoading ? '...' : (userProfile ? getFullName(userProfile) : 'Commander');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/projects/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && userProfile) {
      fetchProjects();
    }
  }, [userLoading, userProfile]);

  const handleProjectCreated = (newProject: any) => {
    setProjects([newProject, ...projects]);
  };

  const handleCreateCategoryProject = async (category: string) => {
    try {
      setCreatingCategory(category);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/projects/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `New ${category} Project`,
          type: category,
          visibility: 'private',
          tags: [category.toLowerCase()]
        })
      });

      if (res.ok) {
        const newProject = await res.json();
        router.push(`/studio/${newProject.id}/workflow?category=${encodeURIComponent(category)}`);
      }
    } catch (e) {
      console.error(`Failed to create ${category} project`, e);
    } finally {
      setCreatingCategory(null);
    }
  };

  const getProjectsByCategory = (category: string) => {
    if (category === 'All') return [];
    return projects.filter(p => (p.type || 'General').toLowerCase() === category.toLowerCase());
  };

  const mainCategories = CATEGORIES.filter(c => c !== 'All');

  return (
    <>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 text-glow-subtle">Welcome back, <span className="text-electric-400">{welcomeName}</span></h1>
          <p className="text-slate-400 font-mono text-sm">System Status: <span className="text-neon-emerald">OPTIMAL</span> • {projects.length} Active Missions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-electric-600 hover:bg-electric-500 text-white px-6 py-3 rounded-full flex items-center gap-2 transition font-bold shadow-glow-cyan hover:shadow-glow-cyan-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> NEW PROJECT
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-electric-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-12">
          {mainCategories.map((category) => {
            const categoryProjects = getProjectsByCategory(category);
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center justify-between border-b border-onyx-800 pb-2">
                   <h2 className="text-2xl font-bold text-slate-200">{category}</h2>
                   <button
                     onClick={() => handleCreateCategoryProject(category)}
                     disabled={!!creatingCategory}
                     className="text-xs font-mono text-electric-400 hover:text-electric-300 border border-electric-900 bg-electric-500/10 px-3 py-1.5 rounded hover:bg-electric-500/20 transition flex items-center gap-2 disabled:opacity-50"
                   >
                     {creatingCategory === category ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                     ) : (
                        <Plus className="w-3 h-3" />
                     )}
                     NEW {category.toUpperCase()} PROJECT
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {categoryProjects.length > 0 ? (
                     categoryProjects.map((project) => (
                      <Link key={project.id} href={`/studio/${project.id}/workflow`} className="group block h-full">
                        <div className="glass-panel p-6 rounded-2xl border border-onyx-800 hover:border-electric-400/50 transition-all duration-300 relative h-full flex flex-col group-hover:-translate-y-1 group-hover:shadow-glow-cyan">
                          <div className="absolute inset-0 bg-gradient-to-br from-electric-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl"></div>
                          
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 bg-onyx-900 rounded-xl flex items-center justify-center text-electric-400 border border-onyx-800 group-hover:border-electric-400/30 group-hover:text-white group-hover:bg-electric-500 transition shadow-lg">
                              <LayoutGrid className="w-6 h-6" />
                            </div>
                            <div className="p-2 hover:bg-onyx-800 rounded-full transition cursor-pointer">
                                <MoreVertical className="w-4 h-4 text-slate-500 hover:text-white" />
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-xl text-slate-200 mb-2 group-hover:text-electric-400 transition relative z-10 truncate">{project.name}</h3>
                          <p className="text-slate-500 text-xs uppercase tracking-wider font-mono mb-6 relative z-10 border-l-2 border-onyx-700 pl-3 group-hover:border-electric-400 transition">
                            {project.type || 'General'}
                          </p>
                          
                          <div className="mt-auto pt-4 border-t border-onyx-800/50 flex items-center text-xs text-slate-500 gap-2 font-mono relative z-10">
                            <Clock className="w-3 h-3 text-neon-blue" /> {new Date(project.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center border border-dashed border-onyx-800 rounded-xl bg-onyx-900/30">
                        <p className="text-slate-500 text-sm">No active missions in this sector.</p>
                        <button 
                           onClick={() => handleCreateCategoryProject(category)}
                           className="mt-2 text-electric-400 hover:text-electric-300 text-xs font-bold uppercase tracking-wide"
                        >
                            Initialize First Project
                        </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <ProjectCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </>
  );
}
