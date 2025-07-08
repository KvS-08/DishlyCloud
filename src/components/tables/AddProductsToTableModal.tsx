import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useBusinessSettings } from '../../hooks/useBusinessSettings';
import toast from 'react-hot-toast';
import Portal from '../ui/Portal';

interface Category {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  preparation_time: number;
  image_url: string | null;
  is_available: boolean;
  category_id: string;
  created_at: string;
  category?: {
    name: string;
  };
}

interface AddProductsToTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: {
    id: string;
    name: string;
    capacity: number;
    is_available: boolean;
  };
  onProductsAdded: () => void;
}

const AddProductsToTableModal: React.FC<AddProductsToTableModalProps> = ({ 
  isOpen, 
  onClose, 
  table,
  onProductsAdded
}) => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      loadCategories();
      loadMenuItems();
      setSelectedProducts(new Map()); // Reset selections
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const loadCategories = async () => {
    if (!user?.business_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', user.business_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    if (!user?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('business_id', user.business_id)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading menu items:', error);
        return;
      }

      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleProductClick = (item: MenuItem) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      newMap.set(item.id, (newMap.get(item.id) || 0) + 1);
      return newMap;
    });
  };

  const handleProductDecrease = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(itemId) || 0;
      if (currentCount > 1) {
        newMap.set(itemId, currentCount - 1);
      } else {
        newMap.delete(itemId);
      }
      return newMap;
    });
  };

  const checkExistingProduct = async (productName: string, orderNumber: string) => {
    if (!user?.business_id) return null;

    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('business_id', user.business_id)
        .eq('cliente', table.name)
        .eq('numero_orden', orderNumber)
        .eq('estado', 'por cobrar')
        .like('producto', `${productName} x%`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error checking existing product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error checking existing product:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (selectedProducts.size === 0) {
      toast.error('No hay productos seleccionados');
      return;
    }

    setSaving(true);

    try {
      // Generate order number for this batch of products
      const orderNumber = Date.now().toString();
      const invoiceNumber = `${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${orderNumber.slice(-3)}`;

      // Process each selected product
      for (const [productId, quantity] of selectedProducts) {
        const product = menuItems.find(item => item.id === productId);
        if (!product) continue;

        // Check if this product already exists in an order for this table
        const existingProduct = await checkExistingProduct(product.name, orderNumber);

        if (existingProduct) {
          // Update existing product quantity
          const currentMatch = existingProduct.producto.match(/^(.+) x(\d+)$/);
          if (currentMatch) {
            const currentQuantity = parseInt(currentMatch[1]);
            const newQuantity = currentQuantity + quantity;
            const newValue = product.price * newQuantity;
            const newProductString = `${product.name} x${newQuantity}`;

            const { error } = await supabase
              .from('ventas')
              .update({
                producto: newProductString,
                valor: newValue
              })
              .eq('id', existingProduct.id);

            if (error) {
              console.error('Error updating existing product:', error);
              toast.error('Error al actualizar producto existente');
              return;
            }
          }
        } else {
          // Create new product entry
          const saleData = {
            fecha: new Date().toISOString(),
            cajero: user.full_name || 'Usuario',
            numero_orden: orderNumber,
            tipo_orden: 'Comer aqui',
            cliente: table.name,
            producto: `${product.name} x${quantity}`,
            notas: '',
            estado: 'por cobrar',
            valor: product.price * quantity,
            tipo_pago: 'pendiente',
            factura: invoiceNumber,
            business_id: user.business_id,
            created_by: user.id
          };

          const { error } = await supabase
            .from('ventas')
            .insert([saleData]);

          if (error) {
            console.error('Error saving new product:', error);
            toast.error('Error al guardar nuevo producto');
            return;
          }
        }
      }

      toast.success('Productos agregados exitosamente');
      onProductsAdded();
      onClose();
      
    } catch (error) {
      console.error('Error saving products:', error);
      toast.error('Error al agregar productos');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'HNL';
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  if (!showModal) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-4/5 lg:w-3/5 xl:w-1/2 relative max-h-[90vh] overflow-y-auto ${animationClass}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          
          <h2 className="text-xl font-bold mb-0.5 dark:text-white">
            Agregar Productos
          </h2>
          <hr className="mb-2 border-gray-300 dark:border-gray-600" />
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Categories Section */}
              {categories.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-1.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === null
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      Todas ({menuItems.length})
                    </button>
                    {categories.map((category) => {
                      const categoryItemCount = menuItems.filter(item => item.category_id === category.id).length;
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category.id)}
                          className={`px-1.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                          }`}
                        >
                          {category.name} ({categoryItemCount})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <hr className="border-gray-300 dark:border-gray-600 mb-2" />
              
              {/* Products Section */}
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>
                    {selectedCategory 
                      ? 'No hay productos en esta categoría' 
                      : 'No hay productos disponibles.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-4">
                  {filteredMenuItems.map((item) => {
                    const quantity = selectedProducts.get(item.id) || 0;
                    const isSelected = quantity > 0;
                    
                    return (
                      <div
                        key={item.id}
                        className={`relative bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleProductClick(item)}
                      >
                        {/* Quantity Counter */}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 z-20">
                            <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
                              {quantity}
                            </div>
                          </div>
                        )}

                        {/* Decrease Button */}
                        {isSelected && (
                          <button
                            className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold z-20 hover:bg-red-600 shadow-lg border-2 border-white transition-colors"
                            onClick={(e) => handleProductDecrease(item.id, e)}
                          >
                            -
                          </button>
                        )}

                        {/* Product Price */}
                        <span className="absolute top-0.5 right-0.5 text-xs font-bold text-gray-700 dark:text-white bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
                          {formatCurrency(item.price)}
                        </span>

                        {/* Product Image */}
                        <div className="w-full h-20 mb-2 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-600">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight text-center">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {selectedProducts.size > 0 && (
                <>
                  <hr className="border-gray-300 dark:border-gray-600 my-4" />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Guardando...' : `Guardar (${selectedProducts.size} productos)`}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default AddProductsToTableModal;