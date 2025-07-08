import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronUp, FaTrash } from 'react-icons/fa';
import { FaCircleDollarToSlot } from 'react-icons/fa6';
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md';
import { FaMoneyCheckAlt } from 'react-icons/fa';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ExpenseCategory {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

interface ConfigurarGastosProps {
  // Define any props if needed
}

export const ConfigurarGastos = React.memo(({}: ConfigurarGastosProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Load expense categories when component expands
  useEffect(() => {
    if (isExpanded && user?.business_id) {
      loadExpenseCategories();
    }
  }, [isExpanded, user?.business_id]);

  const loadExpenseCategories = async () => {
    if (!user?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('business_id', user.business_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading expense categories:', error);
        return;
      }

      setExpenseCategories(data || []);
    } catch (error) {
      console.error('Error loading expense categories:', error);
    }
  };

  const toggleAccordion = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSave = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (!expenseName.trim() || !expenseType.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert([{
          name: expenseName.trim(),
          type: expenseType.trim(),
          business_id: user.business_id,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving expense category:', error);
        toast.error('Error al guardar la categoría de gasto');
        return;
      }

      // Add the new category to the list
      setExpenseCategories(prev => [data, ...prev]);
      
      // Clear the form
      setExpenseName('');
      setExpenseType('');
      
      toast.success('Categoría de gasto guardada exitosamente');
      
    } catch (error) {
      console.error('Error saving expense category:', error);
      toast.error('Error al guardar la categoría de gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría de gasto?')) {
      return;
    }

    setDeleteLoading(categoryId);

    try {
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting expense category:', error);
        toast.error('Error al eliminar la categoría de gasto');
        return;
      }

      // Remove the category from the list
      setExpenseCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      toast.success('Categoría de gasto eliminada exitosamente');
      
    } catch (error) {
      console.error('Error deleting expense category:', error);
      toast.error('Error al eliminar la categoría de gasto');
    } finally {
      setDeleteLoading(null);
    }
  };

  const showSaveSection = expenseName.trim() || expenseType.trim();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-4">
      <button
        className="flex justify-between items-center w-full p-4 text-left text-gray-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={toggleAccordion}
      >
        <span className="flex items-center">
          <FaCircleDollarToSlot className="w-5 h-5 mr-2" />
          Configurar Gastos
        </span>
        <FaChevronUp className={`w-4 h-4 transform transition-transform duration-200 ${!isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-b-lg"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
              <div className="form-group">
                <label htmlFor="expenseName" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nombre del Gasto</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <MdOutlineDriveFileRenameOutline className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="expenseName"
                    className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Alquiler"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="expenseType" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Tipo de Gasto</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <FaMoneyCheckAlt className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="expenseType"
                    className="block w-full pl-7 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Fijo"
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="p-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Gastos Registrados</h3>
                {showSaveSection && (
                  <div className="flex justify-end mr-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loading}
                      className="text-green-500 hover:text-green-400 font-medium text-sm focus:outline-none px-2 py-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Agregando...' : 'Agregar'}
                    </button>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-200 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                      <th scope="col" className="px-6 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo de Gasto</th>
                      <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {expenseCategories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-1 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                          No hay categorías de gastos registradas
                        </td>
                      </tr>
                    ) : (
                      expenseCategories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {category.name}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {category.type}
                          </td>
                          <td className="px-1 py-2 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(category.id)}
                              disabled={deleteLoading === category.id}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Eliminar categoría"
                            >
                              {deleteLoading === category.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                              ) : (
                                <FaTrash className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});