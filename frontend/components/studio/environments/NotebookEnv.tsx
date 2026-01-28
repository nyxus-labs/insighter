'use client';

import { Terminal, Play, Plus, Trash2, Loader2, AlertCircle, Save } from 'lucide-react';
import CodeEditor from '@/components/ui/CodeEditor';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';
import { useToolCommunication } from '@/hooks/useToolCommunication';
import { useEffect, useState, useCallback } from 'react';

interface NotebookCell {
  id: string;
  code: string;
  output: string;
  status: 'idle' | 'running' | 'success' | 'error';
}

export default function NotebookEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { initialize, execute, isInitializing, isReady, error } = useTool({ tool, projectId });
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const { emit } = useToolCommunication({
    toolId: tool.id,
    subscriptions: ['DATA_LOAD'],
    onMessage: (msg) => {
      console.log('Notebook received message:', msg);
      if (msg.type === 'DATA_LOAD') {
        setLastMessage(`Received dataset: ${msg.payload.datasetId}`);
        // Optionally auto-create a cell to load this data
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
  };

  const addCellWithCode = (code: string) => {
    const newCell: NotebookCell = {
      id: `cell-${Date.now()}`,
      code,
      output: '',
      status: 'idle'
    };
    setCells(prev => [...prev, newCell]);
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

    // Update status to running
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

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-electric-400" />
        <p>Provisioning {tool.name} Runtime...</p>
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
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#0a0a0a] z-20 py-4 border-b border-onyx-800">
        <div>
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-electric-400" /> 
            Python Notebook
           </h2>
           {lastMessage && (
             <span className="text-xs text-neon-emerald animate-pulse flex items-center gap-1 mt-1">
               <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald inline-block"></span>
               {lastMessage}
             </span>
           )}
        </div>
        <div className="flex flex-col items-end"> 
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-300">{tool?.name || 'Notebook'}</span>
              {isReady && <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">Kernel Ready</span>}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">Python 3.12 • Local Kernel</p>
        </div>
        <div className="flex gap-2">
            <button className="p-2 hover:bg-onyx-800 rounded-lg text-slate-400 transition" title="Save Notebook">
                <Save className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      {/* Cells */}
      <div className="space-y-6">
        {cells.map((cell, index) => (
          <div key={cell.id} className="group relative pl-8">
            {/* Cell Index / Controls */}
            <div className="absolute left-0 top-2 flex flex-col items-center gap-2 w-6">
                <span className="text-xs font-mono text-slate-600">[{index + 1}]</span>
                <button 
                    onClick={() => deleteCell(cell.id)}
                    className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            {/* Editor Area */}
            <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                cell.status === 'running' ? 'border-electric-500/50 shadow-[0_0_15px_-3px_rgba(124,58,237,0.3)]' : 
                cell.status === 'error' ? 'border-red-500/30' : 'border-onyx-800 bg-onyx-900/30'
            }`}>
                {/* Cell Toolbar */}
                <div className="flex items-center justify-between px-3 py-1 bg-onyx-900/50 border-b border-onyx-800/50">
                    <span className="text-xs text-slate-500 font-mono">Python</span>
                    <button 
                        onClick={() => runCell(cell.id)}
                        disabled={cell.status === 'running'}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition ${
                            cell.status === 'running' 
                            ? 'text-slate-500 cursor-not-allowed' 
                            : 'text-electric-400 hover:bg-electric-500/10'
                        }`}
                    >
                        {cell.status === 'running' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Run
                    </button>
                </div>
                
                <CodeEditor 
                    value={cell.code} 
                    onChange={(val) => updateCellCode(cell.id, val || '')}
                    height="auto" // Let it grow or fix it? Fixed for now to avoid complexity
                />
            </div>

            {/* Output Area */}
            {cell.output && (
                <div className="mt-2 ml-1 p-3 font-mono text-sm bg-onyx-950 border-l-2 border-onyx-700 text-slate-300 whitespace-pre-wrap overflow-x-auto">
                    {cell.output}
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Cell Button */}
      <div className="mt-8 flex justify-center">
        <button 
            onClick={addCell}
            className="flex items-center gap-2 px-4 py-2 bg-onyx-800 hover:bg-onyx-700 text-slate-300 rounded-full text-sm font-medium transition border border-onyx-700 hover:border-slate-600"
        >
            <Plus className="w-4 h-4" /> Code Cell
        </button>
      </div>
    </div>
  );
}
