'use client';

import { Search, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="h-20 border-b border-onyx-800/50 flex justify-between items-center px-8 bg-onyx-950/50 backdrop-blur-md relative z-10 sticky top-0">
      <div className="flex flex-col justify-center">
         <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="text-white font-bold tracking-wide">DASHBOARD</span>
            <span className="text-onyx-600">/</span>
            <span className="text-electric-400">OVERVIEW</span>
         </div>
         <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Where Data Becomes Insight</p>
      </div>

      <div className="flex items-center gap-6">
         {/* Notifications */}
         <div className="relative cursor-pointer group">
           <div className="w-10 h-10 rounded-full bg-onyx-900 border border-onyx-800 flex items-center justify-center text-slate-400 group-hover:text-electric-400 group-hover:border-electric-400/50 transition">
              <div className="relative">
                <Zap className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-emerald rounded-full animate-pulse"></span>
              </div>
           </div>
         </div>

         {/* Global Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-electric-400 transition" />
          <input 
            type="text" 
            placeholder="SEARCH COMMAND..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-80 bg-onyx-900/50 border border-onyx-800 rounded-full pl-12 pr-6 py-2.5 text-sm focus:outline-none focus:border-electric-400/50 focus:shadow-glow-cyan transition text-slate-200 placeholder:text-slate-600 font-mono"
          />
        </div>
      </div>
    </header>
  );
}
