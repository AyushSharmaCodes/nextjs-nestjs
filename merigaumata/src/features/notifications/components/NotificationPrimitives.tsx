import React from 'react';
import { useTranslations } from 'next-intl';
import { BellOff, ShoppingBag, Terminal, CreditCard, Truck } from 'lucide-react';
import { NotificationType } from '../types';

// Type Classification Badge Primitive
interface NotificationBadgeProps {
  type: NotificationType;
}

export function NotificationBadge({ type }: NotificationBadgeProps) {
  const t = useTranslations('notifications');
  
  const config = {
    order: {
      text: t('typeOrder'),
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      icon: ShoppingBag,
    },
    system: {
      text: t('typeSystem'),
      className: 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      icon: Terminal,
    },
    payment: {
      text: t('typePayment'),
      className: 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
      icon: CreditCard,
    },
    delivery: {
      text: t('typeDelivery'),
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
      icon: Truck,
    },
  };

  const current = config[type] || config.system;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-xs font-semibold border ${current.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {current.text}
    </span>
  );
}

// User/Process Dynamic Avatar Primitive
interface NotificationAvatarProps {
  type: NotificationType;
  customerName?: string;
  customerAvatar?: string;
}

export function NotificationAvatar({ type, customerName, customerAvatar }: NotificationAvatarProps) {
  if (customerAvatar) {
    return (
      <div className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border border-earth-200/60 dark:border-earth-800/60">
        <img
          src={customerAvatar}
          alt={customerName || 'Customer'}
          className="object-cover w-full h-full"
          onError={(e) => {
            // fallback if avatar image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Generate fallback name initials
  const initials = customerName
    ? customerName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SYS';

  const typeColorMap = {
    order: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    system: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    payment: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    delivery: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  };

  const fallbackClass = typeColorMap[type] || typeColorMap.system;

  return (
    <div className={`flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-full text-xs font-bold ${fallbackClass} border border-current/10`}>
      {initials}
    </div>
  );
}

// Empty Notification Inbox State UI
export function NotificationEmptyState() {
  const t = useTranslations('notifications');

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-earth-200/60 dark:border-earth-800/60 rounded-[20px] shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-earth-50 dark:bg-earth-800/50 mb-4 border border-earth-200/60 dark:border-earth-800/60">
        <BellOff className="w-6 h-6 text-foreground/45" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">
        {t('noNotifications')}
      </h3>
      <p className="text-xs text-foreground/60 max-w-xs">
        Everything is clean and up to date. You will see alerts here when new events occur.
      </p>
    </div>
  );
}
