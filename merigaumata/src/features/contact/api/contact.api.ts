import { apiInstance } from '@/shared/lib/api/axios';
import { ApiResponse } from '@/shared/lib/api/response';
import { ContactFormInputs } from '../schemas/contact.schema';
import { FAQ } from '../types/contact.types';

export const contactApi = {
  getContactFaqs: async (): Promise<FAQ[]> => {
    const response = await apiInstance.get<FAQ[]>('/faqs/contact');
    return response.data;
  },

  getGeneralFaqs: async (): Promise<FAQ[]> => {
    const response = await apiInstance.get<FAQ[]>('/faqs/general');
    return response.data;
  },

  submitContactForm: async (input: ContactFormInputs): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiInstance.post<ApiResponse<{ success: boolean }>>('/contact/submit', input);
    return response.data;
  }
};
