import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PedalSimulator } from '../components/settings/PedalSimulator';
import { DEFAULT_PEDAL_CONFIG } from '../hooks/usePedalController';
import '@testing-library/jest-dom/vitest';

describe('PedalSimulator Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders simulator with sample chord sheet and controls', () => {
    render(<PedalSimulator config={DEFAULT_PEDAL_CONFIG} />);

    expect(screen.getByTestId('pedal-simulator')).toBeInTheDocument();
    expect(screen.getByText(/Lorem ipsum dolor sit amet/i)).toBeInTheDocument();
    expect(screen.getByText(/Salto: 65%/i)).toBeInTheDocument();
  });

  it('shows HUD feedback when a mapped pedal key is pressed and clears after timeout', () => {
    render(<PedalSimulator config={DEFAULT_PEDAL_CONFIG} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
    });

    expect(screen.getByTestId('pedal-hud-feedback')).toBeInTheDocument();
    expect(screen.getByText(/\[PageDown\]/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.queryByTestId('pedal-hud-feedback')).not.toBeInTheDocument();
  });

  it('toggles autoscroll when auto scroll button is clicked', () => {
    render(<PedalSimulator config={DEFAULT_PEDAL_CONFIG} />);

    const autoScrollBtn = screen.getByRole('button', { name: /AutoScroll/i });
    fireEvent.click(autoScrollBtn);

    expect(screen.getByText(/▶ AutoScroll Ativo/i)).toBeInTheDocument();

    // Advance interval for autoscroll
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Click again to pause
    const pauseBtn = screen.getByRole('button', { name: /Pausar/i });
    fireEvent.click(pauseBtn);

    expect(screen.getByText(/⏸ Estático/i)).toBeInTheDocument();
  });

  it('allows manual scrolling up and down with tester buttons', () => {
    render(<PedalSimulator config={DEFAULT_PEDAL_CONFIG} />);

    const downBtn = screen.getByTitle(/Descer \/ Próxima/i);
    const upBtn = screen.getByTitle(/Subir \/ Anterior/i);

    fireEvent.click(downBtn);
    fireEvent.click(upBtn);

    expect(screen.getByTestId('pedal-simulator-scroll-container')).toBeInTheDocument();
  });
});
