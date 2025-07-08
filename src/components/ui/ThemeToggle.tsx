import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <button 
      onClick={toggleTheme}
      className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className || ''}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-300" />
      ) : (
        <Moon className="h-5 w-5 text-primary-600" />
      )}
    </button>
  );
};