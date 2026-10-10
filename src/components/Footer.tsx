import React, { useState } from 'react';
import { ShieldCheck, Truck, RefreshCw, Award, ArrowRight } from 'lucide-react';
import { api } from '../lib/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmitting(true);
    try {
      await api.subscribeNewsletter(email);
      setSubscribed(true);
      addToast({
        title: 'Gazette Subscription Confirmed',
        message: 'You will receive private previews of our limited seasonal atelier runs.',
        type: 'success',
      });
      setEmail('');
    } catch (err: any) {
      addToast({
        title: 'Subscription Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-850 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges / Guarantees Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-14 border-b border-stone-800 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Award className="w-6 h-6 text-amber-400 mb-1" />
            <h4 className="text-sm font-semibold text-stone-100">Bespoke Authenticity</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Every creation is laser serialised with a physical Atelier Certificate of Provenance.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2">
            <Truck className="w-6 h-6 text-amber-400 mb-1" />
            <h4 className="text-sm font-semibold text-stone-100">Insured Global Courier</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Signature-required insured express delivery via DHL Express to over 120 destinations.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2">
            <RefreshCw className="w-6 h-6 text-amber-400 mb-1" />
            <h4 className="text-sm font-semibold text-stone-100">30-Day Atelier Trial</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Experience the acoustics and horological craft at home with complimentary return pickup.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400 mb-1" />
            <h4 className="text-sm font-semibold text-stone-100">Lifetime Horology Care</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Our Swiss-trained watchmakers provide complimentary movement regulation for life.
            </p>
          </div>
        </div>

        {/* Brand Story & Newsletter Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-14 border-b border-stone-800">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-serif-display text-3xl font-semibold tracking-wider text-stone-100">
              AURA
            </span>
            <p className="text-xs text-stone-400 max-w-md leading-relaxed">
              Founded on the premise that everyday objects should evoke quiet contemplation. We merge
              precision mechanical engineering with artisanal leathercraft and acoustic mastery.
            </p>
            <div className="text-xs text-stone-500 font-mono">
              Atelier Zurich · Copenhagen Sound Lab · Florence Pellame
            </div>
          </div>

          {/* Newsletter signup */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-200">
              The Atelier Gazette
            </h4>
            <p className="text-xs text-stone-400">
              Receive private invitations to numbered limited batches and horological monographs.
            </p>
            {subscribed ? (
              <div className="p-3 bg-stone-900 border border-stone-800 text-xs text-amber-300 rounded">
                ✓ Thank you. Your private correspondence preference has been recorded.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 bg-stone-900 border border-stone-800 rounded px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Direct Navigation Links */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-6 text-xs">
            <div>
              <h5 className="font-semibold text-stone-200 uppercase tracking-wider mb-3">
                Collections
              </h5>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <button onClick={() => onNavigate('shop', 'category=audio')} className="hover:text-stone-100">
                    Acoustics
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('shop', 'category=horology')} className="hover:text-stone-100">
                    Horology
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('shop', 'category=leather-goods')} className="hover:text-stone-100">
                    Tuscan Leather
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('shop', 'category=fragrance')} className="hover:text-stone-100">
                    Niche Fragrance
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-stone-200 uppercase tracking-wider mb-3">
                Concierge
              </h5>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <button onClick={() => onNavigate('tracking')} className="hover:text-stone-100">
                    Track Shipment
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('account')} className="hover:text-stone-100">
                    Client Profile
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('story')} className="hover:text-stone-100">
                    Our Heritage
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('admin')} className="hover:text-stone-100">
                    Director Admin
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            © {new Date().getFullYear()} AURA Atelier Inc. All rights reserved. Registered trademark.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Service</span>
            <span aria-hidden="true">·</span>
            <span>Security & Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
