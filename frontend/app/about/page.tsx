import Link from 'next/link';
import { ArrowLeft, Shield, Cpu, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-onyx-950 text-slate-300 relative overflow-hidden font-sans p-8">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-20"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center text-electric-400 hover:text-electric-300 transition mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-white mb-4 text-glow-subtle">About <span className="text-electric-400">The Insighter</span></h1>
          <p className="text-xl text-slate-400 max-w-2xl">
            Where Data Becomes Insight. The next generation of data science tools for the enterprise.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass-panel p-6 rounded-2xl border border-onyx-800 hover:border-electric-600/50 transition duration-300">
            <div className="w-12 h-12 bg-electric-600/20 rounded-xl flex items-center justify-center mb-4 text-electric-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Enterprise Secure</h3>
            <p className="text-sm text-slate-400">Built with military-grade security protocols and isolated execution environments.</p>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-onyx-800 hover:border-electric-600/50 transition duration-300">
            <div className="w-12 h-12 bg-neon-violet/20 rounded-xl flex items-center justify-center mb-4 text-neon-violet">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">High Performance</h3>
            <p className="text-sm text-slate-400">Powered by optimized kernels and distributed computing for massive datasets.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-onyx-800 hover:border-electric-600/50 transition duration-300">
            <div className="w-12 h-12 bg-neon-emerald/20 rounded-xl flex items-center justify-center mb-4 text-neon-emerald">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Web Native</h3>
            <p className="text-sm text-slate-400">Access your workspace from anywhere. No local installation required.</p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-onyx-800">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            We believe that data science should be accessible, collaborative, and secure. The Insighter bridges the gap between local notebooks and enterprise deployment, providing a unified platform for teams to discover, analyze, and share insights.
          </p>
          <div className="flex gap-4">
             <div className="h-1 w-20 bg-gradient-to-r from-electric-600 to-transparent rounded-full"></div>
             <div className="h-1 w-10 bg-neon-violet rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
