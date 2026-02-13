'use client';

import { useUser } from '@/contexts/UserContext';
import WorkflowDashboard from './WorkflowDashboard';
import { 
  Shield, 
  Users, 
  Settings, 
  FileText, 
  TrendingUp, 
  Layout,
  Cpu,
  Database
} from 'lucide-react';

export default function RoleDashboard() {
  const { user } = useUser();
  const role = user?.role || 'user';

  const renderRoleWidgets = () => {
    switch (role) {
      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Widget icon={Shield} title="System Security" value="Normal" color="text-blue-400" />
            <Widget icon={Users} title="Total Users" value="1,248" color="text-purple-400" />
            <Widget icon={Settings} title="Active Configs" value="42" color="text-amber-400" />
            <Widget icon={FileText} title="Audit Logs" value="View All" color="text-emerald-400" isLink />
          </div>
        );
      case 'manager':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Widget icon={TrendingUp} title="Team Velocity" value="+12%" color="text-emerald-400" />
            <Widget icon={Users} title="Direct Reports" value="8" color="text-blue-400" />
            <Widget icon={Layout} title="Active Projects" value="15" color="text-indigo-400" />
            <Widget icon={FileText} title="Weekly Report" value="Generate" color="text-rose-400" isLink />
          </div>
        );
      case 'ai_ml_engineer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Widget icon={Cpu} title="GPU Utilization" value="64%" color="text-pink-400" />
            <Widget icon={Activity} title="Model Training" value="2 Running" color="text-electric-400" />
            <Widget icon={Database} title="Dataset Size" value="1.2 TB" color="text-amber-400" />
            <Widget icon={TrendingUp} title="Accuracy" value="98.4%" color="text-emerald-400" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {renderRoleWidgets()}
      <WorkflowDashboard role={role} />
    </div>
  );
}

function Widget({ icon: Icon, title, value, color, isLink = false }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-colors group cursor-pointer">
      <div className={`p-3 bg-slate-950 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-slate-500 text-xs font-mono uppercase tracking-wider">{title}</h4>
        <p className={`text-lg font-bold text-white ${isLink ? 'group-hover:text-electric-400 transition-colors' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

import { Activity } from 'lucide-react';
