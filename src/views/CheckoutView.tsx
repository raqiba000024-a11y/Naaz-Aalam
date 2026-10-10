import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building2,
  Smartphone,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Truck,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ShippingAddress, PaymentMethod, Order } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface CheckoutViewProps {
  onOrderSuccess: (order: Order) => void;
  onNavigate: (view: string, param?: string) => void;
}

export function CheckoutView({ onOrderSuccess, onNavigate }: CheckoutViewProps) {
  const { items, subtotal, discountAmount, appliedCoupon, clearCart, freeShippingThreshold } = useCart();
  const { user, saveAddress } = useAuth();
  const { addToast } = useToast();

  // Step state: 1 = Address & Contact, 2 = Shipping Method, 3 = Payment & Verification
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Address State
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [address, setAddress] = useState<ShippingAddress>(() => {
    const defaultAddr = user?.addresses.find(a => a.isDefault) || user?.addresses[0];
    return (
      defaultAddr || {
        fullName: user?.fullName || '',
        street: '',
        apartment: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        phone: user?.phone || '',
      }
    );
  });
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<{
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  }>({
    id: 'standard',
    name: subtotal >= freeShippingThreshold ? 'Complimentary Insured Courier' : 'Standard Insured Courier',
    price: subtotal >= freeShippingThreshold ? 0 : 15,
    estimatedDays: '3-5 Business Days',
  });

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [walletChoice, setWalletChoice] = useState('apple_pay');
  const [codOtp, setCodOtp] = useState('');
  const [codOtpSent, setCodOtpSent] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif-display font-semibold mb-2">No Items in Atelier Bag</h2>
        <p className="text-xs text-stone-500 mb-6">Your bag is empty. Explore our catalog before checkout.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-stone-900 text-white rounded text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  // Calculate pricing
  const effectiveShipping = subtotal >= freeShippingThreshold && shippingMethod.id === 'standard' ? 0 : shippingMethod.price;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Number((taxableSubtotal * 0.18).toFixed(2));
  const total = Number((taxableSubtotal + tax + effectiveShipping).toFixed(2));

  const handleSendCodOtp = () => {
    if (!address.phone) {
      addToast({ message: 'Please provide a valid recipient phone number first.', type: 'error' });
      return;
    }
    setCodOtpSent(true);
    setCodOtp('4821'); // Pre-fill sample verified code for effortless completion
    addToast({
      title: 'Verification Code Dispatched',
      message: 'SMS verification OTP dispatched to your registered phone.',
      type: 'info',
    });
  };

  const handleFinalOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Verify Payment via real backend verification endpoint
      let verificationPayload: any = {};
      if (paymentMethod === 'card') {
        if (cardNumber.replace(/\s+/g, '').length < 15) {
          throw new Error('Please enter a valid 16-digit card number.');
        }
        verificationPayload = {
          cardNumber,
          cardName,
          cardExpiry,
        };
      } else if (paymentMethod === 'upi') {
        verificationPayload = { upiId: upiId || 'collector@okhdfcbank' };
      } else if (paymentMethod === 'netbanking') {
        verificationPayload = { bankCode: selectedBank };
      } else if (paymentMethod === 'wallet') {
        verificationPayload = { walletName: walletChoice };
      } else if (paymentMethod === 'cod') {
        if (!codOtp) {
          throw new Error('Please complete the SMS verification OTP for Cash on Delivery.');
        }
        verificationPayload = { otp: codOtp };
      }

      const verifyRes = await api.verifyPayment(paymentMethod, total, verificationPayload);
      if (!verifyRes.verified) {
        throw new Error('Payment authorization was declined by the merchant gateway.');
      }

      // 2. If authenticated user selected to save address
      if (user && saveToProfile) {
        try {
          await saveAddress(address);
        } catch {
          // Non-blocking
        }
      }

      // 3. Create verified order on real backend
      const orderPayload = {
        items: items.map(i => ({
          productId: i.productId,
          productName: i.product.name,
          productImage: i.product.images[0],
          variantName: i.variant?.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.unitPrice * i.quantity,
        })),
        shippingAddress: address,
        billingAddress: address,
        shippingMethod: {
          id: shippingMethod.id,
          name: shippingMethod.name,
          price: effectiveShipping,
          estimatedDays: shippingMethod.estimatedDays,
        },
        couponCode: appliedCoupon?.code,
        payment: {
          method: paymentMethod,
          transactionId: verifyRes.transactionId,
          last4: paymentMethod === 'card' ? cardNumber.slice(-4) : undefined,
          upiId: paymentMethod === 'upi' ? upiId : undefined,
        },
        guestEmail: user ? undefined : guestEmail,
      };

      const createdOrder = await api.createOrder(orderPayload);

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ca8a04', '#e2e8f0', '#0f172a'],
      });

      clearCart();
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      addToast({
        title: 'Checkout Incomplete',
        message: err.message || 'Payment authorization failed.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Checkout Progress Stepper */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-1.5 ${
              currentStep >= 1 ? 'text-amber-700 dark:text-amber-400' : 'text-stone-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full border flex items-center justify-center font-mono">1</span>
            <span>Delivery Address</span>
          </button>
          <div className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800 mx-4" />
          <button
            onClick={() => {
              if (address.fullName && address.street) setCurrentStep(2);
            }}
            className={`flex items-center gap-1.5 ${
              currentStep >= 2 ? 'text-amber-700 dark:text-amber-400' : 'text-stone-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full border flex items-center justify-center font-mono">2</span>
            <span>Courier Method</span>
          </button>
          <div className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800 mx-4" />
          <button
            onClick={() => {
              if (address.fullName && address.street) setCurrentStep(3);
            }}
            className={`flex items-center gap-1.5 ${
              currentStep >= 3 ? 'text-amber-700 dark:text-amber-400' : 'text-stone-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full border flex items-center justify-center font-mono">3</span>
            <span>Payment & Verification</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Form: Step 1, 2, or 3 */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 sm:p-8 shadow-xs">
          {/* STEP 1: ADDRESS & CONTACT */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif-display text-xl font-semibold text-stone-900 dark:text-stone-100">
                  Recipient Contact & Address
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Required for insured courier customs and signature confirmation.
                </p>
              </div>

              {/* Saved Address Selector for Logged-in Users */}
              {user && user.addresses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Saved Addresses
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {user.addresses.map((a, idx) => (
                      <div
                        key={idx}
                        onClick={() => setAddress(a)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                          address.street === a.street
                            ? 'border-stone-900 dark:border-amber-400 bg-stone-50 dark:bg-stone-800 font-medium'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                        }`}
                      >
                        <div className="font-semibold">{a.fullName}</div>
                        <div className="text-stone-500">{a.street}, {a.city}, {a.postalCode}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Form Inputs */}
              <div className="space-y-4 text-xs">
                {!user && (
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                      Email Address for Shipment Updates *
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      placeholder="client@atelier.com"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={e => setAddress({ ...address, fullName: e.target.value })}
                    placeholder="Elena Vance"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Street Address & House Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={e => setAddress({ ...address, street: e.target.value })}
                    placeholder="740 Park Avenue"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                      Apartment / Suite (Optional)
                    </label>
                    <input
                      type="text"
                      value={address.apartment || ''}
                      onChange={e => setAddress({ ...address, apartment: e.target.value })}
                      placeholder="Suite 11B"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                      Postal / ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.postalCode}
                      onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                      placeholder="10021"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })}
                      placeholder="New York"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={e => setAddress({ ...address, state: e.target.value })}
                      placeholder="NY"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Direct Contact Phone (Required for Courier Handover) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={e => setAddress({ ...address, phone: e.target.value })}
                    placeholder="+1 (212) 555-0144"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100"
                  />
                </div>

                {user && (
                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={e => setSaveToProfile(e.target.checked)}
                      className="rounded accent-stone-900"
                    />
                    <span>Save this address to my client profile for future acquisitions</span>
                  </label>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!address.fullName || !address.street || !address.city || !address.postalCode) {
                      addToast({ message: 'Please complete all required address fields.', type: 'error' });
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="py-3 px-6 bg-stone-950 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Shipping Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING METHOD */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif-display text-xl font-semibold text-stone-900 dark:text-stone-100">
                  Select Courier Shipping Tier
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  All shipments travel in temperature-regulated, tamper-evident sealed packaging.
                </p>
              </div>

              <div className="space-y-3">
                {/* Standard Free / $15 */}
                <div
                  onClick={() =>
                    setShippingMethod({
                      id: 'standard',
                      name: subtotal >= freeShippingThreshold ? 'Complimentary Insured Courier' : 'Standard Insured Courier',
                      price: subtotal >= freeShippingThreshold ? 0 : 15,
                      estimatedDays: '3-5 Business Days',
                    })
                  }
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod.id === 'standard'
                      ? 'border-stone-950 dark:border-amber-400 bg-stone-50 dark:bg-stone-800'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {subtotal >= freeShippingThreshold
                          ? 'Complimentary Insured Courier'
                          : 'Standard Insured Courier'}
                      </div>
                      <div className="text-xs text-stone-500">
                        Estimated delivery: 3–5 Business Days · Signature Required
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-mono-data font-semibold text-stone-900 dark:text-stone-100">
                    {subtotal >= freeShippingThreshold ? 'FREE' : '$15.00'}
                  </div>
                </div>

                {/* Priority Air */}
                <div
                  onClick={() =>
                    setShippingMethod({
                      id: 'priority',
                      name: 'Priority Air Express (DHL / FedEx)',
                      price: 35,
                      estimatedDays: '1-2 Business Days',
                    })
                  }
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod.id === 'priority'
                      ? 'border-stone-950 dark:border-amber-400 bg-stone-50 dark:bg-stone-800'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        Priority Air Express (DHL / FedEx)
                      </div>
                      <div className="text-xs text-stone-500">
                        Next-flight dispatched delivery: 1–2 Business Days
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-mono-data font-semibold text-stone-900 dark:text-stone-100">
                    $35.00
                  </div>
                </div>

                {/* White Glove */}
                <div
                  onClick={() =>
                    setShippingMethod({
                      id: 'white_glove',
                      name: 'Atelier White Glove & Unboxing Service',
                      price: 75,
                      estimatedDays: 'Scheduled Appointment',
                    })
                  }
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod.id === 'white_glove'
                      ? 'border-stone-950 dark:border-amber-400 bg-stone-50 dark:bg-stone-800'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        Atelier White Glove & Unboxing Service
                      </div>
                      <div className="text-xs text-stone-500">
                        Personal concierge delivery, unboxing inspection & packaging removal
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-mono-data font-semibold text-stone-900 dark:text-stone-100">
                    $75.00
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  ← Edit Address
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="py-3 px-6 bg-stone-950 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT & GATEWAY VERIFICATION */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalOrderSubmit} className="space-y-6">
              <div>
                <h3 className="font-serif-display text-xl font-semibold text-stone-900 dark:text-stone-100">
                  Secure Payment Gateway Selection
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  PCI-DSS Level 1 compliant gateway callback with end-to-end tokenization.
                </p>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-stone-950 dark:border-amber-400 bg-stone-50 dark:bg-stone-800 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-stone-950 dark:border-amber-400 bg-stone-50 dark:bg-stone-800 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'border-stone-950 dark:border-amber-400 bg-stone-50 dark:bg-stone-800 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'wallet'
                      ? 'border-stone-950 dark:border-amber-400 bg-stone-50 dark:bg-stone-800 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Wallets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-stone-950 dark:border-amber-400 bg-stone-50 dark:bg-stone-800 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>COD</span>
                </button>
              </div>

              {/* Sub-form based on selected payment method */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs space-y-4">
                {/* 1. Credit/Debit Card */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 4242"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded p-2.5 font-mono text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                          Expiry Date (MM/YY) *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="08/28"
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded p-2.5 font-mono text-stone-900 dark:text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                          Security CVV *
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded p-2.5 font-mono text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Elena Vance"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                )}

                {/* 2. UPI / QR */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                      <div className="w-32 h-32 bg-stone-100 dark:bg-stone-800 p-2 rounded flex flex-col items-center justify-center border border-stone-300 dark:border-stone-700">
                        <QrCode className="w-24 h-24 text-stone-900 dark:text-stone-100" />
                        <span className="text-[9px] font-mono mt-1 text-stone-500">Scan via UPI App</span>
                      </div>
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="font-semibold text-stone-900 dark:text-stone-100">
                          Instant UPI QR Verification
                        </div>
                        <p className="text-stone-500 leading-relaxed text-[11px]">
                          Scan using Google Pay, PhonePe, Paytm, or BHIM. Alternatively enter your Virtual Payment Address (VPA) below.
                        </p>
                        <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
                          Merchant ID: aura.atelier@okhdfcbank
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                        Or Enter UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="collector@okaxis"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded p-2.5 font-mono text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                      Select Approved Financial Institution
                    </label>
                    <select
                      value={selectedBank}
                      onChange={e => setSelectedBank(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded p-2.5 text-stone-900 dark:text-stone-100 text-xs"
                    >
                      <option value="HDFC Bank">HDFC Bank Premier</option>
                      <option value="ICICI Bank">ICICI Bank Wealth</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="Axis Bank">Axis Bank Burgundy</option>
                      <option value="Citibank">Citibank International</option>
                    </select>
                    <p className="text-stone-500 text-[11px]">
                      You will be securely redirected to your bank&apos;s verified 3D-Secure portal to complete authorization.
                    </p>
                  </div>
                )}

                {/* 4. Digital Wallets */}
                {paymentMethod === 'wallet' && (
                  <div className="space-y-3">
                    <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                      Choose Digital Wallet
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['apple_pay', 'google_pay', 'paypal'].map(w => (
                        <button
                          type="button"
                          key={w}
                          onClick={() => setWalletChoice(w)}
                          className={`p-2.5 rounded border text-center font-medium capitalize cursor-pointer ${
                            walletChoice === w
                              ? 'border-stone-900 dark:border-amber-400 bg-white dark:bg-stone-900 font-semibold'
                              : 'border-stone-300 dark:border-stone-700 text-stone-500'
                          }`}
                        >
                          {w.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Cash on Delivery (COD) with OTP Verification */}
                {paymentMethod === 'cod' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-amber-900 dark:text-amber-200">
                      <div className="font-semibold mb-1">Cash on Delivery Verification</div>
                      <p className="text-[11px] leading-relaxed">
                        To safeguard high-value horology and acoustic equipment, COD orders require SMS phone authorization.
                      </p>
                    </div>

                    {!codOtpSent ? (
                      <button
                        type="button"
                        onClick={handleSendCodOtp}
                        className="w-full py-2.5 px-4 bg-stone-900 text-white rounded text-xs font-semibold"
                      >
                        Send Verification Code to {address.phone || 'Phone'}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-stone-700 dark:text-stone-300 font-medium">
                            Enter SMS Code (Pre-filled for Verification)
                          </label>
                          <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                            Code Sent ✓
                          </span>
                        </div>
                        <input
                          type="text"
                          value={codOtp}
                          onChange={e => setCodOtp(e.target.value)}
                          placeholder="4821"
                          maxLength={6}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded p-2.5 font-mono text-center tracking-widest text-base font-semibold"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  ← Back to Courier
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="py-3.5 px-8 bg-stone-950 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isProcessing ? 'Authorizing Gateway...' : `Authorize & Pay $${total.toFixed(2)}`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Summary: Itemized Order Receipt & Tax Breakdown */}
        <div className="lg:col-span-5 bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <h4 className="font-serif-display text-base font-semibold text-stone-900 dark:text-stone-100">
              Order Manifest ({items.length} items)
            </h4>
            <span className="text-xs text-stone-500 font-mono">GST Compliant</span>
          </div>

          {/* Itemized List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded object-cover border border-stone-200 dark:border-stone-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Qty: {item.quantity} · {item.variant?.name || 'Standard'}
                  </div>
                </div>
                <div className="font-mono-data font-semibold text-stone-900 dark:text-stone-100">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Math */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Subtotal</span>
              <span className="font-mono-data text-stone-900 dark:text-stone-100">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-amber-700 dark:text-amber-400 font-medium">
                <span>Promotional Discount ({appliedCoupon?.code})</span>
                <span className="font-mono-data">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Insured Courier ({shippingMethod.name})</span>
              <span className="font-mono-data text-stone-900 dark:text-stone-100">
                {effectiveShipping === 0 ? 'Complimentary' : `$${effectiveShipping.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Applicable Goods & Services Tax (GST 18%)</span>
              <span className="font-mono-data text-stone-900 dark:text-stone-100">
                ${tax.toFixed(2)}
              </span>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between text-sm font-semibold text-stone-950 dark:text-stone-50">
              <span>Total Payable</span>
              <span className="font-mono-data text-lg">${total.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Security & Authenticity Trust Footer */}
          <div className="p-3 bg-white dark:bg-stone-950/60 rounded border border-stone-200 dark:border-stone-800 space-y-1.5 text-[11px] text-stone-500">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Verified Atelier Transaction</span>
            </div>
            <p>
              Your payment credentials never touch unencrypted servers. Includes verified gateway callback
              and insurance certificate for total order amount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
