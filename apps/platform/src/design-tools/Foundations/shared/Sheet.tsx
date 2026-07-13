/**
 * Sheet.tsx
 *
 * Reusable right-anchored side sheet for brand-configuration editing — the
 * platform pattern that separates "demo" controls (in the page) from settings
 * that change the brand (here). Header + optional tab row + scrollable body +
 * sticky Discard/Save footer. Draft editing: callers commit on Save.
 *
 * Built on Base UI Dialog (never forked) so it inherits real dialog a11y for
 * free — focus trap, focus restore on close, body scroll-lock, and
 * `aria-modal`. The right-side placement + slide-in are pure CSS via Base UI's
 * `data-starting-style` / `data-ending-style` / `data-open` transition hooks
 * (no hand-rolled mount/rAF dance). No visible scrim: the page content shifts
 * to make room (push-drawer), matching the side-nav pattern.
 */

'use client';

import { type ReactNode } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import styles from './Sheet.module.css';

export interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Optional tab row rendered under the header. */
  tabs?: ReactNode;
  onDiscard?: () => void;
  onSave?: () => void;
  saveLabel?: string;
  discardLabel?: string;
  saveDisabled?: boolean;
}

export function Sheet({
  open,
  title,
  onClose,
  children,
  tabs,
  onDiscard,
  onSave,
  saveLabel = 'Save changes',
  discardLabel = 'Discard',
  saveDisabled = false,
}: SheetProps) {
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        // Base UI drives this for Escape, outside-press, and the Close button;
        // mirror it back to the caller's controlled `open` state.
        if (!nextOpen) onClose();
      }}
    >
      <BaseDialog.Portal>
        {/* No aria-label here — BaseDialog.Title wires aria-labelledby to the
            rendered heading, which is the more robust accessible name. */}
        <BaseDialog.Popup className={styles.sheet}>
          <header className={styles.header}>
            <BaseDialog.Title className={styles.title}>{title}</BaseDialog.Title>
            <BaseDialog.Close
              render={
                <IconButton
                  icon="close"
                  attention="low"
                  contained
                  size="s"
                  aria-label="Close"
                />
              }
            />
          </header>

          {tabs && <div className={styles.tabs}>{tabs}</div>}

          <div className={styles.body}>{children}</div>

          {(onSave || onDiscard) && (
            <footer className={styles.footer}>
              {onDiscard && (
                <Button attention="low" onPress={onDiscard}>{discardLabel}</Button>
              )}
              {onSave && (
                <Button attention="high" onPress={onSave} disabled={saveDisabled}>{saveLabel}</Button>
              )}
            </footer>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
