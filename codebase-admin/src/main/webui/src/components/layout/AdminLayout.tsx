import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Music2,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Globe,
  MessageSquare
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const navItems = [
    { to: '/', label: t('common.dashboard'), icon: LayoutDashboard },
    { to: '/users', label: t('common.users'), icon: Users },
    { to: '/songs', label: t('common.songs'), icon: Music2 },
    { to: '/feedbacks', label: 'Feedbacks', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f3] flex flex-col md:flex-row text-[#000000]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#dadad3]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md bg-[#aa3bff] flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-bold text-lg">{t('common.appName')}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[#62625b] hover:text-black rounded-md focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#dadad3] flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-md bg-[#aa3bff] flex items-center justify-center text-white font-black text-xl shadow-sm">
              C
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">CifrAS</h1>
              <div className="flex items-center space-x-1">
                <ShieldAlert size={12} className="text-[#aa3bff]" />
                <span className="text-xs font-semibold text-[#aa3bff] uppercase tracking-wider">
                  {t('common.admin')}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-md font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-[#aa3bff] text-white shadow-sm'
                        : 'text-[#33332e] hover:bg-[#f6f6f3] hover:text-black'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-[#dadad3] space-y-4">
          {/* Language Switcher */}
          <div className="flex items-center justify-between text-xs text-[#62625b]">
            <div className="flex items-center space-x-1">
              <Globe size={14} />
              <span>Idioma</span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => changeLanguage('pt')}
                className={`px-2 py-1 rounded-sm text-xs font-semibold ${
                  i18n.language.startsWith('pt') ? 'bg-[#aa3bff] text-white' : 'bg-[#f6f6f3] hover:bg-[#dadad3]'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded-sm text-xs font-semibold ${
                  i18n.language.startsWith('en') ? 'bg-[#aa3bff] text-white' : 'bg-[#f6f6f3] hover:bg-[#dadad3]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('es')}
                className={`px-2 py-1 rounded-sm text-xs font-semibold ${
                  i18n.language.startsWith('es') ? 'bg-[#aa3bff] text-white' : 'bg-[#f6f6f3] hover:bg-[#dadad3]'
                }`}
              >
                ES
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md border border-[#dadad3] text-xs font-semibold text-[#62625b] hover:bg-red-50 hover:text-[#e60023] hover:border-red-200 transition-colors"
          >
            <LogOut size={16} />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
