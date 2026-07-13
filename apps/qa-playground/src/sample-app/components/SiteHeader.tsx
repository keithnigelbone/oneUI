import { useState } from 'react'
import {
  Avatar,
  Container,
  CounterBadge,
  Icon,
  IconButton,
  InputField,
  Surface,
  Text,
  Tooltip,
} from '@/debug/oneui'
import { useLocation, useNavigate } from 'react-router-dom'
import { PRIMARY_NAV, ROUTES, UTILITY_NAV } from '@/sample-app/routes/paths'
import { useAppStore } from '@/sample-app/store/appStore'
import { TESTIDS } from '@/sample-app/testids'
import { ThemeToggle } from './ThemeToggle'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const profileName = useAppStore((s) => s.profileName)
  const cartCount = useAppStore((s) => s.cartCount)
  const setGlobalSearch = useAppStore((s) => s.setGlobalSearch)
  const unread = useAppStore((s) => s.notifications.filter((n) => !n.read).length)

  const isActive = (path: string) =>
    path === ROUTES.home ? location.pathname === path : location.pathname.startsWith(path)

  const submitSearch = () => {
    setGlobalSearch(search)
    navigate(ROUTES.devices)
  }

  return (
    <Surface mode="elevated" className={styles.header} data-testid={TESTIDS.layout.header}>
      <div className={styles.topRow}>
        <button
          type="button"
          className={styles.logo}
          onClick={() => navigate(ROUTES.home)}
          aria-label="Jio home"
        >
          <span className={styles.logoMark}>Jio</span>
          <Text variant="label" size="S" attention="medium" className={styles.logoTag}>
            Digital Life
          </Text>
        </button>

        <form
          className={styles.searchWrap}
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            submitSearch()
          }}
        >
          <InputField
            label="Search Jio services, plans and devices"
            value={search}
            onChange={setSearch}
            placeholder="Search plans, devices, offers…"
            shape="pill"
            start={<Icon icon="search" aria-hidden />}
            fullWidth
            aria-label="Search Jio services"
            data-testid={TESTIDS.layout.headerSearch}
          />
          <button type="submit" className={styles.visuallyHidden} data-testid={TESTIDS.layout.headerSearchSubmit}>
            Search
          </button>
        </form>

        <div className={styles.utility}>
          <div className={styles.utilityAction}>
            <ThemeToggle />
          </div>

          <div className={styles.utilityAction}>
            <Tooltip content="Rewards cart">
              <span className={styles.iconStack}>
                <IconButton
                  icon="bookmark"
                  aria-label="View cart"
                  attention="medium"
                  appearance="neutral"
                  size="m"
                  onClick={() => navigate(ROUTES.rewards)}
                />
                {cartCount > 0 ? (
                  <span className={styles.badgeAnchor}>
                    <CounterBadge
                      value={cartCount}
                      appearance="primary"
                      size="s"
                      aria-label={`${cartCount} items in cart`}
                      data-testid={TESTIDS.layout.cartBadge}
                    />
                  </span>
                ) : null}
              </span>
            </Tooltip>
          </div>

          <div className={styles.utilityAction}>
            <Tooltip content="Notifications">
              <span className={styles.iconStack}>
                <IconButton
                  icon="notification"
                  aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                  attention="medium"
                  appearance="neutral"
                  size="m"
                  onClick={() => navigate(ROUTES.notifications)}
                />
                {unread > 0 ? (
                  <span className={styles.badgeAnchor} data-testid={TESTIDS.layout.notificationBadge}>
                    <CounterBadge
                      value={unread}
                      appearance="negative"
                      size="s"
                      aria-label={`${unread} unread notifications`}
                    />
                  </span>
                ) : null}
              </span>
            </Tooltip>
          </div>

          <div className={styles.utilityAction}>
            <button
              type="button"
              className={styles.avatarBtn}
              onClick={() => navigate(ROUTES.account)}
              aria-label="My account"
            >
              <Avatar content="text" alt={profileName} size="s" data-testid={TESTIDS.layout.avatar} />
            </button>
          </div>
        </div>
      </div>

      <nav className={styles.navRow} aria-label="Primary" data-testid={TESTIDS.layout.primaryNav}>
        <Container surface="ghost" layout="flex" direction="row" gap="1" align="center">
          {PRIMARY_NAV.map((entry) => {
            const active = isActive(entry.path)
            return (
              <button
                key={entry.path}
                type="button"
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                onClick={() => navigate(entry.path)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon icon={entry.icon} size="4" aria-hidden />
                <span>{entry.label}</span>
              </button>
            )
          })}
        </Container>
        <div className={styles.navUtility}>
          {UTILITY_NAV.map((entry) => {
            const active = isActive(entry.path)
            return (
              <button
                key={entry.path}
                type="button"
                className={`${styles.navLinkSubtle} ${active ? styles.navLinkActive : ''}`}
                onClick={() => navigate(entry.path)}
                aria-current={active ? 'page' : undefined}
              >
                {entry.label}
              </button>
            )
          })}
        </div>
      </nav>
    </Surface>
  )
}
