import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LiaQrcodeSolid } from 'react-icons/lia';
import { NotificationBell } from '../components/ui/NotificationBell';
import React, { useState, lazy, Suspense, useEffect } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MenuQRModal from '../components/kitchen/MenuQRModal';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const AddCategoriesModal = lazy(() => import('../components/kitchen/AddCategoriesModal'));
const AddProductsModal = lazy(() => import('../components/kitchen/AddProductsModal'));
const EditProductModal = lazy(() => import('../components/kitchen/EditProductModal'));

interface Category {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  order_index?: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  preparation_time: number;
  image_url: string | null;
  is_available: boolean;
  category_id: string;
  created_at: string;
  category?: {
    name: string;
  };
}

const MenuPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isMenuQRModalOpen, setIsMenuQRModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Load categories and menu items when component mounts
  useEffect(() => {
    if (user?.business_id) {
      loadCategories();
      loadMenuItems();
    }
  }, [user?.business_id]);

  const loadCategories = async () => {
    if (!user?.business_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', user.business_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      // Add order_index if not present
      const categoriesWithOrder = (data || []).map((cat, index) => ({
        ...cat,
        order_index: cat.order_index || index
      }));

      // Sort by order_index
      categoriesWithOrder.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      setCategories(categoriesWithOrder);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    if (!user?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('business_id', user.business_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading menu items:', error);
        return;
      }

      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleOpenAddCategoryModal = () => {
    setIsAddCategoryModalOpen(true);
  };

  const handleCloseAddCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
  };

  const handleOpenAddProductModal = () => {
    setIsAddProductModalOpen(true);
  };

  const handleCloseAddProductModal = () => {
    setIsAddProductModalOpen(false);
  };

  const handleCategoryAdded = (newCategory: Category) => {
    setCategories(prev => [{ ...newCategory, order_index: prev.length }, ...prev]);
  };

  const handleProductAdded = (newProduct: MenuItem) => {
    setMenuItems(prev => [newProduct, ...prev]);
  };

  const handleProductUpdated = (updatedProduct: MenuItem) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === updatedProduct.id ? updatedProduct : item
      )
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleProductClick = (product: MenuItem) => {
    setSelectedProduct(product);
    setIsEditProductModalOpen(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order_index for all categories
    const updatedCategories = items.map((cat, index) => ({
      ...cat,
      order_index: index
    }));

    setCategories(updatedCategories);

    // Save the new order to the database (you might want to add an order_index column to categories table)
    // For now, we'll just update the local state
    // In a real implementation, you'd want to save this to the database
  };

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'HNL';
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Filter menu items based on selected category and availability
  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

  return (
    <div className="space-y-6 md:ml-32 pt-4 md:pt-0 md:-mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-lg md:text-2xl font-bold">
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
        <div>
          <div className="flex items-center">
            <NotificationBell />
            <LiaQrcodeSolid
              className="w-6 h-6 cursor-pointer text-gray-600 dark:text-gray-300"
              onClick={() => setIsMenuQRModalOpen(true)}
            />
            <ThemeToggle className="hidden md:block" />
          </div>
                          

        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Menú</h2>
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-1 rounded text-xs md:py-2 md:px-2 md:text-sm"
            onClick={handleOpenAddProductModal}
          >
            Agregar Producto
          </button>
          <button
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-1 rounded text-xs md:py-2 md:px-2 md:text-sm"
            onClick={handleOpenAddCategoryModal}
          >
            Agregar Categoría
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Draggable Category Buttons */}
            {categories.length > 0 && (
              <div className="mb-3">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="categories" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-wrap gap-1"
                      >
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`px-2 py-1 rounded-full text-xs md:px-2 md:py-1 md:text-sm font-medium transition-colors ${
                            selectedCategory === null
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                          }`}
                        >
                          Todas ({menuItems.length})
                        </button>
                        {categories.map((category, index) => {
                          const categoryItemCount = menuItems.filter(item => item.category_id === category.id).length;
                          return (
                            <Draggable key={category.id} draggableId={category.id} index={index}>
                              {(provided, snapshot) => (
                                <button
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => handleCategoryClick(category.id)}
                                  className={`px-1.5 py-1 rounded-full text-xs md:px-1.5 md:py-1 md:text-sm font-medium transition-colors ${
                                    selectedCategory === category.id
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                                  } ${
                                    snapshot.isDragging ? 'shadow-lg scale-105' : ''
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                                  }}
                                >
                                  {category.name} ({categoryItemCount})
                                </button>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
            
            <hr className="border-gray-300 dark:border-gray-600" />
            
            {/* Menu Items Section */}
            <div className="mt-3">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>
                    {selectedCategory 
                      ? 'No hay productos en esta categoría' 
                      : 'No hay productos en el menú. Agrega tu primer producto.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                      onClick={() => handleProductClick(item)}
                    >
                      {/* Product Image */}
                      {item.image_url && (
                        <div className="w-full h-20 mb-1 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-600">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Product Info */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-xs text-center w-full md:text-left md:w-auto md:text-sm">
                            {item.name}
                          </h3>
                          <span className="hidden md:block text-xs bg-gray-100 text-green-500 dark:bg-gray-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                            {item.preparation_time} min
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="hidden md:flex text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        
                        <span className="absolute top-0 right-0.5 text-xs md:text-xs font-bold text-gray-700 dark:text-white bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
                          {formatCurrency(item.price)}
                        </span>
                        

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        {/* AddCategoriesModal will be rendered here */}
        <AddCategoriesModal
          isOpen={isAddCategoryModalOpen}
          onClose={handleCloseAddCategoryModal}
          onCategoryAdded={handleCategoryAdded}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <MenuQRModal
          isOpen={isMenuQRModalOpen}
          onClose={() => setIsMenuQRModalOpen(false)}
        />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        {/* AddProductsModal will be rendered here */}
        <AddProductsModal
          isOpen={isAddProductModalOpen}
          onClose={handleCloseAddProductModal}
          onProductAdded={handleProductAdded}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        {/* EditProductModal will be rendered here */}
        {selectedProduct && (
          <EditProductModal
            isOpen={isEditProductModalOpen}
            onClose={() => {
              setIsEditProductModalOpen(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
            onProductUpdated={handleProductUpdated}
          />
        )}
      </Suspense>
    </div>
  );
};

export default MenuPage;