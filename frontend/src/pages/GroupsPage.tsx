import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { GroupCard } from '../components/cards/GroupCard';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [declinedInvites, setDeclinedInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchInvites();
  }, []);

  const fetchInvites = () => {
    fetch('/api/invites', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setInvites(data))
    .catch(console.error);

    fetch('/api/invites/declined', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setDeclinedInvites(data))
    .catch(console.error);
  };

  const handleAcceptInvite = (id: string) => {
    fetch(`/api/invites/${id}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(() => {
      fetchInvites();
      fetchGroups();
    });
  };

  const handleDeclineInvite = (id: string) => {
    fetch(`/api/invites/${id}/decline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(() => fetchInvites());
  };

  const handleDismissDeclined = (id: string) => {
    fetch(`/api/invites/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(() => fetchInvites());
  };

  const fetchGroups = () => {
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
      const formattedGroups = data.map((g: any) => ({
        ...g,
        id: g.id.toString(), // Convert number ID to string for GroupCard
        memberCount: 1, // Defaulting as backend does not return it yet
        role: g.ownerId === user?.id ? 'Admin' : 'Member'
      }));
      setGroups(formattedGroups);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

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
      setShowCreateModal(false);
      setNewGroupName('');
      fetchGroups();
    })
    .catch(console.error);
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
        } catch (e) {
          // ignore
        }
        setInviteError(errorMsg);
        return;
      }

      setShowInviteModal(false);
      setInviteEmail('');
    } catch (err) {
      console.error(err);
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
      fetchGroups();
    })
    .catch(console.error);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Groups</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#aa3bff] hover:bg-[#902be6] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Group</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {declinedInvites.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Declined Invitations</h2>
              <div className="flex flex-col gap-3">
                {declinedInvites.map(invite => (
                  <div key={invite.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>{invite.inviteeEmail}</strong> declined your invitation to join <strong>{invite.groupName}</strong>.
                    </p>
                    <button onClick={() => handleDismissDeclined(invite.id)} className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invites.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pending Invitations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {invites.map(invite => (
                  <div key={invite.id} className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-700/50 p-5 shadow-sm relative">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{invite.groupName}</h3>
                    <p className="text-sm text-gray-500 mb-4">Invited to join</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptInvite(invite.id)} className="flex-1 py-2 bg-[#aa3bff] hover:bg-[#902be6] text-white rounded-lg font-medium transition-colors">Accept</button>
                      <button onClick={() => handleDeclineInvite(invite.id)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading groups...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No groups found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Group</h2>
            <input 
              type="text" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group Name"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] outline-none"
              data-testid="create-group-name-input"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
              <button 
                onClick={handleCreateGroup} 
                className="px-4 py-2 font-medium bg-[#aa3bff] hover:bg-[#902be6] text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Invite to Group</h2>
            
            {inviteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {inviteError}
              </div>
            )}

            <input 
              type="email" 
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
              placeholder="member@example.com"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] outline-none"
              data-testid="invite-email-input"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowInviteModal(false); setInviteError(''); }} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
              <button 
                onClick={handleInvite} 
                className="px-4 py-2 font-medium bg-[#aa3bff] hover:bg-[#902be6] text-white rounded-lg transition-colors" 
                data-testid="send-invite-btn"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
