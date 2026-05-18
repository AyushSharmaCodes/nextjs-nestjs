import { tokenVault } from '@/shared/lib/api/tokens';
import { ManagerAccount, SanctuaryEvent, Product, Donation } from '../types/manager.types';
import { mockEvents, mockProducts, mockDonations } from '@/mocks/sanctuaryMocks';
import { mockDefaultManagers } from '@/mocks/userMocks';

// Dynamic mock flag using environment presence
const isProductionApi = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

export const managerService = {
  getManagerProfile: async (): Promise<ManagerAccount> => {
    let loggedInEmail = 'manager@merigaumata.com';
    if (typeof window !== 'undefined') {
      const storedEmail = tokenVault.getUserEmail();
      if (storedEmail) loggedInEmail = storedEmail;
    }

    if (isProductionApi) {
      // Production API endpoint hooks go here
    }

    if (typeof window !== 'undefined') {
      const storedAccounts = localStorage.getItem('mgm_manager_accounts');
      if (storedAccounts) {
        const accounts: ManagerAccount[] = JSON.parse(storedAccounts);
        const found = accounts.find((a) => a.email.toLowerCase() === loggedInEmail.toLowerCase());
        if (found) return found;
      }
    }

    // Default mock lookup
    const defaultManager = mockDefaultManagers.find(
      (m) => m.email.toLowerCase() === loggedInEmail.toLowerCase()
    ) || {
      ...mockDefaultManagers[0],
      email: loggedInEmail,
      id: 'default-fallback',
      createdAt: new Date().toISOString()
    };

    return defaultManager as unknown as ManagerAccount;
  },

  getEventsList: async (): Promise<SanctuaryEvent[]> => {
    if (isProductionApi) {
      // In production API fetch events
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mgm_sanctuary_events');
      if (stored) return JSON.parse(stored) as SanctuaryEvent[];
    }
    return mockEvents as SanctuaryEvent[];
  },

  saveEventsList: async (events: SanctuaryEvent[]): Promise<SanctuaryEvent[]> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mgm_sanctuary_events', JSON.stringify(events));
    }
    return events;
  },

  getProductsList: async (): Promise<Product[]> => {
    if (isProductionApi) {
      // In production API fetch products
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mgm_sanctuary_products');
      if (stored) return JSON.parse(stored) as Product[];
    }
    return mockProducts as Product[];
  },

  saveProductsList: async (products: Product[]): Promise<Product[]> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mgm_sanctuary_products', JSON.stringify(products));
    }
    return products;
  },

  getDonationsList: async (): Promise<Donation[]> => {
    if (isProductionApi) {
      // In production API fetch donations
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mgm_sanctuary_donations');
      if (stored) return JSON.parse(stored) as Donation[];
    }
    return mockDonations as Donation[];
  }
};
