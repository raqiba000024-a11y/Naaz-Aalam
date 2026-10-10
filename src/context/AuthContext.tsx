import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ShippingAddress } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  saveAddress: (address: Partial<ShippingAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const current = await api.getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    const res = await api.register(data);
    setUser(res.user);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const saveAddress = async (address: Partial<ShippingAddress>) => {
    const addresses = await api.saveAddress(address);
    if (user) {
      setUser({ ...user, addresses });
    }
  };

  const deleteAddress = async (id: string) => {
    const addresses = await api.deleteAddress(id);
    if (user) {
      setUser({ ...user, addresses });
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
        saveAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
