'use client';

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import ScrollProgress from '@/shared/components/ScrollProgress';

export default function StorefrontTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Smooth reset scroll position to top instantly on navigation transitions
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Premium Multi-Color Brand Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Buttery Page Slide-Up, Fade-In, and Micro-Blur Transition */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col flex-1"
      >
        {children}
      </motion.div>
    </div>
  );
}
