'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Tag, Check, X, RefreshCw, Loader2, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, Maximize, SkipForward, Layers, History, Settings, Info, MousePointer2, Square, Hexagon, Circle, ShieldCheck, Flag, MessageSquare, Save } from 'lucide-react';
import { ToolEnvironmentProps } from '@/lib/tools/types';
import { useTool } from '@/hooks/useTool';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

export default function LabelingEnv({ tool, projectId }: ToolEnvironmentProps) {
  const { user: profile } = useUser();
  const { initialize, execute, isInitializing, isReady, error, realtimeData, data: initData } = useTool({ tool, projectId });
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'labeling' | 'history' | 'settings' | 'review'>('labeling');
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<'cursor' | 'bbox' | 'polygon' | 'point'>('cursor');
  const [annotations, setAnnotations] = useState<any[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const classes = useMemo(() => {
    return initData?.classes || ['Cat', 'Dog', 'Bird', 'Rabbit', 'Other'];
  }, [initData]);

  const isSpecialist = profile?.role === 'specialist' || profile?.role === 'admin';
  const isReviewMode = activeTab === 'review';

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
      setZoom(100);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (label: string) => {
    setIsSubmitting(true);
    try {
      await execute('submit_annotation', { 
        task_id: currentTask.task_id, 
        label,
        annotations: annotations // Include advanced annotations if any
      });
      toast.success('Annotation saved successfully');
      await loadNextTask();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save annotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = async () => {
    setIsSubmitting(true);
    try {
      await execute('save_progress', {
        task_id: currentTask.task_id,
        annotations: annotations,
        status: 'in_progress'
      });
      toast.success('Progress saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-onyx-950">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-electric-400" />
        <p className="text-xs font-bold uppercase tracking-widest">Initializing Annotation Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 bg-onyx-950">
        <X className="w-10 h-10 mb-4" />
        <p className="font-bold">Error: {error}</p>
        <button onClick={initialize} className="mt-4 px-4 py-2 bg-onyx-900 border border-onyx-800 rounded hover:bg-onyx-800 transition text-xs">RETRY CONNECTION</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#080808]">
      {/* Native-like Header */}
      <div className="h-14 border-b border-onyx-800 flex items-center justify-between px-6 bg-onyx-950/50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Tag className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Labeling Studio</h2>
            <p className="text-[10px] text-slate-500 font-mono">TASK_QUEUE: <span className="text-orange-400">CLASSIFICATION_V4</span></p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex border border-onyx-800 rounded-lg overflow-hidden" role="tablist" aria-label="Labeling View Tabs">
            <button 
              onClick={() => setActiveTab('labeling')}
              role="tab"
              aria-selected={activeTab === 'labeling'}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${activeTab === 'labeling' ? 'bg-orange-500 text-black' : 'text-slate-500 hover:text-white bg-onyx-900'}`}
            >
              Label
            </button>
            {isSpecialist && (
              <button 
                onClick={() => setActiveTab('review')}
                role="tab"
                aria-selected={activeTab === 'review'}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${activeTab === 'review' ? 'bg-blue-500 text-black' : 'text-slate-500 hover:text-white bg-onyx-900 border-l border-onyx-800'}`}
              >
                Review
              </button>
            )}
            <button 
              onClick={() => setActiveTab('history')}
              role="tab"
              aria-selected={activeTab === 'history'}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${activeTab === 'history' ? 'bg-orange-500 text-black' : 'text-slate-500 hover:text-white bg-onyx-900 border-l border-onyx-800'}`}
            >
              History
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            {realtimeData?.collaborators?.length > 0 && (
              <div className="flex -space-x-2 mr-4">
                {realtimeData.collaborators.map((c: any) => (
                  <div key={c.id} className="w-6 h-6 rounded-full border-2 border-onyx-950 bg-onyx-800 flex items-center justify-center text-[8px] text-white" title={c.name}>
                    {c.name.charAt(0)}
                  </div>
                ))}
                <span className="ml-4 text-emerald-500 animate-pulse">● COLLABORATING</span>
              </div>
            )}
            COMPLETED: <span className="text-emerald-500">{initData?.completed_count || 0}</span>
            <span className="text-onyx-700">|</span>
            TOTAL: <span className="text-slate-300">{initData?.total_count || 0}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Task List/Tools */}
        <div className="w-16 border-r border-onyx-800 bg-onyx-950/30 flex flex-col items-center py-6 gap-6" role="toolbar" aria-label="Labeling Tools">
          <button 
            onClick={() => setActiveTool('cursor')}
            aria-label="Selection Tool"
            aria-pressed={activeTool === 'cursor'}
            className={`p-2.5 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${activeTool === 'cursor' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTool('bbox')}
            aria-label="Bounding Box Tool"
            aria-pressed={activeTool === 'bbox'}
            className={`p-2.5 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${activeTool === 'bbox' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <Square className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTool('polygon')}
            aria-label="Polygon Tool"
            aria-pressed={activeTool === 'polygon'}
            className={`p-2.5 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${activeTool === 'polygon' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <Hexagon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTool('point')}
            aria-label="Point Tool"
            aria-pressed={activeTool === 'point'}
            className={`p-2.5 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${activeTool === 'point' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <Circle className="w-5 h-5" />
          </button>
          
          <div className="w-8 h-px bg-onyx-800 my-2"></div>

          <button className="p-2.5 text-slate-600 hover:text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50" aria-label="Layers">
            <Layers className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-600 hover:text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50" aria-label="History">
            <History className="w-5 h-5" />
          </button>
          <button className="mt-auto p-2.5 text-slate-600 hover:text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50" aria-label="Settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col relative">
          {currentTask ? (
            <>
              {/* Canvas Area */}
              <div className="flex-1 bg-[#050505] flex items-center justify-center overflow-hidden p-8 relative">
                {/* Image Toolbar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-onyx-900/80 backdrop-blur border border-onyx-800 p-1 rounded-xl z-10 shadow-2xl" role="toolbar" aria-label="Image Controls">
                  <button 
                    onClick={() => setZoom(z => Math.max(20, z - 20))} 
                    className="p-2 text-slate-400 hover:text-white hover:bg-onyx-800 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 px-2 min-w-[50px] text-center" aria-live="polite" aria-label={`Current zoom: ${zoom}%`}>{zoom}%</span>
                  <button 
                    onClick={() => setZoom(z => Math.min(400, z + 20))} 
                    className="p-2 text-slate-400 hover:text-white hover:bg-onyx-800 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-onyx-800 mx-1"></div>
                  <button 
                    onClick={() => setZoom(100)} 
                    className="p-2 text-slate-400 hover:text-white hover:bg-onyx-800 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    aria-label="Reset Zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 text-slate-400 hover:text-white hover:bg-onyx-800 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    aria-label="Full Screen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>

                <div 
                  className="transition-all duration-200 ease-out shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-onyx-800"
                  style={{ transform: `scale(${zoom / 100})` }}
                >
                  <img 
                    src={currentTask.image_url} 
                    alt="Labeling Task" 
                    className="max-w-[80vw] max-h-[70vh] object-contain"
                  />
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="bg-onyx-950/80 backdrop-blur border border-onyx-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    ID: {currentTask.task_id}
                  </div>
                  <div className="bg-onyx-950/80 backdrop-blur border border-onyx-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    PREDICTION: {currentTask.predicted_label} ({(currentTask.confidence * 100).toFixed(0)}%)
                  </div>
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="h-24 bg-onyx-950 border-t border-onyx-800 flex items-center px-8 gap-8">
                {isReviewMode ? (
                  <div className="flex-1 flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Reviewer Actions</p>
                        <p className="text-sm font-bold text-white">Verifying Specialist Mode</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="h-10 px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition flex items-center gap-2">
                        <Check className="w-4 h-4" /> APPROVE
                      </button>
                      <button className="h-10 px-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition flex items-center gap-2">
                        <Flag className="w-4 h-4" /> REJECT
                      </button>
                      <button className="h-10 px-4 bg-onyx-900 border border-onyx-800 text-slate-400 rounded-lg text-xs font-bold hover:bg-onyx-800 transition flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> COMMENT
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar">
                    {classes.map((label: string) => (
                      <button
                        key={label}
                        onClick={() => setSelectedLabel(label)}
                        className={`h-12 px-8 rounded-xl border font-bold text-sm transition-all flex-shrink-0 flex items-center gap-3 ${
                          selectedLabel === label 
                          ? 'bg-orange-500 border-orange-400 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                          : 'bg-onyx-900 border-onyx-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {label}
                        {selectedLabel === label && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 border-l border-onyx-800 pl-8">
                  <button 
                    onClick={handleSaveProgress}
                    disabled={isSubmitting}
                    className="h-12 px-4 text-slate-500 hover:text-white font-bold text-sm transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-lg"
                    title="Save Draft"
                    aria-label="Save Draft"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={loadNextTask}
                    className="h-12 px-6 text-slate-500 hover:text-white font-bold text-sm transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-lg"
                    aria-label="Skip Task"
                  >
                    <SkipForward className="w-4 h-4" /> SKIP
                  </button>
                  <button 
                    onClick={() => selectedLabel && handleSubmit(selectedLabel)}
                    disabled={!selectedLabel || isSubmitting}
                    className="h-12 px-10 bg-white text-black hover:bg-orange-400 hover:text-black rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {isSubmitting ? 'SAVING...' : 'CONFIRM LABEL'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#080808]">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-400">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Queue Completed</h3>
              <p className="text-slate-500 max-w-md">You've successfully labeled all items in this dataset. New tasks will appear when uploaded by the project manager.</p>
              <button onClick={loadNextTask} className="mt-8 px-6 py-2.5 bg-onyx-900 border border-onyx-800 rounded-xl text-slate-300 font-bold hover:bg-onyx-800 transition flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> REFRESH QUEUE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
