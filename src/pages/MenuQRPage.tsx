import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useBusinessSettings } from '../hooks/useBusinessSettings';

interface Category {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
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

const MenuQRPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [promocionesCategoryId, setPromocionesCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  // Load categories and menu items when component mounts
  useEffect(() => {
    // For public access, we need to get business info from URL params or other means
    // For now, we'll load from the current user's business if available
    if (user?.business_id) {
      loadBusinessInfo();
      loadCategories();
      loadMenuItems();
    }
  }, [user?.business_id]);

  const loadBusinessInfo = async () => {
    if (!user?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('name, logo_url, address, phone, email')
        .eq('id', user.business_id)
        .single();

      if (error) {
        console.error('Error loading business info:', error);
        return;
      }

      setBusinessInfo(data);
    } catch (error) {
      console.error('Error loading business info:', error);
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

      const promocionesCat = data?.find(cat => cat.name === 'Promociones');
      if (promocionesCat) {
        setPromocionesCategoryId(promocionesCat.id);
      }

      setCategories(data ? data.filter(cat => cat.name !== 'Promociones') : []);
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

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'HNL';
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category_id === selectedCategory && item.category_id !== promocionesCategoryId)
    : menuItems.filter(item => item.category_id !== promocionesCategoryId);



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 container mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-1 py-3 mx-auto">
          <div className="flex items-center">
            {businessInfo?.logo_url && (
              <img 
                src={businessInfo.logo_url} 
                alt="Logo" 
                className="max-h-24 max-w-24 object-contain rounded-lg"
              />
            )}
            <div>
              <h1 className="ml-2 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {businessInfo?.name || 'Nuestro Menú'}
              </h1>
              {businessInfo?.address && (
                <p className="ml-2 text-xs text-gray-600 dark:text-gray-400">{businessInfo.address}</p>
              )}
              {businessInfo?.phone && (
                <p className="ml-2 text-xs text-gray-600 dark:text-gray-400">{businessInfo.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 py-1 mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-3">
                {/* <h2 className="text-lg font-bold mb-2 dark:text-white">Promociones</h2> */}

                <h2 className="text-lg font-bold mb-2 dark:text-white">Promociones</h2>
                <div className="flex overflow-x-auto space-x-2 pb-2 mb-1.5">
                  {menuItems
                    .filter(item => item.category_id === promocionesCategoryId)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex-none w-64 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                      >
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
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm text-left w-full md:text-left md:w-auto">
                              {item.name}
                            </h3>
                            <span className="text-xs bg-gray-100 text-green-500 dark:bg-gray-600 dark:text-green-400 px-1 py-0.5 rounded-md whitespace-nowrap">
                              {item.preparation_time} min
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                              {item.description}
                            </p>
                          )}
                          <span className="absolute top-0 right-0.5 text-xs font-bold text-gray-700 dark:text-white bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === null
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    Todas ({menuItems.filter(item => item.category_id !== promocionesCategoryId).length})
                  </button>
                  {categories.map((category) => {
                    const categoryItemCount = menuItems.filter(item => item.category_id === category.id).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {category.name} ({categoryItemCount})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Menu Items */}
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {selectedCategory 
                    ? 'No hay productos disponibles en esta categoría' 
                    : 'No hay productos disponibles en el menú'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
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
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm text-left w-full md:text-left md:w-auto">
                          {item.name}
                        </h3>
                        <span className="text-xs bg-gray-100 text-green-500 dark:bg-gray-600 dark:text-green-400 px-1 py-0.5 rounded-md whitespace-nowrap">
                          {item.preparation_time} min
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                          {item.description}
                        </p>
                      )}
                      
                      <span className="absolute top-0 right-0.5 text-xs font-bold text-gray-700 dark:text-white bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>


    </div>
  );
};

export default MenuQRPage;