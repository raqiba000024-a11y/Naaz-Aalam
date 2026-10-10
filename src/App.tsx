import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';

import { HomeView } from './views/HomeView.tsx';
import { ShopView } from './views/ShopView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { CheckoutView } from './views/CheckoutView.tsx';
import { OrderConfirmationView } from './views/OrderConfirmationView.tsx';
import { AccountView } from './views/AccountView.tsx';
import { OrderTrackingView } from './views/OrderTrackingView.tsx';
import { AdminDashboardView } from './views/AdminDashboardView.tsx';
import { AuthView } from './views/AuthView.tsx';
import { StoryView } from './views/StoryView.tsx';
import { Order } from './types/index.ts';

function MainLayout() {
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product' | 'checkout' | 'order-confirmation' | 'account' | 'tracking' | 'admin' | 'auth' | 'wishlist' | 'story'>('home');
  const [viewParam, setViewParam] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync with browser navigation
  const navigateTo = (view: string, param?: string) => {
    setCurrentView(view as any);
    setViewParam(param || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const newUrl = param ? `?view=${view}&${param}` : `?view=${view}`;
    window.history.pushState({ view, param }, '', newUrl);
  };

  useEffect(() => {
    // Parse URL on mount
    const searchParams = new URLSearchParams(window.location.search);
    const viewFromUrl = searchParams.get('view');
    if (viewFromUrl) {
      const fullParams = window.location.search.replace(/^\?/, '');
      setCurrentView(viewFromUrl as any);
      setViewParam(fullParams);
    }

    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.view) {
        setCurrentView(e.state.view);
        setViewParam(e.state.param || '');
      } else {
        setCurrentView('home');
        setViewParam('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentView('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 transition-colors">
      <Header currentView={currentView} onNavigate={navigateTo} />
      <CartDrawer onNavigate={navigateTo} />

      <main className="flex-1">
        {currentView === 'home' && <HomeView onNavigate={navigateTo} />}
        {currentView === 'shop' && <ShopView initialQuery={viewParam} onNavigate={navigateTo} />}
        {currentView === 'product' && (
          <ProductDetailView slugOrId={viewParam} onNavigate={navigateTo} />
        )}
        {currentView === 'checkout' && (
          <CheckoutView onOrderSuccess={handleOrderSuccess} onNavigate={navigateTo} />
        )}
        {currentView === 'order-confirmation' && confirmedOrder && (
          <OrderConfirmationView order={confirmedOrder} onNavigate={navigateTo} />
        )}
        {currentView === 'account' && <AccountView onNavigate={navigateTo} />}
        {currentView === 'wishlist' && <AccountView onNavigate={navigateTo} />}
        {currentView === 'tracking' && (
          <OrderTrackingView initialTracking={viewParam} onNavigate={navigateTo} />
        )}
        {currentView === 'admin' && <AdminDashboardView onNavigate={navigateTo} />}
        {currentView === 'auth' && (
          <AuthView
            initialMode={viewParam.includes('register') ? 'register' : 'login'}
            onNavigate={navigateTo}
          />
        )}
        {currentView === 'story' && <StoryView onNavigate={navigateTo} />}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <MainLayout />
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
