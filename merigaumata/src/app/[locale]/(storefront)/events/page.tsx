import { Suspense } from 'react';
import { eventsService } from '@/features/events/services/events.service';
import { EventsCatalog } from '@/features/events/components/EventsCatalog';

export default async function EventsPage() {
  // Pre-fetch events from server-side service for SEO compatibility
  const allEvents = await eventsService.getAll();

  return (
    <div className="pt-24 pb-20 bg-earth-50 dark:bg-stone-950 min-h-screen transition-colors duration-300">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[400px] text-stone-400">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <span className="text-sm font-medium mt-4">Loading Sacred Gatherings...</span>
        </div>
      }>
        <EventsCatalog initialEvents={allEvents} />
      </Suspense>
    </div>
  );
}
