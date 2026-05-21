import { cva } from 'class-variance-authority';

export const iconVariants = cva(
  'shrink-0 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'text-current',
        primary: 'text-primary-600 dark:text-primary-400',
        secondary: 'text-[#1B8057] dark:text-emerald-450',
        muted: 'text-neutral-400 dark:text-neutral-500',
        destructive: 'text-red-600 dark:text-red-450',
        success: 'text-emerald-600 dark:text-emerald-400',
        warning: 'text-amber-600 dark:text-amber-500',
        info: 'text-blue-600 dark:text-blue-400',
        brand: 'text-[#DE7A41] dark:text-amber-500',
      },
      size: {
        xs: 'h-3.5 w-3.5',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);
export type IconVariantsProps = {
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'destructive' | 'success' | 'warning' | 'info' | 'brand';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
};
