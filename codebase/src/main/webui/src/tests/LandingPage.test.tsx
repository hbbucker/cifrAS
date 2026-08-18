import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LandingPage } from '../pages/LandingPage';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

describe('LandingPage Component', () => {
  it('renders BrandLogo in header and navigation links', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByTestId('brand-logo')).toBeInTheDocument();
    expect(screen.getByTestId('brand-icon')).toBeInTheDocument();
    expect(screen.getByTestId('brand-logo-text')).toHaveTextContent('CifrAS');
  });
});
