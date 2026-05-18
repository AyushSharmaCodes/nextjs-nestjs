import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={clsx(
          'peer h-4 w-4 shrink-0 rounded border border-stone-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-stone-900 data-[state=checked]:text-white dark:border-stone-850 dark:data-[state=checked]:bg-stone-50 dark:data-[state=checked]:text-stone-900 flex items-center justify-center cursor-pointer select-none transition-all shadow-sm',
          checked && 'bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900 border-transparent',
          className
        )}
      >
        {checked && <Check className="h-3 w-3 stroke-[3]" />}
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          className="sr-only"
          readOnly
          {...props}
        />
      </button>
    );
  }
);

Checkbox.displayName = 'Checkbox';
