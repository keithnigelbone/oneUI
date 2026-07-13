'use client';

/**
 * Toaster.tsx
 *
 * App-level toast stack built on Base UI Toast (`@base-ui/react/toast`) — the
 * OneUI design system has no Toast component yet. Token-styled so toasts adapt
 * to the active brand + theme. Mount `<ToastProvider>` once near the app root;
 * it renders the viewport and exposes the Base UI toast manager to children
 * (e.g. `InviteToasts`) via `Toast.useToastManager()`.
 *
 * Invite toasts carry a `token` and a `kind`: `'invite'` (per-brand, accepted
 * via `brandMembers.acceptInvite`) or `'platform-invite'` (global tier, accepted
 * via `users.acceptPlatformInvite`). Both render an Accept action.
 */

import React from 'react';
import { Toast } from '@base-ui/react/toast';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/icons/Icon';
import s from './Toaster.module.css';

export type InviteToastData =
  | { kind: 'invite'; token: string }
  | { kind: 'platform-invite'; token: string };

function isInviteData(data: unknown): data is InviteToastData {
  if (!data || typeof data !== 'object') return false;
  const kind = (data as InviteToastData).kind;
  return kind === 'invite' || kind === 'platform-invite';
}

function InviteAcceptButton({ invite }: { invite: InviteToastData }) {
  const acceptBrandInvite = useMutation(api.brandMembers.acceptInvite);
  const acceptPlatformInvite = useMutation(api.users.acceptPlatformInvite);
  const [busy, setBusy] = React.useState(false);

  const handleAccept = React.useCallback(async () => {
    setBusy(true);
    try {
      // On success the live `listMy*Invites` query drops this invite, and
      // `InviteToasts` closes the toast — so we leave `busy` set until unmount.
      if (invite.kind === 'platform-invite') {
        await acceptPlatformInvite({ token: invite.token });
      } else {
        await acceptBrandInvite({ token: invite.token });
      }
    } catch {
      setBusy(false);
    }
  }, [invite, acceptBrandInvite, acceptPlatformInvite]);

  return (
    <Button
      className={s.action}
      attention="high"
      size="small"
      onPress={handleAccept}
      disabled={busy}
    >
      {busy ? 'Accepting…' : 'Accept'}
    </Button>
  );
}

function ToastList(): React.ReactElement {
  const { toasts } = Toast.useToastManager();
  return (
    <>
      {toasts.map((toast) => {
        const invite = isInviteData(toast.data) ? toast.data : null;
        return (
          <Toast.Root key={toast.id} toast={toast} className={s.toast}>
            <span className={s.icon} aria-hidden="true">
              <Icon name="mail" />
            </span>
            <div className={s.body}>
              {toast.title && <Toast.Title className={s.title}>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description className={s.description}>
                  {toast.description}
                </Toast.Description>
              )}
            </div>
            {invite && <InviteAcceptButton invite={invite} />}
            <Toast.Close className={s.close} aria-label="Dismiss">
              <Icon name="close" />
            </Toast.Close>
          </Toast.Root>
        );
      })}
    </>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <Toast.Provider>
      {children}
      <Toast.Portal>
        <Toast.Viewport className={s.viewport}>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
