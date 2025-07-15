import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { format } from 'date-fns';

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: { start: Date; end: Date };
}

interface ExpenseDetail {
  id: string;
  created_at: string;
  description: string;
  amount: number;
  category: string;
}

const ExpenseDetailModal: React.FC<ExpensesModalProps> = ({ isOpen, onClose, dateRange }) => {
  const { user } = useAuth();
  const [expensesDetails, setExpensesDetails] = useState<ExpenseDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.business_id) {
      fetchExpensesDetails();
    }
  }, [isOpen, dateRange, user?.business_id]);

  const fetchExpensesDetails = async () => {
    setLoading(true);
    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      const { data, error } = await supabase
        .from('gastos')
        .select('id, created_at, description, amount, category')
        .eq('business_id', user.business_id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses details:', error);
        return;
      }

      setExpensesDetails(data || []);
    } catch (error) {
      console.error('Error fetching expenses details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Detalle de Gastos</h2>
        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">Cargando detalles de gastos...</p>
        ) : expensesDetails.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">No hay gastos en el rango de fechas seleccionado.</p>
        ) : (
          <div className="space-y-4">
            {expensesDetails.map((expense) => (
              <div key={expense.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Fecha: {format(new Date(expense.created_at), 'dd/MM/yyyy HH:mm')}</p>
                <p className="text-gray-700 dark:text-gray-300">Descripción: {expense.description}</p>
                <p className="text-gray-700 dark:text-gray-300">Monto: ${expense.amount.toFixed(2)}</p>
                <p className="text-gray-700 dark:text-gray-300">Categoría: {expense.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetailModal;