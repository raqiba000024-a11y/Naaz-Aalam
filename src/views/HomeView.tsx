import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Clock, Volume2, Award } from 'lucide-react';
import { Product, Category } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { api } from '../lib/api.ts';

interface HomeViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer for seasonal atelier release
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProducts = products.filter(p => p.featured).slice(0, 3);
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Cinematic Storefront Hero */}
      <section className="relative overflow-hidden bg-stone-900 text-stone-100 min-h-[580px] lg:min-h-[660px] flex items-center">
        {/* Background Imagery with measured contrast scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=85"
            alt="AURA Master One Acoustics"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-102 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-900/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6">
            {/* Clean unboxed kicker */}
            <div className="flex items-center gap-2 text-xs tracking-widest text-amber-400 font-semibold uppercase">
              <span>Bespoke Engineering</span>
              <span aria-hidden="true">·</span>
              <span>Edition No. 04</span>
            </div>

            {/* Dominant Visual Anchor Headline */}
            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1] text-balance">
              Where Acoustic Purity Meets Swiss Precision.
            </h1>

            <p className="text-base sm:text-lg text-stone-300 font-normal leading-relaxed max-w-xl">
              Hand-finished titanium calibers, custom beryllium sound transducers, and vegetable-tanned
              Tuscan leather crafted without compromise.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('shop', 'category=audio')}
                className="py-3 px-6 bg-stone-100 hover:bg-white text-stone-950 text-sm font-semibold rounded shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Discover Acoustics</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('shop', 'category=horology')}
                className="py-3 px-6 bg-stone-800/80 hover:bg-stone-800 text-stone-100 border border-stone-700/80 text-sm font-semibold rounded transition-all cursor-pointer backdrop-blur-xs"
              >
                <span>Explore Horology</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Curated Categories Navigation Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 mb-1">
              Atelier Departments
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
              Curated Disciplines
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 group"
          >
            <span>View Full Archive</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onNavigate('shop', `category=${cat.slug}`)}
              className="group relative overflow-hidden rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 cursor-pointer aspect-4/5 flex flex-col justify-end p-4 transition-all duration-300 hover:shadow-lg"
            >
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[11px] font-mono text-stone-300">
                  {cat.itemCount} Pieces
                </span>
                <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Collection Grid (Strict 3-Column Discipline) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 mb-1">
              Hand-Selected Masterpieces
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
              The Atelier Signature
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 group"
          >
            <span>All Editions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className="h-96 rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Flash Sale / Limited Batch Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-950 text-stone-100 rounded-2xl overflow-hidden border border-stone-800 p-8 sm:p-12 relative">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase">
                <Clock className="w-4 h-4" />
                <span>Private Atelier Window · Limited Availability</span>
              </div>
              <h3 className="font-serif-display text-3xl sm:text-4xl font-semibold leading-tight text-white">
                Spring Collector&apos;s Courtesy: Up to 20% Privilege on Signature Audio & Horology
              </h3>
              <p className="text-sm text-stone-300 max-w-lg leading-relaxed">
                Use code <strong className="font-mono text-amber-300">WELCOME20</strong> or{' '}
                <strong className="font-mono text-amber-300">AURA10</strong> at checkout to apply courtesy
                allowances directly from the director&apos;s reserve.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="py-3 px-6 bg-stone-100 hover:bg-white text-stone-950 text-xs uppercase tracking-wider font-semibold rounded transition-colors"
                >
                  Shop Curated Sale
                </button>
              </div>
            </div>

            {/* Live Synchronized Countdown Block */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-stone-900/90 border border-stone-800 rounded-xl">
              <span className="text-xs uppercase tracking-widest text-stone-400 mb-3 font-medium">
                Window Closes In
              </span>
              <div className="flex items-center gap-3 font-mono-data text-stone-100">
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-bold bg-stone-800 px-3 py-2 rounded">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Hours</span>
                </div>
                <span className="text-2xl text-stone-600">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-bold bg-stone-800 px-3 py-2 rounded">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Minutes</span>
                </div>
                <span className="text-2xl text-stone-600">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-bold bg-stone-800 px-3 py-2 rounded">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trending & Best Sellers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 mb-1">
              Client Favorites
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
              Perennial Best Sellers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', 'sort=popular')}
            className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      {/* 6. Editorial Craftsmanship Rest Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100 dark:bg-stone-900 rounded-2xl p-8 sm:p-12 lg:p-16 border border-stone-200/80 dark:border-stone-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                The Atelier Standard
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-950 dark:text-stone-50 leading-tight">
                Designed to be Inherited, Not Replaced.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                In an era of disposable electronics and synthetic fashion, AURA returns to first principles:
                solid Grade 5 titanium, pure acoustic copper coils, vegetable tannins distilled from oak bark,
                and mechanical movements that tick without reliance on rechargeable battery lifespans.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <div className="text-2xl font-serif-display font-semibold text-stone-950 dark:text-stone-100">
                    68 Hours
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Mechanical reserve power in our automatic Chronos movement.
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-serif-display font-semibold text-stone-950 dark:text-stone-100">
                    40 Days
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Slow pit-tanning in Tuscan vegetable pits for our full-grain leather.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('story')}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-stone-950 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-400 transition-colors uppercase tracking-wider"
                >
                  <span>Read the Full Atelier Monograph</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
                alt="Horology Assembly"
                referrerPolicy="no-referrer"
                className="w-full h-64 object-cover rounded-xl border border-stone-200 dark:border-stone-800"
              />
              <img
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
                alt="Leather Craftsmanship"
                referrerPolicy="no-referrer"
                className="w-full h-64 object-cover rounded-xl mt-8 border border-stone-200 dark:border-stone-800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Client Reviews / Attributable Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 mb-2">
            Provenance & Critique
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-stone-950 dark:text-stone-50">
            Voices of Discerning Collectors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {'★★★★★'}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
              &quot;The acoustic staging of the Master One headphones rivals wired studio monitors twice the price.
              The lambskin cushions feel bespoke.&quot;
            </p>
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
              <div className="font-semibold text-stone-900 dark:text-stone-100">Marcus Sterling</div>
              <div className="text-stone-500 text-[11px]">Audio Producer & Recording Engineer, London</div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {'★★★★★'}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
              &quot;The 8.8mm titanium profile of the Chronos Monolith slips under dress cuffs like silk.
              The sandblasted matte texture is sublime.&quot;
            </p>
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
              <div className="font-semibold text-stone-900 dark:text-stone-100">Julian Vance</div>
              <div className="text-stone-500 text-[11px]">Principal Architect, Vance Studio Zurich</div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {'★★★★★'}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
              &quot;The Tuscan weekender duffle traveled with me across Tokyo and Milan. The leather smells divine
              and develops rich character with every journey.&quot;
            </p>
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
              <div className="font-semibold text-stone-900 dark:text-stone-100">David Thorne</div>
              <div className="text-stone-500 text-[11px]">Creative Director, Milan</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
