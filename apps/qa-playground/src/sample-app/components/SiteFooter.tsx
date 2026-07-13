import { useNavigate } from 'react-router-dom'
import {
  Container,
  Divider,
  Text,
} from '@/debug/oneui'
import { PRIMARY_NAV, UTILITY_NAV } from '@/sample-app/routes/paths'
import { TESTIDS } from '@/sample-app/testids'
import styles from './SiteFooter.module.css'

const COLUMNS = [
  { title: 'Explore', links: PRIMARY_NAV },
  { title: 'Account', links: UTILITY_NAV },
]

export function SiteFooter() {
  const navigate = useNavigate()

  return (
    <footer className={styles.footer} data-testid={TESTIDS.layout.footer}>
      <div className={styles.inner}>
        <Container surface="ghost" layout="flex" direction="column" gap="2" className={styles.brandCol}>
          <span className={styles.logoMark}>Jio</span>
          <Text variant="body" size="S" attention="medium">
            Telecom and digital services, reimagined. Built end-to-end with OneUI components.
          </Text>
        </Container>

        {COLUMNS.map((col) => (
          <nav key={col.title} className={styles.col} aria-label={col.title}>
            <Text variant="label" size="S" weight="high">{col.title}</Text>
            {col.links.map((link) => (
              <button
                key={link.path}
                type="button"
                className={styles.footerLink}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        ))}
      </div>
      <Divider />
      <Text variant="body" size="XS" attention="medium" className={styles.copyright}>
        © 2026 Jio Digital Life — demo experience for OneUI component validation.
      </Text>
    </footer>
  )
}
