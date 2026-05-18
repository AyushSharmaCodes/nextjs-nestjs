import { Event } from '../types/events.types';

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Gau-Shakti: Holistic Health & Meditation Retreat',
    subtitle: 'Global Peace & Wellness Retreat',
    startDate: '2026-04-14T00:00:00Z',
    startTime: '10:36 PM',
    endTime: '10:36 PM',
    location: 'Heritage Gaushala & Eco-Resort',
    description: 'Experience the healing power of cows in this unique wellness retreat. Focus on mental peace, physical detoxification, and spiritual rejuvenation through traditional Vedic practices and close interaction with indigenous cows.',
    imageUrl: 'https://picsum.photos/seed/event1/800/400',
    registrationOpen: true,
    status: 'completed',
    featured: true,
    price: 150.00,
    slotsAvailable: 100,
    registeredCount: 0,
    registrationDeadline: '2026-04-03T00:00:00Z',
    highlights: [
      'Guided meditation sessions in the presence of cows to reduce stress.',
      'Introduction to the medicinal uses of cow-derived products for chronic ailments.',
      'Pure, farm-to-table breakfast made with A2 dairy and organic grains.'
    ],
    privileges: [
      'One-on-One Consultation: Personal session with an Ayurvedic Vaidya (doctor).',
      'Adoption Program: Opportunity to virtually "Adopt a Cow" and support its lifelong care.',
      'Eco-Gift Hamper: A set of handmade cow-dung diyas and herbal incense.'
    ],
    coHosts: [
      { name: 'Dr. Vasant Lad', avatarUrl: 'https://i.pravatar.cc/150?u=vasant' },
      { name: 'Swami Vidyadhishananda', avatarUrl: 'https://i.pravatar.cc/150?u=swami' }
    ],
    guestAvatars: [
      'https://i.pravatar.cc/150?u=a1',
      'https://i.pravatar.cc/150?u=a2',
      'https://i.pravatar.cc/150?u=a3',
      'https://i.pravatar.cc/150?u=a4'
    ],
    guestCount: 32
  },
  {
    id: 'e2',
    title: 'Historical Reenactment Festival',
    subtitle: 'International Imersive Open Music International Imersive O International',
    startDate: '2026-05-12T00:00:00Z',
    startTime: '1pm',
    endTime: '4pm',
    location: 'Community Garden Center',
    description: 'Learn how to utilize cow-based fertilizers and natural farming techniques in this hands-on workshop.',
    imageUrl: 'https://picsum.photos/seed/event2/800/400',
    registrationOpen: true,
    status: 'completed'
  },
  {
    id: 'e3',
    title: 'International Imersive Open Music Festival',
    subtitle: 'International Imersive Open Music International Imersive O International Imersive Open Music In...',
    startDate: '2026-05-12T00:00:00Z',
    endDate: '2026-05-15T00:00:00Z',
    location: 'City Square',
    description: 'Multi-day event without specific daily time.',
    imageUrl: 'https://picsum.photos/seed/event3/800/400',
    registrationOpen: true,
    status: 'coming_soon',
    discountTag: 'Sale 30%',
    price: 1200,
    featured: true
  },
  {
    id: 'e4',
    title: 'Citywide Art Festival',
    subtitle: 'International Imersive Open Music',
    startDate: '2026-05-12T00:00:00Z',
    startTime: '1pm',
    endTime: '4pm',
    location: 'Main Sanctuary, Vrindavan Valley',
    description: 'Join us for our annual celebration.',
    imageUrl: 'https://picsum.photos/seed/event4/800/400',
    registrationOpen: true,
    status: 'ongoing'
  },
  {
    id: 'e5',
    title: 'Historical Reenactment Festival',
    subtitle: 'International Imersive Open Music',
    startDate: '2026-05-12T00:00:00Z',
    startTime: '1pm',
    endTime: '4pm',
    location: 'Main Sanctuary, Vrindavan Valley',
    description: 'Join us for our annual celebration.',
    imageUrl: 'https://picsum.photos/seed/event5/800/400',
    registrationOpen: true,
    status: 'coming_soon'
  },
  {
    id: 'e6',
    title: 'Historical Reenactment Festival',
    subtitle: 'International Imersive Open Music',
    startDate: '2026-05-12T00:00:00Z',
    startTime: '1pm',
    endTime: '4pm',
    location: 'Main Sanctuary, Vrindavan Valley',
    description: 'Join us for our annual celebration.',
    imageUrl: 'https://picsum.photos/seed/event6/800/400',
    registrationOpen: true,
    status: 'coming_soon',
    discountTag: 'Sale 30%'
  },
  {
    id: 'e7',
    title: 'Classical Indian Music Night',
    subtitle: 'Experience soul-stirring ragas under the stars.',
    startDate: '2026-06-20T00:00:00Z',
    startTime: '7pm',
    endTime: '10pm',
    location: 'Riverfront Amphitheater',
    description: 'Join us for an enchanting evening of classical Indian music featuring renowned maestros.',
    imageUrl: 'https://picsum.photos/seed/event7/800/400',
    registrationOpen: true,
    status: 'coming_soon'
  },
  {
    id: 'e8',
    title: 'Yoga Retreat Weekend',
    subtitle: 'Rejuvenate body and mind in nature.',
    startDate: '2026-07-15T00:00:00Z',
    endDate: '2026-07-17T00:00:00Z',
    location: 'Mountain View Sanctuary',
    description: 'A comprehensive weekend retreat focusing on holistic wellbeing through ancient yoga traditions.',
    imageUrl: 'https://picsum.photos/seed/event8/800/400',
    registrationOpen: true,
    status: 'coming_soon',
    discountTag: 'Sale 20%'
  }
];
