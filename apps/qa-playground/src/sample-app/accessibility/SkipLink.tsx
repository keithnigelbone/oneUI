import { TESTIDS } from '@/sample-app/testids'
import styles from './SkipLink.module.css'

/**
 * Visually-hidden skip link that becomes visible on focus, letting keyboard and
 * screen-reader users jump straight to the main content region.
 */
export function SkipLink({ targetId }: { targetId: string }) {
  return (
    <a href={`#${targetId}`} className={styles.skipLink} data-testid={TESTIDS.layout.skipLink}>
      Skip to main content
    </a>
  )
}
