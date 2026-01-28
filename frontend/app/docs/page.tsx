import Link from 'next/link';
import Image from 'next/image';
import { Book, Code, Terminal, Shield, Cpu, Layers, Compass, Sparkles, Wrench, Rocket } from 'lucide-react';

export default function Docs() {
  return (
    <div className="min-h-screen bg-onyx-950 text-slate-300 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-20 fixed"></div>
      
      <header className="sticky top-0 z-50 bg-onyx-950/80 backdrop-blur-md border-b border-onyx-800/50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 relative flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="The Insighter Logo"
                width={32}
                height={32}
                className="object-contain rounded-md shadow-glow-cyan group-hover:scale-110 transition"
                priority
              />
            </div>
            <span className="font-bold text-white tracking-tight">
              THE INSIGHTER <span className="text-electric-400">DOCS</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
           <Link href="/login" className="px-5 py-2 bg-electric-600 hover:bg-electric-500 text-white rounded-full text-sm font-bold transition shadow-glow-cyan hover:shadow-glow-cyan-lg">
              Get Started
           </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 hidden lg:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r border-onyx-800/50 py-8 pr-6">
           <nav className="space-y-8">
              <div>
                 <h3 className="text-xs font-mono text-electric-400 uppercase tracking-widest mb-4">Introduction</h3>
                 <ul className="space-y-2 text-sm">
                    <li><a href="#overview" className="block text-slate-200 hover:text-electric-400 transition">Overview</a></li>
                    <li><a href="#quick-start" className="block text-slate-500 hover:text-electric-400 transition">Quick Start</a></li>
                    <li><a href="#architecture" className="block text-slate-500 hover:text-electric-400 transition">Architecture</a></li>
                 </ul>
              </div>
              <div>
                 <h3 className="text-xs font-mono text-neon-violet uppercase tracking-widest mb-4">Core Concepts</h3>
                 <ul className="space-y-2 text-sm">
                    <li><a href="#projects" className="block text-slate-500 hover:text-neon-violet transition">Projects</a></li>
                    <li><a href="#datasets" className="block text-slate-500 hover:text-neon-violet transition">Datasets</a></li>
                    <li><a href="#notebooks" className="block text-slate-500 hover:text-neon-violet transition">Notebooks</a></li>
                 </ul>
              </div>
              <div>
                 <h3 className="text-xs font-mono text-neon-emerald uppercase tracking-widest mb-4">API Reference</h3>
                 <ul className="space-y-2 text-sm">
                    <li><a href="#auth-api" className="block text-slate-500 hover:text-neon-emerald transition">Authentication</a></li>
                    <li><a href="#model-api" className="block text-slate-500 hover:text-neon-emerald transition">Model Registry</a></li>
                 </ul>
              </div>
           </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-12 lg:px-12 max-w-4xl">
           <section id="overview" className="mb-16">
              <h1 className="text-4xl font-bold text-white mb-6">Documentation</h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                 The Insighter is an enterprise-grade Data Science & Analytics IDE designed for the modern web. 
                 It unifies the entire ML lifecycle—from data ingestion to model deployment—into a single, secure command center.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="glass-panel p-6 rounded-2xl border border-onyx-800">
                    <Shield className="w-8 h-8 text-electric-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Enterprise Security</h3>
                    <p className="text-sm text-slate-400">Role-based access control, encrypted storage, and isolated execution environments.</p>
                 </div>
                 <div className="glass-panel p-6 rounded-2xl border border-onyx-800">
                    <Cpu className="w-8 h-8 text-neon-violet mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">High Performance</h3>
                    <p className="text-sm text-slate-400">Powered by optimized Python kernels (Pandas, PyTorch, TensorFlow) running on the edge.</p>
                 </div>
              </div>
           </section>

           <section id="quick-start" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 <Terminal className="w-6 h-6 text-neon-emerald" /> Quick Start
              </h2>
              <div className="prose prose-invert max-w-none">
                 <p className="text-slate-400 mb-4">Initialize a new project using the CLI or Dashboard:</p>
                 <div className="bg-onyx-900 rounded-xl p-4 border border-onyx-800 font-mono text-sm text-slate-300 shadow-inner">
                    <span className="text-electric-400">$</span> insighter create project --name "Churn-Analysis" --type classification<br/>
                    <span className="text-slate-500">Initializing environment... Done.</span><br/>
                    <span className="text-electric-400">$</span> insighter studio open
                 </div>
              </div>
           </section>

           <section id="learning-guide" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Compass className="w-6 h-6 text-neon-emerald" /> Learning Guide
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-onyx-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Getting Started</h3>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>Sign up and create your first project.</li>
                    <li>Connect a dataset from files or databases.</li>
                    <li>Launch the Studio workspace to explore tools.</li>
                  </ul>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-onyx-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Advanced Examples</h3>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>End‑to‑end churn prediction pipeline.</li>
                    <li>Computer vision labeling and deployment.</li>
                    <li>AB‑testing models in production.</li>
                  </ul>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-onyx-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Best Practices</h3>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>Isolate environments per project.</li>
                    <li>Version all datasets and models.</li>
                    <li>Use role‑based access for sensitive data.</li>
                  </ul>
                </div>
              </div>
           </section>

           <section id="usage" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Book className="w-6 h-6 text-electric-400" /> Usage Instructions
              </h2>
              <div className="space-y-8 text-sm text-slate-400">
                <div>
                  <h3 className="text-base font-semibold text-white mb-2">Installation and Configuration</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Clone the repository and install dependencies for frontend and backend.</li>
                    <li>Configure environment variables in local .env files.</li>
                    <li>Run the backend API server and launch the Next.js frontend.</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-2">Basic Operations</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use Dashboard to navigate projects, datasets, notebooks, and models.</li>
                    <li>Open Studio to run notebooks, manage experiments, and label data.</li>
                    <li>Deploy trained models to staging or production environments.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-2">Advanced Functions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Configure CI pipelines to run tests and quality checks.</li>
                    <li>Integrate external data warehouses or feature stores.</li>
                    <li>Set up monitoring dashboards for latency and model drift.</li>
                  </ul>
                </div>
              </div>
           </section>

           <section id="tools-resources" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Wrench className="w-6 h-6 text-neon-violet" /> Tools and Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-400">
                <div className="glass-panel p-6 rounded-2xl border border-onyx-800">
                  <h3 className="text-base font-semibold text-white mb-3">Developer Toolkit</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>VS Code workspace configuration.</li>
                    <li>Preconfigured ESLint and TypeScript rules.</li>
                    <li>Python tooling with virtual environments and formatters.</li>
                  </ul>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-onyx-800">
                  <h3 className="text-base font-semibold text-white mb-3">Integrations</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Supabase authentication and database.</li>
                    <li>MLflow experiment tracking.</li>
                    <li>Docker‑based deployment targets.</li>
                  </ul>
                </div>
              </div>
           </section>

           <section id="future-plans" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Rocket className="w-6 h-6 text-electric-600" /> Future Plans
              </h2>
              <div className="space-y-4 text-sm text-slate-400">
                <p>
                  The roadmap focuses on deeper collaboration features, richer automation, and extended integrations with cloud providers and MLOps platforms.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Real‑time collaborative notebooks and comments.</li>
                  <li>Automated feature store synchronization and lineage tracking.</li>
                  <li>One‑click deployment to managed Kubernetes clusters.</li>
                  <li>Enhanced observability with built‑in alerting and dashboards.</li>
                </ul>
              </div>
           </section>

           <section id="architecture" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 <Layers className="w-6 h-6 text-neon-blue" /> System Architecture
              </h2>
              <p className="text-slate-400 mb-6">
                 The platform is built on a microservices architecture, utilizing Next.js for the frontend and FastAPI for the computation layer.
              </p>
              <div className="glass-panel p-8 rounded-2xl border border-onyx-800 flex items-center justify-center bg-onyx-900/50">
                 <div className="text-center">
                    <div className="inline-block px-4 py-2 rounded bg-electric-600/20 text-electric-400 border border-electric-600/50 mb-4">Client (Next.js)</div>
                    <div className="h-8 w-px bg-slate-700 mx-auto"></div>
                    <div className="inline-block px-4 py-2 rounded bg-neon-violet/20 text-neon-violet border border-neon-violet/50 my-4">API Gateway (FastAPI)</div>
                    <div className="h-8 w-px bg-slate-700 mx-auto"></div>
                    <div className="flex gap-4 justify-center mt-4">
                       <div className="px-4 py-2 rounded bg-slate-800 text-slate-300 border border-slate-700">Supabase Auth</div>
                       <div className="px-4 py-2 rounded bg-slate-800 text-slate-300 border border-slate-700">PostgreSQL</div>
                       <div className="px-4 py-2 rounded bg-slate-800 text-slate-300 border border-slate-700">S3 Storage</div>
                    </div>
                 </div>
             </div>
           </section>

           <footer className="mt-20 pt-10 border-t border-onyx-800/50 text-center text-slate-600 text-sm font-mono">
              <p>© 2026 THE INSIGHTER ENTERPRISE. By Onyx Dev Labs.</p>
           </footer>
        </main>
      </div>
    </div>
  );
}
