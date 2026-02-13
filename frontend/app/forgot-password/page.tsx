'use client';

import Link from 'next/link';
import { ArrowLeft, KeyRound, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-onyx-950 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-30"></div>
      
      <div className="glass-panel p-10 rounded-3xl w-full max-w-md relative z-10 border border-onyx-800 shadow-cyber-panel">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center border border-slate-600">
                <KeyRound className="w-8 h-8 text-slate-300" />
            </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2 text-glow-subtle">Recovery Protocol</h1>
        <p className="text-center text-slate-400 mb-8 font-mono text-sm">Initiate password reset sequence.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-white/50 transition" 
                      placeholder="admin@insighter.ai" 
                      required
                      disabled={loading}
                    />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SEND RESET LINK'}
                </button>
            </form>
        ) : (
            <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-2">
                    <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold">Check your inbox</h3>
                <p className="text-sm text-slate-400">
                    We've sent a password reset link to your email address. Please follow the instructions to restore access.
                </p>
            </div>
        )}
        
        <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-slate-500 hover:text-white transition flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Return to Login
            </Link>
        </div>
      </div>
    </div>
  );
}
