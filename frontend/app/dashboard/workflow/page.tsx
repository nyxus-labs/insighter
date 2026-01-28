'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  Share2, 
  Database,
  X,
  Play,
  RotateCcw
} from 'lucide-react';
import { TOOLS, CATEGORIES, Tool } from '@/lib/constants/tools';

// --- Types ---

type HistoryItem = {
  id: string;
  timestamp: string;
  toolName: string;
  actionType: 'Access' | 'Create' | 'Update' | 'Delete' | 'Share';
  description: string;
};

type SharedDataItem = {
  id: string;
  name: string;
  format: 'JSON' | 'CSV' | 'Parquet' | 'Model';
  source: string;
  size: string;
  lastUpdated: string;
};

// --- Mock Data ---

// TOOLS imported from @/lib/constants/tools

const MOCK_HISTORY: HistoryItem[] = [
  { id: '1', timestamp: '2023-10-25 10:30', toolName: 'Notebook', actionType: 'Update', description: 'Modified main_analysis.ipynb' },
  { id: '2', timestamp: '2023-10-25 10:15', toolName: 'Datasets', actionType: 'Access', description: 'Viewed customer_churn.csv' },
  { id: '3', timestamp: '2023-10-25 09:45', toolName: 'Deployment', actionType: 'Create', description: 'Deployed model churn-v1' },
];

const MOCK_SHARED_DATA: SharedDataItem[] = [
  { id: 'sd1', name: 'processed_features.parquet', format: 'Parquet', source: 'Notebook', size: '12 MB', lastUpdated: '10 mins ago' },
  { id: 'sd2', name: 'model_metrics.json', format: 'JSON', source: 'Experiments', size: '45 KB', lastUpdated: '1 hour ago' },
];

export default function GlobalWorkflowPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showHistory, setShowHistory] = useState(false);
  const [showSharedData, setShowSharedData] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(MOCK_HISTORY);
  const [sharedData, setSharedData] = useState<SharedDataItem[]>(MOCK_SHARED_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleClearHistory = () => {
      setHistory([]);
  };

  const handleSyncData = () => {
      // Mock sync action
      const newData = { id: `sd${Date.now()}`, name: 'synced_data.csv', format: 'CSV', source: 'External', size: '2 MB', lastUpdated: 'Just now' } as SharedDataItem;
      setSharedData([newData, ...sharedData]);
  };

  if (isLoading) {
      return (
          <div className="min-h-screen bg-onyx-950 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-electric-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-500 text-sm animate-pulse">Loading Global Workflow Hub...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-onyx-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-5 fixed"></div>

      {/* Header */}
      <header className="h-16 border-b border-onyx-800 bg-onyx-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-onyx-800 rounded-lg transition text-slate-500 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Global Workflow Hub <span className="px-2 py-0.5 rounded-full bg-electric-600/10 text-electric-400 text-xs border border-electric-600/20">Beta</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-onyx-800 hover:bg-onyx-700 rounded-lg text-sm transition border border-onyx-700 text-slate-300"
          >
            <Clock className="w-4 h-4" /> History
          </button>
          <button 
            onClick={() => setShowSharedData(!showSharedData)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition border ${showSharedData ? 'bg-electric-600 text-white border-electric-500' : 'bg-onyx-800 hover:bg-onyx-700 border-onyx-700 text-slate-300'}`}
          >
            <Share2 className="w-4 h-4" /> Shared Data
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-8 relative z-10 transition-all duration-300">
            <div className="max-w-7xl mx-auto">
                
                {/* Search & Filter */}
                <div className="mb-10 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Global Tools & Services</h2>
                            <p className="text-slate-500">Access your tools across all projects.</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Search tools..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-onyx-900 border border-onyx-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-electric-600 transition shadow-lg"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition border ${selectedCategory === cat ? 'bg-electric-600/20 border-electric-600 text-electric-400' : 'bg-onyx-900 border-onyx-800 text-slate-500 hover:text-slate-300 hover:border-slate-600'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tool Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map(tool => (
                        <div key={tool.id} className="group bg-onyx-900/50 backdrop-blur border border-onyx-800 rounded-2xl p-6 hover:border-electric-600/50 hover:bg-onyx-900 transition-all duration-300 shadow-lg hover:shadow-glow-cyan cursor-pointer flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-onyx-950 rounded-xl border border-onyx-800 group-hover:scale-110 transition duration-300">
                                    <tool.icon className={`w-6 h-6 ${tool.iconColor || 'text-slate-400'}`} />
                                </div>
                                <span className="px-2 py-1 bg-onyx-950 rounded text-xs text-slate-500 border border-onyx-800 uppercase tracking-wider font-bold">{tool.category}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                            <p className="text-slate-400 text-sm mb-6 flex-1">{tool.description}</p>
                            <Link href="/dashboard" className="w-full">
                                <button className="w-full py-2.5 bg-onyx-800 hover:bg-electric-600 hover:text-white text-slate-300 rounded-xl text-sm font-bold transition border border-onyx-700 hover:border-transparent flex items-center justify-center gap-2 group-hover:shadow-lg">
                                    <Play className="w-4 h-4" /> Select Project
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>

                {filteredTools.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex p-4 rounded-full bg-onyx-900 mb-4 text-slate-600"><Search className="w-8 h-8" /></div>
                        <h3 className="text-lg font-bold text-white">No tools found</h3>
                        <p className="text-slate-500">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>
          </main>

          {/* Shared Data Sidebar */}
          <aside className={`w-80 border-l border-onyx-800 bg-onyx-900/80 backdrop-blur-xl absolute right-0 top-0 bottom-0 z-20 transition-transform duration-300 ${showSharedData ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="p-6 h-full flex flex-col">
                 <div className="flex items-center justify-between mb-6">
                     <h2 className="text-lg font-bold text-white flex items-center gap-2"><Share2 className="w-5 h-5 text-electric-400" /> Global Shared Data</h2>
                     <button onClick={() => setShowSharedData(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                 </div>

                 <div className="flex-1 overflow-y-auto space-y-4">
                     {sharedData.map(item => (
                         <div key={item.id} className="p-4 bg-onyx-950 rounded-xl border border-onyx-800 hover:border-electric-600/30 transition group">
                             <div className="flex items-start justify-between mb-2">
                                 <div className="flex items-center gap-2">
                                     <Database className="w-4 h-4 text-slate-500 group-hover:text-electric-400 transition" />
                                     <span className="text-xs font-mono text-electric-400 bg-electric-600/10 px-1.5 py-0.5 rounded">{item.format}</span>
                                 </div>
                                 <span className="text-[10px] text-slate-600">{item.size}</span>
                             </div>
                             <h4 className="text-sm font-bold text-slate-200 mb-1 truncate" title={item.name}>{item.name}</h4>
                             <div className="flex justify-between items-center text-[10px] text-slate-500">
                                 <span>From: {item.source}</span>
                                 <span>{item.lastUpdated}</span>
                             </div>
                         </div>
                     ))}
                 </div>

                 <div className="mt-6 pt-6 border-t border-onyx-800">
                     <button onClick={handleSyncData} className="w-full py-2 bg-electric-600 hover:bg-electric-500 text-white rounded-lg text-sm font-bold shadow-glow-cyan transition flex items-center justify-center gap-2">
                         <RotateCcw className="w-4 h-4" /> Sync Data
                     </button>
                 </div>
             </div>
          </aside>

      </div>

      {/* History Modal (Side Drawer Style) */}
      {showHistory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
              <div className="w-full max-w-md bg-onyx-900 h-full shadow-2xl border-l border-onyx-800 animate-in slide-in-from-right duration-300 flex flex-col">
                  <div className="p-6 border-b border-onyx-800 flex items-center justify-between bg-onyx-950/50">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2"><Clock className="w-5 h-5 text-orange-400" /> Global Activity History</h2>
                      <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="p-4 border-b border-onyx-800 bg-onyx-950/30 flex gap-2">
                      <input type="text" placeholder="Search history..." className="flex-1 bg-onyx-950 border border-onyx-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-400 transition" />
                      <button onClick={handleClearHistory} className="px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition">Clear</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {history.length === 0 ? (
                          <div className="text-center text-slate-500 py-10">No history records found.</div>
                      ) : (
                          history.map((item) => (
                              <div key={item.id} className="relative pl-6 pb-6 border-l border-onyx-800 last:pb-0">
                                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-onyx-800 border-2 border-slate-600"></div>
                                  <div className="text-xs text-slate-500 mb-1">{item.timestamp}</div>
                                  <div className="bg-onyx-950 border border-onyx-800 rounded-lg p-3 hover:border-orange-400/30 transition">
                                      <div className="flex items-center justify-between mb-1">
                                          <span className="text-sm font-bold text-white">{item.toolName}</span>
                                          <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${
                                              item.actionType === 'Create' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                                              item.actionType === 'Delete' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                                              'text-blue-400 border-blue-500/20 bg-blue-500/10'
                                          }`}>{item.actionType}</span>
                                      </div>
                                      <p className="text-xs text-slate-400">{item.description}</p>
                                      <button className="mt-2 text-[10px] text-electric-400 hover:text-electric-300 flex items-center gap-1">
                                          <RotateCcw className="w-3 h-3" /> Restore State
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
