import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoginPage } from '../pages/auth/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

describe('LoginPage Component', () => {
  it('renders BrandLogo and login controls', () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <MemoryRouter>
              <LoginPage />
            </MemoryRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('brand-icon')).toBeInTheDocument();
    expect(screen.getByTestId('google-login-btn')).toBeInTheDocument();
  });
});
