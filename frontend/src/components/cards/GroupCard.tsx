import React, { useState } from 'react';
import { Users, MoreVertical, UserPlus, LogOut } from 'lucide-react';

interface GroupCardProps {
  id: string;
  name: string;
  memberCount: number;
  role: 'Admin' | 'Member';
  onInvite: (id: string) => void;
  onLeave: (id: string) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  id, name, memberCount, role, onInvite, onLeave
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all relative">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            data-testid={`group-menu-${id}`}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
              {role === 'Admin' && (
                <button 
                  onClick={() => { setMenuOpen(false); onInvite(id); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <UserPlus className="w-4 h-4" /> Invite Member
                </button>
              )}
              <button 
                onClick={() => { setMenuOpen(false); onLeave(id); }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" /> Leave Group
              </button>
            </div>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{name}</h3>
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{memberCount} members</p>
        <span className={`text-xs font-bold px-2 py-1 rounded ${role === 'Admin' ? 'bg-[#aa3bff]/10 text-[#aa3bff]' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
          {role}
        </span>
      </div>
    </div>
  );
};
