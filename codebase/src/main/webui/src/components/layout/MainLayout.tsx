import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-bg-main overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative pb-16 sm:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
