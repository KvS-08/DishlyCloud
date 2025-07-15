import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
// import { supabase } from '../../../lib/supabase';
// import { useAuth } from '../../../hooks/useAuth';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { useBusinessSettings } from '../../../hooks/useBusinessSettings';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: { start: Date; end: Date };
  filter: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface SaleDetail {
  id: string;
  fecha: string;
  valor: number;
  metodo_pago: string;
  productos: Array<{ nombre: string; cantidad: number; precio: number }>;
}

const SalesDetailModal: React.FC<SalesModalProps> = ({ isOpen, onClose, dateRange, filter }) => {
  // const { settings } = useBusinessSettings();
  // const { user } = useAuth();
  const [salesDetails, setSalesDetails] = useState<SaleDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate fetching data based on filter
      const data = new Promise<SaleDetail[]>((resolve) => {
        setTimeout(() => {
          let simulatedData: SaleDetail[] = [];
          if (filter === 'weekly') {
            simulatedData = [
              { date: '2023-01-01', amount: 100 },
              { date: '2023-01-02', amount: 120 },
              { date: '2023-01-03', amount: 150 },
              { date: '2023-01-04', amount: 130 },
              { date: '2023-01-05', amount: 160 },
              { date: '2023-01-06', amount: 140 },
              { date: '2023-01-07', amount: 170 },
            ];
          } else if (filter === 'monthly') {
            simulatedData = [
              { date: '2023-01-01', amount: 1000 },
              { date: '2023-02-01', amount: 1200 },
              { date: '2023-03-01', amount: 1500 },
              { date: '2023-04-01', amount: 1300 },
              { date: '2023-05-01', amount: 1600 },
              { date: '2023-06-01', amount: 1400 },
              { date: '2023-07-01', amount: 1700 },
              { date: '2023-08-01', amount: 1800 },
              { date: '2023-09-01', amount: 1900 },
              { date: '2023-10-01', amount: 2000 },
              { date: '2023-11-01', amount: 2100 },
              { date: '2023-12-01', amount: 2200 },
            ];
          } else if (filter === 'quarterly') {
            simulatedData = [
              { date: '2023-Q1', amount: 4000 },
              { date: '2023-Q2', amount: 4500 },
              { date: '2023-Q3', amount: 5000 },
              { date: '2023-Q4', amount: 5500 },
            ];
          } else if (filter === 'yearly') {
            simulatedData = [
              { date: '2020', amount: 10000 },
              { date: '2021', amount: 12000 },
              { date: '2022', amount: 15000 },
              { date: '2023', amount: 18000 },
            ];
          }
          resolve(simulatedData);
        }, 500);
      });
      data.then((simulatedData) => {
        setSalesDetails(simulatedData);
        setChartData(simulatedData.map(item => ({
          name: item.date,
          Ventas: item.amount,
        })));
        setLoading(false);
      });
    }
  }, [isOpen, filter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Detalle de Ventas</h2>
        <hr className="mb-3 border-gray-300 dark:border-gray-600" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ventas generadas del {format(dateRange.start, 'dd/MM/yyyy')} al {format(dateRange.end, 'dd/MM/yyyy')}
        </p>
        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">Cargando datos de ventas...</p>
        ) : chartData.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">No hay datos de ventas para mostrar.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesDetailModal;