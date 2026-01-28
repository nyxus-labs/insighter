'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ToolNotFound() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="min-h-screen bg-onyx-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Tool Not Found</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        The tool you are looking for does not exist or has been removed.
      </p>
      <Link 
        href={id ? `/studio/${id}/workflow` : '/dashboard/workflow'}
        className="px-6 py-3 bg-onyx-800 hover:bg-onyx-700 text-white rounded-xl transition font-medium flex items-center gap-2 border border-onyx-700 hover:border-onyx-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workflow
      </Link>
    </div>
  );
}
