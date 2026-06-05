import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CRITICAL IMPLEMENTATION NOTE: 
// The dynamic require() calls inside the interceptors below are intentional
// to break circular module initialization between the API service and the Redux store.
// Do not refactor these to top-level ES module imports.
api.interceptors.request.use(
  (config) => {
    // Dynamic require to break circular dependency at module initialization time
    const store = require('../store/index').default;
    const token = store.getState().auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post('/auth/refresh');
        const newAccessToken = refreshResponse.data.accessToken;

        // Dynamic require to break circular dependency
        const { setAccessToken } = require('../store/slices/authSlice');
        const store = require('../store/index').default;

        store.dispatch(setAccessToken(newAccessToken));
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Dynamic require to break circular dependency
        const { logoutUser } = require('../store/slices/authSlice');
        const store = require('../store/index').default;

        store.dispatch(logoutUser());
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
