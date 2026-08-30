import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareSongModal } from '../components/modals/ShareSongModal';
import { ToastProvider } from '../context/ToastContext';
import * as shareLinksApi from '../api/shareLinks';
import '@testing-library/jest-dom/vitest';

vi.mock('../api/shareLinks', () => ({
  createShareLink: vi.fn(),
}));

describe('ShareSongModal Component', () => {
  const defaultProps = {
    isOpen: true,
    songId: 'song-123',
    songTitle: 'Test Song',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = (props = defaultProps) => {
    return render(
      <ToastProvider>
        <ShareSongModal {...props} />
      </ToastProvider>
    );
  };

  it('renders correctly when open', () => {
    renderModal();

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generateLink|Gerar Link/i })).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderModal({ ...defaultProps, isOpen: false });

    expect(screen.queryByText('Test Song')).not.toBeInTheDocument();
  });

  it('generates link successfully and displays it', async () => {
    vi.mocked(shareLinksApi.createShareLink).mockResolvedValueOnce({
      token: 'token123',
      type: 'SONG',
      resourceId: 'song-123',
      resourceName: 'Test Song',
      authorName: 'Author',
      expiresAt: new Date().toISOString(),
      url: 'http://localhost/invite/token123',
    });

    renderModal();

    const generateBtn = screen.getByRole('button', { name: /generateLink|Gerar Link/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(shareLinksApi.createShareLink).toHaveBeenCalledWith({ type: 'SONG', resourceId: 'song-123' });
    });

    const urlInput = await screen.findByRole('textbox');
    expect((urlInput as HTMLInputElement).value).toContain("/invite/token123");
  });

  it('displays general error when API fails', async () => {
    vi.mocked(shareLinksApi.createShareLink).mockRejectedValueOnce(new Error('Network error'));

    renderModal();

    const generateBtn = screen.getByRole('button', { name: /generateLink|Gerar Link/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/generalError|Ocorreu um erro/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button or close icon is clicked', () => {
    renderModal();

    const cancelBtn = screen.getByRole('button', { name: /common.cancel|Cancelar/i });
    fireEvent.click(cancelBtn);

    expect(defaultProps.onClose).toHaveBeenCalled();

    const closeIconBtn = screen.getByLabelText('Close');
    fireEvent.click(closeIconBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });

  it('closes on Escape key press', () => {
    renderModal();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
