import React from 'react';
import DashboardCard from './DashboardCard';
import { FaUtensils } from 'react-icons/fa';
import { PiBowlFoodFill } from 'react-icons/pi';
import { MdTimer } from 'react-icons/md';
import { IoTicketSharp } from 'react-icons/io5';
import { LuChefHat } from 'react-icons/lu'; // Icon for chef hat

interface KitchenMetricsProps {
  mostProductiveChef: string;
  productiveChefOrders: number;
  preparationTime: string;
  mostSoldDish: string;
  isLoading?: boolean;
  onOrdersClick: () => void;
  onPrepTimeClick: () => void;
  onMostSoldDishClick: () => void;
}

const KitchenMetrics: React.FC<KitchenMetricsProps> = React.memo(
  ({ mostProductiveChef, productiveChefOrders, preparationTime, mostSoldDish, isLoading, onOrdersClick, onPrepTimeClick, onMostSoldDishClick }) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Chef Más Productivo"
          value={mostProductiveChef}
          icon={<LuChefHat className="h-4 w-4 text-cyan-500" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
        />
        <DashboardCard
          title="Órdenes Atendidas"
          value={productiveChefOrders.toString()}
          icon={<IoTicketSharp className="h-4 w-4 text-gray-500" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onOrdersClick}
        />
        <DashboardCard
          title="Tiempo de Preparación"
          value={preparationTime}
          icon={<MdTimer className="h-4 w-4 text-yellow-500" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onPrepTimeClick}
        />
        <DashboardCard
          title="Plato Más Vendido"
          value={mostSoldDish}
          icon={<PiBowlFoodFill className="h-4 w-4 text-orange-500" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onMostSoldDishClick}
        />
      </div>
    );
  }
);

export default KitchenMetrics;