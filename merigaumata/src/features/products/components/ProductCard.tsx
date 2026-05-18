'use client';

import Image from 'next/image';
import { ShoppingBag, Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { Product } from '../types/products.types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('products');
  const { addItem } = useCartStore();

  const discountPercent = product.mrp && product.price < product.mrp 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const isSale = product.isSale || discountPercent > 0;
  const isNew = product.createdAt 
    ? (new Date(product.createdAt).getTime() > new Date().getTime() - 60 * 24 * 60 * 60 * 1000) 
    : false;

  // Dynamically assign badges based on product attributes to replicate the visual diversity
  let badgeText = '';
  if (product.rating && product.rating >= 4.7 && Number(product.id.replace('p', '')) % 2 === 0) {
    badgeText = t('bestSeller');
  } else if (isSale && Number(product.id.replace('p', '')) % 3 === 0) {
    badgeText = t('limitedOffer');
  } else if (isNew) {
    badgeText = t('new');
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.mrp,
      quantity: 1,
      image: product.imageUrl,
    });
  };

  const renderStars = (rating: number = 0) => {
    const filledStars = Math.round(rating);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= filledStars
                ? 'fill-amber-500 text-amber-500'
                : 'text-stone-200 dark:text-stone-800'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Link 
      href={`/shop/product/${product.id}`} 
      className="group flex flex-col w-full transition-all duration-300 relative"
    >
      {/* Image Container with high-end padded background */}
      <div className="relative aspect-[20/21] w-full rounded-none bg-[#F6F3E6]/60 dark:bg-stone-900/40 p-0 overflow-hidden mb-3.5 flex items-center justify-center border border-stone-200/20 dark:border-stone-800/10">
        
        {/* Dynamic Capsule Badges */}
        {badgeText && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 text-[9px] font-bold px-2.5 py-1 rounded-full border border-stone-300/40 dark:border-stone-700/40 shadow-xs tracking-wider uppercase">
              {badgeText}
            </span>
          </div>
        )}

        {/* Product Image Padded & Posed */}
        <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Elegant eggplant-colored Add to Cart Button, visible only on hover */}
        {product.stock > 0 ? (
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-4 left-4 right-4 bg-[#2E1F30] hover:bg-[#432d46] text-white py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg active:scale-95 z-20 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {t('addToCart')}
          </button>
        ) : (
          <div className="absolute bottom-4 left-4 right-4 bg-stone-200/80 dark:bg-stone-800/80 text-stone-500 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center z-20 pointer-events-none select-none">
            {t('outOfStock')}
          </div>
        )}
      </div>

      {/* Details Area in Editorial Style */}
      <div className="flex flex-col px-1">
        {/* Brand/Category & Price Row */}
        <div className="flex justify-between items-baseline gap-2 mb-1">
          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest truncate max-w-[65%]">
            {product.category || 'VEDIC CLASSIC'}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
              ₹{product.price.toFixed(0)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-stone-400 dark:text-stone-500 line-through">
                ₹{product.mrp.toFixed(0)}
              </span>
            )}
          </div>
        </div>
        
        {/* Serif elegant Product Name */}
        <h3 className="font-serif font-bold text-[#2E1F30] dark:text-stone-200 text-[15px] sm:text-base leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors mb-1">
          {product.name}
        </h3>

        {/* Five Star rating and reviews counts */}
        {(product.rating !== undefined || product.reviewsCount !== undefined) && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {renderStars(product.rating)}
            <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
              ({product.reviewsCount || 0})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
