import axios from 'axios';

// Configure base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Request interceptor to attach JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and other common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show user-friendly message
        const message = error.response.data?.message || 'Your session has expired. Please login again.';
        
        // Store message to show on login page
        sessionStorage.setItem('loginMessage', message);
        
        // Redirect to login page after a brief delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        
        return Promise.reject({
          message: message,
          status: 401
        });
      }

      // Handle 403 Forbidden - insufficient permissions
      if (error.response.status === 403) {
        return Promise.reject({
          message: 'You do not have permission to perform this action.',
          status: 403
        });
      }

      // Handle 404 Not Found
      if (error.response.status === 404) {
        return Promise.reject({
          message: error.response.data.message || 'Resource not found.',
          status: 404
        });
      }

      // Handle 409 Conflict
      if (error.response.status === 409) {
        return Promise.reject({
          message: error.response.data.message || 'Conflict occurred.',
          status: 409
        });
      }

      // Handle 500 Internal Server Error
      if (error.response.status === 500) {
        return Promise.reject({
          message: 'Server error. Please try again later.',
          status: 500
        });
      }

      // Handle other errors with server response
      return Promise.reject({
        message: error.response.data.message || 'An error occurred.',
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // Network error - no response received
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        status: 0
      });
    } else {
      // Request setup error
      return Promise.reject({
        message: 'An unexpected error occurred. Please try again.',
        status: -1
      });
    }
  }
);

// Helper function for GET requests
export const get = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message, status: error.status };
  }
};

// Helper function for POST requests
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message, status: error.status };
  }
};

// Helper function for PUT requests
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message, status: error.status };
  }
};

// Helper function for DELETE requests
export const del = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message, status: error.status };
  }
};

// Export api object with all methods
export const api = {
  get,
  post,
  put,
  del
};

// Export the axios instance for direct use if needed
export default apiClient;
