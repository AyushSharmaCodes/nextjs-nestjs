'use client';

import { useState } from 'react';
import { Event } from '../types/events.types';
import Image from 'next/image';
import { Info, Sparkles, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface EventTabsProps {
  event: Event;
}

type TabType = 'details' | 'highlights' | 'privileges';

export function EventTabs({ event }: EventTabsProps) {
  const t = useTranslations('events');
  const [activeTab, setActiveTab] = useState<TabType>('details');

  return (
    <div className="w-full">
      
      {/* Tabs Header */}
      <div className="flex gap-6 border-b border-stone-100 dark:border-stone-800 mb-8">
        <button 
          onClick={() => setActiveTab('details')}
          className={`pb-3 flex items-center gap-1.5 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'details' ? 'text-primary-600 dark:text-primary-400' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Info className="w-4 h-4" />
          <span>Details</span>
          {activeTab === 'details' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('highlights')}
          className={`pb-3 flex items-center gap-1.5 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'highlights' ? 'text-primary-600 dark:text-primary-400' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Highlights</span>
          {activeTab === 'highlights' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('privileges')}
          className={`pb-3 flex items-center gap-1.5 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'privileges' ? 'text-primary-600 dark:text-primary-400' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Gift className="w-4 h-4" />
          <span>Special Privileges</span>
          {activeTab === 'privileges' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'details' && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Description Section */}
            <div>
              <h3 className="text-sm font-medium text-stone-400 mb-3">Description</h3>
              <p className="text-stone-600 dark:text-neutral-350 text-[15px] leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Co-hosts Section */}
            <div>
              <h3 className="text-sm font-medium text-stone-400 mb-4">Event co-host</h3>
              {event.coHosts && event.coHosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {event.coHosts.map((host, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-stone-200 dark:border-neutral-700">
                        <Image src={host.avatarUrl} alt={host.name} fill className="object-cover animate-pulse" />
                      </div>
                      <span className="font-medium text-stone-850 dark:text-stone-200 text-sm">{host.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 text-sm">No co-hosts assigned.</p>
              )}
            </div>

            {/* Quick Info Grid - 2 per row styled like standard sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 pt-6 border-t border-stone-100 dark:border-stone-800">
              {/* Price */}
              <div>
                <h3 className="text-sm font-medium text-stone-400 mb-2">Price</h3>
                <div className="flex items-baseline gap-1.5 text-stone-600 dark:text-neutral-350 text-[15px] leading-relaxed">
                  <span>
                    {event.price ? `₹${event.price.toFixed(2)}` : t('complimentary')}
                  </span>
                  {event.price && <span className="text-[10px] text-stone-400 uppercase">Inc. of all taxes</span>}
                </div>
              </div>

              {/* Slots Available */}
              <div>
                <h3 className="text-sm font-medium text-stone-400 mb-2">Slots Available</h3>
                <p className="text-stone-600 dark:text-neutral-350 text-[15px] leading-relaxed">
                  {event.slotsAvailable !== undefined ? event.slotsAvailable : 'Unlimited'}
                </p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-stone-400 mb-2">Location</h3>
                <p className="text-stone-600 dark:text-neutral-350 text-[15px] leading-relaxed">
                  {event.location}
                </p>
              </div>

              {/* Registration Deadline */}
              <div>
                <h3 className="text-sm font-medium text-stone-400 mb-2">{t('registrationDeadline')}</h3>
                <p className="text-stone-600 dark:text-neutral-350 text-[15px] leading-relaxed">
                  {event.registrationDeadline ? format(new Date(event.registrationDeadline), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'highlights' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <h3 className="text-sm font-medium text-stone-400 mb-4">{t('highlights')}</h3>
             {event.highlights && event.highlights.length > 0 ? (
               <ul className="space-y-3">
                 {event.highlights.map((highlight, idx) => (
                   <li key={idx} className="flex items-start gap-3">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mt-2 flex-shrink-0" />
                     <span className="text-stone-600 dark:text-neutral-350 text-[15px] leading-relaxed">{highlight}</span>
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="text-stone-500 text-sm">No highlights available for this event.</p>
             )}
          </div>
        )}

        {activeTab === 'privileges' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <h3 className="text-sm font-medium text-stone-400 mb-4">{t('whatYouGet')}</h3>
             {event.privileges && event.privileges.length > 0 ? (
               <div className="flex flex-col gap-4">
                 {event.privileges.map((privilege, idx) => {
                   const [title, desc] = privilege.includes(':') ? privilege.split(':') : [privilege, ''];
                   return (
                     <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                       <span className="font-medium text-stone-800 dark:text-stone-200 text-[15px]">{title}</span>
                       {desc && <span className="text-stone-600 dark:text-neutral-350 text-[15px]">{desc.trim()}</span>}
                     </div>
                   );
                 })}
               </div>
             ) : (
               <p className="text-stone-500 text-sm">No special privileges specified.</p>
             )}
          </div>
        )}
      </div>

    </div>
  );
}
