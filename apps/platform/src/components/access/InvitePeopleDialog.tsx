'use client';

/**
 * InvitePeopleDialog.tsx
 *
 * GitHub/Linear-style "Invite people" overlay. A DS `Modal` (Base UI Dialog,
 * token-styled) with an email Input + role Select + Send action. Owns its own
 * form/busy/error state; delegates the actual write to `onInvite`. Closes on
 * success — the new pending invite then appears in the live members list.
 *
 * Generic over the role value so it serves both per-brand invites (viewer /
 * editor / admin — the defaults) and platform invites (member / creator /
 * owner). Pass `roleOptions` + `defaultRole` to switch role sets, and
 * `title` / `description` / `submitLabel` to tailor the copy.
 */

import React, { useCallback, useState } from 'react';
import { Modal } from '@oneui/ui/components/Modal';
import { Input } from '@oneui/ui/components/Input';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import { Button } from '@oneui/ui/components/Button';
import s from './AccessPanel.module.css';

export type InviteRoleValue = 'admin' | 'editor' | 'viewer';

const ROLE_OPTIONS: SelectOption<InviteRoleValue>[] = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
];

export interface InvitePeopleDialogProps<Role extends string = InviteRoleValue> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Woven into the default brand-invite copy; ignored when `description` is set. */
  brandName?: string;
  /** Performs the invite; throws on failure (message is surfaced inline). */
  onInvite: (email: string, role: Role) => Promise<void>;
  /** Role choices. Defaults to the per-brand viewer/editor/admin set. */
  roleOptions?: SelectOption<Role>[];
  /** Initially-selected role. Defaults to `'viewer'`. */
  defaultRole?: Role;
  /** Modal heading. Defaults to `'Invite people'`. */
  title?: string;
  /** Modal subtext. Defaults to brand-invite copy built from `brandName`. */
  description?: string;
  /** Primary action label. Defaults to `'Invite'`. */
  submitLabel?: string;
}

export function InvitePeopleDialog<Role extends string = InviteRoleValue>({
  open,
  onOpenChange,
  brandName,
  onInvite,
  roleOptions = ROLE_OPTIONS as unknown as SelectOption<Role>[],
  defaultRole = 'viewer' as Role,
  title = 'Invite people',
  description,
  submitLabel = 'Invite',
}: InvitePeopleDialogProps<Role>): React.ReactElement {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(defaultRole);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setEmail('');
    setRole(defaultRole);
    setError(null);
    setBusy(false);
  }, [defaultRole]);

  const handleSend = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      await onInvite(trimmed, role);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite');
      setBusy(false);
    }
  }, [email, role, onInvite, onOpenChange, reset]);

  const resolvedDescription =
    description ??
    (brandName
      ? `Invite a teammate to ${brandName}. They'll see the invitation when they sign in with this email address.`
      : "Invite a teammate. They'll see the invitation when they sign in with this email address.");

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      size="S"
      title={title}
      description={resolvedDescription}
      footerEnd={
        <>
          <Button attention="low" size="s" onPress={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            attention="high"
            size="s"
            onPress={handleSend}
            disabled={!email.trim() || busy}
          >
            {busy ? 'Inviting…' : submitLabel}
          </Button>
        </>
      }
    >
      <div className={s.dialogForm}>
        <div className={s.field}>
          <span className={s.fieldLabel}>Email</span>
          <Input
            aria-label="Invite email"
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={setEmail}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
        </div>
        <div className={s.field}>
          <span className={s.fieldLabel}>Role</span>
          <Select
            value={role}
            onChange={setRole}
            options={roleOptions}
            size="md"
            aria-label="Invite role"
          />
        </div>
        {error && <p className={s.dialogError}>{error}</p>}
      </div>
    </Modal>
  );
}
