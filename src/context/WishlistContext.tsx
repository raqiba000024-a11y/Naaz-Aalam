import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.tsx';
import { api } from '../lib/api.ts';

interface WishlistContextType {
  wishlistIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = 'aura_wishlist_ids';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['prod-01', 'prod-02'];
    } catch {
      return ['prod-01', 'prod-02'];
    }
  });

  useEffect(() => {
    if (user?.wishlistIds && user.wishlistIds.length > 0) {
      setWishlistIds(user.wishlistIds);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (err) {
      console.warn('Failed to store wishlist:', err);
    }
  }, [wishlistIds]);

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = async (productId: string) => {
    const exists = wishlistIds.includes(productId);
    const updated = exists
      ? wishlistIds.filter(id => id !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(updated);

    if (user) {
      try {
        await api.toggleWishlist(productId);
      } catch (err) {
        console.warn('Could not sync wishlist with server:', err);
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
