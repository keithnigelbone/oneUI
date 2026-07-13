'use client';

/**
 * ProfileMenu.tsx
 *
 * Avatar dropdown for the left rail. Wraps the LeftNav avatar button (passed
 * in as `trigger` via LeftNav's `renderProfileMenu` render prop) in a DS Menu:
 *   header (avatar + name + email)
 *   → Account (opens AccountModal)
 *   → Invite people (admin/owner of the current brand — opens InvitePeopleDialog)
 *   → Platform access (owner-only, /settings/users)
 *   → Sign out
 *
 * No Settings item — the settings gear IconButton sits directly above the
 * avatar in the rail; duplicating it here read as clutter.
 *
 * The avatar sits at the very bottom of the left rail, so the menu flies out
 * to the right of it (`side="right"`) and is pinned to the avatar's bottom
 * edge (`align="end"`) — so it sits *next to* the avatar and grows upward,
 * rather than stacking over the rail or spilling off the bottom of the screen.
 *
 * Replaces the previous behavior where clicking the avatar signed out
 * immediately with no confirmation.
 */

import React from 'react';
import { Menu } from '@oneui/ui/components/Menu';
import { Avatar } from '@oneui/ui/components/Avatar';
import { Icon } from '@oneui/ui/icons/Icon';
import s from './Account.module.css';

export interface ProfileMenuUser {
  name: string;
  email?: string;
  avatar?: string;
  initials?: string;
}

export interface ProfileMenuProps {
  /** The avatar button rendered by LeftNav — becomes the menu trigger. */
  trigger: React.ReactElement;
  user: ProfileMenuUser;
  onOpenAccount: () => void;
  /** Invite a teammate to the current brand; admin/owner only — omit to hide. */
  onOpenInvitePeople?: () => void;
  /** Owner-only entry; omit to hide. */
  onOpenPlatformAccess?: () => void;
  onSignOut: () => void;
}

export function ProfileMenu({
  trigger,
  user,
  onOpenAccount,
  onOpenInvitePeople,
  onOpenPlatformAccess,
  onSignOut,
}: ProfileMenuProps): React.ReactElement {
  return (
    <Menu>
      <Menu.Trigger render={trigger} />
      <Menu.Portal side="right" align="end" sideOffset={8}>
        <div className={s.menuHeader}>
          <Avatar
            content={user.avatar ? 'image' : 'text'}
            src={user.avatar}
            alt={user.name}
            size="m"
            attention="medium"
            appearance="primary"
          />
          <div className={s.menuIdentity}>
            <span className={s.menuName}>{user.name}</span>
            {user.email && <span className={s.menuEmail}>{user.email}</span>}
          </div>
        </div>
        <Menu.Separator />
        <Menu.Item onClick={onOpenAccount}>
          <span className={s.menuItemInner}>
            <Icon name="user" size="sm" />
            Account
          </span>
        </Menu.Item>
        {onOpenInvitePeople && (
          <Menu.Item onClick={onOpenInvitePeople}>
            <span className={s.menuItemInner}>
              <Icon name="userAdd" size="sm" />
              Invite people
            </span>
          </Menu.Item>
        )}
        {onOpenPlatformAccess && (
          <Menu.Item onClick={onOpenPlatformAccess}>
            <span className={s.menuItemInner}>
              <Icon name="users" size="sm" />
              Platform access
            </span>
          </Menu.Item>
        )}
        <Menu.Separator />
        <Menu.Item onClick={onSignOut}>
          <span className={s.menuItemInner}>
            <Icon name="logout" size="sm" />
            Sign out
          </span>
        </Menu.Item>
      </Menu.Portal>
    </Menu>
  );
}
