import React, { useState, useEffect } from 'react';
import Portal from '../ui/Portal';
import { FaTimes } from 'react-icons/fa';
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md';
import { useBusinessSettings } from '../../hooks/useBusinessSettings';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AddIngredientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngredientAdded?: (ingredient: any) => void;
}

const AddIngredientsModal: React.FC<AddIngredientsModalProps> = ({ 
  isOpen, 
  onClose, 
  onIngredientAdded 
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [loading, setLoading] = useState(false);

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [idp, setIdp] = useState('');
  const { settings } = useBusinessSettings();

  const [nombre, setNombre] = useState('');
  const [costoPedido, setCostoPedido] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');

  const [stockInicial, setStockInicial] = useState('');
  const [stockActual, setStockActual] = useState('');
  const [unidad, setUnidad] = useState('kg');
  const [showButtonAndDivider, setShowButtonAndDivider] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      generateIDP();
      // Reset form
      setNombre('');
      setCostoPedido('');
      setCostoUnitario('');

      setStockInicial('');
      setStockActual('');
      setUnidad('kg');
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const generateIDP = () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const lastIdpDate = localStorage.getItem('lastIdpDate');
    const lastIdpCounter = parseInt(localStorage.getItem('lastIdpCounter') || '0');

    let currentCounter = lastIdpCounter;

    if (lastIdpDate) {
      const [lastYear, lastMonth] = lastIdpDate.split('-');
      if (parseInt(lastYear) !== today.getFullYear() || parseInt(lastMonth) !== (today.getMonth() + 1)) {
        currentCounter = 1;
      } else {
        currentCounter++;
      }
    } else {
      currentCounter = 1;
    }

    const formattedCounter = currentCounter.toString().padStart(2, '0');
    setIdp(`${year}${month}${formattedCounter}`);

    localStorage.setItem('lastIdpDate', `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`);
    localStorage.setItem('lastIdpCounter', currentCounter.toString());
  };

  const checkFieldsForData = () => {
    if (nombre || costoPedido || costoUnitario || stockInicial || stockActual) {
      setShowButtonAndDivider(true);
    } else {
      setShowButtonAndDivider(false);
    }
  };

  useEffect(() => {
    checkFieldsForData();
  }, [nombre, costoPedido, costoUnitario, stockInicial, stockActual]);

  const handleSave = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (!nombre.trim()) {
      toast.error('El nombre del ingrediente es requerido');
      return;
    }

    if (!stockInicial || parseFloat(stockInicial) <= 0) {
      toast.error('El stock inicial debe ser mayor a 0');
      return;
    }

    if (!costoUnitario || parseFloat(costoUnitario) <= 0) {
      toast.error('El costo unitario debe ser mayor a 0');
      return;
    }

    setLoading(true);

    try {
      const ingredientData = {
        name: nombre.trim(),
        quantity: parseFloat(stockInicial),
        unit: unidad,
        min_stock_level: parseFloat(stockInicial) * 0.2, // 20% of initial stock as minimum
        cost_per_unit: parseFloat(costoUnitario),
        business_id: user.business_id,
        // Additional fields that aren't in the standard schema
        idp: idp,
        costo_pedido: costoPedido ? parseFloat(costoPedido) : 0,

        stock_actual: stockActual ? parseFloat(stockActual) : parseFloat(stockInicial),
        fecha_agregado: fecha
      };

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([ingredientData])
        .select()
        .single();

      if (error) {
        console.error('Error saving ingredient:', error);
        toast.error('Error al guardar el ingrediente');
        return;
      }

      toast.success('Ingrediente agregado exitosamente');
      
      // Call the callback to update the parent component
      if (onIngredientAdded) {
        onIngredientAdded(data);
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error saving ingredient:', error);
      toast.error('Error al guardar el ingrediente');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <Portal>
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ${animationClass}`}>
        <div className="bg-white dark:bg-gray-800 px-6 pb-3 p-5 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-lg font-bold mb-1 dark:text-white">Agregar Ingrediente</h2>
          <hr className="mb-4 border-gray-300 dark:border-gray-600" />
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input 
                type="date" 
                id="fecha" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-2 py-0.5 text-xs" 
              />
            </div>
            <div>
              <label htmlFor="idp" className="block text-xs font-medium text-gray-700 dark:text-gray-300">IDP</label>
              <input 
                type="text" 
                id="idp" 
                value={idp} 
                readOnly 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 pl-2 py-0.5 text-xs" 
              />
            </div>
            <div className="relative">
              <label htmlFor="nombre" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nombre</label>
              <div className="relative mt-1">
                <input 
                  type="text" 
                  id="nombre" 
                  value={nombre} 
                  onChange={(e) => {setNombre(e.target.value); checkFieldsForData();}} 
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-7 pr-3 py-0.5 text-xs" 
                  placeholder="Ej: Tomate"
                />
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <MdOutlineDriveFileRenameOutline className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="unidad" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Unidad</label>
              <select
                id="unidad"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-2 py-0.5 text-xs"
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="l">Litros (l)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="unidad">Unidades</option>
                <option value="paquete">Paquetes</option>
                <option value="caja">Cajas</option>
              </select>
            </div>
            <div>
              <label htmlFor="costoPedido" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Costo Pedido</label>
              <div className="relative">
                <input 
                  type="number" 
                  id="costoPedido" 
                  value={costoPedido} 
                  onChange={(e) => {setCostoPedido(e.target.value); checkFieldsForData();}} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-10 pr-3 py-0.5 text-xs" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-white text-xs">{settings?.currency || 'HNL'}</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="costoUnitario" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Costo Unitario</label>
              <div className="relative">
                <input 
                  type="number" 
                  id="costoUnitario" 
                  value={costoUnitario} 
                  onChange={(e) => {setCostoUnitario(e.target.value); checkFieldsForData();}} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-10 pr-3 py-0.5 text-xs" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-white text-xs">{settings?.currency || 'HNL'}</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="stockInicial" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Stock Inicial</label>
              <input 
                type="number" 
                id="stockInicial" 
                value={stockInicial} 
                onChange={(e) => {
                  setStockInicial(e.target.value); 
                  if (!stockActual) setStockActual(e.target.value); // Auto-fill stock actual
                  checkFieldsForData();
                }} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-2 py-0.5 text-xs" 
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="stockActual" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Stock Actual</label>
              <input 
                type="number" 
                id="stockActual" 
                value={stockActual} 
                onChange={(e) => {setStockActual(e.target.value); checkFieldsForData();}} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-2 py-0.5 text-xs" 
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          {showButtonAndDivider && (
            <>
              <hr className="my-2 border-gray-300 dark:border-gray-600" />
              <div className="mt-0 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="text-green-600 hover:text-green-500 dark:text-green-500 dark:hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default AddIngredientsModal;