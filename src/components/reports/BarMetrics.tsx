import React from 'react';
import DashboardCard from './DashboardCard';
import { FaCocktail } from 'react-icons/fa'; // Placeholder icon
import { IoTicketSharp } from 'react-icons/io5';
import { MdTimer } from 'react-icons/md';
import { IoIosBeer } from 'react-icons/io';

interface BarMetricsProps {
  mostProductiveBartender: string;
  productiveBartenderOrders: number;
  preparationTime: string;
  mostSoldAlcohol: string;
  isLoading?: boolean;
  onOrdersClick: () => void;
  onPrepTimeClick: () => void;
  onMostSoldAlcoholClick: () => void;
}

const BarMetrics: React.FC<BarMetricsProps> = React.memo(
  ({ mostProductiveBartender, productiveBartenderOrders, preparationTime, mostSoldAlcohol, isLoading, onOrdersClick, onPrepTimeClick, onMostSoldAlcoholClick }) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Bartender Más Productivo"
          value={mostProductiveBartender}
          icon={<FaCocktail className="h-4 w-4 text-cyan-600" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
        />
        <DashboardCard
          title="Órdenes Atendidas"
          value={productiveBartenderOrders.toString()}
          icon={<IoTicketSharp className="h-4 w-4 text-gray-500" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onOrdersClick}
        />
        <DashboardCard
          title="Tiempo de Preparación"
          value={preparationTime}
          icon={<MdTimer className="h-4 w-4 text-yellow-600" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onPrepTimeClick}
        />
        <DashboardCard
          title="Alcohol Más Vendido"
          value={mostSoldAlcohol}
          icon={<IoIosBeer className="h-4 w-4 text-pink-600" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onMostSoldAlcoholClick}
        />
      </div>
    );
  }
);

export default BarMetrics;