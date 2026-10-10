import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingBag,
  ArrowRight,
  Share2,
  Check,
  Video,
  Play,
  RotateCw,
  Plus,
  Minus,
} from 'lucide-react';
import { Product, ProductVariant, ProductReview } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { api } from '../lib/api.ts';

interface ProductDetailViewProps {
  slugOrId: string;
  onNavigate: (view: string, param?: string) => void;
}

export function ProductDetailView({ slugOrId, onNavigate }: ProductDetailViewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'gallery' | 'video' | 'specs'>('gallery');

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    async function loadProductData() {
      setLoading(true);
      try {
        const prod = await api.getProduct(slugOrId);
        setProduct(prod);
        setSelectedVariant(prod.variants[0] || null);

        const [revs, allProds] = await Promise.all([
          api.getReviews(prod.id),
          api.getProducts({ category: prod.category }),
        ]);
        setReviews(revs);
        setRelatedProducts(allProds.filter(p => p.id !== prod.id).slice(0, 3));

        // Dynamic Document Title and SEO metadata
        document.title = `${prod.name} — AURA Atelier`;

        // Inject Product Schema JSON-LD
        const scriptId = 'jsonld-product-schema';
        let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!scriptTag) {
          scriptTag = document.createElement('script');
          scriptTag.id = scriptId;
          scriptTag.type = 'application/ld+json';
          document.head.appendChild(scriptTag);
        }
        scriptTag.text = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: prod.name,
          image: prod.images,
          description: prod.description,
          brand: {
            '@type': 'Brand',
            name: prod.brand,
          },
          offers: {
            '@type': 'Offer',
            price: prod.price,
            priceCurrency: 'USD',
            availability: prod.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: prod.rating,
            reviewCount: prod.reviewCount || 1,
          },
        });
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 h-[500px] bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-6 w-1/3 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
            <div className="h-24 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif-display font-semibold mb-2">Piece Not Found</h2>
        <p className="text-sm text-stone-500 mb-6">The requested atelier creation is currently unavailable.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-stone-900 text-white rounded text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice || product.originalPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isLiked = isWishlisted(product.id);

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    addItem(product, selectedVariant || undefined, quantity);
    addToast({
      title: 'Added to Atelier Bag',
      message: `${quantity}× ${product.name} (${selectedVariant?.name || 'Standard'}) added.`,
      type: 'success',
    });
  };

  const handleDirectBuy = () => {
    addItem(product, selectedVariant || undefined, quantity);
    onNavigate('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle || !reviewComment) return;
    setIsSubmittingReview(true);
    try {
      const newRev = await api.submitReview(product.id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        userName: reviewAuthor || 'Collector',
      });
      setReviews(prev => [newRev, ...prev]);
      setIsReviewModalOpen(false);
      setReviewTitle('');
      setReviewComment('');
      addToast({
        title: 'Review Inscribed',
        message: 'Your critical impression has been verified and registered.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Submission Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={() => onNavigate('home')} className="hover:text-stone-900 dark:hover:text-stone-100">
          Home
        </button>
        <span aria-hidden="true">/</span>
        <button
          onClick={() => onNavigate('shop', `category=${product.category}`)}
          className="hover:text-stone-900 dark:hover:text-stone-100 capitalize"
        >
          {product.category.replace('-', ' ')}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-stone-900 dark:text-stone-100 font-medium truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main PDP Grid: Sticky Gallery (Left) & Contiguous Purchase Module (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left: Gallery Module */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-28">
          {/* Main Visual Viewer */}
          <div className="relative aspect-4/3 w-full bg-stone-100 dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800">
            {activeTab === 'gallery' ? (
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-stone-950 flex flex-col items-center justify-center p-6 text-stone-100">
                <Video className="w-12 h-12 text-amber-400 mb-3" />
                <h4 className="text-sm font-semibold mb-1">Acoustic Calibration & Movement Video</h4>
                <p className="text-xs text-stone-400 max-w-xs text-center mb-4">
                  Recorded in lossless binaural studio sound with precision micro-cinematography.
                </p>
                <a
                  href={product.videoUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-4 bg-stone-100 text-stone-950 text-xs font-semibold rounded flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch High-Bitrate Reel</span>
                </a>
              </div>
            )}

            {/* Media Mode Switcher */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 p-1 bg-stone-900/80 backdrop-blur-md rounded-lg text-xs text-stone-200">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'gallery' ? 'bg-white text-stone-950 font-semibold' : 'hover:text-white'
                }`}
              >
                Photography
              </button>
              {product.videoUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                    activeTab === 'video' ? 'bg-white text-stone-950 font-semibold' : 'hover:text-white'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  <span>Atelier Reel</span>
                </button>
              )}
            </div>

            {/* Wishlist Floating Toggle */}
            <button
              onClick={() => {
                toggleWishlist(product.id);
                addToast({
                  title: isLiked ? 'Removed from Wishlist' : 'Saved to Wishlist',
                  message: `${product.name} ${isLiked ? 'removed from' : 'saved to'} your personal collection.`,
                });
              }}
              className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md backdrop-blur-xs transition-colors ${
                isLiked
                  ? 'bg-amber-600 text-white'
                  : 'bg-white/90 text-stone-700 hover:bg-white dark:bg-stone-900/90 dark:text-stone-200'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab('gallery');
                    setActiveImageIndex(idx);
                  }}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx && activeTab === 'gallery'
                      ? 'border-stone-900 dark:border-amber-400 scale-95'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Provenance & Atelier Certificate Story */}
          {product.story && (
            <div className="p-6 rounded-xl bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Atelier Monograph & Provenance
              </span>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic">
                &quot;{product.story}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-widest font-semibold">
              <span>{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{product.attributes.origin || 'European Atelier'}</span>
            </div>

            <h1 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-950 dark:text-stone-50 leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {product.tagline}
            </p>
          </div>

          {/* Rating & Review Jump Link */}
          <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400 pb-4 border-b border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="font-semibold text-stone-900 dark:text-stone-100 font-mono-data">
                {product.rating}
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <span className="underline cursor-pointer" onClick={() => {
              const el = document.getElementById('reviews-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}>
              {product.reviewCount} Verified Collector Evaluations
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              In Stock & Ready for Dispatch
            </span>
          </div>

          {/* Pricing Block */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-semibold font-mono-data text-stone-950 dark:text-stone-100">
              ${currentPrice} USD
            </span>
            {currentOriginalPrice && (
              <span className="text-sm font-mono-data text-stone-400 line-through">
                ${currentOriginalPrice} USD
              </span>
            )}
            {product.flashSale && (
              <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded">
                Courtesy Allowance -{product.flashSale.discountPercent}%
              </span>
            )}
          </div>

          {/* Variant Selector (Colors / Finishes / Sizes) */}
          {product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  Select Finish / Edition
                </span>
                <span className="text-stone-500">{selectedVariant?.name}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedVariant?.id === variant.id
                        ? 'border-stone-950 dark:border-stone-100 bg-stone-100/80 dark:bg-stone-800 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {variant.colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                      )}
                      <div className="truncate">
                        <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {variant.name}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {variant.stock > 0 ? `${variant.stock} available` : 'Sold out'}
                        </div>
                      </div>
                    </div>
                    {selectedVariant?.id === variant.id && (
                      <Check className="w-4 h-4 text-stone-950 dark:text-stone-100 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls & Inventory Alert */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-900 dark:text-stone-100">Allocation</span>
              <span className="text-stone-500">
                {currentStock < 10 ? (
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">
                    Only {currentStock} units remaining in reserve
                  </span>
                ) : (
                  'Complimentary insured courier delivery'
                )}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-900 text-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-stone-500 hover:text-stone-950 dark:hover:text-stone-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-mono font-semibold text-stone-900 dark:text-stone-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2.5 text-stone-500 hover:text-stone-950 dark:hover:text-stone-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="flex-1 py-3 px-6 bg-stone-950 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{currentStock > 0 ? 'Inscribe to Bag' : 'Allocation Exhausted'}</span>
              </button>
            </div>

            {/* Direct Express Checkout */}
            <button
              onClick={handleDirectBuy}
              disabled={currentStock <= 0}
              className="w-full py-3 px-6 bg-stone-900/10 hover:bg-stone-900/20 text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Direct Express Checkout
            </button>
          </div>

          {/* Delivery & Assurance Details */}
          <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 space-y-3 text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Complimentary insured air courier with signature confirmation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Includes Certificate of Authenticity and 3-Year Atelier Warranty</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>30-Day home evaluation period with prepaid insured return courier</span>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-900 dark:text-stone-100">
              Technical Specifications
            </h4>
            <div className="divide-y divide-stone-200/60 dark:divide-stone-800 text-xs">
              {Object.entries(product.attributes).map(([key, val]) => (
                <div key={key} className="py-2 flex justify-between">
                  <span className="text-stone-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-stone-900 dark:text-stone-200 font-medium text-right max-w-xs">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section id="reviews-section" className="pt-12 border-t border-stone-200 dark:border-stone-800 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 mb-1">
              Verified Client Provenance
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-stone-950 dark:text-stone-50">
              Collector Evaluations ({reviews.length})
            </h2>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded transition-colors self-start sm:self-auto"
          >
            Submit an Evaluation
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-stone-100/50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800">
            <p className="text-xs text-stone-500">
              No public evaluations inscribed for this reference yet. Be the first to share your impression.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <div
                key={review.id}
                className="p-6 rounded-xl bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {new Date(review.createdAt).toISOString().split('T')[0]}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {review.title}
                </h4>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {review.comment}
                </p>

                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200">
                    <span>{review.userName}</span>
                    {review.verifiedPurchase && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        · Verified Collector
                      </span>
                    )}
                  </div>
                  <span>{review.helpfulCount} found helpful</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-stone-200 dark:border-stone-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl font-semibold text-stone-950 dark:text-stone-50">
              Related Atelier Pieces
            </h2>
            <button
              onClick={() => onNavigate('shop', `category=${product.category}`)}
              className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:underline flex items-center gap-1"
            >
              <span>Explore Department</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-serif-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              Inscribe an Evaluation
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Collector Name
                </label>
                <input
                  type="text"
                  value={reviewAuthor}
                  onChange={e => setReviewAuthor(e.target.value)}
                  placeholder="e.g. Julian Vance"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Summary Headline
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  placeholder="e.g. Exceptional acoustic separation"
                  required
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Critique & Impressions
                </label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Describe the tactile feel, audio response, or horological precision..."
                  rows={4}
                  required
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 bg-stone-900 text-white text-xs font-semibold rounded disabled:opacity-50"
                >
                  Inscribe Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
