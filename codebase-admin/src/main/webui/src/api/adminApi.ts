import axios from 'axios';
import type { AdminDashboardMetrics, RecentActivity, AdminUser, AdminSong, PagedResponse } from '../types/admin';

export const adminClient = axios.create({
  baseURL: '/api/admin',
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (window.location.pathname !== '/login') {
        // Redirection on unauthorized
        localStorage.removeItem('admin_token');
      }
    }
    return Promise.reject(error);
  }
);

export const getDashboardMetrics = async (): Promise<AdminDashboardMetrics> => {
  const res = await adminClient.get<AdminDashboardMetrics>('/dashboard/metrics');
  return res.data;
};

export const getRecentActivity = async (limit: number = 10): Promise<RecentActivity[]> => {
  const res = await adminClient.get<RecentActivity[]>('/dashboard/recent-activity', { params: { limit } });
  return res.data;
};

export const getAdminUsers = async (page: number = 0, pageSize: number = 20, search?: string): Promise<PagedResponse<AdminUser>> => {
  const res = await adminClient.get<PagedResponse<AdminUser>>('/users', {
    params: { page, pageSize, search: search || undefined }
  });
  return res.data;
};

export const getAdminSongs = async (
  page: number = 0,
  pageSize: number = 20,
  search?: string,
  deletedOnly?: boolean
): Promise<PagedResponse<AdminSong>> => {
  const res = await adminClient.get<PagedResponse<AdminSong>>('/songs', {
    params: { page, pageSize, search: search || undefined, deletedOnly: deletedOnly ?? undefined }
  });
  return res.data;
};

export const softDeleteSong = async (id: string): Promise<AdminSong> => {
  const res = await adminClient.delete<AdminSong>(`/songs/${id}`);
  return res.data;
};

export const restoreSong = async (id: string): Promise<AdminSong> => {
  const res = await adminClient.post<AdminSong>(`/songs/${id}/restore`, {});
  return res.data;
};

export const permanentDeleteSong = async (id: string): Promise<void> => {
  await adminClient.delete(`/songs/${id}/permanent`);
};
