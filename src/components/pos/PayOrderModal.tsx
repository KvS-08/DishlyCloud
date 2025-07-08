import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { GiMoneyStack } from 'react-icons/gi';
import { FaCcMastercard, FaPaypal } from 'react-icons/fa6';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useBusinessSettings } from '../../hooks/useBusinessSettings';
import toast from 'react-hot-toast';
import Portal from '../ui/Portal';

type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'PayPal' | null;

interface OrderItem {
  id: string;
  producto: string;
  valor: number;
  cantidad: number;
  unitPrice: number;
  numero_orden: string;
}

interface PayOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: {
    id: string;
    name: string;
    is_available: boolean;
  };
  orders: OrderItem[];
  onPaymentComplete: () => void;
}

const PayOrderModal: React.FC<PayOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  table,
  orders,
  onPaymentComplete
}) => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [customerName, setCustomerName] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 16));
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [cai, setCai] = useState<string>('');
  const [rtn, setRtn] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      // Set customer name to table name by default
      setCustomerName(table.name);
      
      // Get the existing invoice number from the first order
      if (orders.length > 0) {
        getExistingInvoiceNumber();
      } else {
        generateInvoiceNumber();
      }
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, table.name, orders]);

  const getExistingInvoiceNumber = async () => {
    if (!orders.length) return;
    
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('factura')
        .eq('id', orders[0].id)
        .single();
        
      if (error) {
        console.error('Error fetching invoice number:', error);
        generateInvoiceNumber(); // Fallback to generating a new one
        return;
      }
      
      if (data && data.factura) {
        setInvoiceNumber(data.factura);
      } else {
        generateInvoiceNumber();
      }
    } catch (error) {
      console.error('Error fetching invoice number:', error);
      generateInvoiceNumber();
    }
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const invoice = `${year}${month}${day}${random}`;
    setInvoiceNumber(invoice);
  };

  const handlePayment = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Selecciona un método de pago');
      return;
    }

    setLoading(true);

    try {
      // 1. Update all order items to "pagado" status
      const orderIds = orders.map(order => order.id);
      
      const { error: updateError } = await supabase
        .from('ventas')
        .update({
          estado: 'pagado',
          tipo_pago: selectedPaymentMethod,
          factura: invoiceNumber
        })
        .in('id', orderIds);

      if (updateError) {
        console.error('Error updating orders:', updateError);
        toast.error('Error al procesar el pago');
        return;
      }

      // 2. Update table status to available
      const { error: tableError } = await supabase
        .from('tables')
        .update({ is_available: true })
        .eq('id', table.id);

      if (tableError) {
        console.error('Error updating table status:', tableError);
        toast.error('Error al actualizar el estado de la mesa');
        // Continue with the process even if table update fails
      }

      toast.success('Pago procesado exitosamente');
      onPaymentComplete();
      onClose();
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  // Calculate totals
  const subtotal = orders.reduce((sum, order) => sum + order.valor, 0);
  const tipPercentage = settings?.tip_percentage || 0;
  const taxPercentage = settings?.tax_percentage || 0;
  const tipAmount = (subtotal * tipPercentage) / 100;
  const taxAmount = (subtotal * taxPercentage) / 100;
  const total = subtotal + tipAmount + taxAmount;

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'HNL';
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
              <h2 className="text-xl font-bold dark:text-white">Cobrar Mesa</h2>
              <span className="text-xl text-white">{table.name}</span>
            </div>
            <button
              onClick={onClose}
              className="p-0 rounded-full hover:bg-gray-200"
            >
              <FaTimes />
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
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
              <input 
                type="text" 
                id="nombre" 
                placeholder="Nombre del Cliente" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5" 
              />
            </div>
            <div>
              <label htmlFor="factura" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Factura</label>
              <input 
                type="text" 
                id="factura" 
                value={invoiceNumber}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5 bg-gray-100 dark:bg-gray-600" 
              />
            </div>
            <div>
              <label htmlFor="cai" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Factura CAI</label>
              <input 
                type="text" 
                id="cai" 
                placeholder="Número CAI" 
                value={cai}
                onChange={(e) => setCai(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5" 
              />
            </div>
            <div>
              <label htmlFor="rtn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">RTN</label>
              <input 
                type="text" 
                id="rtn" 
                placeholder="RTN del cliente" 
                value={rtn}
                onChange={(e) => setRtn(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-0.5" 
              />
            </div>
          </div>
          
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
          
          <hr className="my-4 border-gray-300 dark:border-gray-600" />
          
          {/* Order Summary */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Orden</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Factura: {invoiceNumber}
              </span>
            </div>
            
            <div className="space-y-2">
              {/* Selected Products */}
              {orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {order.producto}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(order.valor)}
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
          </div>

          <div className="mt-6 flex justify-end col-span-2">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedPaymentMethod || loading}
              onClick={handlePayment}
            >
              {loading ? 'Procesando...' : 'Procesar Pago'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default PayOrderModal;