import axios from 'axios';
import { createClient } from '@/utils/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  try {
    const supabase = createClient();
    // 1. Get the session - this is fast and usually reads from local storage
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      return config;
    }
    
    // If no session, we don't attempt refresh here to avoid slowing down every request
    // The response interceptor will handle 401s if the token is expired
    return config;
  } catch (err) {
    console.error('Interceptor auth error:', err);
    return config;
  }
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const supabase = createClient();

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          // If refresh fails, redirect to login
          console.error('Session refresh failed:', refreshError);
          if (typeof window !== 'undefined' && 
              !window.location.pathname.startsWith('/login') &&
              !window.location.search.includes('error=session_expired')) {
            window.location.href = '/login?error=session_expired';
          }
          return Promise.reject(error);
        }

        // Update the header and retry the request
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return api(originalRequest);
      } catch (refreshCatchError) {
        console.error('Error during token refresh:', refreshCatchError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Legacy functions for compatibility (if needed)
export async function getDeployments() {
  try {
    const res = await api.get('/api/deployment/');
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getLabelingTasks() {
  try {
    const res = await api.get('/api/labeling/');
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getNotebooks() {
    try {
      const res = await api.get('/api/notebooks/');
      return res.data;
    } catch (error) {
      console.error(error);
      return [];
    }
}

export async function createDeployment(config: { model_id: string; cpu?: string; memory?: string }) {
  try {
    const res = await api.post('/api/deployment/deploy', config);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createLabelingTask(name: string, type: string) {
  try {
    const res = await api.post(`/api/labeling/create?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getModels() {
  try {
    const res = await api.get('/api/ml/models');
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getExperiments(projectId: string) {
  try {
    const res = await api.post(`/api/tools/experiment/execute/get_runs`, { project_id: projectId });
    return res.data.runs || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getDatasets(projectId?: string) {
  try {
    const url = projectId ? `/api/datasets/?project_id=${projectId}` : '/api/datasets/';
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
