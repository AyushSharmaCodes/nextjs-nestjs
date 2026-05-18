import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';
import { Event } from '../types/events.types';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const {
    imageUrl,
    title,
    description,
    location,
    startDate,
    startTime,
    status
  } = event;

  // Format date helper
  let month = 'MAR';
  let day = '18';
  try {
    const parsedDate = new Date(startDate);
    month = format(parsedDate, 'MMM').toUpperCase();
    day = format(parsedDate, 'dd');
  } catch (e) {
    // fallback
  }

  // Localize status display
  const isOngoing = status === 'ongoing';

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-sm hover:shadow-md border border-earth-200 dark:border-neutral-800 transition-all overflow-hidden flex flex-col h-full group">
      
      {/* Wrapper to allow Date Badge to overflow cleanly without losing the hover zoom overflow-hidden container */}
      <div className="relative">
        {/* Image Area */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] md:aspect-[2/1] lg:aspect-[16/9] xl:aspect-[2.5/1] overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          
          {/* Status Tag */}
          <div className="absolute top-6 left-6 z-10">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black tracking-[0.15em] uppercase shadow-md ${isOngoing ? 'bg-primary-500 text-white' : 'bg-white text-tertiary-900 border border-earth-200 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isOngoing ? 'bg-white animate-pulse' : 'bg-primary-500'}`}></span>
              {status}
            </span>
          </div>
        </div>

        {/* Date Badge - placed outside overflow-hidden, styled with legible Month & Day */}
        <div className="absolute -bottom-9 left-6 w-[4.5rem] h-[4.5rem] bg-[#3B543D] text-white rounded-full flex flex-col justify-center items-center shadow-lg border-4 border-white dark:border-neutral-900 z-10 select-none">
          <span className="text-[10px] font-black leading-none uppercase tracking-[0.15em] text-white/95">{month}</span>
          <span className="text-[22px] font-extrabold leading-none mt-1">{day}</span>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="pt-12 px-6 pb-6 flex flex-col flex-grow">
        <h3 className="text-xl sm:text-2xl font-serif font-semibold text-tertiary-900 dark:text-neutral-100 mb-3 line-clamp-2 transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {title}
        </h3>
        <p className="text-sm text-foreground/60 dark:text-neutral-400 leading-relaxed mb-6 flex-grow line-clamp-3">
          {description}
        </p>
        
        {/* Location Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-foreground/70 dark:text-neutral-300 border-t border-earth-200 dark:border-neutral-800 pt-4 mt-auto">
          {startTime && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#3B543D] dark:text-[#4A6B4C] shrink-0" />
              <span className="text-sm font-medium">{startTime}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#3B543D] dark:text-[#4A6B4C] shrink-0" />
            <span className="text-sm font-medium">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
