export interface Product {
  id: string;
  name: string;
  category: 'Men & woman Fashion' | 'Saree & jewelry' | 'Electronics & sports' | 'Kitchen items' | 'Custom products';
  subcategory: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  images: [string, string, string, string]; // exactly 4 product images as required
  description: string;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  freeDelivery: boolean;
  deliveryTime: string;
  mallShopName: string;
  mallFloor: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  homeNumber: string;
  address: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  paymentMethod: 'cod' | 'upi_on_delivery' | 'online_upi';
}

export type OrderStatus = 'placed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
  estimatedDelivery: string;
  deliveryPartner: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
  syncedToGoogleSheets?: boolean;
  whatsAppConfirmed?: boolean;
}

export type ActiveTab = 'home' | 'categories' | 'orders' | 'liked';

export interface CartToastItem {
  id: string;
  product: Product;
  size?: string;
  color?: string;
  timestamp: number;
}
