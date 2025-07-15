import React from 'react';
import DashboardCard from './DashboardCard';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import { GiPayMoney } from 'react-icons/gi';
import { GiReceiveMoney, GiMoneyStack } from 'react-icons/gi';
// import { useBusinessSettings } from '../../hooks/useBusinessSettings';

interface SalesMetricsProps {
  currency: string;
  onClick?: () => void;
  sales: number;
  expenses: number;
  utility: number;
  profit: number;
  isLoading?: boolean;
  onExpensesClick?: () => void;
  onProfitClick?: () => void;
  onUtilityClick?: () => void;
}

const SalesMetrics: React.FC<SalesMetricsProps> = React.memo(
  ({ sales, expenses, utility, profit, isLoading, onClick, onExpensesClick, onProfitClick, onUtilityClick, currency }) => {
    // const { settings } = useBusinessSettings();
    const currencySymbol = currency; // Use the currency prop

    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardCard
          title="Ventas"
          value={`${currencySymbol} ${sales.toFixed(2)}`}
          icon={<FaHandHoldingDollar className="h-5 w-5 text-blue-400" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onClick}
        />
        <DashboardCard
          title="Gastos"
          value={`${currencySymbol} ${expenses.toFixed(2)}`}
          icon={<GiPayMoney className="h-5 w-5 text-red-600" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onExpensesClick}
        />
        <DashboardCard
          title="Utilidad"
          value={`${currencySymbol} ${utility.toFixed(2)}`}
          icon={<GiReceiveMoney className="h-5 w-5 text-purple-600" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onUtilityClick}
        />
        <DashboardCard
          title="Ganancia"
          value={`${currencySymbol} ${profit.toFixed(2)}`}
          icon={<GiMoneyStack className="h-5 w-5 text-green-600" />}
          isLoading={isLoading}
          className="bg-white dark:bg-gray-900"
          onClick={onProfitClick}
        />
      </div>
    );
  }
);

export default SalesMetrics;