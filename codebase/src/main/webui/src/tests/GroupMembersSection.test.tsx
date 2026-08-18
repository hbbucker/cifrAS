import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupMembersSection } from '../components/groups/GroupMembersSection';
import * as groupsApi from '../api/groups';
import type { GroupMember, GroupInvitation } from '../types/groups';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

let mockCurrentUser = { id: 'u1', email: 'owner@band.com', name: 'Owner Person' };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    isAuthenticated: true,
    token: 'jwt-token',
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn()
  })
}));

const toastMock = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    toast: toastMock
  })
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number; name?: string }) => {
      if (key === 'group.members.title') return 'Membros';
      if (key === 'group.members.count_one') return '1 membro';
      if (key === 'group.members.count_other') return `${options?.count || 0} membros`;
      if (key === 'group.members.empty') return 'Nenhum membro ativo.';
      if (key === 'group.members.roles.owner') return 'Proprietário';
      if (key === 'group.members.roles.admin') return 'Admin';
      if (key === 'group.members.roles.member') return 'Membro';
      if (key === 'group.members.removeMember') return 'Remover do Grupo';
      if (key === 'group.members.leaveGroup') return 'Sair do Grupo';
      if (key === 'group.members.confirmRemoveTitle') return 'Remover Membro';
      if (key === 'group.members.confirmRemoveDesc') return `Deseja remover ${options?.name}?`;
      if (key === 'group.members.confirmLeaveTitle') return 'Sair do Grupo';
      if (key === 'group.members.confirmLeaveDesc') return `Deseja sair de ${options?.name}?`;
      if (key === 'group.invitations.title') return 'Convites Enviados';
      if (key === 'group.invitations.pending') return 'Aguardando resposta';
      if (key === 'group.invitations.declined') return 'Recusado';
      if (key === 'group.invitations.cancel') return 'Cancelar Convite';
      if (key === 'group.invitations.dismiss') return 'Dispensar';
      if (key === 'group.invitations.empty') return 'Nenhum convite pendente ou recusado.';
      if (key === 'group.invite') return 'Convidar Membro';
      if (key === 'common.confirm') return 'Confirmar';
      if (key === 'common.cancel') return 'Cancelar';
      return key;
    }
  })
}));

const mockMembers: GroupMember[] = [
  {
    id: 'm1',
    groupId: 'g1',
    userId: 'u1',
    email: 'owner@band.com',
    name: 'Owner Person',
    role: 'OWNER',
    joinedAt: '2026-01-01'
  },
  {
    id: 'm2',
    groupId: 'g1',
    userId: 'u2',
    email: 'guitar@band.com',
    name: 'Guitar Player',
    role: 'MEMBER',
    joinedAt: '2026-01-02'
  },
  {
    id: 'm3',
    groupId: 'g1',
    userId: 'u3',
    email: 'admin@band.com',
    name: '',
    role: 'ADMIN',
    joinedAt: '2026-01-03'
  }
];

const mockInvitations: GroupInvitation[] = [
  {
    id: 'inv1',
    groupId: 'g1',
    inviterId: 'u1',
    inviteeEmail: 'drums@band.com',
    status: 'PENDING'
  },
  {
    id: 'inv2',
    groupId: 'g1',
    inviterId: 'u1',
    inviteeEmail: 'declined@band.com',
    status: 'DECLINED'
  }
];

describe('GroupMembersSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = { id: 'u1', email: 'owner@band.com', name: 'Owner Person' };
    vi.spyOn(groupsApi, 'getGroupMembers').mockResolvedValue(mockMembers);
    vi.spyOn(groupsApi, 'getGroupInvitations').mockResolvedValue(mockInvitations);
    vi.spyOn(groupsApi, 'removeGroupMember').mockResolvedValue();
    vi.spyOn(groupsApi, 'cancelGroupInvitation').mockResolvedValue();
  });

  const renderComponent = (role: 'Admin' | 'Member' = 'Admin') => {
    return render(
      <BrowserRouter>
        <GroupMembersSection
          groupId="g1"
          groupName="Rockers"
          role={role}
          onInviteNew={vi.fn()}
          onMemberCountChange={vi.fn()}
        />
      </BrowserRouter>
    );
  };

  it('renders members list with names, roles and count for Admin', async () => {
    renderComponent('Admin');

    await waitFor(() => {
      expect(screen.getByText('Owner Person')).toBeInTheDocument();
      expect(screen.getByText('Guitar Player')).toBeInTheDocument();
      expect(screen.getAllByText('admin@band.com').length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText('Proprietário')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Membro')).toBeInTheDocument();
    expect(screen.getByText('drums@band.com')).toBeInTheDocument();
    expect(screen.getByText('Aguardando resposta')).toBeInTheDocument();
    expect(screen.getByText('declined@band.com')).toBeInTheDocument();
    expect(screen.getByText('Recusado')).toBeInTheDocument();
  });

  it('allows Admin to remove a regular member with modal confirmation and cancellation', async () => {
    renderComponent('Admin');

    await waitFor(() => {
      expect(screen.getByTestId('remove-member-btn-u2')).toBeInTheDocument();
    });

    // Open and cancel modal
    fireEvent.click(screen.getByTestId('remove-member-btn-u2'));
    expect(screen.getByText('Remover Membro')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancelar'));

    // Open and confirm removal
    fireEvent.click(screen.getByTestId('remove-member-btn-u2'));
    const confirmBtns = screen.getAllByText('Remover do Grupo');
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    await waitFor(() => {
      expect(groupsApi.removeGroupMember).toHaveBeenCalledWith('g1', 'u2');
    });
  });

  it('allows Admin to cancel a pending invitation and dismiss declined invitation', async () => {
    renderComponent('Admin');

    await waitFor(() => {
      expect(screen.getByTestId('cancel-invite-btn-inv1')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-invite-btn-inv2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('cancel-invite-btn-inv1'));
    await waitFor(() => {
      expect(groupsApi.cancelGroupInvitation).toHaveBeenCalledWith('g1', 'inv1');
    });

    fireEvent.click(screen.getByTestId('cancel-invite-btn-inv2'));
    await waitFor(() => {
      expect(groupsApi.cancelGroupInvitation).toHaveBeenCalledWith('g1', 'inv2');
    });
  });

  it('allows Member to cancel leaving or confirm leaving', async () => {
    mockCurrentUser = { id: 'u2', email: 'guitar@band.com', name: 'Guitar Player' };
    renderComponent('Member');

    await waitFor(() => {
      expect(screen.getByTestId('leave-group-btn')).toBeInTheDocument();
    });

    // Open and cancel
    fireEvent.click(screen.getByTestId('leave-group-btn'));
    expect(screen.getByText('Deseja sair de Rockers?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancelar'));

    // Open and confirm
    fireEvent.click(screen.getByTestId('leave-group-btn'));
    const confirmBtns = screen.getAllByText('Sair do Grupo');
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    await waitFor(() => {
      expect(groupsApi.removeGroupMember).toHaveBeenCalledWith('g1', 'u2');
    });
  });

  it('renders empty states when there are no members and no invites', async () => {
    vi.spyOn(groupsApi, 'getGroupMembers').mockResolvedValue([]);
    vi.spyOn(groupsApi, 'getGroupInvitations').mockResolvedValue([]);

    renderComponent('Admin');

    await waitFor(() => {
      expect(screen.getByText('Nenhum membro ativo.')).toBeInTheDocument();
      expect(screen.getByText('Nenhum convite pendente ou recusado.')).toBeInTheDocument();
    });
  });
});
