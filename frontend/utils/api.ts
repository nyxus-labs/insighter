import axios from 'axios';
import config from '@/lib/config';
import { createClient } from '@/utils/supabase/client';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Singleton supabase client for the interceptor
let supabaseClient: any = null;
const getSupabase = () => {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
};

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  async (axiosConfig) => {
    try {
      const supabase = getSupabase();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase session error in API interceptor:', error);
      }

      if (session?.access_token) {
        axiosConfig.headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        console.warn('No active session found in API interceptor');
      }
    } catch (e) {
      console.error('Error in API request interceptor:', e);
    }
    return axiosConfig;
  },
  (error) => {
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and logging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    // Enhanced logging for network and API failures
    if (!response) {
      console.error(`NETWORK ERROR: Failed to reach ${config?.baseURL}${config?.url}. Possible CORS issue, DNS failure, or server is down.`);
      console.error('Diagnostic Info:', {
        baseURL: config?.baseURL,
        url: config?.url,
        method: config?.method,
        headers: config?.headers,
        env: process.env.NODE_ENV
      });
    } else {
      console.error(`API ERROR (${response.status}): ${config?.method?.toUpperCase()} ${config?.url}`, response.data);
    }

    // Handle 401 Unauthorized - redirect to login
    if (response && response.status === 401) {
      console.warn('Unauthorized request. Clearing session and redirecting to login.');
      const supabase = getSupabase();
      await supabase.auth.signOut();
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          window.location.href = `/login?redirectedFrom=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
