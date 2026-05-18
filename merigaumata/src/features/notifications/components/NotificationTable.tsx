import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Pen, Loader2, CheckSquare, Square, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Notification, PaginationMeta, NotificationStatus } from '../types';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationAvatar, NotificationBadge } from './NotificationPrimitives';
import { formatDistanceToNow } from 'date-fns';
import {
  useMarkNotificationsReadMutation,
  useDeleteNotificationsMutation,
} from '../hooks/useNotifications';

interface NotificationTableProps {
  notifications: Notification[];
  meta: PaginationMeta;
  stats: any;
}

export function NotificationTable({ notifications, meta, stats }: NotificationTableProps) {
  const t = useTranslations('notifications');
  const {
    selectedIds,
    filters,
    setSelectedIds,
    toggleSelectId,
    clearSelection,
    setPage,
    setLimit,
  } = useNotificationStore();

  const markReadMutation = useMarkNotificationsReadMutation();
  const deleteMutation = useDeleteNotificationsMutation();

  // Compute selection bounds
  const isAllSelected = useMemo(() => {
    if (notifications.length === 0) return false;
    return notifications.every((n) => selectedIds.includes(n.id));
  }, [notifications, selectedIds]);

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      // Uncheck all items on current page
      const currentIds = notifications.map((n) => n.id);
      setSelectedIds(selectedIds.filter((id) => !currentIds.includes(id)));
    } else {
      // Check all items on current page
      const currentIds = notifications.map((n) => n.id);
      const uniqueIds = Array.from(new Set([...selectedIds, ...currentIds]));
      setSelectedIds(uniqueIds);
    }
  };

  const handleBulkMarkRead = () => {
    if (selectedIds.length === 0) return;
    markReadMutation.mutate(selectedIds, {
      onSuccess: () => clearSelection(),
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    deleteMutation.mutate(selectedIds, {
      onSuccess: () => clearSelection(),
    });
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Bulk Action Bar Overlay when rows are checked */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between p-4 bg-primary-50/80 dark:bg-primary-950/40 border border-primary-200/50 dark:border-primary-900/40 rounded-[16px] shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
                {selectedIds.length} notifications selected
              </span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBulkMarkRead}
                disabled={markReadMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 border border-primary-200/60 dark:border-primary-900/40 active:scale-95 disabled:opacity-50 transition-all duration-150"
              >
                {markReadMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                {t('markAsRead')}
              </button>

              <button
                onClick={handleBulkDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200/40 dark:border-red-950/30 active:scale-95 disabled:opacity-50 transition-all duration-150"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {t('deleteSelected')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Container */}
      <div className="bg-card rounded-[20px] border border-earth-200/60 dark:border-transparent shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" role="grid" aria-colcount={5}>
            <thead>
              <tr className="border-b border-earth-100 dark:border-earth-900/30 bg-earth-50/50 dark:bg-earth-900/10">
                {/* Select All Checkbox Column */}
                <th className="py-4.5 px-5 w-12 text-center">
                  <button
                    onClick={handleSelectAllToggle}
                    className="focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-[6px] text-foreground/45 hover:text-primary-600 transition-colors"
                    aria-label="Select all notifications"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                    ) : (
                      <Square className="w-4.5 h-4.5" />
                    )}
                  </button>
                </th>
                <th className="py-4.5 px-4 text-xs font-extrabold text-foreground/45 tracking-wider">
                  {t('status')}
                </th>
                <th className="py-4.5 px-4 text-xs font-extrabold text-foreground/45 tracking-wider">
                  {t('notification')}
                </th>
                <th className="py-4.5 px-4 text-xs font-extrabold text-foreground/45 tracking-wider">
                  {t('date')}
                </th>
                <th className="py-4.5 px-5 w-24 text-right text-xs font-extrabold text-foreground/45 tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100 dark:divide-earth-900/30">
              {notifications.map((n) => {
                const isSelected = selectedIds.includes(n.id);
                return (
                  <tr
                    key={n.id}
                    className={`group hover:bg-earth-50/40 dark:hover:bg-earth-900/10 transition-colors duration-150 ${
                      isSelected ? 'bg-primary-50/10 dark:bg-primary-950/10' : ''
                    } ${n.status === 'unread' ? 'font-bold' : 'font-medium'}`}
                  >
                    {/* Row Checkbox Selection */}
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => toggleSelectId(n.id)}
                        className="focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-[6px] text-foreground/45 hover:text-primary-600 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                        ) : (
                          <Square className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-[8px] text-[10px] font-extrabold tracking-wide border uppercase ${
                          n.status === 'unread'
                            ? 'bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                            : n.status === 'read'
                            ? 'bg-earth-50 text-foreground/60 border-earth-200 dark:bg-earth-800/40 dark:text-foreground/60 dark:border-transparent'
                            : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}
                      >
                        {n.status === 'unread' ? t('unreadLabel') : t('readLabel')}
                      </span>
                    </td>

                    {/* Notification info row */}
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3.5 max-w-xl">
                        <NotificationAvatar
                           type={n.type}
                           customerName={n.metadata?.customerName}
                           customerAvatar={n.metadata?.customerAvatar}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <NotificationBadge type={n.type} />
                            {n.status === 'unread' && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                            )}
                          </div>
                          <h4 className="text-xs text-foreground leading-relaxed font-bold break-words pr-2">
                            {n.title}
                          </h4>
                          <p className="text-[11px] text-foreground/50 leading-normal font-medium mt-1 pr-4">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 text-xs font-semibold text-foreground/50 whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </td>

                    {/* Single actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                        {n.status === 'unread' && (
                          <button
                            onClick={() => markReadMutation.mutate([n.id])}
                            disabled={markReadMutation.isPending}
                            className="p-2 rounded-[8px] bg-earth-50 hover:bg-primary-50 dark:bg-earth-800/40 dark:hover:bg-primary-950/20 text-foreground/45 hover:text-primary-600 dark:hover:text-primary-400 border border-earth-200/20 dark:border-transparent shadow-sm active:scale-90 transition-all"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4.5 h-4.5" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteMutation.mutate([n.id])}
                          disabled={deleteMutation.isPending}
                          className="p-2 rounded-[8px] bg-earth-50 hover:bg-red-50 dark:bg-earth-800/40 dark:hover:bg-red-950/20 text-foreground/45 hover:text-red-500 dark:hover:text-red-400 border border-earth-200/20 dark:border-transparent shadow-sm active:scale-90 transition-all"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Paginated Blocks */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-earth-100 dark:border-earth-900/30 bg-earth-50/50 dark:bg-earth-900/10">
          {/* Checked stats counts */}
          <div className="text-[11px] font-extrabold text-foreground/45">
            {selectedIds.length} of {meta.totalCount} row(s) selected.
          </div>

          <div className="flex items-center gap-6.5 flex-wrap sm:flex-nowrap">
            {/* Rows Limit size picker */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-foreground/45 whitespace-nowrap">
                {t('rowsPerPage')}
              </span>
              <select
                value={filters.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-2 py-1.5 rounded-[8px] bg-earth-50 dark:bg-earth-950 border border-earth-200/50 dark:border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-xs font-bold outline-none cursor-pointer transition-all"
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Page number indicators and controllers */}
            <div className="flex items-center gap-4.5">
              <span className="text-[11px] font-extrabold text-foreground/45 whitespace-nowrap">
                {t('pageOf', { page: meta.page, total: meta.totalPages || 1 })}
              </span>

              <div className="flex items-center gap-1">
                {/* Chevrons left */}
                <button
                  onClick={() => setPage(1)}
                  disabled={meta.page <= 1}
                  className="p-1.5 rounded-[8px] bg-earth-50 dark:bg-earth-950 border border-earth-200/50 dark:border-transparent hover:bg-earth-100 dark:hover:bg-earth-900 hover:text-primary-600 disabled:opacity-40 disabled:hover:text-current active:scale-90 transition-all outline-none"
                >
                  <ChevronsLeft className="w-4.5 h-4.5" />
                </button>
                {/* Chevron single left */}
                <button
                  onClick={() => setPage(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="p-1.5 rounded-[8px] bg-earth-50 dark:bg-earth-950 border border-earth-200/50 dark:border-transparent hover:bg-earth-100 dark:hover:bg-earth-900 hover:text-primary-600 disabled:opacity-40 disabled:hover:text-current active:scale-90 transition-all outline-none"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                {/* Chevron single right */}
                <button
                  onClick={() => setPage(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="p-1.5 rounded-[8px] bg-earth-50 dark:bg-earth-950 border border-earth-200/50 dark:border-transparent hover:bg-earth-100 dark:hover:bg-earth-900 hover:text-primary-600 disabled:opacity-40 disabled:hover:text-current active:scale-90 transition-all outline-none"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
                {/* Chevrons right */}
                <button
                  onClick={() => setPage(meta.totalPages)}
                  disabled={meta.page >= meta.totalPages}
                  className="p-1.5 rounded-[8px] bg-earth-50 dark:bg-earth-950 border border-earth-200/50 dark:border-transparent hover:bg-earth-100 dark:hover:bg-earth-900 hover:text-primary-600 disabled:opacity-40 disabled:hover:text-current active:scale-90 transition-all outline-none"
                >
                  <ChevronsRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
