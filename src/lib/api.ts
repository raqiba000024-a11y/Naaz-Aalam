import {
  Product,
  Category,
  ProductReview,
  User,
  Order,
  Coupon,
  ShippingAddress,
  StoreSettings,
} from '../types/index.ts';

const TOKEN_KEY = 'aura_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    tag?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
    if (params?.sort) query.set('sort', params.sort);

    const qs = query.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  async getProduct(slugOrId: string): Promise<Product> {
    return request<Product>(`/products/${slugOrId}`);
  },

  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/categories');
  },

  async getReviews(productId: string): Promise<ProductReview[]> {
    return request<ProductReview[]>(`/products/${productId}/reviews`);
  },

  async submitReview(
    productId: string,
    data: { rating: number; title: string; comment: string; userName?: string }
  ): Promise<ProductReview> {
    return request<ProductReview>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Auth
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async getCurrentUser(): Promise<User | null> {
    if (!getStoredToken()) return null;
    try {
      const res = await request<{ user: User }>('/auth/me');
      return res.user;
    } catch {
      setStoredToken(null);
      return null;
    }
  },

  logout(): void {
    setStoredToken(null);
  },

  async saveAddress(address: Partial<ShippingAddress>): Promise<ShippingAddress[]> {
    const res = await request<{ addresses: ShippingAddress[] }>('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
    return res.addresses;
  },

  async deleteAddress(id: string): Promise<ShippingAddress[]> {
    const res = await request<{ addresses: ShippingAddress[] }>(`/user/addresses/${id}`, {
      method: 'DELETE',
    });
    return res.addresses;
  },

  async toggleWishlist(productId: string): Promise<string[]> {
    const res = await request<{ wishlistIds: string[] }>('/user/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    return res.wishlistIds;
  },

  // Coupons
  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; coupon: Coupon; discountAmount: number }> {
    return request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },

  // Orders & Payment
  async verifyPayment(
    method: string,
    amount: number,
    payload: any
  ): Promise<{ verified: boolean; transactionId: string; authorizedAt: string }> {
    return request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ method, amount, payload }),
    });
  },

  async createOrder(orderPayload: any): Promise<Order> {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async getMyOrders(): Promise<Order[]> {
    return request<Order[]>('/orders');
  },

  async getOrder(idOrTracking: string): Promise<Order> {
    return request<Order>(`/orders/${idOrTracking}`);
  },

  // Settings & Newsletter
  async getSettings(): Promise<StoreSettings> {
    return request<StoreSettings>('/settings');
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    return request<StoreSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    return request('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Admin APIs
  async getAdminAnalytics(): Promise<any> {
    return request('/admin/analytics');
  },

  async getAdminOrders(): Promise<Order[]> {
    return request<Order[]>('/admin/orders');
  },

  async updateAdminOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return request<Order>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    return request<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return request<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminCoupons(): Promise<Coupon[]> {
    return request<Coupon[]>('/admin/coupons');
  },

  async createAdminCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    return request<Coupon>('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
  },

  async toggleAdminCoupon(id: string): Promise<Coupon> {
    return request<Coupon>(`/admin/coupons/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async getAdminCustomers(): Promise<User[]> {
    return request<User[]>('/admin/customers');
  },
};
