import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, ListMusic } from 'lucide-react';
import { GroupPlaylistsSection } from '../components/groups/GroupPlaylistsSection';
import { GroupMembersSection } from '../components/groups/GroupMembersSection';
import { LinkPlaylistModal } from '../components/modals/LinkPlaylistModal';
import { linkPlaylist, inviteGroupMember } from '../api/groups';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface GroupDetailsData {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
  ownerId?: string;
  memberCount?: number;
  [key: string]: unknown;
}

export const GroupDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [group, setGroup] = useState<GroupDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'playlists' | 'members'>('playlists');
  const [memberCount, setMemberCount] = useState<number>(1);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch('/api/groups', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          navigate('/login');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        const found = data.find((g: Record<string, unknown>) => String(g.id) === id);
        if (found) {
          const count = typeof found.memberCount === 'number' ? found.memberCount : 1;
          setMemberCount(count);
          setGroup({
            ...found,
            memberCount: count,
            role: found.ownerId === user?.id ? 'Admin' : 'Member'
          });
        } else {
          navigate('/groups');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, user, navigate, logout]);

  const handleLinkPlaylist = async (playlistId: string) => {
    if (!id) return;
    await linkPlaylist(id, playlistId);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !id) return;
    setInviteError('');
    setInviting(true);

    try {
      await inviteGroupMember(id, inviteEmail);
      toast(t('group.members.inviteSuccess'), 'success');
      setShowInviteModal(false);
      setInviteEmail('');
      setRefreshTrigger(prev => prev + 1);
    } catch (err: unknown) {
      let errorMsg = 'Failed to invite member. Please check if the email is correct and registered.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
        if (axiosErr.response?.data?.error) errorMsg = axiosErr.response.data.error;
        else if (axiosErr.response?.data?.message) errorMsg = axiosErr.response.data.message;
      }
      setInviteError(errorMsg);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-main text-text-mute">
        Loading...
      </div>
    );
  }
  if (!group) return null;

  return (
    <>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center px-6 bg-bg-card border-b border-border-main gap-4 shrink-0">
          <button
            onClick={() => navigate('/groups')}
            className="p-2 hover:bg-bg-elevated rounded-full text-text-mute transition-colors"
            data-testid="back-to-groups-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-text-main leading-tight truncate">
                {group.name}
              </h1>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  group.role === 'Admin'
                    ? 'bg-[#8629cc]/10 text-[#8629cc]'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {group.role === 'Admin'
                  ? t('group.members.roles.admin')
                  : t('group.members.roles.member')}
              </span>
            </div>
          </div>

          {group.role === 'Admin' && (
            <div className="ml-auto">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 bg-[#8629cc] hover:bg-[#721eb8] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                data-testid="header-invite-btn"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('group.invite')}</span>
              </button>
            </div>
          )}
        </header>

        {/* Navigation Tabs (Pinterest-inspired) */}
        <div className="bg-bg-card px-6 border-b border-border-main shrink-0">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab('playlists')}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'playlists'
                  ? 'border-[#e60023] text-text-main'
                  : 'border-transparent text-text-mute hover:text-text-main'
              }`}
              data-testid="tab-playlists"
            >
              <ListMusic className="w-4 h-4" />
              {t('group.tabs.playlists')}
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'border-[#e60023] text-text-main'
                  : 'border-transparent text-text-mute hover:text-text-main'
              }`}
              data-testid="tab-members"
            >
              <Users className="w-4 h-4" />
              {t('group.tabs.members')}
              <span className="text-xs px-2 py-0.5 rounded-full bg-bg-elevated text-text-mute">
                {memberCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
          {activeTab === 'playlists' ? (
            <GroupPlaylistsSection
              key={refreshTrigger}
              groupId={group.id.toString()}
              role={group.role}
              onLinkNew={() => setShowLinkModal(true)}
            />
          ) : (
            <GroupMembersSection
              key={`members-${refreshTrigger}`}
              groupId={group.id.toString()}
              groupName={group.name}
              role={group.role}
              onInviteNew={() => setShowInviteModal(true)}
              onMemberCountChange={(count) => setMemberCount(count)}
            />
          )}
        </div>
      </div>

      {showLinkModal && (
        <LinkPlaylistModal
          onClose={() => setShowLinkModal(false)}
          onLink={handleLinkPlaylist}
        />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-text-main mb-4">
              {t('groups.inviteToGroup')}
            </h2>

            {inviteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {inviteError}
              </div>
            )}

            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteError('');
              }}
              placeholder={t('groups.memberEmail')}
              className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl mb-6 text-text-main focus:ring-2 focus:ring-[#8629cc] outline-none"
              data-testid="invite-email-input"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError('');
                }}
                className="px-4 py-2 font-medium text-text-mute hover:bg-bg-elevated rounded-xl transition-colors"
                disabled={inviting}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2 font-medium bg-[#8629cc] hover:bg-[#721eb8] text-white rounded-xl transition-colors disabled:opacity-50"
                data-testid="send-invite-btn"
              >
                {inviting ? '...' : t('groups.sendInvite')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
