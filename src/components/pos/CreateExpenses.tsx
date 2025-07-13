import React, { useState, useEffect } from 'react';
import Portal from '../ui/Portal';
import { FaTimes } from 'react-icons/fa';
import { useBusinessSettings } from '../../hooks/useBusinessSettings';

interface CreateExpensesProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const CreateExpenses: React.FC<CreateExpensesProps> = ({ isOpen, onClose, onSave }) => {
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const { settings, loading } = useBusinessSettings();

  const currencySymbol = settings?.currency || '$';

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setExpenseDate(now.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300); // Duration of the animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 relative ${animationClass}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-xl font-semibold mb-0.5 dark:text-white">Ingresar Gasto</h2>
          <hr className="mb-3 border-gray-300 dark:border-gray-600" />
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expenseDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input type="datetime-local" id="expenseDate" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs p-1 pl-2" />
            </div>
            <div>
              <label htmlFor="expenseName" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nombre del gasto</label>
              <input type="text" id="expenseName" placeholder="Nombre del gasto" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs p-1 pl-2" />
            </div>
            <div>
              <label htmlFor="expenseType" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Tipo de gasto</label>
              <input type="text" id="expenseType" placeholder="Tipo de gasto" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs p-1 pl-2" />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
              <input type="number" id="quantity" placeholder="0.00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs p-1 pl-2" />
            </div>
            <div>
              <label htmlFor="value" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Valor</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{currencySymbol}</span>
                </div>
                <input type="number" id="value" placeholder="0.00" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs p-1 pl-9" />
              </div>
            </div>
            <div>
              <label htmlFor="total" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Total</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{currencySymbol}</span>
                </div>
                <input type="number" id="total" placeholder="0.00" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs p-1 pl-9" />
              </div>
            </div>
          </div>
          <hr className="my-3 border-gray-300 dark:border-gray-600" />

          <div className="flex justify-end">
            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-green-700 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-500 dark:focus:ring-offset-gray-800">
              Agregar
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default CreateExpenses;