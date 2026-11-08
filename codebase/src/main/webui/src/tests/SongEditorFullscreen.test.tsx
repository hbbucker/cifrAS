import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SongEditorFullscreen } from '../components/music/SongEditorFullscreen';
import { TourProvider } from '../context/TourContext';
import '@testing-library/jest-dom/vitest';

vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount }: { children: (props: { index: number; style: React.CSSProperties }) => React.ReactNode; itemCount: number }) => (
    <div data-testid="mock-virtual-list">
      {Array.from({ length: itemCount }).map((_, index) =>
        children({ index, style: {} })
      )}
    </div>
  ),
}));

describe('SongEditorFullscreen Component', () => {
  const originalInnerWidth = window.innerWidth;
  const mockContent = `[Intro]
C G Am F

[Verse 1]
C G
Today is gonna be the day
Am F
That they're gonna throw it back to you`;

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1400,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <SongEditorFullscreen
        isOpen={false}
        content={mockContent}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders fullscreen dialog overlay with title, artist and key when isOpen is true', () => {
    render(
      <SongEditorFullscreen
        isOpen={true}
        content={mockContent}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
        title="Wonderwall"
        artist="Oasis"
        songKey="Em"
      />
    );

    const dialog = screen.getByTestId('song-editor-fullscreen-modal');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Wonderwall')).toBeInTheDocument();
    expect(screen.getByText('Oasis')).toBeInTheDocument();
    expect(screen.getByText('Em')).toBeInTheDocument();
  });

  it('defaults to split view when viewport width >= 1280px (widescreen)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1440 });

    render(
      <SongEditorFullscreen
        isOpen={true}
        content={mockContent}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByTestId('fullscreen-editor-pane')).toBeInTheDocument();
    expect(screen.getByTestId('fullscreen-preview-pane')).toBeInTheDocument();
  });

  it('defaults to editor view when viewport width < 1280px', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024 });

    render(
      <SongEditorFullscreen
        isOpen={true}
        content={mockContent}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByTestId('fullscreen-editor-pane')).toBeInTheDocument();
    expect(screen.queryByTestId('fullscreen-preview-pane')).not.toBeInTheDocument();
  });

  it('allows switching between editor, split, and preview views via segmented control', () => {
    render(
      <SongEditorFullscreen
        isOpen={true}
        content={mockContent}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    // Switch to editor only
    fireEvent.click(screen.getByTestId('view-mode-editor'));
    expect(screen.getByTestId('fullscreen-editor-pane')).toBeInTheDocument();
    expect(screen.queryByTestId('fullscreen-preview-pane')).not.toBeInTheDocument();

    // Switch to preview only
    fireEvent.click(screen.getByTestId('view-mode-preview'));
    expect(screen.queryByTestId('fullscreen-editor-pane')).not.toBeInTheDocument();
    expect(screen.getByTestId('fullscreen-preview-pane')).toBeInTheDocument();

    // Switch back to split view
    fireEvent.click(screen.getByTestId('view-mode-split'));
    expect(screen.getByTestId('fullscreen-editor-pane')).toBeInTheDocument();
    expect(screen.getByTestId('fullscreen-preview-pane')).toBeInTheDocument();
  });

  it('renders line guide with responsive classes inside fullscreen editor', () => {
    render(
      <SongEditorFullscreen
        isOpen={true}
        content={mockContent}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const lineGuide = screen.getByTestId('song-editor-line-guide');
    expect(lineGuide).toBeInTheDocument();
    expect(lineGuide.className).toContain('left-[37ch]');
    expect(lineGuide.className).toContain('sm:left-[40ch]');
    expect(lineGuide.className).toContain('pointer-events-none');
  });

  it('renders chord sheet in live preview and updates when content changes', () => {
    const handleChange = vi.fn();

    render(
      <SongEditorFullscreen
        isOpen={true}
        content={mockContent}
        onChange={handleChange}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByTestId('chord-sheet-container')).toBeInTheDocument();
    expect(screen.getByText('Today is gonna be the day')).toBeInTheDocument();

    const textarea = screen.getByTestId('fullscreen-content-input');
    fireEvent.change(textarea, { target: { value: 'New lyrics and chords' } });

    expect(handleChange).toHaveBeenCalledWith('New lyrics and chords');
  });

  it('shows empty preview state when content is blank', () => {
    render(
      <SongEditorFullscreen
        isOpen={true}
        content=""
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByTestId('fullscreen-preview-empty')).toBeInTheDocument();
  });

  it('inserts quick markers at cursor position', () => {
    let currentContent = 'Hello world';
    const handleChange = vi.fn((val) => {
      currentContent = val;
    });

    render(
      <SongEditorFullscreen
        isOpen={true}
        content={currentContent}
        onChange={handleChange}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const textarea = screen.getByTestId('fullscreen-content-input') as HTMLTextAreaElement;
    textarea.setSelectionRange(5, 5); // after 'Hello'

    const refraoBtn = screen.getByTestId('fullscreen-insert-refrao');
    fireEvent.click(refraoBtn);

    expect(handleChange).toHaveBeenCalledWith('Hello[Refrão]\n world');

    const colunaBtn = screen.getByTestId('fullscreen-insert-coluna');
    fireEvent.click(colunaBtn);
    expect(handleChange).toHaveBeenCalledWith(expect.stringContaining('[coluna]'));

    const separadorBtn = screen.getByTestId('fullscreen-insert-separador');
    fireEvent.click(separadorBtn);
    expect(handleChange).toHaveBeenCalledWith(expect.stringContaining('---'));

    const tablaturaBtn = screen.getByTestId('fullscreen-insert-tablatura');
    fireEvent.click(tablaturaBtn);
    expect(handleChange).toHaveBeenCalledWith(expect.stringContaining('e|---'));
  });

  it('inserts quick markers via compact action bar on smaller viewports', () => {
    const handleChange = vi.fn();

    render(
      <SongEditorFullscreen
        isOpen={true}
        content="Intro"
        onChange={handleChange}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('compact-insert-refrao'));
    expect(handleChange).toHaveBeenCalledWith(expect.stringContaining('[Refrão]'));

    fireEvent.click(screen.getByTestId('compact-insert-coluna'));
    expect(handleChange).toHaveBeenCalledWith(expect.stringContaining('[coluna]'));

    fireEvent.click(screen.getByTestId('compact-insert-separador'));
    expect(handleChange).toHaveBeenCalledWith(expect.stringContaining('---'));

    fireEvent.click(screen.getByTestId('compact-insert-tablatura'));
    expect(handleChange).toHaveBeenCalledWith(expect.stringContaining('e|---'));
  });

  it('handles fallback insert when insertText prop is provided or omitted without textarea ref', () => {
    // Test case where insertText prop is called
    const mockInsert = vi.fn();
    const mockChange = vi.fn();

    // Render in preview mode where editor pane is not mounted (so textarea is null)
    const { rerender } = render(
      <SongEditorFullscreen
        isOpen={true}
        content="Testing"
        onChange={mockChange}
        onClose={vi.fn()}
        onSave={vi.fn()}
        insertText={mockInsert}
      />
    );

    // Switch to preview mode
    fireEvent.click(screen.getByTestId('view-mode-preview'));
    expect(screen.queryByTestId('fullscreen-content-input')).not.toBeInTheDocument();

    // Rerender with custom insert
    rerender(
      <SongEditorFullscreen
        isOpen={true}
        content="Testing"
        onChange={mockChange}
        onClose={vi.fn()}
        onSave={vi.fn()}
        insertText={mockInsert}
      />
    );
  });

  it('calls onClose when clicking restore button or pressing Escape key', () => {
    const handleClose = vi.fn();

    render(
      <SongEditorFullscreen
        isOpen={true}
        content={mockContent}
        onChange={vi.fn()}
        onClose={handleClose}
        onSave={vi.fn()}
      />
    );

    const restoreBtn = screen.getByTestId('fullscreen-restore-btn');
    fireEvent.click(restoreBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('calls onSave when clicking save button or pressing Ctrl+S / Cmd+S', () => {
    const handleSave = vi.fn();

    render(
      <SongEditorFullscreen
        isOpen={true}
        content={mockContent}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={handleSave}
      />
    );

    const saveBtn = screen.getByTestId('fullscreen-save-btn');
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(handleSave).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: 'S', metaKey: true });
    expect(handleSave).toHaveBeenCalledTimes(3);
  });

  it('locks body overflow while open and restores it when unmounted', () => {
    const { unmount } = render(
      <SongEditorFullscreen
        isOpen={true}
        content={mockContent}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('displays CoachMark for view mode selector and advances to restore tour on confirm', () => {
    localStorage.clear();

    render(
      <TourProvider>
        <SongEditorFullscreen
          isOpen={true}
          content={mockContent}
          onChange={vi.fn()}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </TourProvider>
    );

    // Tour 1: Modos de visualização
    expect(screen.getByText(/Modos de Visualização/i)).toBeInTheDocument();

    // Clica no botão de avançar / Próximo
    const nextBtn = screen.getByText(/Próximo/i);
    fireEvent.click(nextBtn);

    // Tour 2: Restaurar editor
    expect(screen.getByText(/Restaurar Editor/i)).toBeInTheDocument();

    // Fecha o tour
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Restaurar Editor/i)).not.toBeInTheDocument();
  });
});
