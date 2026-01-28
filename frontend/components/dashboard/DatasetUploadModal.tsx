'use client';

import { useState } from 'react';
import { X, Loader2, UploadCloud } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface DatasetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (dataset: any) => void;
}

export default function DatasetUploadModal({ isOpen, onClose, onSuccess }: DatasetUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/api/datasets/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to upload dataset');
      }

      const newDataset = await res.json();
      // The upload endpoint returns limited info, we might want to refetch list or construct object
      // For now, construct a temporary object to display
      const displayDataset = {
        id: newDataset.id,
        name: newDataset.filename,
        type: newDataset.filename.split('.').pop(),
        rows: 0,
        size: '0MB', // Placeholder
        created_at: new Date().toISOString(),
        status: 'ready'
      };
      
      onSuccess(displayDataset);
      onClose();
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-onyx-900 border border-onyx-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-400 to-neon-purple"></div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Upload Dataset</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-onyx-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-electric-400/50 hover:bg-onyx-900/50 transition cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".csv,.parquet,.json,.xlsx"
              />
              <div className="w-12 h-12 bg-onyx-800 rounded-full flex items-center justify-center mb-3 text-electric-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              {file ? (
                <div>
                  <p className="text-white font-medium mb-1">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-slate-300 font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">CSV, Parquet, JSON, Excel (max 500MB)</p>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-onyx-800 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="px-6 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white font-medium transition shadow-glow-cyan flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
