export interface ProductVariant {
  id: string;
  name: string; // e.g., 'Space Black', 'Titanium Silver', 'Cognac'
  colorHex?: string;
  size?: string;
  sku: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  helpfulCount: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story?: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;
  isNew: boolean;
  flashSale?: {
    discountPercent: number;
    endsAt: string;
  };
  images: string[];
  videoUrl?: string;
  variants: ProductVariant[];
  attributes: {
    material?: string;
    origin?: string;
    warranty?: string;
    dimensions?: string;
    weight?: string;
    finish?: string;
    batteryLife?: string;
    waterResistance?: string;
    [key: string]: string | undefined;
  };
  careInstructions?: string;
  tags: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  id: string; // unique item id: productId + variantId
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddress {
  id?: string;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'processing' | 'quality_check' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethod: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    couponCode?: string;
    tax: number; // GST
    shippingFee: number;
    total: number;
  };
  payment: {
    method: PaymentMethod;
    status: 'paid' | 'pending' | 'failed' | 'cod_verified';
    transactionId?: string;
    paidAt?: string;
    last4?: string;
    upiId?: string;
  };
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  trackingNumber: string;
  carrier: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
  addresses: ShippingAddress[];
  wishlistIds: string[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
  expiresAt?: string;
  isActive: boolean;
  usageCount: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcementText: string;
  announcementActive: boolean;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  whiteGloveShippingFee: number;
  gstRate: number; // e.g. 0.18 for 18%
  currencySymbol: string;
  currencyCode: string;
  supportEmail: string;
  supportPhone: string;
  allowGuestCheckout: boolean;
}
