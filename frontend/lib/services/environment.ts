import api from '@/lib/api';

export interface ToolStatus {
  name: string;
  installed: boolean;
  version?: string;
  error?: string;
}

export interface InstallResponse {
  success: boolean;
  message: string;
  details?: string;
}

export const environmentService = {
  getStatus: async (): Promise<ToolStatus[]> => {
    const response = await api.get('/api/environment/status');
    return response.data;
  },

  installDependencies: async (): Promise<InstallResponse> => {
    const response = await api.post('/api/environment/install');
    return response.data;
  },

  checkVenv: async () => {
    const response = await api.get('/api/environment/check-venv');
    return response.data;
  }
};
