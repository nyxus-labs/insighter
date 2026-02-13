'use client';

import { ToolRenderer } from '@/lib/tools/registry';
import { ArrowLeft, ArrowRight, Construction, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { TOOLS } from '@/lib/constants/tools';
import { ROLES } from '@/lib/constants/roles';
import React, { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useProjectState } from '@/lib/contexts/ProjectStateContext';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function ToolPage({ params }: { params: Promise<{ id: string; toolId: string }> }) {
  const router = useRouter();
  const { id, toolId } = React.use(params);
  const tool = TOOLS.find(t => t.id === toolId);
  const { state, setActiveTool, setProjectId, setWorkflow } = useProjectState();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [projectType, setProjectType] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const res = await api.get(`/api/projects/${id}`);
        const project = res.data;
        setProjectType(project.type);
        
        // Find role config
        const role = ROLES.find(r => r.id === project.type.toLowerCase().replace(' ', '-'));
        
        if (role) {
          // Check if tool is in role's allowed tools
          const allowed = role.tools.includes(toolId);
          setIsAuthorized(allowed);
        } else {
          // If no specific role mapping, allow for now but log
          console.warn(`No role mapping found for project type: ${project.type}`);
          setIsAuthorized(true);
        }
      } catch (e) {
        console.error("Failed to verify project access", e);
        setIsAuthorized(false);
      }
    };

    if (tool) {
      checkAuthorization();
    }
  }, [id, toolId, tool]);

  const categoryTools = React.useMemo(() => {
    if (!tool) return [];
    return TOOLS.filter(t => t.category === tool.category).map(t => t.id);
  }, [tool]);

  useEffect(() => {
    if (tool) {
      setActiveTool(toolId);
      setProjectId(id);
      
      // Only update workflow if it's empty or doesn't contain the current tool
      if (state.workflow.length === 0 || !state.workflow.includes(toolId)) {
        setWorkflow(categoryTools);
      }
    }
  }, [toolId, id, tool, setActiveTool, setProjectId, setWorkflow, state.workflow.length, state.workflow.includes(toolId), categoryTools]);

  if (!tool) {
    notFound();
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-onyx-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-slate-400 max-w-md mb-8">
          The tool <strong>{tool.name}</strong> is not authorized for your current workspace role ({projectType}). 
          Please contact your administrator or switch to an appropriate mission.
        </p>
        <Link href={`/studio/${id}/workflow`}>
          <Button className="bg-onyx-800 hover:bg-onyx-700 text-white">
            <ArrowLeft className="mr-2 w-4 h-4" /> Return to Workflow
          </Button>
        </Link>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-onyx-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-mono text-sm">Verifying Security Protocol...</p>
      </div>
    );
  }

  // Determine next tool based on workflow state
  const currentWorkflow = state.workflow.length > 0 
    ? state.workflow 
    : TOOLS.filter(t => t.category === tool.category).map(t => t.id);
    
  const currentIndex = currentWorkflow.indexOf(toolId);
  const nextToolId = currentIndex >= 0 && currentIndex < currentWorkflow.length - 1 
    ? currentWorkflow[currentIndex + 1] 
    : null;
    
  const nextTool = nextToolId ? TOOLS.find(t => t.id === nextToolId) : null;

  // Create a serializable version of the tool object (excluding the icon component)
  const { icon, ...serializableTool } = tool;

  const handleNext = () => {
    if (nextTool) {
      router.push(`/studio/${id}/tool/${nextTool.id}`);
    } else {
      router.push(`/studio/${id}/workflow`);
    }
  };

  return (
    <div className="min-h-screen bg-onyx-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
       {/* Background Effect */}
       <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-5 fixed"></div>
 
       {/* Header */}
       <header className="h-16 border-b border-onyx-800 bg-onyx-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
         <div className="flex items-center gap-4">
           <Link href={`/studio/${id}/workflow`} className="p-2 hover:bg-onyx-800 rounded-lg transition text-slate-500 hover:text-white">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg bg-onyx-800 border border-onyx-700`}>
                 <tool.icon className={`w-5 h-5 ${tool.iconColor || 'text-slate-400'}`} />
              </div>
              <h1 className="text-xl font-bold text-white">
                 {tool.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-xs bg-onyx-800 text-slate-500 border border-onyx-700">
                {tool.version || 'v1.0.0'}
              </span>
           </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-onyx-900 border border-onyx-800 mr-2">
                <div className="w-2 h-2 rounded-full bg-electric-400 animate-pulse"></div>
                <span className="text-xs font-medium text-slate-400">Environment Active</span>
            </div>
            
            <Button 
              onClick={handleNext}
              className="bg-electric-500 hover:bg-electric-600 text-white font-semibold shadow-lg shadow-electric-500/20"
            >
              {nextTool ? (
                <>
                  Next: {nextTool.name}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  Finish Workflow
                  <CheckCircle2 className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
         </div>
       </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 relative z-10">
        <ToolRenderer tool={serializableTool} projectId={id} />
        
        {/* Fallback for unconfigured environments */}
         { !['notebook', 'data', 'experiment', 'labeling', 'deployment', 'settings'].includes(tool.environmentType) && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <div className="w-16 h-16 bg-onyx-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-onyx-900/50">
              <Construction className="w-8 h-8 text-electric-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Environment Not Ready</h3>
            <p className="text-slate-400 max-w-md mb-8">
              The environment for <span className="text-white font-medium">{tool.name}</span> is currently under development or not configured.
            </p>
            <Link 
              href={`/studio/${id}/workflow`}
              className="px-6 py-2.5 bg-onyx-800 hover:bg-onyx-700 text-slate-300 hover:text-white rounded-lg transition border border-onyx-700 hover:border-onyx-600 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Workflow
            </Link>
          </div>
        )}
       </main>
    </div>
  );
}
