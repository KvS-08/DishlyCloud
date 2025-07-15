import React from 'react';
import DashboardCard from './DashboardCard';
import { PiBowlFoodFill } from 'react-icons/pi';
import { MdTimer } from 'react-icons/md';
import { IoTicketSharp } from 'react-icons/io5';
import { LuChefHat } from 'react-icons/lu'; // Icon for chef hat
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useThemeStore } from '../../stores/themeStore';

interface ProductiveChefData {
  name: string;
  orders: number;
}

interface KitchenMetricsProps {
  productiveChefsData: ProductiveChefData[];
  preparationTime: string;
  mostSoldDish: string;
  isLoading?: boolean;
  onOrdersClick: () => void;
  onPrepTimeClick: () => void;
  onMostSoldDishClick: () => void;
  filter: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

const KitchenMetrics: React.FC<KitchenMetricsProps> = React.memo(
  ({
    productiveChefsData,
    preparationTime,
    mostSoldDish,
    isLoading,
    onPrepTimeClick,
    onMostSoldDishClick,
    filter,
  }) => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        <div className="relative flex flex-col justify-between rounded-lg p-4 shadow-md bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm lg:text-lg font-semibold text-gray-800 dark:text-whitetext-sm lg:text-lg font-semibold text-gray-800 dark:text-white">Chef Más Productivo</h3>
            <LuChefHat className="h-5 w-5 text-cyan-500" />
          </div>
          {isLoading ? (
            <div className="animate-pulse h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={productiveChefsData}
                margin={{
                  top: 5,
                  right: 5,
                  left: -25,
                  bottom: -11,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#D1D5DB' : '#4B5563'} />
                <YAxis stroke={isDarkMode ? '#D1D5DB' : '#4B5563'} />
                <Tooltip
                  cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  contentStyle={{ backgroundColor: isDarkMode ? '#374151' : '#FFFFFF', borderColor: isDarkMode ? '#4B5563' : '#E5E7EB', color: isDarkMode ? '#FFFFFF' : '#1F2937' }}
                  labelStyle={{ color: isDarkMode ? '#FFFFFF' : '#1F2937' }}
                  itemStyle={{ color: isDarkMode ? '#FFFFFF' : '#1F2937' }}
                />
                <Bar dataKey="orders" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          )}

        </div>
        <div className="relative flex flex-col justify-between rounded-lg p-4 shadow-md bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm lg:text-lg font-semibold text-gray-800 dark:text-white">Órdenes Atendidas</h3>
            <IoTicketSharp className="h-5 w-5 text-purple-500" />
          </div>
          {isLoading ? (
            <div className="animate-pulse h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={generateOrdersData(filter)}
                margin={{
                  top: 5,
                  right: 5,
                  left: -25,
                  bottom: -11,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#D1D5DB' : '#4B5563'} />
                <YAxis stroke={isDarkMode ? '#D1D5DB' : '#4B5563'} />
                <Tooltip
                  cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  contentStyle={{ backgroundColor: isDarkMode ? '#374151' : '#FFFFFF', borderColor: isDarkMode ? '#4B5563' : '#E5E7EB', color: isDarkMode ? '#FFFFFF' : '#1F2937' }}
                  labelStyle={{ color: isDarkMode ? '#FFFFFF' : '#1F2937' }}
                  itemStyle={{ color: isDarkMode ? '#FFFFFF' : '#1F2937' }}
                />
                <Line type="monotone" dataKey="orders" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
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

const generateOrdersData = (filter: 'weekly' | 'monthly' | 'quarterly' | 'yearly') => {
  const today = new Date();
  const data = [];

  switch (filter) {
    case 'weekly':
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (today.getDay() + 6) % 7 + i);
        data.push({ name: date.toLocaleDateString('es-ES', { weekday: 'short' }), orders: Math.floor(Math.random() * 50) + 20 });
      }
      break;
    case 'monthly':
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        data.push({ name: i.toString(), orders: Math.floor(Math.random() * 50) + 20 });
      }
      break;
    case 'quarterly':
      for (let i = 0; i < 3; i++) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        data.push({ name: month.toLocaleDateString('es-ES', { month: 'short' }), orders: Math.floor(Math.random() * 200) + 100 });
      }
      data.reverse(); // Show in chronological order
      break;
    case 'yearly':
      for (let i = 0; i < 12; i++) {
        const month = new Date(today.getFullYear(), i, 1);
        data.push({ name: month.toLocaleDateString('es-ES', { month: 'short' }), orders: Math.floor(Math.random() * 500) + 200 });
      }
      break;
  }
  return data;
};

export default KitchenMetrics;