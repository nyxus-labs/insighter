import { useState, useCallback, useEffect, useRef } from 'react';
import { SerializableTool } from '@/lib/tools/types';
import api from '@/lib/api';
import { createClient } from '@/utils/supabase/client';

interface UseToolOptions {
  tool: SerializableTool;
  projectId: string;
  enableRealtime?: boolean;
}

interface ToolState {
  isInitializing: boolean;
  isExecuting: boolean;
  isReady: boolean;
  error: string | null;
  data: any;
  realtimeData: any;
}

export function useTool({ tool, projectId, enableRealtime = false }: UseToolOptions) {
  const [state, setState] = useState<ToolState>({
    isInitializing: false,
    isExecuting: false,
    isReady: false,
    error: null,
    data: null,
    realtimeData: null,
  });

  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket Connection Logic
  const connectWebSocket = useCallback(async () => {
    // Get token from Supabase session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const WS_URL = API_URL.replace('http', 'ws');
    
    // Pass token as sub-protocol for authentication
    const ws = new WebSocket(
      `${WS_URL}/ws/tools/${tool.environmentType}/${projectId}`,
      token ? ['auth', token] : undefined
    );

    ws.onopen = () => {
      // Connection established
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setState(prev => ({ ...prev, realtimeData: payload }));
      } catch (e) {
        // Error parsing message
      }
    };

    ws.onerror = (error) => {
      // WebSocket error occurred
    };

    ws.onclose = () => {
      // Connection closed
    };

    wsRef.current = ws;
  }, [tool.environmentType, projectId]);

  // Initialize tool environment
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, isInitializing: true, error: null }));
    try {
      const endpoint = `/api/tools/${tool.environmentType}/initialize/${projectId}`;
      const response = await api.post(endpoint);
      
      const data = response.data;
      
      setState(prev => ({ 
        ...prev, 
        isInitializing: false, 
        isReady: true,
        data: data
      }));

      // Connect WebSocket if real-time is enabled
      if (enableRealtime) {
        await connectWebSocket();
      }
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isInitializing: false, 
        error: err.response?.data?.detail || err.message || 'Failed to initialize tool' 
      }));
    }
  }, [tool.environmentType, projectId, enableRealtime, connectWebSocket]);

  // Execute an action on the backend tool
  const execute = useCallback(async (action: string, payload: any) => {
    setState(prev => ({ ...prev, isExecuting: true, error: null }));
    try {
      const endpoint = `/api/tools/${tool.environmentType}/execute/${action}`;
      const response = await api.post(endpoint, {
        ...payload,
        project_id: projectId
      });
      
      const result = response.data;

      setState(prev => ({ ...prev, isExecuting: false }));
      return result;
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isExecuting: false, 
        error: err.response?.data?.detail || err.message || 'Execution failed' 
      }));
      throw err;
    }
  }, [tool.environmentType, projectId]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    initialize,
    execute
  };
}
