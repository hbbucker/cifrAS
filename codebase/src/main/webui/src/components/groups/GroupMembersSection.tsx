import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, UserMinus, Clock, XCircle, LogOut, Shield, ShieldCheck, User } from 'lucide-react';
import { getGroupMembers, getGroupInvitations, removeGroupMember, cancelGroupInvitation } from '../../api/groups';
import type { GroupMember, GroupInvitation } from '../../types/groups';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../modals/ConfirmModal';
import { useNavigate } from 'react-router-dom';

interface GroupMembersSectionProps {
  groupId: string;
  groupName: string;
  role: 'Admin' | 'Member';
  onInviteNew: () => void;
  onMemberCountChange?: (count: number) => void;
}

export const GroupMembersSection: React.FC<GroupMembersSectionProps> = ({
  groupId,
  groupName,
  role,
  onInviteNew,
  onMemberCountChange,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<GroupMember | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const membersData = await getGroupMembers(groupId);
      setMembers(membersData);
      if (onMemberCountChange) {
        onMemberCountChange(membersData.length);
      }

      if (role === 'Admin') {
        const invitesData = await getGroupInvitations(groupId);
        setInvitations(invitesData);
      }
    } catch {
      toast(t('group.members.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [groupId, role, onMemberCountChange, toast, t]);

  useEffect(() => {
    let mounted = true;
    getGroupMembers(groupId)
      .then(membersData => {
        if (!mounted) return;
        setMembers(membersData);
        if (onMemberCountChange) {
          onMemberCountChange(membersData.length);
        }
        if (role === 'Admin') {
          return getGroupInvitations(groupId).then(invitesData => {
            if (mounted) setInvitations(invitesData);
          });
        }
      })
      .catch(() => {
        if (mounted) toast(t('group.members.loadError'), 'error');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [groupId, role, onMemberCountChange, toast, t]);

  const handleConfirmRemove = async () => {
    if (!selectedMemberToRemove) return;
    try {
      await removeGroupMember(groupId, selectedMemberToRemove.userId);
      toast(t('group.members.memberRemoved'), 'success');
      setSelectedMemberToRemove(null);
      loadData();
    } catch {
      toast(t('group.members.removeMemberError'), 'error');
    }
  };

  const handleConfirmLeave = async () => {
    if (!user?.id) return;
    try {
      await removeGroupMember(groupId, user.id);
      toast(t('group.members.leftGroup'), 'success');
      setShowLeaveModal(false);
      navigate('/groups');
    } catch {
      toast(t('group.members.leaveGroupError'), 'error');
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    try {
      await cancelGroupInvitation(groupId, invitationId);
      toast(t('group.invitations.canceled'), 'success');
      loadData();
    } catch {
      toast(t('group.invitations.cancelError'), 'error');
    }
  };

  const getRoleBadge = (memberRole: string) => {
    if (memberRole === 'OWNER') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-[#aa3bff]/15 text-[#aa3bff] border border-[#aa3bff]/30 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('group.members.roles.owner')}
        </span>
      );
    }
    if (memberRole === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shrink-0">
          <Shield className="w-3.5 h-3.5" />
          {t('group.members.roles.admin')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shrink-0">
        <User className="w-3.5 h-3.5" />
        {t('group.members.roles.member')}
      </span>
    );
  };

  const getInitials = (name: string, email: string) => {
    const text = (name && name.trim()) || email || 'U';
    const parts = text.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-bg-card rounded-lg border border-border-main p-3.5 sm:p-6 space-y-5 sm:space-y-8 min-w-0">
      {/* Header with Members count and Invite Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-text-main flex items-center gap-2 flex-wrap">
            <span>{t('group.members.title')}</span>
            {!loading && (
              <span className="text-xs sm:text-sm font-normal text-text-mute px-2.5 py-0.5 rounded-full bg-bg-main border border-border-main">
                {members.length === 1
                  ? t('group.members.count_one', { count: 1 })
                  : t('group.members.count_other', { count: members.length })}
              </span>
            )}
          </h2>
        </div>

        {role === 'Admin' && (
          <Button 
            onClick={onInviteNew} 
            size="sm" 
            data-testid="invite-member-btn" 
            className="w-full sm:w-auto min-h-[44px] px-4 text-xs sm:text-sm shrink-0 flex items-center justify-center font-medium"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            <span>{t('group.invite')}</span>
          </Button>
        )}
      </div>

      {/* Members List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-bg-elevated/60 animate-pulse rounded-lg border border-border-main" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-8 text-text-mute text-sm">
          {t('group.members.empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((member) => {
            const isSelf = member.userId === user?.id;
            const canRemove = role === 'Admin' && member.role !== 'OWNER' && !isSelf;

            return (
              <div
                key={member.id || member.userId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 border border-border-main rounded-lg bg-bg-card hover:bg-bg-main/50 transition-colors gap-3"
                data-testid={`member-row-${member.userId}`}
              >
                {/* Member Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#aa3bff]/15 text-[#aa3bff] flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                    {getInitials(member.name, member.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <p className="font-bold text-text-main truncate text-sm sm:text-base">
                        {member.name || member.email}
                      </p>
                      {isSelf && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shrink-0">
                          Você
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-mute truncate">{member.email}</p>
                  </div>
                </div>

                {/* Role Badge and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2.5 sm:pt-0 border-t border-border-main/40 sm:border-t-0">
                  {getRoleBadge(member.role)}

                  <div className="flex items-center gap-1.5">
                    {canRemove && (
                      <button
                        onClick={() => setSelectedMemberToRemove(member)}
                        className="min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0"
                        title={t('group.members.removeMember')}
                        data-testid={`remove-member-btn-${member.userId}`}
                        aria-label={t('group.members.removeMember')}
                      >
                        <UserMinus className="w-4 h-4" />
                        <span className="sm:hidden">{t('group.members.removeMember')}</span>
                      </button>
                    )}

                    {isSelf && member.role !== 'OWNER' && (
                      <button
                        onClick={() => setShowLeaveModal(true)}
                        className="min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0"
                        title={t('group.members.leaveGroup')}
                        data-testid="leave-group-btn"
                        aria-label={t('group.members.leaveGroup')}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="sm:hidden">{t('group.members.leaveGroup')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invitations Section (Visible for Admin/Owner) */}
      {role === 'Admin' && (
        <div className="pt-5 sm:pt-6 border-t border-border-main space-y-3.5 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-text-main">
            {t('group.invitations.title')}
          </h3>

          {invitations.length === 0 ? (
            <p className="text-xs sm:text-sm text-text-mute">
              {t('group.invitations.empty')}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5 sm:gap-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 border border-border-main rounded-lg bg-bg-main/40 gap-3"
                  data-testid={`invite-row-${inv.id}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-main text-xs sm:text-sm truncate">
                      {inv.inviteeEmail}
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                      {inv.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-amber-700 dark:text-amber-300 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {t('group.invitations.pending')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-red-700 dark:text-red-300 font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          {t('group.invitations.declined')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancelInvite(inv.id)}
                    className="w-full sm:w-auto text-xs font-medium px-4 py-2 min-h-[38px] sm:min-h-[40px] flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors shrink-0"
                    data-testid={`cancel-invite-btn-${inv.id}`}
                  >
                    {inv.status === 'PENDING' ? t('group.invitations.cancel') : t('group.invitations.dismiss')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Remove Modal */}
      {selectedMemberToRemove && (
        <ConfirmModal
          isOpen={true}
          title={t('group.members.confirmRemoveTitle')}
          message={t('group.members.confirmRemoveDesc', {
            name: selectedMemberToRemove.name || selectedMemberToRemove.email,
          })}
          variant="danger"
          confirmText={t('group.members.removeMember')}
          cancelText={t('common.cancel')}
          onConfirm={handleConfirmRemove}
          onCancel={() => setSelectedMemberToRemove(null)}
        />
      )}

      {/* Confirm Leave Modal */}
      {showLeaveModal && (
        <ConfirmModal
          isOpen={true}
          title={t('group.members.confirmLeaveTitle')}
          message={t('group.members.confirmLeaveDesc', { name: groupName })}
          variant="danger"
          confirmText={t('group.members.leaveGroup')}
          cancelText={t('common.cancel')}
          onConfirm={handleConfirmLeave}
          onCancel={() => setShowLeaveModal(false)}
        />
      )}
    </div>
  );
};
