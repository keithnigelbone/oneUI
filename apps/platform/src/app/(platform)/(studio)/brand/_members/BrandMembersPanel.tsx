'use client';

/**
 * BrandMembersPanel.tsx
 *
 * Members management surface for the current brand (GitHub/Linear pattern):
 * a toolbar with an "Invite people" action that opens an overlay, and ONE
 * bordered list of everyone with access — the current user, members, and
 * pending invites grouped at the end. Renders only when the signed-in user
 * `canManageMembers` (admin | owner).
 *
 * Brand membership is PER-BRAND access (viewer/editor/admin), distinct from
 * platform-wide tiers on the owner-only Platform access page (`/settings/users`).
 * DS components + shared `PersonRow` throughout. Convex queries return [] for
 * non-admins, so the panel also guards on `useBrandRole().canManageMembers`.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { Button } from '@oneui/ui/components/Button';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useBrandRole } from '@/hooks/useBrandRole';
import { PageSkeleton } from '@/components/PageSkeleton';
import { PersonRow } from '@/components/access/PersonRow';
import {
  InvitePeopleDialog,
  type InviteRoleValue,
} from '@/components/access/InvitePeopleDialog';
import styles from '../../foundations/foundation.module.css';
import s from '@/components/access/AccessPanel.module.css';

const ROLE_OPTIONS: SelectOption<InviteRoleValue>[] = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
];

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function MemberRow({
  brandId,
  member,
}: {
  brandId: Id<'brands'>;
  member: {
    _id: string;
    userId: Id<'users'>;
    role: string;
    email?: string;
    name?: string;
    image?: string;
  };
}) {
  const updateRole = useMutation(api.brandMembers.updateRole);
  const removeMember = useMutation(api.brandMembers.removeMember);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = member.name || member.email || 'Unknown user';
  const subtitle = member.email && member.name ? member.email : undefined;

  const handleRoleChange = useCallback(
    async (role: InviteRoleValue) => {
      setBusy(true);
      setError(null);
      try {
        await updateRole({ brandId, userId: member.userId, role });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update role');
      } finally {
        setBusy(false);
      }
    },
    [updateRole, brandId, member.userId],
  );

  const handleRemove = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await removeMember({ brandId, userId: member.userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      setBusy(false);
    }
  }, [removeMember, brandId, member.userId]);

  return (
    <PersonRow
      title={displayName}
      subtitle={subtitle}
      image={member.image}
      error={error}
      trailing={
        <>
          <Select
            className={s.roleControl}
            value={member.role as InviteRoleValue}
            onChange={handleRoleChange}
            options={ROLE_OPTIONS}
            size="md"
            disabled={busy}
            aria-label={`Role for ${displayName}`}
          />
          <Button
            attention="low"
            appearance="negative"
            size="medium"
            onPress={handleRemove}
            disabled={busy}
          >
            Remove
          </Button>
        </>
      }
    />
  );
}

function InviteRow({
  invite,
}: {
  invite: { _id: string; email: string; role: string; expiresAt: number };
}) {
  const revokeInvite = useMutation(api.brandMembers.revokeInvite);
  const [busy, setBusy] = useState(false);

  const handleRevoke = useCallback(async () => {
    setBusy(true);
    try {
      await revokeInvite({ inviteId: invite._id as Id<'brandInvites'> });
    } catch {
      setBusy(false);
    }
  }, [revokeInvite, invite._id]);

  return (
    <PersonRow
      title={invite.email}
      subtitle={`${titleCase(invite.role)} · expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
      trailing={
        <Button attention="low" size="medium" onPress={handleRevoke} disabled={busy}>
          Revoke
        </Button>
      }
    />
  );
}

export default function BrandMembersPanel(): React.ReactElement {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const { canManageMembers, isLoading: roleLoading } = useBrandRole(currentBrand?.id);

  const me = useQuery(api.users.getCurrentUserRecord, {});
  const members = useQuery(
    api.brandMembers.listMembers,
    brandId && canManageMembers ? { brandId } : 'skip',
  );
  const invites = useQuery(
    api.brandMembers.listInvites,
    brandId && canManageMembers ? { brandId } : 'skip',
  );
  const invite = useMutation(api.brandMembers.invite);

  const [dialogOpen, setDialogOpen] = useState(false);

  const isLoading =
    roleLoading || (brandId != null && canManageMembers && members === undefined);

  const memberList = useMemo(() => members ?? [], [members]);
  const pendingInvites = useMemo(() => invites ?? [], [invites]);

  // Show the current user as their own row when they aren't an explicit member
  // (the platform owner has access to every brand without a membership row), so
  // the list never reads as an empty "0 members".
  const showSelfRow = useMemo(() => {
    if (!me?._id) return false;
    return !memberList.some((m) => m.userId === me._id);
  }, [me, memberList]);

  const peopleCount = memberList.length + (showSelfRow ? 1 : 0);

  const handleInvite = useCallback(
    async (email: string, role: InviteRoleValue) => {
      if (!brandId) return;
      await invite({ brandId, email, role });
    },
    [invite, brandId],
  );

  if (!brandId) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Members</h1>
          <p className={styles.description}>Select a brand to manage its members.</p>
        </div>
      </div>
    );
  }

  if (!roleLoading && !canManageMembers) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Members</h1>
          <p className={styles.description}>
            You need admin access to manage members for this brand.
          </p>
        </div>
      </div>
    );
  }

  const metaParts: string[] = [
    `${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}`,
  ];
  if (pendingInvites.length > 0) metaParts.push(`${pendingInvites.length} pending`);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Members</h1>
        <p className={styles.description}>
          Manage who can work on <strong>{currentBrand?.name}</strong> and what they can do.
          Roles: <strong>Viewer</strong> (read-only), <strong>Editor</strong> (edit foundations),{' '}
          <strong>Admin</strong> (manage members).
        </p>
      </div>

      <div className={styles.content}>
        {isLoading && <PageSkeleton cards={1} />}

        {!isLoading && (
          <>
            <div className={s.toolbar}>
              <span className={s.toolbarMeta}>{metaParts.join(' · ')}</span>
              <Button attention="low" size="small" onPress={() => setDialogOpen(true)}>
                Invite people
              </Button>
            </div>

            <div className={s.listBox}>
              {showSelfRow && me && (
                <PersonRow
                  title={me.name || me.email || 'You'}
                  subtitle={me.email && me.name ? me.email : undefined}
                  image={me.image}
                  trailing={
                    <span className={s.roleTag}>
                      {me.platformRole === 'owner' ? 'Owner' : 'Admin'}
                    </span>
                  }
                />
              )}

              {memberList.map((m) => (
                <MemberRow key={m._id} brandId={brandId} member={m} />
              ))}

              {pendingInvites.length > 0 && (
                <div className={s.groupLabel}>Pending invitations</div>
              )}
              {pendingInvites.map((inv) => (
                <InviteRow key={inv._id} invite={inv} />
              ))}

              {peopleCount === 0 && pendingInvites.length === 0 && (
                <p className={s.emptyState}>
                  No one has access yet. Invite a teammate to get started.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <InvitePeopleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        brandName={currentBrand?.name}
        onInvite={handleInvite}
      />
    </div>
  );
}
