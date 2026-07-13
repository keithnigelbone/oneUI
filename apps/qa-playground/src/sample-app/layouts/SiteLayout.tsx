import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Icon,
  Text,
  TooltipProvider,
} from '@/debug/oneui'
import { useEffect, useRef } from 'react'
import { SiteHeader } from '@/sample-app/components/SiteHeader'
import { ROUTES } from '@/sample-app/routes/paths'
import { SiteFooter } from '@/sample-app/components/SiteFooter'
import { MobileTabBar } from '@/sample-app/components/MobileTabBar'
import { SkipLink } from '@/sample-app/accessibility/SkipLink'
import { LiveRegion } from '@/sample-app/accessibility/LiveRegion'
import { TESTIDS } from '@/sample-app/testids'
import styles from './SiteLayout.module.css'

export function SiteLayout() {
  const mainRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const prevPath = useRef(pathname)

  // Move focus to the main region only on a real route change. Comparing against
  // the previous path (rather than a "first render" flag) keeps this correct
  // under React StrictMode's double-invoked effects, and `preventScroll` stops
  // the sticky header from covering the focused content.
  useEffect(() => {
    if (prevPath.current === pathname) return
    prevPath.current = pathname
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <TooltipProvider>
      <SkipLink targetId={TESTIDS.layout.main} />
      <div className={styles.shell} data-testid={TESTIDS.layout.shell}>
        <div className={styles.demoBackBar}>
          <Link to={ROUTES.qaPlayground} className={styles.demoBackLink} data-testid={TESTIDS.layout.demoBack}>
            <Icon icon="arrowLeft" size="4" appearance="primary" emphasis="tintedA11y" aria-hidden />
            <Text variant="label" size="S" weight="medium" attention="tintedA11y">
              QA Playground
            </Text>
          </Link>
        </div>
        <SiteHeader />
        <main
          id={TESTIDS.layout.main}
          ref={mainRef}
          className={styles.main}
          data-testid={TESTIDS.layout.main}
          tabIndex={-1}
        >
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
        <SiteFooter />
        <MobileTabBar />
      </div>
      <LiveRegion />
    </TooltipProvider>
  )
}
