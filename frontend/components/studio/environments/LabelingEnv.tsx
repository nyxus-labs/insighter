'use client';

import { useState, useEffect } from 'react';
import { Tag, Check, X, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';

export default function LabelingEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { initialize, execute, isInitializing, isReady, error } = useTool({ tool, projectId });
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isReady) {
      loadNextTask();
    }
  }, [isReady]);

  const loadNextTask = async () => {
    try {
      const data = await execute('get_task', {});
      setCurrentTask(data);
      setSelectedLabel(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (label: string) => {
    setIsSubmitting(true);
    try {
      await execute('submit_annotation', { 
        task_id: currentTask.task_id, 
        label 
      });
      await loadNextTask();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-electric-400" />
        <p>Loading Labeling Studio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-400">
        <X className="w-10 h-10 mb-4" />
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-orange-400" />
            Image Classification
          </h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold border border-orange-500/30">
                Queue: 5 Items
            </span>
          </div>
      </div>

      {currentTask ? (
        <div className="grid md:grid-cols-3 gap-6">
            {/* Image Area */}
            <div className="md:col-span-2 glass-panel p-2 rounded-2xl border border-onyx-800 bg-black flex items-center justify-center min-h-[400px]">
                <img 
                    src={currentTask.image_url} 
                    alt="Task" 
                    className="max-w-full max-h-[500px] rounded-lg" 
                />
            </div>

            {/* Controls */}
            <div className="glass-panel p-6 rounded-2xl border border-onyx-800 flex flex-col h-full">
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Select Class</h3>
                
                <div className="space-y-3 flex-1">
                    {['Cat', 'Dog', 'Bird', 'Other'].map((label) => (
                        <button
                            key={label}
                            onClick={() => setSelectedLabel(label)}
                            className={`w-full p-4 rounded-xl border text-left transition flex justify-between items-center ${
                                selectedLabel === label 
                                ? 'bg-orange-500/20 border-orange-500 text-white' 
                                : 'bg-onyx-900 border-onyx-800 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            <span className="font-bold">{label}</span>
                            {selectedLabel === label && <Check className="w-4 h-4 text-orange-400" />}
                        </button>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-onyx-800">
                    <div className="mb-4 text-xs text-slate-500 flex justify-between">
                        <span>Model Prediction:</span>
                        <span className="text-electric-400 font-bold">{currentTask.predicted_label} ({(currentTask.confidence * 100).toFixed(0)}%)</span>
                    </div>
                    <button 
                        onClick={() => selectedLabel && handleSubmit(selectedLabel)}
                        disabled={!selectedLabel || isSubmitting}
                        className="w-full py-3 bg-white text-black hover:bg-slate-200 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Submit Annotation'}
                    </button>
                    <button 
                        onClick={loadNextTask}
                        className="w-full mt-3 py-2 text-slate-500 hover:text-white text-sm transition flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-3 h-3" /> Skip
                    </button>
                </div>
            </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-onyx-800 text-center">
            <div className="w-16 h-16 bg-onyx-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-slate-400">No more items in the labeling queue.</p>
        </div>
      )}
    </div>
  );
}
