'use client';

import { Link, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { ShoppingCart, Menu, User, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import LocaleSwitcher from './LocaleSwitcher';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';

const LoginModal = dynamic(() => import('@/features/auth/components/LoginModal').then(mod => mod.LoginModal), { ssr: false });
const CartDrawer = dynamic(() => import('@/features/cart/components/CartDrawer').then(mod => mod.CartDrawer), { ssr: false });
import { useCartStore } from '@/features/cart/store/useCartStore';

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { openCart, items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const links = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.shop'), href: '/shop' },
    { name: t('nav.events'), href: '/events' },
    { name: t('nav.gallery'), href: '/gallery' },
    { name: t('nav.blog'), href: '/blogs' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex flex-col items-center px-4 w-full">
      <header className="w-full max-w-6xl bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-50 px-4 sm:px-6 py-3 rounded-2xl flex items-center justify-between shadow-lg dark:shadow-2xl transition-colors relative z-50">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative rounded-full overflow-hidden border border-earth-200 dark:border-neutral-800 bg-white shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <Image 
                src="https://picsum.photos/seed/merigaumata/100/100" 
                alt="MeriGauMata Logo" 
                fill 
                sizes="40px"
                referrerPolicy="no-referrer"
                className="object-cover" 
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif text-[22px] font-bold tracking-tight text-tertiary-900 dark:text-white leading-none mb-1">
                {t('hero.title')}
              </span>
              <span className="font-sans text-[9px] font-bold text-[#DE7A41] tracking-[0.2em] uppercase leading-none">
                {t('hero.subtitle')}
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.name}
                href={link.href} 
                className={`text-sm font-medium px-4 py-2 rounded-full transition-all relative ${
                  isActive 
                    ? 'text-white dark:text-neutral-950' 
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-tertiary-950 dark:bg-tertiary-100 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          
          <button 
            onClick={openCart}
            className="p-2 sm:p-2.5 text-neutral-500 dark:text-neutral-400 hover:text-tertiary-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors relative"
          >
            <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.5} />
            {mounted && totalItems > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary-600 flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#0a0a0a]">
                {totalItems}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => { setLoginMode('login'); setIsLoginModalOpen(true); }}
            className="p-2 sm:p-2.5 text-neutral-500 dark:text-neutral-400 hover:text-tertiary-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors hidden sm:block"
          >
            <User className="h-[22px] w-[22px]" strokeWidth={1.5} />
          </button>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-neutral-500 dark:text-neutral-400 hover:text-tertiary-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl ml-1 transition-colors"
          >
            {isMenuOpen ? <X className="h-[22px] w-[22px]" strokeWidth={1.5} /> : <Menu className="h-[22px] w-[22px]" strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      <div 
        ref={menuRef}
        className={`lg:hidden w-full max-w-6xl mt-2 overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-[#0a0a0a] border-x border-b border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl z-40 absolute top-[100%] left-0 right-0 mx-auto transform-origin-top ${
          isMenuOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ width: 'calc(100% - 2rem)' }}
      >
        <nav className="flex flex-col py-4 px-4 gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-base font-medium px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-tertiary-50 text-tertiary-900 dark:bg-tertiary-900/20 dark:text-tertiary-100' 
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              setLoginMode('login');
              setIsLoginModalOpen(true);
            }}
            className="w-full text-base font-medium px-4 py-3 rounded-xl transition-all text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5 sm:hidden flex items-center gap-2 mt-2 border-t border-neutral-100 dark:border-neutral-800 pt-3"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {t('nav.login')}
          </button>
        </nav>
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        initialMode={loginMode}
      />
      <CartDrawer />
    </div>
  );
}
