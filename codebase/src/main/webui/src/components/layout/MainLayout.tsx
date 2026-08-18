import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen h-[100dvh] bg-bg-main overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full min-w-0 relative pb-16 sm:pb-0 overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
