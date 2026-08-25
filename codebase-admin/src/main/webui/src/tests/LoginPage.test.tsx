import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { LoginPage } from '../pages/LoginPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('axios');

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Google sign in button and login page correctly', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AdminAuthProvider>
          <LoginPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('google-admin-login-btn')).toBeInTheDocument();
    expect(screen.getByText(/Entrar com o Google|Sign in with Google/i)).toBeInTheDocument();
  });

  it('initiates Google OAuth flow on button click', async () => {
    const mockUrl = 'https://supabase.co/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%2Fauth%2Fcallback';
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { url: mockUrl } });

    // Mock window.location
    const originalLocation = window.location;
    const locationMock = {
      ...originalLocation,
      href: '',
      origin: 'http://localhost',
    };
    Object.defineProperty(window, 'location', {
      value: locationMock,
      writable: true,
      configurable: true,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AdminAuthProvider>
          <LoginPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    const googleBtn = screen.getByTestId('google-admin-login-btn');
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/admin/auth/google-url?redirectTo='));
      expect(locationMock.href).toBe(mockUrl);
    });

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('displays error message when OAuth url request fails', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AdminAuthProvider>
          <LoginPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    const googleBtn = screen.getByTestId('google-admin-login-btn');
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('displays not_admin error when query param is present', () => {
    render(
      <MemoryRouter initialEntries={['/login?error=not_admin']}>
        <AdminAuthProvider>
          <LoginPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/não possui permissões de administrador|does not have administrator privileges/i)).toBeInTheDocument();
  });

  it('allows quick dev login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AdminAuthProvider>
          <LoginPage />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    const quickBtn = screen.getByText(/Acesso Rápido/i);
    fireEvent.click(quickBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
