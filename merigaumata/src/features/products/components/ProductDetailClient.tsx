'use client';

import { useState, useRef } from 'react';
import { 
  Star, 
  Minus, 
  Plus, 
  Heart, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Leaf,
  HeartHandshake,
  ChevronLeft
} from 'lucide-react';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { ShippingBanner } from '@/shared/components/ShippingBanner';
import { useTranslations } from 'next-intl';

// Feature-scoped child components
import { ProductGallery } from './ProductGallery';
import { ProductAccordionSection } from './ProductAccordionSection';
import { ProductReviewsSection } from './ProductReviewsSection';
import { FaqSection } from './FaqSection';
import { ProductCard } from './ProductCard';
import { Product, ProductWithDetails, Review, FAQ } from '../types/products.types';

interface ProductDetailClientProps {
  product: ProductWithDetails;
  allProducts: Product[];
  initialReviews: Review[];
  faqs: FAQ[];
}

export function ProductDetailClient({ product, allProducts, initialReviews, faqs }: ProductDetailClientProps) {
  const t = useTranslations('products');
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  
  const sizes = product.sizes;
  const [selectedSize, setSelectedSize] = useState<string>(sizes[1] || sizes[0]);

  const variants = product.variants;
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  const galleryImages = product.galleryImages;
  const activeCopy = product.variantCopies[selectedVariant.id];

  // Add to cart handler
  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addItem({
      id: product.id,
      name: `${product.name} (${selectedVariant.label} - ${selectedVariant.volume.split(' / ')[0]})`,
      price: selectedVariant.price,
      originalPrice: selectedVariant.id === 'full' ? product.mrp : undefined,
      quantity: quantity,
      image: product.imageUrl,
      variant: `${selectedVariant.label} (${selectedVariant.volume.split(' / ')[0]})`
    });
  };

  // Related products filters (same category, excluding current product)
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Smooth scroll to reviews
  const reviewsRef = useRef<HTMLDivElement>(null);
  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#FAF9F6] dark:bg-[#0f0e0c] min-h-screen pt-24 pb-20 font-sans transition-colors duration-300">
      
      {/* Reusable Top egg-plant Colored Shipping Banner */}
      <ShippingBanner />

      <div className="container mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 mt-8 max-w-screen-2xl">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-8 uppercase tracking-wider">
          <span>{t('shop')}</span>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-[#2E1F30] dark:text-[#E2EBCE]">{product.name}</span>
        </div>

        {/* Two-Column Grid Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
          
          {/* Left Column: Vertical thumbnail strip & main image */}
          <ProductGallery galleryImages={galleryImages} productName={product.name} />

          {/* Right Column: Detailed Product Controls */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* Category / Brand Title */}
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 tracking-[0.2em] uppercase mb-1.5">
              {t('brand')}
            </span>

            {/* Playfair Headline Product Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#2E1F30] dark:text-stone-100 leading-tight mb-3">
              {product.name}
            </h1>

            {/* Micro rating line */}
            <button 
              onClick={scrollToReviews}
              className="flex items-center gap-1.5 mb-5 hover:opacity-85 transition-opacity text-left cursor-pointer w-fit"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(product.rating || 5) 
                        ? 'fill-amber-500 text-amber-500' 
                        : 'text-stone-200 dark:text-stone-700'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 tracking-wider">
                {product.rating || '4.9'} ({product.reviewsCount || initialReviews.length} reviews)
              </span>
            </button>

            {/* Sizable retail price section */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2E1F30] dark:text-stone-100">
                  ₹{selectedVariant.price.toFixed(0)}
                </span>
                {selectedVariant.id === 'full' && product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-base text-stone-400 dark:text-stone-500 line-through">
                      ₹{product.mrp.toFixed(0)}
                    </span>
                    <span className="bg-[#E2EBCE] text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                    </span>
                  </>
                )}
                {selectedVariant.id === 'mini' && (
                  <>
                    <span className="text-base text-stone-400 dark:text-stone-500 line-through">
                      ₹{(product.price * 0.9).toFixed(0)}
                    </span>
                    <span className="bg-[#E2EBCE] text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      33% OFF
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-1.5 block">
                {t('incTaxes')}
              </span>
            </div>

            {/* Dynamic organic descriptions */}
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base font-light leading-relaxed mb-8 transition-all duration-300 min-h-[4rem]">
              {activeCopy.description}
            </p>

            {/* Dynamic Variant Selector matching requested layout mock */}
            <div className="mb-6">
              <span className="font-serif text-[15px] sm:text-base font-extrabold text-[#2E1F30] dark:text-stone-200 block mb-3.5 normal-case tracking-normal">
                {t('variantSelector')}
              </span>
              <div className="flex flex-row gap-4 items-stretch w-full max-w-md">
                {variants.map((v) => {
                  const isSelected = selectedVariant.id === v.id;
                  const isBestValue = v.id === 'full';
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setSelectedSize(v.volume.split(' / ')[0]);
                      }}
                      className={`relative flex-1 py-3.5 px-4 rounded-none border transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-stone-900 border-[#2E1F30] dark:border-stone-200 border-2 shadow-xs'
                          : 'bg-[#FAF9F6]/20 dark:bg-stone-950/20 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                      }`}
                    >
                      {isBestValue && (
                        <span className="absolute -top-2.5 -right-1.5 z-10 bg-[#2E1F30] dark:bg-[#E2EBCE] text-[#E2EBCE] dark:text-stone-900 text-[8px] font-extrabold px-2 py-0.5 rounded-none uppercase tracking-widest shadow-xs">
                          {t('bestValue')}
                        </span>
                      )}
                      <span className={`font-sans font-bold text-xs sm:text-sm block ${
                        isSelected ? 'text-[#2E1F30] dark:text-stone-100' : 'text-stone-700 dark:text-stone-300'
                      }`}>
                        {v.label} ₹{v.price.toFixed(0)}
                      </span>
                      <span className="font-sans font-light text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">
                        {v.volume}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Cart Buttons CTAs */}
            <div className="flex items-center gap-3 mb-4 mt-2">
              
              {/* Stepper block */}
              <div className="flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full py-2 px-4 shadow-xs">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-1 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-[#2E1F30] dark:text-stone-100">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-1 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Eggplant ADD TO CART Button */}
              {product.stock > 0 ? (
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#2E1F30] hover:bg-[#432d46] text-white py-3.5 px-8 rounded-full text-xs font-extrabold tracking-widest uppercase shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t('addToCart')}
                </button>
              ) : (
                <div className="flex-1 bg-stone-200 dark:bg-stone-800 text-stone-500 py-3.5 px-8 rounded-full text-xs font-extrabold tracking-widest uppercase text-center select-none shadow-none pointer-events-none">
                  {t('outOfStock')}
                </div>
              )}

              {/* Heart Toggle Wishlist button */}
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-3.5 rounded-full border transition-all ${
                  isWishlisted 
                    ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-950/20' 
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>

            </div>

            {/* Delivery Text Info */}
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-8 block text-center lg:text-left">
              {t('shippingCalculated')}
            </span>

            {/* Benefit Highlights Icons Cards Row */}
            <div className="grid grid-cols-4 gap-2 mb-8">
              
              <div className="bg-white dark:bg-stone-900 p-2.5 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 flex flex-col items-center text-center">
                <div className="w-7 h-7 rounded-full bg-[#E2EBCE]/50 flex items-center justify-center text-stone-700 dark:text-stone-300 mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-extrabold text-[#2E1F30] dark:text-stone-200 tracking-wide uppercase leading-tight">
                  {t('benefit1')}
                </span>
              </div>

              <div className="bg-white dark:bg-stone-900 p-2.5 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 flex flex-col items-center text-center">
                <div className="w-7 h-7 rounded-full bg-[#E2EBCE]/50 flex items-center justify-center text-stone-700 dark:text-stone-300 mb-1.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-extrabold text-[#2E1F30] dark:text-stone-200 tracking-wide uppercase leading-tight">
                  {t('benefit2')}
                </span>
              </div>

              <div className="bg-white dark:bg-stone-900 p-2.5 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 flex flex-col items-center text-center">
                <div className="w-7 h-7 rounded-full bg-[#E2EBCE]/50 flex items-center justify-center text-stone-700 dark:text-stone-300 mb-1.5">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-extrabold text-[#2E1F30] dark:text-stone-200 tracking-wide uppercase leading-tight">
                  {t('benefit3')}
                </span>
              </div>

              <div className="bg-white dark:bg-stone-900 p-2.5 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 flex flex-col items-center text-center">
                <div className="w-7 h-7 rounded-full bg-[#E2EBCE]/50 flex items-center justify-center text-stone-700 dark:text-stone-300 mb-1.5">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-extrabold text-[#2E1F30] dark:text-stone-200 tracking-wide uppercase leading-tight">
                  {t('benefit4')}
                </span>
              </div>

            </div>

            {/* Collapsible Tabs Accordions */}
            <ProductAccordionSection activeCopy={activeCopy} />

          </div>

        </div>

        {/* Customer Reviews Section */}
        <div ref={reviewsRef}>
          <ProductReviewsSection 
            productId={product.id}
            category={product.category}
            initialReviews={initialReviews} 
            productRating={product.rating} 
          />
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-stone-200 dark:border-stone-800 pt-16 mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif font-bold text-[#2E1F30] dark:text-stone-100">
                {t('youMayLike')}
              </h2>
              {/* Vertical slider buttons indicator */}
              <div className="flex items-center gap-2">
                <button className="p-2 border border-stone-200 dark:border-stone-800 hover:border-stone-400 rounded-full transition-colors">
                  <ChevronLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                </button>
                <button className="p-2 border border-stone-200 dark:border-stone-800 hover:border-stone-400 rounded-full bg-[#2E1F30] text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Frequently Asked Questions Accordion Grid */}
        <FaqSection initialFaqs={faqs} />

      </div>
    </div>
  );
}
