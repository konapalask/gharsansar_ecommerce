import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS_DATA } from './productsData';

export interface Product {
  id: string;
  title: string;
  name: string;
  description: string;
  price: number;
  actPrice: number;
  image: string;
  category: string;
  subCategory: string;
  rating: number;
  reviewsCount: number;
  matchPercent: number;
  commentsCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

export interface CustomerNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'order' | 'offer' | 'delivery' | 'info';
  read: boolean;
}

type TabType = 'home' | 'explore' | 'cart' | 'wishlist' | 'account';

interface MobileAppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  toggleCartSelection: (id: string) => void;
  toggleAllCartSelections: (selected: boolean) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  products: Product[];

  // Dynamic States & Actions
  banners: any[];
  categories: any[];
  flashSale: { expiryTime: string; products: Product[] } | null;
  paginatedProducts: Product[];
  paginatedLoading: boolean;
  hasMoreProducts: boolean;
  loadMoreProducts: () => Promise<void>;
  refreshProductsFeed: () => Promise<void>;
  searchSuggestions: (query: string) => Promise<{ products: Product[]; categories: string[] }>;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  trendingSearches: string[];
  fetchBanners: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchFlashSale: () => Promise<void>;
  
  // Section loading states for skeleton loaders
  bannersLoading: boolean;
  categoriesLoading: boolean;
  flashSaleLoading: boolean;
  productsLoading: boolean;

  // Wishlist Database Sync
  fetchWishlist: () => Promise<void>;

  // Notification States
  notifications: CustomerNotification[];
  notificationsLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markNotificationsRead: (id?: string) => Promise<void>;
  clearNotifications: () => Promise<void>;

  // Recently Viewed Section
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
}

const MobileAppContext = createContext<MobileAppContextType | undefined>(undefined);

export const useMobileApp = () => {
  const context = useContext(MobileAppContext);
  if (!context) {
    throw new Error('useMobileApp must be used within a MobileAppProvider');
  }
  return context;
};

const BACKEND_URL = 'https://backend.gharsansar.store';

// Category cleaner utility to map backend category folders to customer friendly titles
export const mapCategoryLabel = (catName: string): string => {
  const mapping: { [key: string]: string } = {
    'sonu_steel_products': 'Kitchen & Steel',
    'birds_and_accessories': 'Garden & Birds',
    'KondapalliBommalu': 'Kondapalli Toys',
    'waterbottles and jars': 'Bottles & Jars',
    'self adhesive wallpaper rolls': 'Wallpaper Rolls',
    'Traditional Rajasthan idols': 'Rajasthan Decor',
    'Traditional Rajasthan Idols': 'Rajasthan Decor',
    'Garden tools and compost': 'Garden Essentials',
    'Multiple purpose mats': 'Premium Mats',
    'water fountains medium': 'Water Fountains',
    'aquarium and accesories': 'Aquarium & Accessories',
    'Aquarium & Accessories': 'Aquarium & Accessories'
  };
  return mapping[catName] || catName;
};

export const MobileAppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Dynamic content states
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [flashSale, setFlashSale] = useState<{ expiryTime: string; products: Product[] } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Loading States for Skeletons
  const [bannersLoading, setBannersLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [flashSaleLoading, setFlashSaleLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  // Pagination states
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [paginatedLoading, setPaginatedLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // Notifications states
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Recently Viewed states
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Search states
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Cello Dinner Set',
    'Rajasthan Idol',
    'Matte Black Bottle'
  ]);
  const trendingSearches = [
    'Artisanal Vase',
    'Luxe Candelabra',
    'Vacuum Flask',
    'German Silver',
    'Wall Clocks'
  ];

  // React Query Equivalent Cache Engine
  const cacheRegistry = React.useRef<{ [key: string]: { data: any; timestamp: number } }>({});
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

  const fetchWithCache = async (url: string, forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cacheRegistry.current[url] && now - cacheRegistry.current[url].timestamp < CACHE_TTL) {
      return cacheRegistry.current[url].data;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    cacheRegistry.current[url] = { data, timestamp: now };
    return data;
  };

  // Map backend product data format to mobile client format
  const mapBackendProduct = (p: any): Product => ({
    id: p.id || p.prod_id,
    title: p.title || p.name,
    name: p.name || p.title,
    description: p.description || '',
    price: Number(p.price) || 0,
    actPrice: Number(p["act-price"]) || Number(p.actual_price) || Number(p.price) || 0,
    image: p.image ? (p.image.startsWith('http') ? encodeURI(p.image) : encodeURI(`${BACKEND_URL}${p.image}`)) : '',
    category: mapCategoryLabel(p.category || ''),
    subCategory: p.subCategory || '',
    rating: Number(p.rating) || 4.2,
    reviewsCount: Number(p.reviewsCount) || 12,
    matchPercent: Number(p.matchPercent) || 85,
    commentsCount: Number(p.commentsCount) || 2
  });

  // Fetch all banners
  const fetchBanners = async () => {
    setBannersLoading(true);
    try {
      const data = await fetchWithCache(`${BACKEND_URL}/api/banners`);
      setBanners(data || []);
    } catch (err) {
      console.warn('Failed to fetch banners from API:', err);
    } finally {
      setBannersLoading(false);
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await fetchWithCache(`${BACKEND_URL}/api/products/categories`);
      if (data) {
        // Map backend category names to display labels
        const mapped = data.map((cat: any) => ({
          ...cat,
          name: mapCategoryLabel(cat.name),
          count: cat.count || 0
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.warn('Failed to fetch categories from API:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch flash sale items
  const fetchFlashSale = async () => {
    setFlashSaleLoading(true);
    try {
      const data = await fetchWithCache(`${BACKEND_URL}/api/flashsale`);
      if (data) {
        setFlashSale({
          expiryTime: data.expiryTime,
          products: (data.products || []).map(mapBackendProduct)
        });
      }
    } catch (err) {
      console.warn('Failed to fetch flashsale from API:', err);
    } finally {
      setFlashSaleLoading(false);
    }
  };

  // Fetch general products (fallback / full list)
  const fetchAllProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await fetchWithCache(`${BACKEND_URL}/api/products`);
      if (data) {
        const flatList: Product[] = [];
        data.forEach((cat: any, catIdx: number) => {
          cat.subcategories?.forEach((sub: any, subIdx: number) => {
            const itemKey = sub.images ? "images" : sub.products ? "products" : "services";
            const items = sub[itemKey] || [];
            items.forEach((item: any, idx: number) => {
              const generatedId = item.prod_id || item.id || `prod_${catIdx}_${subIdx}_${idx}`;
              flatList.push(mapBackendProduct({
                ...item,
                id: generatedId,
                prod_id: generatedId,
                category: cat.name,
                subCategory: sub.name
              }));
            });
          });
        });
        setProducts(flatList);

        // Pre-populate cart default item if cart empty
        if (flatList.length > 1 && cart.length === 0) {
          setCart([
            {
              product: flatList[1],
              quantity: 1,
              selected: true
            }
          ]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch general product list:', err);
      // Hard fallback to local data if server down
      const fallbackList = PRODUCTS_DATA.map(p => ({
        ...p,
        image: p.image ? (p.image.startsWith('http') ? encodeURI(p.image) : encodeURI(`${BACKEND_URL}${p.image}`)) : '',
        category: mapCategoryLabel(p.category || '')
      }));
      setProducts(fallbackList);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch paginated products feed
  const loadMoreProducts = async () => {
    if (paginatedLoading || !hasMoreProducts) return;
    setPaginatedLoading(true);
    try {
      const url = `${BACKEND_URL}/api/products/paginated?page=${page}&limit=10`;
      const data = await fetchWithCache(url);
      if (data) {
        const mapped = (data.products || []).map(mapBackendProduct);
        setPaginatedProducts(prev => [...prev, ...mapped]);
        setPage(prev => prev + 1);
        setHasMoreProducts(data.hasMore);
      }
    } catch (err) {
      console.warn('Failed to load paginated products:', err);
      // Fallback
      if (products.length > 0) {
        const start = (page - 1) * 10;
        const nextBatch = products.slice(start, start + 10);
        setPaginatedProducts(prev => [...prev, ...nextBatch]);
        setPage(prev => prev + 1);
        setHasMoreProducts(start + 10 < products.length);
      }
    } finally {
      setPaginatedLoading(false);
    }
  };

  const refreshProductsFeed = async () => {
    setPage(1);
    setHasMoreProducts(true);
    setPaginatedProducts([]);
    setPaginatedLoading(true);
    try {
      const url = `${BACKEND_URL}/api/products/paginated?page=1&limit=10`;
      const data = await fetchWithCache(url, true); // Force bypass cache on refresh
      if (data) {
        const mapped = (data.products || []).map(mapBackendProduct);
        setPaginatedProducts(mapped);
        setPage(2);
        setHasMoreProducts(data.hasMore);
      }
    } catch (err) {
      console.warn('Failed to refresh feed:', err);
      if (products.length > 0) {
        const initialBatch = products.slice(0, 10);
        setPaginatedProducts(initialBatch);
        setPage(2);
        setHasMoreProducts(10 < products.length);
      }
    } finally {
      setPaginatedLoading(false);
    }
  };

  // Search suggestions
  const searchSuggestions = async (query: string): Promise<{ products: Product[]; categories: string[] }> => {
    try {
      const url = `${BACKEND_URL}/api/products/search?q=${encodeURIComponent(query)}`;
      const data = await fetchWithCache(url);
      if (data) {
        return {
          products: (data.products || []).map(mapBackendProduct),
          categories: (data.categories || []).map(mapCategoryLabel)
        };
      }
    } catch (err) {
      console.warn('Failed to fetch search suggestions:', err);
    }
    return { products: [], categories: [] };
  };

  // Sync favorites locally via AsyncStorage
  const fetchWishlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to load local favorites:', err);
    }
  };

  const toggleFavorite = async (id: string) => {
    const nextFavorites = favorites.includes(id)
      ? favorites.filter(item => item !== id)
      : [...favorites, id];
    
    setFavorites(nextFavorites);
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(nextFavorites));
    } catch (err) {
      console.warn('Failed to save favorites locally:', err);
    }
  };

  // Notifications logic
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const url = `${BACKEND_URL}/api/mobile/notifications`;
      const data = await fetchWithCache(url);
      if (data && data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Failed to fetch customer notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationsRead = async (id?: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/mobile/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
          // Invalidate cache
          if (cacheRegistry.current[`${BACKEND_URL}/api/mobile/notifications`]) {
            delete cacheRegistry.current[`${BACKEND_URL}/api/mobile/notifications`];
          }
        }
      }
    } catch (err) {
      console.warn('Failed to read notifications:', err);
    }
  };

  const clearNotifications = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/mobile/notifications/clear`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications([]);
          if (cacheRegistry.current[`${BACKEND_URL}/api/mobile/notifications`]) {
            delete cacheRegistry.current[`${BACKEND_URL}/api/mobile/notifications`];
          }
        }
      }
    } catch (err) {
      console.warn('Failed to clear notifications:', err);
    }
  };

  // Recently Viewed product logic
  const addToRecentlyViewed = async (product: Product) => {
    if (!product) return;
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10);
      AsyncStorage.setItem('recently_viewed', JSON.stringify(updated)).catch(err => {
        console.warn('Failed to save recently viewed products:', err);
      });
      return updated;
    });
  };

  // Load recently viewed on mount
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const stored = await AsyncStorage.getItem('recently_viewed');
        if (stored) {
          setRecentlyViewed(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Failed to load recently viewed:', err);
      }
    };
    loadRecentlyViewed();
  }, []);

  // Monitor selectedProductId to add to Recently Viewed history
  useEffect(() => {
    if (selectedProductId) {
      const found = products.find(p => p.id === selectedProductId) ||
                    paginatedProducts.find(p => p.id === selectedProductId) ||
                    (flashSale && flashSale.products.find(p => p.id === selectedProductId));
      if (found) {
        addToRecentlyViewed(found);
      }
    }
  }, [selectedProductId, products, paginatedProducts, flashSale]);

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, 10);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Run on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchAllProducts(),
        fetchBanners(),
        fetchCategories(),
        fetchFlashSale(),
        fetchWishlist(),
        fetchNotifications()
      ]);
    };
    initializeData();
  }, []);

  // Sync general products load with initial paginated feed
  useEffect(() => {
    if (products.length > 0 && paginatedProducts.length === 0) {
      refreshProductsFeed();
    }
  }, [products]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1, selected: true }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === id) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleCartSelection = (id: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAllCartSelections = (selected: boolean) => {
    setCart((prevCart) => prevCart.map((item) => ({ ...item, selected })));
  };

  return (
    <MobileAppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedProductId,
        setSelectedProductId,
        cart,
        addToCart,
        updateCartQuantity,
        toggleCartSelection,
        toggleAllCartSelections,
        favorites,
        toggleFavorite,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        products,

        // Dynamic API properties
        banners,
        categories,
        flashSale,
        paginatedProducts,
        paginatedLoading,
        hasMoreProducts,
        loadMoreProducts,
        refreshProductsFeed,
        searchSuggestions,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        trendingSearches,
        fetchBanners,
        fetchCategories,
        fetchFlashSale,

        // Loading states
        bannersLoading,
        categoriesLoading,
        flashSaleLoading,
        productsLoading,

        // Wishlist Database
        fetchWishlist,

        // Notifications
        notifications,
        notificationsLoading,
        fetchNotifications,
        markNotificationsRead,
        clearNotifications,

        // Recently Viewed
        recentlyViewed,
        addToRecentlyViewed
      }}
    >
      {children}
    </MobileAppContext.Provider>
  );
};
