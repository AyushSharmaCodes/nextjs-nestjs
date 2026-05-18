import { getTranslations } from 'next-intl/server';

export default async function RunningBanner() {
  const t = await getTranslations('home.runningBanner');

  const bannerItems = [
    t('text1'),
    t('text2'),
    t('text3')
  ];

  // Duplicate items to ensure seamless infinite looping even on large viewports
  const displayItems = [
    ...bannerItems, 
    ...bannerItems, 
    ...bannerItems, 
    ...bannerItems, 
    ...bannerItems, 
    ...bannerItems
  ];

  return (
    <div className="bg-primary-500 text-tertiary-900 overflow-hidden py-4 lg:py-5 relative flex items-center select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        <div className="flex shrink-0">
          {displayItems.map((item, idx) => (
            <div key={`set1-${idx}`} className="flex items-center shrink-0">
              <span className="text-sm md:text-base lg:text-lg font-sans tracking-widest font-bold uppercase">
                {item}
              </span>
              <span className="mx-8 lg:mx-16 text-tertiary-900 opacity-80 text-xl leading-none">
                ✦
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
