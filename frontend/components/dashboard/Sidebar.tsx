'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Folder, Database, Code, BarChart, Settings, LogOut, Workflow } from 'lucide-react';
import { useState } from 'react';
import { getFullName } from '@/utils/user';
import { useUser } from '@/contexts/UserContext';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: profile } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const avatarUrl = profile?.avatarUrl || null;

  const navItems = [
    { icon: <Folder />, label: 'Projects', href: '/dashboard' },
    { icon: <Database />, label: 'Data', href: '/dashboard/data' },
    { icon: <Code />, label: 'Notebooks', href: '/dashboard/notebooks' },
    { icon: <BarChart />, label: 'Models', href: '/dashboard/models' },
    { icon: <Workflow />, label: 'Workflow', href: '/dashboard/workflow' },
  ];

  return (
    <aside className="w-20 flex flex-col items-center py-6 gap-6 bg-onyx-950/80 backdrop-blur-md border-r border-onyx-800/50 z-20 h-screen sticky top-0">
      <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
        <Image 
          src="/logo.png" 
          alt="The Insighter Logo" 
          fill
          className="object-contain"
          priority
        />
      </div>
      
      <nav className="flex flex-col gap-6 w-full px-2 mt-4">
        {navItems.map((item) => (
          <NavItem 
            key={item.href} 
            icon={item.icon} 
            label={item.label} 
            href={item.href} 
            active={pathname === item.href} 
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-6 w-full px-2 mb-4">
        <NavItem icon={<Settings />} label="Settings" href="/dashboard/settings" active={pathname === '/dashboard/settings'} />
        
        <div onClick={handleLogout} className="group w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer text-slate-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/50 mx-auto relative">
           <LogOut className="w-5 h-5" />
           <div className="absolute left-16 bg-onyx-900 text-xs font-bold px-3 py-1.5 rounded-lg border border-onyx-700 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none shadow-xl translate-x-[-10px] group-hover:translate-x-0 text-white">
              Sign Out
              <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-onyx-900 border-l border-b border-onyx-700 rotate-45"></div>
           </div>
        </div>

        <div className="relative flex justify-center">
          <button
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            className="w-10 h-10 rounded-full bg-onyx-800 border border-onyx-700 hover:border-electric-400/50 transition cursor-pointer flex items-center justify-center shrink-0 overflow-hidden"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={profile ? getFullName(profile) : 'User avatar'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-semibold text-slate-200">
                {(profile ? getFullName(profile) : 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-64 bg-onyx-900 border border-onyx-700 rounded-2xl shadow-xl p-4 z-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-onyx-800 border border-onyx-700 flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={profile ? getFullName(profile) : 'User avatar'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-semibold text-slate-200">
                      {(profile ? getFullName(profile) : 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {profile ? getFullName(profile) : 'User'}
                  </p>
                  <p className="text-xs text-electric-400 truncate">
                    @{profile?.username || 'user'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {profile?.email || 'No email configured'}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone</span>
                  <span className="text-slate-200">
                    {profile?.phone || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`
        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer group relative mx-auto
        ${active 
          ? 'bg-electric-600/20 text-electric-400 border border-electric-600/50 shadow-glow-cyan' 
          : 'text-slate-500 hover:bg-onyx-800 hover:text-slate-200 border border-transparent hover:border-onyx-700 hover:scale-105 hover:shadow-lg'}
      `}>
        {icon}
        {/* Tooltip */}
        <div className="absolute left-16 bg-onyx-900 text-xs font-bold px-3 py-1.5 rounded-lg border border-onyx-700 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none shadow-xl translate-x-[-10px] group-hover:translate-x-0 text-white">
          {label}
          {/* Arrow */}
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-onyx-900 border-l border-b border-onyx-700 rotate-45"></div>
        </div>
      </div>
    </Link>
  );
}
