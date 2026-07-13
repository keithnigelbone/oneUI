import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Chip,
  ChipGroup,
  Container,
  Divider,
  Icon,
  IconContained,
  Text,
} from '@/debug/oneui'
import type { NotificationKind } from '@/sample-app/services/types'
import { PageHeading } from '@/sample-app/components/PageHeading'
import { useAppStore } from '@/sample-app/store/appStore'
import { useAnnouncer } from '@/sample-app/accessibility/announcer'
import { relativeTime } from '@/sample-app/utils/format'
import { TESTIDS } from '@/sample-app/testids'
import type { SemanticIconName } from '@/sample-app/types/oneui'
import cards from '@/sample-app/components/cards.module.css'
import styles from './NotificationsPage.module.css'

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'offer', label: 'Offers' },
  { id: 'recharge', label: 'Recharge' },
  { id: 'account', label: 'Account' },
  { id: 'system', label: 'System' },
]

const KIND_ICON: Record<NotificationKind, SemanticIconName> = {
  offer: 'star',
  recharge: 'smartphone',
  account: 'user',
  system: 'info',
}

const KIND_APPEARANCE: Record<NotificationKind, 'positive' | 'informative' | 'primary' | 'warning'> = {
  offer: 'positive',
  recharge: 'primary',
  account: 'informative',
  system: 'warning',
}

export function NotificationsPage() {
  const notifications = useAppStore((s) => s.notifications)
  const markRead = useAppStore((s) => s.markNotificationRead)
  const markAll = useAppStore((s) => s.markAllNotificationsRead)
  const announce = useAnnouncer((s) => s.announce)
  const [filter, setFilter] = useState<string[]>(['all'])

  const active = filter[0] ?? 'all'
  const unreadCount = notifications.filter((n) => !n.read).length

  const visible = useMemo(() => {
    if (active === 'all') return notifications
    if (active === 'unread') return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.kind === active)
  }, [notifications, active])

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="2" width="full" data-testid={TESTIDS.notifications.page}>
      <PageHeading
        title="Notifications"
        subtitle={unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'You are all caught up'}
        actions={
          <Button
            appearance="primary"
            attention="medium"
            disabled={unreadCount === 0}
            onPress={() => { markAll(); announce('All notifications marked as read') }}
            data-testid={TESTIDS.notifications.markAllRead}
          >
            Mark all as read
          </Button>
        }
      />

      <ChipGroup
        value={filter}
        onValueChange={(v) => setFilter(v.length ? [v[v.length - 1]] : ['all'])}
        aria-label="Filter notifications"
        data-testid={TESTIDS.notifications.filterChips}
      >
        {FILTERS.map((f) => (
          <Chip key={f.id} value={f.id} data-testid={TESTIDS.notifications.filterChip(f.id)}>
            {f.label}
          </Chip>
        ))}
      </ChipGroup>

      {visible.length === 0 ? (
        <Container surface="subtle" padding="6" width="full" data-testid={TESTIDS.notifications.empty}>
          <Text variant="body" size="M" attention="medium">No notifications here.</Text>
        </Container>
      ) : (
        <ul className={styles.list} aria-label="Notifications list">
          {visible.map((n) => (
            <li key={n.id}>
              <Container
                surface={n.read ? 'subtle' : 'elevated'}
                layout="flex"
                direction="row"
                align="center"
                gap="3"
                padding="4"
                width="full"
                className={cards.card}
                data-testid={TESTIDS.notifications.item(n.id)}
              >
                <IconContained icon={KIND_ICON[n.kind]} appearance={KIND_APPEARANCE[n.kind]} attention="medium" size="m" aria-hidden />
                <Container surface="ghost" layout="flex" direction="column" gap="1">
                  <Container surface="ghost" layout="flex" direction="row" align="center" gap="2" wrap>
                    <Text variant="title" size="S" weight="high">{n.title}</Text>
                    {!n.read && <Badge appearance="primary" size="s">New</Badge>}
                  </Container>
                  <Text variant="body" size="S" attention="medium">{n.message}</Text>
                  <Text variant="label" size="XS" attention="low">{relativeTime(n.timestamp)}</Text>
                </Container>
                {!n.read && (
                  <Button
                    appearance="primary"
                    attention="low"
                    onPress={() => { markRead(n.id); announce('Notification marked as read') }}
                    aria-label={`Mark "${n.title}" as read`}
                    data-testid={TESTIDS.notifications.markRead(n.id)}
                  >
                    <Icon icon="check" size="4" aria-hidden />
                  </Button>
                )}
              </Container>
            </li>
          ))}
        </ul>
      )}

      <Divider />
      <Text variant="body" size="XS" attention="low">
        Notification preferences can be changed in My Account → Settings.
      </Text>
    </Container>
  )
}
