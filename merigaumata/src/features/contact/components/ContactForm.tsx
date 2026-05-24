'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { contactFormSchema, ContactFormInputs } from '../schemas/contact.schema';
import { useSubmitContactForm } from '../hooks/use-contact';
import { logError } from '@/shared/lib/errors';

export function ContactForm() {
  const t = useTranslations('contact');
  const { mutateAsync: submitForm } = useSubmitContactForm();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const messageValue = watch('message') || '';
  const wordCount = messageValue.trim() ? messageValue.trim().split(/\s+/).length : 0;

  const onSubmit = async (data: ContactFormInputs) => {
    try {
      await submitForm(data);
      alert(t('form.successAlert'));
      reset();
    } catch (error: unknown) {
      logError(error, { component: 'ContactForm', action: 'submit' });
    }
  };

  /**
   * Safely unpacks standard or parameterized (JSON-formatted) translation key schemas.
   */
  const renderErrorMessage = (fieldError?: { message?: string }) => {
    if (!fieldError?.message) return null;

    let displayMessage = '';
    try {
      const parsed = JSON.parse(fieldError.message);
      if (parsed && typeof parsed === 'object' && 'key' in parsed) {
        displayMessage = t(parsed.key, parsed.values);
      }
    } catch {
      displayMessage = t(fieldError.message as any); // ts-audit-ignore
    }

    return (
      <p className="text-red-500 text-xs mt-1.5 font-medium transition-all duration-200">
        {displayMessage || t(fieldError.message as any)} // ts-audit-ignore
      </p>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none p-8 md:p-12 lg:p-16 lg:pl-[40%] w-full lg:w-[95%] ml-auto border border-neutral-100 dark:border-neutral-800 -mt-8 lg:mt-0 relative z-0 order-2 lg:order-none">
      <div className="mb-10 lg:pl-4">
        <h2 className="text-3xl font-bold text-tertiary-900 dark:text-white mb-2">{t('form.title')}</h2>
        <p className="text-neutral-500 dark:text-neutral-400">{t('form.subtitle')}</p>
      </div>
      
      <form className="space-y-4 lg:pl-4 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input 
            type="text" 
            {...register('name')}
            className={`w-full px-5 py-4 rounded-xl bg-neutral-50 dark:bg-[#121212] border ${errors.name ? 'border-red-500' : 'border-transparent focus:border-neutral-200 dark:focus:border-neutral-800'} focus:outline-none focus:ring-0 transition-colors text-tertiary-900 dark:text-white placeholder:text-neutral-400 text-sm font-medium`} 
            placeholder={t('form.namePlaceholder')} 
          />
          {renderErrorMessage(errors.name)}
        </div>
        
        <div>
          <input 
            type="email" 
            {...register('email')}
            className={`w-full px-5 py-4 rounded-xl bg-neutral-50 dark:bg-[#121212] border ${errors.email ? 'border-red-500' : 'border-transparent focus:border-neutral-200 dark:focus:border-neutral-800'} focus:outline-none focus:ring-0 transition-colors text-tertiary-900 dark:text-white placeholder:text-neutral-400 text-sm font-medium`} 
            placeholder={t('form.emailPlaceholder')} 
          />
          {renderErrorMessage(errors.email)}
        </div>
        
        <div>
          <input 
            type="tel" 
            {...register('phone')}
            className={`w-full px-5 py-4 rounded-xl bg-neutral-50 dark:bg-[#121212] border ${errors.phone ? 'border-red-500' : 'border-transparent focus:border-neutral-200 dark:focus:border-neutral-800'} focus:outline-none focus:ring-0 transition-colors text-tertiary-900 dark:text-white placeholder:text-neutral-400 text-sm font-medium`} 
            placeholder={t('form.phonePlaceholder')} 
          />
          {renderErrorMessage(errors.phone)}
        </div>
        
        <div>
          <input 
            type="text" 
            {...register('subject')}
            className={`w-full px-5 py-4 rounded-xl bg-neutral-50 dark:bg-[#121212] border ${errors.subject ? 'border-red-500' : 'border-transparent focus:border-neutral-200 dark:focus:border-neutral-800'} focus:outline-none focus:ring-0 transition-colors text-tertiary-900 dark:text-white placeholder:text-neutral-400 text-sm font-medium`} 
            placeholder={t('form.subjectPlaceholder')} 
          />
          {renderErrorMessage(errors.subject)}
        </div>
        
        <div className="mt-2">
          <textarea 
            rows={4} 
            {...register('message')}
            className={`w-full px-5 py-4 rounded-xl bg-neutral-50 dark:bg-[#121212] border ${errors.message ? 'border-red-500' : 'border-transparent focus:border-neutral-200 dark:focus:border-neutral-800'} focus:outline-none focus:ring-0 transition-colors text-tertiary-900 dark:text-white resize-none placeholder:text-neutral-400 text-sm font-medium`} 
            placeholder={t('form.messagePlaceholder')}
          ></textarea>
          {renderErrorMessage(errors.message)}
          <p className="text-neutral-400 text-xs mt-2 font-medium tracking-wide w-full flex justify-end">
            {t('form.wordCount', { count: wordCount })}
          </p>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-10 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl font-bold transition-all shadow-md mt-4 self-start tracking-widest text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? '...' : t('form.submit')}
        </button>
      </form>
    </div>
  );
}
