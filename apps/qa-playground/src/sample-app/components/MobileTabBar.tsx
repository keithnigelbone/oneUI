import { useLocation, useNavigate } from 'react-router-dom'
import {
  BottomNavItem,
  BottomNavigation,
} from '@/debug/oneui'
import { PRIMARY_NAV, ROUTES } from '@/sample-app/routes/paths'
import { TESTIDS } from '@/sample-app/testids'
import styles from './MobileTabBar.module.css'

export function MobileTabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const current =
    PRIMARY_NAV.find((entry) =>
      entry.path === ROUTES.home
        ? location.pathname === entry.path
        : location.pathname.startsWith(entry.path),
    )?.path ?? ROUTES.home

  return (
    <div className={styles.bar} data-testid={TESTIDS.layout.mobileNav}>
      <BottomNavigation
        aria-label="Primary"
        value={current}
        onValueChange={(value: string) => value && navigate(value)}
        appearance="primary"
      >
        {PRIMARY_NAV.map((entry) => (
          <BottomNavItem key={entry.path} value={entry.path} icon={entry.icon} label={entry.label} />
        ))}
      </BottomNavigation>
    </div>
  )
}
