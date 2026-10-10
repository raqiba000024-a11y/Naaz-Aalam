import React from 'react';
import { ArrowRight, ShieldCheck, Award, Sparkles, Compass } from 'lucide-react';

interface StoryViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export function StoryView({ onNavigate }: StoryViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Editorial Title */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400">
          The Atelier Manifesto
        </span>
        <h1 className="font-serif-display text-4xl sm:text-5xl font-semibold text-stone-950 dark:text-stone-50 leading-[1.15] text-balance">
          The Preservation of Material Truth in an Age of Ephemeral Objects.
        </h1>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
          Founded in 2026, AURA is an independent luxury atelier bridging acoustic science,
          mechanical watchmaking, and artisanal leathercraft. We do not design for obsolescence.
        </p>
      </div>

      {/* Hero Visual Frame */}
      <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=2000&q=85"
          alt="Artisan at work"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 text-white text-xs font-mono">
          Horological bench assembly · Le Locle, Jura Mountains
        </div>
      </div>

      {/* Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="p-8 bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif-display text-xl font-semibold text-stone-900 dark:text-stone-100">
            Acoustic Integrity
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Our headphone transducers use vapor-deposited beryllium diaphragms calibrated to match human ear
            canal resonance curves, delivering linear harmonic fidelity without artificial digital coloration.
          </p>
        </div>

        <div className="p-8 bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center mb-2">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-serif-display text-xl font-semibold text-stone-900 dark:text-stone-100">
            Swiss Horology
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Milled from solid aerospace Grade 5 titanium blocks with anti-reflective sapphire crystals.
            Regulated by our master watchmakers to within chronometer precision.
          </p>
        </div>

        <div className="p-8 bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center mb-2">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-serif-display text-xl font-semibold text-stone-900 dark:text-stone-100">
            Tuscan Vegetable Leather
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Tanned over forty days using natural chestnut and mimosa bark tannins along the Arno river.
            No heavy metals or synthetic coatings—only pure grain that ages with deep caramel warmth.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <button
          onClick={() => onNavigate('shop')}
          className="py-3 px-8 bg-stone-950 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-xs font-semibold uppercase tracking-wider rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span>Explore Available Editions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
