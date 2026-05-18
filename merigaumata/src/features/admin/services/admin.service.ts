import { ManagerAccount } from '../types/admin.types';
import { mockDefaultManagers } from '@/mocks/userMocks';

// Dynamic mock flag using environment presence
const isProductionApi = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

export const adminService = {
  getManagersList: async (): Promise<ManagerAccount[]> => {
    if (isProductionApi) {
      // Production API endpoint hooks go here
    }
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mgm_manager_accounts');
      if (stored) return JSON.parse(stored) as ManagerAccount[];
      
      // Seed default managers if missing
      localStorage.setItem('mgm_manager_accounts', JSON.stringify(mockDefaultManagers));
    }
    return mockDefaultManagers as unknown as ManagerAccount[];
  },

  saveManagersList: async (managers: ManagerAccount[]): Promise<ManagerAccount[]> => {
    if (isProductionApi) {
      // In production API save managers list
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('mgm_manager_accounts', JSON.stringify(managers));
    }
    return managers;
  }
};
