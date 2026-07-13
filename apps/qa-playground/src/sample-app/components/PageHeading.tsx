import type { ReactNode } from 'react'
import {
  Container,
  Text,
} from '@/debug/oneui'

interface PageHeadingProps {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
}

export function PageHeading({ title, subtitle, eyebrow, actions }: PageHeadingProps) {
  return (
    <Container
      surface="ghost"
      layout="flex"
      direction="row"
      justify="space-between"
      align="end"
      gap="6"
      width="full"
      wrap
      className="pageIntro"
    >
      <Container surface="ghost" layout="flex" direction="column" gap="1">
        {eyebrow ? (
          <Text variant="label" size="S" weight="medium" attention="tintedA11y">{eyebrow}</Text>
        ) : null}
        <Text variant="headline" size="M" weight="high" as="h1">{title}</Text>
        {subtitle ? (
          <Text variant="body" size="M" attention="medium">{subtitle}</Text>
        ) : null}
      </Container>
      {actions ? <div className="introAction">{actions}</div> : null}
    </Container>
  )
}
