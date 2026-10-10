import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Product, Order, Coupon, User, StoreSettings } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AdminDashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export function AdminDashboardView({ onNavigate }: AdminDashboardViewProps) {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'orders' | 'coupons' | 'customers' | 'settings'
  >('analytics');

  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit/Create product state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    brand: 'AURA Atelier',
    category: 'audio',
    price: 295,
    originalPrice: 350,
    stock: 20,
    rating: 5.0,
    reviewCount: 1,
    featured: false,
    trending: false,
    bestSeller: false,
    isNew: true,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'],
    variants: [],
    attributes: { origin: 'European Atelier', material: 'Aerospace Alloy' },
    tags: ['luxury', 'limited'],
  });

  // Create coupon state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minSpend: 100,
    isActive: true,
  });

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [stats, prods, ords, coups, custs, sets] = await Promise.all([
        api.getAdminAnalytics(),
        api.getProducts(),
        api.getAdminOrders(),
        api.getAdminCoupons(),
        api.getAdminCustomers(),
        api.getSettings(),
      ]);
      setAnalytics(stats);
      setProducts(prods);
      setOrders(ords);
      setCoupons(coups);
      setCustomers(custs);
      setSettings(sets);
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="font-serif-display text-2xl font-semibold">Director Access Required</h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          The Director Console requires elevated administrative credentials. Sign in with the administrator profile.
        </p>
        <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded text-xs font-mono text-left space-y-1">
          <div>Email: <strong>admin@aura-atelier.com</strong></div>
          <div>Password: <strong>Admin@Aura2026!</strong></div>
        </div>
        <button
          onClick={() => onNavigate('auth', 'mode=login')}
          className="w-full py-2.5 bg-stone-900 text-white rounded text-xs font-semibold"
        >
          Sign In as Director
        </button>
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = await api.updateAdminOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      addToast({
        title: 'Status Updated',
        message: `Order ${updated.orderNumber} updated to ${newStatus}.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({ title: 'Update Error', message: err.message, type: 'error' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to archive this creation from catalog?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast({ title: 'Product Removed', message: 'Item archived successfully.', type: 'info' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleOpenProductEdit = (product?: Product) => {
    if (product) {
      setEditingProductId(product.id);
      setProductForm(product);
    } else {
      setEditingProductId(null);
      setProductForm({
        name: '',
        slug: `aura-${Date.now().toString().slice(-4)}`,
        tagline: '',
        description: '',
        brand: 'AURA Atelier',
        category: 'audio',
        price: 295,
        originalPrice: 350,
        stock: 20,
        rating: 5.0,
        reviewCount: 1,
        featured: false,
        trending: false,
        bestSeller: false,
        isNew: true,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'],
        variants: [
          {
            id: `var-${Date.now()}`,
            name: 'Standard Edition',
            sku: `AURA-${Math.floor(1000 + Math.random() * 9000)}`,
            price: 295,
            stock: 20,
          },
        ],
        attributes: { origin: 'European Atelier', material: 'Titanium & Leather' },
        tags: ['bespoke', 'edition'],
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        const updated = await api.updateProduct(editingProductId, productForm);
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        addToast({ title: 'Product Updated', message: `${updated.name} saved.`, type: 'success' });
      } else {
        const created = await api.createProduct(productForm);
        setProducts(prev => [created, ...prev]);
        addToast({ title: 'Product Created', message: `${created.name} listed in catalog.`, type: 'success' });
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      addToast({ title: 'Save Error', message: err.message, type: 'error' });
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountValue) return;
    try {
      const created = await api.createAdminCoupon(couponForm);
      setCoupons(prev => [...prev, created]);
      setIsCouponModalOpen(false);
      addToast({ title: 'Coupon Created', message: `Code ${created.code} activated.`, type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      const toggled = await api.toggleAdminCoupon(id);
      setCoupons(prev => prev.map(c => (c.id === toggled.id ? toggled : c)));
      addToast({
        title: 'Coupon Status Toggled',
        message: `${toggled.code} is now ${toggled.isActive ? 'Active' : 'Inactive'}.`,
        type: 'info',
      });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      addToast({
        title: 'Settings Persisted',
        message: 'Store configuration updated successfully.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({ title: 'Settings Error', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Title & Export Report */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800 gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400">
            Internal Operations & Governance
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-semibold text-stone-950 dark:text-stone-50">
            Director Control Console
          </h1>
          <div className="text-xs text-stone-500 mt-1">
            Real-time synchronization across catalog inventory, transactions, and logistics.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="p-2 border border-stone-300 dark:border-stone-700 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href="/api/admin/export-sales"
            download
            className="py-2 px-4 bg-stone-900 text-white rounded text-xs font-semibold flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Audit Report</span>
          </a>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 dark:bg-stone-900 rounded-xl text-xs font-medium">
        {[
          { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
          { id: 'products', label: 'Products & Inventory', icon: Package },
          { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingCart },
          { id: 'coupons', label: 'Promotions & Coupons', icon: Tag },
          { id: 'customers', label: 'Customer Registry', icon: Users },
          { id: 'settings', label: 'Store Settings', icon: Settings },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-stone-100 font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. ANALYTICS & KPIS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                Gross Gross Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-mono-data font-bold text-stone-900 dark:text-stone-100">
                ${analytics.totalRevenue.toFixed(2)} USD
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% vs Previous Month</span>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                Total Orders Placed
              </span>
              <div className="text-2xl sm:text-3xl font-mono-data font-bold text-stone-900 dark:text-stone-100">
                {analytics.totalOrders}
              </div>
              <div className="text-xs text-stone-500">
                100% verified gateway authorizations
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                Average Order Value (AOV)
              </span>
              <div className="text-2xl sm:text-3xl font-mono-data font-bold text-stone-900 dark:text-stone-100">
                ${analytics.avgOrderValue.toFixed(2)} USD
              </div>
              <div className="text-xs text-stone-500">
                High-ticket luxury basket benchmark
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                Active Product References
              </span>
              <div className="text-2xl sm:text-3xl font-mono-data font-bold text-stone-900 dark:text-stone-100">
                {analytics.totalProducts}
              </div>
              <div className="text-xs text-stone-500">Across 5 specialized departments</div>
            </div>
          </div>

          {/* Department Revenue Breakdown */}
          <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4">
            <h3 className="font-serif-display text-base font-semibold text-stone-900 dark:text-stone-100">
              Department Revenue Allocation
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.categoryRevenue || {}).map(([cat, rev]: any) => {
                const pct = Math.min(100, Math.round((rev / (analytics.totalRevenue || 1)) * 100));
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize font-medium text-stone-800 dark:text-stone-200">
                        {cat.replace('-', ' ')}
                      </span>
                      <span className="font-mono-data font-semibold text-stone-900 dark:text-stone-100">
                        ${Number(rev).toFixed(2)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCT CATALOG MANAGER */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
                Active Catalog Inventory ({products.length})
              </h3>
              <p className="text-xs text-stone-500">
                Add, modify prices, update variant stock, or archive products.
              </p>
            </div>
            <button
              onClick={() => handleOpenProductEdit()}
              className="py-2 px-4 bg-stone-900 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Creation</span>
            </button>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                  <tr>
                    <th className="p-4">Piece</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Reserve Stock</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded object-cover border border-stone-200 dark:border-stone-800 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-stone-100">
                              {p.name}
                            </div>
                            <div className="text-stone-500 text-[11px]">{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 capitalize text-stone-600 dark:text-stone-400">
                        {p.category.replace('-', ' ')}
                      </td>
                      <td className="p-4 font-mono-data font-semibold text-stone-900 dark:text-stone-100">
                        ${p.price} USD
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-mono-data font-semibold ${
                            p.stock < 10 ? 'text-amber-600' : 'text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4 font-mono-data">
                        ★ {p.rating} ({p.reviewCount})
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenProductEdit(p)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 border border-stone-200 dark:border-stone-700 rounded"
                            title="Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDER & FULFILLMENT MANAGER */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              Orders & Consignments ({orders.length})
            </h3>
            <p className="text-xs text-stone-500">
              Update real-time shipment status and audit transaction callbacks.
            </p>
          </div>

          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800 text-xs">
                  <div>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      {order.orderNumber}
                    </span>
                    <span className="text-stone-400 mx-2">·</span>
                    <span className="text-stone-500">
                      {order.shippingAddress.fullName} ({order.shippingAddress.city}, {order.shippingAddress.country})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-stone-500">Update Status:</span>
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as any)}
                      className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="quality_check">Quality Check</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out For Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <img
                        src={it.productImage}
                        alt={it.productName}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded object-cover"
                      />
                      <span className="text-stone-700 dark:text-stone-300 truncate">
                        {it.quantity}× {it.productName}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-2">
                  <div className="font-mono text-[11px]">
                    Carrier: {order.carrier} · Waybill: {order.trackingNumber}
                  </div>
                  <div className="font-mono-data font-semibold text-stone-900 dark:text-stone-100">
                    Settled: ${order.pricing.total.toFixed(2)} USD via {order.payment.method.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PROMOTIONS & COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
                Promotional Courtesy Codes
              </h3>
              <p className="text-xs text-stone-500">Manage client allowances and discount tiers.</p>
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="py-2 px-4 bg-stone-900 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Promo Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map(coupon => (
              <div
                key={coupon.id}
                className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-amber-700 dark:text-amber-400">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => handleToggleCoupon(coupon.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      coupon.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {coupon.description}
                </p>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between text-stone-500 font-mono">
                  <span>
                    Benefit:{' '}
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `$${coupon.discountValue}`}
                  </span>
                  <span>Redemptions: {coupon.usageCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CUSTOMER REGISTRY */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              Registered Clients ({customers.length})
            </h3>
            <p className="text-xs text-stone-500">Client profile logs and contact indices.</p>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                <tr>
                  <th className="p-4">Collector</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="p-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{c.fullName}</div>
                      <div className="text-stone-500 font-mono text-[11px]">{c.email}</div>
                    </td>
                    <td className="p-4 text-stone-600 dark:text-stone-400 font-mono">
                      {c.phone || '—'}
                    </td>
                    <td className="p-4 capitalize">
                      <span className="font-medium text-stone-800 dark:text-stone-200">{c.role}</span>
                    </td>
                    <td className="p-4 text-stone-500 font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. STORE SETTINGS */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 sm:p-8 space-y-6 text-xs shadow-xs">
          <div>
            <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              Atelier Store Configurations
            </h3>
            <p className="text-xs text-stone-500">Configure thresholds, tax rates, and brand notices.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                Announcement Bar Banner Text
              </label>
              <input
                type="text"
                value={settings.announcementText}
                onChange={e => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Complimentary Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={e =>
                    setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                  }
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Standard Tax / GST Rate (Decimal)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.gstRate}
                  onChange={e => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Concierge Support Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Support Telephone
                </label>
                <input
                  type="tel"
                  value={settings.supportPhone}
                  onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Save Store Configuration
            </button>
          </div>
        </form>
      )}

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 max-w-xl w-full rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4 my-8">
            <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              {editingProductId ? 'Edit Product Reference' : 'Add New Creation'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name || ''}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Department / Category *
                  </label>
                  <select
                    value={productForm.category || 'audio'}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                  >
                    <option value="audio">High-Fidelity Audio</option>
                    <option value="horology">Haute Horlogerie</option>
                    <option value="leather-goods">Leather & Travel</option>
                    <option value="fragrance">Artisanal Fragrance</option>
                    <option value="eyewear">Optical & Eyewear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Brand Atelier *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.brand || 'AURA Audio Lab'}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price || 0}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Original MRP ($)
                  </label>
                  <input
                    type="number"
                    value={productForm.originalPrice || 0}
                    onChange={e =>
                      setProductForm({ ...productForm, originalPrice: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stock || 0}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Tagline / Acoustic Summary *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.tagline || ''}
                  onChange={e => setProductForm({ ...productForm, tagline: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description || ''}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Primary Image URL (Unsplash / CDN) *
                </label>
                <input
                  type="url"
                  required
                  value={productForm.images?.[0] || ''}
                  onChange={e => setProductForm({ ...productForm, images: [e.target.value] })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded font-semibold"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              Create Promotional Code
            </h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Coupon Code (e.g. VIP25) *
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.code || ''}
                  onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 font-mono uppercase text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.description || ''}
                  onChange={e => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Discount Type
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={e =>
                      setCouponForm({ ...couponForm, discountType: e.target.value as any })
                    }
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue || 0}
                    onChange={e =>
                      setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 text-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded font-semibold"
                >
                  Activate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
