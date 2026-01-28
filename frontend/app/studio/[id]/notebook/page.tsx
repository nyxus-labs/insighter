'use client';

import { Play, Square, Save, Plus, Terminal, Settings } from 'lucide-react';

export default function Notebook({ params }: { params: { id: string } }) {
  return (
    <div className="h-full flex flex-col bg-onyx-950 text-slate-300 font-mono">
       {/* Notebook Toolbar */}
       <div className="h-14 border-b border-onyx-800 flex items-center px-4 justify-between bg-onyx-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
             <button className="p-2 hover:bg-electric-600/20 text-electric-400 rounded-lg transition hover:shadow-glow-cyan"><Play className="w-4 h-4 fill-current" /></button>
             <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"><Square className="w-4 h-4 fill-current" /></button>
             <div className="h-4 w-px bg-onyx-700 mx-2"></div>
             <button className="p-2 hover:bg-onyx-700 text-slate-400 hover:text-white rounded-lg transition"><Save className="w-4 h-4" /></button>
             <button className="p-2 hover:bg-onyx-700 text-slate-400 hover:text-white rounded-lg transition"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="text-xs text-slate-500">Python 3.11 (ipykernel) • Idle</div>
       </div>

       {/* Notebook Content */}
       <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Cell 1 */}
          <div className="group border border-transparent hover:border-onyx-700 rounded-xl transition-all duration-300">
             <div className="flex gap-4">
                <div className="w-16 text-right text-xs text-slate-600 pt-3 font-mono">In [1]:</div>
                <div className="flex-1">
                   <div className="bg-onyx-900/80 border border-onyx-800 rounded-lg p-4 font-mono text-sm text-slate-300 shadow-inner focus-within:border-electric-400/50 transition">
                      <span className="text-neon-violet">import</span> pandas <span className="text-neon-violet">as</span> pd<br/>
                      <span className="text-neon-violet">import</span> numpy <span className="text-neon-violet">as</span> np<br/>
                      <span className="text-neon-violet">import</span> matplotlib.pyplot <span className="text-neon-violet">as</span> plt<br/>
                      <br/>
                      <span className="text-slate-500"># Load dataset</span><br/>
                      df = pd.read_csv(<span className="text-neon-emerald">"data/churn.csv"</span>)<br/>
                      df.head()
                   </div>
                   {/* Output */}
                   <div className="mt-2 p-4 overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-400">
                         <thead className="text-slate-500 border-b border-onyx-800">
                            <tr>
                               <th className="py-2">customerID</th>
                               <th className="py-2">gender</th>
                               <th className="py-2">SeniorCitizen</th>
                               <th className="py-2">Partner</th>
                               <th className="py-2">Dependents</th>
                            </tr>
                         </thead>
                         <tbody>
                            <tr className="border-b border-onyx-800/50">
                               <td className="py-2 font-mono text-electric-400">7590-VHVEG</td>
                               <td className="py-2">Female</td>
                               <td className="py-2">0</td>
                               <td className="py-2">Yes</td>
                               <td className="py-2">No</td>
                            </tr>
                            <tr className="border-b border-onyx-800/50">
                               <td className="py-2 font-mono text-electric-400">5575-GNVDE</td>
                               <td className="py-2">Male</td>
                               <td className="py-2">0</td>
                               <td className="py-2">No</td>
                               <td className="py-2">No</td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
