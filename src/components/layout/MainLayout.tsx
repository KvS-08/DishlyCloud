import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from '../layout/Header';
import { useSidebarStore } from '../../stores/sidebarStore';

export const MainLayout: React.FC = () => {
  const { collapsed } = useSidebarStore();
  const location = useLocation();
  const hideSidebar = location.pathname === '/menu-qr';

  return (
    <div className="h-screen flex flex-col">
      {!hideSidebar && <Sidebar />}
      {!hideSidebar && <Header />}
      
      <main className={`
        transition-all overflow-y-auto
        ${hideSidebar ? 'p-0 m-0' : 'pt-16 pb-8 px-6'}
        ${collapsed && !hideSidebar ? 'ml-16' : 'md:ml-16 ml-0'}
      `}>
        <div className={`${hideSidebar ? 'w-full h-full' : 'max-w-7xl mx-auto'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};