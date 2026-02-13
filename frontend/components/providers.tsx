'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ProjectStateProvider } from '@/lib/contexts/ProjectStateContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ProjectStateProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ProjectStateProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
