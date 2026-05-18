'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus } from 'lucide-react';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { useTranslations } from 'next-intl';
import { Product } from '../types/products.types';

interface FeaturedProductsCarouselProps {
  products: Product[];
}

export default function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const t = useTranslations('products');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (products.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [products.length, isPaused]);

  if (products.length === 0) return null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const product = products[currentIdx];
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

  const product = products[currentIdx];

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full lg:w-[70%] aspect-square lg:aspect-[4/3] xl:aspect-[1.5/1] relative rounded-[2.5rem] overflow-hidden group hover:-translate-y-3 hover:shadow-xl transition-all duration-500 bg-earth-100 shadow-lg cursor-default"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-cover"
            referrerPolicy="no-referrer"
            priority={currentIdx === 0}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10 flex items-end justify-between gap-6 text-white">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold tracking-widest uppercase shadow-sm">
                  {product.category || 'Vedic Classic'}
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-[#1B8057]/80 backdrop-blur-md border border-[#1B8057]/30 text-xs font-bold tracking-widest shadow-sm">
                  ₹{product.price.toFixed(0)}
                </span>
              </div>
              <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 leading-tight tracking-tight">
                {product.name}
              </h3>
              <p className="text-base md:text-xl text-neutral-200 max-w-2xl font-medium leading-relaxed opacity-95 line-clamp-2 md:line-clamp-none">
                {product.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        {product.stock > 0 ? (
          <button 
            onClick={handleAddToCart}
            className="flex-shrink-0 bg-primary-500 text-neutral-900 hover:bg-primary-400 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.5)] mb-2 group/btn relative cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
            <div className="absolute -top-2 -right-2 bg-neutral-900 dark:bg-white text-primary-500 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md border-2 border-primary-500 transform transition-transform group-hover/btn:scale-110 group-hover/btn:rotate-90">
              <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[3]" />
            </div>
          </button>
        ) : (
          <div className="flex-shrink-0 bg-neutral-600 text-neutral-300 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-lg mb-2 relative select-none">
            <span className="text-xs font-bold tracking-wider uppercase">{t('outOfStock')}</span>
          </div>
        )}
      </div>
      
      {/* Progress Indicators */}
      <div className="absolute top-8 right-8 z-10 flex gap-2">
        {products.map((_, idx) => (
          <div key={idx} className="h-1.5 rounded-full bg-white/30 overflow-hidden w-8 sm:w-12">
            {idx === currentIdx && (
              <motion.div 
                className="h-full bg-white w-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 4, ease: "linear" }}
                style={{ originX: 0 }}
              />
            )}
            {idx < currentIdx && (
              <div className="h-full bg-white w-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
