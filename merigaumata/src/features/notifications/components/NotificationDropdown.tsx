import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Trash2, CheckCheck, Loader2 } from 'lucide-react';
import {
  useNotificationsQuery,
  useMarkNotificationsReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationsMutation,
  useNotificationSSE,
} from '../hooks/useNotifications';
import { NotificationAvatar, NotificationBadge } from './NotificationPrimitives';
import { NotificationItemSkeleton } from './NotificationSkeleton';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
  const t = useTranslations('notifications');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to live SSE server notification stream automatically
  useNotificationSSE();

  // Fetch unread notifications for display inside popover
  const { data, isLoading } = useNotificationsQuery({
    page: 1,
    limit: 5,
    status: 'all',
  });

  const markReadMutation = useMarkNotificationsReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const deleteMutation = useDeleteNotificationsMutation();

  const notifications = data?.data || [];
  const stats = data?.stats;
  const unreadCount = stats?.unread || 0;

  // Toggle dropdown state
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Close when clicking outside of the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} onKeyDown={handleKeyDown}>
      {/* Dynamic Bell Icon Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2.5 rounded-[12px] bg-earth-50 dark:bg-earth-900 border border-earth-200/50 dark:border-earth-800/80 hover:bg-earth-100 dark:hover:bg-earth-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 active:scale-95"
        aria-label="Notification Center"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5 text-foreground/70 dark:text-foreground/60" />
        
        {/* Dynamic Badge Pulse Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white border-2 border-white dark:border-earth-950 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-[420px] origin-top-right rounded-[20px] bg-card border border-earth-200/60 dark:border-earth-800/80 shadow-xl shadow-earth-200/30 dark:shadow-none z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-earth-100 dark:border-earth-800/80 bg-earth-50/50 dark:bg-earth-900/30">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  {t('title')}
                </h3>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-0.5 inline-block">
                  {unreadCount} {t('unread')}
                </span>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 active:scale-95 disabled:opacity-50 transition-all duration-150"
                >
                  {markAllReadMutation.isPending ? (
                     <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  {t('markAsRead')}
                </button>
              )}
            </div>

            {/* List Body */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-earth-100 dark:divide-earth-800/60 scrollbar-thin">
              {isLoading ? (
                <>
                  <NotificationItemSkeleton />
                  <NotificationItemSkeleton />
                  <NotificationItemSkeleton />
                </>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="text-foreground/45 text-xs">
                    {t('noNotifications')}
                  </span>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                >
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      className={`group relative flex items-start gap-3.5 p-4 transition-all duration-200 ${
                        n.status === 'unread'
                          ? 'bg-primary-50/20 dark:bg-primary-500/5'
                          : 'hover:bg-earth-50/50 dark:hover:bg-earth-900/30'
                      }`}
                    >
                      {/* Avatar Wrapper */}
                      <NotificationAvatar
                        type={n.type}
                        customerName={n.metadata?.customerName}
                        customerAvatar={n.metadata?.customerAvatar}
                      />

                      {/* Content details */}
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <NotificationBadge type={n.type} />
                          {n.status === 'unread' && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                          )}
                        </div>
                        
                        <h4
                          onClick={() => n.status === 'unread' && markReadMutation.mutate([n.id])}
                          className={`text-xs leading-normal cursor-pointer break-words transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                            n.status === 'unread'
                              ? 'font-bold text-foreground'
                              : 'font-medium text-foreground/60'
                          }`}
                        >
                          {n.title}
                        </h4>
                        
                        <p className="text-[10px] text-foreground/50 font-medium mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Action Triggers overlaying row right margins */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => deleteMutation.mutate([n.id])}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-[8px] bg-earth-50 dark:bg-earth-855 hover:bg-red-50 dark:hover:bg-red-950/30 text-foreground/45 hover:text-red-500 dark:hover:text-red-400 shadow-sm border border-earth-200/40 dark:border-earth-800 active:scale-90 disabled:opacity-50 transition-all duration-150"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer View Link */}
            <div className="border-t border-earth-100 dark:border-earth-800/80 bg-earth-50/50 dark:bg-earth-900/30 text-center">
              <Link
                href="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="block py-3.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline active:scale-95 transition-all duration-150"
              >
                {t('seeAll')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
