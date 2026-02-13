'use client';

import { 
  Database, 
  Box, 
  Table as TableIcon, 
  Upload, 
  RefreshCw, 
  Filter, 
  Search, 
  Download, 
  Plus, 
  Play,
  ChevronRight, 
  ChevronDown, 
  Columns, 
  Hash, 
  Type, 
  Calendar, 
  Code2, 
  Layout, 
  Settings2,
  MoreHorizontal
} from 'lucide-react';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';
import { useEffect, useState, useMemo } from 'react';
import CodeEditor from '@/components/ui/CodeEditor';

export default function DataEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { initialize, execute, isInitializing, isReady, data: toolData } = useTool({ tool, projectId });
  const [activeDataset, setActiveDataset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'query'>('preview');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM active_dataset LIMIT 100;');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredPreview = useMemo(() => {
    if (!activeDataset || !searchQuery) return activeDataset?.preview || [];
    return activeDataset.preview.filter((row: any) => 
        Object.values(row).some(val => 
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [activeDataset, searchQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[#0a0a0a] border border-onyx-800 rounded-2xl overflow-hidden">
      {/* Top Header / Breadcrumbs */}
      <div className="h-12 bg-onyx-900 border-b border-onyx-800 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Database className="w-4 h-4 text-electric-400" />
          <span className="text-slate-500">Explorer</span>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className="text-slate-300 font-medium">{activeDataset?.dataset_id || 'No Dataset Selected'}</span>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={loadMockData}
                className="flex items-center gap-1.5 px-3 py-1 bg-electric-500 hover:bg-electric-400 text-black text-[10px] font-bold rounded transition shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            >
                <Plus className="w-3 h-3" /> IMPORT DATA
            </button>
            <div className="w-px h-4 bg-onyx-800 mx-1"></div>
            <button 
                onClick={() => alert('Data settings coming soon!')}
                className="p-1.5 hover:bg-onyx-800 rounded text-slate-500 transition"
            >
                <Settings2 className="w-3.5 h-3.5" />
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Schema Explorer */}
        <div className="w-64 bg-onyx-950 border-r border-onyx-800 flex flex-col">
          <div className="p-3 border-b border-onyx-800 flex items-center justify-between bg-onyx-900/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Database Navigator</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-onyx-900 rounded cursor-pointer transition">
                <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                <Database className="w-3.5 h-3.5 text-electric-400" />
                <span className="font-medium">PUBLIC_DB</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400 hover:bg-onyx-900 rounded cursor-pointer transition">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                  <Layout className="w-3.5 h-3.5 text-neon-violet" />
                  <span>Tables</span>
                </div>
                {activeDataset && (
                  <div className="ml-6 flex items-center gap-2 px-2 py-1 text-[11px] text-electric-400 bg-electric-400/5 border-l border-electric-400 rounded-r transition">
                    <TableIcon className="w-3 h-3" />
                    <span>{activeDataset.dataset_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="h-10 bg-onyx-900/50 border-b border-onyx-800 flex items-center px-4 gap-6">
            <button 
                onClick={() => setActiveTab('preview')}
                className={`h-full text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === 'preview' ? 'border-electric-400 text-electric-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
            >
                Data Preview
            </button>
            <button 
                onClick={() => setActiveTab('schema')}
                className={`h-full text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === 'schema' ? 'border-electric-400 text-electric-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
            >
                Schema Info
            </button>
            <button 
                onClick={() => setActiveTab('query')}
                className={`h-full text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === 'query' ? 'border-electric-400 text-electric-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
            >
                SQL Editor
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'preview' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeDataset ? (
                  <>
                    <div className="p-3 border-b border-onyx-800 flex items-center justify-between bg-onyx-950/50">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                            <input 
                                type="text" 
                                placeholder="Search rows..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-onyx-900 border border-onyx-800 rounded-md pl-8 pr-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-electric-400/50 transition"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-onyx-800 rounded text-[10px] text-slate-400 transition">
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                            <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-onyx-800 rounded text-[10px] text-slate-400 transition">
                                <Download className="w-3 h-3" /> Export
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left text-[11px] whitespace-nowrap border-separate border-spacing-0">
                            <thead className="bg-onyx-900 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="w-10 px-4 py-2 border-b border-r border-onyx-800 text-slate-600 font-mono">#</th>
                                    {activeDataset.columns.map((col: string) => (
                                        <th key={col} className="px-4 py-2 font-bold text-slate-300 border-b border-r border-onyx-800 uppercase tracking-tighter bg-onyx-900">
                                            <div className="flex items-center gap-2">
                                                {col.toLowerCase().includes('id') || col.toLowerCase().includes('count') ? <Hash className="w-3 h-3 text-blue-400" /> : <Type className="w-3 h-3 text-emerald-400" />}
                                                {col}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-onyx-800/50">
                                {filteredPreview.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-electric-400/5 transition-colors group">
                                        <td className="px-4 py-1.5 text-slate-600 font-mono border-r border-onyx-800/50 text-center">{i + 1}</td>
                                        {activeDataset.columns.map((col: string) => (
                                            <td key={`${i}-${col}`} className="px-4 py-1.5 text-slate-400 border-r border-onyx-800/30 group-hover:text-slate-200 transition-colors">
                                                {String(row[col])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="h-8 bg-onyx-950 border-t border-onyx-800 flex items-center justify-between px-4 text-[10px] text-slate-500 font-mono">
                        <div className="flex items-center gap-4">
                            <span>ROWS: <span className="text-electric-400">{activeDataset.rows}</span></span>
                            <span>COLS: <span className="text-electric-400">{activeDataset.columns.length}</span></span>
                        </div>
                        <span>PROCESSED IN 12ms</span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4">
                    <div className="p-6 bg-onyx-900 rounded-full border border-onyx-800">
                        <TableIcon className="w-12 h-12 opacity-20" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-500">No Data Source Active</p>
                        <p className="text-xs text-slate-600">Import a dataset to begin exploration</p>
                    </div>
                    <button 
                        onClick={loadMockData}
                        className="px-6 py-2 bg-onyx-900 border border-onyx-800 rounded-full text-xs text-slate-400 hover:text-white hover:border-electric-400 transition"
                    >
                        Initialize Sample Protocol
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schema' && activeDataset && (
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="glass-panel p-4 rounded-xl border border-onyx-800 bg-onyx-900/20">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Total Storage</span>
                            <span className="text-2xl font-bold text-white">{(activeDataset.rows * 0.45).toFixed(1)} MB</span>
                        </div>
                        <div className="glass-panel p-4 rounded-xl border border-onyx-800 bg-onyx-900/20">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Index Fragmentation</span>
                            <span className="text-2xl font-bold text-emerald-400">0.02%</span>
                        </div>
                        <div className="glass-panel p-4 rounded-xl border border-onyx-800 bg-onyx-900/20">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Last Vacuum</span>
                            <span className="text-2xl font-bold text-slate-400">2h ago</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Column Definitions</h3>
                        <div className="border border-onyx-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-onyx-900">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-slate-400">Column</th>
                                        <th className="px-4 py-3 font-bold text-slate-400">Type</th>
                                        <th className="px-4 py-3 font-bold text-slate-400">Nullability</th>
                                        <th className="px-4 py-3 font-bold text-slate-400">Default</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-onyx-800">
                                    {activeDataset.columns.map((col: string) => (
                                        <tr key={col} className="hover:bg-onyx-900/50">
                                            <td className="px-4 py-3 font-mono text-electric-400">{col}</td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {col.toLowerCase().includes('id') || col.toLowerCase().includes('count') ? 'INTEGER' : 'VARCHAR(255)'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">NOT NULL</td>
                                            <td className="px-4 py-3 text-slate-600 italic">None</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'query' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 bg-[#0d0d0d]">
                        <CodeEditor 
                            value={sqlQuery} 
                            onChange={(val) => setSqlQuery(val || '')}
                            height="100%"
                        />
                    </div>
                    <div className="h-10 bg-onyx-900 border-t border-onyx-800 flex items-center px-4 justify-between">
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold rounded transition">
                                <Play className="w-3 h-3" /> EXECUTE QUERY
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1 hover:bg-onyx-800 rounded text-[10px] text-slate-400 transition">
                                <RefreshCw className="w-3 h-3" /> REFRESH
                            </button>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">
                            CONNECTED TO CLUSTER: <span className="text-emerald-500">EU-WEST-1-SQL-04</span>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

