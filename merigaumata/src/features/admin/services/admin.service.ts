import { ManagerAccount } from '../types/admin.types';
import { apiInstance } from '@/shared/lib/api/axios';

export const adminService = {
  getManagersList: async (): Promise<ManagerAccount[]> => {
    const response = await apiInstance.get('/managers');
    return response.data?.data || [];
  },

  saveManagersList: async (managers: ManagerAccount[]): Promise<ManagerAccount[]> => {
    return managers;
  }
};
