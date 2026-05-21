import { AppIcon } from '@/shared/icons';
import { getTranslations } from 'next-intl/server';

export default async function BenefitsSection() {
  const t = await getTranslations('home');

  const benefits = [
    {
      icon: 'milk' as const,
      title: t('benefits.b1Title'),
      description: t('benefits.b1Desc')
    },
    {
      icon: 'leaf' as const,
      title: t('benefits.b2Title'),
      description: t('benefits.b2Desc')
    },
    {
      icon: 'recycle' as const,
      title: t('benefits.b3Title'),
      description: t('benefits.b3Desc')
    },
    {
      icon: 'heart' as const,
      title: t('benefits.b4Title'),
      description: t('benefits.b4Desc')
    }
  ];

  return (
    <section className="py-24 bg-background border-t border-earth-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-xs font-bold text-primary-700 uppercase tracking-widest mb-6">
            <AppIcon name="milk" className="w-3.5 h-3.5" />
            {t('benefits.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-tertiary-900 dark:text-neutral-100 mb-4 tracking-tight">
            {t('benefits.title')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium">
            {t('benefits.subtitle')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) => {
            return (
              <div 
                key={idx} 
                className="group bg-earth-50 dark:bg-neutral-900/50 border border-transparent hover:border-primary-200 dark:hover:border-primary-900 rounded-[2rem] p-8 lg:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:bg-white dark:hover:bg-neutral-900 cursor-default"
              >
                <div className="w-20 h-20 bg-white dark:bg-neutral-800 group-hover:bg-primary-600 rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.03)] mb-8 transition-colors duration-300">
                  <AppIcon name={benefit.icon} className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-tertiary-900 dark:text-neutral-100 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
