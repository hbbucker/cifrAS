import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPlaylistPresentationModal } from '../components/modals/ExportPlaylistPresentationModal';
import type { SongForPresentation } from '../utils/presentationGenerator';

// Mock dependencies
const mockToast = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'playlistPresentation.modalTitle': 'Apresentação de Slides (.pptx)',
        'playlistPresentation.modalSubtitle': 'Gere slides formatados sem cifras',
        'playlistPresentation.theme': 'Tema de Cores',
        'playlistPresentation.themeDark': 'Telão / Dark',
        'playlistPresentation.themeLight': 'Claro / Clean',
        'playlistPresentation.themeLiturgic': 'Litúrgico / Solene',
        'playlistPresentation.optionsTitle': 'Opções de Apresentação',
        'playlistPresentation.includeCover': 'Slide de abertura da playlist',
        'playlistPresentation.includeSongTitles': 'Slide de título antes de cada música',
        'playlistPresentation.selectSongs': 'Músicas a incluir',
        'playlistPresentation.selectAll': 'Selecionar todas',
        'playlistPresentation.deselectAll': 'Desmarcar todas',
        'playlistPresentation.copyLyrics': 'Copiar Letras Limpas',
        'playlistPresentation.copySuccess': 'Letras copiadas para a área de transferência!',
        'playlistPresentation.downloadPptx': 'Baixar PowerPoint (.pptx)',
        'playlistPresentation.generating': 'Gerando slides...',
        'playlistPresentation.exportSuccess': 'Apresentação baixada com sucesso!',
        'playlistPresentation.exportError': 'Erro ao gerar apresentação de slides.',
        'playlistPresentation.noSongsSelected': 'Selecione ao menos uma música.',
      };
      return translations[key] || key;
    },
  }),
}));

const mockGeneratePresentation = vi.fn();
const mockExportCleanLyricsText = vi.fn().mockReturnValue('CLEAN LYRICS TEXT');

vi.mock('../utils/presentationGenerator', async () => {
  const actual = await vi.importActual<typeof import('../utils/presentationGenerator')>(
    '../utils/presentationGenerator'
  );
  return {
    ...actual,
    generatePlaylistPresentation: (...args: unknown[]) => mockGeneratePresentation(...args),
    exportCleanLyricsText: (...args: unknown[]) => mockExportCleanLyricsText(...args),
  };
});

describe('ExportPlaylistPresentationModal', () => {
  const sampleSongs: SongForPresentation[] = [
    { id: '1', title: 'Música 1', artist: 'Artista 1' },
    { id: '2', title: 'Música 2', artist: 'Artista 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should render modal with playlist title and song list when isOpen is true', () => {
    render(
      <ExportPlaylistPresentationModal
        isOpen={true}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Apresentação de Slides (.pptx)')).toBeInTheDocument();
    expect(screen.getByText('Música 1')).toBeInTheDocument();
    expect(screen.getByText('Música 2')).toBeInTheDocument();
  });

  it('should not render anything when isOpen is false', () => {
    render(
      <ExportPlaylistPresentationModal
        isOpen={false}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText('Apresentação de Slides (.pptx)')).not.toBeInTheDocument();
  });

  it('should toggle song selection when clicked and allow select/deselect all', () => {
    render(
      <ExportPlaylistPresentationModal
        isOpen={true}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={vi.fn()}
      />
    );

    const song1Item = screen.getByTestId('presentation-song-item-1');
    fireEvent.click(song1Item);

    // Clicking deselect all then select all
    fireEvent.click(screen.getByText('Desmarcar todas'));
    expect(screen.getByTestId('download-pptx-btn')).toBeDisabled();

    fireEvent.click(screen.getByText('Selecionar todas'));
    expect(screen.getByTestId('download-pptx-btn')).not.toBeDisabled();
  });

  it('should switch theme when theme buttons are clicked', () => {
    render(
      <ExportPlaylistPresentationModal
        isOpen={true}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={vi.fn()}
      />
    );

    const lightBtn = screen.getByTestId('theme-light-btn');
    fireEvent.click(lightBtn);
    expect(lightBtn.className).toContain('border-[#aa3bff]');

    const liturgicBtn = screen.getByTestId('theme-liturgic-btn');
    fireEvent.click(liturgicBtn);
    expect(liturgicBtn.className).toContain('border-[#aa3bff]');

    const darkBtn = screen.getByTestId('theme-dark-btn');
    fireEvent.click(darkBtn);
    expect(darkBtn.className).toContain('border-[#aa3bff]');
  });

  it('should toggle options checkboxes (cover and song titles)', () => {
    render(
      <ExportPlaylistPresentationModal
        isOpen={true}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={vi.fn()}
      />
    );

    const coverCheckbox = screen.getByLabelText('Slide de abertura da playlist');
    expect(coverCheckbox).toBeChecked();
    fireEvent.click(coverCheckbox);
    expect(coverCheckbox).not.toBeChecked();

    const titleCheckbox = screen.getByLabelText('Slide de título antes de cada música');
    expect(titleCheckbox).toBeChecked();
    fireEvent.click(titleCheckbox);
    expect(titleCheckbox).not.toBeChecked();
  });

  it('should copy lyrics to clipboard when copy button is clicked', async () => {
    render(
      <ExportPlaylistPresentationModal
        isOpen={true}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={vi.fn()}
      />
    );

    const copyBtn = screen.getByTestId('copy-lyrics-btn');
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('CLEAN LYRICS TEXT');
      expect(mockToast).toHaveBeenCalledWith(
        'Letras copiadas para a área de transferência!',
        'success'
      );
    });
  });

  it('should handle clipboard copy failure gracefully', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('Clipboard error'));

    render(
      <ExportPlaylistPresentationModal
        isOpen={true}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={vi.fn()}
      />
    );

    const copyBtn = screen.getByTestId('copy-lyrics-btn');
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Erro ao gerar apresentação de slides.', 'error');
    });
  });

  it('should call generatePlaylistPresentation and close modal on successful download', async () => {
    mockGeneratePresentation.mockResolvedValueOnce(undefined);
    const onClose = vi.fn();

    render(
      <ExportPlaylistPresentationModal
        isOpen={true}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={onClose}
      />
    );

    const downloadBtn = screen.getByTestId('download-pptx-btn');
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(mockGeneratePresentation).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith('Apresentação baixada com sucesso!', 'success');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should show error toast if generation fails', async () => {
    mockGeneratePresentation.mockRejectedValueOnce(new Error('Generation failed'));

    render(
      <ExportPlaylistPresentationModal
        isOpen={true}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={vi.fn()}
      />
    );

    const downloadBtn = screen.getByTestId('download-pptx-btn');
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Erro ao gerar apresentação de slides.', 'error');
    });
  });

  it('should handle Escape key and close button', () => {
    const onClose = vi.fn();
    render(
      <ExportPlaylistPresentationModal
        isOpen={true}
        playlistTitle="Missa de Domingo"
        songs={sampleSongs}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId('close-presentation-modal-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
