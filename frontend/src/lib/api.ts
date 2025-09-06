// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  PROJECTS: `${API_BASE_URL}/api/projects`,
  TASKS: `${API_BASE_URL}/api/tasks`,
  USER_TASKS: `${API_BASE_URL}/api/tasks`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  FILES: `${API_BASE_URL}/api/files`,
};

// Auth utilities
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// API request helper with authentication
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  // Handle unauthorized responses - but only if not on login page
  if (response.status === 401) {
    // Check if we're not already on the login page to prevent infinite redirects
    if (!window.location.pathname.includes('/login')) {
      removeAuthToken();
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  return response;
};
