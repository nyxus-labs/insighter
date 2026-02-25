import api from '@/lib/api';

export interface SecretSetting {
  tool_id: string;
  key: string;
  value: string;
  is_secret: boolean;
  updated_at?: string;
}

export const settingsService = {
  getSecrets: async (): Promise<SecretSetting[]> => {
    const response = await api.get('/api/settings/secrets');
    return response.data;
  },

  updateSecret: async (tool_id: string, key: string, value: string, is_secret: boolean = true) => {
    const response = await api.post('/api/settings/secrets', { tool_id, key, value, is_secret });
    return response.data;
  },

  deleteSecret: async (tool_id: string, key: string) => {
    const response = await api.delete(`/api/settings/secrets/${tool_id}/${key}`);
    return response.data;
  }
};
