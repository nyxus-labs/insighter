'use client';

import React, { useState } from 'react';
import { useToolContext } from '@/contexts/ToolContext';
import { Activity, AlertTriangle, X, Terminal, RefreshCw, MessageSquare } from 'lucide-react';

export default function ToolMonitor() {
  const { messageLog, deadLetterQueue, activeTools } = useToolContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'dlq' | 'tools'>('logs');

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-onyx-900 border border-onyx-700 text-slate-400 p-3 rounded-full shadow-lg hover:text-white hover:border-electric-500 transition-all z-50 group"
      >
        <Activity className="w-5 h-5 group-hover:animate-pulse" />
        {deadLetterQueue.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            {deadLetterQueue.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[500px] h-[400px] bg-onyx-950 border border-onyx-800 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 font-mono text-xs">
      {/* Header */}
      <div className="bg-onyx-900 p-3 border-b border-onyx-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-electric-400" />
          <span className="font-bold text-slate-200">System Bus Monitor</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-onyx-800 bg-onyx-900/50">
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex-1 p-2 text-center border-b-2 transition-colors ${activeTab === 'logs' ? 'border-electric-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Logs ({messageLog.length})
        </button>
        <button 
          onClick={() => setActiveTab('dlq')}
          className={`flex-1 p-2 text-center border-b-2 transition-colors ${activeTab === 'dlq' ? 'border-red-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Dead Letter ({deadLetterQueue.length})
        </button>
        <button 
          onClick={() => setActiveTab('tools')}
          className={`flex-1 p-2 text-center border-b-2 transition-colors ${activeTab === 'tools' ? 'border-green-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Active Tools ({activeTools.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 bg-black/20">
        {activeTab === 'logs' && (
          <div className="space-y-1">
            {messageLog.map((log) => (
              <div key={log.id} className="p-2 rounded bg-onyx-900/50 border border-onyx-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`
                    w-2 h-2 rounded-full 
                    ${log.level === 'info' ? 'bg-blue-500' : log.level === 'warn' ? 'bg-yellow-500' : 'bg-red-500'}
                  `}></span>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
                {log.details && (
                  <pre className="text-[10px] text-slate-500 overflow-x-auto bg-black/30 p-1 rounded">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
            {messageLog.length === 0 && <p className="text-slate-600 text-center mt-10">No logs recorded.</p>}
          </div>
        )}

        {activeTab === 'dlq' && (
          <div className="space-y-2">
            {deadLetterQueue.map((msg) => (
              <div key={msg.id} className="p-2 rounded bg-red-900/10 border border-red-900/30">
                <div className="flex justify-between mb-1">
                  <span className="text-red-400 font-bold">{msg.type}</span>
                  <span className="text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-400 mb-1">From: {msg.sourceToolId} → To: {msg.targetToolId || 'Broadcast'}</div>
                <pre className="text-[10px] text-red-300/70 overflow-x-auto bg-black/30 p-1 rounded">
                  {JSON.stringify(msg.payload, null, 2)}
                </pre>
                <div className="mt-2 flex justify-end">
                   <button className="text-[10px] bg-red-900/30 hover:bg-red-900/50 text-red-300 px-2 py-1 rounded flex items-center gap-1">
                     <RefreshCw className="w-3 h-3" /> Retry
                   </button>
                </div>
              </div>
            ))}
            {deadLetterQueue.length === 0 && <p className="text-slate-600 text-center mt-10">Queue is empty. Systems normal.</p>}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="grid grid-cols-2 gap-2">
            {activeTools.map((toolId) => (
              <div key={toolId} className="p-3 rounded bg-onyx-900 border border-onyx-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-300">{toolId}</span>
              </div>
            ))}
            {activeTools.length === 0 && <p className="text-slate-600 text-center mt-10 col-span-2">No active tools detected.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
