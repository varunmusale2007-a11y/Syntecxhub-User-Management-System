/**
 * UserHub - Centralized API Service Layer
 * Handles base URL configuration, token injection, HTTP requests, and centralized error parsing.
 */

// Determine appropriate default API Base URL
const DEFAULT_LOCAL_API = 'http://127.0.0.1:5000/api';
// When deploying backend to Render, update this fallback URL or set it via the in-app API Settings modal!
const DEFAULT_PRODUCTION_API = 'https://userhub-api.onrender.com/api';

/**
 * Get current active API Base URL
 */
function getApiBaseUrl() {
  const customUrl = localStorage.getItem('userhub_api_base_url');
  if (customUrl && customUrl.trim() !== '') {
    return customUrl.trim().replace(/\/+$/, '');
  }

  // Auto-detect localhost vs production host
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

  return isLocal ? DEFAULT_LOCAL_API : DEFAULT_PRODUCTION_API;
}

/**
 * Update and persist custom API Base URL
 */
function setApiBaseUrl(newUrl) {
  if (!newUrl || newUrl.trim() === '') {
    localStorage.removeItem('userhub_api_base_url');
  } else {
    localStorage.setItem('userhub_api_base_url', newUrl.trim().replace(/\/+$/, ''));
  }
}

/**
 * Retrieve stored JWT auth token
 */
function getAuthToken() {
  return localStorage.getItem('userhub_token');
}

/**
 * Retrieve current logged in user object
 */
function getCurrentUser() {
  const userJson = localStorage.getItem('userhub_user');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Core HTTP Request Wrapper
 * @param {string} endpoint - Path relative to base URL (e.g. '/auth/login')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 */
async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Parse JSON body or return empty object
    let data = {};
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = { rawText: text };
      }
    }

    // Handle 401 Unauthorized / Expired Token
    if (response.status === 401) {
      // If we got unauthorized on a protected route (not on login or register)
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        console.warn('Authentication expired or unauthorized. Logging out.');
        localStorage.removeItem('userhub_token');
        localStorage.removeItem('userhub_user');
        if (!window.location.pathname.endsWith('login.html')) {
          window.location.href = 'login.html?expired=true';
        }
      }
    }

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Check for network errors (backend offline, CORS failure, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const netError = new Error(
        `Unable to connect to backend server at ${baseUrl}. Please ensure the Node.js server is running and CORS is configured.`
      );
      netError.isNetworkError = true;
      throw netError;
    }
    throw error;
  }
}

/**
 * Authentication API Service
 */
const AuthAPI = {
  login: (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  updateProfile: (profileData) => {
    return apiRequest('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

/**
 * User Management CRUD API Service
 */
const UserAPI = {
  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'all') query.append('role', params.role);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.department && params.department !== 'all') query.append('department', params.department);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);

    const queryString = query.toString();
    const endpoint = `/users${queryString ? '?' + queryString : ''}`;
    return apiRequest(endpoint, { method: 'GET' });
  },

  getStats: () => {
    return apiRequest('/users/stats', { method: 'GET' });
  },

  getUserById: (id) => {
    return apiRequest(`/users/${id}`, { method: 'GET' });
  },

  createUser: (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: (id, userData) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: (id) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Health API Service
 */
const HealthAPI = {
  check: () => {
    return apiRequest('/health', { method: 'GET' });
  },
};

// Export services onto window for global vanilla JS access
window.UserHubAPI = {
  getApiBaseUrl,
  setApiBaseUrl,
  getAuthToken,
  getCurrentUser,
  apiRequest,
  AuthAPI,
  UserAPI,
  HealthAPI,
};
