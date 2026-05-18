import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { CowStat, TimelineItem, TeamMember, Testimonial } from '../types/about.types';

interface AboutViewProps {
  cowStats: CowStat[];
  timeline: TimelineItem[];
  teamMembers: TeamMember[];
  testimonialsRow1: Testimonial[];
  testimonialsRow2: Testimonial[];
}

export async function AboutView({
  cowStats,
  timeline,
  teamMembers,
  testimonialsRow1,
  testimonialsRow2,
}: AboutViewProps) {
  const t = await getTranslations('about');

  return (
    <div className="bg-neutral-50 dark:bg-[#121212] min-h-screen text-foreground">
      
      {/* Container for the main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40">

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row gap-12 items-center mb-24">
          <div className="flex-1 space-y-6">
            <div className="text-sm font-medium text-tertiary-600 dark:text-tertiary-400 mb-2">
              <span className="text-neutral-500">[</span> <Link href="/" className="hover:text-primary-600 transition-colors">{t('breadcrumbHome')}</Link> <span className="text-neutral-300">/</span> {t('breadcrumbAbout')} <span className="text-neutral-500">]</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight text-tertiary-900 dark:text-white">
              {t.rich('hero.title', {
                br: () => <br className="hidden md:block" />
              })}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-xl">
              {t('hero.description')}
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="relative w-full aspect-[4/3] max-w-lg mx-auto md:ml-auto mt-8 md:mt-0">
               <div className="relative w-[90%] ml-auto h-full rounded-[2.5rem] overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02]">
                 <Image
                   src="https://picsum.photos/seed/abouthero/800/600"
                   alt="Cow Sanctuary"
                   fill
                   className="object-cover"
                   referrerPolicy="no-referrer"
                 />
               </div>
               
               {/* Circular Badge */}
               <div className="absolute -bottom-8 -left-4 sm:left-0 z-20 bg-white dark:bg-[#121212] shadow-xl rounded-full w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center p-2 border-[8px] sm:border-[12px] border-neutral-50 dark:border-[#1A1A1A]">
                 <div className="relative w-full h-full flex items-center justify-center">
                   {/* SVG for circular text */}
                   <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite]" style={{ animationDuration: '20s' }}>
                     <path id="circlePath" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" fill="transparent" />
                     <text className="text-[12px] font-bold fill-tertiary-900 dark:fill-white uppercase" style={{ letterSpacing: '0.15em' }}>
                       <textPath href="#circlePath" startOffset="0%">
                         {t('hero.badge')}
                       </textPath>
                     </text>
                   </svg>
                   {/* Center Icon */}
                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-400 dark:bg-primary-500 rounded-full flex items-center justify-center text-white z-10 shadow-inner">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Introduction & Stats */}
        <section className="mb-32">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-tertiary-950 dark:text-white leading-relaxed">
              {t('intro.text')}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800 py-12">
            {cowStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center px-4">
                <span className="text-4xl md:text-5xl font-bold text-tertiary-900 dark:text-white mb-2">{stat.value}</span>
                <span className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Our Mission */}
        <section className="flex flex-col lg:flex-row gap-16 items-center mb-32">
          <div className="flex-1 w-full order-2 lg:order-1">
             <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto">
                {/* Large Background Image */}
                <div className="relative w-[85%] h-full rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <Image 
                    src="https://picsum.photos/seed/mission1/800/800"
                    alt="Our Mission"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Smaller Overlapping Image */}
                <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-8 lg:-right-12 w-[50%] aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white dark:border-[#121212] transition-all duration-300 hover:scale-[1.02] z-10">
                  <Image 
                    src="https://picsum.photos/seed/mission2/600/800"
                    alt="Our Mission Secondary"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
             </div>
          </div>
          <div className="flex-1 space-y-6 order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-tertiary-900 dark:text-white">{t('mission.title')}</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg pb-4">
              {t('mission.description')}
            </p>
            <ul className="space-y-4">
              {[0, 1, 2, 3].map((idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary-500 shrink-0" />
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{t(`mission.items.${idx}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Our Vision */}
        <section className="flex flex-col lg:flex-row gap-16 items-center mb-32">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-tertiary-900 dark:text-white">{t('vision.title')}</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg pb-4">
              {t('vision.description')}
            </p>
            <ul className="space-y-4">
              {[0, 1, 2, 3].map((idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary-500 shrink-0" />
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{t(`vision.items.${idx}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full flex justify-end">
             <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto flex justify-end">
                {/* Large Background Image */}
                <div className="relative w-[85%] h-full rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <Image 
                    src="https://picsum.photos/seed/vision1/800/800"
                    alt="Our Vision Primary"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Smaller Overlapping Image */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-8 lg:-left-12 w-[50%] aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white dark:border-[#121212] transition-all duration-300 hover:scale-[1.02] z-10">
                  <Image 
                    src="https://picsum.photos/seed/vision2/600/800"
                    alt="Our Vision Secondary"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
             </div>
          </div>
        </section>

        {/* Our History - Timeline */}
        <section className="mb-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-tertiary-900 dark:text-white mb-6">{t('history.title')}</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              {t('history.subtitle')}
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto px-4 md:px-0">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-tertiary-200 dark:bg-tertiary-800 transform md:-translate-x-1/2 rounded-full"></div>
            
            <div className="space-y-12">
              {timeline.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={idx} className={`relative flex items-center md:justify-between w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Center Dot */}
                    <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-primary-500 border-4 border-white dark:border-[#121212] z-10 transform -translate-x-[14px] md:-translate-x-1/2 shadow-md flex items-center justify-center">
                    </div>
                    
                    {/* Invisible Spacer for alternate desktop layout */}
                    <div className="hidden md:block w-[45%]"></div>
                    
                    {/* Content Card */}
                    <div className="w-[calc(100%-3rem)] ml-12 md:ml-0 md:w-[45%]">
                      <div className="bg-white dark:bg-tertiary-900/30 p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-100 dark:border-tertiary-800/50 hover:shadow-md transition-shadow group">
                        <span className="inline-block px-3 py-1 bg-tertiary-100 dark:bg-tertiary-800 text-tertiary-800 dark:text-tertiary-200 rounded-full text-sm font-bold mb-3">
                          {item.year}
                        </span>
                        <h3 className="text-xl font-bold text-tertiary-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-tertiary-900 dark:text-white mb-4">{t('team.title')}</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('team.subtitle')}
              </p>
            </div>
            <button className="flex-shrink-0 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-sm whitespace-nowrap">
              {t('team.exploreAll')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-tertiary-100 border border-neutral-200 dark:border-neutral-800">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay gradien & social mock icons (optional) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                    <span className="text-white text-sm font-medium">{t('team.connect')}</span>
                  </div>
                </div>
                <h3 className="font-bold text-tertiary-900 dark:text-white text-lg">{member.name}</h3>
                <p className="text-neutral-500 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
      
      {/* Testimonials - Marquee (Full width) */}
      <section className="py-16 overflow-hidden">
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-tertiary-900 dark:text-white mb-6">{t('testimonials.title')}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Marquee Row 1 */}
        <div className="relative flex overflow-x-hidden group mb-6">
          <div className="animate-marquee flex w-max gap-6 px-3 whitespace-nowrap group-hover:[animation-play-state:paused]">
            {[...testimonialsRow1, ...testimonialsRow1].map((testimonial, idx) => (
              <div key={`${testimonial.id}-${idx}`} className="w-[350px] sm:w-[400px] flex-shrink-0 bg-white dark:bg-tertiary-900/30 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-tertiary-800/50 flex flex-col whitespace-normal">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image src={testimonial.avatar} alt={testimonial.name} width={48} height={48} className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-bold text-tertiary-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-xs text-neutral-500">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-primary-500 fill-primary-500" />
                    ))}
                  </div>
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed flex-grow">
                  &quot;{testimonial.content}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Reverse) */}
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee-reverse flex w-max gap-6 px-3 whitespace-nowrap group-hover:[animation-play-state:paused]">
             {[...testimonialsRow2, ...testimonialsRow2].map((testimonial, idx) => (
              <div key={`${testimonial.id}-${idx}`} className="w-[350px] sm:w-[400px] flex-shrink-0 bg-white dark:bg-tertiary-900/30 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-tertiary-800/50 flex flex-col whitespace-normal">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image src={testimonial.avatar} alt={testimonial.name} width={48} height={48} className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-bold text-tertiary-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-xs text-neutral-500">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-primary-500 fill-primary-500" />
                    ))}
                  </div>
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed flex-grow">
                  &quot;{testimonial.content}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Review CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="w-16 h-1 bg-tertiary-600 dark:bg-tertiary-500 mx-auto mb-8 rounded-full"></div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-tertiary-950 dark:text-white mb-6">{t('reviews.title')}</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto">
              {t('reviews.subtitle')}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-8 md:p-12 border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border-neutral-200 dark:border-neutral-800 text-left">
            <h3 className="text-2xl md:text-3xl font-bold font-serif text-tertiary-950 dark:text-white mb-2">{t('reviews.shareTitle')}</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-16 text-lg">{t('reviews.shareSubtitle')}</p>
            
            <div className="flex flex-col items-center justify-center py-8 text-center pb-20">
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                {t('reviews.signInPrompt')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Mission CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-6xl mx-auto relative overflow-hidden bg-tertiary-700 dark:bg-tertiary-800 rounded-[2.5rem] p-12 md:p-20 shadow-2xl text-center">
          {/* Subtle Background Icon */}
          <div className="absolute -left-12 -top-12 opacity-10 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6">{t('join.title')}</h2>
            <p className="text-tertiary-100 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10">
              {t('join.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-tertiary-700 hover:bg-neutral-50 hover:text-tertiary-900 rounded-full font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                {t('join.donateNow')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full font-bold transition-all flex items-center justify-center">
                {t('join.volunteer')}
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
