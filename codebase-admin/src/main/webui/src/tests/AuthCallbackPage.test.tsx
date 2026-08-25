import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { AuthCallbackPage } from '../pages/AuthCallbackPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.mockSignature`;
}

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders verifying spinner during callback processing', () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AdminAuthProvider>
          <AuthCallbackPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Verificando credenciais|Verifying credentials/i)).toBeInTheDocument();
  });

  it('successfully authenticates and redirects to dashboard when token has admin role', async () => {
    const adminToken = createJwt({
      sub: 'admin-id-123',
      email: 'john.admin@cifras.com',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    render(
      <MemoryRouter initialEntries={[`/auth/callback#access_token=${adminToken}&refresh_token=rt123`]}>
        <AdminAuthProvider>
          <AuthCallbackPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      expect(localStorage.getItem('admin_token')).toBe(adminToken);
    });
  });

  it('successfully authenticates when token has app_metadata admin role', async () => {
    const adminToken = createJwt({
      sub: 'admin-id-456',
      email: 'sarah.manager@gmail.com',
      app_metadata: { role: 'admin' },
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    render(
      <MemoryRouter initialEntries={[`/auth/callback#access_token=${adminToken}`]}>
        <AdminAuthProvider>
          <AuthCallbackPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      expect(localStorage.getItem('admin_token')).toBe(adminToken);
    });
  });

  it('rejects login and redirects with not_admin error when token has role user', async () => {
    const userToken = createJwt({
      sub: 'user-id-789',
      email: 'regular.musician@gmail.com',
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    render(
      <MemoryRouter initialEntries={[`/auth/callback#access_token=${userToken}`]}>
        <AdminAuthProvider>
          <AuthCallbackPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=not_admin', { replace: true });
      expect(localStorage.getItem('admin_token')).toBeNull();
    });
  });

  it('rejects login and redirects with login_failed error when error param is present in URL hash', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback#error=access_denied&error_description=User+declined']}>
        <AdminAuthProvider>
          <AuthCallbackPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=login_failed', { replace: true });
      expect(localStorage.getItem('admin_token')).toBeNull();
    });
  });

  it('redirects with invalid_callback error when no token is present', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AdminAuthProvider>
          <AuthCallbackPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=invalid_callback', { replace: true });
    });
  });
});
