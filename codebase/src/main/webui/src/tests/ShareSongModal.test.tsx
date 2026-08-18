import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareSongModal } from '../components/modals/ShareSongModal';
import { ToastProvider } from '../context/ToastContext';
import * as songSharesApi from '../api/songShares';
import '@testing-library/jest-dom/vitest';

vi.mock('../api/songShares', () => ({
  shareSong: vi.fn(),
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
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sendInvite/i })).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderModal({ ...defaultProps, isOpen: false });

    expect(screen.queryByText('Test Song')).not.toBeInTheDocument();
  });

  it('submits form successfully and calls onSuccess and closes', async () => {
    vi.mocked(songSharesApi.shareSong).mockResolvedValueOnce({
      id: 'share-1',
      songId: 'song-123',
      inviterId: 'user-1',
      inviteeEmail: 'friend@test.com',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });

    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'friend@test.com' } });

    const submitBtn = screen.getByRole('button', { name: /sendInvite/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(songSharesApi.shareSong).toHaveBeenCalledWith('song-123', 'friend@test.com');
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('displays user not found error when API returns 404', async () => {
    vi.mocked(songSharesApi.shareSong).mockRejectedValueOnce({
      response: { status: 404 },
    });

    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'unknown@test.com' } });

    const submitBtn = screen.getByRole('button', { name: /sendInvite/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/userNotFound/i)).toBeInTheDocument();
    });

    // Clear error message on typing
    fireEvent.change(input, { target: { value: 'unknown2@test.com' } });
    expect(screen.queryByText(/userNotFound/i)).not.toBeInTheDocument();
  });

  it('displays self share error when API returns 400', async () => {
    vi.mocked(songSharesApi.shareSong).mockRejectedValueOnce({
      response: { status: 400 },
    });

    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'self@test.com' } });

    const submitBtn = screen.getByRole('button', { name: /sendInvite/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/selfShareError/i)).toBeInTheDocument();
    });
  });

  it('displays conflict error when API returns 409', async () => {
    vi.mocked(songSharesApi.shareSong).mockRejectedValueOnce({
      response: { status: 409 },
    });

    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'friend@test.com' } });

    const submitBtn = screen.getByRole('button', { name: /sendInvite/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/conflictError/i)).toBeInTheDocument();
    });
  });

  it('displays general error when API returns 500', async () => {
    vi.mocked(songSharesApi.shareSong).mockRejectedValueOnce({
      response: { status: 500 },
    });

    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'friend@test.com' } });

    const submitBtn = screen.getByRole('button', { name: /sendInvite/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/generalError/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button or close icon is clicked', () => {
    renderModal();

    const cancelBtn = screen.getByRole('button', { name: /common.cancel/i });
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
