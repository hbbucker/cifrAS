import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TutorialVideoModal, DEFAULT_GROUP_TUTORIAL_VIDEO_ID } from '../components/modals/TutorialVideoModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('TutorialVideoModal', () => {
  it('does not render when isOpen is false', () => {
    render(<TutorialVideoModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('tutorial-video-modal')).not.toBeInTheDocument();
  });

  it('renders YouTube embed iframe and external link when open', () => {
    render(<TutorialVideoModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const iframe = screen.getByTestId('tutorial-video-iframe') as HTMLIFrameElement;
    expect(iframe.src).toContain(`https://www.youtube.com/embed/${DEFAULT_GROUP_TUTORIAL_VIDEO_ID}?rel=0`);
    const link = screen.getByTestId('tutorial-youtube-link') as HTMLAnchorElement;
    expect(link.href).toContain(`https://youtube.com/shorts/${DEFAULT_GROUP_TUTORIAL_VIDEO_ID}`);
  });

  it('calls onClose when close button, backdrop, or Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<TutorialVideoModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('tutorial-modal-close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('tutorial-video-modal'));
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
