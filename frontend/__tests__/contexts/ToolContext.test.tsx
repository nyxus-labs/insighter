import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { ToolProvider, useToolContext } from '@/contexts/ToolContext';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '123e4567-e89b-12d3-a456-426614174000' // Valid UUID
  }
});

describe('ToolContext', () => {
  it('registers and unregisters tools', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToolProvider>{children}</ToolProvider>
    );
    const { result } = renderHook(() => useToolContext(), { wrapper });

    act(() => {
      result.current.registerTool('tool-1');
    });

    expect(result.current.activeTools).toContain('tool-1');

    act(() => {
      result.current.unregisterTool('tool-1');
    });

    expect(result.current.activeTools).not.toContain('tool-1');
  });

  it('broadcasts messages to subscribers', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToolProvider>{children}</ToolProvider>
    );
    const { result } = renderHook(() => useToolContext(), { wrapper });
    
    const callback = jest.fn();

    act(() => {
      result.current.subscribe('DATA_LOAD', callback);
    });

    await act(async () => {
      await result.current.broadcastMessage('DATA_LOAD', { 
        datasetId: '123', 
        format: 'csv' 
      }, 'sender-tool');
    });

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      type: 'DATA_LOAD',
      payload: { datasetId: '123', format: 'csv' },
      sourceToolId: 'sender-tool'
    }));
  });

  it('shares data between components', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToolProvider>{children}</ToolProvider>
    );
    const { result } = renderHook(() => useToolContext(), { wrapper });

    act(() => {
      result.current.setSharedData('dataset_id', 'ds-123');
    });

    expect(result.current.getSharedData('dataset_id')).toBe('ds-123');
    expect(result.current.sharedData['dataset_id']).toBe('ds-123');
  });
});
