import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import Portal from '../ui/Portal';

interface SelectedProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ProductNotes {
  [productId: string]: {
    con: string;
    sin: string;
  };
}

interface AddNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: SelectedProduct[];
  onNotesAdded: (notes: ProductNotes) => void;
}

const AddNotesModal: React.FC<AddNotesModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedProducts,
  onNotesAdded
}) => {
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [productNotes, setProductNotes] = useState<ProductNotes>({});

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      // Initialize notes for all products
      const initialNotes: ProductNotes = {};
      selectedProducts.forEach(product => {
        initialNotes[product.id] = { con: '', sin: '' };
      });
      setProductNotes(initialNotes);
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedProducts]);

  if (!showModal) return null;

  const handleNoteChange = (productId: string, type: 'con' | 'sin', value: string) => {
    setProductNotes(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }));
  };

  const handleSave = () => {
    onNotesAdded(productNotes);
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 relative max-h-[80vh] overflow-y-auto ${animationClass}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          
          <h2 className="text-xl font-bold mb-2 dark:text-white">Agregar Notas</h2>
          <hr className="mb-4 border-gray-300 dark:border-gray-600" />
          
          <div className="space-y-6">
            {selectedProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                  {product.name} x{product.quantity}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Complementos:
                    </label>
                    <textarea
                      value={productNotes[product.id]?.con || ''}
                      onChange={(e) => handleNoteChange(product.id, 'con', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ej: extra queso, salsa picante"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sin:
                    </label>
                    <textarea
                      value={productNotes[product.id]?.sin || ''}
                      onChange={(e) => handleNoteChange(product.id, 'sin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ej: sin cebolla, sin mayonesa"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <hr className="my-4 border-gray-300 dark:border-gray-600" />
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleSave}
              className="text-orange-500 hover:text-orange-600 text-sm font-medium underline-offset-4 hover:underline"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default AddNotesModal;