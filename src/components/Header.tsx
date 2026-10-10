import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Heart, User as UserIcon, Sun, Moon, Shield, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { Product } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const { totalQuantity, openDrawer, freeShippingThreshold, amountRemainingForFreeShipping } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.getProducts({ search: searchQuery });
        setSearchResults(results.slice(0, 5));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      onNavigate('shop', `search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-stone-900 text-stone-300 text-xs py-2 px-4 text-center tracking-wide border-b border-stone-800 transition-colors dark:bg-stone-950 dark:border-stone-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden md:inline font-mono text-[11px] text-stone-400">
            ATELIER EDITION · SPRING 2026
          </span>
          <p className="mx-auto font-medium">
            {amountRemainingForFreeShipping === 0 ? (
              <span className="text-amber-300 font-semibold">
                Complimentary insured courier delivery applied to your atelier order
              </span>
            ) : (
              <span>
                Complimentary insured worldwide courier on orders over ${freeShippingThreshold} USD
              </span>
            )}
          </p>
          <div className="hidden md:flex items-center gap-3 text-[11px] text-stone-400">
            <button
              onClick={() => onNavigate('tracking')}
              className="hover:text-stone-200 transition-colors"
            >
              Track Order
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onNavigate('admin')}
              className="hover:text-stone-200 transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Header - Top Bar Contract: Brand — 4-5 Nav Links — 1 Primary Action Zone */}
      <header className="sticky top-0 z-40 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Brand Zone: Single wordmark in display face */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="font-serif-display text-2xl sm:text-3xl tracking-wider font-semibold text-stone-950 dark:text-stone-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                AURA
              </span>
            </button>
          </div>

          {/* Nav Links: 4-5 single-line clean text links with subtle hover underlines */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <button
              onClick={() => onNavigate('shop', 'category=all')}
              className={`pb-1 transition-colors relative whitespace-nowrap ${
                currentView === 'shop'
                  ? 'text-stone-950 dark:text-stone-100 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
              }`}
            >
              Catalog
              {currentView === 'shop' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-stone-900 dark:bg-stone-100" />
              )}
            </button>

            <button
              onClick={() => onNavigate('shop', 'category=audio')}
              className="pb-1 transition-colors text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 whitespace-nowrap"
            >
              High-Fidelity Audio
            </button>

            <button
              onClick={() => onNavigate('shop', 'category=horology')}
              className="pb-1 transition-colors text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 whitespace-nowrap"
            >
              Horology
            </button>

            <button
              onClick={() => onNavigate('shop', 'category=leather-goods')}
              className="pb-1 transition-colors text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 whitespace-nowrap"
            >
              Leather & Travel
            </button>

            <button
              onClick={() => onNavigate('story')}
              className={`pb-1 transition-colors relative whitespace-nowrap ${
                currentView === 'story'
                  ? 'text-stone-950 dark:text-stone-100 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
              }`}
            >
              Atelier Story
              {currentView === 'story' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-stone-900 dark:bg-stone-100" />
              )}
            </button>
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 transition-colors"
              title="Search catalog"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Link */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 transition-colors relative"
              title="Saved items"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Account Menu */}
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(prev => !prev)}
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 transition-colors"
                title="Account"
                aria-label="User Account"
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {isAccountMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl py-2 z-50 text-xs font-medium"
                  onMouseLeave={() => setIsAccountMenuOpen(false)}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {user.fullName}
                        </div>
                        <div className="text-stone-500 truncate text-[11px]">{user.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('account');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      >
                        Collector Profile & Orders
                      </button>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('tracking');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      >
                        Track Active Shipment
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Director Admin Console
                        </button>
                      )}
                      <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('auth', 'mode=login');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
                      >
                        Sign In to Account
                      </button>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('auth', 'mode=register');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
                      >
                        Create Collector Account
                      </button>
                      <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 flex items-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5 text-stone-500" />
                        Admin Access
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag CTA */}
            <button
              onClick={openDrawer}
              className="inline-flex items-center gap-2 py-2 px-3 sm:px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs sm:text-sm font-medium rounded transition-all cursor-pointer shadow-sm"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="font-mono text-xs font-semibold px-1.5 py-0.2 bg-stone-800 text-stone-200 dark:bg-stone-200 dark:text-stone-800 rounded">
                {totalQuantity}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Smart Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search watches, headphones, Tuscan leather, bespoke fragrances..."
                className="w-full bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-stone-600 text-xs px-2"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            <div className="p-4 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="py-8 text-center text-xs text-stone-400">Searching atelier archives...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-2">
                    Matching Products
                  </div>
                  {searchResults.map(product => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        onNavigate('product', product.slug);
                      }}
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800/80 cursor-pointer transition-colors"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover rounded bg-stone-100 dark:bg-stone-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span>{product.brand}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-data text-stone-900 dark:text-stone-200">
                            ${product.price} USD
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </div>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2 text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium mt-2"
                  >
                    View all results for &quot;{searchQuery}&quot; →
                  </button>
                </div>
              ) : searchQuery ? (
                <div className="py-8 text-center text-xs text-stone-500">
                  No products matched &quot;{searchQuery}&quot;. Try &quot;audio&quot;, &quot;titanium&quot;, or &quot;leather&quot;.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                    Popular Categories
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['High-Fidelity Audio', 'Haute Horlogerie', 'Leather & Travel', 'Artisanal Fragrance', 'Eyewear'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSearchQuery(cat);
                        }}
                        className="px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
