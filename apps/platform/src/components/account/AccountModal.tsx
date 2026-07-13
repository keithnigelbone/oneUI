'use client';

/**
 * AccountModal.tsx
 *
 * Account settings overlay opened from the avatar ProfileMenu. Lets the
 * signed-in user edit their display name and change their password via
 * Better Auth (`authClient.updateUser` / `authClient.changePassword`).
 * Password change works without an email provider — it verifies the
 * current password instead of sending a reset link.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from '@oneui/ui/components/Modal';
import { Input } from '@oneui/ui/components/Input';
import { Button } from '@oneui/ui/components/Button';
import { Avatar } from '@oneui/ui/components/Avatar';
import { Divider } from '@oneui/ui/components/Divider';
import { authClient } from '@/lib/auth-client';
import s from './Account.module.css';

const MIN_PASSWORD_LENGTH = 8;

export interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current display name from the session (seeds the name field). */
  currentName: string;
  /** Signed-in email — shown read-only (changing email needs a verification flow). */
  email?: string;
  /** Avatar image URL from the session, when set. */
  avatar?: string;
}

export function AccountModal({
  open,
  onOpenChange,
  currentName,
  email,
  avatar,
}: AccountModalProps): React.ReactElement {
  const [name, setName] = useState(currentName);
  const [nameBusy, setNameBusy] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  // Re-seed the form only on the closed→open transition. Not on every
  // `currentName` change: a successful rename refreshes the session (and thus
  // currentName) while the modal is open, and re-seeding then would wipe the
  // "Name updated." confirmation the user is looking at.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setName(currentName);
      setNameError(null);
      setNameSaved(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwError(null);
      setPwSaved(false);
    }
    wasOpenRef.current = open;
  }, [open, currentName]);

  const handleSaveName = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) return;
    setNameBusy(true);
    setNameError(null);
    setNameSaved(false);
    try {
      const result = await authClient.updateUser({ name: trimmed });
      if (result.error) {
        setNameError(result.error.message ?? 'Failed to update name');
      } else {
        setNameSaved(true);
      }
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setNameBusy(false);
    }
  }, [name, currentName]);

  const handleChangePassword = useCallback(async () => {
    setPwError(null);
    setPwSaved(false);
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPwError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    setPwBusy(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) {
        setPwError(result.error.message ?? 'Failed to change password');
      } else {
        setPwSaved(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPwBusy(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const canSaveName = name.trim().length > 0 && name.trim() !== currentName && !nameBusy;
  const canChangePassword =
    currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0 && !pwBusy;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      size="M"
      title="Account"
      description="Manage how you appear and sign in."
      footerEnd={
        <Button attention="low" size="s" onPress={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <div className={s.form}>
        <div className={s.section}>
          <div className={s.identityRow}>
            <Avatar
              content={avatar ? 'image' : 'text'}
              src={avatar}
              alt={currentName}
              size="2xl"
              attention="medium"
              appearance="primary"
            />
            <div className={s.identityText}>
              <span className={s.identityName}>{currentName}</span>
              <span className={s.identityEmail}>{email ?? '—'}</span>
            </div>
          </div>

          <div className={s.field}>
            <span className={s.fieldLabel}>Display name</span>
            <div className={s.inlineRow}>
              <Input
                aria-label="Display name"
                value={name}
                onChange={setName}
                placeholder="Your name"
                disabled={nameBusy}
              />
              <Button
                attention="medium"
                size="s"
                onPress={handleSaveName}
                disabled={!canSaveName}
              >
                {nameBusy ? 'Saving…' : 'Save name'}
              </Button>
            </div>
            {nameError && <p className={s.error}>{nameError}</p>}
            {nameSaved && <p className={s.success}>Name updated.</p>}
          </div>
        </div>

        <div className={s.bleedDivider}>
          <Divider orientation="horizontal" size="s" attention="low" appearance="neutral" />
        </div>

        <div className={s.section}>
          <div>
            <h3 className={s.sectionTitle}>Change password</h3>
            <p className={s.sectionHint}>
              Changing your password signs you out of all other sessions.
            </p>
          </div>
          <div className={s.field}>
            <span className={s.fieldLabel}>Current password</span>
            <Input
              aria-label="Current password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              disabled={pwBusy}
            />
          </div>
          <div className={s.passwordGrid}>
            <div className={s.field}>
              <span className={s.fieldLabel}>New password</span>
              <Input
                aria-label="New password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                disabled={pwBusy}
              />
            </div>
            <div className={s.field}>
              <span className={s.fieldLabel}>Confirm new password</span>
              <Input
                aria-label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={pwBusy}
              />
            </div>
          </div>
          {pwError && <p className={s.error}>{pwError}</p>}
          {pwSaved && <p className={s.success}>Password changed. Other sessions were signed out.</p>}
          <div className={s.actionRow}>
            <Button
              attention="medium"
              size="s"
              onPress={handleChangePassword}
              disabled={!canChangePassword}
            >
              {pwBusy ? 'Changing…' : 'Change password'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
