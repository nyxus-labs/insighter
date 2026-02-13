'use client';

import { useState, useEffect } from 'react';
import { Rocket, Globe, RefreshCw, Loader2, AlertCircle, Activity, TerminalSquare, Shield, Cpu, Zap, Search, Filter, Play, StopCircle, ChevronRight, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';

export default function DeploymentEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { initialize, execute, isInitializing, isReady, error } = useTool({ tool, projectId });
  const [deployments, setDeployments] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'monitoring'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleDeploy = async () => {
    try {
      await execute('create_deployment', { model_id: 'churn-v1', cpu: '1', memory: '2Gi' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDeployments = deployments.filter(dep => 
    dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dep.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-onyx-950">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-cyan-400" />
        <p className="text-xs font-bold uppercase tracking-widest">Connecting to Kubernetes Cluster...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 bg-onyx-950">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p className="font-bold">Cluster Connection Failed</p>
        <p className="text-xs text-slate-500 mt-2 font-mono">{error}</p>
        <button onClick={initialize} className="mt-6 px-6 py-2 bg-onyx-900 border border-onyx-800 rounded-xl hover:bg-onyx-800 transition text-xs font-bold">RETRY HANDSHAKE</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#080808]">
      {/* Native-like Header */}
      <div className="h-16 border-b border-onyx-800 flex items-center justify-between px-8 bg-onyx-950/50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl">
            <Rocket className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Deployment Manager</h2>
            <p className="text-[10px] text-slate-500 font-mono">CLUSTER: <span className="text-cyan-400">AWS-EKS-PROD-01</span></p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Filter endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-onyx-900 border border-onyx-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 w-64 transition-all"
            />
          </div>
          <button onClick={loadData} className="p-2 hover:bg-onyx-800 rounded-lg text-slate-400 transition" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDeploy}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl transition shadow-lg shadow-cyan-500/10"
          >
            <Zap className="w-4 h-4" /> DEPLOY MODEL
          </button>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="h-12 border-b border-onyx-800 flex items-center px-8 bg-onyx-950/30 gap-8">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`h-full text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'overview' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Endpoints
        </button>
        <button 
          onClick={() => setActiveTab('monitoring')}
          className={`h-full text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'monitoring' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Monitoring
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`h-full text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'logs' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Logs
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-onyx-800 text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-onyx-800 text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-y-auto bg-[#050505]">
        {activeTab === 'overview' && (
          <div className="p-8 max-w-7xl mx-auto">
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeployments.map((dep: any) => (
                  <div key={dep.id} className="glass-panel rounded-2xl border border-onyx-800 bg-onyx-950/40 hover:border-cyan-500/30 transition-all group overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2.5 rounded-xl ${dep.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                            dep.status === 'healthy' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          }`}>
                            {dep.status.toUpperCase()}
                          </span>
                          <button className="p-1 text-slate-600 hover:text-white transition">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-white font-bold group-hover:text-cyan-400 transition">{dep.name}</h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 mb-6">{dep.model} v1.4.2</p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-onyx-900/50 p-2 rounded-lg border border-onyx-800/50">
                          <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Latency</div>
                          <div className="text-xs font-mono text-cyan-400">{dep.latency_ms}ms</div>
                        </div>
                        <div className="bg-onyx-900/50 p-2 rounded-lg border border-onyx-800/50">
                          <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Traffic</div>
                          <div className="text-xs font-mono text-emerald-400">124 req/s</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-[10px] font-mono text-slate-500 truncate bg-black/40 px-2 py-1 rounded">
                          {dep.endpoint}
                        </div>
                        <button className="p-1.5 bg-onyx-800 hover:bg-cyan-500 text-slate-400 hover:text-black rounded transition">
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl border border-onyx-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-onyx-900/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Endpoint Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Latency</th>
                      <th className="px-6 py-4">Throughput</th>
                      <th className="px-6 py-4">Uptime</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-300 divide-y divide-onyx-800">
                    {filteredDeployments.map((dep: any) => (
                      <tr key={dep.id} className="hover:bg-onyx-800/20 transition group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white group-hover:text-cyan-400">{dep.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{dep.model}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-[10px] font-bold ${dep.status === 'healthy' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${dep.status === 'healthy' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                            {dep.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-cyan-400">{dep.latency_ms}ms</td>
                        <td className="px-6 py-4 font-mono">1.2k rps</td>
                        <td className="px-6 py-4 text-slate-500">{dep.uptime}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1.5 text-slate-600 hover:text-white transition">
                            <StopCircle className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="h-full flex flex-col p-8">
            <div className="flex-1 glass-panel rounded-2xl border border-onyx-800 overflow-hidden bg-[#0d1117] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-3 bg-onyx-900 border-b border-onyx-800">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-2">
                    <TerminalSquare className="w-4 h-4 text-cyan-400" /> production-k8s-logs
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Streaming
                  </div>
                  <button className="p-1.5 hover:bg-onyx-800 rounded text-slate-500 transition"><RefreshCw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex-1 p-6 font-mono text-xs space-y-1.5 overflow-y-auto custom-scrollbar">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-onyx-700 select-none min-w-[30px]">{i + 1}</span>
                    <span className={`${log.includes('ERROR') ? 'text-red-400 bg-red-400/5 px-1' : log.includes('WARN') ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'CPU Usage', value: '42.4%', icon: Cpu, color: 'text-cyan-400' },
                { label: 'Memory Usage', value: '8.2GB', icon: LayoutGrid, color: 'text-purple-400' },
                { label: 'Error Rate', value: '0.04%', icon: AlertCircle, color: 'text-red-400' },
                { label: 'Security Score', value: '98/100', icon: Shield, color: 'text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-onyx-800 bg-onyx-950/40">
                  <div className="flex justify-between items-start mb-4">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Live</span>
                  </div>
                  <div className="text-2xl font-mono text-white mb-1">{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="glass-panel p-8 rounded-2xl border border-onyx-800 bg-onyx-950/40 h-64 flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-onyx-800 mx-auto mb-4" />
                <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">Real-time Telemetry Data Incoming...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
