import { useCallback, useState } from 'react';

export type BugToast = {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error';
};

export function useBugToasts() {
  const [toasts, setToasts] = useState<BugToast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((toast: Omit<BugToast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => dismiss(id), 5000);
    return id;
  }, [dismiss]);

  const success = useCallback(
    (title: string, description?: string) => push({ title, description, variant: 'success' }),
    [push],
  );

  const error = useCallback(
    (title: string, description?: string) => push({ title, description, variant: 'error' }),
    [push],
  );

  return { toasts, dismiss, success, error };
}
