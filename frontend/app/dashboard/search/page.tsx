'use client';

import { useSearchParams } from 'next/navigation';
import { Search, Folder, Database, Code, BrainCircuit, Calendar, Loader2 } from 'lucide-react';
import { Suspense, useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface SearchResultItem {
  id: string;
  type: 'project' | 'dataset' | 'notebook' | 'model';
  title: string;
  description?: string;
  url: string;
  metadata?: any;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      
      try {
        const res = await api.get(`/api/search/?q=${encodeURIComponent(query)}`);
        setResults(res.data.results || []);
      } catch (err: any) {
        if (err.message !== 'Auth session missing!') {
          console.error('Failed to fetch search results', err);
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce slightly or just run
    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <Folder className="w-5 h-5 text-blue-400" />;
      case 'dataset': return <Database className="w-5 h-5 text-purple-400" />;
      case 'notebook': return <Code className="w-5 h-5 text-amber-400" />;
      case 'model': return <BrainCircuit className="w-5 h-5 text-emerald-400" />;
      default: return <Search className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Search className="w-8 h-8 text-electric-400" />
          Search Results
       </h1>
       
       {query ? (
         <div className="space-y-6">
            <p className="text-slate-300">Showing results for: <span className="text-electric-400 font-mono font-bold">{query}</span></p>
            
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-electric-400 animate-spin" />
                </div>
            ) : results.length > 0 ? (
                <div className="grid gap-4">
                    {results.map((item) => (
                        <Link key={`${item.type}-${item.id}`} href={item.url}>
                            <div className="glass-panel p-5 rounded-xl border border-onyx-800 hover:border-electric-500/50 hover:bg-onyx-900/50 transition group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-onyx-900 rounded-lg border border-onyx-800 group-hover:scale-110 transition">
                                        {getIcon(item.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono uppercase bg-onyx-800 px-2 py-0.5 rounded text-slate-400 border border-onyx-700">
                                                {item.type}
                                            </span>
                                            <h3 className="text-lg font-bold text-white truncate group-hover:text-electric-400 transition">{item.title}</h3>
                                        </div>
                                        {item.description && (
                                            <p className="text-slate-400 text-sm line-clamp-2 mb-3">{item.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                                            {item.metadata?.updated_at && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> 
                                                    {new Date(item.metadata.updated_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : hasSearched ? (
                <div className="mt-8 text-center py-12 text-slate-500 border-2 border-dashed border-onyx-800 rounded-xl">
                   No results found for "{query}".
                </div>
            ) : null}
         </div>
       ) : (
         <div className="text-center py-20">
            <Search className="w-16 h-16 text-onyx-800 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Enter a search term to find projects, data, notebooks, and models.</p>
         </div>
       )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
