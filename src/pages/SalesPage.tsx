import React, { useState, useEffect, lazy, Suspense } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { NotificationBell } from '../components/ui/NotificationBell';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';

const CreateOrder = lazy(() => import('../components/pos/CreateOrder'));

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
  stock_status?: 'normal' | 'low' | 'out';
}

interface SelectedProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface InventoryItem {
  id: string;
  inventory_item_id: string;
  quantity: number;
  stock_actual: number | null;
  initial_quantity: number;
}

const SalesPage = () => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<Map<string, InventoryItem[]>>(new Map());

  // Load categories and menu items when component mounts
  useEffect(() => {
    if (user?.business_id) {
      loadCategories();
      loadMenuItems();
      loadInventoryItems();
      checkCashRegisterStatus();
    }
  }, [user?.business_id]);

  const checkCashRegisterStatus = async () => {
    if (!user?.business_id) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayISOString = today.toISOString();
      const tomorrowISOString = tomorrow.toISOString();

      const { data, error } = await supabase
        .from('aperturas')
        .select('*')
        .eq('business_id', user.business_id)
        .eq('estado', 'abierta')
        .gte('fecha', todayISOString)
        .lt('fecha', tomorrowISOString)
        .limit(1);

      if (error) {
        console.error('Error checking cash register status:', error);
        return;
      }

      setIsCashRegisterOpen(data && data.length > 0);
    } catch (error) {
      console.error('Error checking cash register status:', error);
    }
  };

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

  const loadInventoryItems = async () => {
    if (!user?.business_id) return;

    try {
      // First get all inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('id, quantity, stock_actual')
        .eq('business_id', user.business_id);

      if (inventoryError) {
        console.error('Error loading inventory items:', inventoryError);
        return;
      }

      // Create a map of inventory items for quick lookup
      const inventoryMap = new Map();
      inventoryData?.forEach(item => {
        inventoryMap.set(item.id, {
          id: item.id,
          initial_quantity: item.quantity,
          stock_actual: item.stock_actual !== null ? item.stock_actual : item.quantity
        });
      });

      // Get recipe data for menu items
      const { data: recipeData, error: recipeError } = await supabase
        .from('recetas')
        .select('menu_item_id, inventory_item_id, quantity')
        .eq('business_id', user.business_id);

      if (recipeError) {
        console.error('Error loading recipe data:', recipeError);
        return;
      }

      // Group recipes by menu item
      const recipesByMenuItem = new Map<string, InventoryItem[]>();
      recipeData?.forEach(recipe => {
        const inventoryItem = inventoryMap.get(recipe.inventory_item_id);
        if (inventoryItem) {
          if (!recipesByMenuItem.has(recipe.menu_item_id)) {
            recipesByMenuItem.set(recipe.menu_item_id, []);
          }
          recipesByMenuItem.get(recipe.menu_item_id)?.push({
            id: recipe.menu_item_id,
            inventory_item_id: recipe.inventory_item_id,
            quantity: recipe.quantity,
            stock_actual: inventoryItem.stock_actual,
            initial_quantity: inventoryItem.initial_quantity
          });
        }
      });

      // If no recipe data, try to get from menu_item_ingredients
      if (recipeData?.length === 0) {
        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from('menu_item_ingredients')
          .select('menu_item_id, inventory_item_id, quantity')
          .eq('menu_item_id', 'in', menuItems.map(item => item.id));

        if (ingredientsError) {
          console.error('Error loading ingredients data:', ingredientsError);
          return;
        }

        ingredientsData?.forEach(ingredient => {
          const inventoryItem = inventoryMap.get(ingredient.inventory_item_id);
          if (inventoryItem) {
            if (!recipesByMenuItem.has(ingredient.menu_item_id)) {
              recipesByMenuItem.set(ingredient.menu_item_id, []);
            }
            recipesByMenuItem.get(ingredient.menu_item_id)?.push({
              id: ingredient.menu_item_id,
              inventory_item_id: ingredient.inventory_item_id,
              quantity: ingredient.quantity,
              stock_actual: inventoryItem.stock_actual,
              initial_quantity: inventoryItem.initial_quantity
            });
          }
        });
      }

      setInventoryItems(recipesByMenuItem);
      updateMenuItemsStockStatus(recipesByMenuItem);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    }
  };

  const updateMenuItemsStockStatus = (recipesByMenuItem: Map<string, InventoryItem[]>) => {
    setMenuItems(prevItems => {
      return prevItems.map(item => {
        const ingredients = recipesByMenuItem.get(item.id) || [];
        
        // If no ingredients, assume normal stock
        if (ingredients.length === 0) {
          return { ...item, stock_status: 'normal' };
        }

        // Check if any ingredient is out of stock
        const hasOutOfStock = ingredients.some(ing => 
          ing.stock_actual !== null && ing.stock_actual <= 0
        );

        if (hasOutOfStock) {
          return { ...item, stock_status: 'out' };
        }

        // Check if any ingredient is low on stock (below 30%)
        const hasLowStock = ingredients.some(ing => {
          if (ing.stock_actual === null) return false;
          const initialQuantity = ing.initial_quantity || 0;
          return ing.stock_actual > 0 && ing.stock_actual <= initialQuantity * 0.3;
        });

        if (hasLowStock) {
          return { ...item, stock_status: 'low' };
        }

        return { ...item, stock_status: 'normal' };
      });
    });
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
        .eq('is_available', true)
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

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
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

  const handleProductClick = (item: MenuItem) => {
    // Don't allow selecting out of stock items
    if (item.stock_status === 'out') {
      toast.error('Este producto está agotado');
      return;
    }
    
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      newMap.set(item.id, (newMap.get(item.id) || 0) + 1);
      return newMap;
    });
  };

  const handleProductDecrease = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(itemId) || 0;
      if (currentCount > 1) {
        newMap.set(itemId, currentCount - 1);
      } else {
        newMap.delete(itemId);
      }
      return newMap;
    });
  };

  const handleCreateOrderClick = () => {
    if (!isCashRegisterOpen) {
      toast.error('Debes aperturar la caja en POS');
      return;
    }
    setIsModalOpen(true);
  };

  // Reset selected products after order creation
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProducts(new Map()); // Clear selected products
  };

  // Get selected products with details
  const getSelectedProductsDetails = (): SelectedProduct[] => {
    const selectedDetails: SelectedProduct[] = [];
    selectedProducts.forEach((quantity, productId) => {
      if (quantity > 0) {
        const product = menuItems.find(item => item.id === productId);
        if (product) {
          selectedDetails.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
          });
        }
      }
    });
    return selectedDetails;
  };

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems;

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
        <div class="hidden md:flex items-center space-x-0">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Productos</h2>
        <button
          onClick={handleCreateOrderClick}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-2 rounded"
        >
          Crear Orden
        </button>
      </div>

      {/* Products Card */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Draggable Categories Section - Above the divider */}
            {categories.length > 0 && (
              <div className="mb-3">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="categories" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-wrap gap-1 md:gap-1"
                      >
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors md:px-1.5 md:py-0.5 md:text-xs ${
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
                                  className={`px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors md:px-3 md:py-1 md:text-xs ${
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
            
            {/* Divider */}
            <hr className="border-gray-300 dark:border-gray-600" />
            
            {/* Products Section - Below the divider */}
            <div className="mt-3">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>
                    {selectedCategory 
                      ? 'No hay productos en esta categoría.' 
                      : 'No hay productos disponibles para la venta.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredMenuItems.map((item) => {
                    const quantity = selectedProducts.get(item.id) || 0;
                    const isSelected = quantity > 0;
                    
                    // Determine background color based on stock status
                    let stockColorClass = '';
                    if (item.stock_status === 'low') {
                      stockColorClass = 'bg-yellow-50 dark:bg-yellow-900/20';
                    } else if (item.stock_status === 'out') {
                      stockColorClass = 'bg-red-50 dark:bg-red-900/20';
                    }
                    
                    return (
                      <div
                        key={item.id}
                        className={`relative bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : stockColorClass
                        } ${item.stock_status === 'out' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleProductClick(item)}
                      >
                        {/* Quantity Counter - Always visible when selected */}
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1.5 z-20">
                            <div className="bg-transparent dark:text-yellow-500 text-black rounded-full h-8 w-8 flex items-center justify-center text-base font-bold" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                              {quantity}
                            </div>
                          </div>
                        )}

                        {/* Decrease Button - Only visible when selected */}
                        {isSelected && (
                          <button
                              className="absolute -top-2 -left-2 bg-transparent text-red-500 rounded-full h-8 w-8 flex items-center justify-center text-lg font-bold z-20 hover:text-red-600 transition-colors"
                              onClick={(e) => handleProductDecrease(item.id, e)}
                            >
                              x
                            </button>
                        )}

                        {/* Stock Status Indicator */}
                        {item.stock_status === 'low' && (
                          <div className="absolute top-0.5 left-0.5 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                            Bajo
                          </div>
                        )}
                        {item.stock_status === 'out' && (
                          <div className="absolute top-0.5 left-0.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            Agotado
                          </div>
                        )}

                        {/* Product Price */}
                        <span className="absolute top-0.5 right-0.5 text-xs font-bold text-gray-700 dark:text-white bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
                          {formatCurrency(item.price)}
                        </span>

                        {/* Product Image */}
                        <div className="w-full h-24 mb-2 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-600">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight text-center">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <CreateOrder 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          selectedProducts={getSelectedProductsDetails()}
          tipPercentage={settings?.tip_percentage || 0}
          taxPercentage={settings?.tax_percentage || 0}
          currency={settings?.currency || 'HNL'}
        />
      </Suspense>
    </div>
  );
};

export default SalesPage;