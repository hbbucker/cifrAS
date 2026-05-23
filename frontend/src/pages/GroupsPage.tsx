import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { GroupCard } from '../components/cards/GroupCard';
import { Plus } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const mockGroups = [
    { id: '1', name: 'Worship Team', memberCount: 5, role: 'Admin' as const },
    { id: '2', name: 'Garage Band', memberCount: 3, role: 'Member' as const },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Groups</h1>
          <button className="flex items-center gap-2 bg-[#aa3bff] hover:bg-[#902be6] text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Group</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockGroups.map(group => (
              <GroupCard 
                key={group.id} 
                {...group} 
                onInvite={() => setShowInviteModal(true)}
                onLeave={() => {}}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Invite to Group</h2>
            <input 
              type="email" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="member@example.com"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] outline-none"
              data-testid="invite-email-input"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 font-medium bg-[#aa3bff] hover:bg-[#902be6] text-white rounded-lg transition-colors" data-testid="send-invite-btn">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
