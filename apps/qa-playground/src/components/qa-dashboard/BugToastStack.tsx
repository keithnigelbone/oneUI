import { Surface } from '@oneui/ui/components/Surface';
import { IconButton } from '@oneui/ui/components/IconButton';
import type { BugToast } from '@/hooks/useBugToasts';
import styles from '@/styles/qa-dashboard.module.css';

export function BugToastStack({
  toasts,
  onDismiss,
}: {
  toasts: BugToast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastStack} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <Surface
          key={toast.id}
          mode="subtle"
          appearance={toast.variant === 'success' ? 'positive' : 'negative'}
          className={styles.toastCard}
        >
          <div className={styles.toastContent}>
            <p className={styles.toastTitle}>{toast.title}</p>
            {toast.description ? <p className={styles.toastDescription}>{toast.description}</p> : null}
          </div>
          <IconButton
            icon="close"
            appearance="neutral"
            attention="low"
            size="s"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
          />
        </Surface>
      ))}
    </div>
  );
}
