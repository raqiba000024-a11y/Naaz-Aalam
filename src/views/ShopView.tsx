import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check } from 'lucide-react';
import { Product, Category } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { api } from '../lib/api.ts';

interface ShopViewProps {
  initialQuery?: string;
  onNavigate: (view: string, param?: string) => void;
}

export function ShopView({ initialQuery, onNavigate }: ShopViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [priceRange, setPriceRange] = useState<number>(2500);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Parse initial query params (e.g. "category=audio" or "search=watch")
  useEffect(() => {
    if (initialQuery) {
      const params = new URLSearchParams(initialQuery);
      const cat = params.get('category');
      const search = params.get('search');
      const sort = params.get('sort');
      if (cat) setSelectedCategory(cat);
      if (search) setSearchQuery(search);
      if (sort) setSortBy(sort);
    }
  }, [initialQuery]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allCats, allProds] = await Promise.all([
          api.getCategories(),
          api.getProducts({
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchQuery || undefined,
            sort: sortBy,
            maxPrice: priceRange,
          }),
        ]);
        setCategories(allCats);
        let filtered = allProds;
        if (onlyInStock) {
          filtered = filtered.filter(p => p.stock > 0);
        }
        if (selectedTag) {
          filtered = filtered.filter(p => p.tags.includes(selectedTag));
        }
        setProducts(filtered);
      } catch (err) {
        console.error('Failed to load shop products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory, searchQuery, sortBy, priceRange, onlyInStock, selectedTag]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('popular');
    setPriceRange(2500);
    setOnlyInStock(false);
    setSelectedTag('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery !== '' ||
    priceRange < 2500 ||
    onlyInStock ||
    selectedTag !== '';

  const allTags = ['audiophile', 'automatic', 'titanium', 'handcrafted', 'luxury', 'travel', 'niche'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Department Title */}
      <div className="mb-8 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-2">
          Atelier Archive / Catalog
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-950 dark:text-stone-50 capitalize">
              {selectedCategory === 'all'
                ? 'All Atelier Collections'
                : selectedCategory.replace('-', ' ')}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Precision-calibrated acoustic instruments, mechanical horology, and Tuscan leather goods.
            </p>
          </div>

          {/* Quick Category Tab Buttons (Functional Filter Controls per Frontend Constitution) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer capitalize ${
                  selectedCategory === c.slug
                    ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-stone-100 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {c.slug.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 pr-4 border-r border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>Refine Catalog</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
              <span>Maximum Price</span>
              <span className="font-mono-data text-stone-950 dark:text-stone-100 font-semibold">
                ${priceRange} USD
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={priceRange}
              onChange={e => setPriceRange(Number(e.target.value))}
              className="w-full accent-stone-900 dark:accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-mono">
              <span>$100</span>
              <span>$2,500</span>
            </div>
          </div>

          {/* In-Stock Toggle */}
          <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800">
            <label className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="rounded border-stone-300 dark:border-stone-700 text-stone-900 focus:ring-0 accent-stone-900 dark:accent-amber-500 w-4 h-4"
              />
              <span className="font-medium">In-Stock Pieces Only</span>
            </label>
          </div>

          {/* Curated Tags */}
          <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Craftsmanship Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    selectedTag === tag
                      ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid & Sorting Bar */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 dark:border-stone-800 gap-4">
            <div className="text-xs text-stone-500">
              Showing <strong className="text-stone-900 dark:text-stone-100">{products.length}</strong> creations
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden px-3 py-1.5 border border-stone-300 dark:border-stone-700 rounded text-xs font-medium flex items-center gap-1.5 text-stone-700 dark:text-stone-300"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-transparent border border-stone-200 dark:border-stone-800 rounded px-3 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="popular">Most Coveted</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest Releases</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                Filters:
              </span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')}>✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')}>✕</button>
                </span>
              )}
              {selectedTag && (
                <span className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded">
                  #{selectedTag}
                  <button onClick={() => setSelectedTag('')}>✕</button>
                </span>
              )}
              {priceRange < 2500 && (
                <span className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded font-mono">
                  &le; ${priceRange}
                  <button onClick={() => setPriceRange(2500)}>✕</button>
                </span>
              )}
              {onlyInStock && (
                <span className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded">
                  In Stock Only
                  <button onClick={() => setOnlyInStock(false)}>✕</button>
                </span>
              )}
            </div>
          )}

          {/* Grid Render */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div
                  key={n}
                  className="h-96 rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-8">
              <h3 className="font-serif-display text-xl font-semibold text-stone-800 dark:text-stone-200 mb-2">
                No matching creations found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                Try widening your price range or clearing filters to view available masterworks.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-in Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileFiltersOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-stone-900 p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Refine Catalog
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Max Price</span>
                  <span className="font-mono-data font-semibold">${priceRange}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2500"
                  step="50"
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* In stock */}
              <div>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={e => setOnlyInStock(e.target.checked)}
                  />
                  <span>In-Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-2.5 bg-stone-950 text-white text-xs font-semibold rounded"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
