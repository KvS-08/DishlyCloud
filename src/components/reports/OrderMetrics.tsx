import React from 'react';
import DashboardCard from './DashboardCard';
import { CheckSquare, Clock, Award } from 'lucide-react';
import { FaUserChef } from 'react-icons/fa6';

interface OrderMetricsProps {
  ordersServed: number;
  avgPrepTime: string;
  bestSellingDish: string;
  isLoading?: boolean;
  mostProductiveChef: string;
  productiveChefOrders: number;
}

const OrderMetrics: React.FC<OrderMetricsProps> = React.memo(
  ({ ordersServed, avgPrepTime, bestSellingDish, isLoading, mostProductiveChef, productiveChefOrders }) => {
    return (
      <>
        <h2 className="text-base md:text-xl font-bold mb-4">Informe de Cocina</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Órdenes Atendidas"
          value={ordersServed}
          icon={<CheckSquare className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="Tiempo de Preparación"
          value={avgPrepTime}
          icon={<Clock className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="Plato Más Vendido"
          value={bestSellingDish}
          icon={<Award className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="Cocinero más productivo"
          value={mostProductiveChef}
          description={`${productiveChefOrders} órdenes`}
          icon={<FaUserChef className="h-4 w-4 text-white" />}
          isLoading={isLoading}
        />
      </div>
      </>
    );
  }
);

export default OrderMetrics;