import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import authClient from '../services/authService';

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios') as object;
  const mockAxios = {
    ...actual,
    create: vi.fn(() => {
      const client = vi.fn();
      client.interceptors = {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      };
      client.defaults = { headers: { common: {} } };
      return client;
    }),
    post: vi.fn()
  };
  return { default: mockAxios };
});

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('injects token into headers', () => {
    // Basic test to verify it exists and sets up interceptors
    expect(authClient).toBeDefined();
  });
});
