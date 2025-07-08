import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import { MdTableRestaurant } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useBusinessSettings } from '../../hooks/useBusinessSettings';
import toast from 'react-hot-toast';
import Portal from '../ui/Portal';
import LoadingSpinner from '../ui/LoadingSpinner';

const AddProductsToTableModal = lazy(() => import('./AddProductsToTableModal'));
const PayOrderModal = lazy(() => import('../pos/PayOrderModal'));

interface TableOrder {
  id: string;
  producto: string;
  valor: number;
  cantidad: number;
  unitPrice: number;
  numero_orden: string;
}

interface TableDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: {
    id: string;
    name: string;
    capacity: number;
    is_available: boolean;
  };
}

const TableDetailsModal: React.FC<TableDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  table
}) => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [orders, setOrders] = useState<TableOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddProductsModalOpen, setIsAddProductsModalOpen] = useState(false);
  const [isPayOrderModalOpen, setIsPayOrderModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      loadTableOrders();
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, table.id]);

  const loadTableOrders = async () => {
    if (!user?.business_id || !table.name) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('business_id', user.business_id)
        .eq('cliente', table.name)
        .eq('estado', 'por cobrar')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading table orders:', error);
        return;
      }

      // Process orders to extract product name and quantity
      const processedOrders: TableOrder[] = [];
      
      data?.forEach(order => {
        const productMatch = order.producto.match(/^(.+) x(\d+)$/);
        if (productMatch) {
          const productName = productMatch[1];
          const quantity = parseInt(productMatch[2]);
          const unitPrice = order.valor / quantity;
          
          processedOrders.push({
            id: order.id,
            producto: productName,
            valor: order.valor,
            cantidad: quantity,
            unitPrice: unitPrice,
            numero_orden: order.numero_orden
          });
        }
      });

      setOrders(processedOrders);
    } catch (error) {
      console.error('Error loading table orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (orderId: string, productName: string, change: number) => {
    if (!user?.business_id || !user?.id) return;

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newQuantity = order.cantidad + change;
    
    if (newQuantity <= 0) {
      // Remove the product completely
      await removeProduct(orderId);
      return;
    }

    try {
      // Calculate new total value
      const newValue = order.unitPrice * newQuantity;
      const newProductString = `${productName} x${newQuantity}`;
      
      // Update the existing order record
      const { error } = await supabase
        .from('ventas')
        .update({
          producto: newProductString,
          valor: newValue
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating product quantity:', error);
        toast.error('Error al actualizar cantidad');
        return;
      }

      // Update local state
      setOrders(prev => 
        prev.map(o => 
          o.id === orderId 
            ? { 
                ...o, 
                cantidad: newQuantity,
                valor: newValue,
                producto: productName
              }
            : o
        )
      );

      // Reduce inventory if increasing quantity
      if (change > 0) {
        // Get the menu item ID for this product
        const { data: menuItems, error: menuError } = await supabase
          .from('menu_items')
          .select('id')
          .eq('name', productName)
          .eq('business_id', user.business_id)
          .limit(1);

        if (menuError) {
          console.error('Error finding menu item:', menuError);
        } else if (menuItems && menuItems.length > 0) {
          // Call the reduce inventory function with the menu item ID and quantity change
          await reduceInventory(menuItems[0].id, 1); // Only reduce by 1 since we're incrementing by 1
        }
      }

      toast.success(change > 0 ? 'Cantidad agregada' : 'Cantidad reducida');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error al actualizar cantidad');
    }
  };

  const reduceInventory = async (productId: string, quantity: number) => {
    try {
      // Call the edge function to reduce inventory
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('No session found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reduce-inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error reducing inventory:', errorData);
        return;
      }

      const result = await response.json();
      console.log('Inventory reduced successfully:', result);
    } catch (error) {
      console.error('Error reducing inventory:', error);
    }
  };

  const removeProduct = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('ventas')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error removing product:', error);
        toast.error('Error al eliminar producto');
        return;
      }

      // Update local state
      setOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('Producto eliminado');
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const handleProductsAdded = () => {
    // Reload table orders after adding new products
    loadTableOrders();
  };

  const handlePaymentComplete = () => {
    // Reload table orders after payment
    loadTableOrders();
    // Close the modal since the table should now be available
    onClose();
  };

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'HNL';
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const calculateTotal = () => {
    return orders.reduce((sum, order) => sum + order.valor, 0);
  };

  if (!showModal) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 relative max-h-[80vh] overflow-y-auto ${animationClass}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          
          <div className="flex items-center mb-1">
            <MdTableRestaurant className="h-6 w-6 mr-2 text-blue-500" />
            <h2 className="text-xl font-bold dark:text-white">{table.name}</h2>
          </div>
          
          <hr className="mb-3 border-gray-300 dark:border-gray-600" />
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No hay productos en consumo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Productos en Consumo
                  </h3>
                  
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {order.producto}
                          </h4>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleQuantityChange(order.id, order.producto, -1)}
                            className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <FaMinus className="h-3 w-3" />
                          </button>
                          
                          <span className="font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                            {order.cantidad}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(order.id, order.producto, 1)}
                            className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                          >
                            <FaPlus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(order.valor)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-xm font-bold mb-3">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-green-600 dark:text-green-400">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                  <hr className="border-gray-300 dark:border-gray-600" />
                </div>
              )}
              
              <div className="flex justify-between mt-2">
                <button 
                  className="bg-green-600 hover:bg-green-500 text-white text-sm py-1 px-2 rounded-md transition-colors text-center no-underline"
                  onClick={() => setIsAddProductsModalOpen(true)}
                >
                  Agregar
                </button>
                <button 
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm py-1 px-2 rounded-md transition-colors text-center no-underline"
                  onClick={() => setIsPayOrderModalOpen(true)}
                  disabled={orders.length === 0}
                >
                  Cobrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <AddProductsToTableModal
          isOpen={isAddProductsModalOpen}
          onClose={() => setIsAddProductsModalOpen(false)}
          table={table}
          onProductsAdded={handleProductsAdded}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <PayOrderModal
          isOpen={isPayOrderModalOpen}
          onClose={() => setIsPayOrderModalOpen(false)}
          table={table}
          orders={orders}
          onPaymentComplete={handlePaymentComplete}
        />
      </Suspense>
    </Portal>
  );
};

export default TableDetailsModal;