import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface CartContextType {
  items: CartItem[];
  savedForLater: CartItem[];
  isDrawerOpen: boolean;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  totalQuantity: number;
  freeShippingThreshold: number;
  amountRemainingForFreeShipping: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  saveForLaterItem: (itemId: string) => void;
  moveToCartItem: (itemId: string) => void;
  removeSavedItem: (itemId: string) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'aura_shopping_cart';
const SAVED_STORAGE_KEY = 'aura_saved_for_later';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const freeShippingThreshold = 150;
  const standardShippingFee = 15;
  const gstRate = 0.18; // 18% GST

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist cart:', err);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedForLater));
    } catch (err) {
      console.warn('Failed to persist saved items:', err);
    }
  }, [savedForLater]);

  // Recalculate coupon discount if items change
  useEffect(() => {
    if (!appliedCoupon) {
      setDiscountAmount(0);
      return;
    }
    const currentSubtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    if (appliedCoupon.minSpend && currentSubtotal < appliedCoupon.minSpend) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }

    if (appliedCoupon.discountType === 'percentage') {
      const disc = (currentSubtotal * appliedCoupon.discountValue) / 100;
      setDiscountAmount(Number(disc.toFixed(2)));
    } else {
      setDiscountAmount(Math.min(appliedCoupon.discountValue, currentSubtotal));
    }
  }, [items, appliedCoupon]);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : standardShippingFee;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Number((taxableAmount * gstRate).toFixed(2));
  const total = Number((taxableAmount + tax + shippingFee).toFixed(2));
  const amountRemainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addItem = (product: Product, variant?: ProductVariant, quantity = 1) => {
    const variantId = variant?.id || product.variants[0]?.id;
    const selectedVariant = variant || product.variants.find(v => v.id === variantId) || product.variants[0];
    const itemId = `${product.id}-${variantId || 'standard'}`;
    const unitPrice = selectedVariant?.price || product.price;

    setItems(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        return prev.map(i =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          product,
          variantId,
          variant: selectedVariant,
          quantity,
          unitPrice,
        },
      ];
    });

    setIsDrawerOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, quantity } : item)));
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const saveForLaterItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    setItems(prev => prev.filter(i => i.id !== itemId));
    setSavedForLater(prev => [...prev.filter(i => i.id !== itemId), item]);
  };

  const moveToCartItem = (itemId: string) => {
    const item = savedForLater.find(i => i.id === itemId);
    if (!item) return;
    setSavedForLater(prev => prev.filter(i => i.id !== itemId));
    setItems(prev => [...prev, item]);
  };

  const removeSavedItem = (itemId: string) => {
    setSavedForLater(prev => prev.filter(i => i.id !== itemId));
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discountAmount);
        return { success: true, message: `Promo code ${code.toUpperCase()} applied successfully!` };
      }
      return { success: false, message: 'Invalid coupon code.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Could not apply coupon code.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        savedForLater,
        isDrawerOpen,
        appliedCoupon,
        discountAmount,
        subtotal,
        tax,
        shippingFee,
        total,
        totalQuantity,
        freeShippingThreshold,
        amountRemainingForFreeShipping,
        openDrawer,
        closeDrawer,
        addItem,
        updateQuantity,
        removeItem,
        saveForLaterItem,
        moveToCartItem,
        removeSavedItem,
        applyCoupon,
        removeCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
