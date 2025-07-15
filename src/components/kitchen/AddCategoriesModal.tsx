// Remove duplicate React import since it's already imported below
import Portal from '../ui/Portal';
import { FaTimes } from 'react-icons/fa';
import { BiSolidFoodMenu } from 'react-icons/bi';
import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AddCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded?: (category: any) => void;
}

const AddCategoriesModal: React.FC<AddCategoriesModalProps> = ({ 
  isOpen, 
  onClose, 
  onCategoryAdded 
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      // Reset form
      setCategoryName('');
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300); // Duration of the animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(event.target.value);
  };

  const handleSave = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (!categoryName.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryName.trim(),
          business_id: user.business_id,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving category:', error);
        toast.error('Error al guardar la categoría');
        return;
      }

      toast.success('Categoría agregada exitosamente');
      
      // Call the callback to update the parent component
      if (onCategoryAdded) {
        onCategoryAdded(data);
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`bg-white dark:bg-gray-800 p-6 pb-2 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 relative ${animationClass}`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-lg font-bold mb-0 dark:text-white">Agregar Categoría</h2>
        <hr className="mb-2 border-gray-300 dark:border-gray-600" />
        
        <div className="mb-3">
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre de la Categoría
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <BiSolidFoodMenu className="h-4 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="categoryName"
              name="categoryName"
              className="mt-1 block w-full pl-8 pr-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-0.5"
              placeholder="Ej. Bebidas, Platos Fuertes"
              value={categoryName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        {categoryName && (
          <hr className="mb-1 border-gray-300 dark:border-gray-600" />
        )}

        <div className="flex justify-end space-x-3">
          {categoryName && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="text-white hover:bg-green-500 font-bold py-0.5 px-1.5 rounded bg-green-600 border-none underline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Agregando...' : 'Agregar'}
            </button>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
};

export default memo(AddCategoriesModal);