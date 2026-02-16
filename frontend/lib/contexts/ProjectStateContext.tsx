'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ProjectState {
  currentProjectId: string | null;
  data: Record<string, any>;
  configurations: Record<string, any>;
  workflow: string[]; // List of tool IDs in current workflow
  activeToolId: string | null;
}

interface ProjectStateContextType {
  state: ProjectState;
  updateData: (key: string, value: any) => void;
  updateConfig: (toolId: string, config: any) => void;
  setProjectId: (id: string) => void;
  setWorkflow: (toolIds: string[]) => void;
  setActiveTool: (toolId: string) => void;
  resetState: () => void;
}

const ProjectStateContext = createContext<ProjectStateContextType | undefined>(undefined);

export function ProjectStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProjectState>({
    currentProjectId: null,
    data: {},
    configurations: {},
    workflow: [],
    activeToolId: null,
  });

  // Persist state to localStorage for session continuity
  useEffect(() => {
    const savedState = localStorage.getItem('insighter_project_state');
    if (savedState) {
      try {
        setState(JSON.parse(savedState));
      } catch (e) {
        console.error('Failed to parse saved project state');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('insighter_project_state', JSON.stringify(state));
  }, [state]);

  const updateData = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value }
    }));
  }, []);

  const updateConfig = useCallback((toolId: string, config: any) => {
    setState(prev => ({
      ...prev,
      configurations: { ...prev.configurations, [toolId]: config }
    }));
  }, []);

  const setProjectId = useCallback((id: string) => {
    setState(prev => {
      if (prev.currentProjectId === id) return prev;
      return { ...prev, currentProjectId: id };
    });
  }, []);

  const setWorkflow = useCallback((toolIds: string[]) => {
    setState(prev => {
      // Simple array comparison to avoid redundant updates
      if (JSON.stringify(prev.workflow) === JSON.stringify(toolIds)) return prev;
      return { ...prev, workflow: toolIds };
    });
  }, []);

  const setActiveTool = useCallback((toolId: string) => {
    setState(prev => {
      if (prev.activeToolId === toolId) return prev;
      return { ...prev, activeToolId: toolId };
    });
  }, []);

  const resetState = useCallback(() => {
    setState({
      currentProjectId: null,
      data: {},
      configurations: {},
      workflow: [],
      activeToolId: null,
    });
    localStorage.removeItem('insighter_project_state');
  }, []);

  return (
    <ProjectStateContext.Provider value={{ 
      state, 
      updateData, 
      updateConfig, 
      setProjectId, 
      setWorkflow, 
      setActiveTool,
      resetState 
    }}>
      {children}
    </ProjectStateContext.Provider>
  );
}

export function useProjectState() {
  const context = useContext(ProjectStateContext);
  if (context === undefined) {
    throw new Error('useProjectState must be used within a ProjectStateProvider');
  }
  return context;
}
