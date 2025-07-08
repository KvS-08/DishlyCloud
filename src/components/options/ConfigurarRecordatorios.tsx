import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTrash } from 'react-icons/fa';
import { FaChevronUp } from 'react-icons/fa';
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Reminder {
  id: string;
  evento: string;
  fecha: string;
  created_at: string;
  allowed_roles: string[] | null;
}

export const ConfigurarRecordatorios = React.memo(() => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [evento, setEvento] = useState('');
  const [fecha, setFecha] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['admin', 'cashier', 'chef', 'waiter']);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const availableRoles = [
    { value: 'admin', label: 'Administradores' },
    { value: 'cashier', label: 'Cajeros' },
    { value: 'chef', label: 'Cocineros' },
    { value: 'waiter', label: 'Meseros' }
  ];

  // Load reminders when component expands
  useEffect(() => {
    if (isExpanded && user?.business_id) {
      loadReminders();
    }
  }, [isExpanded, user?.business_id]);

  const loadReminders = async () => {
    if (!user?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('business_id', user.business_id)
        .eq('is_active', true)
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error loading reminders:', error);
        return;
      }

      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const toggleAccordion = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleRoleToggle = (roleValue: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleValue)) {
        return prev.filter(role => role !== roleValue);
      } else {
        return [...prev, roleValue];
      }
    });
  };

  const handleSave = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (!evento.trim() || !fecha.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error('Debes seleccionar al menos un rol para las notificaciones');
      return;
    }

    // Validate that the date is not in the past
    const selectedDate = new Date(fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('No puedes crear recordatorios para fechas pasadas');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          evento: evento.trim(),
          fecha: fecha,
          business_id: user.business_id,
          created_by: user.id,
          is_active: true,
          allowed_roles: selectedRoles
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving reminder:', error);
        toast.error('Error al guardar el recordatorio');
        return;
      }

      // Add the new reminder to the list
      setReminders(prev => [...prev, data].sort((a, b) => 
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      ));
      
      // Clear the form
      setEvento('');
      setFecha('');
      setSelectedRoles(['admin', 'cashier', 'chef', 'waiter']);
      
      toast.success('Recordatorio guardado exitosamente');
      
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Error al guardar el recordatorio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reminderId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este recordatorio?')) {
      return;
    }

    setDeleteLoading(reminderId);

    try {
      // Instead of deleting, mark as inactive
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: false })
        .eq('id', reminderId);

      if (error) {
        console.error('Error deleting reminder:', error);
        toast.error('Error al eliminar el recordatorio');
        return;
      }

      // Remove the reminder from the list
      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      
      toast.success('Recordatorio eliminado exitosamente');
      
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Error al eliminar el recordatorio');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRoles = (roles: string[] | null) => {
    if (!roles || roles.length === 0) return 'Todos';
    
    return roles.map(role => {
      const roleInfo = availableRoles.find(r => r.value === role);
      return roleInfo ? roleInfo.label : role;
    }).join(', ');
  };

  const isAddButtonVisible = evento.trim() !== '' && fecha.trim() !== '' && selectedRoles.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <button
        className="flex justify-between items-center w-full p-4 text-left text-gray-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={toggleAccordion}
      >
        <span className="flex items-center">
          <FaBell className="w-5 h-5 mr-2 text-gray-700 dark:text-white" />
          Configurar Recordatorios
        </span>
        <FaChevronUp className={`w-4 h-4 transform transition-transform duration-200 text-gray-700 dark:text-white ${!isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden bg-gray-50 dark:bg-gray-700 rounded-b-lg p-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="evento" className="block text-xs font-medium text-gray-900 dark:text-white">Evento</label>
                <input 
                  type="text" 
                  id="evento" 
                  className="mt-1 block w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Ej: Reunión con proveedores" 
                  value={evento} 
                  onChange={(e) => setEvento(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="fecha" className="block text-xs font-medium text-gray-900 dark:text-white">Fecha</label>
                <input 
                  type="date" 
                  id="fecha" 
                  className="mt-1 block w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                  value={fecha} 
                  onChange={(e) => setFecha(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                />
              </div>
              <div className="form-group">
                <label className="block text-xs font-medium text-gray-900 dark:text-white mb-2">
                  Notificar a estos roles
                </label>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <label key={role.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.value)}
                        onChange={() => handleRoleToggle(role.value)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-900 dark:text-white">
                        {role.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recordatorios</h3>
                {isAddButtonVisible && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-transparent hover:bg-transparent text-green-500 hover:text-green-400 font-medium py-1.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 no-underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Agregando...' : 'Agregar'}
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full overflow-hidden">
                  <thead className="bg-gray-200 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Evento</th>
                      <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                      <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roles</th>
                      <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {reminders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                          No hay recordatorios registrados
                        </td>
                      </tr>
                    ) : (
                      reminders.map((reminder) => (
                        <tr key={reminder.id}>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {reminder.evento}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(reminder.fecha)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                              {formatRoles(reminder.allowed_roles)}
                            </span>
                          </td>
                          <td className="px-1 py-2 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(reminder.id)}
                              disabled={deleteLoading === reminder.id}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Eliminar recordatorio"
                            >
                              {deleteLoading === reminder.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                              ) : (
                                <FaTrash className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});