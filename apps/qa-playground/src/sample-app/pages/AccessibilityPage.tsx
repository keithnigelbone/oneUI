import { useState } from 'react'
import {
  Button,
  CheckboxField,
  Container,
  Divider,
  Icon,
  InputField,
  Modal,
  PaginationDots,
  SelectableIconButton,
  SelectableSingleTextButton,
  SingleTextButton,
  Text,
  Tooltip,
} from '@/debug/oneui'
import { PageHeading } from '@/sample-app/components/PageHeading'
import { useAnnouncer } from '@/sample-app/accessibility/announcer'
import { TESTIDS } from '@/sample-app/testids'
import type { SemanticIconName } from '@/sample-app/types/oneui'
import cards from '@/sample-app/components/cards.module.css'
import styles from './AccessibilityPage.module.css'

const FORMAT_TOOLS: { id: string; icon: SemanticIconName; label: string }[] = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'search', icon: 'search', label: 'Search' },
  { id: 'star', icon: 'star', label: 'Favourite' },
  { id: 'share', icon: 'share', label: 'Share' },
]

export function AccessibilityPage() {
  const announce = useAnnouncer((s) => s.announce)
  const [activeTool, setActiveTool] = useState('home')
  const [focusOpen, setFocusOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [size, setSize] = useState('m')
  const [consent, setConsent] = useState(false)
  const [dot, setDot] = useState(0)

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="2" width="full" data-testid={TESTIDS.accessibility.page}>
      <PageHeading
        title="Accessibility Showcase"
        subtitle="Live examples of keyboard, focus and screen-reader patterns"
      />

      <Section title="Keyboard navigation" testId={TESTIDS.accessibility.keyboardDemo}>
        <Text variant="body" size="S" attention="medium">
          Use <kbd className={styles.kbd}>Tab</kbd> to enter the toolbar and <kbd className={styles.kbd}>Enter</kbd> or
          <kbd className={styles.kbd}>Space</kbd> to toggle a tool. Each control exposes an accessible name.
        </Text>
        <div className={styles.toolRow} role="group" aria-label="Formatting toolbar">
          {FORMAT_TOOLS.map((tool) => (
            <Tooltip key={tool.id} content={tool.label}>
              <SelectableIconButton
                icon={tool.icon}
                selected={activeTool === tool.id}
                onSelectedChange={() => { setActiveTool(tool.id); announce(`${tool.label} selected`) }}
                aria-label={tool.label}
                aria-pressed={activeTool === tool.id}
              />
            </Tooltip>
          ))}
        </div>
      </Section>

      <Section title="Focus management" testId={TESTIDS.accessibility.focusDemo}>
        <Text variant="body" size="S" attention="medium">
          Opening the dialog traps focus inside it. Press <kbd className={styles.kbd}>Esc</kbd> to close — focus returns to
          the trigger button.
        </Text>
        <Button appearance="primary" attention="high" onPress={() => setFocusOpen(true)}>
          Open focus-trapped dialog
        </Button>
        <Modal
          open={focusOpen}
          onOpenChange={setFocusOpen}
          title="Focus is trapped here"
          description="Tab cycles through these controls only."
          dismissible
          footerEnd={
            <>
              <Button attention="low" onPress={() => setFocusOpen(false)}>Cancel</Button>
              <Button appearance="primary" attention="high" onPress={() => setFocusOpen(false)}>Confirm</Button>
            </>
          }
          data-testid={TESTIDS.accessibility.focusTrapModal}
        >
          <InputField label="Try tabbing — focus stays inside" placeholder="Focusable field" fullWidth />
        </Modal>
      </Section>

      <Section title="Screen reader announcements" testId={TESTIDS.accessibility.srDemo}>
        <Text variant="body" size="S" attention="medium">
          The button below pushes a message to a polite ARIA live region, so assistive tech reads it aloud without moving focus.
        </Text>
        <Container surface="ghost" layout="flex" direction="row" gap="2" align="end" wrap>
          <div className={styles.grow}>
            <InputField label="Message to announce" value={message} onChange={setMessage} placeholder="e.g. Plan added to cart" fullWidth />
          </div>
          <Button
            appearance="primary"
            attention="high"
            onPress={() => announce(message.trim() || 'This is a screen reader announcement')}
            data-testid={TESTIDS.accessibility.announceBtn}
          >
            Announce
          </Button>
        </Container>
        <Divider />
        <CheckboxField
          label="I understand how live regions work"
          description="Accessible form control with linked label and description"
          checked={consent}
          onCheckedChange={(v) => setConsent(Boolean(v))}
        />
      </Section>

      <Section title="Accessible selection controls">
        <Text variant="body" size="S" attention="medium">Size selector built from selectable buttons with roving labels:</Text>
        <div className={styles.toolRow} role="group" aria-label="Choose text size">
          {['s', 'm', 'l'].map((s) => (
            <SelectableSingleTextButton
              key={s}
              selected={size === s}
              onSelectedChange={() => { setSize(s); announce(`${s.toUpperCase()} size selected`) }}
              aria-label={`Size ${s.toUpperCase()}`}
            >
              {s.toUpperCase()}
            </SelectableSingleTextButton>
          ))}
          <SingleTextButton appearance="primary" attention="low" aria-label="Reset size">
            ↺
          </SingleTextButton>
        </div>

        <Divider />

        <Text variant="body" size="S" attention="medium">
          Pagination dots expose a tablist with the current position announced:
        </Text>
        <PaginationDots
          pageCount={5}
          activeIndex={dot}
          onActiveIndexChange={(i) => { setDot(i); announce(`Slide ${i + 1} of 5`) }}
          aria-label="Carousel position"
        />
      </Section>

      <Container surface="moderate" appearance="informative" padding="4" width="full" className={cards.card}>
        <Container surface="ghost" layout="flex" direction="row" align="center" gap="2">
          <Icon icon="checkCircle" size="6" appearance="positive" aria-hidden />
          <Text variant="body" size="S">
            Every page uses semantic landmarks (header, nav, main, footer), a skip link, visible focus states and
            labelled controls — ready for axe-core automated checks.
          </Text>
        </Container>
      </Container>
    </Container>
  )
}

function Section({
  title,
  testId,
  children,
}: {
  title: string
  testId?: string
  children: React.ReactNode
}) {
  return (
    <Container
      surface="elevated"
      layout="flex"
      direction="column"
      gap="3"
      padding="5"
      width="full"
      className={cards.card}
      data-testid={testId}
    >
      <Text variant="title" size="M" weight="high" as="h2">{title}</Text>
      {children}
    </Container>
  )
}
