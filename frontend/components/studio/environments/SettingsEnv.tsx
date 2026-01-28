'use client';

export default function SettingsEnv() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      <div className="glass-panel p-6 rounded-2xl border border-onyx-800 space-y-6">
          <div>
              <label className="block text-sm font-bold text-white mb-2">Project Name</label>
              <input type="text" defaultValue="Churn Prediction Model" className="w-full bg-onyx-950 border border-onyx-800 rounded-xl px-4 py-3 text-white focus:border-electric-600 focus:outline-none" />
          </div>
          
          <div>
              <label className="block text-sm font-bold text-white mb-2">Description</label>
              <textarea defaultValue="Predicting customer churn using transaction history and demographics." className="w-full bg-onyx-950 border border-onyx-800 rounded-xl px-4 py-3 text-white focus:border-electric-600 focus:outline-none h-32"></textarea>
          </div>

          <div className="pt-4 border-t border-onyx-800">
              <button className="px-6 py-3 bg-electric-600 hover:bg-electric-500 text-white rounded-xl font-bold transition shadow-glow-cyan">
                  Save Changes
              </button>
          </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-red-900/30 space-y-4">
          <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
          <p className="text-sm text-slate-500">Irreversible actions for this project.</p>
          <button className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-xl font-bold transition">
              Delete Project
          </button>
      </div>
    </div>
  );
}
