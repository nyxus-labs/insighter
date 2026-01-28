import { useState, useCallback } from 'react';
import { SerializableTool } from '@/lib/tools/types';
import config from '@/lib/config';

interface UseToolOptions {
  tool: SerializableTool;
  projectId: string;
}

interface ToolState {
  isInitializing: boolean;
  isExecuting: boolean;
  isReady: boolean;
  error: string | null;
  data: any;
}

export function useTool({ tool, projectId }: UseToolOptions) {
  const [state, setState] = useState<ToolState>({
    isInitializing: false,
    isExecuting: false,
    isReady: false,
    error: null,
    data: null,
  });

  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, isInitializing: true, error: null }));
    try {
      const baseUrl = config.api.baseUrl || 'http://localhost:8000';
      const endpoint = `${baseUrl}/api/tools/${tool.environmentType}/initialize/${projectId}`;
      const response = await fetch(endpoint, { method: 'POST' });
      
      if (!response.ok) {
         throw new Error(`Initialization failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        isInitializing: false, 
        isReady: true,
        data: data
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isInitializing: false, 
        error: err.message || 'Failed to initialize tool' 
      }));
    }
  }, [tool.environmentType, projectId]);

  const execute = useCallback(async (action: string, payload: any) => {
    setState(prev => ({ ...prev, isExecuting: true, error: null }));
    try {
      const baseUrl = config.api.baseUrl || 'http://localhost:8000';
      const endpoint = `${baseUrl}/api/tools/${tool.environmentType}/execute/${action}`;
      const response = await fetch(endpoint, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
         throw new Error(`Execution failed: ${response.statusText}`);
      }

      const result = await response.json();

      setState(prev => ({ ...prev, isExecuting: false }));
      return result;
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isExecuting: false, 
        error: err.message || 'Execution failed' 
      }));
      throw err;
    }
  }, [tool.environmentType]);

  return {
    ...state,
    initialize,
    execute
  };
}
