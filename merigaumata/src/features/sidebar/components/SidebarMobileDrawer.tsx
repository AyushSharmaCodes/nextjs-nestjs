"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { cn } from '@/lib/utils';

interface SidebarMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SidebarMobileDrawer({ isOpen, onClose, children }: SidebarMobileDrawerProps) {
  // Prevent scrolling when drawer is open
  useEffect(() => {
    const element = document.body;
    if (isOpen) {
      disableBodyScroll(element, { reserveScrollBarGap: true });
    } else {
      enableBodyScroll(element);
    }
    return () => {
      clearAllBodyScrollLocks();
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-earth-950/40 backdrop-blur-xs z-40 md:hidden cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-[270px] bg-card border-r border-earth-200/50 dark:border-transparent shadow-2xl md:hidden h-full flex flex-col outline-none"
            )}
            role="dialog"
            aria-modal="true"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
