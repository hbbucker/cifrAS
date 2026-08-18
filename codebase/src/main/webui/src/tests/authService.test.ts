import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

interface InterceptorCallbacks {
  requestInterceptorCallback: null | ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig);
  responseSuccessCallback: null | ((response: AxiosResponse) => AxiosResponse);
  responseErrorCallback: null | ((error: unknown) => Promise<unknown>);
}

const { callbacks } = vi.hoisted(() => {
  return {
    callbacks: {
      requestInterceptorCallback: null,
      responseSuccessCallback: null,
      responseErrorCallback: null,
    } as InterceptorCallbacks,
  };
});

vi.mock('axios', async () => {
  const actual = (await vi.importActual('axios')) as object;
  const mockAxios = {
    ...actual,
    create: vi.fn(() => {
      const client = vi.fn();
      (client as unknown as { interceptors: Record<string, unknown> }).interceptors = {
        request: {
          use: vi.fn((fn) => {
            callbacks.requestInterceptorCallback = fn;
          }),
        },
        response: {
          use: vi.fn((success, error) => {
            callbacks.responseSuccessCallback = success;
            callbacks.responseErrorCallback = error;
          }),
        },
      };
      (client as unknown as { defaults: Record<string, unknown> }).defaults = { headers: { common: {} } };
      return client;
    }),
    post: vi.fn(),
  };
  return { default: mockAxios };
});

import authClient, { apiClient } from '../services/authService';

describe('authService interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('exports authClient and apiClient instances', () => {
    expect(authClient).toBeDefined();
    expect(apiClient).toBeDefined();
  });

  describe('request interceptor', () => {
    it('does NOT add Authorization header for public endpoint /google-url even if token exists', () => {
      localStorage.setItem('token', 'stale-expired-jwt');
      const config = {
        url: '/google-url?redirectTo=http%3A%2F%2Flocalhost%2Fauth%2Fcallback',
        headers: { Authorization: 'Bearer stale-expired-jwt' },
      } as unknown as InternalAxiosRequestConfig;

      const result = callbacks.requestInterceptorCallback!(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('does NOT add Authorization header for public endpoint /login', () => {
      localStorage.setItem('token', 'some-token');
      const config = {
        url: '/login',
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      const result = callbacks.requestInterceptorCallback!(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('does NOT add Authorization header for public endpoint /register', () => {
      localStorage.setItem('token', 'some-token');
      const config = {
        url: '/register',
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      const result = callbacks.requestInterceptorCallback!(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('does NOT add Authorization header for public endpoint /refresh', () => {
      localStorage.setItem('token', 'some-token');
      const config = {
        url: '/refresh',
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      const result = callbacks.requestInterceptorCallback!(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('adds Authorization header for protected endpoints when token exists', () => {
      localStorage.setItem('token', 'valid-active-jwt');
      const config = {
        url: '/profile',
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      const result = callbacks.requestInterceptorCallback!(config);
      expect(result.headers.Authorization).toBe('Bearer valid-active-jwt');
    });

    it('does not add Authorization header if no token in localStorage', () => {
      const config = {
        url: '/profile',
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      const result = callbacks.requestInterceptorCallback!(config);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('passes through successful responses unchanged', () => {
      const response = { status: 200, data: { success: true } } as unknown as AxiosResponse;
      expect(callbacks.responseSuccessCallback!(response)).toEqual(response);
    });

    it('handles 401 error and cleans tokens and headers on refresh failure', async () => {
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('refreshToken', 'bad-refresh-token');

      // Mock axios.post to simulate failed refresh
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Invalid refresh token'));

      const error = {
        response: { status: 401 },
        config: { url: '/profile', headers: {} },
      };

      await expect(callbacks.responseErrorCallback!(error)).rejects.toThrow();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
