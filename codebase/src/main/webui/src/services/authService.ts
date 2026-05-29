import axios from 'axios';

const API_URL = '/api/auth';

const authClient = axios.create({
 baseURL: API_URL,
});

authClient.interceptors.request.use((config) => {
 const token = localStorage.getItem('token');
 if (token && config.headers) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
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

authClient.interceptors.response.use(
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
 return authClient(originalRequest);
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

 // Note: Using standard axios here to avoid interceptor loop
 const { data } = await axios.post(`${API_URL}/refresh`, { refreshToken });
 
 localStorage.setItem('token', data.token);
 authClient.defaults.headers.common.Authorization = `Bearer ${data.token}`;
 
 processQueue(null, data.token);
 return authClient(originalRequest);
 } catch (err) {
 processQueue(err, null);
 localStorage.removeItem('token');
 localStorage.removeItem('refreshToken');
 return Promise.reject(err);
 } finally {
 isRefreshing = false;
 }
 }

 return Promise.reject(error);
 }
);

export default authClient;
