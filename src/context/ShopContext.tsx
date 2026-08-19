import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Product, CartItem, Order, CustomerDetails, ActiveTab, CartToastItem } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import {
  submitOrderToGoogleSheets,
  getSavedAppsScriptUrl,
  saveAppsScriptUrl,
  getSavedProductsScriptUrl,
  saveProductsScriptUrl,
  fetchProductsFromGoogleSheets,
  DEFAULT_PRODUCTS_SCRIPT_URL,
} from '../utils/googleSheetsSync';

interface ShopContextType {
  products: Product[];
  refreshProductsFromSheet: (urlOverride?: string) => Promise<void>;
  isLoadingProducts: boolean;
  cart: CartItem[];
  likedProductIds: string[];
  orders: Order[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (sub: string) => void;
  sortBy: 'popular' | 'price-low' | 'price-high' | 'rating';
  setSortBy: (sort: 'popular' | 'price-low' | 'price-high' | 'rating') => void;
  
  // Cart actions
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartToast: CartToastItem | null;
  dismissCartToast: () => void;

  // Liked actions
  toggleLike: (productId: string) => void;
  isLiked: (productId: string) => boolean;
  likedProducts: Product[];

  // Checkout & Orders
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  checkoutProduct: Product | null;
  openDirectCheckout: (product: Product) => void;
  placeOrder: (customer: CustomerDetails) => Promise<{ success: boolean; orderId: string; message: string }>;
  cancelOrder: (orderId: string) => void;

  // Modals & UI
  selectedProductForDetail: Product | null;
  setSelectedProductForDetail: (product: Product | null) => void;
  activeImageModal: { product: Product; initialIndex: number } | null;
  setActiveImageModal: (val: { product: Product; initialIndex: number } | null) => void;
  shareModalProduct: Product | null;
  setShareModalProduct: (product: Product | null) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  appsScriptUrl: string;
  updateAppsScriptUrl: (url: string) => void;
  productsScriptUrl: string;
  updateProductsScriptUrl: (url: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// LocalStorage persistence keys
const CART_STORAGE_KEY = 'todays_trend_cart_v1';
const LIKED_STORAGE_KEY = 'todays_trend_liked_v1';
const ORDERS_STORAGE_KEY = 'todays_trend_orders_v1';
const PRODUCTS_CACHE_KEY = 'todays_trend_cached_products_v1';

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appsScriptUrl, setAppsScriptUrlState] = useState<string>(getSavedAppsScriptUrl());
  const [productsScriptUrl, setProductsScriptUrlState] = useState<string>(getSavedProductsScriptUrl());

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    // If a Google Sheets product URL is configured, start empty so we never flash old mock products
    return DEFAULT_PRODUCTS_SCRIPT_URL ? [] : INITIAL_PRODUCTS;
  });

  const [isLoadingProducts, setIsLoadingProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cached) return false;
    }
    return Boolean(DEFAULT_PRODUCTS_SCRIPT_URL);
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  const refreshProductsFromSheet = async (urlOverride?: string) => {
    const url = urlOverride || productsScriptUrl || DEFAULT_PRODUCTS_SCRIPT_URL;
    if (!url) return;
    setIsLoadingProducts(true);
    try {
      const sheetProducts = await fetchProductsFromGoogleSheets(url);
      if (sheetProducts && sheetProducts.length > 0) {
        setProducts(sheetProducts);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(sheetProducts));
          } catch (e) {
            console.error('Error caching products:', e);
          }
        }
      }
    } catch (e) {
      console.log('Error refreshing products from Google Sheets:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    refreshProductsFromSheet();
  }, [appsScriptUrl, productsScriptUrl]);

  // Persistence: Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Persistence: Liked Items (Starts completely empty for new visitors)
  const [likedProductIds, setLikedProductIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LIKED_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Persistence: Orders (Starts completely empty with 0 orders until a customer actually places one)
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out any legacy dummy sample orders
            const realOrders = parsed.filter((o) => o && o.id !== 'TT-892104');
            return realOrders;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [activeImageModal, setActiveImageModal] = useState<{ product: Product; initialIndex: number } | null>(null);
  const [shareModalProduct, setShareModalProduct] = useState<Product | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [cartToast, setCartToast] = useState<CartToastItem | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dismissCartToast = () => {
    setCartToast(null);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  };

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(likedProductIds));
    } catch (e) {
      console.error(e);
    }
  }, [likedProductIds]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  const updateAppsScriptUrl = (url: string) => {
    setAppsScriptUrlState(url);
    saveAppsScriptUrl(url);
  };

  const updateProductsScriptUrl = (url: string) => {
    setProductsScriptUrlState(url);
    saveProductsScriptUrl(url);
  };

  // Cart operations
  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          selectedSize: size || (product.sizes ? product.sizes[0] : undefined),
          selectedColor: color || (product.colors ? product.colors[0] : undefined),
        },
      ];
    });

    // Trigger instant visual toast notification
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setCartToast({
      id: `${product.id}-${Date.now()}`,
      product,
      size,
      color,
      timestamp: Date.now(),
    });
    toastTimeoutRef.current = setTimeout(() => {
      setCartToast(null);
    }, 3200);
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.originalPrice * item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartDiscount = cartSubtotal - cartTotal;

  // Liked operations
  const toggleLike = (productId: string) => {
    setLikedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isLiked = (productId: string) => likedProductIds.includes(productId);

  const likedProducts = products.filter((p) => likedProductIds.includes(p.id));

  // Direct checkout
  const openDirectCheckout = (product: Product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Place order
  const placeOrder = async (customer: CustomerDetails): Promise<{ success: boolean; orderId: string; message: string }> => {
    const orderItems: CartItem[] = checkoutProduct
      ? [
          {
            product: checkoutProduct,
            quantity: 1,
            selectedSize: checkoutProduct.sizes ? checkoutProduct.sizes[0] : undefined,
            selectedColor: checkoutProduct.colors ? checkoutProduct.colors[0] : undefined,
          },
        ]
      : [...cart];

    if (orderItems.length === 0) {
      return { success: false, orderId: '', message: 'Cart is empty.' };
    }

    const orderSubtotal = orderItems.reduce((acc, item) => acc + item.product.originalPrice * item.quantity, 0);
    const orderTotal = orderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const orderDiscount = orderSubtotal - orderTotal;
    const randomOrderId = 'TT-' + Math.floor(100000 + Math.random() * 900000);

    const deliveryTeamNames = [
      { name: 'Amit Verma (Mall Delivery Team)', phone: '+91 9811223344', vehicleNumber: 'DL-01-EV-4412' },
      { name: 'Suresh Patil (Mall Express)', phone: '+91 9822334455', vehicleNumber: 'MH-12-EV-7832' },
      { name: 'Rohan Mehra (Local Mall Fleet)', phone: '+91 9833445566', vehicleNumber: 'KA-05-EV-1920' },
    ];
    const assignedPartner = deliveryTeamNames[Math.floor(Math.random() * deliveryTeamNames.length)];

    const newOrder: Order = {
      id: randomOrderId,
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      customer,
      items: orderItems,
      itemCount: orderItems.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: orderSubtotal,
      discount: orderDiscount,
      deliveryCharge: 0,
      totalAmount: orderTotal,
      status: 'placed',
      estimatedDelivery: 'Today within 2-3 Hours',
      deliveryPartner: assignedPartner,
      syncedToGoogleSheets: false,
    };

    // Attempt to submit to Google Sheets
    const syncRes = await submitOrderToGoogleSheets(newOrder, appsScriptUrl);
    newOrder.syncedToGoogleSheets = syncRes.success;

    // Update local state
    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart if ordered from cart
    if (!checkoutProduct) {
      clearCart();
    }

    setCheckoutProduct(null);
    setIsCheckoutOpen(false);
    setActiveTab('orders'); // Jump straight to "My Orders" so customer sees their placed order immediately!

    return {
      success: true,
      orderId: randomOrderId,
      message: syncRes.message,
    };
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'cancelled' } : ord))
    );
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        refreshProductsFromSheet,
        isLoadingProducts,
        cart,
        likedProductIds,
        orders,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        sortBy,
        setSortBy,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        cartToast,
        dismissCartToast,
        toggleLike,
        isLiked,
        likedProducts,
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutProduct,
        openDirectCheckout,
        placeOrder,
        cancelOrder,
        selectedProductForDetail,
        setSelectedProductForDetail,
        activeImageModal,
        setActiveImageModal,
        shareModalProduct,
        setShareModalProduct,
        isSettingsOpen,
        setIsSettingsOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        appsScriptUrl,
        updateAppsScriptUrl,
        productsScriptUrl,
        updateProductsScriptUrl,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
