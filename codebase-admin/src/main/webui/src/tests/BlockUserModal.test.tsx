import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BlockUserModal } from '../components/modals/BlockUserModal';
import * as adminApi from '../api/adminApi';
import type { AdminUser } from '../types/admin';

vi.mock('../api/adminApi');

const mockUser: AdminUser = {
  id: 'user-123',
  email: 'violator@cifras.com',
  fullName: 'João Infrator',
  role: 'user',
  status: 'ACTIVE',
  isBlocked: false,
  createdAt: '2026-08-20T10:00:00Z',
  songCount: 5,
  banned: false,
  isAdmin: false,
};

describe('BlockUserModal', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false or user is null', () => {
    const { container: c1 } = render(
      <BlockUserModal isOpen={false} user={mockUser} onClose={onClose} onSuccess={onSuccess} />
    );
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(
      <BlockUserModal isOpen={true} user={null} onClose={onClose} onSuccess={onSuccess} />
    );
    expect(c2).toBeEmptyDOMElement();
  });

  it('renders user details, warning description, character counter, and disabled confirm button initially', () => {
    render(
      <BlockUserModal isOpen={true} user={mockUser} onClose={onClose} onSuccess={onSuccess} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('João Infrator')).toBeInTheDocument();
    expect(screen.getByText('violator@cifras.com')).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 1000/)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Confirmar Bloqueio|Confirm Block/i });
    expect(submitBtn).toBeDisabled();
  });

  it('shows validation error when reason is shorter than 5 characters after touch', async () => {
    const user = userEvent.setup();
    render(
      <BlockUserModal isOpen={true} user={mockUser} onClose={onClose} onSuccess={onSuccess} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'abc');
    fireEvent.blur(textarea);

    expect(screen.getByText(/3 \/ 1000/)).toBeInTheDocument();
    expect(screen.getByText(/mínimo 5 caracteres|at least 5 characters/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Confirmar Bloqueio|Confirm Block/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button and calls blockUser API on successful submit', async () => {
    const user = userEvent.setup();
    const updatedUser: AdminUser = {
      ...mockUser,
      status: 'BLOCKED',
      isBlocked: true,
      lastBlockReason: 'Spam excessivo na plataforma',
    };

    vi.mocked(adminApi.blockUser).mockResolvedValueOnce(updatedUser);

    render(
      <BlockUserModal isOpen={true} user={mockUser} onClose={onClose} onSuccess={onSuccess} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Spam excessivo na plataforma');

    const submitBtn = screen.getByRole('button', { name: /Confirmar Bloqueio|Confirm Block/i });
    expect(submitBtn).not.toBeDisabled();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.blockUser).toHaveBeenCalledWith('user-123', 'Spam excessivo na plataforma');
      expect(onSuccess).toHaveBeenCalledWith(updatedUser);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays API error message when blockUser fails', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.blockUser).mockRejectedValueOnce({
      response: { data: { message: 'CANNOT_BLOCK_SELF' } },
    });

    render(
      <BlockUserModal isOpen={true} user={mockUser} onClose={onClose} onSuccess={onSuccess} />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Motivo válido com mais de cinco caracteres');

    const submitBtn = screen.getByRole('button', { name: /Confirmar Bloqueio|Confirm Block/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('CANNOT_BLOCK_SELF')).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button or escape key is pressed', async () => {
    const user = userEvent.setup();
    render(
      <BlockUserModal isOpen={true} user={mockUser} onClose={onClose} onSuccess={onSuccess} />
    );

    const cancelBtn = screen.getByRole('button', { name: /Cancelar|Cancel/i });
    await user.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
