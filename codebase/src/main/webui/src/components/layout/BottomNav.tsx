import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListMusic, Users, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const links = [
    { to: '/dashboard', icon: <Home className="w-6 h-6" />, label: 'Home' },
    { to: '/playlists', icon: <ListMusic className="w-6 h-6" />, label: 'Playlists' },
    { to: '/groups', icon: <Users className="w-6 h-6" />, label: 'Groups' },
    { to: '/settings', icon: <Settings className="w-6 h-6" />, label: 'Settings' },
  ];

  return (
    <nav 
      className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 flex items-center justify-around h-16 pb-safe"
      role="navigation" 
      aria-label="Mobile bottom navigation"
      data-testid="bottom-nav"
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive 
                ? 'text-[#aa3bff]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`
          }
          aria-label={link.label}
        >
          {link.icon}
          <span className="text-[10px] font-medium">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
