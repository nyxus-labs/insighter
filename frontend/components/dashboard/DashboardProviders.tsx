'use client';

import { UserProvider } from '@/contexts/UserContext';
import React from 'react';

export default function DashboardProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}
