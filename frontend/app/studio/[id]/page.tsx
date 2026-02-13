'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  getDeployments, 
  getLabelingTasks, 
  createDeployment, 
  createLabelingTask,
  getModels,
  getExperiments,
  getDatasets
} from '@/lib/api';
import api from '@/lib/api';
import { 
  Activity, 
  Database, 
  Code, 
  Settings, 
  Play, 
  Save, 
  Terminal, 
  Box, 
  Layers,
  Cpu,
  Share2,
  GitBranch,
  Rocket,
  Tag,
  X,
  Workflow,
  Loader2,
  ChevronRight,
  Info,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import CodeEditor from '@/components/ui/CodeEditor';
import { CyberChart } from '@/components/ui/Charts';
import { formatDistanceToNow } from 'date-fns';

export default function Studio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'notebook' | 'data' | 'experiments' | 'labeling' | 'deployment' | 'settings'>('notebook');
  const [isProcessing, setIsProcessing] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [labelingTasks, setLabelingTasks] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showLabelingModal, setShowLabelingModal] = useState(false);
  const [newDeployment, setNewDeployment] = useState({ model_id: '', cpu: '1', memory: '2Gi' });
  const [newLabelingTask, setNewLabelingTask] = useState({ name: '', type: 'text' });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/api/projects/${id}`);
        setProject(res.data);
      } catch (e) {
        console.error('Failed to fetch project:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'deployment') {
      getDeployments().then(setDeployments);
    } else if (activeTab === 'labeling') {
      getLabelingTasks().then(setLabelingTasks);
    } else if (activeTab === 'experiments') {
      getExperiments(id).then(setExperiments);
      getModels().then(setModels);
    } else if (activeTab === 'data') {
      getDatasets(id).then(setDatasets);
    }
  }, [activeTab, id]);

  const performanceData = experiments.length > 0 
    ? experiments.slice(-10).map((exp, idx) => ({
        name: `R${idx + 1}`,
        value: exp.metrics?.accuracy || exp.metrics?.acc || 0
      }))
    : [
        { name: 'E1', value: 0.65 },
        { name: 'E2', value: 0.72 },
        { name: 'E3', value: 0.78 },
        { name: 'E4', value: 0.85 },
        { name: 'E5', value: 0.82 },
        { name: 'E6', value: 0.89 },
        { name: 'E7', value: 0.92 },
      ];

  const handleDeploy = async () => {
    setIsProcessing(true);
    try {
        await createDeployment(newDeployment);
        setShowDeployModal(false);
        const data = await getDeployments();
        setDeployments(data);
    } catch (e) {
        console.error(e);
        alert('Failed to deploy');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCreateLabelingTask = async () => {
    setIsProcessing(true);
    try {
        await createLabelingTask(newLabelingTask.name, newLabelingTask.type);
        setShowLabelingModal(false);
        const data = await getLabelingTasks();
        setLabelingTasks(data);
    } catch (e) {
        console.error(e);
        alert('Failed to create task');
    } finally {
        setIsProcessing(false);
    }
  };

  const runExperiment = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Project link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-onyx-950 text-slate-300 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-onyx-800 bg-onyx-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-500 hover:text-white transition">
            <div className="w-8 h-8 bg-gradient-to-br from-electric-600 to-neon-blue rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-xs">TI</span>
            </div>
          </Link>
          <div className="h-6 w-px bg-onyx-700"></div>
          <div>
            <h1 className="text-white font-bold text-sm">{isLoading ? 'Loading...' : project?.name || 'Project Studio'}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> main</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> {isLoading ? 'Initializing...' : 'Online'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-onyx-800 hover:bg-onyx-700 rounded-full text-xs font-medium transition border border-onyx-700 text-slate-300"
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
          <button onClick={runExperiment} className={`flex items-center gap-2 px-6 py-2 bg-electric-600 hover:bg-electric-500 text-white rounded-full text-xs font-bold transition shadow-glow-cyan ${isProcessing ? 'opacity-75 cursor-wait' : ''}`}>
            {isProcessing ? <Activity className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            {isProcessing ? 'RUNNING...' : 'RUN EXPERIMENT'}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-16 border-r border-onyx-800 bg-onyx-900/30 flex flex-col items-center py-6 gap-6 overflow-y-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('notebook')}
            className={`p-3 rounded-xl transition-all duration-300 group relative ${activeTab === 'notebook' ? 'bg-electric-600/20 text-electric-400 shadow-glow-cyan' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Code className="w-5 h-5" />
            <span className="absolute left-14 bg-onyx-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-onyx-700 z-50">Notebook</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('data')}
            className={`p-3 rounded-xl transition-all duration-300 group relative ${activeTab === 'data' ? 'bg-neon-violet/20 text-neon-violet shadow-glow-violet' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Database className="w-5 h-5" />
            <span className="absolute left-14 bg-onyx-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-onyx-700 z-50">Datasets</span>
          </button>

          <button 
            onClick={() => setActiveTab('experiments')}
            className={`p-3 rounded-xl transition-all duration-300 group relative ${activeTab === 'experiments' ? 'bg-neon-emerald/20 text-neon-emerald shadow-glow-emerald' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Activity className="w-5 h-5" />
            <span className="absolute left-14 bg-onyx-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-onyx-700 z-50">Experiments</span>
          </button>

          <button 
            onClick={() => setActiveTab('labeling')}
            className={`p-3 rounded-xl transition-all duration-300 group relative ${activeTab === 'labeling' ? 'bg-orange-400/20 text-orange-400 shadow-glow-orange' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Tag className="w-5 h-5" />
            <span className="absolute left-14 bg-onyx-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-onyx-700 z-50">Labeling</span>
          </button>

          <button 
            onClick={() => setActiveTab('deployment')}
            className={`p-3 rounded-xl transition-all duration-300 group relative ${activeTab === 'deployment' ? 'bg-cyan-400/20 text-cyan-400 shadow-glow-cyan' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Rocket className="w-5 h-5" />
            <span className="absolute left-14 bg-onyx-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-onyx-700 z-50">Deployment</span>
          </button>

          <Link
            href={`/studio/${id}/workflow`}
            className="p-3 rounded-xl transition-all duration-300 group relative text-slate-500 hover:text-slate-300 hover:bg-onyx-800"
          >
            <Workflow className="w-5 h-5" />
            <span className="absolute left-14 bg-onyx-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-onyx-700 z-50">Workflow</span>
          </Link>

          <div className="flex-1"></div>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-3 rounded-xl transition-all duration-300 group relative ${activeTab === 'settings' ? 'bg-onyx-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-onyx-950 relative overflow-y-auto">
          <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-10 fixed"></div>
          
          <div className="p-6 relative z-10 min-h-full">
            
            {/* NOTEBOOK VIEW */}
            {activeTab === 'notebook' && (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-electric-400" /> main_analysis.ipynb
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">Python 3.11 • 4GB RAM</span>
                  </div>
                </div>
                
                <CodeEditor 
                  height="300px" 
                  defaultValue={`import pandas as pd\nimport numpy as np\nimport plotly.express as px\n\n# Load dataset\ndf = pd.read_csv("data/churn.csv")\n\n# Quick analysis\nprint(f"Total Rows: {len(df)}")\ndf.head()`} 
                />
                
                <div className="glass-panel p-4 rounded-xl border border-onyx-800">
                  <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Output</h3>
                  <div className="font-mono text-sm text-slate-300">
                    Total Rows: 5000<br/>
                    <table className="w-full mt-2 text-left text-xs opacity-80">
                      <thead>
                        <tr className="border-b border-onyx-700 text-electric-400">
                           <th className="py-1">ID</th><th className="py-1">Tenure</th><th className="py-1">Service</th><th className="py-1">Churn</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="py-1">001</td><td className="py-1">12</td><td className="py-1">Fiber</td><td className="py-1">No</td></tr>
                        <tr><td className="py-1">002</td><td className="py-1">4</td><td className="py-1">DSL</td><td className="py-1">Yes</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <CodeEditor 
                  height="200px" 
                  defaultValue={`# Visualize Churn Rate\nfig = px.histogram(df, x="Churn", color="Gender")\nfig.show()`} 
                />
              </div>
            )}

            {/* DATA VIEW */}
            {activeTab === 'data' && (
               <div className="max-w-6xl mx-auto">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Project Datasets</h2>
                    <button className="px-4 py-2 bg-onyx-800 hover:bg-onyx-700 rounded-lg text-sm text-white transition border border-onyx-700">
                       + Upload New
                    </button>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-6">
                    {datasets.length === 0 ? (
                      <div className="col-span-2 glass-panel p-12 rounded-2xl border border-onyx-800 text-center flex flex-col items-center justify-center">
                        <Database className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No datasets found for this project</p>
                      </div>
                    ) : (
                      datasets.map((dataset) => (
                        <div key={dataset.id} className="glass-panel p-6 rounded-2xl border border-onyx-800 hover:border-neon-violet/50 transition group cursor-pointer">
                           <div className="flex items-start justify-between mb-4">
                              <div className="p-3 bg-neon-violet/10 rounded-xl text-neon-violet group-hover:scale-110 transition">
                                 <Database className="w-6 h-6" />
                              </div>
                              <span className="text-xs font-mono text-slate-500">{dataset.size || '0 MB'}</span>
                           </div>
                           <h3 className="text-lg font-bold text-white mb-1">{dataset.name}</h3>
                           <p className="text-sm text-slate-400 mb-4">{dataset.description || 'No description available.'}</p>
                           <div className="flex gap-2">
                              <span className="px-2 py-1 bg-onyx-900 rounded text-xs text-slate-500 border border-onyx-800">{dataset.format || 'UNKNOWN'}</span>
                              <span className="px-2 py-1 bg-onyx-900 rounded text-xs text-slate-500 border border-onyx-800">{dataset.row_count || 0} rows</span>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
               </div>
            )}

            {/* EXPERIMENTS VIEW */}
            {activeTab === 'experiments' && (
               <div className="max-w-6xl mx-auto space-y-8">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-white">Model Performance</h2>
                     <div className="flex gap-2">
                        <span className="px-3 py-1 bg-electric-600/20 text-electric-400 rounded-full text-xs font-bold border border-electric-600/30">Best: 92% Acc</span>
                     </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-onyx-800">
                        <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Accuracy over Epochs</h3>
                        <CyberChart data={performanceData} type="area" height={300} />
                     </div>
                     
                     <div className="glass-panel p-6 rounded-2xl border border-onyx-800 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Top Models</h3>
                        
                        {models.length === 0 ? (
                           <div className="p-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">No models trained yet</div>
                        ) : (
                           models.slice(0, 3).map((model) => (
                              <div key={model.id} className="p-4 bg-onyx-900/50 rounded-xl border border-onyx-800 hover:border-electric-600/30 transition">
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-bold text-sm">{model.name}</span>
                                    <span className={`text-xs ${model.metrics?.accuracy > 0.9 ? 'text-electric-400' : 'text-slate-500'}`}>{(model.metrics?.accuracy * 100).toFixed(1)}%</span>
                                 </div>
                                 <div className="w-full bg-onyx-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-electric-600 to-neon-blue h-full rounded-full" style={{ width: `${model.metrics?.accuracy * 100}%` }}></div>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-onyx-800">
                     <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Recent Runs (MLflow)</h3>
                     <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase border-b border-onyx-800">
                           <tr>
                              <th className="py-3 px-4">Run ID</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Accuracy</th>
                              <th className="py-3 px-4">Duration</th>
                              <th className="py-3 px-4">Created</th>
                           </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-onyx-800">
                           {experiments.length === 0 ? (
                              <tr>
                                 <td colSpan={5} className="py-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">No recent runs found</td>
                              </tr>
                           ) : (
                              experiments.map((run) => (
                                 <tr key={run.run_id} className="hover:bg-onyx-900/50 transition">
                                    <td className="py-3 px-4 font-mono text-electric-400">#{run.run_id.substring(0, 6)}</td>
                                    <td className="py-3 px-4">
                                       <span className={`px-2 py-0.5 rounded-full text-xs ${
                                          run.status === 'FINISHED' ? 'bg-emerald-500/10 text-emerald-400' : 
                                          run.status === 'FAILED' ? 'bg-red-500/10 text-red-400' : 'bg-onyx-800 text-slate-500'
                                       }`}>
                                          {run.status}
                                       </span>
                                    </td>
                                    <td className="py-3 px-4">{run.metrics?.accuracy?.toFixed(3) || run.metrics?.acc?.toFixed(3) || '-'}</td>
                                    <td className="py-3 px-4">{run.duration || '-'}</td>
                                    <td className="py-3 px-4 text-slate-500">{run.start_time ? new Date(run.start_time).toLocaleDateString() : '-'}</td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* LABELING VIEW */}
            {activeTab === 'labeling' && (
               <div className="max-w-6xl mx-auto space-y-8">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-white">Data Labeling</h2>
                     <button onClick={() => setShowLabelingModal(true)} className="px-4 py-2 bg-onyx-800 hover:bg-onyx-700 rounded-lg text-sm text-white transition border border-onyx-700 flex items-center gap-2">
                        <Tag className="w-4 h-4" /> New Labeling Task
                     </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                      {labelingTasks.length === 0 ? (
                        <div className="col-span-2 glass-panel p-6 rounded-2xl border border-onyx-800 text-center text-slate-500">
                           No labeling tasks found. (Backend might be offline or empty)
                        </div>
                      ) : (
                        labelingTasks.map((task) => (
                          <div key={task.id} className="glass-panel p-6 rounded-2xl border border-onyx-800 hover:border-orange-400/50 transition">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="p-3 bg-orange-400/10 rounded-xl text-orange-400">
                                      <Tag className="w-6 h-6" />
                                  </div>
                                  <span className="px-2 py-1 bg-onyx-900 rounded text-xs text-slate-500 border border-onyx-800">{task.type}</span>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-2">{task.name}</h3>
                              <div className="mb-4">
                                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                                      <span>Progress</span>
                                      <span>{task.progress * 100}%</span>
                                  </div>
                                  <div className="w-full bg-onyx-800 h-2 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${task.progress === 1 ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${task.progress * 100}%` }}></div>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                  <div className="flex -space-x-2">
                                      {[...Array(Math.min(task.annotators || 1, 3))].map((_, i) => (
                                          <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-onyx-950"></div>
                                      ))}
                                  </div>
                                  <button className="px-3 py-1.5 bg-electric-600/20 text-electric-400 hover:bg-electric-600 hover:text-white rounded-lg text-xs font-bold transition">
                                     {task.status === 'completed' || task.progress === 1 ? 'Export' : 'Resume'}
                                  </button>
                              </div>
                          </div>
                        ))
                      )}
                  </div>
               </div>
            )}

            {/* DEPLOYMENT VIEW */}
            {activeTab === 'deployment' && (
               <div className="max-w-6xl mx-auto space-y-8">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-white">Model Deployment</h2>
                     <button onClick={() => setShowDeployModal(true)} className="px-4 py-2 bg-electric-600 hover:bg-electric-500 rounded-lg text-sm text-white transition shadow-glow-cyan flex items-center gap-2">
                        <Rocket className="w-4 h-4" /> Deploy Model
                     </button>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-onyx-800">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase border-b border-onyx-800">
                           <tr>
                              <th className="py-3 px-4">Deployment ID</th>
                              <th className="py-3 px-4">Model</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Endpoint</th>
                              <th className="py-3 px-4">Resources</th>
                              <th className="py-3 px-4">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-onyx-800">
                           {deployments.length === 0 ? (
                               <tr className="hover:bg-onyx-900/50 transition"><td colSpan={6} className="py-4 px-4 text-center text-slate-500">No deployments found. (Backend might be offline or empty)</td></tr>
                           ) : (
                               deployments.map((dep) => (
                                  <tr key={dep.id} className="hover:bg-onyx-900/50 transition group">
                                     <td className="py-4 px-4 font-mono text-electric-400">{dep.id}</td>
                                     <td className="py-4 px-4 font-bold text-white">{dep.model_id}</td>
                                     <td className="py-4 px-4"><span className={`px-2 py-0.5 rounded-full text-xs border flex w-fit items-center gap-1 ${dep.status === 'running' || dep.status === 'provisioning' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-onyx-800 text-slate-500 border-onyx-700'}`}>{(dep.status === 'running' || dep.status === 'provisioning') && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>} {dep.status}</span></td>
                                     <td className="py-4 px-4 font-mono text-xs text-slate-400 truncate max-w-[150px]">{dep.endpoint_url || '-'}</td>
                                     <td className="py-4 px-4 text-xs text-slate-400">{dep.cpu || '1'} vCPU / {dep.memory || '2GB'}</td>
                                     <td className="py-4 px-4">
                                         <button className="text-slate-500 hover:text-white transition">Manage</button>
                                     </td>
                                  </tr>
                               ))
                           )}
                        </tbody>
                      </table>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
      {/* Modals */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-onyx-900 border border-onyx-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 border-b border-onyx-800 bg-onyx-900/50">
                 <h3 className="text-lg font-bold text-white">Deploy Model</h3>
                 <button onClick={() => setShowDeployModal(false)} className="text-slate-500 hover:text-white transition"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Model ID</label>
                    <input type="text" value={newDeployment.model_id} onChange={(e) => setNewDeployment({...newDeployment, model_id: e.target.value})} className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-600 transition" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CPU</label>
                       <select value={newDeployment.cpu} onChange={(e) => setNewDeployment({...newDeployment, cpu: e.target.value})} className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-600 transition">
                          <option value="0.5">0.5 vCPU</option>
                          <option value="1">1 vCPU</option>
                          <option value="2">2 vCPU</option>
                          <option value="4">4 vCPU</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Memory</label>
                       <select value={newDeployment.memory} onChange={(e) => setNewDeployment({...newDeployment, memory: e.target.value})} className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-600 transition">
                          <option value="512Mi">512 MiB</option>
                          <option value="1Gi">1 GiB</option>
                          <option value="2Gi">2 GiB</option>
                          <option value="4Gi">4 GiB</option>
                       </select>
                    </div>
                 </div>
              </div>
              <div className="p-6 border-t border-onyx-800 bg-onyx-900/50 flex justify-end gap-3">
                 <button onClick={() => setShowDeployModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                 <button onClick={handleDeploy} className="px-4 py-2 bg-electric-600 hover:bg-electric-500 text-white rounded-lg text-sm font-bold shadow-glow-cyan transition flex items-center gap-2">
                    {isProcessing && <Activity className="w-4 h-4 animate-spin" />} Deploy
                 </button>
              </div>
           </div>
        </div>
      )}

      {showLabelingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-onyx-900 border border-onyx-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 border-b border-onyx-800 bg-onyx-900/50">
                 <h3 className="text-lg font-bold text-white">New Labeling Task</h3>
                 <button onClick={() => setShowLabelingModal(false)} className="text-slate-500 hover:text-white transition"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Task Name</label>
                    <input type="text" value={newLabelingTask.name} onChange={(e) => setNewLabelingTask({...newLabelingTask, name: e.target.value})} placeholder="e.g. Sentiment Analysis V2" className="w-full bg-onyx-950 border border-onyx-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-600 transition" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data Type</label>
                    <div className="grid grid-cols-3 gap-3">
                       {['text', 'image', 'audio'].map((type) => (
                          <button 
                             key={type}
                             onClick={() => setNewLabelingTask({...newLabelingTask, type})}
                             className={`px-4 py-3 rounded-lg border text-sm font-medium capitalize transition ${newLabelingTask.type === type ? 'bg-electric-600/20 border-electric-600 text-electric-400' : 'bg-onyx-950 border-onyx-800 text-slate-500 hover:border-slate-600'}`}
                          >
                             {type}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-6 border-t border-onyx-800 bg-onyx-900/50 flex justify-end gap-3">
                 <button onClick={() => setShowLabelingModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                 <button onClick={handleCreateLabelingTask} className="px-4 py-2 bg-electric-600 hover:bg-electric-500 text-white rounded-lg text-sm font-bold shadow-glow-cyan transition flex items-center gap-2">
                    {isProcessing && <Activity className="w-4 h-4 animate-spin" />} Create Task
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
