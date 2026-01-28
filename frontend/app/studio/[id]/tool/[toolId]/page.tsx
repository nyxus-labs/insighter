import { ToolRenderer } from '@/lib/tools/registry';
import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';
import { TOOLS } from '@/lib/constants/tools';
import React from 'react';
import { notFound } from 'next/navigation';

export default function ToolPage({ params }: { params: Promise<{ id: string; toolId: string }> }) {
  const { id, toolId } = React.use(params);
  const tool = TOOLS.find(t => t.id === toolId);

  if (!tool) {
    notFound();
  }

  // Create a serializable version of the tool object (excluding the icon component)
  // to pass to the client component.
  const { icon, ...serializableTool } = tool;

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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-onyx-900 border border-onyx-800">
                <div className="w-2 h-2 rounded-full bg-electric-400 animate-pulse"></div>
                <span className="text-xs font-medium text-slate-400">Environment Active</span>
            </div>
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
