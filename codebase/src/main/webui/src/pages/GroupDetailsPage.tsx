import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import { GroupPlaylistsSection } from '../components/groups/GroupPlaylistsSection';
import { LinkPlaylistModal } from '../components/modals/LinkPlaylistModal';
import { linkPlaylist } from '../api/groups';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface GroupDetailsData {
 id: string;
 name: string;
 role: 'Admin' | 'Member';
 ownerId?: string;
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
 const [showLinkModal, setShowLinkModal] = useState(false);
 const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to force reload the section
 
 const [showInviteModal, setShowInviteModal] = useState(false);
 const [inviteEmail, setInviteEmail] = useState('');
 const [inviteError, setInviteError] = useState('');

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
 setGroup({
 ...found,
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
 setRefreshTrigger(prev => prev + 1); // Refresh the playlist list
 };

 const handleInvite = async () => {
 if (!inviteEmail.trim() || !id) return;
 setInviteError('');

 try {
 const res = await fetch(`/api/groups/${id}/members`, {
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

 if (loading) return <div className="flex h-screen items-center justify-center bg-bg-main text-text-mute">Loading...</div>;
 if (!group) return null;

 return (
  <>
  <div className="flex-1 flex flex-col h-full overflow-hidden">
 <header className="h-16 flex items-center px-6 bg-bg-card border-b border-border-main gap-4">
 <button onClick={() => navigate('/groups')} className="p-2 hover:bg-bg-elevated rounded-full text-text-mute transition-colors">
 <ArrowLeft className="w-5 h-5" />
 </button>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
 <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
 </div>
 <div>
 <h1 className="text-xl font-bold text-text-main leading-tight">{group.name}</h1>
 <span className={`text-xs font-bold px-2 py-0.5 rounded ${group.role === 'Admin' ? 'bg-[#8629cc]/10 text-[#8629cc]' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 '}`}>
 {group.role}
 </span>
 </div>
 </div>
 
 {group.role === 'Admin' && (
 <div className="ml-auto">
 <button 
 onClick={() => setShowInviteModal(true)}
 className="flex items-center gap-2 bg-[#8629cc] hover:bg-[#721eb8] text-white px-4 py-2 rounded-lg font-medium transition-colors"
 >
 <UserPlus className="w-4 h-4" />
 <span className="hidden sm:inline">{t('group.invite')}</span>
 </button>
 </div>
 )}
 </header>

 <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
 {/* We use key={refreshTrigger} to easily force a re-mount if needed, but it's better to pass it as a prop or just rely on the component's internal state. Let's pass key to force remount on new link to easily refresh data */}
 <GroupPlaylistsSection 
 key={refreshTrigger}
 groupId={group.id.toString()} 
 role={group.role} 
 onLinkNew={() => setShowLinkModal(true)} 
 />
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
 <div className="bg-bg-card rounded-xl max-w-md w-full p-6 shadow-2xl">
 <h2 className="text-xl font-bold text-text-main mb-4">{t('groups.inviteToGroup')}</h2>
 
 {inviteError && (
 <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
 {inviteError}
 </div>
 )}

 <input 
 type="email" 
 value={inviteEmail}
 onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
 placeholder={t('groups.memberEmail')}
 className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-lg mb-6 text-text-main focus:ring-2 focus:ring-[#8629cc] outline-none"
 data-testid="invite-email-input"
 />
 <div className="flex justify-end gap-3">
 <button onClick={() => { setShowInviteModal(false); setInviteError(''); }} className="px-4 py-2 font-medium text-text-mute hover:bg-bg-elevated rounded-lg transition-colors">{t('common.cancel')}</button>
 <button 
 onClick={handleInvite} 
 className="px-4 py-2 font-medium bg-[#8629cc] hover:bg-[#721eb8] text-white rounded-lg transition-colors" 
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
