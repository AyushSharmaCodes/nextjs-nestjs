import { env } from '@/core/env/client';
import { contactApi } from '../api/contact.api';
import { MOCK_CONTACT_FAQS, MOCK_FAQS } from '../mocks/contact.mocks';
import { FAQ } from '../types/contact.types';
import { ContactFormInputs } from '../schemas/contact.schema';
import { ApiResponse } from '@/shared/lib/api/response';
import { delay } from '@/lib/utils';
import { logger } from '@/shared/lib/logger';

const isProductionApi = !!env.NEXT_PUBLIC_API_URL;

export const contactService = {
  getContactFaqs: async (): Promise<FAQ[]> => {
    if (isProductionApi) {
      try {
        return await contactApi.getContactFaqs();
      } catch (error: unknown) {
        logger.warn('Axios call failed for contact FAQs. Falling back to mocks: {error}', {
          error: error instanceof Error ? error.message : String(error),
        });
        return MOCK_CONTACT_FAQS;
      }
    }
    return MOCK_CONTACT_FAQS;
  },

  getGeneralFaqs: async (): Promise<FAQ[]> => {
    if (isProductionApi) {
      try {
        return await contactApi.getGeneralFaqs();
      } catch (error: unknown) {
        logger.warn('Axios call failed for general FAQs. Falling back to mocks: {error}', {
          error: error instanceof Error ? error.message : String(error),
        });
        return MOCK_FAQS;
      }
    }
    return MOCK_FAQS;
  },

  submitContactForm: async (input: ContactFormInputs): Promise<ApiResponse<{ success: boolean }>> => {
    if (isProductionApi) {
      try {
        return await contactApi.submitContactForm(input);
      } catch (error: unknown) {
        logger.warn('Axios call failed for submitting contact form. Falling back to mock simulation: {error}', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Mock network lag and resolve successfully
    await delay(800);
    return {
      success: true,
      data: { success: true },
      message: 'Mock form submitted successfully!'
    };
  }
};
