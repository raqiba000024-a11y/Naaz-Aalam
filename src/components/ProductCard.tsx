import React, { useState } from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface ProductCardProps {
  product: Product;
  onNavigate: (view: string, param?: string) => void;
}

export function ProductCard({ product, onNavigate }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLiked = isWishlisted(product.id);
  const hasMultipleImages = product.images.length > 1;
  const currentImage = hasMultipleImages && isHovered ? product.images[1] : product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    addToast({
      title: 'Added to Bag',
      message: `${product.name} has been added to your shopping bag.`,
      type: 'success',
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast({
      title: isLiked ? 'Removed from Wishlist' : 'Saved to Wishlist',
      message: `${product.name} ${isLiked ? 'removed from' : 'saved to'} your personal collection.`,
      type: 'info',
    });
  };

  return (
    <div
      onClick={() => onNavigate('product', product.slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col bg-stone-100/60 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl overflow-hidden hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
    >
      {/* Product Image Frame: 65-75% visual dominance */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-200/50 dark:bg-stone-800/50">
        {!imageError ? (
          <img
            src={currentImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
          />
        ) : (
          /* Zero-Broken-Image Policy Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-900 text-stone-600 dark:text-stone-300">
            <span className="font-serif-display text-lg font-semibold tracking-wider mb-1">AURA</span>
            <span className="text-xs text-center text-stone-500 line-clamp-2">{product.name}</span>
          </div>
        )}

        {/* Clean subtle top tags (no pills - subtle text kicker) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          {product.isNew && (
            <span className="text-[10px] tracking-wider uppercase font-semibold text-stone-900 bg-white/90 dark:bg-stone-900/90 dark:text-stone-100 px-2 py-0.5 rounded shadow-xs">
              New Arrival
            </span>
          )}
          {product.bestSeller && (
            <span className="text-[10px] tracking-wider uppercase font-semibold text-amber-900 bg-amber-100/90 dark:bg-amber-950/90 dark:text-amber-200 px-2 py-0.5 rounded shadow-xs">
              Best Seller
            </span>
          )}
          {product.flashSale && (
            <span className="text-[10px] tracking-wider uppercase font-semibold text-rose-900 bg-rose-100/90 dark:bg-rose-950/90 dark:text-rose-200 px-2 py-0.5 rounded shadow-xs">
              Sale -{product.flashSale.discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 shadow-sm ${
            isLiked
              ? 'bg-amber-600 text-white'
              : 'bg-white/85 text-stone-700 hover:bg-white dark:bg-stone-900/85 dark:text-stone-300 dark:hover:bg-stone-900'
          }`}
          title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay on hover */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            className="w-full py-2 px-3 bg-stone-950/90 hover:bg-stone-900 text-white dark:bg-white dark:text-stone-950 dark:hover:bg-stone-100 text-xs font-semibold rounded flex items-center justify-center gap-1.5 shadow-md backdrop-blur-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata: Brand · Category */}
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span className="uppercase tracking-wider text-[11px] font-semibold">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{product.category.replace('-', ' ')}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Tagline / Subtitle */}
          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-1 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Rating and Price Baseline */}
        <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">{product.rating}</span>
            <span className="text-stone-400">({product.reviewCount})</span>
          </div>

          <div className="flex items-baseline gap-2">
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through font-mono-data">
                ${product.originalPrice}
              </span>
            )}
            <span className="text-sm font-semibold text-stone-950 dark:text-stone-100 font-mono-data">
              ${product.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
