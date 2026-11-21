import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PedalFeatureBanner } from '../components/cards/PedalFeatureBanner';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('PedalFeatureBanner Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedNavigate.mockClear();
  });

  it('renders banner when not dismissed', () => {
    render(
      <MemoryRouter>
        <PedalFeatureBanner />
      </MemoryRouter>
    );

    expect(screen.getByTestId('pedal-feature-banner')).toBeInTheDocument();
    expect(screen.getByText(/Controle o Modo Teatro com Pedais Bluetooth/i)).toBeInTheDocument();
  });

  it('navigates to settings on CTA click', () => {
    render(
      <MemoryRouter>
        <PedalFeatureBanner />
      </MemoryRouter>
    );

    const cta = screen.getByRole('button', { name: /Configurar e Testar/i });
    fireEvent.click(cta);

    expect(mockedNavigate).toHaveBeenCalledWith('/settings');
  });

  it('dismisses banner and sets localStorage flag on close click', () => {
    render(
      <MemoryRouter>
        <PedalFeatureBanner />
      </MemoryRouter>
    );

    const closeBtn = screen.getByRole('button', { name: /Fechar/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('pedal-feature-banner')).not.toBeInTheDocument();
    expect(localStorage.getItem('cifras_pedal_banner_dismissed')).toBe('true');
  });

  it('does not render when already dismissed in localStorage', () => {
    localStorage.setItem('cifras_pedal_banner_dismissed', 'true');

    render(
      <MemoryRouter>
        <PedalFeatureBanner />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('pedal-feature-banner')).not.toBeInTheDocument();
  });
});
