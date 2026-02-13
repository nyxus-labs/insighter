'use client';

import { Settings, Shield, Key, Database, Globe, Trash2, Save, Bell, Users, Code, Activity, Plus } from 'lucide-react';
import { useState } from 'react';

export default function SettingsEnv() {
  const [activeSection, setActiveSection] = useState<'general' | 'security' | 'integrations' | 'api' | 'members'>('general');

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#0a0a0a] overflow-hidden border border-onyx-800 rounded-2xl">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-onyx-950 border-r border-onyx-800 flex flex-col py-6">
        <div className="px-6 mb-8">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Settings className="w-4 h-4" /> Workspace Config
          </h2>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'integrations', label: 'Integrations', icon: Globe },
            { id: 'api', label: 'API Keys', icon: Key },
            { id: 'members', label: 'Team Members', icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeSection === item.id 
                  ? 'bg-electric-600/10 text-electric-400 border border-electric-600/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-onyx-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-6 pt-6 border-t border-onyx-900">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <Trash2 className="w-4 h-4" />
            Delete Workspace
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-onyx-950/30 p-10 custom-scrollbar">
        <div className="max-w-3xl">
          {activeSection === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">General Settings</h1>
                <p className="text-slate-500 text-sm">Manage your workspace identity and core configuration.</p>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-onyx-800 bg-onyx-900/40 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Name</label>
                  <input 
                    type="text" 
                    defaultValue="Churn Prediction Model" 
                    className="w-full bg-onyx-950 border border-onyx-800 rounded-xl px-4 py-3 text-white focus:border-electric-600 focus:ring-1 focus:ring-electric-600/20 focus:outline-none transition-all" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea 
                    defaultValue="Predicting customer churn using transaction history and demographics." 
                    className="w-full bg-onyx-950 border border-onyx-800 rounded-xl px-4 py-3 text-white focus:border-electric-600 focus:ring-1 focus:ring-electric-600/20 focus:outline-none h-32 transition-all"
                  ></textarea>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-electric-600 hover:bg-electric-500 text-white rounded-xl font-bold transition shadow-lg shadow-electric-600/20">
                    <Save className="w-4 h-4" /> SAVE CHANGES
                  </button>
                  <button className="px-6 py-2.5 text-slate-400 hover:text-white transition text-sm font-bold">
                    CANCEL
                  </button>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-onyx-800 bg-onyx-900/40">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-400" /> Notifications
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Project Status Updates', desc: 'Receive alerts when your models finish training or deployment status changes.' },
                    { label: 'Security Alerts', desc: 'Get notified about unauthorized access attempts or API key usage.' },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-onyx-950/50 rounded-xl border border-onyx-800/50">
                      <div>
                        <p className="text-sm font-medium text-slate-300">{pref.label}</p>
                        <p className="text-xs text-slate-500">{pref.desc}</p>
                      </div>
                      <div className="w-10 h-5 bg-electric-600/20 border border-electric-600/30 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-electric-400 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Security & Access</h1>
                <p className="text-slate-500 text-sm">Control access policies and security protocols for this workspace.</p>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-onyx-800 bg-onyx-900/40 space-y-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-electric-400" /> Role-Based Access Control (RBAC)
                </h3>
                
                <div className="space-y-4">
                  {[
                    { role: 'Data Scientist', access: 'Full access to Notebooks, Experiments, and Datasets.' },
                    { role: 'Data Analyst', access: 'Read access to Datasets, full access to Visualization tools.' },
                    { role: 'AI/ML Engineer', access: 'Full access to Training pipelines and Deployment.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-onyx-950/50 rounded-xl border border-onyx-800/50">
                      <div>
                        <p className="text-sm font-bold text-white">{item.role}</p>
                        <p className="text-xs text-slate-500">{item.access}</p>
                      </div>
                      <button className="text-xs font-bold text-electric-400 hover:text-electric-300 transition">MANAGE</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-onyx-800 bg-onyx-900/40">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4 text-yellow-400" /> Security Policies
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-onyx-950/50 rounded-xl border border-onyx-800/50">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Enforce MFA for all members</p>
                      <p className="text-xs text-slate-500">Require multi-factor authentication to access this workspace.</p>
                    </div>
                    <div className="w-10 h-5 bg-onyx-800 border border-onyx-700 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-slate-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-onyx-950/50 rounded-xl border border-onyx-800/50">
                    <div>
                      <p className="text-sm font-medium text-slate-300">IP Whitelisting</p>
                      <p className="text-xs text-slate-500">Restrict access to specific IP ranges.</p>
                    </div>
                    <div className="w-10 h-5 bg-onyx-800 border border-onyx-700 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-slate-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">API Management</h1>
                <p className="text-slate-500 text-sm">Manage API keys and secrets for external integrations.</p>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-onyx-800 bg-onyx-900/40 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-electric-400" /> Active API Keys
                  </h3>
                  <button className="px-3 py-1.5 bg-electric-600 hover:bg-electric-500 text-white text-xs font-bold rounded-lg transition">
                    + NEW KEY
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Production Inference', key: 'ins_live_********************4a2b', created: '2 days ago' },
                    { name: 'Development Webhook', key: 'ins_test_********************9f1c', created: '1 month ago' },
                  ].map((key, i) => (
                    <div key={i} className="p-4 bg-onyx-950/50 rounded-xl border border-onyx-800/50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">{key.name}</p>
                        <code className="text-xs text-slate-500 font-mono">{key.key}</code>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-600 uppercase font-bold">Created {key.created}</span>
                        <button className="p-1.5 text-slate-500 hover:text-red-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Integrations</h1>
                <p className="text-slate-500 text-sm">Connect your workspace with third-party tools and services.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'GitHub', desc: 'Sync your notebooks and models with git repositories.', status: 'Connected', icon: Code },
                  { name: 'Slack', desc: 'Get real-time alerts and reports in your team channels.', status: 'Not Connected', icon: Globe },
                  { name: 'AWS S3', desc: 'Connect external data buckets for storage.', status: 'Connected', icon: Database },
                  { name: 'MLflow', desc: 'Sync experiments with an external MLflow server.', status: 'Not Connected', icon: Activity },
                ].map((int, i) => (
                  <div key={i} className="glass-panel p-6 rounded-2xl border border-onyx-800 bg-onyx-900/40 hover:border-onyx-700 transition group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-onyx-950 rounded-xl border border-onyx-800 group-hover:border-electric-600/30 transition">
                        <int.icon className="w-6 h-6 text-electric-400" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${int.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-onyx-800 text-slate-500 border border-onyx-700'}`}>
                        {int.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{int.name}</h3>
                    <p className="text-xs text-slate-500 mb-4">{int.desc}</p>
                    <button className="w-full py-2 bg-onyx-800 hover:bg-onyx-700 text-slate-300 text-xs font-bold rounded-lg border border-onyx-700 transition">
                      {int.status === 'Connected' ? 'CONFIGURE' : 'CONNECT'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'members' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Team Members</h1>
                <p className="text-slate-500 text-sm">Manage who has access to this workspace and their permission levels.</p>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-onyx-800 bg-onyx-900/40">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-electric-400" /> Current Members
                  </h3>
                  <button className="px-4 py-2 bg-electric-600 hover:bg-electric-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2">
                    <Plus className="w-4 h-4" /> INVITE MEMBER
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Alex Rivera', email: 'alex@insighter.ai', role: 'Admin', avatar: 'AR' },
                    { name: 'Sarah Chen', email: 'sarah.c@insighter.ai', role: 'Data Scientist', avatar: 'SC' },
                    { name: 'Marcus Vogt', email: 'm.vogt@insighter.ai', role: 'ML Engineer', avatar: 'MV' },
                  ].map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-onyx-950/50 rounded-xl border border-onyx-800/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-electric-600/10 border border-electric-600/20 rounded-full flex items-center justify-center text-electric-400 font-bold text-xs">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-xs font-medium text-slate-400">{member.role}</span>
                        <button className="p-1.5 text-slate-600 hover:text-red-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

