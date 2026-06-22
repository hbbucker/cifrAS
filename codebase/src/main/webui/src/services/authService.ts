import axios, { type AxiosInstance } from 'axios';

const API_URL = '/api/auth';
const BASE_API_URL = '/api';

const authClient = axios.create({
  baseURL: API_URL,
});

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setupInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use((config) => {
    // Avoid sending tokens for login/register
    if (config.url === '/login' || config.url === '/register') {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = 'Bearer ' + token;
              return client(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');

          const { data } = await axios.post(`${API_URL}/refresh`, { refreshToken });
          
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          // Update defaults for all clients
          authClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
          apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
          
          processQueue(null, data.accessToken);
          return client(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          // Optionally trigger a logout event here if needed
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors(authClient);
setupInterceptors(apiClient);

export default authClient;
