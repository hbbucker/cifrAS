import { createShareLink } from "../api/shareLinks";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, ListMusic } from 'lucide-react';
import { GroupPlaylistsSection } from '../components/groups/GroupPlaylistsSection';
import { GroupMembersSection } from '../components/groups/GroupMembersSection';
import { LinkPlaylistModal } from '../components/modals/LinkPlaylistModal';
import { linkPlaylist } from '../api/groups';
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

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    if (!id) return;
    setInviting(true);
    setInviteError('');
    try {
      const data = await createShareLink({ type: 'GROUP', resourceId: id });
      const url = `${window.location.origin}/invite/${data.token}`;
      setShareUrl(url);
    } catch {
      setInviteError(t('songSharing.generalError', 'Ocorreu um erro ao gerar o link.'));
    } finally {
      setInviting(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast(t('songSharing.copySuccess', 'Link copiado!'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast(t('songSharing.copyError', 'Erro ao copiar o link.'), 'error');
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
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header */}
        <header className="relative z-20 min-h-[56px] sm:min-h-[64px] flex items-center px-3.5 sm:px-6 bg-bg-card border-b border-border-main gap-2.5 sm:gap-4 shrink-0">
          <button
            onClick={() => navigate('/groups')}
            className="w-10 h-10 flex items-center justify-center hover:bg-bg-elevated rounded-full text-text-mute transition-colors shrink-0"
            data-testid="back-to-groups-btn"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold text-text-main leading-tight truncate">
                {group.name}
              </h1>
              <span
                className={`inline-block text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded ${
                  group.role === 'Admin'
                    ? 'bg-[#aa3bff]/10 text-[#aa3bff]'
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
            <div className="shrink-0 ml-auto">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#aa3bff] hover:bg-[#9926f0] text-white px-3 sm:px-4 py-2 min-h-[40px] sm:min-h-[44px] rounded-md font-medium transition-colors text-xs sm:text-sm"
                data-testid="header-invite-btn"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('group.invite')}</span>
              </button>
            </div>
          )}
        </header>

        {/* Navigation Tabs (Pinterest-inspired) */}
        <div className="bg-bg-card px-3.5 sm:px-6 border-b border-border-main shrink-0 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-4 sm:space-x-6 min-w-max">
            <button
              onClick={() => setActiveTab('playlists')}
              className={`min-h-[44px] py-2.5 sm:py-3.5 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2 ${
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
              className={`min-h-[44px] py-2.5 sm:py-3.5 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2 ${
                activeTab === 'members'
                  ? 'border-[#e60023] text-text-main'
                  : 'border-transparent text-text-mute hover:text-text-main'
              }`}
              data-testid="tab-members"
            >
              <Users className="w-4 h-4" />
              {t('group.tabs.members')}
              <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-bg-elevated text-text-mute font-medium">
                {memberCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 pb-24 sm:pb-8 max-w-5xl mx-auto w-full min-w-0">
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
          <div className="bg-bg-card rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl mx-auto">
            <h2 className="text-lg sm:text-xl font-bold text-text-main mb-4">
              {t('groups.inviteToGroup', 'Convidar para o Grupo')}
            </h2>

            {inviteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                {inviteError}
              </div>
            )}

            {!shareUrl ? (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError('');
                  }}
                  className="px-4 py-2.5 min-h-[44px] font-medium text-text-mute hover:bg-bg-elevated rounded-md transition-colors text-sm"
                  disabled={inviting}
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <button
                  onClick={handleGenerateLink}
                  disabled={inviting}
                  className="px-4 py-2.5 min-h-[44px] font-medium bg-[#aa3bff] hover:bg-[#9926f0] text-white rounded-md transition-colors disabled:opacity-50 text-sm"
                >
                  {inviting ? '...' : t('songSharing.generateLink', 'Gerar Link')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-4 py-2.5 rounded-md border border-border-main bg-bg-main text-text-main focus:outline-none focus:ring-2 focus:ring-[#aa3bff] transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-4 py-2.5 bg-[#aa3bff] hover:bg-[#9926f0] text-white rounded-md transition-colors"
                  >
                    {copied ? t('songSharing.copySuccess', 'Copiado!') : t('songSharing.copy', 'Copiar')}
                  </button>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setShareUrl(null);
                      setCopied(false);
                    }}
                    className="px-4 py-2.5 min-h-[44px] font-medium bg-bg-elevated text-text-main hover:bg-border-main rounded-md transition-colors text-sm"
                  >
                    {t('common.close', 'Fechar')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
