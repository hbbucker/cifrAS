import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupDetailsPage } from '../pages/GroupDetailsPage';
import * as groupsApi from '../api/groups';
import * as shareLinksApi from '../api/shareLinks';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'group-1' })
  };
});

let mockCurrentUser = { id: 'u1', email: 'owner@band.com', name: 'Owner Person' };
const logoutMock = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    isAuthenticated: true,
    token: 'jwt-token',
    login: vi.fn(),
    logout: logoutMock,
    updateUser: vi.fn()
  })
}));

const toastMock = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    toast: toastMock
  })
}));

vi.mock('../api/shareLinks', () => ({
  createShareLink: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'group.tabs.playlists') return 'Playlists';
      if (key === 'group.tabs.members') return 'Membros & Convites';
      if (key === 'group.members.roles.admin') return 'Admin';
      if (key === 'group.members.roles.member') return 'Membro';
      if (key === 'group.invite') return 'Convidar Membro';
      if (key === 'groups.inviteToGroup') return 'Convidar para o Grupo';
      if (key === 'songSharing.generateLink') return 'Gerar Link';
      if (key === 'songSharing.generalError') return 'Ocorreu um erro';
      if (key === 'common.cancel') return 'Cancelar';
      if (key === 'group.sharePlaylist') return 'Compartilhar Playlist';
      if (key === 'group.sharedPlaylists') return 'Playlists Compartilhadas';
      if (key === 'group.noSharedPlaylists') return 'Nenhuma playlist compartilhada';
      if (key === 'linkPlaylist.shareTitle') return 'Compartilhar Playlist';
      if (key === 'musicCard.share') return 'Compartilhar';
      return key;
    }
  })
}));

const mockGroupData = [
  { id: 'group-1', name: 'The Awesome Band', ownerId: 'u1', memberCount: 2 }
];

describe('GroupDetailsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = { id: 'u1', email: 'owner@band.com', name: 'Owner Person' };
    globalThis.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/groups')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockGroupData)
        } as Response);
      }
      if (url.includes('/api/playlists')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([{ id: 'p1', name: 'Setlist 1' }])
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) } as Response);
    });

    vi.spyOn(groupsApi, 'getGroupPlaylists').mockResolvedValue([]);
    vi.spyOn(groupsApi, 'getGroupMembers').mockResolvedValue([
      { id: 'm1', groupId: 'group-1', userId: 'u1', email: 'owner@band.com', name: 'Owner Person', role: 'OWNER', joinedAt: '2026-01-01' }
    ]);
    vi.spyOn(groupsApi, 'getGroupInvitations').mockResolvedValue([]);
    vi.spyOn(groupsApi, 'inviteGroupMember').mockResolvedValue();
    vi.spyOn(groupsApi, 'linkPlaylist').mockResolvedValue();
  });

  it('renders group header and allows switching tabs between Playlists and Members', async () => {
    render(
      <BrowserRouter>
        <GroupDetailsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('The Awesome Band')).toBeInTheDocument();
    });

    expect(screen.getByTestId('tab-playlists')).toBeInTheDocument();
    expect(screen.getByTestId('tab-members')).toBeInTheDocument();

    expect(screen.getByText('Playlists Compartilhadas')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('back-to-groups-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/groups');

    fireEvent.click(screen.getByTestId('tab-members'));

    await waitFor(() => {
      expect(screen.getByText('Owner Person')).toBeInTheDocument();
    });
  });

  it('opens invite modal and generates link', async () => {
    vi.mocked(shareLinksApi.createShareLink).mockResolvedValueOnce({
      token: 'group-token',
      type: 'GROUP',
      resourceId: 'group-1',
      resourceName: 'The Awesome Band',
      authorName: 'Owner',
      expiresAt: new Date().toISOString(),
      url: 'http://localhost/invite/group-token',
    });

    render(
      <BrowserRouter>
        <GroupDetailsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('header-invite-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('header-invite-btn'));

    expect(screen.getByText('Convidar para o Grupo')).toBeInTheDocument();

    const generateBtn = screen.getByRole('button', { name: /Gerar Link/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(shareLinksApi.createShareLink).toHaveBeenCalledWith({ type: 'GROUP', resourceId: 'group-1' });
    });

    const urlInput = await screen.findByRole('textbox');
    expect((urlInput as HTMLInputElement).value).toContain("/invite/group-token");
  });

  it('handles invite error response gracefully when API fails', async () => {
    vi.mocked(shareLinksApi.createShareLink).mockRejectedValueOnce(new Error('API error'));

    render(
      <BrowserRouter>
        <GroupDetailsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('header-invite-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('header-invite-btn'));

    const generateBtn = screen.getByRole('button', { name: /Gerar Link/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Ocorreu um erro/i)).toBeInTheDocument();
    });
  });

  it('opens LinkPlaylistModal and links playlist', async () => {
    render(
      <BrowserRouter>
        <GroupDetailsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Compartilhar Playlist')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Compartilhar Playlist'));

    await waitFor(() => {
      expect(screen.getByText('Setlist 1')).toBeInTheDocument();
    });

    const shareBtn = screen.getByText('Compartilhar');
    fireEvent.click(shareBtn);

    await waitFor(() => {
      expect(groupsApi.linkPlaylist).toHaveBeenCalledWith('group-1', 'p1');
    });
  });

  it('redirects to /login on 401 when fetching groups', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({})
      } as Response)
    );

    render(
      <BrowserRouter>
        <GroupDetailsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
