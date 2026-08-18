import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListMusic, Users, Settings, Menu, X, Share2 } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { BrandLogo } from '../ui/BrandLogo';
import { useTranslation } from 'react-i18next';
import { usePendingSharesCount } from '../../hooks/usePendingSharesCount';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();
  const pendingCount = usePendingSharesCount();

  const links = [
    { to: '/dashboard', icon: <Home className="w-6 h-6" />, label: t('sidebar.home') },
    { to: '/playlists', icon: <ListMusic className="w-6 h-6" />, label: t('sidebar.playlists') },
    { to: '/groups', icon: <Users className="w-6 h-6" />, label: t('sidebar.groups') },
    { 
      to: '/shared', 
      icon: <Share2 className="w-6 h-6" />, 
      label: t('sidebar.shared'),
      badge: pendingCount > 0 ? pendingCount : null,
    },
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
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-border-main h-16`}>
          {!collapsed && <BrandLogo size="md" asLink to="/dashboard" />}
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
                `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors relative ${
                  isActive 
                    ? 'bg-[#8629cc]/10 text-[#8629cc]' 
                    : 'text-text-mute hover:bg-bg-elevated'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? link.label : undefined}
            >
              <div className="relative flex items-center justify-center">
                {link.icon}
                {link.badge !== null && link.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-[#8629cc] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium">{link.label}</span>
                  {link.badge !== null && link.badge !== undefined && (
                    <span className="bg-[#8629cc]/10 text-[#8629cc] text-xs font-bold px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </div>
              )}
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
