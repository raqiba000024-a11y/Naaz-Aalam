import React, { useState, useEffect } from 'react';
import { Search, Truck, CheckCircle2, Clock, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { Order } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface OrderTrackingViewProps {
  initialTracking?: string;
  onNavigate: (view: string, param?: string) => void;
}

export function OrderTrackingView({ initialTracking, onNavigate }: OrderTrackingViewProps) {
  const [query, setQuery] = useState(initialTracking || 'AURA-2026-8801');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (searchStr: string) => {
    if (!searchStr.trim()) return;
    setLoading(true);
    setError('');
    try {
      const found = await api.getOrder(searchStr.trim());
      setOrder(found);
    } catch (err: any) {
      setError(err.message || 'No shipment matching that reference was found.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTracking) {
      handleTrack(initialTracking);
    } else {
      // Load sample tracking by default
      handleTrack('AURA-2026-8801');
    }
  }, [initialTracking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(query);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400">
          Global Logistics Concierge
        </div>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-950 dark:text-stone-50">
          Track Your Atelier Consignment
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Monitor your temperature-controlled insured shipment from our European ateliers to your doorstep.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto pt-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter Order # or Tracking Waybill"
            className="flex-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-4 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 uppercase font-mono focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-5 bg-stone-950 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track</span>
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-16 text-center text-xs text-stone-400">
          Querying international carrier logs...
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {order && !loading && (
        <div className="space-y-8">
          {/* Status Header Overview Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                  Order Reference
                </span>
                <div className="font-serif-display text-xl font-semibold text-stone-900 dark:text-stone-100">
                  {order.orderNumber}
                </div>
              </div>
              <div className="sm:text-right space-y-0.5">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                  Carrier Waybill
                </span>
                <div className="font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {order.trackingNumber}
                </div>
                <div className="text-[11px] text-stone-500">Carrier: {order.carrier}</div>
              </div>
            </div>

            {/* Stage Timeline */}
            <div className="space-y-6">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300">
                Logistics Chronology
              </h4>
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-stone-200 dark:before:bg-stone-800">
                {order.timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <span
                      className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step.completed
                          ? 'bg-amber-600 text-white ring-4 ring-amber-100 dark:ring-amber-950'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {step.completed ? '✓' : idx + 1}
                    </span>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h4
                          className={`text-xs sm:text-sm font-semibold ${
                            step.completed
                              ? 'text-stone-900 dark:text-stone-100'
                              : 'text-stone-400 dark:text-stone-600'
                          }`}
                        >
                          {step.label}
                        </h4>
                        {step.timestamp && (
                          <span className="text-[10px] font-mono text-stone-400">
                            {new Date(step.timestamp).toLocaleDateString()} ·{' '}
                            {new Date(step.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination & Manifest summary */}
            <div className="pt-6 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-lg">
                <div className="font-semibold text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Consignment Destination</span>
                </div>
                <div className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </div>
              </div>

              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-lg">
                <div className="font-semibold text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Package Manifest</span>
                </div>
                <div className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {order.items.map((it, i) => (
                    <div key={i} className="truncate">
                      {it.quantity}× {it.productName}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
