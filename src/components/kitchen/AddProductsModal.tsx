import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { IoFastFoodSharp } from 'react-icons/io5';
import { MdAccessTime, MdStickyNote2 } from 'react-icons/md';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { PiBowlFoodFill } from 'react-icons/pi';
import Portal from '../ui/Portal';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useBusinessSettings } from '../../hooks/useBusinessSettings';
import toast from 'react-hot-toast';

interface AddProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: (product: any) => void;
}

interface Category {
  id: string;
  name: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

interface IngredientQuantity {
  [key: string]: number;
}

const AddProductsModal: React.FC<AddProductsModalProps> = ({ 
  isOpen, 
  onClose, 
  onProductAdded 
}) => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const [showModal, setShowModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [productName, setProductName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productType, setProductType] = useState('individual');
  const [ingredientQuantities, setIngredientQuantities] = useState<IngredientQuantity>({});

  // Data from database
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [isButtonVisible, setIsButtonVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setAnimationClass('modal-slide-in');
      loadCategories();
      loadIngredients();
      // Reset form
      resetForm();
    } else {
      setAnimationClass('modal-slide-out');
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const resetForm = () => {
    setProductName('');
    setSelectedCategory('');
    setPreparationTime('');
    setProductPrice('');
    setDescription('');
    setSelectedIngredients([]);
    setProductImage(null);
    setImagePreview(null);
    setProductType('individual');
    setIngredientQuantities({});
  };

  const loadCategories = async () => {
    if (!user?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('business_id', user.business_id)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadIngredients = async () => {
    if (!user?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, unit')
        .eq('business_id', user.business_id)
        .order('name');

      if (error) {
        console.error('Error loading ingredients:', error);
        return;
      }

      setIngredients(data || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast.error('El tamaño del archivo no debe exceder 1MB.');
        return;
      }
      
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProductImage = async (): Promise<string | null> => {
    if (!productImage || !user?.business_id) return null;

    try {
      const fileExt = productImage.name.split('.').pop();
      const fileName = `${user.business_id}/products/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-logos') // Using the same bucket for now
        .upload(fileName, productImage);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('business-logos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleIngredientToggle = (ingredientId: string) => {
    setSelectedIngredients(prev => {
      if (prev.includes(ingredientId)) {
        // Remove ingredient
        const newSelected = prev.filter(id => id !== ingredientId);
        
        // Also remove from quantities
        const newQuantities = { ...ingredientQuantities };
        delete newQuantities[ingredientId];
        setIngredientQuantities(newQuantities);
        
        return newSelected;
      } else {
        // Add ingredient with default quantity of 1
        if (productType === 'compuesto') {
          setIngredientQuantities(prev => ({
            ...prev,
            [ingredientId]: 1
          }));
        }
        return [...prev, ingredientId];
      }
    });
  };

  const handleQuantityChange = (ingredientId: string, value: number) => {
    setIngredientQuantities(prev => ({
      ...prev,
      [ingredientId]: value
    }));
  };

  const updateButtonVisibility = () => {
    const hasRequiredFields = productName.trim() && selectedCategory && productPrice && preparationTime;
    setIsButtonVisible(!!hasRequiredFields);
  };

  useEffect(() => {
    updateButtonVisibility();
  }, [productName, selectedCategory, productPrice, preparationTime, description, selectedIngredients]);

  const handleSave = async () => {
    if (!user?.business_id || !user?.id) {
      toast.error('No se encontró información del usuario');
      return;
    }

    if (!productName.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }

    if (!selectedCategory) {
      toast.error('Debes seleccionar una categoría');
      return;
    }

    if (!productPrice || parseFloat(productPrice) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    if (!preparationTime || parseInt(preparationTime) <= 0) {
      toast.error('El tiempo de preparación debe ser mayor a 0');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      
      // Upload image if provided
      if (productImage) {
        imageUrl = await uploadProductImage();
        if (!imageUrl) {
          toast.error('Error al subir la imagen del producto');
          setLoading(false);
          return;
        }
      }

      // Create menu item
      const menuItemData = {
        name: productName.trim(),
        description: description.trim() || null,
        price: parseFloat(productPrice),
        preparation_time: parseInt(preparationTime),
        category_id: selectedCategory,
        business_id: user.business_id,
        image_url: imageUrl,
        is_available: true,
        includes_tax: false,
        product_type: productType
      };

      const { data: menuItem, error: menuError } = await supabase
        .from('menu_items')
        .insert([menuItemData])
        .select()
        .single();

      if (menuError) {
        console.error('Error saving menu item:', menuError);
        toast.error('Error al guardar el producto');
        return;
      }

      // Create recipe entries in the recetas table
      if (selectedIngredients.length > 0) {
        const recipeEntries = selectedIngredients.map(ingredientId => ({
          menu_item_id: menuItem.id,
          inventory_item_id: ingredientId,
          quantity: productType === 'compuesto' ? (ingredientQuantities[ingredientId] || 1) : 1,
          business_id: user.business_id
        }));

        const { error: recipeError } = await supabase
          .from('recetas')
          .insert(recipeEntries);

        if (recipeError) {
          console.error('Error saving recipe entries:', recipeError);
          // Don't fail the whole operation for this
        }
      }

      toast.success('Producto agregado exitosamente');
      
      // Call the callback to update the parent component
      if (onProductAdded) {
        onProductAdded(menuItem);
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <Portal>
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ${animationClass}`}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-2/3 xl:w-1/2 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
          
          <h2 className="text-lg font-bold mb-2 dark:text-white">Agregar Producto</h2>
          <hr className="mb-4 border-gray-300 dark:border-gray-600" />
          
          <div className="grid grid-cols-1 gap-4">
            {/* First Row */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              <div className="mb-2">
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre de Producto
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <IoFastFoodSharp className="h-4 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="mt-1 block w-full pl-7 pr-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-0.5"
                    placeholder="Ej. Pizza, Hamburguesa, Refresco"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categoría
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <BiSolidFoodMenu className="h-4 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <select
                    id="productCategory"
                    name="productCategory"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mt-1 block w-full pl-7 pr-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-0.5"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              <div className="mb-2">
                <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tiempo Preparación (min)
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <MdAccessTime className="h-4 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="number"
                    id="preparationTime"
                    name="preparationTime"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    className="mt-1 block w-full pl-7 pr-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-0.5"
                    placeholder="Ej. 15"
                    min="1"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Precio
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">{settings?.currency || 'HNL'}</span>
                  </div>
                  <input
                    type="number"
                    id="productPrice"
                    name="productPrice"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="mt-1 block w-full pl-10 pr-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-0.5"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label htmlFor="productType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Producto
                </label>
                <div className="relative mt-1">
                  <select
                    id="productType"
                    name="productType"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="mt-1 block w-full pl-2 pr-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white py-0.5"
                  >
                    <option value="individual">Individual</option>
                    <option value="compuesto">Compuesto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-2">
              <label htmlFor="productImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Imagen del Producto (máx. 1MB)
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {imagePreview && (
                  <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="productImageUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
                    onClick={() => document.getElementById('productImageUpload')?.click()}
                  >
                    <FaUpload className="h-4 w-4 mr-2" />
                    {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <div className="relative mt-1">
                <div className="absolute top-2 left-0 pl-1 flex items-center pointer-events-none">
                  <MdStickyNote2 className="h-4 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full pl-7 pr-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Descripción del producto"
                  rows={2}
                ></textarea>
              </div>
            </div>

            {/* Ingredients Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <PiBowlFoodFill className="inline h-4 w-5 text-gray-400 mr-1" />
                Ingredientes
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                {ingredients.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No hay ingredientes disponibles. Agrega ingredientes en la sección de inventario.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedIngredients.includes(ingredient.id)}
                            onChange={() => handleIngredientToggle(ingredient.id)}
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {ingredient.name} ({ingredient.unit})
                          </span>
                        </label>
                        
                        {/* Quantity input for compuesto type */}
                        {productType === 'compuesto' && selectedIngredients.includes(ingredient.id) && (
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={ingredientQuantities[ingredient.id] || 1}
                            onChange={(e) => handleQuantityChange(ingredient.id, parseFloat(e.target.value) || 1)}
                            className="ml-2 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isButtonVisible && (
            <hr className="mb-2 border-gray-300 dark:border-gray-600" />
          )}
          
          {isButtonVisible && (
            <div className="flex justify-end space-x-3 -mb-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="text-green-600 hover:text-green-500 no-underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default AddProductsModal;