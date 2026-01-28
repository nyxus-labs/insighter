'use client';

import { useState, useEffect } from 'react';
import { Rocket, Globe, RefreshCw, Loader2, AlertCircle, Activity, TerminalSquare } from 'lucide-react';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';

export default function DeploymentEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { initialize, execute, isInitializing, isReady, error } = useTool({ tool, projectId });
  const [deployments, setDeployments] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isReady) {
      loadData();
    }
  }, [isReady]);

  const loadData = async () => {
    try {
      const depData = await execute('get_deployments', {});
      if (depData.deployments) setDeployments(depData.deployments);
      
      const logData = await execute('get_logs', {});
      if (logData.logs) setLogs(logData.logs);
    } catch (e) {
      console.error(e);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-electric-400" />
        <p>Connecting to Kubernetes Cluster...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-400">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p>Cluster Connection Failed: {error}</p>
        <button onClick={initialize} className="mt-4 px-4 py-2 bg-onyx-800 rounded hover:bg-onyx-700 text-white transition">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-6 h-6 text-cyan-400" />
            Model Serving
          </h2>
          <div className="flex gap-2">
            <button 
                onClick={loadData}
                className="p-2 hover:bg-onyx-800 rounded-lg text-slate-400 transition"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
          </div>
      </div>

      <div className="flex gap-4 border-b border-onyx-800 mb-6">
        <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-4 text-sm font-bold transition border-b-2 ${
                activeTab === 'overview' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'
            }`}
        >
            Active Deployments
        </button>
        <button 
            onClick={() => setActiveTab('logs')}
            className={`pb-2 px-4 text-sm font-bold transition border-b-2 ${
                activeTab === 'logs' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'
            }`}
        >
            System Logs
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid gap-4">
            {deployments.map((dep: any) => (
                <div key={dep.id} className="glass-panel p-6 rounded-2xl border border-onyx-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${dep.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {dep.name}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                    dep.status === 'healthy' 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                }`}>
                                    {dep.status.toUpperCase()}
                                </span>
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                                <span>Model: <span className="text-slate-300">{dep.model}</span></span>
                                <span>Uptime: <span className="text-slate-300">{dep.uptime}</span></span>
                                <span>Latency: <span className="text-slate-300">{dep.latency_ms}ms</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pl-14 md:pl-0">
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Endpoint</div>
                            <div className="text-sm font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/50">
                                {dep.endpoint}
                            </div>
                        </div>
                        <a 
                            href={dep.endpoint} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-2 bg-onyx-800 hover:bg-cyan-600 text-slate-400 hover:text-white rounded-lg transition"
                        >
                            <Globe className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            ))}
            
            {deployments.length === 0 && (
                <div className="text-center py-12 text-slate-500">No active deployments found.</div>
            )}
        </div>
      ) : (
        <div className="glass-panel p-0 rounded-2xl border border-onyx-800 overflow-hidden bg-[#0d1117]">
            <div className="flex items-center justify-between px-4 py-2 bg-onyx-900 border-b border-onyx-800">
                <span className="text-xs font-mono text-slate-500 flex items-center gap-2">
                    <TerminalSquare className="w-4 h-4" /> k8s-cluster-logs
                </span>
            </div>
            <div className="p-4 font-mono text-xs space-y-1 h-[400px] overflow-y-auto">
                {logs.map((log, i) => (
                    <div key={i} className={`${log.includes('ERROR') ? 'text-red-400' : 'text-slate-400'}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
