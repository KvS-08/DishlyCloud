import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { NotificationBell } from '../components/ui/NotificationBell';
import { useThemeStore } from '../stores/themeStore';
import withLazyLoading from '../components/utils/withLazyLoading';

const BusinessInfo = withLazyLoading(() => import('../components/options/BusinessInfo').then(module => ({ default: module.BusinessInfo })));
const CuentasYCobros = withLazyLoading(() => import('../components/options/CuentasYCobros').then(module => ({ default: module.CuentasYCobros })));
const ConfigurarGastos = withLazyLoading(() => import('../components/options/ConfigurarGastos').then(module => ({ default: module.ConfigurarGastos })));
const ConfigurarEmpleados = withLazyLoading(() => import('../components/options/ConfigurarEmpleados').then(module => ({ default: module.ConfigurarEmpleados })));
const ConfigurarRecordatorios = withLazyLoading(() => import('../components/options/ConfigurarRecordatorios').then(module => ({ default: module.ConfigurarRecordatorios })));
const PersonalizarApp = withLazyLoading(() => import('../components/options/PersonalizarApp').then(module => ({ default: module.PersonalizarApp })));

export const OptionsPage = () => {
  const [selectedCountry, setSelectedCountry] = useState('');

  return (
    <div className="space-y-6 md:ml-32 pt-4 md:pt-0 md:-mt-10">
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
        <div className="hidden md:flex items-center space-x-0">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
      <BusinessInfo selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
      <CuentasYCobros selectedCountry={selectedCountry} />
      <ConfigurarGastos />
      <ConfigurarEmpleados />
      <ConfigurarRecordatorios />
      <PersonalizarApp />
    </div>
  );
};

export default OptionsPage;
