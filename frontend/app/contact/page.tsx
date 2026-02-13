'use client';

import Link from 'next/link';
import { ArrowLeft, Send, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would normally use axios to send the form data
    // axios.post('/api/contact', formData)...
  };

  return (
    <div className="min-h-screen bg-onyx-950 text-slate-300 relative overflow-hidden font-sans p-8 flex items-center justify-center">
       <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-20"></div>

       <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 relative z-10">
          
          {/* Info Section */}
          <div className="space-y-8">
             <div>
                <Link href="/" className="inline-flex items-center text-electric-400 hover:text-electric-300 transition mb-8">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
                <h1 className="text-4xl font-bold text-white mb-4 text-glow-subtle">Get in Touch</h1>
                <p className="text-slate-400">Have questions about The Insighter? Our team is ready to assist you.</p>
             </div>

             <div className="space-y-6">
                <div className="flex items-start">
                   <div className="w-10 h-10 bg-onyx-900 rounded-lg flex items-center justify-center text-electric-400 mr-4 border border-onyx-800">
                      <Mail className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="text-white font-medium">Email Us</h3>
                      <p className="text-sm text-slate-500">support@theinsighter.ai</p>
                   </div>
                </div>
                
                <div className="flex items-start">
                   <div className="w-10 h-10 bg-onyx-900 rounded-lg flex items-center justify-center text-neon-violet mr-4 border border-onyx-800">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="text-white font-medium">Headquarters</h3>
                      <p className="text-sm text-slate-500">Virtual <br/>Nairobi, Kenya</p>
                   </div>
                </div>

                <div className="flex items-start">
                   <div className="w-10 h-10 bg-onyx-900 rounded-lg flex items-center justify-center text-neon-emerald mr-4 border border-onyx-800">
                      <Phone className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="text-white font-medium">Call Us</h3>
                      <p className="text-sm text-slate-500">+254 116 130160</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Form Section */}
          <div className="glass-panel p-8 rounded-3xl border border-onyx-800 shadow-cyber-panel">
             {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                   <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-6 animate-bounce">
                      <Send className="w-8 h-8" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                   <p className="text-slate-400">We'll get back to you within 24 hours.</p>
                   <button onClick={() => setSubmitted(false)} className="mt-8 text-electric-400 hover:text-white transition">Send another message</button>
                </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">First Name</label>
                         <input type="text" className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition" placeholder="John" required />
                      </div>
                      <div>
                         <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">Last Name</label>
                         <input type="text" className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition" placeholder="Doe" required />
                      </div>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">Email Address</label>
                      <input type="email" className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition" placeholder="john@example.com" required />
                   </div>

                   <div>
                      <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">Message</label>
                      <textarea className="w-full bg-onyx-900/50 border border-onyx-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition h-32 resize-none" placeholder="How can we help you?" required></textarea>
                   </div>

                   <button type="submit" className="w-full bg-electric-600 hover:bg-electric-500 text-white font-bold py-4 rounded-xl shadow-glow-cyan hover:shadow-glow-cyan-lg transition duration-300 flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Send Message
                   </button>
                </form>
             )}
          </div>

       </div>
    </div>
  );
}
