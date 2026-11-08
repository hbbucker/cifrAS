import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportSongModal } from '../components/modals/ImportSongModal';
import { ToastProvider } from '../context/ToastContext';
import * as songsApi from '../api/songs';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../api/songs', () => ({
  importSong: vi.fn(),
}));

describe('ImportSongModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = (props = defaultProps) => {
    return render(
      <ToastProvider>
        <ImportSongModal {...props} />
      </ToastProvider>
    );
  };

  it('renders correctly when open with supported provider links and badges', () => {
    renderModal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Importar Cifra da Web|Import Song from Web|Importar Acordes de la Web/i)).toBeInTheDocument();
    
    const cifraclubLink = screen.getByTestId('provider-badge-cifraclub');
    expect(cifraclubLink).toHaveAttribute('href', 'https://www.cifraclub.com.br');
    expect(cifraclubLink).toHaveAttribute('target', '_blank');

    const ugLink = screen.getByTestId('provider-badge-ultimate-guitar');
    expect(ugLink).toHaveAttribute('href', 'https://www.ultimate-guitar.com');

    const lacuerdaLink = screen.getByTestId('provider-badge-lacuerda');
    expect(lacuerdaLink).toHaveAttribute('href', 'https://lacuerda.net');

    const chordieLink = screen.getByTestId('provider-badge-chordie');
    expect(chordieLink).toHaveAttribute('href', 'https://www.chordie.com');

    const echordsLink = screen.getByTestId('provider-badge-e-chords');
    expect(echordsLink).toHaveAttribute('href', 'https://www.e-chords.com');
  });

  it('does not render when isOpen is false', () => {
    renderModal({ ...defaultProps, isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('detects provider dynamically when user types URL', () => {
    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall' } });

    expect(screen.getByText(/Provedor detectado: Ultimate Guitar|Provider detected: Ultimate Guitar/i)).toBeInTheDocument();
  });

  it('shows quick search links when user types search terms instead of URL', () => {
    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Tempo Perdido' } });

    expect(screen.getByText(/Clique em um site para buscar uma música:|Click on a site to search for a song:|Haz clic en un sitio para buscar una canción:/i)).toBeInTheDocument();
    
    const quickSearchUg = screen.getByTestId('quick-search-ultimate-guitar');
    expect(quickSearchUg).toHaveAttribute('href', expect.stringContaining('Tempo%20Perdido'));
    expect(quickSearchUg).toHaveAttribute('target', '_blank');

    const quickSearchCifraClub = screen.getByTestId('quick-search-cifraclub');
    expect(quickSearchCifraClub).toHaveAttribute('href', expect.stringContaining('Tempo%20Perdido'));
  });

  it('imports song and navigates on success', async () => {
    vi.mocked(songsApi.importSong).mockResolvedValueOnce({
      id: 'song-imported-123',
      title: 'Wonderwall',
      artist: 'Oasis',
      originalKey: 'Em',
      keySignature: 'Em',
      lyrics: { sections: [] },
      isFavorite: false,
      tags: ['imported', 'ultimate-guitar'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall' } });

    const submitBtn = screen.getByRole('button', { name: /common.import|Importar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(songsApi.importSong).toHaveBeenCalledWith('https://tabs.ultimate-guitar.com/tab/oasis/wonderwall');
      expect(mockNavigate).toHaveBeenCalledWith('/songs/edit/song-imported-123');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles API error gracefully without crashing', async () => {
    vi.mocked(songsApi.importSong).mockRejectedValueOnce(new Error('Import failed'));

    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'https://invalid-site.com/song' } });

    const submitBtn = screen.getByRole('button', { name: /common.import|Importar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(songsApi.importSong).toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  it('calls onClose when close or cancel button is clicked', () => {
    renderModal();

    const cancelBtn = screen.getByRole('button', { name: /common.cancel|Cancelar/i });
    fireEvent.click(cancelBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();

    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });
});
