import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader2, BrainCircuit } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Project {
  id: string;
  name: string;
}

interface ModelCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (model: any) => void;
}

export default function ModelCreateModal({ isOpen, onClose, onSuccess }: ModelCreateModalProps) {
  const [name, setName] = useState('');
  const [algorithm, setAlgorithm] = useState('xgboost'); // Default
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setIsFetchingProjects(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const res = await fetch('http://localhost:8000/api/projects', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) {
            setProjectId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setIsFetchingProjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Authentication required');
        return;
      }

      const res = await fetch('http://localhost:8000/api/ml/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          model_name: name,
          algorithm: algorithm,
          project_id: projectId,
          hyperparameters: {}
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to create model');
      }

      const jobData = await res.json();
      
      // Construct a provisional model object to display immediately
      const newModel = {
        id: jobData.job_id,
        name: name,
        version: 'v1.0',
        framework: algorithm,
        status: 'staging',
        metrics: { accuracy: 0.0 },
        owner_id: jobData.owner_id,
        created_at: new Date().toISOString()
      };

      onSuccess(newModel);
      onClose();
      setName('');
      setAlgorithm('xgboost');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-onyx-900 border border-onyx-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-electric-400" />
                    Train New Model
                  </Dialog.Title>
                  <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Model Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-onyx-950 border border-onyx-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all placeholder:text-slate-600"
                      placeholder="e.g., Customer Churn Predictor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Algorithm</label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className="w-full bg-onyx-950 border border-onyx-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all"
                    >
                      <option value="xgboost">XGBoost Classifier</option>
                      <option value="random_forest">Random Forest</option>
                      <option value="linear_regression">Linear Regression</option>
                      <option value="neural_network">Neural Network (PyTorch)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Project</label>
                    {isFetchingProjects ? (
                        <div className="text-sm text-slate-500 animate-pulse">Loading projects...</div>
                    ) : (
                        <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        required
                        className="w-full bg-onyx-950 border border-onyx-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all"
                        >
                        <option value="" disabled>Select a project</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                        </select>
                    )}
                    {projects.length === 0 && !isFetchingProjects && (
                        <p className="text-xs text-amber-500 mt-1">No projects found. Please create a project first.</p>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 rounded-xl border border-onyx-700 text-slate-300 hover:bg-onyx-800 hover:text-white transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !projectId}
                      className="flex-1 bg-electric-600 hover:bg-electric-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-bold shadow-glow-cyan transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        'Start Training'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
