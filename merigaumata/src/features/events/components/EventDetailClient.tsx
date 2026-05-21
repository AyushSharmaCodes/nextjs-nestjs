'use client';

import { Event } from '../types/events.types';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { AppIcon } from '@/shared/icons';
import { EventTabs } from './EventTabs';
import { EventRegistrationModal } from './EventRegistrationModal';
import { format, differenceInHours } from 'date-fns';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface EventDetailClientProps {
  event: Event;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const t = useTranslations('events');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dateStr = event.startDate ? format(new Date(event.startDate), 'EEE, d MMMM') : '';
  const timeStr = event.startTime || '';
  const subtitleStr = [dateStr, timeStr, 'Multi session', 'Weekly'].filter(Boolean).join(' • ');

  const startsIn = event.startDate 
    ? differenceInHours(new Date(event.startDate), new Date())
    : 0;
  
  const tagText = startsIn > 0 
    ? t('startsIn', { hours: startsIn }) 
    : event.status === 'completed' 
      ? t('status.completed') 
      : t('happeningNow');

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 relative pb-32 transition-colors">
      
      {/* Blurred Background Header */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 blur-3xl scale-110 origin-top"
          style={{ backgroundImage: `url(${event.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 dark:via-neutral-950/80 to-white dark:to-neutral-950" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-32">
        
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/events" className="flex items-center gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-stone-700 dark:text-stone-300 shadow-sm border border-stone-200/50 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-900 transition-colors">
            <AppIcon name="chevronLeft" size="sm" />
            <span>{t('back')}</span>
          </Link>
        </div>

        {/* Center Content Container */}
        <div className="max-w-4xl mx-auto flex flex-col items-start w-full">
          
          {/* Feature Image */}
          <div className="w-full aspect-[16/9] relative rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-8 border-[6px] border-white/40 dark:border-neutral-800/40">
            <Image 
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            
            {/* Tag on Image */}
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-300 shadow-sm">
              {tagText}
            </div>
          </div>

          {/* Event Header Info */}
          <div className="w-full text-left mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-2">
              {event.title}
            </h1>
            <p className="text-stone-500 dark:text-stone-400 font-medium">
              {subtitleStr}
            </p>
          </div>

          {/* Guest Avatars row */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-stone-400 dark:text-stone-500 text-[15px] font-normal">{t('guest')}</span>
            <div className="flex items-center -space-x-1.5 ml-2">
              {/* Initials Circles */}
              <div className="w-7 h-7 rounded-full border border-white dark:border-neutral-800 bg-[#54B4FF] flex items-center justify-center text-[10px] font-bold text-white shadow-sm animate-pulse">
                AS
              </div>
              <div className="w-7 h-7 rounded-full border border-white dark:border-neutral-800 bg-[#FF5FA8] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                FA
              </div>
              <div className="w-7 h-7 rounded-full border border-white dark:border-neutral-800 bg-[#2DD4BF] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                TA
              </div>
              {/* Guest Count Pill */}
              <div className="h-7 px-2.5 rounded-full border border-white dark:border-neutral-800 bg-[#F3F4F6] dark:bg-neutral-800 flex items-center justify-center text-[10px] font-medium text-stone-500 dark:text-stone-400 shadow-sm">
                {event.guestCount || 32}+
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={event.status === 'completed'}
            className={`px-8 py-3.5 rounded-full font-medium flex items-center gap-2 shadow-md transition-all duration-300 ease-out mb-12 cursor-pointer ${
              event.status === 'completed' 
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none dark:bg-neutral-800 dark:text-neutral-600' 
                 : 'bg-stone-900 dark:bg-neutral-800 hover:bg-[#1B8057] dark:hover:bg-[#1B8057] text-white hover:scale-[1.04] hover:shadow-xl hover:shadow-emerald-900/20 active:scale-95'
            }`}
          >
            <AppIcon name="qrCode" size="md" />
            <span>{t('book')}</span>
          </button>

          <EventRegistrationModal event={event} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

          {/* Tabs Section */}
          <div className="w-full border-t border-stone-200/60 dark:border-stone-850 pt-6">
             <EventTabs event={event} />
          </div>

        </div>

      </div>
    </div>
  );
}
