import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListMusic, Users, Settings, Menu, X, Share2 } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useTranslation } from 'react-i18next';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const links = [
    { to: '/dashboard', icon: <Home className="w-6 h-6" />, label: t('sidebar.home') },
    { to: '/playlists', icon: <ListMusic className="w-6 h-6" />, label: t('sidebar.playlists') },
    { to: '/groups', icon: <Users className="w-6 h-6" />, label: t('sidebar.groups') },
    { to: '/shared', icon: <Share2 className="w-6 h-6" />, label: t('sidebar.shared') },
    { to: '/settings', icon: <Settings className="w-6 h-6" />, label: t('sidebar.settings') },
  ];

  return (
    <>
      {/* Mobile/Tablet Overlay toggle for smaller than lg if needed, but per spec, tablet has collapsible sidebar */}
      <aside 
        className={`hidden sm:flex flex-col bg-bg-card border-r border-border-main transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } h-screen sticky top-0`}
        data-testid="sidebar"
      >
        <div className="flex items-center justify-between p-4 border-b border-border-main h-16">
          {!collapsed && <span className="font-bold text-xl text-[#8629cc]">CifrAS</span>}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="p-1 rounded hover:bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-[#8629cc]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 px-2" role="navigation" aria-label="Main sidebar navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#8629cc]/10 text-[#8629cc]' 
                    : 'text-text-mute hover:bg-bg-elevated'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? link.label : undefined}
            >
              {link.icon}
              {!collapsed && <span className="font-medium">{link.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className={`p-4 border-t border-border-main flex ${collapsed ? 'justify-center' : 'justify-start'}`}>
          <UserMenu direction="up" />
        </div>
      </aside>
    </>
  );
};
