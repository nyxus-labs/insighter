'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Zap, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setResending(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) throw error;
      setSuccess('Confirmation email has been resent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Your email has not been confirmed yet. Please check your inbox for the confirmation link or contact an administrator.');
        } else {
          setError(error.message || 'An error occurred during authentication');
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-onyx-950 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-30"></div>
      
      <div className="glass-panel p-10 rounded-3xl w-full max-w-md relative z-10 border border-onyx-800 shadow-cyber-panel">
        <div className="flex justify-center mb-8">
            <div className="w-48 h-16 relative flex items-center justify-center animate-pulse-slow">
                <Image 
                  src="/logo.png" 
                  alt="The Insighter" 
                  fill
                  className="object-contain"
                  priority
                />
            </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2 text-glow-subtle">Welcome Back</h1>
        <p className="text-center text-slate-400 mb-8 font-mono text-sm">Enter your credentials to access the system.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex flex-col gap-2 text-red-400 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {error.includes('Email not confirmed') && (
              <button 
                onClick={handleResendConfirmation}
                disabled={resending}
                className="mt-2 text-xs font-bold text-red-300 hover:text-white transition flex items-center gap-2 underline underline-offset-4 disabled:opacity-50"
              >
                {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                RESEND CONFIRMATION EMAIL
              </button>
            )}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-xs font-mono text-electric-400 mb-2 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition" 
                  placeholder="admin@insighter.ai" 
                  required
                />
            </div>
            
            <div>
                <label className="block text-xs font-mono text-electric-400 mb-2 uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition" 
                  placeholder="••••••••" 
                  required
                />
            </div>
            
            <div className="flex items-center justify-end">
               <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-electric-400 transition">Forgot Password?</Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-electric-600 hover:bg-electric-500 text-white font-bold py-3.5 rounded-xl shadow-glow-cyan hover:shadow-glow-cyan-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
        </form>
        
        <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link href="/signup" className="text-electric-400 hover:text-white transition">Sign Up</Link>
            </p>
            <Link href="/" className="text-sm text-slate-500 hover:text-white transition flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
        </div>
      </div>
    </div>
  );
}
