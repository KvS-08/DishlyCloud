import React from 'react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { NotificationBell } from '../components/ui/NotificationBell';
import { useState, useEffect, lazy, Suspense } from 'react';
import { format } from 'date-fns';
import AddIngredientsModal from '../components/kitchen/AddIngredientsModal';
import EditIngredientModal from '../components/kitchen/EditIngredientModal';
import { es } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import toast from 'react-hot-toast';
import { FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface InventoryItem {
  id: string;
  created_at: string;
  name: string;
  quantity: number;
  unit: string;
  min_stock_level: number;
  cost_per_unit: number;
  business_id: string;
  fecha_agregado: string;


  stock_actual: number | null;
}

const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Load all inventory items when component mounts
  useEffect(() => {
    if (user?.business_id) {
      loadInventoryItems();

      // Set up real-time subscription for inventory updates
      const subscription = supabase
        .channel('inventory_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory_items',
            filter: `business_id=eq.${user.business_id}`,
          },
          () => {
            loadInventoryItems();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.business_id]);

  const loadInventoryItems = async () => {
    if (!user?.business_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('business_id', user.business_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading inventory items:', error);
        toast.error('Error al cargar los ingredientes');
        return;
      }

      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error('Error al cargar los ingredientes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleIngredientAdded = (newIngredient: InventoryItem) => {
    setInventoryItems(prev => [newIngredient, ...prev]);
  };

  const handleIngredientUpdated = (updatedIngredient: InventoryItem) => {
    setInventoryItems(prev => 
      prev.map(item => item.id === updatedIngredient.id ? updatedIngredient : item)
    );
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'HNL';
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
  };

  // Calculate total inventory value
  const calculateInventoryValue = () => {
    return inventoryItems.reduce((total, item) => {
      const itemValue = (item.cost_per_unit || 0) * (item.stock_actual || item.quantity || 0);
      return total + itemValue;
    }, 0);
  };

  const inventoryValue = calculateInventoryValue();

  // Filter inventory items based on search term
  const filteredInventoryItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:ml-32 pt-4 md:pt-0 md:-mt-10">
      <AddIngredientsModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onIngredientAdded={handleIngredientAdded}
      />
      {selectedItem && (
        <EditIngredientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          ingredient={selectedItem}
          onIngredientUpdated={handleIngredientUpdated}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-3xl font-bold">
          {(() => {
            const formattedDate = format(new Date(), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es });
            const parts = formattedDate.split(',');
            if (parts.length > 0) {
              const day = parts[0];
              const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
              return [capitalizedDay, ...parts.slice(1)].join(',');
            }
            return formattedDate; // Fallback if split fails
          })()}
        </h1>
        <div className="hidden md:flex items-center space-x-0">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Inventario Actual - {formatCurrency(inventoryValue)}
        </h3>
      </div>
      <div className="mb-4 flex justify-between items-center space-x-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="pl-10 pr-4 py-1.5 w-full border border-gray-300 rounded-md bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            placeholder="Buscar ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => { /* TODO: Implement Categories functionality */ }}
          className="px-1.5 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Categorias
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2.5 px-1.5 rounded text-xs md:py-2 md:px-1.5 md:text-sm whitespace-nowrap"
          onClick={handleOpenModal}
        >
          Agregar Ingrediente
        </button>
      </div>
      <div className="card">
        <div className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Fecha</th>

                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Costo Pedido</th>
                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Costo Unitario</th>

                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Inicial</th>
                    <th scope="col" className="px-1 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Actual</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-100 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-1 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                        {searchTerm 
                          ? 'No se encontraron ingredientes que coincidan con la búsqueda' 
                          : 'No hay ingredientes en el inventario'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredInventoryItems.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          item.stock_actual === 0 ? 'bg-red-50 dark:bg-red-900/20' :
                          item.stock_actual !== null && item.stock_actual < item.min_stock_level ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                          ''
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <td className="px-1 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white hidden md:table-cell">
                          {formatDate(item.created_at)}
                        </td>

                        <td className="px-1 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-1 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white hidden md:table-cell">
                          {formatCurrency((item as any).costo_pedido || 0)}
                        </td>
                        <td className="px-1 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white hidden md:table-cell">
                          {formatCurrency(item.cost_per_unit)}
                        </td>

                        <td className="px-1 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-1 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                          {(item.stock_actual !== null ? item.stock_actual : item.quantity)} {item.unit}
                          {item.stock_actual === 0 && (
                            <span className="ml-2 inline-flex items-center justify-center w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
                          )}
                          {item.stock_actual !== null && item.stock_actual > 0 && item.stock_actual < item.min_stock_level && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Bajo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;