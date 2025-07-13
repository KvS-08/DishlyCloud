import { useState, useEffect } from 'react';
import Portal from '../ui/Portal';
import { FaTimes, FaUser } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useBusinessSettings } from '../../hooks/useBusinessSettings';

interface OpencashierProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { fecha: string; cajero: string; efectivo_apertura: number }) => void;
}

const Opencashier: React.FC<OpencashierProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const currencySymbol = settings?.currency || 'HNL';
  const [cashierDateTime, setCashierDateTime] = useState('');
  const [cashierName, setCashierName] = useState<string>('');
  const [cashInDrawer, setCashInDrawer] = useState<number | string>('');

  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      // Set current date and time when modal opens
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setCashierDateTime(localDateTime);
      
      // Set cashier name from user
      if (user?.full_name) {
        setCashierName(user.full_name);
      }
      
      // Reset cash amount
      setCashInDrawer('');
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300); // Duration of the animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, user]);

  if (!showModal) return null;

  const handleOpenCashier = () => {
    if (!cashierDateTime || !cashierName || !cashInDrawer) {
      alert('Por favor completa todos los campos');
      return;
    }

    const data = {
      fecha: new Date(cashierDateTime).toISOString(),
      cajero: cashierName,
      efectivo_apertura: parseFloat(cashInDrawer as string),
    };
    
    onSave(data);
    onClose();
    
    // Reset form
    setCashInDrawer('');
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className={`bg-white dark:bg-gray-800 pt-6 px-6 pb-3 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 relative ${animationClass}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          
          <h2 className="text-xl font-bold mb-2 dark:text-white">Aperturar Caja</h2>
          <hr className="my-2 border-gray-300 dark:border-gray-600" />

          <div className="w-full px-2 mb-4 mt-4">
            <label htmlFor="cashierDateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha
            </label>
            <input
              type="datetime-local"
              id="cashierDateTime"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 pl-2 py-1"
              value={cashierDateTime}
              onChange={(e) => setCashierDateTime(e.target.value)}
            />
          </div>

          <div className="w-full px-2 mb-4">
            <label htmlFor="cashierName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cajero
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <FaUser size={14} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                id="cashierName"
                placeholder="Nombre del Cajero"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 pl-8 pr-2 py-1"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                readOnly
              />
            </div>
          </div>

          <div className="w-full px-2 mb-4">
            <label htmlFor="cashInDrawer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Efectivo en Caja
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {currencySymbol}
                </span>
              </div>
              <input
                type="number"
                id="cashInDrawer"
                placeholder="0.00"
                step="0.01"
                min="0"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 pl-9 pr-2 py-1"
                value={cashInDrawer}
                onChange={(e) => setCashInDrawer(e.target.value)}
              />
              
            </div>
          </div>

          {cashierDateTime && cashierName && cashInDrawer ? (
            <hr className="my-2 border-gray-300 dark:border-gray-600" />
          ) : null}
          
          <div className="flex justify-end space-x-3">
            {cashierDateTime && cashierName && cashInDrawer ? (
              <button
                onClick={handleOpenCashier}
                className="bg-green-500 text-white font-bold py-0.5 px-2 rounded hover:bg-green-400 hover:text-white"
              >
                Abrir
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Opencashier;