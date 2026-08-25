import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { UnblockUserModal } from '../components/modals/UnblockUserModal';
import * as adminApi from '../api/adminApi';
import type { AdminUser } from '../types/admin';

vi.mock('../api/adminApi');

const mockBlockedUser: AdminUser = {
  id: 'user-456',
  email: 'blocked@cifras.com',
  fullName: 'Maria Bloqueada',
  role: 'user',
  status: 'BLOCKED',
  isBlocked: true,
  lastBlockReason: 'Violação de regras',
  createdAt: '2026-08-15T10:00:00Z',
  songCount: 12,
  banned: true,
  isAdmin: false,
};

describe('UnblockUserModal', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false or user is null', () => {
    const { container: c1 } = render(
      <UnblockUserModal isOpen={false} user={mockBlockedUser} onClose={onClose} onSuccess={onSuccess} />
    );
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(
      <UnblockUserModal isOpen={true} user={null} onClose={onClose} onSuccess={onSuccess} />
    );
    expect(c2).toBeEmptyDOMElement();
  });

  it('renders user details, confirmation text, and confirm button', () => {
    render(
      <UnblockUserModal isOpen={true} user={mockBlockedUser} onClose={onClose} onSuccess={onSuccess} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Maria Bloqueada')).toBeInTheDocument();
    expect(screen.getByText('blocked@cifras.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar Desbloqueio|Confirm Unblock/i })).toBeInTheDocument();
  });

  it('calls unblockUser API without reason if empty and succeeds', async () => {
    const user = userEvent.setup();
    const updatedUser: AdminUser = {
      ...mockBlockedUser,
      status: 'ACTIVE',
      isBlocked: false,
      lastBlockReason: undefined,
    };

    vi.mocked(adminApi.unblockUser).mockResolvedValueOnce(updatedUser);

    render(
      <UnblockUserModal isOpen={true} user={mockBlockedUser} onClose={onClose} onSuccess={onSuccess} />
    );

    const submitBtn = screen.getByRole('button', { name: /Confirmar Desbloqueio|Confirm Unblock/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.unblockUser).toHaveBeenCalledWith('user-456', undefined);
      expect(onSuccess).toHaveBeenCalledWith(updatedUser);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('calls unblockUser API with reason if provided', async () => {
    const user = userEvent.setup();
    const updatedUser: AdminUser = {
      ...mockBlockedUser,
      status: 'ACTIVE',
      isBlocked: false,
    };

    vi.mocked(adminApi.unblockUser).mockResolvedValueOnce(updatedUser);

    render(
      <UnblockUserModal isOpen={true} user={mockBlockedUser} onClose={onClose} onSuccess={onSuccess} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Recurso aceito pelo suporte');

    const submitBtn = screen.getByRole('button', { name: /Confirmar Desbloqueio|Confirm Unblock/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.unblockUser).toHaveBeenCalledWith('user-456', 'Recurso aceito pelo suporte');
      expect(onSuccess).toHaveBeenCalledWith(updatedUser);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays API error message when unblockUser fails', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.unblockUser).mockRejectedValueOnce({
      response: { data: { message: 'UNBLOCK_FAILED' } },
    });

    render(
      <UnblockUserModal isOpen={true} user={mockBlockedUser} onClose={onClose} onSuccess={onSuccess} />
    );

    const submitBtn = screen.getByRole('button', { name: /Confirmar Desbloqueio|Confirm Unblock/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('UNBLOCK_FAILED')).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel or ESC key is pressed', async () => {
    const user = userEvent.setup();
    render(
      <UnblockUserModal isOpen={true} user={mockBlockedUser} onClose={onClose} onSuccess={onSuccess} />
    );

    const cancelBtn = screen.getByRole('button', { name: /Cancelar|Cancel/i });
    await user.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
