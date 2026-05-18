import { SanctuaryEvent, Product, Donation } from '@/features/manager/types/manager.types';

export const mockEvents: SanctuaryEvent[] = [
  {
    id: '1',
    name: 'MockData.events.gopashtami.name',
    date: '2026-11-18',
    location: 'MockData.events.gopashtami.location',
    status: 'Upcoming'
  },
  {
    id: '2',
    name: 'MockData.events.kamadhenu.name',
    date: '2026-06-05',
    location: 'MockData.events.kamadhenu.location',
    status: 'Scheduled'
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'MockData.products.ghee.name',
    price: '₹1,850',
    stock: 124
  },
  {
    id: '2',
    name: 'MockData.products.ark.name',
    price: '₹340',
    stock: 89
  }
];

export const mockDonations: Donation[] = [
  {
    id: '1',
    source: 'MockData.donations.arjun.source',
    amount: '₹11,000',
    purpose: 'MockData.donations.arjun.purpose'
  },
  {
    id: '2',
    source: 'MockData.donations.priyah.source',
    amount: '₹5,100',
    purpose: 'MockData.donations.priyah.purpose'
  },
  {
    id: '3',
    source: 'MockData.donations.karan.source',
    amount: '₹25,000',
    purpose: 'MockData.donations.karan.purpose'
  }
];
