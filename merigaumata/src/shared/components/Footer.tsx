import { Link } from '@/i18n/navigation';
import { AppIcon } from '@/shared/icons';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('home');

  return (
    <footer className="mt-auto p-4 sm:p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto">
        {/* Desktop Footer Card */}
        <div className="hidden sm:block bg-[var(--color-footer-bg)] rounded-[2.5rem] pt-16 pb-8 px-6 sm:px-10 lg:px-16 text-tertiary-900 dark:text-earth-50 shadow-sm border border-black/5 dark:border-white/5">
          {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-4">
            <h3 className="font-serif text-2xl font-bold mb-1 flex items-center gap-3 text-tertiary-900 dark:text-white">
              <span className="bg-primary-100 dark:bg-primary-50 text-tertiary-900 w-8 h-8 rounded-full flex items-center justify-center text-xs">
                <span className="opacity-80 font-bold">M</span>
              </span>
              MeriGauMata
            </h3>
            <p className="text-[9px] font-bold text-primary-600 dark:text-primary-500 tracking-[0.2em] uppercase mb-6 ml-[2.75rem]">Sacred Vedic Essence</p>
            <p className="text-sm text-foreground/70 dark:text-earth-100/70 mb-6 leading-relaxed font-serif italic text-justify pr-4">
              &quot;Dedicated to the timeless wisdom of the Vedic tradition, MeriGauMata is your gateway to authentic, cow-based wellness and spiritual products. Beyond our curated marketplace of Gavyas and natural essentials, we serve as a vibrant community hub for Gau Seva. Join us in our mission through event registrations, impactful donation programs, and insightful blogs that bridge the gap between ancient heritage and modern living. Embrace the purity of the Mother Cow and support a sustainable, sacred future with every contribution.&quot;
            </p>
            <div className="flex gap-3">
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-earth-200 dark:border-earth-100/20 text-foreground/70 dark:text-earth-100/70 flex items-center justify-center hover:bg-primary-500 hover:text-white dark:hover:text-tertiary-900 hover:border-primary-500 transition-all duration-300">
                <AppIcon name="facebook" size="xs" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-earth-200 dark:border-earth-100/20 text-foreground/70 dark:text-earth-100/70 flex items-center justify-center hover:bg-primary-500 hover:text-white dark:hover:text-tertiary-900 hover:border-primary-500 transition-all duration-300">
                <AppIcon name="instagram" size="xs" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-earth-200 dark:border-earth-100/20 text-foreground/70 dark:text-earth-100/70 flex items-center justify-center hover:bg-primary-500 hover:text-white dark:hover:text-tertiary-900 hover:border-primary-500 transition-all duration-300">
                <AppIcon name="twitter" size="xs" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-earth-200 dark:border-earth-100/20 text-foreground/70 dark:text-earth-100/70 flex items-center justify-center hover:bg-primary-500 hover:text-white dark:hover:text-tertiary-900 hover:border-primary-500 transition-all duration-300">
                <AppIcon name="linkedin" size="xs" />
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-7 lg:col-start-6 flex flex-col gap-10">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-sans text-[11px] font-bold tracking-[0.1em] text-tertiary-900 dark:text-white uppercase mb-6">Quick Links</h4>
                <ul className="space-y-3 text-sm text-foreground/70 dark:text-earth-100/70">
                  <li><Link href="/shop" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav.shop')}</Link></li>
                  <li><Link href="/events" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav.events')}</Link></li>
                  <li><Link href="/blogs" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav.blog')}</Link></li>
                  <li><Link href="/gallery" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav.gallery')}</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-sans text-[11px] font-bold tracking-[0.1em] text-tertiary-900 dark:text-white uppercase mb-6">Customer Service</h4>
                <ul className="space-y-3 text-sm text-foreground/70 dark:text-earth-100/70">
                  <li><Link href="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact Us</Link></li>
                  <li><Link href="/shipping-and-refund-policy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Shipping & Returns</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms-and-conditions" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms & Conditions</Link></li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-sans text-[11px] font-bold tracking-[0.1em] text-tertiary-900 dark:text-white uppercase mb-6">Ancient Roots</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-foreground/70 dark:text-earth-100/70">
                <div className="flex items-start gap-3">
                  <AppIcon name="mapPin" size="sm" className="text-primary-600 dark:text-primary-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">14/14, New Shahganj Rd, Opp. Kothi<br/>Meena Bazar, Agra<br />Uttar Pradesh - 282010</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <AppIcon name="phone" size="sm" className="text-primary-600 dark:text-primary-500 shrink-0" />
                    <span>+91 9079756061</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AppIcon name="mail" size="sm" className="text-primary-600 dark:text-primary-500 shrink-0" />
                    <span className="break-all">gaumayproductvrn@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="py-8 border-y border-earth-200 dark:border-white/10 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-earth-200 dark:divide-white/10">
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <AppIcon name="truck" size="lg" className="text-primary-600 dark:text-primary-500" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary-900 dark:text-white">Pan India Shipping</p>
                <p className="text-[10px] text-foreground/50 dark:text-earth-100/50 mt-0.5">Free over ₹999</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <AppIcon name="shieldCheck" size="lg" className="text-primary-600 dark:text-primary-500" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary-900 dark:text-white">100% Secure Checkout</p>
                <p className="text-[10px] text-foreground/50 dark:text-earth-100/50 mt-0.5">Trusted partners</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <AppIcon name="headphones" size="lg" className="text-primary-600 dark:text-primary-500" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary-900 dark:text-white">Dedicated Support</p>
                <p className="text-[10px] text-foreground/50 dark:text-earth-100/50 mt-0.5">Mon - Sat, 9am - 6pm</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <AppIcon name="star" size="lg" className="text-primary-600 dark:text-primary-500" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary-900 dark:text-white">Authentic Products</p>
                <p className="text-[10px] text-foreground/50 dark:text-earth-100/50 mt-0.5">Vedic quality guaranteed</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bank Donation Info */}
        <div className="border border-earth-200 dark:border-white/10 rounded-xl p-4 lg:p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6 bg-white/50 dark:bg-white/5 overflow-hidden">
          <div className="shrink-0 mb-2 md:mb-0 max-w-[200px]">
            <h4 className="text-primary-600 dark:text-primary-500 font-bold tracking-[0.1em] text-[10px] uppercase mb-1">Support Our Heritage</h4>
            <p className="text-[12px] lg:text-[13px] text-foreground/70 dark:text-earth-100/70 italic font-serif leading-tight">Direct Bank Donations for Gaushala</p>
          </div>
          <div className="flex flex-wrap md:flex-nowrap justify-between w-full md:w-auto flex-1 gap-y-4 gap-x-2 lg:gap-6 md:ml-4 lg:ml-8 text-[11px] lg:text-[13px]">
             <div className="w-[45%] md:w-auto overflow-hidden">
                <p className="text-[8px] lg:text-[9px] text-foreground/50 dark:text-earth-100/50 uppercase font-bold tracking-widest mb-1 truncate">Name</p>
                <p className="text-tertiary-900 dark:text-white font-medium truncate">MeriGauMata</p>
             </div>
             <div className="w-[45%] md:w-auto overflow-hidden">
                <p className="text-[8px] lg:text-[9px] text-foreground/50 dark:text-earth-100/50 uppercase font-bold tracking-widest mb-1 truncate">Bank</p>
                <p className="text-tertiary-900 dark:text-white font-medium truncate">SBI</p>
             </div>
             <div className="w-[45%] md:w-auto overflow-hidden">
                <p className="text-[8px] lg:text-[9px] text-foreground/50 dark:text-earth-100/50 uppercase font-bold tracking-widest mb-1 truncate">Branch</p>
                <p className="text-tertiary-900 dark:text-white font-medium truncate">Mumbai</p>
             </div>
             <div className="w-[45%] md:w-auto overflow-hidden min-w-[130px]">
                <p className="text-[8px] lg:text-[9px] text-foreground/50 dark:text-earth-100/50 uppercase font-bold tracking-widest mb-1 truncate">A/C No & IFSC</p>
                <p className="text-tertiary-900 dark:text-white font-medium truncate">1234567890 • BANK0001234</p>
             </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-4 flex flex-col gap-4 text-[10px] font-medium text-foreground/50 dark:text-earth-100/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 text-center md:text-left">
            <p className="flex-1">&copy; {new Date().getFullYear()} MeriGauMata. <span className="text-primary-600 dark:text-primary-500 font-bold tracking-widest block sm:inline mt-1 sm:mt-0">ALL RIGHTS RESERVED</span></p>
            
            <div className="flex gap-2 flex-1 justify-center md:justify-end">
               <div className="h-6 w-9 bg-white rounded flex items-center justify-center border border-neutral-200 shadow-sm">
                 <span className="text-[7px] font-bold text-[#1434CB] leading-none">VISA</span>
               </div>
               <div className="h-6 w-9 bg-white rounded flex items-center justify-center border border-neutral-200 shadow-sm">
                 <span className="text-[6px] font-bold text-[#EB001B] flex space-x-[-3px] items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#EB001B]/80"></div><div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B]/80"></div></span>
               </div>
               <div className="h-6 w-9 bg-white rounded flex items-center justify-center border border-neutral-200 shadow-sm">
                 <span className="text-[7px] font-bold text-[#003087] italic leading-none">Pay<span className="text-[#0079C1]">Pal</span></span>
               </div>
            </div>
          </div>
        </div>
        </div>

        <div className="hidden sm:block text-center pt-4 w-full mt-4 text-[10px] opacity-80 text-foreground/50 dark:text-earth-100/50">
          <p>
            Developed by <a href="#" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-500 font-bold hover:underline transition-all">Ayush Sharma</a>.
          </p>
        </div>

        {/* Mobile Sleek Footer - Visible on Mobile Only */}
        <div className="block sm:hidden bg-[var(--color-footer-bg)] rounded-[2rem] py-8 px-6 text-tertiary-900 dark:text-earth-50 shadow-sm border border-black/5 dark:border-white/5">
          {/* Brand Col */}
          <div className="flex flex-col items-center text-center mb-6">
            <h3 className="font-serif text-lg font-bold mb-1 flex items-center gap-2 text-tertiary-900 dark:text-white">
              <span className="bg-primary-100 dark:bg-primary-50 text-tertiary-900 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">
                M
              </span>
              MeriGauMata
            </h3>
            <p className="text-[7px] font-bold text-primary-600 dark:text-primary-500 tracking-[0.25em] uppercase">Sacred Vedic Essence</p>
          </div>

          {/* Quick Links Grid */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-2 text-xs text-stone-600 dark:text-stone-300 font-medium">
            <Link href="/shop" className="hover:text-primary-600 transition-colors">{t('nav.shop')}</Link>
            <span className="text-stone-300">•</span>
            <Link href="/events" className="hover:text-primary-600 transition-colors">{t('nav.events')}</Link>
            <span className="text-stone-300">•</span>
            <Link href="/blogs" className="hover:text-primary-600 transition-colors">{t('nav.blog')}</Link>
            <span className="text-stone-300">•</span>
            <Link href="/gallery" className="hover:text-primary-600 transition-colors">{t('nav.gallery')}</Link>
            <span className="text-stone-300">•</span>
            <Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
          </div>

          {/* Customer Service Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6 text-[10px] text-stone-500 dark:text-stone-400 font-normal">
            <Link href="/shipping-and-refund-policy" className="hover:text-primary-600 transition-colors">Shipping & Returns</Link>
            <span className="text-stone-300/60">•</span>
            <Link href="/privacy-policy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
            <span className="text-stone-300/60">•</span>
            <Link href="/terms-and-conditions" className="hover:text-primary-600 transition-colors">Terms & Conditions</Link>
          </div>

          {/* Trust Highlights Badge Strip */}
          <div className="grid grid-cols-2 gap-3 py-4 border-t border-b border-earth-200/50 dark:border-white/5 mb-6 text-[10px] text-center">
            <div className="flex items-center justify-center gap-2">
              <AppIcon name="truck" size="xs" className="text-primary-600" />
              <span className="font-semibold tracking-wider text-stone-700 dark:text-stone-200">Pan India Shipping</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <AppIcon name="star" size="xs" className="text-primary-600" />
              <span className="font-semibold tracking-wider text-stone-700 dark:text-stone-200">100% Vedic Pure</span>
            </div>
          </div>

          {/* Direct Donation Info Pill */}
          <div className="bg-stone-50 dark:bg-stone-900/40 rounded-xl p-3 border border-earth-200/40 dark:border-white/5 text-center mb-6">
            <h4 className="text-[8px] font-bold tracking-widest text-primary-600 uppercase mb-0.5">Support Our Gaushala</h4>
            <p className="text-[10px] text-stone-500 mb-2">Direct Bank Donation Info</p>
            <p className="text-[11px] font-medium text-stone-700 dark:text-stone-200">
              SBI • A/C: 1234567890 • IFSC: BANK0001234
            </p>
          </div>

          {/* Social Links Row */}
          <div className="flex justify-center gap-4 mb-6">
            <a href="#" className="w-7 h-7 rounded-full border border-earth-200 dark:border-earth-100/10 flex items-center justify-center text-stone-500 hover:text-primary-600">
              <AppIcon name="facebook" size="xs" />
            </a>
            <a href="#" className="w-7 h-7 rounded-full border border-earth-200 dark:border-earth-100/10 flex items-center justify-center text-stone-500 hover:text-primary-600">
              <AppIcon name="instagram" size="xs" />
            </a>
            <a href="#" className="w-7 h-7 rounded-full border border-earth-200 dark:border-earth-100/10 flex items-center justify-center text-stone-500 hover:text-primary-600">
              <AppIcon name="twitter" size="xs" />
            </a>
          </div>

          {/* Legal / Creator */}
          <div className="text-center text-[9px] text-stone-400">
            <p>&copy; {new Date().getFullYear()} MeriGauMata. All Rights Reserved.</p>
            <p className="mt-1">
              Developed by <a href="#" className="text-primary-600 font-bold hover:underline">Ayush Sharma</a>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
