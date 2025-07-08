import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { GiMoneyStack } from 'react-icons/gi';
import { FaCcMastercard, FaPaypal } from 'react-icons/fa6';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AddNotesModal = lazy(() => import('./AddNotesModal'));

type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'PayPal' | null;

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

interface CreateOrderProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: SelectedProduct[];
  tipPercentage: number;
  taxPercentage: number;
  currency: string;
}

import Portal from '../ui/Portal';

const CreateOrder: React.FC<CreateOrderProps> = ({ 
  isOpen, 
  onClose, 
  selectedProducts = [],
  tipPercentage = 0,
  taxPercentage = 0,
  currency = 'HNL'
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [accountType, setAccountType] = useState('Abierta');
  const [facturaCAI, setFacturaCAI] = useState('');
  const [rtn, setRtn] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedOrderType, setSelectedOrderType] = useState('Comer aqui');
  const [selectedClient, setSelectedClient] = useState('Mesa');
  const [customerName, setCustomerName] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 16));
  const [orderNumber, setOrderNumber] = useState<number>(1);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [productNotes, setProductNotes] = useState<ProductNotes>({});

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      generateOrderNumber();
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const generateOrderNumber = async () => {
    if (!user?.business_id) return;

    setLoading(true);
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const { data, error } = await supabase
        .from('ventas')
        .select('numero_orden')
        .eq('business_id', user.business_id)
        .gte('fecha', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('fecha', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
        .order('numero_orden', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching last order number:', error);
        setOrderNumber(1);
        generateInvoiceNumber(1);
        return;
      }

      let nextOrderNumber = 1;
      if (data && data.length > 0) {
        const lastOrderNumber = parseInt(data[0].numero_orden);
        nextOrderNumber = lastOrderNumber + 1;
      }

      setOrderNumber(nextOrderNumber);
      generateInvoiceNumber(nextOrderNumber);
    } catch (error) {
      console.error('Error generating order number:', error);
      setOrderNumber(1);
      generateInvoiceNumber(1);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = (orderNum: number) => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    const invoice = `${year}${month}${day}${orderNum}`;
    setInvoiceNumber(invoice);
  };

  const handleNotesAdded = (notes: ProductNotes) => {
    setProductNotes(notes);
  };

  const findAvailableTable = async (tableType: 'Mesa' | 'Barra') => {
    if (!user?.business_id) return null;

    try {
      // First, get all tables of the specified type
      const query = supabase
        .from('tables')
        .select('*')
        .eq('business_id', user.business_id)
        .eq('is_available', true);
      
      // Filter tables based on type and order by name to get the lowest number first
      let filteredQuery;
      if (tableType === 'Barra') {
        filteredQuery = await query
          .ilike('name', 'Barra%')
          .order('name')
          .limit(1);
      } else {
        filteredQuery = await query
          .ilike('name', 'Mesa%')
          .order('name')
          .limit(1);
      }

      const { data, error } = filteredQuery;

      if (error) {
        console.error('Error finding available table:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error finding available table:', error);
      return null;
    }
  };

  const assignTable = async (tableId: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update({ is_available: false })
        .eq('id', tableId);

      if (error) {
        console.error('Error assigning table:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error assigning table:', error);
      return false;
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

  const handleProcess = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('No hay productos seleccionados');
      return;
    }

    if (accountType === 'Cerrada' && !selectedPaymentMethod) {
      toast.error('Selecciona un método de pago');
      return;
    }

    setProcessing(true);

    try {
      const subtotal = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
      const tipAmount = (subtotal * tipPercentage) / 100;
      const taxAmount = (subtotal * taxPercentage) / 100;
      const total = subtotal + tipAmount + taxAmount;

      let assignedTable = null;
      
      // Only assign tables for "Comer aqui" orders, not for delivery or takeout
      if (selectedOrderType === 'Comer aqui' && accountType === 'Abierta') {
        if (selectedClient === 'Mesa') {
          // Find available table that starts with "Mesa"
          assignedTable = await findAvailableTable('Mesa');
          if (!assignedTable) {
            toast.error('No hay mesas disponibles');
            setProcessing(false);
            return;
          }
        } else if (selectedClient === 'Barra') {
          // Find available table that starts with "Barra"
          assignedTable = await findAvailableTable('Barra');
          if (!assignedTable) {
            toast.error('No hay barras disponibles');
            setProcessing(false);
            return;
          }
        }
        
        if (assignedTable) {
          await assignTable(assignedTable.id);
        }
      }

      // Save each product as a separate sale record
      for (const product of selectedProducts) {
        const productNoteText = productNotes[product.id] 
          ? `Con: ${productNotes[product.id].con || 'N/A'}, Sin: ${productNotes[product.id].sin || 'N/A'}`
          : '';

        // Determine client name based on order type and table assignment
        let clientName = '';
        if (selectedOrderType === 'Para llevar' || selectedOrderType === 'Domicilio') {
          // For takeout and delivery, use customer name
          clientName = customerName || 'Cliente';
        } else if (assignedTable) {
          // For dine-in with assigned table
          clientName = assignedTable.name;
        } else {
          // For dine-in without table (fallback)
          clientName = selectedClient;
        }

        const saleData = {
          fecha: new Date(fecha).toISOString(),
          cajero: user.full_name || 'Usuario',
          numero_orden: orderNumber.toString(),
          tipo_orden: selectedOrderType,
          cliente: clientName,
          producto: `${product.name} x${product.quantity}`,
          notas: productNoteText,
          estado: accountType === 'Abierta' ? 'por cobrar' : 'pagado',
          valor: product.price * product.quantity,
          tipo_pago: selectedPaymentMethod || 'pendiente',
          factura: invoiceNumber,
           business_id: user.business_id,
           created_by: user.id,
           factura_cai: facturaCAI,
           rtn: rtn
        };

        const { error } = await supabase
          .from('ventas')
          .insert([saleData]);

        if (error) {
          console.error('Error saving sale:', error);
          toast.error('Error al guardar la venta');
          return;
        }

        // Reduce inventory for this product
        await reduceInventory(product.id, product.quantity);
      }

      // Create kitchen orders for preparation
      await createKitchenOrders(assignedTable);

      toast.success('Orden procesada exitosamente');
      onClose();
      
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Error al procesar la orden');
    } finally {
      setProcessing(false);
    }
  };

  const createKitchenOrders = async (assignedTable: any) => {
    // Get menu items with preparation times
    const menuItemIds = selectedProducts.map(p => p.id);
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('id, name, preparation_time')
      .in('id', menuItemIds);

    if (error) {
      console.error('Error fetching menu items:', error);
      return;
    }

    // Create kitchen order data
    const kitchenOrderData = {
      order_number: orderNumber,
      customer_name: selectedOrderType !== 'Comer aqui' ? customerName : undefined,
      table_number: assignedTable ? assignedTable.name : undefined,
      items: selectedProducts.map(product => {
        const menuItem = menuItems?.find(item => item.id === product.id);
        const notes = productNotes[product.id];
        
        return {
          menu_item_id: product.id,
          name: product.name,
          quantity: product.quantity,
          preparation_time: menuItem?.preparation_time || 15,
          notes: notes ? {
            con: notes.con || '',
            sin: notes.sin || ''
          } : { con: '', sin: '' }
        };
      }),
      created_at: new Date().toISOString(),
      status: 'pending',
      business_id: user?.business_id
    };

    // Save to kitchen_orders table
    try {
      const { error: insertError } = await supabase
        .from('kitchen_orders')
        .insert([kitchenOrderData]);
        
      if (insertError) {
        console.error('Error saving kitchen order:', insertError);
      }
    } catch (error) {
      console.error('Error saving kitchen order:', error);
    }
  };

  if (!showModal) return null;

  // Calculate totals
  const subtotal = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const tipAmount = (subtotal * tipPercentage) / 100;
  const taxAmount = (subtotal * taxPercentage) / 100;
  const total = subtotal + tipAmount + taxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`relative bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 max-h-[90vh] overflow-y-auto ${animationClass}`}>
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Crear Orden</h2>
            <span className="text-xl text-white">#{orderNumber}</span>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <hr className="mb-4 border-gray-300 dark:border-gray-600"/>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
            <input
              type="datetime-local"
              id="fecha"
              name="fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5"
            />
          </div>
          {accountType === 'Abierta' && (
            <div>
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
              <select 
                id="cliente" 
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5"
              >
                <option value="Barra" className="text-xs">Barra</option>
                <option value="Mesa" className="text-xs">Mesa</option>
              </select>
            </div>
          )}
          {accountType === 'Cerrada' && (
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
              <input 
                type="text" 
                id="nombre" 
                placeholder="Nombre del Cliente" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5" 
              />
            </div>
          )}
          <div>
            <label htmlFor="tipoOrden" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Orden</label>
            <select
                id="tipoOrden"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5"
              value={selectedOrderType}
              onChange={(e) => {
                setSelectedOrderType(e.target.value);
                if (e.target.value === 'Para llevar' || e.target.value === 'Domicilio') {
                  setAccountType('Cerrada');
                } else {
                  setAccountType('Abierta');
                }
              }}
            >
               <option value="Comer aqui" className="text-xs">Comer aqui</option>
               <option value="Para llevar" className="text-xs">Para llevar</option>
               <option value="Domicilio" className="text-xs">Domicilio</option>
             </select>
          </div>
          <div>
            <label htmlFor="tipoCuenta" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Cuenta</label>
            <select id="tipoCuenta" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
              <option className="text-xs">Abierta</option>
              <option className="text-xs">Cerrada</option>
            </select>
          </div>
          {accountType === 'Cerrada' && (
            <>
              <div>
                <label htmlFor="facturaCAI" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Factura CAI</label>
                <input
                  type="text"
                  id="facturaCAI"
                  name="facturaCAI"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5"
                  value={facturaCAI}
                  onChange={(e) => setFacturaCAI(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="rtn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">RTN</label>
                <input
                  type="text"
                  id="rtn"
                  name="rtn"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5"
                  value={rtn}
                  onChange={(e) => setRtn(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
          {accountType === 'Cerrada' && (
            <div className="mt-2 col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Método de Pago</label>
              <div className="flex justify-around mt-1 space-x-2">
                <button
                  className={`flex-1 flex items-center justify-center text-xs text-white p-2 px-3 rounded ${selectedPaymentMethod === 'Efectivo' ? 'bg-green-500 opacity-100' : 'bg-green-600 hover:bg-green-700 opacity-60'}`}
                  onClick={() => setSelectedPaymentMethod('Efectivo')}
                >
                  <GiMoneyStack className="text-xl mr-1" />
                  <span>Efectivo</span>
                </button>
                <button
                  className={`flex-1 flex items-center justify-center text-xs text-white p-2 px-3 rounded ${selectedPaymentMethod === 'Tarjeta' ? 'bg-blue-500 opacity-100' : 'bg-blue-600 hover:bg-blue-700 opacity-60'}`}
                  onClick={() => setSelectedPaymentMethod('Tarjeta')}
                >
                  <FaCcMastercard className="text-xl mr-1" />
                  <span>Tarjeta</span>
                </button>
                <button
                  className={`flex-1 flex items-center justify-center text-xs text-white p-2 px-1 rounded ${selectedPaymentMethod === 'PayPal' ? 'bg-purple-500 opacity-100' : 'bg-purple-600 hover:bg-purple-700 opacity-60'}`}
                  onClick={() => setSelectedPaymentMethod('PayPal')}
                >
                  <FaPaypal className="text-xl mr-1" />
                  <span>En Linea</span>
                </button>
              </div>
            </div>
          )}
          
          <hr className="my-4 border-gray-300 dark:border-gray-600" />
          
          {/* Order Summary */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Orden</h3>
              {invoiceNumber && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Factura: {invoiceNumber}
                </span>
              )}
            </div>
            
            {selectedProducts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay productos seleccionados
              </p>
            ) : (
              <div className="space-y-2">
                {/* Selected Products */}
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {product.name} x{product.quantity}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(product.price * product.quantity)}
                    </span>
                  </div>
                ))}
                
                <hr className="border-gray-300 dark:border-gray-600 my-2" />
                
                {/* Subtotal */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                
                {/* Tip */}
                {tipPercentage > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Propina ({tipPercentage}%)
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(tipAmount)}
                    </span>
                  </div>
                )}
                
                {/* Tax */}
                {taxPercentage > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ISV ({taxPercentage}%)
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}
                
                <hr className="border-gray-300 dark:border-gray-600 my-2" />
                
                {/* Total */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            )}
          </div>

        <div className="mt-6 flex justify-between col-span-2">
          <button
            className="bg-orange-500 hover:bg-orange-700 text-white font-semibold py-1 px-2 rounded"
            onClick={() => setIsNotesModalOpen(true)}
            disabled={selectedProducts.length === 0}
          >
            Notas
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedProducts.length === 0 || loading || processing}
            onClick={handleProcess}
          >
            {processing ? 'Procesando...' : 'Procesar'}
          </button>
        </div>
      </div>
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <AddNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          selectedProducts={selectedProducts}
          onNotesAdded={handleNotesAdded}
        />
      </Suspense>
    </Portal>
  );
};

export default CreateOrder;