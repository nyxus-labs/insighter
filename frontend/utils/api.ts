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
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      axiosConfig.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
