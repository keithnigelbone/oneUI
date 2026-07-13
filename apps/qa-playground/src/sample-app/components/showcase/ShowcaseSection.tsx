import type { ReactNode } from 'react'
import { Container, Text } from '@/debug/oneui'
import cards from '../cards.module.css'
import styles from './ShowcaseSection.module.css'

interface ShowcaseSectionProps {
  id: string
  title: string
  subtitle?: string
  children: ReactNode
}

/** Grouped OneUI component demo with anchor id for QA navigation. */
export function ShowcaseSection({ id, title, subtitle, children }: ShowcaseSectionProps) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <Container surface="elevated" padding="5" width="full" className={cards.card}>
        <h2 id={`${id}-title`} className={styles.title}>
          <Text variant="headline" size="S" weight="high" as="span">
            {title}
          </Text>
        </h2>
        {subtitle ? (
          <Text variant="body" size="S" attention="medium" className={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
        <div className={styles.body}>{children}</div>
      </Container>
    </section>
  )
}

interface ShowcaseRowProps {
  label: string
  children: ReactNode
}

export function ShowcaseRow({ label, children }: ShowcaseRowProps) {
  return (
    <div className={styles.row}>
      <Text variant="label" size="S" weight="medium" attention="medium" className={styles.rowLabel}>
        {label}
      </Text>
      <div className={styles.rowContent}>{children}</div>
    </div>
  )
}
