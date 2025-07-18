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
  const [hasNotes, setHasNotes] = useState(false);

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
    setProductNotes(prev => {
      const newProductNotes = {
        ...prev,
        [productId]: {
          ...prev[productId],
          [type]: value
        }
      };
      const anyNotes = Object.values(newProductNotes).some(note => note.con.trim() !== '' || note.sin.trim() !== '');
      setHasNotes(anyNotes);
      return newProductNotes;
    });
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
          
          <h2 className="text-xl font-bold mb-0.5 dark:text-white">Agregar Notas</h2>
          <hr className="mb-2 border-gray-300 dark:border-gray-600" />
          
          <div className="space-y-1">
            {selectedProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-1 -mt-1 text-gray-900 dark:text-white">
                  {product.name} x{product.quantity}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Complementos:
                    </label>
                    <textarea
                      value={productNotes[product.id]?.con || ''}
                      onChange={(e) => handleNoteChange(product.id, 'con', e.target.value)}
                      className="w-full px-2 py-0 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ej: extra queso, salsa picante"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-0">
                      Sin:
                    </label>
                    <textarea
                      value={productNotes[product.id]?.sin || ''}
                      onChange={(e) => handleNoteChange(product.id, 'sin', e.target.value)}
                      className="w-full px-2 py-0 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ej: sin cebolla, sin mayonesa"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hasNotes && (
            <>
              <hr className="my-2 border-gray-300 dark:border-gray-600" />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleSave}
                  className="bg-orange-600 text-white px-1.5 py-1 rounded hover:bg-orange-500 text-sm font-medium"
                >
                  Agregar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default AddNotesModal;