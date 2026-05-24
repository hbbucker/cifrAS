import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListMusic, Users, Settings, Menu, X, Share2 } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: '/dashboard', icon: <Home className="w-6 h-6" />, label: 'Home' },
    { to: '/playlists', icon: <ListMusic className="w-6 h-6" />, label: 'Playlists' },
    { to: '/groups', icon: <Users className="w-6 h-6" />, label: 'Groups' },
    { to: '/shared', icon: <Share2 className="w-6 h-6" />, label: 'Shared' },
    { to: '/settings', icon: <Settings className="w-6 h-6" />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile/Tablet Overlay toggle for smaller than lg if needed, but per spec, tablet has collapsible sidebar */}
      <aside 
        className={`hidden sm:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } h-screen sticky top-0`}
        data-testid="sidebar"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 h-16">
          {!collapsed && <span className="font-bold text-xl text-[#aa3bff]">CifrAS</span>}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
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
                    ? 'bg-[#aa3bff]/10 text-[#aa3bff]' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? link.label : undefined}
            >
              {link.icon}
              {!collapsed && <span className="font-medium">{link.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
