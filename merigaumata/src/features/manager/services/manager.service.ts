/**
 * @file manager.service.ts
 *
 * Mock manager service — used until the real API endpoints are wired.
 *
 * NOTE: The `isProductionApi` flag previously read `auth_token` from localStorage.
 * That has been removed — auth is cookie-only. Production API detection should
 * be driven by an environment variable (NEXT_PUBLIC_USE_MOCK_API) or by the
 * presence of real API endpoints, not by localStorage state.
 *
 * The manager's identity (email) is no longer read from localStorage.
 * Callers that need the current user's email should pass it in from
 * `useStrictAuth()` at the component level.
 */

import { ManagerAccount, SanctuaryEvent, Product, Donation } from '../types/manager.types';
import { mockEvents, mockProducts, mockDonations } from '@/mocks/sanctuaryMocks';
import { mockDefaultManagers } from '@/mocks/userMocks';

// In production this will be replaced by a real API flag or env var.
// Never use localStorage to detect auth state.
const isProductionApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'true' &&
  process.env.NODE_ENV === 'production';

export const managerService = {
  /**
   * Fetch the manager profile for the given email.
   * The email must be passed in from the authenticated session (useStrictAuth),
   * not read from localStorage.
   */
  getManagerProfile: async (loggedInEmail = 'manager@merigaumata.com'): Promise<ManagerAccount> => {
    if (isProductionApi) {
      // TODO: replace with real API call: GET /users/me (returns ProfileResponse)
    }

    if (typeof window !== 'undefined') {
      const storedAccounts = sessionStorage.getItem('mgm_manager_accounts');
      if (storedAccounts) {
        try {
          const accounts: ManagerAccount[] = JSON.parse(storedAccounts) as ManagerAccount[];
          const found = accounts.find(
            (a) => a.email.toLowerCase() === loggedInEmail.toLowerCase(),
          );
          if (found) return found;
        } catch {
          // Corrupt data — fall through to mock
        }
      }
    }

    const defaultManager = mockDefaultManagers.find(
      (m) => m.email.toLowerCase() === loggedInEmail.toLowerCase(),
    ) ?? {
      ...mockDefaultManagers[0],
      email: loggedInEmail,
      id: 'default-fallback',
      createdAt: new Date().toISOString(),
    };

    return defaultManager as unknown as ManagerAccount;
  },

  getEventsList: async (): Promise<SanctuaryEvent[]> => {
    if (isProductionApi) {
      // TODO: GET /events
    }
    return mockEvents as SanctuaryEvent[];
  },

  saveEventsList: async (events: SanctuaryEvent[]): Promise<SanctuaryEvent[]> => {
    if (isProductionApi) {
      // TODO: POST /events (bulk)
    }
    return events;
  },

  getProductsList: async (): Promise<Product[]> => {
    if (isProductionApi) {
      // TODO: GET /products
    }
    return mockProducts as Product[];
  },

  saveProductsList: async (products: Product[]): Promise<Product[]> => {
    if (isProductionApi) {
      // TODO: POST /products (bulk)
    }
    return products;
  },

  getDonationsList: async (): Promise<Donation[]> => {
    if (isProductionApi) {
      // TODO: GET /donations
    }
    return mockDonations as Donation[];
  },
};
