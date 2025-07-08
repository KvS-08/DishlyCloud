import React from 'react';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const NegociosPage = () => {

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



      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Administrar Negocios</h2>
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="relative mb-4">
          <div className="flex items-center">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg bg-gray-100 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r-lg flex-shrink-0 whitespace-nowrap">
              Buscar
            </button>
          </div>
      </div>
      <hr className="my-4 border-gray-300 dark:border-gray-700" />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="py-3 px-4 bg-gray-200 dark:bg-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider rounded-tl-lg">Nombre</th>
              <th className="py-3 px-4 bg-gray-200 dark:bg-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Tipo</th>
              <th className="py-3 px-4 bg-gray-200 dark:bg-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Usuarios en línea</th>
              <th className="py-3 px-4 bg-gray-200 dark:bg-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider rounded-tr-lg">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí irían las filas de datos de los negocios */}
            <tr>
              <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">Negocio Ejemplo 1</td>
              <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">Restaurante</td>
              <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">5</td>
              <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300"><span className="font-semibold text-green-500">Activo</span></td>
            </tr>
            <tr>
              <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">Negocio Ejemplo 2</td>
              <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">Cafetería</td>
              <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">2</td>
              <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300"><span className="font-semibold text-red-500">Inactivo</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      </div>
    </div>
  );
};

export default NegociosPage;