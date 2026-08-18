import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GroupCard } from '../components/cards/GroupCard';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      if (key === 'group.members.count_one') return '1 membro';
      if (key === 'group.members.count_other') return `${options?.count || 0} membros`;
      if (key === 'group.members.roles.admin') return 'Admin';
      if (key === 'group.members.roles.member') return 'Membro';
      if (key === 'group.invite') return 'Convidar Membro';
      if (key === 'group.leave') return 'Sair do Grupo';
      return key;
    }
  })
}));

describe('GroupCard Component', () => {
  it('renders group card with name, single member count and role badge', () => {
    render(
      <BrowserRouter>
        <GroupCard
          id="1"
          name="Acoustic Trio"
          memberCount={1}
          role="Admin"
          onInvite={vi.fn()}
          onLeave={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Acoustic Trio')).toBeInTheDocument();
    expect(screen.getByText('1 membro')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders group card with plural members count', () => {
    render(
      <BrowserRouter>
        <GroupCard
          id="2"
          name="Rock Band"
          memberCount={5}
          role="Member"
          onInvite={vi.fn()}
          onLeave={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('5 membros')).toBeInTheDocument();
    expect(screen.getByText('Membro')).toBeInTheDocument();
  });

  it('opens menu and triggers callbacks', () => {
    const onInviteMock = vi.fn();
    const onLeaveMock = vi.fn();

    render(
      <BrowserRouter>
        <GroupCard
          id="3"
          name="Jazz Quintet"
          memberCount={4}
          role="Admin"
          onInvite={onInviteMock}
          onLeave={onLeaveMock}
        />
      </BrowserRouter>
    );

    const menuBtn = screen.getByTestId('group-menu-3');
    fireEvent.click(menuBtn);

    const inviteBtn = screen.getByText('Convidar Membro');
    expect(inviteBtn).toBeInTheDocument();
    fireEvent.click(inviteBtn);
    expect(onInviteMock).toHaveBeenCalledWith('3');

    fireEvent.click(menuBtn);
    const leaveBtn = screen.getByText('Sair do Grupo');
    fireEvent.click(leaveBtn);
    expect(onLeaveMock).toHaveBeenCalledWith('3');
  });
});
