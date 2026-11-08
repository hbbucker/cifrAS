import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, MoreVertical, UserPlus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const memberCountText = memberCount === 1 
    ? t('group.members.count_one', { count: 1 }) 
    : t('group.members.count_other', { count: memberCount || 1 });

  return (
    <div 
      onClick={() => navigate(`/groups/${id}`)}
      className="bg-bg-card rounded-lg border border-border-main p-3.5 sm:p-5 hover:shadow-md transition-all relative cursor-pointer min-w-0"
    >
      <div className="flex justify-between items-start mb-2.5 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-bg-elevated text-text-mute transition-colors"
            data-testid={`group-menu-${id}`}
            aria-label="Group menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-bg-card rounded-lg shadow-xl border border-border-main z-20 py-1.5 overflow-hidden">
              {role === 'Admin' && (
                <button 
                  onClick={() => { setMenuOpen(false); onInvite(id); }}
                  className="w-full text-left px-4 py-2.5 min-h-[44px] hover:bg-bg-elevated flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <UserPlus className="w-4 h-4" /> {t('group.invite')}
                </button>
              )}
              <button 
                onClick={() => { setMenuOpen(false); onLeave(id); }}
                className="w-full text-left px-4 py-2.5 min-h-[44px] hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2 text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" /> {t('group.leave')}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <h3 className="text-base sm:text-lg font-bold text-text-main mb-1 truncate">{name}</h3>
      <div className="flex items-center justify-between mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm text-text-mute">{memberCountText}</p>
        <span className={`text-[11px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full ${role === 'Admin' ? 'bg-[#aa3bff]/10 text-[#aa3bff]' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
          {role === 'Admin' ? t('group.members.roles.admin') : t('group.members.roles.member')}
        </span>
      </div>
    </div>
  );
};
