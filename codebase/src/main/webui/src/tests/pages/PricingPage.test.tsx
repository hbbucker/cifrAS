import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingPage } from '../../../pages/PricingPage';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PricingPage', () => {
  it('renders pricing plans and navigation', () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('pricing.title')).toBeInTheDocument();
    expect(screen.getByText('pricing.free.title')).toBeInTheDocument();
    expect(screen.getByText('pricing.pro.title')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('pricing.free.button'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    
    // Pro button opens window
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.click(screen.getByText('pricing.pro.button'));
    expect(openSpy).toHaveBeenCalledWith('https://buy.stripe.com/test', '_blank');
  });
});
