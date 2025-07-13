import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { MdTableRestaurant } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import Portal from '../ui/Portal';

interface Table {
  id: string;
  name: string;
  capacity: number;
  is_available: boolean;
  created_at: string;
}

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableAdded?: (table: Table) => void;
}

const AddTableModal: React.FC<AddTableModalProps> = ({ 
  isOpen, 
  onClose, 
  onTableAdded 
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      // Reset form
      setNombre('');
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  const handleSave = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (!nombre.trim()) {
      toast.error('El nombre de la mesa es requerido');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('tables')
        .insert([{
          name: nombre.trim(),
          capacity: 4, // Default capacity
          is_available: true,
          business_id: user.business_id,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving table:', error);
        toast.error('Error al guardar la mesa');
        return;
      }

      toast.success('Mesa agregada exitosamente');
      
      // Call the callback to update the parent component
      if (onTableAdded) {
        onTableAdded(data);
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error('Error al guardar la mesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 relative ${animationClass}`}>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          
          <h2 className="text-lg font-bold mb-0 dark:text-white">Agregar Mesa</h2>
          <hr className="mb-3 border-gray-300 dark:border-gray-600" />
          
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la Mesa
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <MdTableRestaurant className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Mesa 1, VIP, Terraza A"
              />
            </div>
          </div>
          
          {nombre && (
            <>
              <hr className="my-3 border-gray-300 dark:border-gray-600" />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-2 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default AddTableModal;