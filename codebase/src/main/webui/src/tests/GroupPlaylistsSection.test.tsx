import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupPlaylistsSection } from '../components/groups/GroupPlaylistsSection';
import * as groupsApi from '../api/groups';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
  };
});

const toastMock = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        'group.sharedPlaylists': 'Playlists Compartilhadas',
        'group.sharePlaylist': 'Compartilhar Playlist',
        'groups.create': 'Criar',
        'group.noSharedPlaylists': 'Nenhuma playlist compartilhada',
        'group.noSharedPlaylistsDesc': 'Nenhuma playlist compartilhada com este grupo ainda.',
        'group.loadPlaylistsError': 'Falha ao carregar playlists compartilhadas',
        'group.removePlaylistSuccess': 'Playlist removida do grupo',
        'group.removePlaylistError': 'Falha ao remover playlist',
        'group.confirmRemovePlaylist': 'Tem certeza de que deseja remover esta playlist do grupo?',
        'group.remove': 'Remover do Grupo',
        'playlists.songsCount': 'músicas',
        'sharedWithMe.playTheater': 'Tocar no Modo Teatro',
      };
      return dict[key] || key;
    },
  }),
}));

describe('GroupPlaylistsSection Component', () => {
  const onLinkNewMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (role: 'Admin' | 'Member' = 'Admin') => {
    return render(
      <BrowserRouter>
        <GroupPlaylistsSection groupId="group-1" role={role} onLinkNew={onLinkNewMock} />
      </BrowserRouter>
    );
  };

  it('renders loading spinner and then empty state when no playlists', async () => {
    vi.spyOn(groupsApi, 'getGroupPlaylists').mockResolvedValueOnce([]);

    renderComponent('Admin');

    expect(await screen.findByText('Nenhuma playlist compartilhada')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma playlist compartilhada com este grupo ainda.')).toBeInTheDocument();
  });

  it('renders playlists with correct songCount and i18n translation', async () => {
    vi.spyOn(groupsApi, 'getGroupPlaylists').mockResolvedValueOnce([
      {
        id: 'p1',
        name: 'Repertório Culto',
        songCount: 8,
      },
      {
        id: 'p2',
        name: 'Repertório Vazio',
        songCount: 0,
      },
    ]);

    renderComponent('Admin');

    expect(await screen.findByText('Repertório Culto')).toBeInTheDocument();
    expect(screen.getByText('8 músicas')).toBeInTheDocument();
    expect(screen.getByText('Repertório Vazio')).toBeInTheDocument();
    expect(screen.getByText('0 músicas')).toBeInTheDocument();
  });

  it('navigates to playlist details when playlist card is clicked', async () => {
    vi.spyOn(groupsApi, 'getGroupPlaylists').mockResolvedValueOnce([
      { id: 'p1', name: 'Repertório Culto', songCount: 5 },
    ]);

    renderComponent('Member');

    const item = await screen.findByText('Repertório Culto');
    fireEvent.click(item);
    expect(mockNavigate).toHaveBeenCalledWith('/playlists/p1');
  });

  it('navigates to theater mode when theater button is clicked', async () => {
    vi.spyOn(groupsApi, 'getGroupPlaylists').mockResolvedValueOnce([
      { id: 'p1', name: 'Repertório Culto', songCount: 5 },
    ]);

    renderComponent('Member');

    const theaterBtn = await screen.findByTitle('Tocar no Modo Teatro');
    fireEvent.click(theaterBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/theater/p1');
  });

  it('calls unlinkPlaylist and refreshes list when admin removes a playlist', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const unlinkSpy = vi.spyOn(groupsApi, 'unlinkPlaylist').mockResolvedValue();
    vi.spyOn(groupsApi, 'getGroupPlaylists')
      .mockResolvedValueOnce([{ id: 'p1', name: 'Repertório Culto', songCount: 5 }])
      .mockResolvedValueOnce([]);

    renderComponent('Admin');

    const deleteBtn = await screen.findByTitle('Remover do Grupo');
    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(unlinkSpy).toHaveBeenCalledWith('group-1', 'p1');
      expect(toastMock).toHaveBeenCalledWith('Playlist removida do grupo', 'success');
    });
  });

  it('does not unlink playlist if confirmation is cancelled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const unlinkSpy = vi.spyOn(groupsApi, 'unlinkPlaylist');
    vi.spyOn(groupsApi, 'getGroupPlaylists').mockResolvedValueOnce([
      { id: 'p1', name: 'Repertório Culto', songCount: 5 },
    ]);

    renderComponent('Admin');

    const deleteBtn = await screen.findByTitle('Remover do Grupo');
    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(unlinkSpy).not.toHaveBeenCalled();
  });

  it('shows error toast when loading playlists fails', async () => {
    vi.spyOn(groupsApi, 'getGroupPlaylists').mockRejectedValueOnce(new Error('Network error'));

    renderComponent('Admin');

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith('Falha ao carregar playlists compartilhadas', 'error');
    });
  });

  it('shows error toast when unlinking fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(groupsApi, 'getGroupPlaylists').mockResolvedValueOnce([
      { id: 'p1', name: 'Repertório Culto', songCount: 5 },
    ]);
    vi.spyOn(groupsApi, 'unlinkPlaylist').mockRejectedValueOnce(new Error('Server error'));

    renderComponent('Admin');

    const deleteBtn = await screen.findByTitle('Remover do Grupo');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith('Falha ao remover playlist', 'error');
    });
  });

  it('calls onLinkNew when share playlist button is clicked', async () => {
    vi.spyOn(groupsApi, 'getGroupPlaylists').mockResolvedValueOnce([]);

    renderComponent('Admin');

    const addBtn = await screen.findByText('Compartilhar Playlist');
    fireEvent.click(addBtn);
    expect(onLinkNewMock).toHaveBeenCalled();
  });
});
