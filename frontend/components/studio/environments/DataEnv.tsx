'use client';

import { Database, Box, Table as TableIcon, Upload, RefreshCw, Filter } from 'lucide-react';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';
import { useEffect, useState } from 'react';

export default function DataEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { initialize, execute, isInitializing, isReady, data: toolData } = useTool({ tool, projectId });
  const [activeDataset, setActiveDataset] = useState<any>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const loadMockData = async () => {
    try {
        const result = await execute('upload_mock', {});
        setActiveDataset(result);
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[80vh] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-electric-400" />
                Data Studio
            </h2>
            <p className="text-sm text-slate-400">Manage, query, and analyze your datasets.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={loadMockData}
                className="flex items-center gap-2 px-4 py-2 bg-onyx-800 hover:bg-onyx-700 text-white rounded-lg border border-onyx-700 transition"
            >
                <Upload className="w-4 h-4" /> Load Sample Data
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-electric-600 hover:bg-electric-500 text-white rounded-lg transition shadow-lg shadow-electric-500/20">
                <TableIcon className="w-4 h-4" /> New Query
            </button>
        </div>
      </div>
      
      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Sidebar: Dataset List */}
        <div className="col-span-3 bg-onyx-900/50 border border-onyx-800 rounded-xl p-4 flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Datasets</h3>
            <div className="space-y-2 overflow-y-auto flex-1">
                {activeDataset ? (
                    <div className="p-3 bg-electric-500/10 border border-electric-500/20 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3 mb-1">
                            <Box className="w-4 h-4 text-electric-400" />
                            <span className="text-sm font-medium text-white">{activeDataset.dataset_id}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>{activeDataset.rows} rows</span>
                            <span>{activeDataset.columns.length} cols</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        No datasets loaded.
                    </div>
                )}
            </div>
        </div>

        {/* Main Content: Data Grid */}
        <div className="col-span-9 bg-onyx-900/50 border border-onyx-800 rounded-xl flex flex-col overflow-hidden">
            {activeDataset ? (
                <>
                    <div className="p-4 border-b border-onyx-800 flex items-center justify-between bg-onyx-900">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-mono text-slate-300">SELECT * FROM {activeDataset.dataset_id} LIMIT 5</span>
                        </div>
                        <div className="flex gap-2">
                             <button className="p-1.5 hover:bg-onyx-800 rounded text-slate-400"><RefreshCw className="w-4 h-4" /></button>
                             <button className="p-1.5 hover:bg-onyx-800 rounded text-slate-400"><Filter className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-onyx-950 sticky top-0 z-10">
                                <tr>
                                    {activeDataset.columns.map((col: string) => (
                                        <th key={col} className="px-4 py-3 font-medium text-slate-400 border-b border-onyx-800">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-onyx-800/50">
                                {activeDataset.preview.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-onyx-800/50 transition-colors">
                                        {activeDataset.columns.map((col: string) => (
                                            <td key={`${i}-${col}`} className="px-4 py-2.5 text-slate-300 border-r border-onyx-800/30 last:border-0">
                                                {row[col]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-2 border-t border-onyx-800 bg-onyx-950 text-xs text-slate-500 flex justify-between px-4">
                        <span>Showing 5 of {activeDataset.rows} rows</span>
                        <span>{((activeDataset.rows * activeDataset.columns.length * 8) / 1024).toFixed(2)} KB estimated</span>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <TableIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p>Select or upload a dataset to view contents</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
