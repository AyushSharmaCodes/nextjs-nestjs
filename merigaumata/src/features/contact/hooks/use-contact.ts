import { useQuery, useMutation } from '@tanstack/react-query';
import { contactService } from '../services/contact.service';
import { ContactFormInputs } from '../schemas/contact.schema';

export const contactKeys = {
  all: ['contact'] as const,
  faqs: () => [...contactKeys.all, 'faqs'] as const,
  contactFaqs: () => [...contactKeys.faqs(), 'contact'] as const,
  generalFaqs: () => [...contactKeys.faqs(), 'general'] as const,
};

export function useContactFaqs() {
  return useQuery({
    queryKey: contactKeys.contactFaqs(),
    queryFn: () => contactService.getContactFaqs(),
    staleTime: 60000,
  });
}

export function useGeneralFaqs() {
  return useQuery({
    queryKey: contactKeys.generalFaqs(),
    queryFn: () => contactService.getGeneralFaqs(),
    staleTime: 60000,
  });
}

export function useSubmitContactForm() {
  return useMutation({
    mutationFn: (input: ContactFormInputs) => contactService.submitContactForm(input),
  });
}
