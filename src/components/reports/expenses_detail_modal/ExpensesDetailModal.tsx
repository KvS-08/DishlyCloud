import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
// import { supabase } from '../../../lib/supabase';
// import { useAuth } from '../../../hooks/useAuth';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { useBusinessSettings } from '../../../hooks/useBusinessSettings';

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: { start: Date; end: Date };
  filter: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface ExpenseDetail {
  id: string;
  fecha: string;
  valor: number;
  metodo_pago: string;
  productos: Array<{ nombre: string; cantidad: number; precio: number }>;
}

const ExpensesDetailModal: React.FC<ExpensesModalProps> = ({ isOpen, onClose, dateRange, filter }) => {
  // const { settings } = useBusinessSettings();
  // const { user } = useAuth();
  const [expensesDetails, setExpensesDetails] = useState<ExpenseDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate fetching data based on filter
      const data = new Promise<ExpenseDetail[]>((resolve) => {
        setTimeout(() => {
          let simulatedData: ExpenseDetail[] = [];
          if (filter === 'weekly') {
            simulatedData = [
              { id: '1', fecha: '2023-01-01', valor: 50, metodo_pago: 'Cash', productos: [] },
              { id: '2', fecha: '2023-01-02', valor: 60, metodo_pago: 'Card', productos: [] },
              { id: '3', fecha: '2023-01-03', valor: 75, metodo_pago: 'Cash', productos: [] },
              { id: '4', fecha: '2023-01-04', valor: 65, metodo_pago: 'Card', productos: [] },
              { id: '5', fecha: '2023-01-05', valor: 80, metodo_pago: 'Cash', productos: [] },
              { id: '6', fecha: '2023-01-06', valor: 70, metodo_pago: 'Card', productos: [] },
              { id: '7', fecha: '2023-01-07', valor: 85, metodo_pago: 'Cash', productos: [] },
            ];
          } else if (filter === 'monthly') {
            simulatedData = [
              { id: '1', fecha: '2023-01-01', valor: 500, metodo_pago: 'Cash', productos: [] },
              { id: '2', fecha: '2023-02-01', valor: 600, metodo_pago: 'Card', productos: [] },
              { id: '3', fecha: '2023-03-01', valor: 750, metodo_pago: 'Cash', productos: [] },
              { id: '4', fecha: '2023-04-01', valor: 650, metodo_pago: 'Card', productos: [] },
              { id: '5', fecha: '2023-05-01', valor: 800, metodo_pago: 'Cash', productos: [] },
              { id: '6', fecha: '2023-06-01', valor: 700, metodo_pago: 'Card', productos: [] },
              { id: '7', fecha: '2023-07-01', valor: 850, metodo_pago: 'Cash', productos: [] },
              { id: '8', fecha: '2023-08-01', valor: 900, metodo_pago: 'Card', productos: [] },
              { id: '9', fecha: '2023-09-01', valor: 950, metodo_pago: 'Cash', productos: [] },
              { id: '10', fecha: '2023-10-01', valor: 1000, metodo_pago: 'Card', productos: [] },
              { id: '11', fecha: '2023-11-01', valor: 1050, metodo_pago: 'Cash', productos: [] },
              { id: '12', fecha: '2023-12-01', valor: 1100, metodo_pago: 'Card', productos: [] },
            ];
          } else if (filter === 'quarterly') {
            simulatedData = [
              { id: '1', fecha: '2023-Q1', valor: 2000, metodo_pago: 'Cash', productos: [] },
              { id: '2', fecha: '2023-Q2', valor: 2250, metodo_pago: 'Card', productos: [] },
              { id: '3', fecha: '2023-Q3', valor: 2500, metodo_pago: 'Cash', productos: [] },
              { id: '4', fecha: '2023-Q4', valor: 2750, metodo_pago: 'Card', productos: [] },
            ];
          } else if (filter === 'yearly') {
            simulatedData = [
              { id: '1', fecha: '2020', valor: 5000, metodo_pago: 'Cash', productos: [] },
              { id: '2', fecha: '2021', valor: 6000, metodo_pago: 'Card', productos: [] },
              { id: '3', fecha: '2022', valor: 7500, metodo_pago: 'Cash', productos: [] },
              { id: '4', fecha: '2023', valor: 9000, metodo_pago: 'Card', productos: [] },
            ];
          }
          resolve(simulatedData);
        }, 500);
      });
      data.then((simulatedData) => {
        setExpensesDetails(simulatedData);
        setChartData(simulatedData.map(item => ({
          name: item.fecha,
          Gastos: item.valor,
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
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Detalle de Gastos</h2>
        <hr className="mb-3 border-gray-300 dark:border-gray-600" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Gastos generados del {format(dateRange.start, 'dd/MM/yyyy')} al {format(dateRange.end, 'dd/MM/yyyy')}
        </p>
        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">Cargando datos de gastos...</p>
        ) : chartData.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">No hay datos de gastos para mostrar.</p>
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
              <Line type="monotone" dataKey="Gastos" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ExpensesDetailModal;