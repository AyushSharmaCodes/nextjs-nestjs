import { toast as sonnerToast } from 'sonner';

type ToastOptions = {
  description?: string;
  duration?: number;
  id?: string | number;
};

/**
 * Centralised toast utility — wraps Sonner with consistent app defaults.
 * Import this everywhere instead of importing directly from 'sonner'.
 *
 * @example
 * import { toast } from '@/shared/lib/toast';
 * toast.success('Signed in', { description: 'Welcome back!' });
 * toast.error('Something went wrong');
 * toast.promise(apiCall(), { loading: 'Saving…', success: 'Saved!', error: 'Failed' });
 */
export const toast = {
  success(title: string, opts?: ToastOptions) {
    return sonnerToast.success(title, {
      description: opts?.description,
      duration: opts?.duration ?? 4000,
      id: opts?.id,
    });
  },

  error(title: string, opts?: ToastOptions) {
    return sonnerToast.error(title, {
      description: opts?.description,
      duration: opts?.duration ?? 5000, // errors stay a bit longer
      id: opts?.id,
    });
  },

  warning(title: string, opts?: ToastOptions) {
    return sonnerToast.warning(title, {
      description: opts?.description,
      duration: opts?.duration ?? 4500,
      id: opts?.id,
    });
  },

  info(title: string, opts?: ToastOptions) {
    return sonnerToast.info(title, {
      description: opts?.description,
      duration: opts?.duration ?? 4000,
      id: opts?.id,
    });
  },

  loading(title: string, opts?: Omit<ToastOptions, 'duration'>) {
    return sonnerToast.loading(title, {
      description: opts?.description,
      id: opts?.id,
    });
  },

  /**
   * Dismiss a specific toast by ID, or all toasts if no ID is provided.
   */
  dismiss(id?: string | number) {
    return sonnerToast.dismiss(id);
  },

  /**
   * Promise-based toast — shows loading, then resolves to success or error.
   * @example
   * toast.promise(saveOrder(data), {
   *   loading: 'Saving order…',
   *   success: 'Order saved!',
   *   error: (err) => err.message,
   * });
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
      description?: string;
    }
  ) {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      description: messages.description,
    });
  },
};
