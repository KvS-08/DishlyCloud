import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { NotificationBell } from '../components/ui/NotificationBell';
import { MdTableRestaurant, MdEdit, MdDelete, MdQrCode2 } from 'react-icons/md';
import { Link } from 'react-router-dom';
const AddTableModal = React.lazy(() => import('../components/tables/AddTableModal'));
const TableDetailsModal = React.lazy(() => import('../components/tables/TableDetailsModal'));
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Table {
  id: string;
  name: string;
  capacity: number;
  is_available: boolean;
  created_at: string;
}

const MesasPage = () => {
  const { user } = useAuth();
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [isTableDetailsModalOpen, setIsTableDetailsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load tables when component mounts
  useEffect(() => {
    if (user?.business_id) {
      loadTables();
    }
  }, [user?.business_id]);

  const loadTables = useCallback(async () => {
    if (!user?.business_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('business_id', user.business_id);

      if (error) {
        console.error('Error loading tables:', error);
        toast.error('Error al cargar las mesas');
        return;
      }

      // Sort tables: occupied first, then alphabetically and numerically by name
      const sortedData = (data || []).sort((a, b) => {
        // Sort by availability (false/occupied first)
        if (a.is_available !== b.is_available) {
          return a.is_available ? 1 : -1; // Occupied (false) comes before available (true)
        }

        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        // Extract numerical parts for natural sorting
        const numA = parseInt(nameA.match(/\d+/)?.[0] || '0');
        const numB = parseInt(nameB.match(/\d+/)?.[0] || '0');

        // Compare alphabetically first
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;

        // If names are identical, compare numerically
        return numA - numB;
      });

      setTables(sortedData);
    } catch (error) {
      console.error('Error loading tables:', error);
      toast.error('Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  }, [user?.business_id]);

  const handleTableAdded = useCallback((newTable: Table) => {
    setTables(prev => [newTable, ...prev]);
  }, []);

  const handleTableClick = useCallback((table: Table) => {
    if (isEditMode) {
      // In edit mode, don't open details modal
      return;
    }
    setSelectedTable(table);
    setIsTableDetailsModalOpen(true);
  }, [isEditMode]);

  const handleDeleteTable = useCallback(async (tableId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the table details modal
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId);

      if (error) {
        console.error('Error deleting table:', error);
        toast.error('Error al eliminar la mesa');
        return;
      }

      // Update local state
      setTables(prev => prev.filter(table => table.id !== tableId));
      toast.success('Mesa eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Error al eliminar la mesa');
    }
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  return (
    <div className="space-y-6 md:ml-32 pt-4 md:pt-0 md:-mt-10">
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
            return formattedDate;
          })()}
        </h1>
        <div className="hidden md:flex items-center space-x-0">
            <NotificationBell />
            <Link to="/menu-qr">
              <MdQrCode2 className="w-6 h-6" />
            </Link>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Espacios ({tables.length})</h2>
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-0.5 px-1.5 rounded"
            onClick={toggleEditMode}
          >
            <MdEdit className="inline-block mr-1" />
            {isEditMode ? 'Terminar' : 'Editar'}
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-0.5 px-1.5 rounded"
            onClick={() => setIsAddTableModalOpen(true)}
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-sm animate-pulse h-32">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {tables.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MdTableRestaurant className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No hay mesas registradas</p>
                <p className="text-sm">Agrega tu primera mesa para comenzar</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                      table.is_available 
                        ? 'border-2 border-green-500 hover:border-green-600' 
                        : 'border-2 border-red-500 hover:border-red-600'
                    }`}
                    onClick={() => handleTableClick(table)}
                  >
                    {/* Status Indicator */}
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                      table.is_available ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>

                    {/* Delete Button (only visible in edit mode) */}
                    {isEditMode && (
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                        onClick={(e) => handleDeleteTable(table.id, e)}
                      >
                        <MdDelete className="h-4 w-4" />
                      </button>
                    )}

                    {/* Table Info */}
                    <div className="space-y-3">
                      <h3 className="text-center font-semibold text-gray-900 dark:text-white text-sm">
                        {table.name}
                      </h3>

                      {/* Table Icon */}
                      <div className="flex justify-center mb-3">
                        <MdTableRestaurant className={`h-12 w-12 ${
                          table.is_available 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`} />
                      </div>

                      <div className={`text-xs font-medium px-2 py-1 rounded-full text-center ${
                        table.is_available
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {table.is_available ? 'Disponible' : 'Ocupada'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <React.Suspense fallback={<div>Cargando...</div>}>
        {isAddTableModalOpen && (
          <AddTableModal
            isOpen={isAddTableModalOpen}
            onClose={() => setIsAddTableModalOpen(false)}
            onTableAdded={handleTableAdded}
          />
        )}

        {selectedTable && (
          <TableDetailsModal
            isOpen={isTableDetailsModalOpen}
            onClose={() => {
              setIsTableDetailsModalOpen(false);
              setSelectedTable(null);
            }}
            table={selectedTable}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export default React.memo(MesasPage);