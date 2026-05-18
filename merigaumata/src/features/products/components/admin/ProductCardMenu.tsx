"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { MoreVertical, Eye, Edit2, Copy, Archive, Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ProductCardMenuProps {
  onPreview: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isDuplicating?: boolean;
  isArchiving?: boolean;
  isDeleting?: boolean;
}

export function ProductCardMenu({
  onPreview,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  isDuplicating = false,
  isArchiving = false,
  isDeleting = false,
}: ProductCardMenuProps) {
  const t = useTranslations('products');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="h-8 w-8 rounded-full text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-label="Product actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 z-30">
        
        {/* Preview */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="flex items-center gap-2 text-stone-700 dark:text-stone-300 focus:bg-stone-50 dark:focus:bg-stone-800"
        >
          <Eye className="h-4 w-4" />
          <span>{t('previewBtn')}</span>
        </DropdownMenuItem>

        {/* Edit */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center gap-2 text-stone-700 dark:text-stone-300 focus:bg-stone-50 dark:focus:bg-stone-800"
        >
          <Edit2 className="h-4 w-4" />
          <span>{t('editBtn')}</span>
        </DropdownMenuItem>

        {/* Clone */}
        <DropdownMenuItem
          disabled={isDuplicating}
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="flex items-center gap-2 text-stone-700 dark:text-stone-300 focus:bg-stone-50 dark:focus:bg-stone-800"
        >
          {isDuplicating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{t('duplicateBtn')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-stone-100 dark:bg-stone-800" />

        {/* Archive */}
        <DropdownMenuItem
          disabled={isArchiving}
          onClick={(e) => {
            e.stopPropagation();
            onArchive();
          }}
          className="flex items-center gap-2 text-amber-600 focus:text-amber-700 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/20"
        >
          {isArchiving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          <span>{t('archiveBtn')}</span>
        </DropdownMenuItem>

        {/* Delete */}
        <DropdownMenuItem
          disabled={isDeleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center gap-2 text-rose-600 focus:text-rose-700 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/20"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash className="h-4 w-4" />
          )}
          <span>{t('deleteBtn')}</span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
