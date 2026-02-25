import { Tool } from '../constants/tools';

export type SerializableTool = Omit<Tool, 'icon'>;

export interface ToolEnvironmentProps {
  tool: SerializableTool;
  projectId: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  version: string;
  defaultConfig?: Record<string, any>;
  inputs?: ToolInput[];
  outputs?: ToolOutput[];
}

export interface ToolInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'dataset';
  required: boolean;
  description?: string;
}

export interface ToolOutput {
  name: string;
  type: string;
  description?: string;
}
