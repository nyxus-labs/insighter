'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';
import { TOOLS } from '@/lib/constants/tools';
import { MessageSchemas, BaseMessageSchema, ToolMessage } from '@/lib/tools/schemas';

// Export ToolMessage so it can be used by consumers
export type { ToolMessage };

// --- Types ---

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

export interface ToolContextType {
  // Messaging
  broadcastMessage: (type: string, payload: any, sourceToolId: string) => Promise<void>;
  sendMessageToTool: (targetToolId: string, type: string, payload: any, sourceToolId: string) => Promise<void>;
  subscribe: (eventType: string, callback: (message: ToolMessage) => void) => () => void;
  
  // Shared State
  sharedData: Record<string, any>;
  setSharedData: (key: string, value: any) => void;
  getSharedData: (key: string) => any;

  // Active Tools Management
  activeTools: string[]; // List of tool IDs
  registerTool: (toolId: string) => void;
  unregisterTool: (toolId: string) => void;

  // Observability
  messageLog: LogEntry[];
  deadLetterQueue: ToolMessage[];
}

// --- Context ---

const ToolContext = createContext<ToolContextType | undefined>(undefined);

// --- Provider ---

export function ToolProvider({ children }: { children: React.ReactNode }) {
  const [sharedData, setSharedDataState] = useState<Record<string, any>>({});
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [messageLog, setMessageLog] = useState<LogEntry[]>([]);
  const [deadLetterQueue, setDeadLetterQueue] = useState<ToolMessage[]>([]);
  
  // Event Bus: Map of eventType -> List of callbacks
  const subscribers = useRef<Map<string, ((message: ToolMessage) => void)[]>>(new Map());

  // --- Logging Helper ---
  const log = useCallback((level: 'info' | 'warn' | 'error', message: string, details?: any) => {
    setMessageLog(prev => [
      { id: crypto.randomUUID(), timestamp: Date.now(), level, message, details },
      ...prev.slice(0, 99) // Keep last 100 logs
    ]);
  }, []);

  // --- Validation & ACL ---

  const validateMessage = (message: ToolMessage): boolean => {
    // 1. Schema Validation
    const Schema = MessageSchemas[message.type as keyof typeof MessageSchemas];
    if (Schema) {
      const result = Schema.safeParse(message);
      if (!result.success) {
        log('error', `Schema validation failed for ${message.type}`, result.error);
        return false;
      }
    } else {
      // Fallback to base schema if no specific schema
      const result = BaseMessageSchema.safeParse(message);
      if (!result.success) {
        log('error', `Base schema validation failed`, result.error);
        return false;
      }
      log('warn', `No strict schema defined for event type: ${message.type}`);
    }

    // 2. ACL (Access Control)
    if (message.targetToolId) {
      const targetTool = TOOLS.find(t => t.id === message.targetToolId);
      if (targetTool?.allowedSources) {
        if (!targetTool.allowedSources.includes(message.sourceToolId) && message.sourceToolId !== 'system') {
          log('error', `ACL Denied: ${message.sourceToolId} cannot send to ${message.targetToolId}`);
          return false;
        }
      }
    }

    return true;
  };

  // --- Messaging Logic ---

  const dispatchMessage = useCallback(async (message: ToolMessage) => {
    if (!validateMessage(message)) {
      setDeadLetterQueue(prev => [message, ...prev]);
      return;
    }

    log('info', `Dispatching ${message.type} from ${message.sourceToolId}`, message.payload);

    const deliver = () => {
       // Notify subscribers for this specific event type
       const eventCallbacks = subscribers.current.get(message.type) || [];
       let deliveredCount = 0;

       eventCallbacks.forEach(callback => {
         try {
           callback(message);
           deliveredCount++;
         } catch (err) {
           log('error', `Subscriber error for ${message.type}`, err);
         }
       });
   
       // Notify wildcard subscribers ('*')
       const allCallbacks = subscribers.current.get('*') || [];
       allCallbacks.forEach(callback => {
         try {
           callback(message);
         } catch (err) {
           console.error('Error in wildcard subscription callback:', err);
         }
       });

       return deliveredCount;
    };

    // Retry Logic (Simulated)
    let attempts = 0;
    const maxRetries = 3;
    
    while (attempts < maxRetries) {
      try {
        const count = deliver();
        // If targeted message and no listeners, maybe retry? 
        // For now, we assume if callback runs without error, it's a success.
        // If we really wanted to verify receipt, we'd need ACKs.
        break; 
      } catch (e) {
        attempts++;
        if (attempts >= maxRetries) {
          log('error', `Message delivery failed after ${maxRetries} attempts`, message);
          setDeadLetterQueue(prev => [message, ...prev]);
        }
        await new Promise(r => setTimeout(r, 100 * attempts)); // Backoff
      }
    }

  }, [log]);

  const broadcastMessage = useCallback(async (type: string, payload: any, sourceToolId: string) => {
    const message: ToolMessage = {
      id: crypto.randomUUID(),
      sourceToolId,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0
    };
    await dispatchMessage(message);
  }, [dispatchMessage]);

  const sendMessageToTool = useCallback(async (targetToolId: string, type: string, payload: any, sourceToolId: string) => {
    const message: ToolMessage = {
      id: crypto.randomUUID(),
      sourceToolId,
      targetToolId,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0
    };
    await dispatchMessage(message);
  }, [dispatchMessage]);


  const subscribe = useCallback((eventType: string, callback: (message: ToolMessage) => void) => {
    if (!subscribers.current.has(eventType)) {
      subscribers.current.set(eventType, []);
    }
    subscribers.current.get(eventType)?.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = subscribers.current.get(eventType) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        subscribers.current.delete(eventType);
      }
    };
  }, []);

  // --- Shared State Logic ---

  const setSharedData = useCallback((key: string, value: any) => {
    setSharedDataState(prev => ({ ...prev, [key]: value }));
    // Optionally broadcast a state change event
    broadcastMessage('SHARED_STATE_UPDATE', { key, value }, 'system');
  }, [broadcastMessage]);

  const getSharedData = useCallback((key: string) => {
    return sharedData[key];
  }, [sharedData]);

  // --- Tool Management Logic ---

  const registerTool = useCallback((toolId: string) => {
    setActiveTools(prev => {
      if (prev.includes(toolId)) return prev;
      return [...prev, toolId];
    });
  }, []);

  const unregisterTool = useCallback((toolId: string) => {
    setActiveTools(prev => prev.filter(id => id !== toolId));
  }, []);

  return (
    <ToolContext.Provider value={{
      broadcastMessage,
      sendMessageToTool,
      subscribe,
      sharedData,
      setSharedData,
      getSharedData,
      activeTools,
      registerTool,
      unregisterTool,
      messageLog,
      deadLetterQueue
    }}>
      {children}
    </ToolContext.Provider>
  );
}

// --- Hook ---

export function useToolContext() {
  const context = useContext(ToolContext);
  if (context === undefined) {
    throw new Error('useToolContext must be used within a ToolProvider');
  }
  return context;
}
