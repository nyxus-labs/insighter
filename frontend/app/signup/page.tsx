'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Zap, UserPlus, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: email.split('@')[0],
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // Email confirmation is required
        setError('success:Please check your email to confirm your account before logging in.');
      } else {
        // Successful signup and already signed in (autofirm enabled)
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
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
        
        <h1 className="text-3xl font-bold text-center text-white mb-2 text-glow-subtle">Create Account</h1>
        <p className="text-center text-slate-400 mb-8 font-mono text-sm">Join the elite data intelligence network.</p>
        
        {error && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            error.startsWith('success:') 
              ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400' 
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
          }`}>
            <AlertCircle className="w-5 h-5" />
            {error.startsWith('success:') ? error.replace('success:', '') : error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
            <div>
                <label className="block text-xs font-mono text-neon-violet mb-2 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-violet focus:shadow-glow-violet transition" 
                  placeholder="scientist@insighter.ai" 
                  required
                />
            </div>
            
            <div>
                <label className="block text-xs font-mono text-neon-violet mb-2 uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-violet focus:shadow-glow-violet transition" 
                  placeholder="••••••••" 
                  required
                  minLength={6}
                />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-neon-violet hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl shadow-glow-violet hover:shadow-glow-violet-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? 'Creating Account...' : 'SIGN UP'}
            </button>
        </form>
        
        <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-neon-violet hover:text-white transition">Sign In</Link>
            </p>
            <Link href="/" className="text-sm text-slate-500 hover:text-white transition flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
        </div>
      </div>
    </div>
  );
}
