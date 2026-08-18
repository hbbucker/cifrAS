import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SongsListPage } from '../pages/SongsListPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import '@testing-library/jest-dom/vitest';

vi.mock('../api/songs', () => ({
  getSongs: vi.fn().mockResolvedValue({
    items: [
      { id: '1', title: 'Song 1', artist: 'Artist 1', originalKey: 'C', isFavorite: false, categories: [] }
    ],
    totalCount: 1,
    page: 1,
    size: 20
  })
}));

describe('SongsListPage Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-jwt');
  });

  it('renders header with BrandLogo anchor and songs list', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <MemoryRouter>
              <SongsListPage />
            </MemoryRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('brand-icon')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Song 1')).toBeInTheDocument();
    });
  });
});
