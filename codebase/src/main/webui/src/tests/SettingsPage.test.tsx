import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettingsPage } from '../pages/SettingsPage';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

describe('SettingsPage Component', () => {
  it('renders header with BrandLogo anchor and settings options', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('brand-icon')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
