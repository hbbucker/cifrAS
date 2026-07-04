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

 return (
 <div 
 onClick={() => navigate(`/groups/${id}`)}
 className="bg-bg-card rounded-xl border border-border-main p-5 hover:shadow-md transition-all relative cursor-pointer"
 >
 <div className="flex justify-between items-start mb-4">
 <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
 <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
 </div>
 
 <div className="relative" onClick={(e) => e.stopPropagation()}>
 <button 
 onClick={() => setMenuOpen(!menuOpen)}
 className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-elevated text-text-mute"
 data-testid={`group-menu-${id}`}
 >
 <MoreVertical className="w-5 h-5" />
 </button>

 {menuOpen && (
 <div className="absolute right-0 top-10 w-48 bg-bg-card rounded-md shadow-lg border border-border-main z-10 py-1">
 {role === 'Admin' && (
 <button 
 onClick={() => { setMenuOpen(false); onInvite(id); }}
 className="w-full text-left px-4 py-2 hover:bg-bg-elevated flex items-center gap-2 text-sm text-gray-700 "
 >
 <UserPlus className="w-4 h-4" /> {t('group.invite')}
 </button>
 )}
 <button 
 onClick={() => { setMenuOpen(false); onLeave(id); }}
 className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2 text-sm"
 >
 <LogOut className="w-4 h-4" /> {t('group.leave')}
 </button>
 </div>
 )}
 </div>
 </div>
 
 <h3 className="text-lg font-bold text-text-main mb-1">{name}</h3>
 <div className="flex items-center justify-between mt-4">
 <p className="text-sm text-text-mute">{memberCount} members</p>
 <span className={`text-xs font-bold px-2 py-1 rounded ${role === 'Admin' ? 'bg-[#aa3bff]/10 text-[#aa3bff]' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 '}`}>
 {role}
 </span>
 </div>
 </div>
 );
};
