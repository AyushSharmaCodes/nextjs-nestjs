import Image from 'next/image';
import EventCard from './EventCard';
import { AppIcon } from '@/shared/icons';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Event } from '../types/events.types';

interface EventsSectionProps {
  events: Event[];
}

export default async function EventsSection({ events = [] }: EventsSectionProps) {
  const t = await getTranslations('home.events');
  const tEvents = await getTranslations('events');

  // Defensive check to ensure events is an array before filtering
  const displayEvents = Array.isArray(events) ? events.filter(e => e.featured) : [];

  if (displayEvents.length < 2) {
    return null; // Don't show if not enough events
  }

  return (
    <section className="py-24 bg-white dark:bg-neutral-950 transition-colors overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-xs font-bold text-primary-700 uppercase tracking-widest mb-6 font-sans">
              <AppIcon name="events" size="xs" />
              {t('badge')}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-tertiary-900 dark:text-neutral-100 uppercase tracking-tight mb-4">
              {t('title')}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
          <Link href="/events" className="group flex items-center gap-2 text-primary-600 dark:text-primary-500 font-bold tracking-widest uppercase text-sm hover:text-primary-700 dark:hover:text-primary-400 transition-colors">
            {t('viewAll')}
            <AppIcon name="arrowRight" size="md" className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        <div className="flex flex-col gap-8 lg:gap-12">
          
          {/* Row 1: 60% Card (EventCard) | 40% Full View */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 h-auto" style={{ minHeight: '400px' }}>
            <div className="w-full lg:w-[60%]">
              <EventCard event={displayEvents[0]} />
            </div>
            
            <div className="w-full lg:w-[40%] relative rounded-[2rem] overflow-hidden group hover:-translate-y-2 hover:shadow-xl transition-all duration-500 min-h-[450px] lg:min-h-full flex-shrink-0">
               <Image
                  src="https://picsum.photos/seed/fullcard1/800/1000"
                  alt="Gaushala Experience"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-[#2C1810]/70 to-transparent"></div>
               <div className="absolute inset-0 flex flex-col justify-end p-8 z-10 text-white">
                 <div className="flex gap-2 mb-4">
                   <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black tracking-[0.15em] uppercase text-white bg-primary-500 shadow-md">
                     <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse"></span>
                     {tEvents('ongoing')}
                   </span>
                   <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold tracking-widest uppercase text-white shadow-sm">
                     {tEvents('featured')}
                   </span>
                 </div>
                 
                 <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                   {tEvents('sevaCamp.title')}
                 </h3>
                 
                 <div className="space-y-3 mb-6 font-sans">
                   <div className="flex items-center gap-3 text-white/90 text-sm">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                       <AppIcon name="events" size="xs" className="text-primary-300" />
                     </div>
                     <span className="font-medium">{tEvents('sevaCamp.schedule')}</span>
                   </div>
                   <div className="flex items-center gap-3 text-white/90 text-sm">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                       <AppIcon name="clock" size="xs" className="text-primary-300" />
                     </div>
                     <span className="font-medium">{tEvents('sevaCamp.hours')}</span>
                   </div>
                   <div className="flex items-center gap-3 text-white/90 text-sm">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                       <AppIcon name="mapPin" size="xs" className="text-primary-300" />
                     </div>
                     <span className="font-medium">{tEvents('sevaCamp.location')}</span>
                   </div>
                 </div>
                 
                 <p className="text-white/80 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
                   {tEvents('sevaCamp.description')}
                 </p>
                 
                 <Link href={`/event/${displayEvents[0].id}`} className="w-full sm:w-auto px-8 py-3.5 bg-white text-tertiary-900 hover:bg-primary-500 hover:text-white font-bold tracking-wide rounded-xl transition-all shadow-lg active:scale-95 text-center block sm:inline-block cursor-pointer">
                   {tEvents('registerNow')}
                 </Link>
               </div>
            </div>
          </div>

          {/* Row 2: 40% Full View | 60% Card (EventCard) */}
          <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-10 h-auto" style={{ minHeight: '400px' }}>
            <div className="w-full lg:w-[40%] relative rounded-[2rem] overflow-hidden group hover:-translate-y-2 hover:shadow-xl transition-all duration-500 min-h-[450px] lg:min-h-full flex-shrink-0">
               <Image
                  src="https://picsum.photos/seed/fullcard2/800/1000"
                  alt="Workshop Session"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#1F2921] via-[#1F2921]/70 to-transparent"></div>
               <div className="absolute inset-0 flex flex-col justify-end p-8 z-10 text-white">
                 <div className="flex gap-2 mb-4">
                   <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black tracking-[0.15em] uppercase text-white bg-primary-500 shadow-md">
                     <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse"></span>
                     {tEvents('ongoing')}
                   </span>
                   <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold tracking-widest uppercase text-white shadow-sm">
                     {tEvents('workshop')}
                   </span>
                 </div>
                 
                 <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                   {tEvents('farmingWorkshop.title')}
                 </h3>
                 
                 <div className="space-y-3 mb-6 font-sans">
                   <div className="flex items-center gap-3 text-white/90 text-sm">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                       <AppIcon name="events" size="xs" className="text-green-300" />
                     </div>
                     <span className="font-medium">{tEvents('farmingWorkshop.date')}</span>
                   </div>
                   <div className="flex items-center gap-3 text-white/90 text-sm">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                       <AppIcon name="clock" size="xs" className="text-green-300" />
                     </div>
                     <span className="font-medium">{tEvents('farmingWorkshop.hours')}</span>
                   </div>
                   <div className="flex items-center gap-3 text-white/90 text-sm">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                       <AppIcon name="mapPin" size="xs" className="text-green-300" />
                     </div>
                     <span className="font-medium">{tEvents('farmingWorkshop.location')}</span>
                   </div>
                 </div>
                 
                 <p className="text-white/80 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
                   {tEvents('farmingWorkshop.description')}
                 </p>
                 
                 <Link href={`/event/${displayEvents[1].id}`} className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#1F2921] hover:bg-[#3B543D] hover:text-white font-bold tracking-wide rounded-xl transition-all shadow-lg active:scale-95 text-center block sm:inline-block cursor-pointer">
                   {tEvents('registerNow')}
                 </Link>
               </div>
            </div>

            <div className="w-full lg:w-[60%]">
              <EventCard event={displayEvents[1]} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
