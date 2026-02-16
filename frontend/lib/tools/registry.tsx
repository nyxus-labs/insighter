'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Tool } from '../constants/tools';
import { ToolEnvironmentProps } from './types';
import { Loader2 } from 'lucide-react';

// Loading component
const EnvironmentLoader = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
    <Loader2 className="w-8 h-8 animate-spin mb-4 text-electric-400" />
    <p>Initializing Environment...</p>
  </div>
);

// Dynamic imports for environments
const NotebookEnv = dynamic(() => import('@/components/studio/environments/NotebookEnv'), {
  loading: () => <EnvironmentLoader />,
});

const DataEnv = dynamic(() => import('@/components/studio/environments/DataEnv'), {
  loading: () => <EnvironmentLoader />,
});

const ExperimentsEnv = dynamic(() => import('@/components/studio/environments/ExperimentsEnv'), {
  loading: () => <EnvironmentLoader />,
});

const LabelingEnv = dynamic(() => import('@/components/studio/environments/LabelingEnv'), {
  loading: () => <EnvironmentLoader />,
});

const DeploymentEnv = dynamic(() => import('@/components/studio/environments/DeploymentEnv'), {
  loading: () => <EnvironmentLoader />,
});

const SettingsEnv = dynamic(() => import('@/components/studio/environments/SettingsEnv'), {
  loading: () => <EnvironmentLoader />,
});

// Environment Map
const ENVIRONMENT_MAP: Record<string, React.ComponentType<any>> = {
  notebook: NotebookEnv,
  data: DataEnv,
  experiment: ExperimentsEnv,
  labeling: LabelingEnv,
  deployment: DeploymentEnv,
  settings: SettingsEnv,
};

export function ToolRenderer({ tool, projectId }: ToolEnvironmentProps) {
  const EnvironmentComponent = ENVIRONMENT_MAP[tool.environmentType];

  if (!EnvironmentComponent) {
    // Return null or handle fallback in parent
    return null; 
  }

  return <EnvironmentComponent tool={tool} projectId={projectId} />;
}
