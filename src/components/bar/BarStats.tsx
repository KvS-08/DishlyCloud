import { Clock, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { PiBowlFoodFill } from 'react-icons/pi';

interface BarStatsProps {
  averagePreparationTime: string;
  averagePreparationTimeYesterday: number;
  completedOrders: number;
  completedOrdersYesterday: number;
  onTimeOrders: number;
  delayedOrders: number;
  estimatedWaitTime: string;
  estimatedWaitTimeYesterday: number;
}

export const BarStats: React.FC<BarStatsProps> = ({
  averagePreparationTime,
  averagePreparationTimeYesterday,
  completedOrders,
  completedOrdersYesterday,
  onTimeOrders,
  delayedOrders,
  estimatedWaitTime,
  estimatedWaitTimeYesterday,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
              Preparación
            </h3>
            <p className="mt-2 text-xs md:text-2xl font-semibold text-gray-900 dark:text-white">
              {averagePreparationTime}
            </p>
            {
              (() => {
                const currentTime = parseInt(averagePreparationTime.split(' ')[0]) || 0;
                const isBetter = currentTime < averagePreparationTimeYesterday;
                const colorClass = isBetter ? 'text-green-500' : 'text-red-500';
                const ArrowIcon = isBetter ? ArrowDown : ArrowUp;
                return (
                  <p className={`mt-2 text-xs ${colorClass} flex items-center`}>
                    <ArrowIcon className="h-2 w-2 mr-0.5" />
                    {Math.abs(currentTime - averagePreparationTimeYesterday)} minutos ayer
                  </p>
                );
              })()
            }
          </div>
          <div className="hidden sm:block p-19 rounded-md bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
              Órdenes Atendidas
            </h3>
            <p className="mt-2 text-xs md:text-2xl font-semibold text-gray-900 dark:text-white">
              {completedOrders}
            </p>
            {
              (() => {
                const isBetter = completedOrders > completedOrdersYesterday;
                const colorClass = isBetter ? 'text-green-500' : 'text-red-500';
                const ArrowIcon = isBetter ? ArrowUp : ArrowDown;
                return (
                  <p className={`mt-2 text-xs ${colorClass} flex items-center`}>
                    <ArrowIcon className="h-2 w-2 mr-0.5" />
                    {Math.abs(completedOrders - completedOrdersYesterday)} órdenes ayer
                  </p>
                );
              })()
            }
          </div>
          <div className="hidden sm:block p-19 rounded-md bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400">
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
            Órdenes a Tiempo
          </h3>
          <div className="hidden sm:block p-19 rounded-md bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400">
            <PiBowlFoodFill className="h-4 w-4" />
          </div>
        </div>
        
        <ul className="space-y-1">
          <li className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">A tiempo</span>
            <span className="text-xs md:text-sm font-medium">{onTimeOrders}</span>
          </li>
          <li className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Retrasadas</span>
            <span className="text-xs md:text-sm font-medium">{delayedOrders}</span>
          </li>
        </ul>
      </div>
      
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
              Tiempo de Espera
            </h3>
            <p className="mt-2 text-xs md:text-2xl font-semibold text-gray-900 dark:text-white">
              {estimatedWaitTime}
            </p>
            {
              (() => {
                const currentTime = parseInt(estimatedWaitTime.split(' ')[0]) || 0;
                const isBetter = currentTime < estimatedWaitTimeYesterday;
                const colorClass = isBetter ? 'text-green-500' : 'text-red-500';
                const ArrowIcon = isBetter ? ArrowDown : ArrowUp;
                return (
                  <p className={`mt-2 text-xs ${colorClass} flex items-center`}>
                    <ArrowIcon className="h-2 w-2 mr-0.5" />
                    {Math.abs(currentTime - estimatedWaitTimeYesterday)} minutos ayer
                  </p>
                );
              })()
            }
          </div>
          <div className="hidden sm:block p-19 rounded-md bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
     </div>
   </div>
 );
};