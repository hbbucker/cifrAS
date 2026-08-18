import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaylistsPage } from '../pages/PlaylistsPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import '@testing-library/jest-dom/vitest';

const mockPlaylists = [
  { id: '1', name: 'Playlist 1', songCount: 5, isCollaborative: false }
];

describe('PlaylistsPage Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-jwt');
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPlaylists),
      } as Response)
    ));
  });

  it('renders header with BrandLogo anchor and playlists list', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <MemoryRouter>
              <PlaylistsPage />
            </MemoryRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('brand-icon')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument();
    });
  });
});
