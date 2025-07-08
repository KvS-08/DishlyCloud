import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationBell } from '../components/ui/NotificationBell';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const InicioPage: React.FC = () => {
  const { user } = useAuth();
  const { business } = useBusinessSettings();
  const { notifications } = useNotifications();

  return (
      <div className="space-y-6 md:ml-32 pt-4 md:pt-0 md:-mt-10">
      <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
            <h1 className="text-lg md:text-3xl font-bold">
              {(() => {
                const date = new Date();
                const options: Intl.DateTimeFormatOptions = {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                };
                const formattedDate = new Intl.DateTimeFormat('es-ES', options).format(date);
                return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
              })()}
            </h1>
          </div>
                    <div className="hidden md:flex items-center gap-0">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      

    </div>
  );
};

export default InicioPage;