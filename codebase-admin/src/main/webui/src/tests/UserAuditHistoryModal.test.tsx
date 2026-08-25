import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { UserAuditHistoryModal } from '../components/modals/UserAuditHistoryModal';
import * as adminApi from '../api/adminApi';
import type { AdminUser, UserAuditLog } from '../types/admin';

vi.mock('../api/adminApi');

const mockUser: AdminUser = {
  id: 'user-789',
  email: 'audited@cifras.com',
  fullName: 'Carlos Auditado',
  role: 'user',
  status: 'BLOCKED',
  isBlocked: true,
  createdAt: '2026-08-01T10:00:00Z',
  songCount: 3,
  banned: true,
  isAdmin: false,
};

const mockLogs: UserAuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-789',
    adminId: 'admin-001',
    adminEmail: 'admin@cifras.com',
    action: 'BLOCK',
    reason: 'Comportamento abusivo e envio de spam.',
    previousStatus: 'ACTIVE',
    newStatus: 'BLOCKED',
    createdAt: '2026-08-25T14:30:00Z',
  },
  {
    id: 'log-2',
    userId: 'user-789',
    adminId: 'admin-002',
    adminEmail: 'supervisor@cifras.com',
    action: 'UNBLOCK',
    reason: 'Desbloqueio temporário para revisão.',
    previousStatus: 'BLOCKED',
    newStatus: 'ACTIVE',
    createdAt: '2026-08-24T09:15:00Z',
  },
];

describe('UserAuditHistoryModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false or user is null', () => {
    const { container: c1 } = render(
      <UserAuditHistoryModal isOpen={false} user={mockUser} onClose={onClose} />
    );
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(
      <UserAuditHistoryModal isOpen={true} user={null} onClose={onClose} />
    );
    expect(c2).toBeEmptyDOMElement();
  });

  it('fetches and displays empty state when there are no logs', async () => {
    vi.mocked(adminApi.getUserAuditLogs).mockResolvedValueOnce([]);

    render(<UserAuditHistoryModal isOpen={true} user={mockUser} onClose={onClose} />);

    await waitFor(() => {
      expect(adminApi.getUserAuditLogs).toHaveBeenCalledWith('user-789');
      expect(screen.getByText(/Nenhum registro de auditoria|No audit logs/i)).toBeInTheDocument();
    });
  });

  it('fetches and displays list of audit logs with action, admin email, reason and date', async () => {
    vi.mocked(adminApi.getUserAuditLogs).mockResolvedValueOnce(mockLogs);

    render(<UserAuditHistoryModal isOpen={true} user={mockUser} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Auditado (audited@cifras.com)')).toBeInTheDocument();
      expect(screen.getByText('admin@cifras.com')).toBeInTheDocument();
      expect(screen.getByText('supervisor@cifras.com')).toBeInTheDocument();
      expect(screen.getByText('Comportamento abusivo e envio de spam.')).toBeInTheDocument();
      expect(screen.getByText('Desbloqueio temporário para revisão.')).toBeInTheDocument();
      expect(screen.getByText(/^(Bloqueio|Bloqueo|Blocked)$/i)).toBeInTheDocument();
      expect(screen.getByText(/^(Desbloqueio|Desbloqueo|Unblocked)$/i)).toBeInTheDocument();
    });
  });

  it('handles fetch error and allows retrying', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.getUserAuditLogs)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockLogs);

    render(<UserAuditHistoryModal isOpen={true} user={mockUser} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText(/Não foi possível carregar|Failed to load/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Tentar novamente|Retry/i });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Comportamento abusivo e envio de spam.')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button or ESC is pressed', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.getUserAuditLogs).mockResolvedValueOnce([]);

    render(<UserAuditHistoryModal isOpen={true} user={mockUser} onClose={onClose} />);

    const closeBtns = screen.getAllByRole('button', { name: /Fechar|Close/i });
    await user.click(closeBtns[0]);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
