'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight,
  Search, 
  Zap, 
  Activity, 
  Database, 
  Cpu, 
  BarChart2, 
  Layers,
  ChevronRight,
  Plus,
  Settings,
  Terminal,
  Play
} from 'lucide-react';
import { ROLES, RoleConfig } from '@/lib/constants/roles';
import { TOOLS, Tool } from '@/lib/constants/tools';
import { useUser } from '@/contexts/UserContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function WorkspaceLandingPage() {
  const params = useParams();
  const rawRole = params?.role as string;
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<RoleConfig | null>(null);

  // Normalize role ID (e.g., "data-science" -> "data-scientist")
  const normalizedRole = rawRole?.toLowerCase() === 'data-science' ? 'data-scientist' : rawRole;

  useEffect(() => {
    // If normalizedRole is not set yet, don't do anything
    if (!normalizedRole) return;
    
    // Find the role configuration based on the URL parameter
    const role = ROLES.find(r => r.id === normalizedRole);
    if (!role) {
      // If role not found, show error and redirect to dashboard
      toast.error(`Workspace for "${rawRole}" not found`);
      router.push('/dashboard');
      return;
    }
    // Successfully found role, update state and stop loading
    setCurrentRole(role);
    setIsLoading(false);
  }, [normalizedRole, rawRole, router]);

  /**
   * handleStartMission initializes a new project/mission for the current workspace.
   * It includes retry logic with exponential backoff for handling transient errors.
   * 
   * @param retryCountArg - Current retry attempt number (0 for first attempt)
   */
  const handleStartMission = async (retryCountArg: any = 0) => {
    if (!currentRole) return;
    
    // Ensure retryCount is a number (sometimes Event objects or others might be passed from onClick)
    const retryCount = typeof retryCountArg === 'number' ? retryCountArg : 0;
    
    const MAX_RETRIES = 3;
    const INITIAL_BACKOFF = 1000; // 1 second

    try {
      // Input Validation before API call
      if (!currentRole.defaultProjectName || currentRole.defaultProjectName.trim() === "") {
        throw new Error('Project name is invalid in role configuration');
      }

      if (!currentRole.id) {
        throw new Error('Role ID is missing');
      }

      // Only show main loading state on first attempt to avoid UI flickering during retries
      if (retryCount === 0) setIsLoading(true);
      
      console.log(`[WorkspaceInit] Starting mission for role: ${currentRole.id}, Attempt: ${retryCount + 1}`);

      // API call to create new project
      const res = await api.post('/api/projects/', {
        name: currentRole.defaultProjectName,
        type: currentRole.id,
        visibility: 'private',
        tags: [currentRole.id, 'workspace-init']
      });

      if (res.status === 200 || res.status === 201) {
        const newProject = res.data;
        console.log(`[WorkspaceInit] Mission created successfully: ${newProject.id}`);
        toast.success(`Mission Started: ${currentRole.defaultProjectName}`);
        // Navigate to the newly created project workflow
        router.push(`/studio/${newProject.id}/workflow?role=${currentRole.id}`);
      }
    } catch (e: any) {
      console.error(`[WorkspaceInit] Failed to start mission (attempt ${retryCount + 1}):`, e);
      
      const isNetworkError = !e.response;
      const isServerError = e.response?.status >= 500;
      const isAuthError = e.response?.status === 401;
      const isValidationError = e.response?.status === 400;

      // Log detailed error context
      if (isNetworkError) {
        console.error('[WorkspaceInit] CRITICAL: Network connection failure. Check API status, CORS, or BASE_URL.');
      } else if (isAuthError) {
        console.error('[WorkspaceInit] AUTH ERROR: Session expired or invalid.');
      } else if (isServerError) {
        console.error('[WorkspaceInit] SERVER ERROR:', e.response?.data?.detail || 'Internal server error');
      }

      // Retry Logic: Only retry on transient errors (Network or 5xx)
      const shouldRetry = (isNetworkError || isServerError) && retryCount < MAX_RETRIES;

      if (shouldRetry) {
        const backoffTime = INITIAL_BACKOFF * Math.pow(2, retryCount);
        toast.loading(`Connection issue. Retrying in ${backoffTime/1000}s... (Attempt ${retryCount + 1}/${MAX_RETRIES})`, {
          id: 'init-retry',
          duration: backoffTime
        });
        
        setTimeout(() => {
          handleStartMission(retryCount + 1);
        }, backoffTime);
        return;
      }

      // Fallback/Final Error Handling
      toast.dismiss('init-retry');
      let errorMessage = 'Failed to initialize workspace project';
      
      if (e.response?.data?.detail) {
        errorMessage = e.response.data.detail;
      } else if (isNetworkError) {
        errorMessage = 'Could not reach the server. Please check your connection.';
      } else if (isAuthError) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (isValidationError) {
        errorMessage = 'Invalid project configuration. Please contact support.';
      }

      toast.error(errorMessage, {
        description: 'If the problem persists, try logging out and back in.',
        duration: 5000,
        action: {
          label: 'Retry Manually',
          onClick: () => handleStartMission(0)
        }
      });
    } finally {
      // Only stop loading if we're not retrying
      if (retryCount >= MAX_RETRIES || !isLoading) {
        setIsLoading(false);
      }
    }
  };

  if (isLoading || !currentRole) {
    return (
      <div className="min-h-screen bg-onyx-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-electric-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-mono animate-pulse">Initializing {rawRole || 'Workspace'}...</p>
        </div>
      </div>
    );
  }

  const Icon = currentRole.icon;
  const roleTools = TOOLS.filter(t => currentRole.tools.includes(t.id));

  return (
    <div className="min-h-screen bg-onyx-950 text-slate-300 font-sans selection:bg-electric-400/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-800/50 bg-slate-900/20">
        <div className="absolute inset-0 bg-cyber-grid opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-electric-400/10 blur-[100px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="flex justify-between items-center mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-mono text-sm uppercase tracking-widest">Return to Command Center</span>
            </Link>

            <div className="flex gap-2">
              {ROLES.map((r) => (
                <Link 
                  key={r.id} 
                  href={`/workspaces/${r.id}`}
                  className={`p-2 rounded-lg border transition-all ${r.id === currentRole.id ? 'bg-electric-400/10 border-electric-400 text-electric-400' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
                  title={r.title}
                >
                  <r.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentRole.color} shadow-lg shadow-electric-400/20`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <Badge variant="outline" className="border-electric-400/50 text-electric-400 mb-1 font-mono">WORKSPACE ACTIVE</Badge>
                  <h1 className="text-5xl font-black text-white tracking-tighter">{currentRole.title}</h1>
                </div>
              </div>
              <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                {currentRole.description}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  onClick={handleStartMission}
                  size="lg" 
                  className="bg-electric-400 hover:bg-electric-500 text-black font-bold h-14 px-8 rounded-xl transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Initialize New Mission
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-slate-700 hover:border-slate-500 h-14 px-8 rounded-xl font-bold bg-slate-900/50"
                >
                  <Settings className="w-5 h-5 mr-2 text-slate-400" />
                  Workspace Settings
                </Button>
              </div>
            </div>

            <div className="lg:w-96 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-electric-400" />
                Suggested Protocols
              </h3>
              <div className="space-y-4">
                {currentRole.suggestedTasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer group">
                    <div className="mt-1 w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-electric-400 group-hover:text-black transition-colors">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Integrated Toolset</h2>
            <p className="text-slate-500 mt-1">Specialized environment optimized for {currentRole.title} workflows</p>
          </div>
          <Button variant="ghost" className="text-electric-400 hover:text-electric-300 hover:bg-electric-400/10">
            View All Tools <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleTools.map((tool) => (
            <div key={tool.id} className="group relative bg-slate-900/30 border border-slate-800 hover:border-electric-400/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-electric-400/5 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <tool.icon className="w-20 h-20" />
              </div>
              
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-electric-400/30 transition-colors ${tool.iconColor || 'text-electric-400'}`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg group-hover:text-electric-400 transition-colors">{tool.name}</h4>
                  <Badge variant="secondary" className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-widest px-2 py-0 mt-1">
                    {tool.category}
                  </Badge>
                </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                {tool.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Operational</span>
                </div>
                <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-bold hover:text-white group-hover:translate-x-1 transition-transform">
                  Launch <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Projects Placeholder */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-slate-900/20 border border-slate-800/50 rounded-[32px] p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/50"></div>
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-slate-950 rounded-3xl border border-slate-800 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Terminal className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Mission Control Readiness</h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Your workspace is ready for deployment. Start a new mission to begin tracking tasks, 
              managing datasets, and building models specifically for your {currentRole.title} role.
            </p>
            <div className="pt-4">
              <Button 
                onClick={handleStartMission}
                className="bg-white text-black hover:bg-slate-200 font-black h-14 px-12 rounded-2xl transition-all hover:scale-105"
              >
                Launch Protocol <Zap className="w-5 h-5 ml-2 fill-current" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
