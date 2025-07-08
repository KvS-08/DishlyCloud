import React, { useState, useCallback, useEffect } from 'react';
import { FaUser, FaLock, FaUserCog, FaEdit, FaTrash } from 'react-icons/fa';
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronUp } from 'react-icons/fa';
import { FaUsers } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import ChangePasswordModal from './ChangePasswordModal';

interface Employee {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface ConfigurarEmpleadosProps {
  // Define any props if needed
}

export const ConfigurarEmpleados = React.memo(({}: ConfigurarEmpleadosProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeRole, setEmployeeRole] = useState('');
  const [employeeUsername, setEmployeeUsername] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Load employees when component expands
  useEffect(() => {
    if (isExpanded && user?.business_id) {
      loadEmployees();
    }
  }, [isExpanded, user?.business_id]);

  const loadEmployees = async () => {
    if (!user?.business_id) return;

    setLoadingEmployees(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, username, email, role, is_active, created_at')
        .eq('business_id', user.business_id)
        .neq('id', user.id) // Exclude current user
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading employees:', error);
        toast.error('Error al cargar empleados');
        return;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const toggleAccordion = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSave = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (!employeeName.trim() || !employeeRole.trim() || !employeePassword.trim() || !employeeEmail.trim()) {
      toast.error('Por favor completa los campos obligatorios (nombre, rol, email y contraseña)');
      return;
    }

    if (employeePassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validate email
    if (!validateEmail(employeeEmail)) {
      toast.error('El formato del correo electrónico es inválido');
      return;
    }

    // Validate username if provided
    if (employeeUsername && employeeUsername.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('No se encontró sesión activa');
        setLoading(false);
        return;
      }

      // Prepare the request body
      const requestBody: any = {
        full_name: employeeName.trim(),
        password: employeePassword,
        role: employeeRole,
        business_id: user.business_id,
        email: employeeEmail.trim()
      };
      
      if (employeeUsername) {
        requestBody.username = employeeUsername.trim();
      }

      // Call the edge function to create the employee
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-employee`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el empleado');
      }

      // Add the new employee to the list
      setEmployees(prev => [result.user, ...prev]);
      
      // Clear the form
      setEmployeeName('');
      setEmployeeRole('');
      setEmployeeUsername('');
      setEmployeeEmail('');
      setEmployeePassword('');
      
      toast.success('Empleado agregado exitosamente');
      
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast.error(error.message || 'Error inesperado al guardar el empleado');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      return;
    }

    setDeleteLoading(employeeId);

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('No se encontró sesión activa');
        setDeleteLoading(null);
        return;
      }

      // Call the edge function to delete the employee
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-employee`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar el empleado');
      }

      // Remove the employee from the list
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      
      toast.success('Empleado eliminado exitosamente');
      
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast.error(error.message || 'Error al eliminar el empleado');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditPassword = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsPasswordModalOpen(true);
  };

  const showSaveSection = employeeName && employeeRole && employeePassword && employeeEmail;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-4">
        <button
          className="flex justify-between items-center w-full p-4 text-left text-gray-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={toggleAccordion}
        >
          <span className="flex items-center">
            <FaUsers className="w-5 h-5 mr-2" />
            Configurar Empleados
          </span>
          <FaChevronUp className={`w-4 h-4 transform transition-transform duration-200 ${!isExpanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-b-lg p-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="employeeName" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <MdOutlineDriveFileRenameOutline className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="employeeName"
                      className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Juan Pérez"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="employeeRole" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Rol *</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <FaUserCog className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <select
                      id="employeeRole"
                      className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={employeeRole}
                      onChange={(e) => setEmployeeRole(e.target.value)}
                    >
                      <option value="">Escoge un rol</option>
                      <option value="admin">Admin</option>
                      <option value="cashier">Cajero</option>
                      <option value="chef">Cocinero</option>
                      <option value="waiter">Mesero</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="employeeUsername" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Usuario</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <FaUser className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="employeeUsername"
                      className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: juan.perez"
                      value={employeeUsername}
                      onChange={(e) => setEmployeeUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="employeeEmail" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Correo *</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <FaUser className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="employeeEmail"
                      className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: juan@ejemplo.com"
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="employeePassword" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Contraseña *</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <FaLock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="employeePassword"
                      className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="********"
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="p-0 mt-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Empleados Registrados</h3>
                  {showSaveSection && (
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
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-200 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                        <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                        <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                        <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Correo</th>
                        <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                        <th scope="col" className="px-1 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {loadingEmployees ? (
                        <tr>
                          <td colSpan={6} className="px-1 py-4 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                          </td>
                        </tr>
                      ) : employees.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-1 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                            No hay empleados registrados
                          </td>
                        </tr>
                      ) : (
                        employees.map((employee) => (
                          <tr key={employee.id}>
                            <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {employee.full_name}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {employee.role === 'admin' ? 'Admin' :
                               employee.role === 'cashier' ? 'Cajero' :
                               employee.role === 'chef' ? 'Cocinero' :
                               employee.role === 'waiter' ? 'Mesero' : employee.role}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {employee.username || '-'}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {employee.email || '-'}
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                employee.is_active 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {employee.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-1 py-2 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditPassword(employee)}
                                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Cambiar contraseña"
                                >
                                  <FaEdit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(employee.id)}
                                  disabled={deleteLoading === employee.id}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Eliminar empleado"
                                >
                                  {deleteLoading === employee.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                                  ) : (
                                    <FaTrash className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
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

      {/* Change Password Modal */}
      {selectedEmployee && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setSelectedEmployee(null);
          }}
          userId={selectedEmployee.id}
          userName={selectedEmployee.full_name}
        />
      )}
    </>
  );
});