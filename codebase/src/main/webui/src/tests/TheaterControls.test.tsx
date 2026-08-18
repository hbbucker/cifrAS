import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TheaterControls } from '../components/theater/TheaterControls';
import '@testing-library/jest-dom/vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        'theater.slow': 'Lento',
        'theater.fast': 'Rápido',
        'theater.aMinus': 'A-',
        'theater.aPlus': 'A+',
        'theater.decreaseFont': 'Diminuir Fonte',
        'theater.increaseFont': 'Aumentar Fonte',
        'theater.lock': 'Bloquear Tela',
        'theater.unlock': 'Desbloquear Tela',
        'theater.fullscreen': 'Tela Cheia',
        'theater.exit': 'Sair do Modo Teatro',
        'theater.singerMode': 'Modo Cantor',
        'theater.chordsMode': 'Modo Cifras',
      };
      return dict[key] || key;
    }
  })
}));

describe('TheaterControls Component', () => {
  const defaultProps = {
    isScrolling: false,
    speed: 3,
    currentKey: 'C',
    onPlayPause: vi.fn(),
    onSpeedChange: vi.fn(),
    onTransposeUp: vi.fn(),
    onTransposeDown: vi.fn(),
    onNextSong: vi.fn(),
    onPrevSong: vi.fn(),
    onToggleFullscreen: vi.fn(),
    onExit: vi.fn(),
    onFontSizeIncrease: vi.fn(),
    onFontSizeDecrease: vi.fn(),
    isLocked: false,
    onLockToggle: vi.fn(),
    isSingerMode: false,
    onToggleSingerMode: vi.fn(),
  };

  it('renders all control buttons including Singer Mode button', () => {
    render(<TheaterControls {...defaultProps} />);

    expect(screen.getByTestId('play-pause-btn')).toBeInTheDocument();
    expect(screen.getByTestId('speed-slider')).toBeInTheDocument();
    expect(screen.getByTestId('next-song-btn')).toBeInTheDocument();
    expect(screen.getByTestId('prev-song-btn')).toBeInTheDocument();
    expect(screen.getByTestId('decrease-font-btn')).toBeInTheDocument();
    expect(screen.getByTestId('increase-font-btn')).toBeInTheDocument();
    expect(screen.getByTestId('singer-mode-btn')).toBeInTheDocument();
    expect(screen.getByTestId('lock-mode-btn')).toBeInTheDocument();
    expect(screen.getByTestId('fullscreen-btn')).toBeInTheDocument();
    expect(screen.getByTestId('exit-theater-btn')).toBeInTheDocument();
  });

  it('toggles singer mode when singer-mode-btn is clicked', () => {
    const onToggleSingerMode = vi.fn();
    render(<TheaterControls {...defaultProps} onToggleSingerMode={onToggleSingerMode} />);

    const singerBtn = screen.getByTestId('singer-mode-btn');
    expect(singerBtn).toHaveAttribute('title', 'Modo Cantor');

    fireEvent.click(singerBtn);
    expect(onToggleSingerMode).toHaveBeenCalledTimes(1);
  });

  it('updates title and active styling when isSingerMode is true', () => {
    render(<TheaterControls {...defaultProps} isSingerMode={true} />);

    const singerBtn = screen.getByTestId('singer-mode-btn');
    expect(singerBtn).toHaveAttribute('title', 'Modo Cifras');
  });

  it('hides transpose pad when in singer mode and displays it in chords mode', () => {
    const { rerender } = render(<TheaterControls {...defaultProps} isSingerMode={false} />);

    // In chords mode, transpose controls are present
    expect(screen.getByTestId('transpose-up')).toBeInTheDocument();
    expect(screen.getByTestId('transpose-down')).toBeInTheDocument();

    // In singer mode, transpose controls are hidden
    rerender(<TheaterControls {...defaultProps} isSingerMode={true} />);
    expect(screen.queryByTestId('transpose-up')).not.toBeInTheDocument();
    expect(screen.queryByTestId('transpose-down')).not.toBeInTheDocument();
  });

  it('disables controls and hides singer mode button when screen is locked', () => {
    render(<TheaterControls {...defaultProps} isLocked={true} />);

    expect(screen.queryByTestId('singer-mode-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('speed-slider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('next-song-btn')).not.toBeInTheDocument();
  });

  it('triggers callbacks for play/pause, speed change, font size, fullscreen, and exit', () => {
    const onPlayPause = vi.fn();
    const onSpeedChange = vi.fn();
    const onFontSizeIncrease = vi.fn();
    const onFontSizeDecrease = vi.fn();
    const onToggleFullscreen = vi.fn();
    const onExit = vi.fn();
    const onLockToggle = vi.fn();
    const onNextSong = vi.fn();
    const onPrevSong = vi.fn();

    render(
      <TheaterControls
        {...defaultProps}
        onPlayPause={onPlayPause}
        onSpeedChange={onSpeedChange}
        onFontSizeIncrease={onFontSizeIncrease}
        onFontSizeDecrease={onFontSizeDecrease}
        onToggleFullscreen={onToggleFullscreen}
        onExit={onExit}
        onLockToggle={onLockToggle}
        onNextSong={onNextSong}
        onPrevSong={onPrevSong}
      />
    );

    fireEvent.click(screen.getByTestId('play-pause-btn'));
    expect(onPlayPause).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByTestId('speed-slider'), { target: { value: '7' } });
    expect(onSpeedChange).toHaveBeenCalledWith(7);

    fireEvent.click(screen.getByTestId('increase-font-btn'));
    expect(onFontSizeIncrease).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('decrease-font-btn'));
    expect(onFontSizeDecrease).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('lock-mode-btn'));
    expect(onLockToggle).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('fullscreen-btn'));
    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('exit-theater-btn'));
    expect(onExit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('next-song-btn'));
    expect(onNextSong).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('prev-song-btn'));
    expect(onPrevSong).toHaveBeenCalledTimes(1);
  });
});
