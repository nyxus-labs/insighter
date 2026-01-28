import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Database, Code, BarChart, Layers, Zap, Terminal, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-30 fixed"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-electric-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="p-6 border-b border-onyx-800/50 flex justify-between items-center bg-onyx-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative flex items-center justify-center group-hover:scale-110 transition duration-500">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  fill
                  className="object-contain"
                />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white text-glow-subtle font-mono group-hover:text-glow transition duration-500">
                THE INSIGHTER
                </h1>
                <p className="text-[10px] text-electric-400 font-mono tracking-widest uppercase opacity-80 group-hover:opacity-100 transition">Where Data Becomes Insight</p>
            </div>
        </div>
        
        <nav className="flex gap-4 text-sm font-medium hidden md:flex items-center">
          <Link href="#features" className="px-4 py-2 rounded-full hover:bg-onyx-800 text-slate-400 hover:text-electric-400 transition hover:shadow-glow-cyan">Features</Link>
          <Link href="/docs" className="px-4 py-2 rounded-full hover:bg-onyx-800 text-slate-400 hover:text-electric-400 transition hover:shadow-glow-cyan">Docs</Link>
          <Link href="/signup" className="px-4 py-2 rounded-full hover:bg-onyx-800 text-slate-400 hover:text-electric-400 transition hover:shadow-glow-cyan">Pricing</Link>
          <Link href="/login" className="px-6 py-2 rounded-full border border-electric-600/50 text-electric-400 hover:bg-electric-600/20 hover:shadow-glow-cyan transition">Sign In</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
        <div className="max-w-5xl space-y-12 mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-onyx-900/80 border border-electric-400/30 text-xs font-mono text-electric-400 mb-4 animate-float backdrop-blur-md shadow-glow-cyan">
             <span className="w-2 h-2 rounded-full bg-electric-400 animate-pulse"></span>
             SYSTEM OPTIMIZED FOR DATA INTELLIGENCE
          </div>

          <h2 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-tight text-white">
            Data Science, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 via-neon-blue to-neon-violet text-glow">Reimagined.</span>
          </h2>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A unified, web-first IDE for <span className="text-slate-200 font-semibold">data analytics, machine learning, and visualization</span>.
            Code, label, train, and deploy—all in one elite command center.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
            <Link href="/dashboard" className="group relative px-10 py-5 bg-electric-600 hover:bg-electric-500 rounded-full font-bold flex items-center justify-center gap-3 transition shadow-glow-cyan hover:shadow-glow-cyan-lg hover:-translate-y-1">
              <span className="relative z-10 flex items-center gap-2 text-white">LAUNCH STUDIO <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" /></span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-electric-400 to-neon-blue opacity-0 group-hover:opacity-40 transition duration-500 blur-xl"></div>
            </Link>
            
            <Link href="https://github.com/onyx-dev-labs/insighter" className="px-10 py-5 bg-onyx-900/50 hover:bg-onyx-800 rounded-full font-medium transition border border-onyx-700 hover:border-white/20 hover:text-white flex items-center justify-center gap-3 group backdrop-blur-sm hover:shadow-cyber-panel">
              <Terminal className="w-5 h-5 text-slate-400 group-hover:text-white transition" />
              View on GitHub
            </Link>
          </div>
        </div>

        <div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full px-4 scroll-mt-24">
          <FeatureCard 
            icon={<Code className="w-8 h-8 text-electric-400" />}
            title="Notebooks"
            description="Interactive Python notebooks with real-time execution and persistent kernels."
            glow="group-hover:shadow-glow-cyan"
            border="group-hover:border-electric-400/50"
          />
          <FeatureCard 
            icon={<Database className="w-8 h-8 text-neon-violet" />}
            title="Data Management"
            description="Upload, version, and query your datasets effortlessly with visual SQL tools."
            glow="group-hover:shadow-glow-violet"
            border="group-hover:border-neon-violet/50"
          />
          <FeatureCard 
            icon={<Layers className="w-8 h-8 text-neon-emerald" />}
            title="Labeling"
            description="Annotate images, audio, and video directly in the browser with AI assistance."
            glow="group-hover:shadow-glow-emerald"
            border="group-hover:border-neon-emerald/50"
          />
          <FeatureCard 
            icon={<BarChart className="w-8 h-8 text-orange-400" />}
            title="Experiments"
            description="Track ML models, compare runs, and visualize metrics with built-in MLflow."
            glow="group-hover:shadow-orange-400/20"
            border="group-hover:border-orange-400/50"
          />
        </div>

        <div className="mt-32 w-full max-w-7xl px-4 scroll-mt-24">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Powering Your Workflow</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                 The Insighter integrates seamlessly with the industry's most powerful tools and frameworks.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TechCategory title="Data Science" items={['Python', 'Jupyter', 'Pandas', 'NumPy', 'SciPy', 'Statsmodels']} color="text-blue-400" />
              <TechCategory title="Data Analytics" items={['SQL', 'PostgreSQL', 'DuckDB', 'Apache Arrow', 'Excel', 'CSV / JSON']} color="text-emerald-400" />
              <TechCategory title="Machine Learning / AI" items={['Scikit-learn', 'TensorFlow', 'Keras', 'PyTorch', 'XGBoost', 'LightGBM', 'CatBoost', 'ONNX', 'MLflow']} color="text-purple-400" />
              
              <TechCategory title="Data Cleaning & Preparation" items={['Pandas Profiling', 'ydata-profiling', 'Great Expectations', 'OpenRefine', 'Missingno', 'Pyjanitor']} color="text-teal-400" />
              <TechCategory title="Visualization" items={['Matplotlib', 'Seaborn', 'Plotly', 'Altair', 'Bokeh', 'D3.js', 'Recharts']} color="text-pink-400" />
              <TechCategory title="Data Storytelling & Reporting" items={['Dash', 'Streamlit', 'Observable', 'Markdown', 'Quarto', 'Reveal.js']} color="text-orange-400" />
              
              <TechCategory title="Data Labeling & Annotation" items={['Label Studio', 'CVAT', 'Doccano', 'Roboflow', 'Makesense.ai']} color="text-indigo-400" />
              <TechCategory title="Collaboration & Versioning" items={['Git', 'GitHub', 'Git LFS', 'DVC']} color="text-slate-400" />
              <TechCategory title="Deployment & Serving" items={['FastAPI', 'Flask', 'Docker', 'ONNX Runtime']} color="text-cyan-400" />
              
              <TechCategory title="Cloud & Platform" items={['Supabase', 'Vercel', 'PostgreSQL', 'Object Storage']} color="text-sky-400" />
              <TechCategory title="IDE / Developer Experience" items={['Monaco Editor', 'Command Palette', 'Terminal Emulator']} color="text-yellow-400" />
              <TechCategory title="Automation & Pipelines" items={['Apache Airflow', 'Prefect', 'Dagster']} color="text-rose-400" />
           </div>
        </div>
      </main>

      <footer className="p-10 border-t border-onyx-800/50 text-center text-slate-600 text-sm font-mono relative z-10 bg-onyx-950/80 backdrop-blur-md">
        <div className="flex justify-center items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-electric-400 animate-pulse" />
            <span className="tracking-widest uppercase">System Operational</span>
        </div>
        <p>© 2026 THE INSIGHTER ENTERPRISE. By Onyx Dev Labs.</p>
      </footer>
    </div>
  );
}

function TechCategory({ title, items, color }: { title: string, items: string[], color: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-onyx-800 hover:border-white/10 transition group">
       <h3 className={`text-lg font-bold mb-4 ${color} flex items-center gap-2`}>
          <span className={`w-2 h-2 rounded-full bg-current opacity-70`}></span>
          {title}
       </h3>
       <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
             <span key={idx} className="px-2.5 py-1 rounded-md bg-onyx-900 border border-onyx-800 text-xs text-slate-400 font-mono hover:text-white hover:border-white/20 transition cursor-default">
                {item}
             </span>
          ))}
       </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, glow, border }: any) {
  return (
    <div className={`
        glass-panel p-8 rounded-3xl border border-onyx-800/50 transition-all duration-300 text-left group hover:-translate-y-2 relative overflow-hidden
        ${border} ${glow}
    `}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
      
      <div className="mb-6 transform group-hover:scale-110 transition duration-300 bg-onyx-900/50 w-16 h-16 rounded-2xl flex items-center justify-center border border-onyx-800 group-hover:border-white/10 shadow-lg">
          {icon}
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-slate-200 group-hover:text-white transition">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
