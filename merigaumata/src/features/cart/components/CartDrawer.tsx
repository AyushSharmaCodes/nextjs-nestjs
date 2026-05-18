'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useCartStore } from '../store/useCartStore';
import { useProducts } from '@/features/products/hooks/use-products';
import { Product } from '@/features/products/types/products.types';
import { useLenis } from 'lenis/react';
import { useTranslations } from 'next-intl';

export function CartDrawer() {
  const t = useTranslations('cart');
  const { isOpen, closeCart, items, addItem, updateQuantity, removeItem } = useCartStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const lenis = useLenis();

  // Load products list from caching layer for suggested offers
  const { data } = useProducts({ sortBy: 'featured', page: 1, limit: 100 });
  const allProducts = data?.products || [];

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (lenis) lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (lenis) lenis.start();
    };
  }, [isOpen, lenis]);

  if (!mounted) return null;

  // 1. Calculate main dynamic totals
  const cartSubtotal = items.reduce((sum, item) => sum + (item.isFree ? 0 : item.price * item.quantity), 0);
  
  // 2. Generate active free gifts dynamically based on subtotal
  const unlockedGifts = [];
  if (cartSubtotal >= 1000) {
    unlockedGifts.push({
      id: 'gift-bhakti-card',
      name: t('giftBhaktiCard'),
      price: 120,
      originalPrice: 120,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80',
      variant: t('giftBhaktiCardVariant'),
      isFree: true
    });
  }
  if (cartSubtotal >= 3000) {
    unlockedGifts.push({
      id: 'gift-dhoop-cones',
      name: t('giftDhoopCones'),
      price: 350,
      originalPrice: 350,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=300&q=80',
      variant: t('giftDhoopConesVariant'),
      isFree: true
    });
  }
  if (cartSubtotal >= 5000) {
    unlockedGifts.push({
      id: 'gift-ghee-mini',
      name: t('giftGheeMini'),
      price: 600,
      originalPrice: 600,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&q=80',
      variant: t('giftGheeMiniVariant'),
      isFree: true
    });
  }
  if (cartSubtotal >= 8000) {
    unlockedGifts.push({
      id: 'gift-brass-diya',
      name: t('giftBrassDiya'),
      price: 1250,
      originalPrice: 1250,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1609137144813-2d2c14041b12?w=300&q=80',
      variant: t('giftBrassDiyaVariant'),
      isFree: true
    });
  }

  // Combine regular items and active free gifts
  const renderedItems = [...items, ...unlockedGifts];
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0) + unlockedGifts.length;
  
  // Calculate savings
  const productSavings = items.reduce((sum, item) => {
    const orig = item.originalPrice || item.price;
    return sum + (orig - item.price) * item.quantity;
  }, 0);
  const giftSavings = unlockedGifts.reduce((sum, gift) => sum + gift.price, 0);
  const totalSavings = productSavings + giftSavings;

  // Filter suggested products that are not in the cart
  const cartIds = items.map((i) => i.id);
  const suggestedProducts = (allProducts || [])
    .filter((p: Product) => !cartIds.includes(p.id) && p.stock > 0)
    .slice(0, 4);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={closeCart}
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="relative w-full max-w-[450px] h-screen max-h-screen bg-[#FAF9F6] dark:bg-[#0a0a0a] shadow-2xl flex flex-col overflow-hidden will-change-transform rounded-none text-[#2E1F30] dark:text-stone-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F6] dark:bg-[#0c0c0a]">
              <h2 className="text-sm font-serif font-black tracking-[0.2em] uppercase flex items-center gap-2 text-[#2E1F30] dark:text-white">
                {t('cartTitle')}
                {totalItemsCount > 0 && (
                  <span className="text-stone-400 font-bold text-xs">({totalItemsCount})</span>
                )}
              </h2>
              <button 
                onClick={closeCart}
                className="p-2 -mr-2 text-stone-400 hover:text-[#2E1F30] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Content Body */}
            <div 
              ref={scrollRef} 
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain flex flex-col min-h-0"
            >
              {items.length === 0 ? (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center p-8 mt-12 text-center">
                  <div className="w-20 h-20 bg-stone-100 dark:bg-stone-900 rounded-none flex items-center justify-center mb-6 border border-stone-200 dark:border-stone-800">
                    <ShoppingBag className="w-8 h-8 text-stone-300 dark:text-stone-700" strokeWidth={1.5} />
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-serif font-bold uppercase tracking-widest mb-8">
                    {t('emptyCart')}
                  </p>
                  <button 
                    onClick={closeCart}
                    className="w-full bg-[#2E1F30] hover:bg-[#1c131d] text-[#FAF9F6] font-black text-xs uppercase tracking-widest py-4 px-6 rounded-none transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {t('continueShopping')}
                  </button>
                </div>
              ) : (
                /* Filled State */
                <div className="flex flex-col pb-6">
                  
                  {/* Premium Free Delivery Progress Bar */}
                  <div className="p-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/20 select-none">
                    <div className="text-center text-[10px] sm:text-[11px] font-black tracking-widest uppercase mb-4 flex items-center justify-center gap-1 text-stone-500">
                      {cartSubtotal < 1000 ? (
                        <>
                          {t.rich('freeDeliveryBar', {
                            amount: (1000 - cartSubtotal).toLocaleString(),
                            span: (chunks) => <span className="text-[#2E1F30] dark:text-[#E2EBCE] font-extrabold">{chunks}</span>
                          })}
                        </>
                      ) : (
                        <span className="text-emerald-650 dark:text-emerald-450 flex items-center gap-1 font-black">
                          {t('freeDeliveryUnlocked')}
                        </span>
                      )}
                    </div>
                    
                    {/* The delivery axis bar */}
                    <div className="relative mt-3 px-1">
                      {/* Base Track */}
                      <div className="w-full h-2 bg-stone-100 dark:bg-stone-850 rounded-full overflow-hidden border border-stone-200/30 dark:border-stone-800/30">
                        {/* Active Progress Fill */}
                        <div 
                          className="h-full bg-gradient-to-r from-[#2E1F30] to-emerald-600 dark:from-[#2E1F30] dark:to-emerald-500 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min((cartSubtotal / 1000) * 100, 100)}%` }}
                        />
                      </div>

                      {/* Sliding marker on progress track */}
                      {cartSubtotal < 1000 && (
                        <div 
                          className="absolute -top-2 transition-all duration-500 ease-out z-10 text-sm select-none"
                          style={{ left: `calc(${Math.min((cartSubtotal / 1000) * 100, 94)}% - 6px)` }}
                        >
                          🚚
                        </div>
                      )}
                    </div>

                    {/* Progress Bar Footer Indicators */}
                    <div className="flex justify-between items-center mt-3 text-[9px] font-black tracking-wider uppercase text-stone-400 dark:text-stone-500">
                      <span>₹0</span>
                      <span className={cartSubtotal >= 1000 ? 'text-emerald-650 font-extrabold' : ''}>
                        {cartSubtotal >= 1000 ? t('unlocked') : t('freeDeliveryLimit')}
                      </span>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex flex-col gap-4 p-6">
                    <AnimatePresence initial={false}>
                      {renderedItems.map((item, index) => (
                        <motion.div 
                          key={`${item.id}-${item.variant || index}`} 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96, y: -10 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className={`flex gap-4 p-4 border rounded-none transition-colors ${
                            item.isFree 
                              ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-950/20 dark:bg-emerald-950/5' 
                              : 'border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900/30'
                          }`}
                        >
                          {/* Image */}
                          <div className="relative w-20 h-20 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 rounded-none overflow-hidden shrink-0">
                            <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover rounded-none" referrerPolicy="no-referrer" />
                            {item.isFree && (
                              <div className="absolute top-1 left-1 bg-emerald-600 text-[#FAF9F6] text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded-none shadow-sm flex items-center gap-0.5">
                                <Sparkles className="w-2 h-2 fill-current" /> {t('gift')}
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-3 mb-1">
                              <h3 className="font-serif font-black text-xs sm:text-sm text-[#2E1F30] dark:text-white leading-tight uppercase tracking-wider line-clamp-2">
                                {item.name}
                              </h3>
                              <div className="flex flex-col items-end shrink-0 text-right">
                                {item.isFree ? (
                                  <>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs tracking-wider uppercase">FREE!</span>
                                    <span className="text-[10px] text-stone-400 line-through">₹{item.price.toLocaleString()}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-black text-sm text-[#2E1F30] dark:text-white">₹{item.price.toLocaleString()}</span>
                                    {item.originalPrice && item.originalPrice > item.price && (
                                      <span className="text-[10px] text-stone-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {item.variant && (
                              <p className="text-[10px] text-stone-500 dark:text-stone-400 mb-3 tracking-wide uppercase font-light truncate">{item.variant}</p>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-2">
                              {/* Delete Button */}
                              {!item.isFree ? (
                                <button 
                                  onClick={() => removeItem(item.id, item.variant)}
                                  className="p-2 text-stone-450 hover:text-red-650 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-850 transition-colors border border-stone-200 dark:border-stone-800 rounded-none shrink-0 cursor-pointer"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest shrink-0">
                                  {t('unlockedGift')}
                                </div>
                              )}

                              {/* Quantity Controls */}
                              {!item.isFree && (
                                <div className="flex items-center border border-stone-200 dark:border-stone-800 bg-white dark:bg-black rounded-none h-8 select-none">
                                  <button 
                                    onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1, item.variant)}
                                    className="w-8 h-full flex items-center justify-center text-stone-500 hover:text-[#2E1F30] dark:hover:text-white disabled:opacity-30 rounded-none hover:bg-stone-50 cursor-pointer"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-7 text-center text-xs font-black text-[#2E1F30] dark:text-white">
                                    {item.quantity}
                                  </span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                    className="w-8 h-full flex items-center justify-center text-stone-500 hover:text-[#2E1F30] dark:hover:text-white rounded-none hover:bg-stone-50 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Coupon & Rewards Section */}
                  <div className="px-6 pb-6 space-y-3.5">
                    {/* Coupon Input Box */}
                    <div className="flex items-center gap-3 w-full border border-stone-200 dark:border-stone-800 rounded-none px-4 py-3.5 bg-white dark:bg-black/20 focus-within:border-[#2E1F30] transition-colors">
                      <Tag className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
                      <input 
                        type="text" 
                        placeholder={t('enterCoupon')} 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-transparent text-xs sm:text-sm text-[#2E1F30] dark:text-stone-100 outline-none placeholder:text-stone-400 uppercase tracking-widest font-black"
                      />
                      {couponCode && (
                        <button className="text-[10px] text-[#2E1F30] dark:text-emerald-450 font-black uppercase tracking-wider hover:underline cursor-pointer">
                          {t('apply')}
                        </button>
                      )}
                    </div>
                    
                    {/* Simulated Gau Shelter Cashback Points Banner */}
                    <div className="flex items-stretch gap-0 w-full border border-[#E57A65]/35 rounded-none overflow-hidden select-none">
                      <div className="bg-[#E57A65] text-white px-3.5 py-3 w-18 flex flex-col items-center justify-center font-serif font-black text-[9px] sm:text-[10px] leading-tight text-center uppercase tracking-wider shrink-0 rounded-none">
                        {t('mgmCoins')}
                      </div>
                      <div className="flex-1 py-3.5 px-4 text-xs font-semibold text-[#8B3E2F] dark:text-[#E57A65] bg-[#FFF3F0] dark:bg-[#E57A65]/10 leading-snug border-l border-[#E57A65]/20 rounded-none">
                        {t('coinsBenefit', { amount: (cartSubtotal * 0.05).toFixed(2) })}
                      </div>
                    </div>
                  </div>

                  {/* Best Offers Recommendation Section */}
                  {suggestedProducts.length > 0 && (
                    <div className="px-6 pb-6 pt-2 border-t border-stone-200/50 dark:border-stone-800/50">
                      <h4 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-extrabold text-[#2E1F30] dark:text-stone-200 mb-4 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse" /> {t('bestOffers')}
                      </h4>
                      
                      {/* Horizontal Scrolling suggestions */}
                      <div className="flex gap-4 overflow-x-auto pb-4 pr-2 scrollbar-none snap-x snap-mandatory">
                        {suggestedProducts.map((p: Product) => (
                          <div 
                            key={p.id}
                            className="w-[180px] shrink-0 border border-stone-200 dark:border-stone-800 bg-[#FAF9F6] dark:bg-stone-900/10 p-3 rounded-none snap-start relative flex flex-col"
                          >
                            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 z-10 rounded-none shadow-sm">
                              {t('discountPercent', { percent: 10 })}
                            </span>
                            
                            {/* Image */}
                            <div className="relative w-full h-[105px] bg-stone-100 border border-stone-200/50 mb-2 rounded-none overflow-hidden shrink-0">
                              <Image src={p.imageUrl} alt={p.name} fill sizes="180px" className="object-cover rounded-none" referrerPolicy="no-referrer" />
                            </div>
                            
                            <h5 className="font-serif font-black text-xs text-[#2E1F30] dark:text-stone-100 line-clamp-1 mb-1 uppercase tracking-wider">
                              {p.name}
                            </h5>
                            
                            <div className="flex items-center mb-3">
                              <span className="text-xs font-black text-[#2E1F30] dark:text-stone-100">
                                ₹{p.price.toLocaleString()}
                              </span>
                              {p.mrp && p.mrp > p.price && (
                                <span className="text-[10px] text-stone-400 line-through ml-1.5">
                                  ₹{p.mrp.toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => addItem({
                                id: p.id,
                                name: p.name,
                                price: p.price,
                                originalPrice: p.mrp || p.price,
                                quantity: 1,
                                image: p.imageUrl,
                                variant: t('standardPack')
                              })}
                              className="w-full mt-auto bg-white hover:bg-[#2E1F30] border border-stone-300 hover:border-[#2E1F30] text-[#2E1F30] hover:text-[#FAF9F6] font-black text-[9px] sm:text-[10px] py-1.5 uppercase tracking-wider transition-all duration-300 rounded-none flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                            >
                              {t('add')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Footer Checkout Summary Area */}
            {items.length > 0 && (
              <div className="border-t border-stone-200 dark:border-stone-800 bg-[#FAF9F6] dark:bg-[#0c0c0a] select-none">
                {/* Dynamic promotion banner */}
                <div className="bg-[#4A6984] text-white text-[9px] sm:text-[10px] font-black text-center py-2 uppercase tracking-[0.2em] px-4">
                  {t('calendarReward')}
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-serif font-extrabold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                       {t('estTotal')}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-lg sm:text-xl font-black text-[#2E1F30] dark:text-white tracking-wide">
                        ₹{cartSubtotal.toLocaleString()}
                      </span>
                      {totalSavings > 0 && (
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">
                          {t('youSaved', { amount: totalSavings.toLocaleString() })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Checkout Button */}
                  <button className="w-full bg-[#1B8057] hover:bg-[#156343] text-white font-black text-xs uppercase tracking-widest py-4.5 rounded-none transition-all active:scale-[0.98] shadow-md flex justify-between items-center px-6 gap-3 cursor-pointer">
                    <span>{t('proceed')}</span>
                    
                    {/* Trust badges */}
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-none opacity-90 scale-95 shrink-0 select-none">
                      <span className="text-[8px] font-black uppercase text-stone-100 tracking-wider mr-1">{t('pay')}</span>
                      <span className="text-[9px] font-black text-white px-1 py-0.2 bg-purple-700/60 leading-none">Pe</span>
                      <span className="text-[9px] font-black text-white px-1 py-0.2 bg-blue-700/60 leading-none">G</span>
                      <span className="text-[9px] font-black text-white px-1 py-0.2 bg-sky-700/60 leading-none">Py</span>
                      <span className="text-[9px] font-bold text-white leading-none">💳</span>
                    </div>
                  </button>
                  
                  {/* Powered by tag */}
                  <div className="text-center text-[9px] text-stone-400 dark:text-stone-600 font-light tracking-wide uppercase pt-1">
                    {t('securedBy')}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
