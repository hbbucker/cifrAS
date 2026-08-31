import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvitePage } from '../pages/InvitePage';
import * as shareLinksApi from '../api/shareLinks';
import * as authContext from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
    useParams: () => ({ token: 'token123' })
  };
});

vi.mock('../api/shareLinks', () => ({
  acceptShareLink: vi.fn(),
  getShareLinkInfo: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, defaultText: string) => defaultText
  })
}));

describe('InvitePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <InvitePage />
      </BrowserRouter>
    );
  };

  it('sets pendingShareToken in localStorage and redirects to /login when user is not logged in', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    renderComponent();

    await waitFor(() => {
      expect(localStorage.getItem('pendingShareToken')).toBe('token123');
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('accepts invite and redirects to song page when user is logged in (SONG type)', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'test@test.com', name: 'Test' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn()
    });

    vi.mocked(shareLinksApi.acceptShareLink).mockResolvedValueOnce({ success: true, message: 'Accepted' });
    vi.mocked(shareLinksApi.getShareLinkInfo).mockResolvedValueOnce({
      token: 'token123',
      type: 'SONG',
      resourceId: 'song-1',
      resourceName: 'Song Name',
      authorName: 'Author',
      expiresAt: '',
      url: ''
    });

    renderComponent();

    await waitFor(() => {
      expect(shareLinksApi.acceptShareLink).toHaveBeenCalledWith('token123');
      expect(shareLinksApi.getShareLinkInfo).toHaveBeenCalledWith('token123');
      expect(mockNavigate).toHaveBeenCalledWith('/songs/song-1', { replace: true });
    });
  });

  it('accepts invite and redirects to group page when user is logged in (GROUP type)', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'test@test.com', name: 'Test' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn()
    });

    vi.mocked(shareLinksApi.acceptShareLink).mockResolvedValueOnce({ success: true, message: 'Accepted' });
    vi.mocked(shareLinksApi.getShareLinkInfo).mockResolvedValueOnce({
      token: 'token123',
      type: 'GROUP',
      resourceId: 'group-2',
      resourceName: 'Group Name',
      authorName: 'Author',
      expiresAt: '',
      url: ''
    });

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/groups/group-2', { replace: true });
    });
  });

  it('shows error state when accept API fails with 404', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'test@test.com', name: 'Test' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn()
    });

    vi.mocked(shareLinksApi.acceptShareLink).mockRejectedValueOnce({
      response: { status: 404 }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Convite não encontrado ou expirado.')).toBeInTheDocument();
    });
  });

  it('redirects to /login when accept API fails with 401', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'test@test.com', name: 'Test' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn()
    });

    vi.mocked(shareLinksApi.acceptShareLink).mockRejectedValueOnce({
      response: { status: 401 }
    });

    renderComponent();

    await waitFor(() => {
      expect(localStorage.getItem('pendingShareToken')).toBe('token123');
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });
});
