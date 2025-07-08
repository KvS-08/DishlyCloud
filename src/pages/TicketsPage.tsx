import React from 'react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TicketsPage: React.FC = () => {
  return (
    <div className="space-y-6 md:ml-24 pt-4 md:pt-0 md:-mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-3xl font-bold">
          {(() => {
            const formattedDate = format(new Date(), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es });
            const parts = formattedDate.split(',');
            if (parts.length > 0) {
              const day = parts[0];
              const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
              return [capitalizedDay, ...parts.slice(1)].join(',');
            }
            return formattedDate; // Fallback if split fails
          })()}
        </h1>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
      </div>
      <p>Welcome to the Tickets page!</p>
    </div>
  );
};

export default TicketsPage;