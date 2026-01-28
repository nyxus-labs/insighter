import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DashboardProviders from '@/components/dashboard/DashboardProviders';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProviders>
      <div className="min-h-screen bg-onyx-950 text-slate-300 flex font-sans overflow-hidden bg-cyber-grid">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-cyber-grid opacity-20"></div>
          <Header />
          <div className="flex-1 overflow-y-auto p-10 relative z-10">
              {children}
          </div>
        </main>
      </div>
    </DashboardProviders>
  );
}
