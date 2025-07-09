import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useBusinessSettings } from '../../hooks/useBusinessSettings';
import Portal from '../ui/Portal';

interface ClosecashierProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { hora_cierre: string; gastos: number; venta_total: number; utilidad: number; efectivo_cierre: number }) => void;
}

const Closecashier: React.FC<ClosecashierProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const currencySymbol = settings?.currency || 'HNL';
  const [totalSales, setTotalSales] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [utility, setUtility] = useState<number>(0);
  const [cashClose, setCashClose] = useState<number>(0);
  const [closeTime, setCloseTime] = useState<string>('');

  useEffect(() => {
    if (isOpen && user?.business_id) {
      fetchTotalSales();
      fetchExpenses();
      
      // Set current time
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCloseTime(`${hours}:${minutes}`);
    }
  }, [isOpen, user?.business_id]);

  useEffect(() => {
    setUtility(totalSales - expenses);
  }, [totalSales, expenses]);

  const fetchTotalSales = async () => {
    if (!user?.business_id) return;

    try {
      // Get today's sales
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('ventas')
        .select('valor')
        .eq('business_id', user.business_id)
        .gte('fecha', today)
        .lt('fecha', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching sales data:', error);
        return;
      }

      if (data) {
        const sum = data.reduce((acc, sale) => acc + sale.valor, 0);
        setTotalSales(sum);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchExpenses = async () => {
    if (!user?.business_id) return;

    try {
      // Get today's expenses
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('gastos')
        .select('valor')
        .eq('business_id', user.business_id)
        .gte('fecha', today)
        .lt('fecha', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching expenses data:', error);
        return;
      }

      if (data) {
        const sum = data.reduce((acc, expense) => acc + expense.valor, 0);
        setExpenses(sum);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      fetchTotalSales();
      fetchExpenses();
      
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCloseTime(`${hours}:${minutes}`);
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300); // Duration of the animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, user?.business_id]);

  if (!showModal) return null;

  const handleSaveCloseCashier = () => {
    if (!closeTime || cashClose === null || cashClose === undefined) {
      alert('Por favor completa todos los campos');
      return;
    }

    const data = {
      hora_cierre: closeTime,
      gastos: expenses,
      venta_total: totalSales,
      utilidad: utility,
      efectivo_cierre: cashClose,
    };

    onSave(data);
    onClose();
    
    // Reset form
    setCashClose(0);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className={`bg-white dark:bg-gray-800 pt-6 px-6 pb-2 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 relative ${animationClass}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          
          <h2 className="text-xl font-bold mb-2 dark:text-white">Cerrar Caja</h2>
          <hr className="mb-4 border-gray-300 dark:border-gray-600" />
          
          <div className="flex space-x-4 mb-4">
            <div className="w-full">
              <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hora de Cierre
              </label>
              <input
                  type="time"
                  id="closeTime"
                  name="closeTime"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="mt-1 block w-full pl-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 py-1"
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="expenses" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gastos del Día
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {currencySymbol}
                  </span>
                </div>
                <input
                  type="number"
                  id="expenses"
                  name="expenses"
                  className="mt-1 block w-full pl-8 pr-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 py-1"
                  placeholder="0.00"
                  step="0.01"
                  value={expenses.toFixed(2)}
                  readOnly
                />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4 mb-4">
            <div className="w-full">
              <label htmlFor="totalSales" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Venta del Día
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {currencySymbol}
                  </span>
                </div>
                <input
                  type="number"
                  id="totalSales"
                  name="totalSales"
                  className="mt-1 block w-full pl-8 pr-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 py-1"
                  placeholder="0.00"
                  step="0.01"
                  value={totalSales.toFixed(2)}
                  readOnly
                />
              </div>
            </div>
            
            <div className="w-full">
              <label htmlFor="utility" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Utilidad del Día
              </label>
              <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {currencySymbol}
                    </span>
                  </div>
                  <input
                    type="number"
                    id="utility"
                    name="utility"
                    className="mt-1 block w-full pl-8 pr-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 py-1"
                  placeholder="0.00"
                  step="0.01"
                  value={utility.toFixed(2)}
                  readOnly
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-4 mb-4">
            <div className="w-full">
              <label htmlFor="cashClose" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Efectivo de Cierre
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {currencySymbol}
                  </span>
                </div>
                <input
                  type="number"
                  id="cashClose"
                  name="cashClose"
                  className="mt-1 block w-full pl-8 pr-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                  step="0.01"
                  value={cashClose.toString()}
                  onChange={(e) => setCashClose(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <hr className={`mb-0 border-gray-300 dark:border-gray-600 ${!closeTime || (cashClose === null || cashClose === undefined) ? 'hidden' : ''}`} />

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleSaveCloseCashier}
              disabled={!closeTime || (cashClose === null || cashClose === undefined)}
              className={`text-red-600 hover:text-red-500 dark:text-red-700 dark:hover:text-red-500 font-bold py-2 px-4 rounded ${!closeTime || (cashClose === null || cashClose === undefined) ? 'hidden' : ''}`}
            >
              Cerrar Caja
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Closecashier;