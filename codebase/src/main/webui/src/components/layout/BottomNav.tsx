import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ListMusic, Users, Settings, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePendingSharesCount } from '../../hooks/usePendingSharesCount';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const pendingCount = usePendingSharesCount();

  const links = [
    { to: '/dashboard', icon: <Home className="w-5 h-5" />, label: t('sidebar.home') },
    { to: '/playlists', icon: <ListMusic className="w-5 h-5" />, label: t('sidebar.playlists') },
    { 
      to: '/shared', 
      icon: <Share2 className="w-5 h-5" />, 
      label: t('sidebar.shared'),
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { to: '/groups', icon: <Users className="w-5 h-5" />, label: t('sidebar.groups') },
    { to: '/settings', icon: <Settings className="w-5 h-5" />, label: t('sidebar.settings') },
  ];

  return (
    <nav 
      className="sm:hidden fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border-main z-40 flex items-center justify-around h-16 pb-safe"
      role="navigation" 
      aria-label="Mobile bottom navigation"
      data-testid="bottom-nav"
    >
      {links.map((link) => {
        const isActive = location.pathname.startsWith(link.to);
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${
              isActive 
                ? 'text-[#8629cc]' 
                : 'text-text-mute hover:text-text-main dark:hover:text-gray-100'
            }`}
            aria-label={link.label}
          >
            <div className="relative">
              {link.icon}
              {link.badge !== null && link.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#8629cc] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] h-4 flex items-center justify-center animate-pulse">
                  {link.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-tight text-center px-0.5 truncate w-full">{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
