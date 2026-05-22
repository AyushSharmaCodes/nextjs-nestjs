'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminShell({
  children,
  title,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 w-full bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden p-6"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
