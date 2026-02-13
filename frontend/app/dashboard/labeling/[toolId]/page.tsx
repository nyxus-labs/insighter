'use client';

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { TOOLS } from '@/lib/constants/tools';
import { ToolRenderer } from '@/lib/tools/registry';
import { ArrowLeft, Tag, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { getFullName } from '@/utils/user';

export default function LabelingToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = React.use(params);
  const { user: profile } = useUser();
  const tool = TOOLS.find(t => t.id === toolId);

  if (!tool || tool.category !== 'Labeling') {
    notFound();
  }

  // Use a default project ID for dashboard-level labeling if none is specific
  const defaultProjectId = 'global-labeling-workspace';

  const { icon: Icon, ...serializableTool } = tool;

  return (
    <div className="min-h-screen bg-[#080808] text-slate-300 flex flex-col">
      {/* Tool Header */}
      <header className="h-16 border-b border-onyx-800 bg-onyx-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/labeling" className="p-2 hover:bg-onyx-800 rounded-lg transition text-slate-500 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Icon className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">
                {tool.name} <span className="text-slate-500 font-normal ml-2">Annotation Environment</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                SECURE_SESSION: <span className="text-orange-400">{toolId.toUpperCase()}_PROD_01</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-onyx-900 border border-onyx-800">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Engine</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-onyx-800 border border-onyx-700 flex items-center justify-center text-[10px] font-bold text-white">
            {profile ? getFullName(profile).charAt(0) : 'U'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <ToolRenderer tool={serializableTool} projectId={defaultProjectId} />
      </main>
    </div>
  );
}
