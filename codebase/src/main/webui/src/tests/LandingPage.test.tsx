import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LandingPage } from '../pages/LandingPage';
import { useAuth } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    })),
  };
});

describe('LandingPage Component', () => {
  it('renders BrandLogo in header and navigation links for guest user', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('brand-logo')).toBeInTheDocument();
    expect(screen.getByTestId('brand-icon')).toBeInTheDocument();
    expect(screen.getByTestId('brand-logo-text')).toHaveTextContent('CifrAS');
  });

  it('renders all 6 core feature headings', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('landing.instantTrans')).toBeInTheDocument();
    expect(screen.getByText('landing.theaterMode')).toBeInTheDocument();
    expect(screen.getByText('landing.collab')).toBeInTheDocument();
    expect(screen.getByText('landing.featGroupsTitle')).toBeInTheDocument();
    expect(screen.getByText('landing.featEditorTitle')).toBeInTheDocument();
    expect(screen.getByText('landing.featMobileTitle')).toBeInTheDocument();
  });

  it('renders how it works 3-step section and CTA banner', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('landing.howItWorksTitle')).toBeInTheDocument();
    expect(screen.getByText('landing.step1Title')).toBeInTheDocument();
    expect(screen.getByText('landing.step2Title')).toBeInTheDocument();
    expect(screen.getByText('landing.step3Title')).toBeInTheDocument();
    expect(screen.getByText('landing.ctaTitle')).toBeInTheDocument();
    expect(screen.getByText('landing.ctaButton')).toBeInTheDocument();
  });

  it('interacts with the transpose demo buttons, speed controls and auto-scroll toggle', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Initial chord G
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.getByText('Em')).toBeInTheDocument();

    const plusBtn = screen.getByTitle('Transpor Tom +');
    const minusBtn = screen.getByTitle('Transpor Tom -');

    // Transpose +1 -> G#
    fireEvent.click(plusBtn);
    expect(screen.getByText('G#')).toBeInTheDocument();

    // Transpose -1 -> G
    fireEvent.click(minusBtn);
    expect(screen.getByText('G')).toBeInTheDocument();

    // Speed controls
    const speedPlusBtn = screen.getByTitle('Velocidade +');
    const speedMinusBtn = screen.getByTitle('Velocidade -');
    fireEvent.click(speedPlusBtn);
    fireEvent.click(speedMinusBtn);

    // Toggle Auto-scroll
    const autoScrollBtn = screen.getByRole('button', { name: /alternar rolagem/i });
    expect(autoScrollBtn).toBeInTheDocument();
    fireEvent.click(autoScrollBtn);
  });

  it('renders dashboard button when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('landing.dashboard')).toBeInTheDocument();
    expect(screen.getByText('landing.goDashboard')).toBeInTheDocument();
  });
});
