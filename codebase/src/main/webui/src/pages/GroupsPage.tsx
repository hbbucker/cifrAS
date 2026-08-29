import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GroupCard } from '../components/cards/GroupCard';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { BrandLogo } from '../components/ui/BrandLogo';

interface GroupData {
  id: string;
  name: string;
  memberCount: number;
  role: 'Admin' | 'Member';
  [key: string]: unknown;
}

interface InviteData {
  id: string;
  inviteeEmail?: string;
  groupName?: string;
  [key: string]: unknown;
}

export const GroupsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [declinedInvites, setDeclinedInvites] = useState<InviteData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const fetchInvites = useCallback(() => {
    fetch('/api/invites', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setInvites(data))
      .catch(() => toast('Failed to load pending invites', 'error'));

    fetch('/api/invites/declined', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setDeclinedInvites(data))
      .catch(() => toast('Failed to load declined invites', 'error'));
  }, [toast]);

  const handleAcceptInvite = (id: string) => {
    fetch(`/api/invites/${id}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(() => {
      toast('Invite accepted successfully', 'success');
      fetchInvites();
      fetchGroups();
    }).catch(() => toast('Failed to accept invite', 'error'));
  };

  const handleDeclineInvite = (id: string) => {
    fetch(`/api/invites/${id}/decline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(() => {
      toast('Invite declined', 'success');
      fetchInvites();
    }).catch(() => toast('Failed to decline invite', 'error'));
  };

  const handleDismissDeclined = (id: string) => {
    fetch(`/api/invites/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(() => {
      setDeclinedInvites(prev => prev.filter(i => i.id !== id));
      toast('Declined invitation dismissed', 'success');
    }).catch(() => toast('Failed to dismiss declined invite', 'error'));
  };

  const fetchGroups = useCallback(() => {
    setLoading(true);
    fetch('/api/groups', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          navigate('/login');
          throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        const formattedGroups = data.map((g: Record<string, unknown>) => ({
          ...g,
          id: String(g.id),
          memberCount: typeof g.memberCount === 'number' ? g.memberCount : 1,
          role: g.ownerId === user?.id ? 'Admin' : 'Member'
        })) as GroupData[];
        setGroups(formattedGroups);
        setLoading(false);
      })
      .catch(() => {
        toast('Failed to load groups', 'error');
        setLoading(false);
      });
  }, [logout, navigate, toast, user?.id]);

  useEffect(() => {
    fetchGroups();
    fetchInvites();
  }, [fetchGroups, fetchInvites]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    fetch('/api/groups', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newGroupName })
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          navigate('/login');
          throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error('Failed to create group');
        return res.json();
      })
      .then(() => {
        toast('Group created successfully', 'success');
        setShowCreateModal(false);
        setNewGroupName('');
        fetchGroups();
      })
      .catch(() => toast('Failed to create group', 'error'));
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedGroupId) return;
    setInviteError('');

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/members`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      if (res.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!res.ok) {
        let errorMsg = 'Failed to invite member. Please check if the email is correct and registered.';
        try {
          const data = await res.json();
          if (data.error) errorMsg = data.error;
        } catch {
          // ignore
        }
        setInviteError(errorMsg);
        return;
      }

      toast('Invitation sent successfully', 'success');
      setShowInviteModal(false);
      setInviteEmail('');
    } catch {
      toast('An unexpected error occurred while inviting', 'error');
      setInviteError('An unexpected error occurred.');
    }
  };

  const handleLeaveGroup = (id: string) => {
    fetch(`/api/groups/${id}/members/${user?.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          navigate('/login');
          throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error('Failed to leave group');
        toast('Left group successfully', 'success');
        fetchGroups();
      })
      .catch(() => toast('Failed to leave group', 'error'));
  };

  return (
    <>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="relative z-20 min-h-[52px] sm:min-h-[64px] flex items-center justify-between px-3.5 sm:px-6 bg-bg-card border-b border-border-main shrink-0" role="banner">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <BrandLogo iconOnly size="sm" asLink to="/dashboard" className="sm:hidden shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-text-main truncate">{t('groups.groups')}</h1>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#aa3bff] hover:bg-[#9926f0] text-white px-3.5 sm:px-4 py-2 min-h-[40px] sm:min-h-[44px] rounded-md font-medium transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t('groups.newGroup')}</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 pb-24 sm:pb-8 min-w-0">
          {declinedInvites.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-bold text-text-main mb-3">{t('groups.declinedInvitations')}</h2>
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {declinedInvites.map(invite => (
                  <div key={invite.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 min-w-0 flex-1">
                      <strong>{invite.inviteeEmail}</strong> {t('groups.declinedInvitation')} <strong>{invite.groupName}</strong>.
                    </p>
                    <button onClick={() => handleDismissDeclined(invite.id)} className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 shrink-0 min-h-[36px] px-2.5 flex items-center">
                      {t('groups.dismiss')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invites.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-bold text-text-main mb-3">{t('groups.pendingInvitations')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                {invites.map(invite => (
                  <div key={invite.id} className="bg-bg-card rounded-lg border border-yellow-200 dark:border-yellow-700/50 p-4 sm:p-5 shadow-sm relative">
                    <h3 className="text-base sm:text-lg font-bold text-text-main mb-1 truncate">{invite.groupName}</h3>
                    <p className="text-xs sm:text-sm text-text-mute mb-3 sm:mb-4">{t('groups.invitedToJoin')}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptInvite(invite.id)} className="flex-1 py-2 min-h-[40px] bg-[#aa3bff] hover:bg-[#9926f0] text-white rounded-md text-xs sm:text-sm font-medium transition-colors">{t('groups.accept')}</button>
                      <button onClick={() => handleDeclineInvite(invite.id)} className="flex-1 py-2 min-h-[40px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs sm:text-sm font-medium transition-colors">{t('groups.decline')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-text-mute text-sm">{t('groups.loadingGroups')}</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12 text-text-mute text-sm">{t('groups.noGroups')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {groups.map(group => (
                <GroupCard 
                  key={group.id} 
                  {...group} 
                  onInvite={(id) => { setSelectedGroupId(id); setShowInviteModal(true); }}
                  onLeave={handleLeaveGroup}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl mx-auto">
            <h2 className="text-lg sm:text-xl font-bold text-text-main mb-4">{t('groups.createNewGroup')}</h2>
            <input 
              type="text" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder={t('groups.groupName')}
              className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-md mb-6 text-text-main focus:ring-2 focus:ring-[#aa3bff] outline-none text-sm sm:text-base"
              data-testid="create-group-name-input"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 min-h-[44px] font-medium text-text-mute hover:bg-bg-elevated rounded-md transition-colors text-sm">{t('common.cancel')}</button>
              <button 
                onClick={handleCreateGroup} 
                className="px-4 py-2.5 min-h-[44px] font-medium bg-[#aa3bff] hover:bg-[#9926f0] text-white rounded-md transition-colors text-sm"
              >
                {t('groups.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl mx-auto">
            <h2 className="text-lg sm:text-xl font-bold text-text-main mb-4">{t('groups.inviteToGroup')}</h2>
            
            {inviteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                {inviteError}
              </div>
            )}

            <input 
              type="email" 
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
              placeholder={t('groups.memberEmail')}
              className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-md mb-6 text-text-main focus:ring-2 focus:ring-[#aa3bff] outline-none text-sm sm:text-base"
              data-testid="invite-email-input"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowInviteModal(false); setInviteError(''); }} className="px-4 py-2.5 min-h-[44px] font-medium text-text-mute hover:bg-bg-elevated rounded-md transition-colors text-sm">{t('common.cancel')}</button>
              <button 
                onClick={handleInvite} 
                className="px-4 py-2.5 min-h-[44px] font-medium bg-[#aa3bff] hover:bg-[#9926f0] text-white rounded-md transition-colors text-sm" 
                data-testid="send-invite-btn"
              >
                {t('groups.sendInvite')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
