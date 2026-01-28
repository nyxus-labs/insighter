'use client';

import { ToolProvider } from '@/contexts/ToolContext';
import ToolMonitor from '@/components/studio/ToolMonitor';
import React from 'react';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToolProvider>
      {children}
      <ToolMonitor />
    </ToolProvider>
  );
}
