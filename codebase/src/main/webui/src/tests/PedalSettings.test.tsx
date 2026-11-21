import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PedalSettingsSection } from '../components/settings/PedalSettingsSection';
import { TourProvider } from '../context/TourContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

describe('PedalSettingsSection Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders settings options, mode selector and scroll percentage slider', () => {
    render(
      <MemoryRouter>
        <TourProvider>
          <PedalSettingsSection />
        </TourProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('pedal-settings-section')).toBeInTheDocument();
    expect(screen.getByText(/Pedais Bluetooth & Controle por Pé/i)).toBeInTheDocument();
    expect(screen.getByText(/Automático \(Plug-and-Play\)/i)).toBeInTheDocument();
    expect(screen.getByText(/65% da tela/i)).toBeInTheDocument();
  });

  it('allows changing scroll percentage', () => {
    render(
      <MemoryRouter>
        <TourProvider>
          <PedalSettingsSection />
        </TourProvider>
      </MemoryRouter>
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '80' } });

    expect(screen.getByText(/80% da tela/i)).toBeInTheDocument();
  });

  it('allows switching profile and operating mode', () => {
    render(
      <MemoryRouter>
        <TourProvider>
          <PedalSettingsSection />
        </TourProvider>
      </MemoryRouter>
    );

    const customRadio = screen.getByLabelText(/Personalizado/i);
    fireEvent.click(customRadio);
    expect(customRadio).toBeChecked();

    const modeSelect = screen.getByRole('combobox');
    fireEvent.change(modeSelect, { target: { value: 'autoscroll_toggle' } });
    expect(modeSelect).toHaveValue('autoscroll_toggle');
  });

  it('allows entering key listening mode and mapping a key', () => {
    render(
      <MemoryRouter>
        <TourProvider>
          <PedalSettingsSection />
        </TourProvider>
      </MemoryRouter>
    );

    const learnButtons = screen.getAllByRole('button', { name: /Aprender/i });
    expect(learnButtons.length).toBeGreaterThan(0);

    // Click first learn button (downKeys)
    fireEvent.click(learnButtons[0]);
    expect(screen.getByText(/Pise agora\.\.\./i)).toBeInTheDocument();

    // Trigger keypress
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F3' }));
    });

    expect(screen.queryByText(/Pise agora\.\.\./i)).not.toBeInTheDocument();
    expect(screen.getByText(/F3/i)).toBeInTheDocument();
  });

  it('restores default configurations on reset button click', () => {
    render(
      <MemoryRouter>
        <TourProvider>
          <PedalSettingsSection />
        </TourProvider>
      </MemoryRouter>
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '90' } });
    expect(screen.getByText(/90% da tela/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Restaurar Padrões de Fábrica/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/65% da tela/i)).toBeInTheDocument();
  });
});
