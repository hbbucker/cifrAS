import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupsPage } from '../pages/GroupsPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import '@testing-library/jest-dom/vitest';

const mockGroups = [
  { id: '1', name: 'Group 1', memberCount: 3, ownerId: 'user-1' }
];

describe('GroupsPage Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', email: 'user@test.com', name: 'User 1' }));
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/invites/declined') || url.includes('/api/invites')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockGroups),
      } as Response);
    }));
  });

  it('renders header with BrandLogo anchor and groups list', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <MemoryRouter>
              <GroupsPage />
            </MemoryRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('brand-icon')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });
  });
});
