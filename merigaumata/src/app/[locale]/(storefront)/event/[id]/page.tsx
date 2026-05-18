import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eventsService } from '@/features/events/services/events.service';
import { EventDetailClient } from '@/features/events/components/EventDetailClient';
import { setRequestLocale } from 'next-intl/server';

interface EventPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await eventsService.getById(id);

  if (!event) {
    return {
      title: 'Event Not Found | MeriGauMata',
      description: 'The requested event could not be located in our sanctuary database.',
    };
  }

  return {
    title: `${event.title} - Sacred Vedic Retreats | MeriGauMata`,
    description: `${event.description} Join us at ${event.location}.`,
    openGraph: {
      title: `${event.title} | MeriGauMata`,
      description: event.description,
      images: [{ url: event.imageUrl }],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { locale, id } = await params;
  
  // Set the locale for next-intl server-side processing
  setRequestLocale(locale);

  const event = await eventsService.getById(id);

  if (!event) {
    notFound();
  }

  return (
    <EventDetailClient event={event} />
  );
}
