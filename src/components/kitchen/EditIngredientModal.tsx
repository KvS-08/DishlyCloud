import { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md';
import { useBusinessSettings } from '../../hooks/useBusinessSettings';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import Portal from '../ui/Portal';

interface InventoryItem {
  id: string;
  created_at: string;
  name: string;
  quantity: number;
  unit: string;
  min_stock_level: number;
  cost_per_unit: number;
  business_id: string;
  idp?: string;
  costo_pedido?: number;

  stock_actual?: number | null;
  fecha_agregado?: string;
}

interface EditIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: InventoryItem | null;
  onIngredientUpdated?: (ingredient: InventoryItem) => void;
}

const EditIngredientModal: React.FC<EditIngredientModalProps> = ({ 
  isOpen, 
  onClose, 
  ingredient,
  onIngredientUpdated 
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [loading, setLoading] = useState(false);
  const { settings } = useBusinessSettings();

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [idp, setIdp] = useState('');
  
  const [nombre, setNombre] = useState('');
  const [costoPedido, setCostoPedido] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');

  const [stockInicial, setStockInicial] = useState('');
  const [stockActual, setStockActual] = useState('');
  const [unidad, setUnidad] = useState('kg');
  const [minStockLevel, setMinStockLevel] = useState('');
  const [showButtonAndDivider, setShowButtonAndDivider] = useState(false);
  const initialIngredientRef = useRef<InventoryItem | null>(null);

  useEffect(() => {
    if (isOpen && ingredient) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      initialIngredientRef.current = ingredient; // Store initial ingredient
      setShowButtonAndDivider(false); // Hide button/divider initially

      // Set form values from ingredient
      setNombre(ingredient.name || '');
      setUnidad(ingredient.unit || 'kg');
      setCostoUnitario(ingredient.cost_per_unit?.toString() || '');
      setStockInicial(ingredient.quantity?.toString() || '');
      setMinStockLevel(ingredient.min_stock_level?.toString() || '');

      // Set additional fields if available
      setIdp(ingredient.idp || '');
      setCostoPedido(ingredient.costo_pedido?.toString() || '');

      setStockActual(ingredient.stock_actual !== null ? ingredient.stock_actual?.toString() || '' : ingredient.quantity?.toString() || '');
      setFecha(ingredient.fecha_agregado || new Date().toISOString().split('T')[0]);

    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, ingredient]);

  const checkFieldsForData = () => {
    if (!initialIngredientRef.current) {
      setShowButtonAndDivider(false);
      return;
    }

    const original = initialIngredientRef.current;

    const isModified =
      nombre !== (original.name || '') ||
      unidad !== (original.unit || 'kg') ||
      costoUnitario !== (original.cost_per_unit?.toString() || '') ||
      stockInicial !== (original.quantity?.toString() || '') ||
      minStockLevel !== (original.min_stock_level?.toString() || '') ||
      idp !== (original.idp || '') ||
      costoPedido !== (original.costo_pedido?.toString() || '') ||
      stockActual !== (original.stock_actual !== null ? original.stock_actual?.toString() || '' : original.quantity?.toString() || '') ||
      fecha !== (original.fecha_agregado || new Date().toISOString().split('T')[0]);

    setShowButtonAndDivider(isModified);
  };

  useEffect(() => {
    checkFieldsForData();
  }, [nombre, costoPedido, costoUnitario, stockInicial, stockActual, unidad, minStockLevel, idp, fecha]);

  const handleSave = async () => {
    if (!user?.business_id || !user?.id || !ingredient) {
      toast.error('No se encontró información del usuario o ingrediente');
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
        min_stock_level: parseFloat(minStockLevel) || parseFloat(stockInicial) * 0.2, // 20% of initial stock as minimum
        cost_per_unit: parseFloat(costoUnitario),
        // Additional fields
        idp: idp,
        costo_pedido: costoPedido ? parseFloat(costoPedido) : 0,

        stock_actual: stockActual ? parseFloat(stockActual) : parseFloat(stockInicial),
        fecha_agregado: fecha
      };

      const { data, error } = await supabase
        .from('inventory_items')
        .update(ingredientData)
        .eq('id', ingredient.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating ingredient:', error);
        toast.error('Error al actualizar el ingrediente');
        return;
      }

      toast.success('Ingrediente actualizado exitosamente');
      
      // Call the callback to update the parent component
      if (onIngredientUpdated) {
        onIngredientUpdated(data);
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error updating ingredient:', error);
      toast.error('Error al actualizar el ingrediente');
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
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-lg font-bold mb-0 dark:text-white">Editar Ingrediente</h2>
          {showButtonAndDivider && (
            <hr className="mb-3 border-gray-300 dark:border-gray-600" />
          )}
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
                onChange={(e) => setIdp(e.target.value)}
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
            <div>
              <label htmlFor="minStockLevel" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nivel Mínimo de Stock</label>
              <input 
                type="number" 
                id="minStockLevel" 
                value={minStockLevel} 
                onChange={(e) => {setMinStockLevel(e.target.value); checkFieldsForData();}} 
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
              {showButtonAndDivider && (
            <div className="mt-1 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-1.5 py-0.5 bg-green-600 text-white p-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default EditIngredientModal;