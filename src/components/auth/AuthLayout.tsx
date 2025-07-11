import React from 'react';
import { Outlet } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 flex flex-col">
      <header className="w-full h-12 flex items-center justify-between px-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-0">
          <img 
            src="/Logolight.svg" 
            className="h-10 object-contain dark:hidden" 
            alt="DishlyCloud Logo"
          />
          <img 
            src="/Logodark.png" 
            className="h-10 object-contain hidden dark:block" 
            alt="DishlyCloud Logo"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">DishlyCloud</h1>
        </div>
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
      
      <footer className="w-full py-2 px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="text-left md:text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} DishlyCloud. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};