'use client';

import { 
  Terminal, 
  Play, 
  Plus, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Save, 
  RefreshCcw, 
  Square,
  FileCode,
  Layers,
  Search,
  Settings,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import CodeEditor from '@/components/ui/CodeEditor';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';
import { useToolCommunication } from '@/hooks/useToolCommunication';
import { useEffect, useState, useCallback, useRef } from 'react';

interface NotebookCell {
  id: string;
  code: string;
  output: string;
  status: 'idle' | 'running' | 'success' | 'error';
}

export default function NotebookEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { initialize, execute, isInitializing, isReady, error } = useTool({ tool, projectId });
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [activeCellId, setActiveCellId] = useState<string | null>('cell-1');
  const notebookEndRef = useRef<HTMLDivElement>(null);

  const { emit } = useToolCommunication({
    toolId: tool.id,
    subscriptions: ['DATA_LOAD'],
    onMessage: (msg) => {
      console.log('Notebook received message:', msg);
      if (msg.type === 'DATA_LOAD') {
        setLastMessage(`Received dataset: ${msg.payload.datasetId}`);
        addCellWithCode(`# Auto-generated from Data Tool\nimport pandas as pd\ndf = pd.read_csv("${msg.payload.url}")\ndf.head()`);
      }
    }
  });

  const [cells, setCells] = useState<NotebookCell[]>([
    { 
      id: 'cell-1', 
      code: 'print("Hello from Python!")\nimport random\nprint(f"Random Number: {random.randint(1, 100)}")', 
      output: '', 
      status: 'idle' 
    }
  ]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const addCell = () => {
    const newCell: NotebookCell = {
      id: `cell-${Date.now()}`,
      code: '',
      output: '',
      status: 'idle'
    };
    setCells(prev => [...prev, newCell]);
    setActiveCellId(newCell.id);
  };

  const addCellWithCode = (code: string) => {
    const newCell: NotebookCell = {
      id: `cell-${Date.now()}`,
      code,
      output: '',
      status: 'idle'
    };
    setCells(prev => [...prev, newCell]);
    setActiveCellId(newCell.id);
  };

  const deleteCell = (id: string) => {
    setCells(prev => prev.filter(cell => cell.id !== id));
  };

  const updateCellCode = (id: string, newCode: string) => {
    setCells(prev => prev.map(cell => cell.id === id ? { ...cell, code: newCode } : cell));
  };

  const runCell = async (id: string) => {
    const cell = cells.find(c => c.id === id);
    if (!cell) return;

    setCells(prev => prev.map(c => c.id === id ? { ...c, status: 'running', output: '' } : c));

    try {
      const result = await execute('run_cell', { code: cell.code });
      
      emit('CELL_EXECUTED', { 
        cellId: id, 
        status: result.result, 
        codeLength: cell.code.length 
      });

      setCells(prev => prev.map(c => c.id === id ? { 
        ...c, 
        status: result.result === 'success' ? 'success' : 'error',
        output: result.output 
      } : c));
    } catch (e: any) {
      setCells(prev => prev.map(c => c.id === id ? { 
        ...c, 
        status: 'error',
        output: `Execution failed: ${e.message}` 
      } : c));
    }
  };

  const runAllCells = async () => {
    for (const cell of cells) {
      await runCell(cell.id);
    }
  };

  const clearOutputs = () => {
    setCells(prev => prev.map(c => ({ ...c, output: '', status: 'idle' })));
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-electric-400" />
        <p className="font-mono text-sm tracking-widest">PROVISIONING {tool.name.toUpperCase()} RUNTIME...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-400">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p>Failed to load environment: {error}</p>
        <button onClick={initialize} className="mt-4 px-4 py-2 bg-onyx-800 rounded hover:bg-onyx-700 text-white transition">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#0a0a0a] overflow-hidden border border-onyx-800 rounded-2xl">
      {/* Activity Bar (VS Code Style) */}
      <div className="w-12 bg-onyx-950 border-r border-onyx-800 flex flex-col items-center py-4 gap-4">
        <div className="p-2 text-electric-400 border-l-2 border-electric-400">
          <FileCode className="w-5 h-5" />
        </div>
        <div className="p-2 text-slate-600 hover:text-slate-400 cursor-pointer transition">
          <Search className="w-5 h-5" />
        </div>
        <div className="p-2 text-slate-600 hover:text-slate-400 cursor-pointer transition">
          <Layers className="w-5 h-5" />
        </div>
        <div className="mt-auto p-2 text-slate-600 hover:text-slate-400 cursor-pointer transition">
          <Settings className="w-5 h-5" />
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Notebook Toolbar */}
        <div className="h-10 bg-onyx-900 border-b border-onyx-800 flex items-center px-4 justify-between">
          <div className="flex items-center gap-1">
            <button 
              onClick={addCell}
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-onyx-800 rounded text-xs text-slate-300 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electric-400/50"
              aria-label="Add Code Cell"
            >
              <Plus className="w-3.5 h-3.5 text-electric-400" /> Code
            </button>
            <div className="w-px h-4 bg-onyx-800 mx-1"></div>
            <button 
              onClick={runAllCells}
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-onyx-800 rounded text-xs text-slate-300 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/50"
              aria-label="Run All Cells"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" /> Run All
            </button>
            <button 
              onClick={clearOutputs}
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-onyx-800 rounded text-xs text-slate-300 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/50"
              aria-label="Clear All Outputs"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-blue-400" /> Clear
            </button>
            <div className="w-px h-4 bg-onyx-800 mx-1"></div>
            <button 
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-onyx-800 rounded text-xs text-slate-300 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400/50"
              aria-label="Save Notebook"
            >
              <Save className="w-3.5 h-3.5 text-slate-400" /> Save
            </button>
          </div>

          <div className="flex items-center gap-4">
            {lastMessage && (
              <span className="text-[10px] text-neon-emerald font-mono animate-pulse">
                {lastMessage}
              </span>
            )}
            <div className="flex items-center gap-2 bg-onyx-950 px-3 py-1 rounded-full border border-onyx-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[10px] font-mono text-slate-400">Python 3.12 (ipykernel)</span>
            </div>
          </div>
        </div>

        {/* Notebook Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cells.map((cell, index) => (
            <div 
              key={cell.id} 
              onClick={() => setActiveCellId(cell.id)}
              className={`group relative flex gap-4 transition-all duration-300 ${
                activeCellId === cell.id ? 'opacity-100' : 'opacity-80'
              }`}
            >
              {/* Left Gutter */}
              <div className="w-12 flex flex-col items-end pt-2">
                <div className={`text-[10px] font-mono transition-colors ${
                  activeCellId === cell.id ? 'text-electric-400 font-bold' : 'text-slate-600'
                }`}>
                  [{cell.status === 'running' ? '*' : index + 1}]
                </div>
              </div>

              {/* Cell Container */}
              <div className={`flex-1 flex flex-col gap-2 rounded-lg transition-all duration-300 border ${
                activeCellId === cell.id 
                ? 'border-electric-500/30 bg-electric-500/[0.02]' 
                : 'border-transparent hover:border-onyx-800'
              }`}>
                {/* Editor Section */}
                <div className="relative group/editor">
                  <div className={`absolute -left-[1px] top-0 bottom-0 w-1 rounded-l-lg transition-colors ${
                    activeCellId === cell.id ? 'bg-electric-400' : 'bg-transparent'
                  }`}></div>
                  
                  <div className="rounded-r-lg overflow-hidden bg-[#0d0d0d] border border-onyx-800/50">
                    <CodeEditor 
                      value={cell.code} 
                      onChange={(val) => updateCellCode(cell.id, val || '')}
                      height="200px"
                    />
                  </div>

                  {/* Inline Cell Actions */}
                  <div className={`absolute top-2 right-2 flex items-center gap-1 transition-opacity ${
                    activeCellId === cell.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); runCell(cell.id); }}
                      disabled={cell.status === 'running'}
                      className="p-1.5 hover:bg-onyx-800 rounded text-emerald-400 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/50"
                      aria-label="Run Cell"
                    >
                      {cell.status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (cell.code.trim() && !confirm('Delete this cell and its code?')) return;
                        deleteCell(cell.id); 
                      }}
                      className="p-1.5 hover:bg-onyx-800 rounded text-slate-500 hover:text-red-400 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400/50"
                      aria-label="Delete Cell"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Output Section */}
                {(cell.output || cell.status === 'running') && (
                  <div className="ml-0 p-4 rounded-lg bg-onyx-950/50 border border-onyx-800/30 font-mono text-xs text-slate-300 overflow-x-auto min-h-[40px]">
                    {cell.status === 'running' && !cell.output ? (
                      <div className="flex items-center gap-2 text-slate-500 italic">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Executing...
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap">{cell.output}</pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Bottom Spacer / Add Cell */}
          <div className="h-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button 
              onClick={addCell}
              className="flex items-center gap-2 px-4 py-1.5 bg-onyx-900 border border-onyx-800 rounded-full text-xs text-slate-400 hover:text-white hover:border-electric-400 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Code Cell
            </button>
          </div>
          <div ref={notebookEndRef} />
        </div>
      </div>

      {/* Context Sidebar (JupyterLab Style) */}
      <div className="w-64 bg-onyx-950 border-l border-onyx-800 hidden xl:flex flex-col">
        <div className="p-3 border-b border-onyx-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Variable Explorer</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-electric-400 font-mono">df</span>
              <span className="text-slate-600">DataFrame (500, 12)</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-electric-400 font-mono">model</span>
              <span className="text-slate-600">XGBClassifier</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-electric-400 font-mono">accuracy</span>
              <span className="text-slate-600">float (0.892)</span>
            </div>
          </div>
        </div>
        
        <div className="p-3 border-t border-onyx-800 border-b border-onyx-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>CPU USAGE</span>
              <span>12%</span>
            </div>
            <div className="h-1 bg-onyx-900 rounded-full overflow-hidden">
              <div className="h-full bg-electric-500 w-[12%]"></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>MEMORY</span>
              <span>1.2GB / 8GB</span>
            </div>
            <div className="h-1 bg-onyx-900 rounded-full overflow-hidden">
              <div className="h-full bg-neon-violet w-[15%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

