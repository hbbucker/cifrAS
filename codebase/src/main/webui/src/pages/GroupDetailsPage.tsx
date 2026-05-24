import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { ArrowLeft, Users } from 'lucide-react';
import { GroupPlaylistsSection } from '../components/groups/GroupPlaylistsSection';
import { LinkPlaylistModal } from '../components/modals/LinkPlaylistModal';
import { linkPlaylist } from '../api/groups';
import { useAuth } from '../context/AuthContext';

interface GroupDetailsData {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
  ownerId?: string;
  [key: string]: unknown;
}

export const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [group, setGroup] = useState<GroupDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to force reload the section

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

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Loading...</div>;
  if (!group) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 gap-4">
          <button onClick={() => navigate('/groups')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{group.name}</h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${group.role === 'Admin' ? 'bg-[#aa3bff]/10 text-[#aa3bff]' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                {group.role}
              </span>
            </div>
          </div>
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
      </main>

      {showLinkModal && (
        <LinkPlaylistModal 
          onClose={() => setShowLinkModal(false)}
          onLink={handleLinkPlaylist}
        />
      )}
    </div>
  );
};
