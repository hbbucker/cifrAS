import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GroupsPage } from '../pages/GroupsPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { TourProvider } from '../context/TourContext';
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

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('renders header with BrandLogo anchor and groups list', async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <MemoryRouter>
                <GroupsPage />
              </MemoryRouter>
            </TourProvider>
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

  it('renders educational empty state when groups list is empty and opens create modal', async () => {
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
        json: () => Promise.resolve([]),
      } as Response);
    }));

    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <MemoryRouter>
                <GroupsPage />
              </MemoryRouter>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Organize e compartilhe seu repertório em equipe|educationalEmptyTitle/i)).toBeInTheDocument();
    });

    const createBtns = screen.getAllByRole('button', { name: /Novo Grupo|newGroup/i });
    expect(createBtns.length).toBeGreaterThan(0);
    fireEvent.click(createBtns[0]);

    expect(screen.getByTestId('create-group-name-input')).toBeInTheDocument();
  });

  it('triggers group-create coach mark after delay on initial visit', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    render(
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <MemoryRouter>
                <GroupsPage />
              </MemoryRouter>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Crie seu Grupo Musical|tourCreateTitle/i)).toBeInTheDocument();

    const gotItBtn = screen.getByRole('button', { name: /Entendi|gotIt/i });
    act(() => {
      fireEvent.click(gotItBtn);
    });

    expect(screen.queryByText(/Crie seu Grupo Musical|tourCreateTitle/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('tour_seen_group-create')).toBe('true');

    vi.useRealTimers();
  });
});
