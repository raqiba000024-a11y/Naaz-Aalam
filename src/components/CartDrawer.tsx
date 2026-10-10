import React, { useState } from 'react';
import { X, Trash2, Bookmark, Plus, Minus, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface CartDrawerProps {
  onNavigate: (view: string, param?: string) => void;
}

export function CartDrawer({ onNavigate }: CartDrawerProps) {
  const {
    items,
    savedForLater,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    saveForLaterItem,
    moveToCartItem,
    removeSavedItem,
    subtotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    amountRemainingForFreeShipping,
  } = useCart();

  const { addToast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    const res = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (res.success) {
      addToast({
        title: 'Coupon Applied',
        message: res.message,
        type: 'success',
      });
      setCouponInput('');
    } else {
      addToast({
        title: 'Coupon Error',
        message: res.message,
        type: 'error',
      });
    }
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-stone-950 dark:text-stone-50">
                Atelier Bag
              </h2>
              <div className="text-xs text-stone-500 mt-0.5">
                {items.length} {items.length === 1 ? 'creation' : 'creations'} selected
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress Banner */}
          <div className="bg-stone-100 dark:bg-stone-800/60 px-5 py-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              {amountRemainingForFreeShipping === 0 ? (
                <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Unlocked Complimentary Insured Courier
                </span>
              ) : (
                <span className="text-stone-600 dark:text-stone-400">
                  Add <strong className="text-stone-900 dark:text-stone-200 font-mono-data">${amountRemainingForFreeShipping.toFixed(0)}</strong> more for complimentary courier
                </span>
              )}
              <span className="font-mono text-[11px] text-stone-500">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items Scroll Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-serif-display text-lg text-stone-700 dark:text-stone-300 mb-2">
                  Your Atelier Bag is Empty
                </p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mb-6">
                  Explore our limited collections of precision horology, acoustics, and Tuscan leather.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    onNavigate('shop');
                  }}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 rounded-lg"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 object-cover rounded bg-stone-100 dark:bg-stone-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            closeDrawer();
                            onNavigate('product', item.product.slug);
                          }}
                          className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 truncate cursor-pointer hover:underline"
                        >
                          {item.product.name}
                        </h4>
                        <span className="text-xs font-semibold font-mono-data text-stone-900 dark:text-stone-100 shrink-0">
                          ${item.unitPrice * item.quantity}
                        </span>
                      </div>
                      {item.variant && (
                        <div className="text-[11px] text-stone-500 truncate mt-0.5">
                          {item.variant.name}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded bg-white dark:bg-stone-900 text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono text-stone-900 dark:text-stone-100 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <button
                          onClick={() => saveForLaterItem(item.id)}
                          className="hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1 text-[11px]"
                          title="Save for Later"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Saved for Later Section */}
            {savedForLater.length > 0 && (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-3">
                  Saved for Later ({savedForLater.length})
                </div>
                <div className="space-y-2">
                  {savedForLater.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded border border-dashed border-stone-200 dark:border-stone-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded object-cover"
                        />
                        <div className="truncate">
                          <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {item.product.name}
                          </div>
                          <span className="font-mono-data text-stone-500">${item.unitPrice}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveToCartItem(item.id)}
                          className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          Move to Bag
                        </button>
                        <button
                          onClick={() => removeSavedItem(item.id)}
                          className="text-stone-400 hover:text-stone-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer & Order Calculations */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 space-y-4">
              {/* Promo Code Input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2 font-mono">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{appliedCoupon.code}</span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">
                      (-${discountAmount.toFixed(2)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-stone-700 text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="Enter promo code (e.g. AURA10)"
                    className="flex-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 uppercase font-mono focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold rounded disabled:opacity-50 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono-data text-stone-900 dark:text-stone-100">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-700 dark:text-amber-400 font-medium">
                    <span>Atelier Courtesy Discount</span>
                    <span className="font-mono-data">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono-data text-stone-900 dark:text-stone-100">
                    {subtotal >= freeShippingThreshold ? 'Complimentary' : '$15.00'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>Estimated Taxes & GST (18%)</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              {/* Primary Checkout CTA */}
              <button
                onClick={() => {
                  closeDrawer();
                  onNavigate('checkout');
                }}
                className="w-full py-3.5 bg-stone-950 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[11px] text-stone-400">
                Encrypted with 256-Bit SSL · Authenticity Guaranteed
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
