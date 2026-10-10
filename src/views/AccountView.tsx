import React, { useState, useEffect } from 'react';
import { User as UserIcon, Package, Heart, MapPin, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Order, Product, ShippingAddress } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AccountViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export function AccountView({ onNavigate }: AccountViewProps) {
  const { user, logout, saveAddress, deleteAddress } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // New address modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState<ShippingAddress>({
    fullName: user?.fullName || '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: user?.phone || '',
  });

  useEffect(() => {
    async function loadAccountData() {
      if (!user) return;
      try {
        const [myOrders, allProds] = await Promise.all([
          api.getMyOrders(),
          api.getProducts(),
        ]);
        setOrders(myOrders);
        const wishProds = allProds.filter(p => wishlistIds.includes(p.id));
        setWishlistProducts(wishProds);
      } catch (err) {
        console.error('Failed to load user account data:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadAccountData();
  }, [user, wishlistIds]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif-display text-2xl font-semibold">Collector Access Required</h2>
        <p className="text-xs text-stone-500">
          Please sign in to view your orders, saved addresses, and personal collection.
        </p>
        <button
          onClick={() => onNavigate('auth', 'mode=login')}
          className="w-full py-2.5 bg-stone-900 text-white rounded text-xs font-semibold"
        >
          Sign In to Account
        </button>
      </div>
    );
  }

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.street || !newAddr.city || !newAddr.postalCode) return;
    try {
      await saveAddress(newAddr);
      setIsAddressModalOpen(false);
      addToast({
        title: 'Address Registered',
        message: 'Your shipping address has been updated.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Account Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-serif-display text-xl font-bold flex items-center justify-center shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
              Collector Profile · Member
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-semibold text-stone-950 dark:text-stone-50">
              {user.fullName}
            </h1>
            <div className="text-xs text-stone-500 font-mono mt-0.5">{user.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 self-start sm:self-auto border border-stone-300 dark:border-stone-700 rounded px-3 py-1.5 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-lg text-xs font-medium max-w-fit">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-stone-100 font-semibold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'wishlist'
              ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-stone-100 font-semibold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Wishlist ({wishlistIds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'addresses'
              ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-stone-100 font-semibold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Saved Addresses ({user.addresses.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-12 text-center text-xs text-stone-400">Loading order archives...</div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-8">
              <h3 className="font-serif-display text-lg font-semibold text-stone-800 dark:text-stone-200 mb-1">
                No orders registered yet
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Explore our collections to acquire your first atelier creation.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="py-2 px-5 bg-stone-900 text-white rounded text-xs font-semibold"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100 dark:border-stone-800 text-xs">
                    <div>
                      <span className="text-stone-500">Order: </span>
                      <strong className="text-stone-900 dark:text-stone-100 font-mono">
                        {order.orderNumber}
                      </strong>
                      <span className="text-stone-400 mx-2">·</span>
                      <span className="text-stone-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => onNavigate('tracking', order.orderNumber)}
                        className="text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                      >
                        Track Waybill →
                      </button>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-xs">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded object-cover border border-stone-200 dark:border-stone-800"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {item.productName}
                          </h4>
                          <div className="text-stone-500 text-[11px]">
                            Qty: {item.quantity} · {item.variantName || 'Standard'}
                          </div>
                        </div>
                        <div className="font-mono-data font-semibold text-stone-900 dark:text-stone-100">
                          ${item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                    <span className="text-stone-500">
                      Paid via {order.payment.method.toUpperCase()} ({order.payment.status})
                    </span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 font-mono-data text-sm">
                      Total: ${order.pricing.total.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-8">
              <h3 className="font-serif-display text-lg font-semibold text-stone-800 dark:text-stone-200 mb-1">
                Your wishlist is empty
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Click the heart on any creation to curate your private selection.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="py-2 px-5 bg-stone-900 text-white rounded text-xs font-semibold"
              >
                Discover Pieces
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map(prod => (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => onNavigate('product', prod.slug)}
                  />
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
                        {prod.brand}
                      </div>
                      <h4
                        onClick={() => onNavigate('product', prod.slug)}
                        className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate cursor-pointer hover:underline"
                      >
                        {prod.name}
                      </h4>
                      <div className="text-sm font-mono-data font-semibold text-stone-900 dark:text-stone-100 mt-1">
                        ${prod.price} USD
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <button
                        onClick={() => {
                          addItem(prod);
                          addToast({ title: 'Added to Bag', message: `${prod.name} added.` });
                        }}
                        className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded"
                      >
                        Add to Bag
                      </button>
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 border border-stone-200 dark:border-stone-800 rounded"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              Registered Courier Destinations
            </h3>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="py-2 px-4 bg-stone-900 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.addresses.map((addr, idx) => (
              <div
                key={idx}
                className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2 text-xs relative"
              >
                {addr.isDefault && (
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                    Default Delivery Address
                  </span>
                )}
                <div className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                  {addr.fullName}
                </div>
                <div className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {addr.street}
                  {addr.apartment && `, ${addr.apartment}`}
                  <br />
                  {addr.city}, {addr.state} {addr.postalCode}
                  <br />
                  {addr.country}
                  <br />
                  Phone: {addr.phone}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => addr.id && deleteAddress(addr.id)}
                    className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                    title="Remove address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              Register New Address
            </h3>
            <form onSubmit={handleSaveNewAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={newAddr.fullName}
                  onChange={e => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={e => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddr.postalCode}
                    onChange={e => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={newAddr.phone}
                  onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 text-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded font-semibold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
