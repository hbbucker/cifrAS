import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { UsersPage } from '../pages/UsersPage';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import * as adminApi from '../api/adminApi';
import type { AdminUser, PagedResponse } from '../types/admin';

vi.mock('../api/adminApi');

const mockAdminUser: AdminUser = {
  id: 'admin-dev',
  email: 'admin@cifras.com',
  fullName: 'Administrador CifrAS',
  role: 'admin',
  status: 'ACTIVE',
  isBlocked: false,
  createdAt: '2026-01-01T00:00:00Z',
  songCount: 20,
  banned: false,
  isAdmin: true,
};

const mockActiveUser: AdminUser = {
  id: 'user-001',
  email: 'active@cifras.com',
  fullName: 'Usuário Ativo',
  role: 'user',
  status: 'ACTIVE',
  isBlocked: false,
  createdAt: '2026-02-10T12:00:00Z',
  songCount: 15,
  banned: false,
  isAdmin: false,
};

const mockBlockedUser: AdminUser = {
  id: 'user-002',
  email: 'blocked@cifras.com',
  fullName: 'Usuário Bloqueado',
  role: 'user',
  status: 'BLOCKED',
  isBlocked: true,
  lastBlockReason: 'Spam excessivo',
  createdAt: '2026-03-15T08:30:00Z',
  songCount: 0,
  banned: true,
  isAdmin: false,
};

const mockPagedResponse: PagedResponse<AdminUser> = {
  items: [mockAdminUser, mockActiveUser, mockBlockedUser],
  totalElements: 3,
  page: 0,
  pageSize: 15,
  totalPages: 1,
};

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('admin_token', 'admin-dev-token');
  });

  const renderComponent = () =>
    render(
      <AdminAuthProvider>
        <UsersPage />
      </AdminAuthProvider>
    );

  it('renders user list with correct status badges and details', async () => {
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue(mockPagedResponse);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Administrador CifrAS')).toBeInTheDocument();
      expect(screen.getByText('Usuário Ativo')).toBeInTheDocument();
      expect(screen.getByText('Usuário Bloqueado')).toBeInTheDocument();
    });

    // Check status badges
    expect(screen.getAllByText(/Ativo|Active/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Bloqueado|Blocked/i).length).toBeGreaterThanOrEqual(1);
  });

  it('disables block action button for the logged in admin (self-block prevention)', async () => {
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue(mockPagedResponse);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Administrador CifrAS')).toBeInTheDocument();
    });

    // The block button for current admin should be disabled
    const selfBlockBtn = screen.getByTitle(/Não é permitido bloquear a si próprio|cannot block your own/i);
    expect(selfBlockBtn).toBeInTheDocument();
    expect(selfBlockBtn).toBeDisabled();
  });

  it('opens BlockUserModal when clicking block button for an active user', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue(mockPagedResponse);

    renderComponent();

    const blockBtn = await screen.findByTestId('block-user-btn-user-001');
    await user.click(blockBtn);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Bloquear Usuário|Block User/i)).toBeInTheDocument();
    expect(within(dialog).getByText('active@cifras.com')).toBeInTheDocument();
  });

  it('opens UnblockUserModal when clicking unblock button for a blocked user', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue(mockPagedResponse);

    renderComponent();

    const unblockBtn = await screen.findByTestId('unblock-user-btn-user-002');
    await user.click(unblockBtn);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Desbloquear Usuário|Unblock User/i)).toBeInTheDocument();
    expect(within(dialog).getByText('blocked@cifras.com')).toBeInTheDocument();
  });

  it('opens UserAuditHistoryModal when clicking audit history button', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue(mockPagedResponse);
    vi.mocked(adminApi.getUserAuditLogs).mockResolvedValueOnce([]);

    renderComponent();

    const auditBtn = await screen.findByTestId('audit-user-btn-user-002');
    await user.click(auditBtn);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Trilha de Auditoria do Usuário|User Audit Trail/i)).toBeInTheDocument();
  });

  it('searches users when submitting search form', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue(mockPagedResponse);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Administrador CifrAS')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Filtrar por nome|Filter by name/i);
    await user.type(searchInput, 'maria');

    const searchBtn = screen.getByRole('button', { name: /Buscar|Search/i });
    await user.click(searchBtn);

    await waitFor(() => {
      expect(adminApi.getAdminUsers).toHaveBeenCalledWith(0, 15, 'maria');
    });
  });

  it('handles pagination navigation correctly', async () => {
    const user = userEvent.setup();
    const multiPageResponse: PagedResponse<AdminUser> = {
      items: [mockActiveUser],
      totalElements: 30,
      page: 0,
      pageSize: 15,
      totalPages: 2,
    };
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue(multiPageResponse);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Usuário Ativo')).toBeInTheDocument();
    });

    // Find right chevron button
    const paginationButtons = screen.getAllByRole('button').filter((b) => b.querySelector('svg.lucide-chevron-right'));
    expect(paginationButtons.length).toBeGreaterThan(0);
    await user.click(paginationButtons[0]);

    await waitFor(() => {
      expect(adminApi.getAdminUsers).toHaveBeenCalledWith(1, 15, '');
    });
  });

  it('renders empty data state when no users are returned', async () => {
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue({
      items: [],
      totalElements: 0,
      page: 0,
      pageSize: 15,
      totalPages: 0,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Nenhum registro encontrado|No records found/i)).toBeInTheDocument();
    });
  });

  it('handles error in fetchUsers gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(adminApi.getAdminUsers).mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it('updates table and displays toast when a user is blocked via modal', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue(mockPagedResponse);

    const updatedUser: AdminUser = {
      ...mockActiveUser,
      status: 'BLOCKED',
      isBlocked: true,
      lastBlockReason: 'Violação grave de termos',
    };
    vi.mocked(adminApi.blockUser).mockResolvedValueOnce(updatedUser);

    renderComponent();

    const blockBtn = await screen.findByTestId('block-user-btn-user-001');
    await user.click(blockBtn);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const textarea = within(dialog).getByPlaceholderText(/Informe o motivo|Provide a detailed reason/i);
    await user.type(textarea, 'Violação grave de termos');

    const confirmBlockBtn = within(dialog).getByRole('button', { name: /Confirmar Bloqueio|Confirm Block/i });
    await user.click(confirmBlockBtn);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/Usuário bloqueado com sucesso|User blocked successfully/i)).toBeInTheDocument();
    });
  });

  it('updates table and displays toast when a user is unblocked via modal', async () => {
    const user = userEvent.setup();
    vi.mocked(adminApi.getAdminUsers).mockResolvedValue(mockPagedResponse);

    const updatedUser: AdminUser = {
      ...mockBlockedUser,
      status: 'ACTIVE',
      isBlocked: false,
    };
    vi.mocked(adminApi.unblockUser).mockResolvedValueOnce(updatedUser);

    renderComponent();

    const unblockBtn = await screen.findByTestId('unblock-user-btn-user-002');
    await user.click(unblockBtn);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const confirmUnblockBtn = within(dialog).getByRole('button', { name: /Confirmar Desbloqueio|Confirm Unblock/i });
    await user.click(confirmUnblockBtn);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/Usuário desbloqueado com sucesso|User unblocked successfully/i)).toBeInTheDocument();
    });

    // Close toast button
    const closeToastBtn = screen.getByRole('status').querySelector('button');
    if (closeToastBtn) {
      await user.click(closeToastBtn);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    }
  });
});
