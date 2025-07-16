import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationBell } from '../components/ui/NotificationBell';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import { GiPayMoney, GiReceiveMoney, GiMoneyStack } from 'react-icons/gi';
import { RiStockFill } from 'react-icons/ri';
import { LuChefHat } from 'react-icons/lu';
import { IoIosBeer } from 'react-icons/io';
import { FaCheckCircle } from 'react-icons/fa';
import { MdTimer } from 'react-icons/md';
import DashboardCardSkeleton from '../components/ui/DashboardCardSkeleton';

const InicioPage: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { business } = useBusinessSettings();
  const { notifications } = useNotifications();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulate 2 seconds loading time
    return () => clearTimeout(timer);
  }, []);

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

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {loading ? (
          <>
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
          </>
        ) : (
          <>
            {/* Card for Ventas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">Ventas</h2>
                <FaHandHoldingDollar className="text-lg text-blue-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-lg font-bold">$0.00</p>
            </div>

            {/* Card for Gastos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">Gastos</h2>
                <GiPayMoney className="text-lg text-red-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-lg font-bold">$0.00</p>
            </div>

            {/* Card for Utileria */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">Utilería</h2>
                <GiReceiveMoney className="text-lg text-purple-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-lg font-bold">$0.00</p>
            </div>

            {/* Card for Ganancia */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">Ganancia</h2>
                <GiMoneyStack className="text-lg text-green-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-lg font-bold">$0.00</p>
            </div>
          </>
        )}
      </div>

      {/* Card for Nivel de Stock - Larger and Separated */}
      <div className="flex flex-wrap gap-6 mb-6">
        {loading ? (
          <>
            <div className="w-full md:w-[calc(50%-12px)] grid grid-cols-2 gap-6">
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
            </div>
            <DashboardCardSkeleton />
          </>
        ) : (
          <>
            <div className="w-full md:w-[calc(50%-12px)] grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* New Card for Chef más productivo */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm lg:text-sm font-semibold text-gray-900 dark:text-white">Chef más productivo</h2>
                  <LuChefHat className="text-lg text-cyan-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-lg font-bold text-center">0</p>
              </div>

              {/* New Card for Bartender más productivo */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm lg:text-sm font-semibold text-gray-900 dark:text-white">Bartender más productivo</h2>
                  <IoIosBeer className="text-lg text-orange-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-lg font-bold text-center">0</p>
              </div>

              {/* New Card for Órdenes atendidas */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm lg:text-sm font-semibold text-gray-900 dark:text-white">Órdenes atendidas</h2>
                  <FaCheckCircle className="text-lg text-green-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-lg font-bold text-center">0</p>
              </div>

              {/* New Card for Tiempo de preparación */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm lg:text-sm font-semibold text-gray-900 dark:text-white">Tiempo de preparación</h2>
                  <MdTimer className="text-lg text-white-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-lg font-bold text-center">0</p>
              </div>
            </div>

            {/* Card for Nivel de Stock - Larger and Separated */}
            <div className="w-full md:w-[calc(50%-12px)] bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">Nivel de Stock</h2>
                <RiStockFill className="text-lg text-blue-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-lg font-bold text-center">0</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default InicioPage;