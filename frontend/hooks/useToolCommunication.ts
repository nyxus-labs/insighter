import { useEffect, useCallback } from 'react';
import { useToolContext, ToolMessage } from '@/contexts/ToolContext';

interface UseToolCommunicationOptions {
  toolId: string;
  onMessage?: (message: ToolMessage) => void;
  subscriptions?: string[]; // List of event types to subscribe to automatically
}

export function useToolCommunication({ toolId, onMessage, subscriptions = [] }: UseToolCommunicationOptions) {
  const { 
    broadcastMessage, 
    sendMessageToTool, 
    subscribe, 
    setSharedData, 
    getSharedData,
    registerTool,
    unregisterTool
  } = useToolContext();

  // Register tool on mount
  useEffect(() => {
    registerTool(toolId);
    return () => unregisterTool(toolId);
  }, [toolId, registerTool, unregisterTool]);

  // Handle subscriptions
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to specific events requested
    subscriptions.forEach(eventType => {
      const unsub = subscribe(eventType, (msg) => {
        // If message is targeted, only notify if we are the target
        if (msg.targetToolId && msg.targetToolId !== toolId) return;
        
        // Don't echo back our own messages unless needed (usually not)
        if (msg.sourceToolId === toolId) return;

        if (onMessage) onMessage(msg);
      });
      unsubscribers.push(unsub);
    });

    // Also subscribe to messages specifically targeting this tool (regardless of type if onMessage handles it)
    // For simplicity, we assume 'subscriptions' covers interest, but we might want a 'direct message' channel.
    // Let's verify logic: the Context dispatch sends to all matching 'type'. 
    // If we want to support "send to tool X", we need to subscribe to all or have a special logic.
    // The context logic above dispatches by 'type'. 
    // So 'sendMessageToTool' just adds metadata. The receiver still needs to be listening to that 'type' OR '*'
    
    // Let's auto-subscribe to '*' if onMessage is provided, but filter in the callback? 
    // No, that's inefficient.
    // The current design requires the tool to know what "types" it cares about.
    // But direct messages might be ad-hoc.
    // Let's add a convention: 'DIRECT_MESSAGE' type?
    // Or just rely on the user passing specific types.
    
    return () => {
      unsubscribers.forEach(u => u());
    };
  }, [subscriptions, subscribe, toolId, onMessage]);

  const emit = useCallback((type: string, payload: any) => {
    broadcastMessage(type, payload, toolId);
  }, [broadcastMessage, toolId]);

  const send = useCallback((targetId: string, type: string, payload: any) => {
    sendMessageToTool(targetId, type, payload, toolId);
  }, [sendMessageToTool, toolId]);

  return {
    emit,
    send,
    setSharedData,
    getSharedData
  };
}
