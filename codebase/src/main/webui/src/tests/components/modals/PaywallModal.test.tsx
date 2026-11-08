import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaywallModal } from '../../../components/modals/PaywallModal';
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

describe('PaywallModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <MemoryRouter>
        <PaywallModal />
      </MemoryRouter>
    );
    expect(screen.queryByText('pricing.modal.title')).not.toBeInTheDocument();
  });

  it('renders when quota_exceeded event is dispatched', () => {
    render(
      <MemoryRouter>
        <PaywallModal />
      </MemoryRouter>
    );
    
    fireEvent(window, new Event('quota_exceeded'));
    expect(screen.getByText('pricing.modal.title')).toBeInTheDocument();
    
    // Test navigation
    fireEvent.click(screen.getByText('pricing.modal.upgradeButton'));
    expect(mockNavigate).toHaveBeenCalledWith('/pricing');
  });

  it('closes when maybe later is clicked', () => {
    render(
      <MemoryRouter>
        <PaywallModal />
      </MemoryRouter>
    );
    
    fireEvent(window, new Event('quota_exceeded'));
    expect(screen.getByText('pricing.modal.title')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('pricing.modal.maybeLater'));
    expect(screen.queryByText('pricing.modal.title')).not.toBeInTheDocument();
  });
});
