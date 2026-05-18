import { Variants } from 'motion/react';

export const springTransition = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 28,
};

export const transitionFast = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.15,
};

export const sidebarVariants: Variants = {
  expanded: { 
    width: 256,
    transition: springTransition,
  },
  collapsed: { 
    width: 64,
    transition: springTransition,
  },
};

export const textVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    display: 'block',
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay: 0.05 
    },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transitionEnd: { display: 'none' },
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

export const brandTextVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    display: 'flex',
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay: 0.05 
    },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transitionEnd: { display: 'none' },
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

export const chevronVariants: Variants = {
  collapsedChevron: { rotate: 0 },
  expandedChevron: { rotate: 180 },
};

export const submenuVariants: Variants = {
  collapsedSubmenu: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
  expandedSubmenu: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
};

export const staggeredContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const staggeredItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: springTransition },
};
