'use client';

/**
 * PlatformUsersPanel.tsx
 *
 * Owner-only platform-governance surface, reached from Settings (NOT a brand
 * tab). One bordered list of everyone on the platform with a per-user
 * platform-tier Select wired to `users.setPlatformRole`. Only rendered when
 * `usePlatformRole().isOwner`; `listAllUsers` also returns [] for non-owners.
 *
 * Platform tiers are GLOBAL — distinct from per-brand Members (viewer/editor/
 * admin). Tier ladder: Member (view-only) < Creator (can create brands) <
 * Owner (super-admin). DS components + shared `PersonRow`.
 */

import React, { useCallback, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { Button } from '@oneui/ui/components/Button';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import { usePlatformRole, type PlatformRole } from '@/hooks/usePlatformRole';
import { PageSkeleton } from '@/components/PageSkeleton';
import { PersonRow } from '@/components/access/PersonRow';
import { InvitePeopleDialog } from '@/components/access/InvitePeopleDialog';
import styles from '../../foundations/foundation.module.css';
import s from '@/components/access/AccessPanel.module.css';

const PLATFORM_ROLE_OPTIONS: SelectOption<PlatformRole>[] = [
  { value: 'member', label: 'Member' },
  { value: 'creator', label: 'Creator' },
  { value: 'owner', label: 'Owner' },
];

const titleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

interface PlatformUser {
  _id: Id<'users'>;
  email?: string;
  name?: string;
  image?: string;
  platformRole?: string;
}

function UserRow({ user }: { user: PlatformUser }) {
  const setPlatformRole = useMutation(api.users.setPlatformRole);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = user.name || user.email || 'Unknown user';
  const subtitle = user.email && user.name ? user.email : undefined;
  const role = (user.platformRole ?? 'member') as PlatformRole;

  const handleRoleChange = useCallback(
    async (next: PlatformRole) => {
      setBusy(true);
      setError(null);
      try {
        await setPlatformRole({ userId: user._id, role: next });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update role');
      } finally {
        setBusy(false);
      }
    },
    [setPlatformRole, user._id],
  );

  return (
    <PersonRow
      title={displayName}
      subtitle={subtitle}
      image={user.image}
      error={error}
      trailing={
        <Select
          className={s.roleControl}
          value={role}
          onChange={handleRoleChange}
          options={PLATFORM_ROLE_OPTIONS}
          size="md"
          disabled={busy}
          aria-label={`Platform tier for ${displayName}`}
        />
      }
    />
  );
}

function PlatformInviteRow({
  invite,
}: {
  invite: { _id: string; email: string; role: string; expiresAt: number };
}) {
  const revokeInvite = useMutation(api.users.revokePlatformInvite);
  const [busy, setBusy] = useState(false);

  const handleRevoke = useCallback(async () => {
    setBusy(true);
    try {
      await revokeInvite({ inviteId: invite._id as Id<'platformInvites'> });
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

export default function PlatformUsersPanel(): React.ReactElement {
  const { isOwner, isLoading: roleLoading } = usePlatformRole();
  const users = useQuery(api.users.listAllUsers, isOwner ? {} : 'skip');
  const invites = useQuery(api.users.listPlatformInvites, isOwner ? {} : 'skip');
  const invite = useMutation(api.users.invitePlatformMember);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleInvite = useCallback(
    async (email: string, role: PlatformRole) => {
      await invite({ email, role });
    },
    [invite],
  );

  const isLoading = roleLoading || (isOwner && users === undefined);
  const userList = users ?? [];
  const pendingInvites = invites ?? [];

  if (!roleLoading && !isOwner) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Platform access</h1>
          <p className={styles.description}>
            Only the platform owner can manage platform tiers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Platform access</h1>
        <p className={styles.description}>
          Platform tiers are global and decide what each person can do across the whole
          platform. <strong>Member</strong> is view-only, <strong>Creator</strong> can create
          brands, and <strong>Owner</strong> is a super-admin. To manage who works on a specific
          brand, use that brand&rsquo;s <strong>Members</strong> tab instead.
        </p>
      </div>

      <div className={styles.content}>
        {isLoading && <PageSkeleton cards={1} />}

        {!isLoading && (
          <>
            <div className={s.toolbar}>
              <span className={s.toolbarMeta}>
                {[
                  `${userList.length} ${userList.length === 1 ? 'person' : 'people'}`,
                  ...(pendingInvites.length > 0 ? [`${pendingInvites.length} pending`] : []),
                ].join(' · ')}
              </span>
              <Button attention="low" size="small" onPress={() => setDialogOpen(true)}>
                Invite people
              </Button>
            </div>

            <div className={s.listBox}>
              {userList.length === 0 && pendingInvites.length === 0 ? (
                <p className={s.emptyState}>No users found.</p>
              ) : (
                userList.map((u) => <UserRow key={u._id} user={u as PlatformUser} />)
              )}

              {pendingInvites.length > 0 && (
                <div className={s.groupLabel}>Pending invitations</div>
              )}
              {pendingInvites.map((inv) => (
                <PlatformInviteRow key={inv._id} invite={inv} />
              ))}
            </div>
          </>
        )}
      </div>

      <InvitePeopleDialog<PlatformRole>
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onInvite={handleInvite}
        roleOptions={PLATFORM_ROLE_OPTIONS}
        defaultRole="member"
        title="Invite to the platform"
        description="Invite someone to the platform and set their global tier. They'll see the invitation when they sign in with this email address."
        submitLabel="Send invite"
      />
    </div>
  );
}
