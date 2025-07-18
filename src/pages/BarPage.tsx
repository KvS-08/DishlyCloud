import React, { useState, useEffect } from 'react';
import { NotificationBell } from '../components/ui/NotificationBell';

import { KitchenOrderCard } from '../components/kitchen/KitchenOrderCard';

import { CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';


interface OrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  preparationTime: number;
  notes?: {
    con: string;
    sin: string;
  };
}

interface KitchenOrder {
  id: string;
  order_number: number;
  customer_name?: string;
  table_number?: string;
  items: OrderItem[];
  created_at: string;
  status: string;
  business_id: string;
}

export const BarPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Load orders from database on component mount
  useEffect(() => {
    if (user?.business_id) {
      loadOrders();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('kitchen_orders_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'kitchen_orders',
            filter: `business_id=eq.${user.business_id}`,
          },
          () => {
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.business_id]);

  const loadOrders = async () => {
    if (!user?.business_id) return;
    
    setLoading(true);
    try {
      // Get pending orders
      const { data, error } = await supabase
        .from('kitchen_orders')
        .select('*')
        .eq('business_id', user.business_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading kitchen orders:', error);
        return;
      }

      // Get completed count
      const { count, error: countError } = await supabase
        .from('kitchen_orders')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', user.business_id)
        .eq('status', 'completed');

      if (countError) {
        console.error('Error getting completed count:', countError);
      } else {
        setCompletedCount(count || 0);
      }

      // Format orders for display
      const formattedOrders = (data || []).map(order => ({
        ...order,
        items: order.items || [],
        createdAt: new Date(order.created_at)
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOrderComplete = async (id: string) => {
    try {
      // Update order status in database
      const { error } = await supabase
        .from('kitchen_orders')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) {
        console.error('Error completing order:', error);
        toast.error('Error al completar la orden');
        return;
      }
      
      // Remove from current orders
      setOrders(orders.filter(order => order.id !== id));
      setCompletedCount(prevCount => prevCount + 1);
      
      // Play sound for order completion
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {
        // Ignore audio play errors
      });
      
      toast.success('Orden marcada como servida');
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Error al completar la orden');
    }
  };

  const handleOrderCancel = async (id: string) => {
    try {
      // Update order status in database
      const { error } = await supabase
        .from('kitchen_orders')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        console.error('Error cancelling order:', error);
        toast.error('Error al cancelar la orden');
        return;
      }
      
      // Remove from current orders
      setOrders(orders.filter(order => order.id !== id));
      
      toast.success('Orden cancelada');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error al cancelar la orden');
    }
  };
  

  
  return (
    <div className="space-y-6 md:ml-32 pt-4 md:pt-0 md:-mt-10">
      <div className="flex justify-between items-center mt-0">
        <h2 className="text-xl font-semibold">Órdenes en Preparación ({orders.length})</h2>
        <div className="hidden md:flex items-center space-x-0">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Cargando órdenes...</p>
        </div>
      ) : (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 mx-auto text-success-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-text-white">¡Todas las órdenes completadas!</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                No hay órdenes pendientes en este momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <KitchenOrderCard 
                  key={order.id}
                  orderNumber={order.order_number}
                  customerName={order.customer_name}
                  tableNumber={order.table_number}
                  items={order.items}
                  createdAt={new Date(order.created_at)}
                  onComplete={handleOrderComplete}
                  onCancel={handleOrderCancel}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};