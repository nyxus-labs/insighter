'use client';

import { Activity, RefreshCw } from 'lucide-react';
import { CyberChart } from '@/components/ui/Charts';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';
import { useEffect, useState } from 'react';

export default function ExperimentsEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { initialize, execute, isInitializing, isReady } = useTool({ tool, projectId });
  const [runs, setRuns] = useState<any[]>([]);

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

  const performanceData = runs.map(r => ({
    name: r.name.split('_')[1],
    value: r.metrics.accuracy
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-electric-400" />
            Model Performance
          </h2>
          <div className="flex gap-2 items-center">
            <button onClick={fetchRuns} className="p-2 hover:bg-onyx-800 rounded-lg text-slate-400 transition">
                <RefreshCw className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-electric-600/20 text-electric-400 rounded-full text-xs font-bold border border-electric-600/30">
                Best: {Math.max(...(runs.map(r => r.metrics.accuracy) || [0])).toFixed(2)} Acc
            </span>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-onyx-800">
            <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Accuracy History</h3>
            {runs.length > 0 ? (
                <CyberChart data={performanceData} type="area" height={300} />
            ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-600">No run data available</div>
            )}
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-onyx-800 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Recent Runs</h3>
            
            {runs.map((run) => (
                <div key={run.id} className="p-4 bg-onyx-900/50 rounded-xl border border-onyx-800 hover:border-electric-600/30 transition group">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-bold text-sm group-hover:text-electric-400 transition">{run.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${run.status === 'RUNNING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {run.status}
                      </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>lr: {run.params.learning_rate.toFixed(3)}</span>
                      <span>depth: {run.params.max_depth}</span>
                  </div>
                  <div className="w-full bg-onyx-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-electric-600 h-full transition-all duration-500" style={{ width: `${run.metrics.accuracy * 100}%` }}></div>
                  </div>
                  <div className="text-right text-[10px] text-electric-400 mt-1">{run.metrics.accuracy.toFixed(3)}</div>
                </div>
            ))}
          </div>
      </div>
    </div>
  );
}
