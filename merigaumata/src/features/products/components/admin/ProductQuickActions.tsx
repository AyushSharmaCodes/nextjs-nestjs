import React from 'react';
import { useTranslations } from 'next-intl';
import { Eye, Edit2, Copy, Archive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProductQuickActionsProps {
  onPreview: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  isDuplicating?: boolean;
  isArchiving?: boolean;
}

export function ProductQuickActions({
  onPreview,
  onEdit,
  onDuplicate,
  onArchive,
  isDuplicating = false,
  isArchiving = false,
}: ProductQuickActionsProps) {
  const t = useTranslations('products');

  return (
    <TooltipProvider delayDuration={150}>
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 px-3 z-20">
        <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-full shadow-lg border border-stone-200/50 dark:border-stone-800/50 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          
          {/* Quick Preview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onPreview();
                }}
                className="h-8 w-8 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs px-2 py-1 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900">
              {t('previewBtn')}
            </TooltipContent>
          </Tooltip>

          {/* Quick Edit */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-8 w-8 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs px-2 py-1 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900">
              {t('editBtn')}
            </TooltipContent>
          </Tooltip>

          {/* Quick Duplicate */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDuplicating}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="h-8 w-8 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                {isDuplicating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs px-2 py-1 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900">
              {t('duplicateBtn')}
            </TooltipContent>
          </Tooltip>

          {/* Quick Archive */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isArchiving}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onArchive();
                }}
                className="h-8 w-8 rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
              >
                {isArchiving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs px-2 py-1 bg-rose-900 text-rose-100 border-none">
              {t('archiveBtn')}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
