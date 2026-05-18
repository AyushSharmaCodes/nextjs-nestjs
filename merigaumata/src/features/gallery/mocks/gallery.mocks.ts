import { Gallery } from '../types/gallery.types';

const MOCK_BASE_GALLERIES = [
  {
    id: 1,
    title: 'The Annual Gau Ashtami',
    count: '34 Photos / Videos',
    images: [
      'https://www.youtube.com/embed/jNQXAC9IVRw?controls=0&showinfo=0&rel=0&autoplay=0&loop=0&mute=1',
      'https://picsum.photos/seed/gau2/300/200',
      'https://picsum.photos/seed/gau3/300/200',
      'https://picsum.photos/seed/gau4/300/200',
    ]
  },
  {
    id: 2,
    title: 'Community Feeding Drive',
    count: '14 Photos',
    images: [
      'https://picsum.photos/seed/feed1/600/400',
      'https://picsum.photos/seed/feed2/300/200',
      'https://www.youtube.com/embed/tgbNymZ7vqY?controls=0&showinfo=0&rel=0&autoplay=0&loop=0&mute=1',
      'https://picsum.photos/seed/feed4/300/200',
    ]
  },
  {
    id: 3,
    title: 'Medical Camps & Rescue',
    count: '56 Photos / Videos',
    images: [
      'https://www.youtube.com/embed/jNQXAC9IVRw?controls=0&showinfo=0&rel=0&autoplay=0&loop=0&mute=1',
      'https://picsum.photos/seed/med2/300/200',
      'https://picsum.photos/seed/med3/300/200',
      'https://picsum.photos/seed/med4/300/200',
    ]
  },
  {
    id: 4,
    title: 'Vedic Ceremonies',
    count: '53 Photos',
    images: [
      'https://picsum.photos/seed/vedic1/600/400',
      'https://picsum.photos/seed/vedic2/300/200',
      'https://picsum.photos/seed/vedic3/300/200',
      'https://picsum.photos/seed/vedic4/300/200',
    ]
  },
  {
    id: 5,
    title: 'Daily Goshala Life',
    count: '84 Photos',
    images: [
      'https://picsum.photos/seed/life1/600/400',
      'https://picsum.photos/seed/life2/300/200',
      'https://picsum.photos/seed/life3/300/200',
      'https://www.youtube.com/embed/jNQXAC9IVRw?controls=0&showinfo=0&rel=0&autoplay=0&loop=0&mute=1',
    ]
  },
  {
    id: 6,
    title: 'Volunteer Highlights',
    count: '33 Photos',
    images: [
      'https://picsum.photos/seed/vol1/600/400',
      'https://picsum.photos/seed/vol2/300/200',
      'https://picsum.photos/seed/vol3/300/200',
    ]
  },
  {
    id: 7,
    title: 'New Born Calves',
    count: '16 Photos / Videos',
    images: [
      'https://picsum.photos/seed/calf1/600/400',
      'https://picsum.photos/seed/calf2/300/200',
      'https://www.youtube.com/embed/tgbNymZ7vqY?controls=0&showinfo=0&rel=0&autoplay=0&loop=0&mute=1',
      'https://picsum.photos/seed/calf4/300/200',
    ]
  },
  {
    id: 8,
    title: 'Organic Farming Connect',
    count: '25 Photos',
    images: [
      'https://picsum.photos/seed/farm1/600/400',
      'https://picsum.photos/seed/farm2/300/200',
      'https://picsum.photos/seed/farm3/300/200',
    ]
  }
];

export const MOCK_GALLERIES: Gallery[] = [
  ...MOCK_BASE_GALLERIES,
  ...MOCK_BASE_GALLERIES.map(g => ({...g, id: g.id + 8, title: `${g.title} (Part 2)`})),
  ...MOCK_BASE_GALLERIES.map(g => ({...g, id: g.id + 16, title: `${g.title} (Part 3)`})),
  ...MOCK_BASE_GALLERIES.map(g => ({...g, id: g.id + 24, title: `${g.title} (Part 4)`})),
  ...MOCK_BASE_GALLERIES.map(g => ({...g, id: g.id + 32, title: `${g.title} (Part 5)`})),
];
