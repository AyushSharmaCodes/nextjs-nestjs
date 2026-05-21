import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { AppIcon } from '@/shared/icons';

export default async function DonationBanner() {
  const t = await getTranslations('home.donation');

  return (
    <section className="py-20 bg-tertiary-900 border-t border-tertiary-800 text-white flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
        <p className="text-[11px] font-bold tracking-[0.3em] text-white/50 uppercase mb-4 sm:mb-6">
          {t('badge')}
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-[1.1] text-white tracking-tight flex flex-col sm:block">
          {t.rich('title', {
            gradient: (chunks) => (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-400">
                {chunks}
              </span>
            )
          })}
        </h2>
        <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto mb-10">
          {t('subtitle')}
        </p>
        <Link 
          href="/donate" 
          className="group flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-500 text-tertiary-900 font-bold uppercase tracking-widest text-[13px] px-10 py-5 transition-all w-full sm:w-auto hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(234,106,71,0.5)] shadow-lg"
        >
          <AppIcon name="heart" className="h-[18px] w-[18px]" />
          {t('buttonText')}
          <AppIcon name="arrowUpRight" className="h-[18px] w-[18px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
