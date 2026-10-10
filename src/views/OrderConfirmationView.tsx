import React from 'react';
import { CheckCircle2, Package, Truck, Printer, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types/index.ts';

interface OrderConfirmationViewProps {
  order: Order;
  onNavigate: (view: string, param?: string) => void;
}

export function OrderConfirmationView({ order, onNavigate }: OrderConfirmationViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Success Hero */}
      <div className="text-center space-y-3 pb-8 border-b border-stone-200 dark:border-stone-800">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400">
          Transaction Verified & Reserved
        </div>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-950 dark:text-stone-50">
          Order {order.orderNumber} Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Thank you for patronizing the atelier. A digital invoice and tracking dossier have been dispatched
          to your communication terminal.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={handlePrint}
            className="py-2 px-4 border border-stone-300 dark:border-stone-700 rounded text-xs font-semibold flex items-center gap-1.5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
          <button
            onClick={() => onNavigate('tracking', order.orderNumber)}
            className="py-2 px-4 bg-stone-900 text-white rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-800 transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Live Carrier Tracking</span>
          </button>
        </div>
      </div>

      {/* Real-time Order Timeline Progress Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Live Fulfillment Status
            </span>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 capitalize">
              {order.status.replace(/_/g, ' ')}
            </h3>
          </div>
          <div className="text-xs text-stone-500 sm:text-right">
            <div>Carrier: <strong>{order.carrier}</strong></div>
            <div className="font-mono text-amber-700 dark:text-amber-400">
              Waybill: {order.trackingNumber}
            </div>
          </div>
        </div>

        {/* Timeline Steps */}
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
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Recipient and Shipping Address */}
        <div className="p-6 bg-stone-100/60 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
            Delivery Destination
          </span>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {order.shippingAddress.fullName}
          </div>
          <div className="text-stone-600 dark:text-stone-400 leading-relaxed">
            {order.shippingAddress.street}
            {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
            <br />
            Phone: {order.shippingAddress.phone}
          </div>
        </div>

        {/* Payment Verification Record */}
        <div className="p-6 bg-stone-100/60 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
            Settlement & Audit
          </span>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 capitalize">
            Payment Method: {order.payment.method.toUpperCase()}
          </div>
          <div className="text-stone-600 dark:text-stone-400 space-y-1">
            <div>
              Transaction Ref:{' '}
              <span className="font-mono text-stone-900 dark:text-stone-100">
                {order.payment.transactionId}
              </span>
            </div>
            <div>
              Status: <span className="font-semibold text-emerald-600">VERIFIED & AUTHORIZED</span>
            </div>
            <div>
              Total Settled:{' '}
              <strong className="font-mono text-stone-900 dark:text-stone-100">
                ${order.pricing.total.toFixed(2)} USD
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Return to Catalog / Account */}
      <div className="pt-6 text-center">
        <button
          onClick={() => onNavigate('shop')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-stone-900 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-400"
        >
          <span>Continue Discovering Creations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
