import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
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

describe('LoginPage', () => {
  it('renders login page correctly', () => {
    render(
      <BrowserRouter>
        <AdminAuthProvider>
          <LoginPage />
        </AdminAuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Entrar no Painel|Sign In/i })).toBeInTheDocument();
  });

  it('allows quick dev login', () => {
    render(
      <BrowserRouter>
        <AdminAuthProvider>
          <LoginPage />
        </AdminAuthProvider>
      </BrowserRouter>
    );

    const quickBtn = screen.getByText(/Acesso Rápido/i);
    fireEvent.click(quickBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
