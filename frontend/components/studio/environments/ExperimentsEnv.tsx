'use client';

import { Activity, RefreshCw, BarChart2, Beaker, Play, Settings, Filter, Download, Plus, ChevronRight, Info } from 'lucide-react';
import { CyberChart } from '@/components/ui/Charts';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';
import { useEffect, useState, useMemo } from 'react';

export default function ExperimentsEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { initialize, execute, isInitializing, isReady } = useTool({ tool, projectId });
  const [runs, setRuns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'charts' | 'table' | 'hyperparams'>('charts');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isReady) {
        fetchRuns();
    }
  }, [isReady]);

  const fetchRuns = async () => {
    try {
        const data = await execute('get_runs', {});
        if (data.runs) setRuns(data.runs);
    } catch (e) {
        console.error(e);
    }
  };

  const handleNewRun = async () => {
    try {
      await execute('create_run', { name: `Experiment_${Date.now()}` });
      fetchRuns();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRuns = useMemo(() => {
    return runs.filter(run => 
      run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [runs, searchQuery]);

  const performanceData = runs.map(r => ({
    name: r.name.split('_')[1] || r.name,
    value: r.metrics.accuracy
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Native-like Header/Toolbar */}
      <div className="h-14 border-b border-onyx-800 flex items-center justify-between px-6 bg-onyx-950/50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-electric-500/10 rounded-lg">
            <Beaker className="w-5 h-5 text-electric-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Experiment Tracker</h2>
            <p className="text-[10px] text-slate-500 font-mono">PROJECT_ID: {projectId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Filter runs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-onyx-900 border border-onyx-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-electric-500/50 w-64 transition-all"
            />
          </div>
          <button onClick={fetchRuns} className="p-2 hover:bg-onyx-800 rounded-lg text-slate-400 transition" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNewRun}
            className="flex items-center gap-2 px-3 py-1.5 bg-electric-500 hover:bg-electric-400 text-black text-xs font-bold rounded-lg transition ml-2"
          >
            <Plus className="w-4 h-4" /> NEW RUN
          </button>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (MLflow/Weights & Biases style) */}
        <div className="w-64 border-r border-onyx-800 bg-onyx-950/30 flex flex-col">
          <div className="p-4 space-y-1">
            <button 
              onClick={() => setActiveTab('charts')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'charts' ? 'bg-electric-500/10 text-electric-400' : 'text-slate-400 hover:bg-onyx-800'
              }`}
            >
              <Activity className="w-4 h-4" /> Visualizations
            </button>
            <button 
              onClick={() => setActiveTab('table')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'table' ? 'bg-electric-500/10 text-electric-400' : 'text-slate-400 hover:bg-onyx-800'
              }`}
            >
              <BarChart2 className="w-4 h-4" /> Run Table
            </button>
            <button 
              onClick={() => setActiveTab('hyperparams')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'hyperparams' ? 'bg-electric-500/10 text-electric-400' : 'text-slate-400 hover:bg-onyx-800'
              }`}
            >
              <Settings className="w-4 h-4" /> Hyperparameters
            </button>
          </div>

          <div className="mt-auto p-4 border-t border-onyx-800">
            <div className="bg-onyx-900/50 rounded-lg p-3 border border-onyx-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Best Accuracy</span>
                <Info className="w-3 h-3 text-slate-600" />
              </div>
              <div className="text-xl font-mono text-emerald-400">
                {(Math.max(...(runs.map(r => r.metrics.accuracy) || [0])) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Workspace */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#080808]">
          {activeTab === 'charts' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-onyx-800 bg-onyx-950/40">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Training Accuracy</h3>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-electric-400"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    </div>
                  </div>
                  {runs.length > 0 ? (
                    <CyberChart data={performanceData} type="area" height={250} />
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-slate-600 font-mono text-xs">NO_RUN_DATA_AVAILABLE</div>
                  )}
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-onyx-800 bg-onyx-950/40">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Metric Comparison</h3>
                    <Download className="w-4 h-4 text-slate-600 cursor-pointer hover:text-slate-400" />
                  </div>
                  {runs.length > 0 ? (
                    <CyberChart data={performanceData} type="area" height={250} />
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-slate-600 font-mono text-xs">NO_RUN_DATA_AVAILABLE</div>
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-2xl border border-onyx-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-onyx-800 bg-onyx-900/30 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Experiments</h3>
                  <span className="text-[10px] text-slate-500">{filteredRuns.length} runs found</span>
                </div>
                <div className="divide-y divide-onyx-800">
                  {filteredRuns.map((run) => (
                    <div key={run.id} className="p-4 hover:bg-onyx-800/30 transition flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${run.status === 'RUNNING' ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-electric-400 transition">{run.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {run.id.slice(0, 8)} • {new Date().toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Accuracy</div>
                          <div className="text-sm font-mono text-emerald-400">{(run.metrics.accuracy * 100).toFixed(2)}%</div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Learning Rate</div>
                          <div className="text-sm font-mono text-slate-300">{run.params.learning_rate}</div>
                        </div>
                        <button className="p-2 text-slate-600 hover:text-white transition">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'table' && (
            <div className="max-w-6xl mx-auto glass-panel rounded-2xl border border-onyx-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-onyx-900/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 border-b border-onyx-800">Run Name</th>
                    <th className="px-6 py-4 border-b border-onyx-800">Status</th>
                    <th className="px-6 py-4 border-b border-onyx-800">Accuracy</th>
                    <th className="px-6 py-4 border-b border-onyx-800">Loss</th>
                    <th className="px-6 py-4 border-b border-onyx-800">Duration</th>
                    <th className="px-6 py-4 border-b border-onyx-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-300 divide-y divide-onyx-800">
                  {filteredRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-onyx-800/20 transition group">
                      <td className="px-6 py-4 font-bold text-white group-hover:text-electric-400">{run.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          run.status === 'RUNNING' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-emerald-400">{run.metrics.accuracy.toFixed(4)}</td>
                      <td className="px-6 py-4 font-mono text-red-400">0.2412</td>
                      <td className="px-6 py-4 text-slate-500">12m 45s</td>
                      <td className="px-6 py-4">
                        <button className="text-slate-500 hover:text-white transition">
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'hyperparams' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {runs.slice(0, 4).map((run) => (
                  <div key={run.id} className="glass-panel p-6 rounded-2xl border border-onyx-800 bg-onyx-950/40">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-electric-400" />
                      {run.name} Config
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(run.params).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-mono">{key}</span>
                          <span className="text-slate-300 font-bold bg-onyx-900 px-2 py-0.5 rounded border border-onyx-800">{value.toString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
