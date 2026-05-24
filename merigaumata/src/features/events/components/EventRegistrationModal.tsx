'use client';

import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Event } from '../types/events.types';
import { eventRegistrationSchema, EventRegistrationSchema } from '../schemas/events.schema';
import { useRegisterEventMutation } from '../hooks/use-events';
import { AppIcon, StatusIcon } from '@/shared/icons';
import Image from 'next/image';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface EventRegistrationModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function EventRegistrationModal({ event, isOpen, onClose }: EventRegistrationModalProps) {
  const t = useTranslations('events');
  const registerMutation = useRegisterEventMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EventRegistrationSchema>({
    resolver: zodResolver(eventRegistrationSchema) as Resolver<EventRegistrationSchema>,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      slots: 1
    }
  });

  if (!isOpen) return null;

  const dateStr = event.startDate ? format(new Date(event.startDate), 'EEE, d MMMM yyyy') : '';
  const timeStr = event.startTime || '';

  const onSubmit = (data: EventRegistrationSchema) => {
    registerMutation.mutate(
      { eventId: event.id, input: data },
      {
        onSuccess: () => {
          setTimeout(() => {
            reset();
            onClose();
            registerMutation.reset();
          }, 2000);
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 flex items-center justify-center">
      <div 
        className="min-h-full w-full flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-stone-200 dark:border-stone-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button (Mobile Absolute) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden z-10 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white"
          >
            <AppIcon name="close" size="sm" />
          </button>

          {/* Left Side: Form or Success State (White background) */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col relative justify-center">
            {registerMutation.isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-12 animate-in zoom-in duration-300">
                <StatusIcon status="success" size="xl" className="text-emerald-500 mb-6 animate-bounce" showBackground={false} />
                <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-3">{t('bookingConfirmed')}</h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm mb-2">{t('thankYouRegistering')}</p>
                <div className="bg-stone-50 dark:bg-neutral-800 px-6 py-3 rounded-2xl border border-stone-100 dark:border-stone-700 mt-4 text-xs font-mono font-bold tracking-wider text-stone-600 dark:text-stone-300">
                  {t('bookingId')}: {registerMutation.data?.bookingId}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-2">{t('bookSpot')}</h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm">{t('formDesc')}</p>
                </div>

                <form className="flex flex-col gap-5 flex-grow" onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1.5 w-1/2">
                      <label className="text-sm font-bold text-stone-700 dark:text-stone-300">{t('firstName')} <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        {...register('firstName')}
                        className={`bg-stone-50 dark:bg-neutral-800 border ${errors.firstName ? 'border-red-500 focus:ring-red-500/20' : 'border-stone-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-orange-500/20'} px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all text-sm text-stone-900 dark:text-white`}
                        placeholder={t('firstName')}
                      />
                      {errors.firstName && (
                        <span className="text-xs text-red-500 font-semibold">{t(errors.firstName.message as Parameters<typeof t>[0])}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 w-1/2">
                      <label className="text-sm font-bold text-stone-700 dark:text-stone-300">{t('lastName')} <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        {...register('lastName')}
                        className={`bg-stone-50 dark:bg-neutral-800 border ${errors.lastName ? 'border-red-500 focus:ring-red-500/20' : 'border-stone-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-orange-500/20'} px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all text-sm text-stone-900 dark:text-white`}
                        placeholder={t('lastName')}
                      />
                      {errors.lastName && (
                        <span className="text-xs text-red-500 font-semibold">{t(errors.lastName.message as Parameters<typeof t>[0])}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300">{t('email')} <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      {...register('email')}
                      className={`bg-stone-50 dark:bg-neutral-800 border ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-stone-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-orange-500/20'} px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all text-sm text-stone-900 dark:text-white`}
                      placeholder={t('email')}
                    />
                    {errors.email && (
                      <span className="text-xs text-red-500 font-semibold">{t(errors.email.message as Parameters<typeof t>[0])}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300">{t('phone')} <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      {...register('phone')}
                      className={`bg-stone-50 dark:bg-neutral-800 border ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-stone-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-orange-500/20'} px-4 py-3 rounded-xl outline-none focus:ring-2 transition-all text-sm text-stone-900 dark:text-white`}
                      placeholder={t('phone')}
                    />
                    {errors.phone && (
                      <span className="text-xs text-red-500 font-semibold">{t(errors.phone.message as Parameters<typeof t>[0])}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300">{t('slots')} <span className="text-red-500">*</span></label>
                    <select 
                      {...register('slots')}
                      className="bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 px-4 py-3 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm cursor-pointer text-stone-900 dark:text-white"
                      defaultValue="1"
                    >
                      {Array.from({ length: Math.min(5, event.slotsAvailable || 5) }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i + 1 === 1 ? t('slotSingle') : t('slotMultiple')}
                        </option>
                      ))}
                    </select>
                    {errors.slots && (
                      <span className="text-xs text-red-500 font-semibold">{t(errors.slots.message as Parameters<typeof t>[0])}</span>
                    )}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <button 
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="group flex items-center gap-2 bg-orange-700 hover:bg-orange-850 text-white font-bold py-3.5 px-8 rounded-full transition-all duration-300 active:scale-95 shadow-md disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <AppIcon name="loading" size="sm" className="animate-spin" />
                          <span>{t('processing')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('confirmBooking')}</span>
                          <AppIcon name="arrowRight" size="sm" className="transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                        </>
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={onClose}
                      className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 text-sm font-medium transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Right Side: Event Info (Dark green/brown combo) */}
          <div className="w-full md:w-1/2 flex flex-col border-t md:border-t-0 md:border-l border-stone-100 dark:border-neutral-800">
            {/* Top Half: Image */}
            <div className="h-48 md:h-1/2 w-full relative">
              <Image 
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
              {/* Desktop Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 hidden md:flex w-8 h-8 bg-black/40 backdrop-blur-md border border-white/30 rounded-full items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <AppIcon name="close" size="sm" />
              </button>
            </div>
            
            {/* Bottom Half: Details in brand colors (Beige) */}
            <div className="h-auto md:h-1/2 w-full bg-[#FAF6F0] dark:bg-neutral-850 p-8 sm:p-12 text-stone-900 dark:text-stone-100 flex flex-col justify-center">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-4 leading-tight">
                {event.title}
              </h3>
              
              <p className="text-stone-600 dark:text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {event.description}
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                  <AppIcon name="events" size="sm" className="text-orange-750" />
                  <span>{dateStr}</span>
                </div>
                {timeStr && (
                  <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                    <AppIcon name="clock" size="sm" className="text-orange-750" />
                    <span>{timeStr} {event.endTime ? `- ${event.endTime}` : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                  <AppIcon name="mapPin" size="sm" className="text-orange-750 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                  <AppIcon name="tag" size="sm" className="text-orange-750 flex-shrink-0" />
                  <span>{event.price ? `₹${event.price.toFixed(2)}` : t('complimentary')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
