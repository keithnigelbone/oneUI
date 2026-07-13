import { useMemo, useState } from 'react'
import {
  Button,
  Container,
  Icon,
  IconContained,
  InputField,
  Modal,
  TabGroup,
  TabItem,
  Text,
} from '@/debug/oneui'
import { FAQS } from '@/sample-app/services/catalog'
import type { FaqItem, SupportCategory } from '@/sample-app/services/types'
import { PageHeading } from '@/sample-app/components/PageHeading'
import { useAnnouncer } from '@/sample-app/accessibility/announcer'
import { TESTIDS } from '@/sample-app/testids'
import type { SemanticIconName } from '@/sample-app/types/oneui'
import cards from '@/sample-app/components/cards.module.css'
import styles from './SupportPage.module.css'

const CATEGORIES: { id: SupportCategory | 'all'; label: string; icon: SemanticIconName }[] = [
  { id: 'all', label: 'All topics', icon: 'help' },
  { id: 'recharge', label: 'Recharge', icon: 'smartphone' },
  { id: 'devices', label: 'Devices', icon: 'tv' },
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'network', label: 'Network', icon: 'globe' },
]

const HELP_CARDS: { id: string; title: string; desc: string; icon: SemanticIconName }[] = [
  { id: 'chat', title: 'Chat with us', desc: 'Available 8 AM – 10 PM', icon: 'chat' },
  { id: 'call', title: 'Call support', desc: '1800-890-0000 (toll free)', icon: 'phone' },
  { id: 'email', title: 'Email us', desc: 'care@jio.example', icon: 'mail' },
]

export function SupportPage() {
  const [tab, setTab] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [contactOpen, setContactOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const announce = useAnnouncer((s) => s.announce)

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FAQS.filter((f) => {
      const matchesTab = tab === 'all' || f.category === tab
      const matchesQuery = !q || `${f.question} ${f.answer}`.toLowerCase().includes(q)
      return matchesTab && matchesQuery
    })
  }, [tab, query])

  const submitContact = async () => {
    if (!subject.trim() || !message.trim()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    setSubmitted(true)
    announce('Support request submitted. Our team will reach out shortly.')
  }

  const closeContact = () => {
    setContactOpen(false)
    setTimeout(() => {
      setSubmitted(false)
      setSubject('')
      setMessage('')
    }, 200)
  }

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="2" width="full" data-testid={TESTIDS.support.page}>
      <PageHeading
        title="Support Center"
        subtitle="Search FAQs or reach our team"
        actions={
          <Button appearance="primary" attention="high" onPress={() => setContactOpen(true)} data-testid={TESTIDS.support.contactBtn}>
            Contact support
          </Button>
        }
      />

      <form role="search" onSubmit={(e) => e.preventDefault()} className={styles.searchRow}>
        <InputField
          label="Search help topics"
          value={query}
          onChange={setQuery}
          placeholder="e.g. recharge not activated"
          shape="pill"
          start={<Icon icon="search" size="4" aria-hidden />}
          fullWidth
          data-testid={TESTIDS.support.search}
        />
      </form>

      <div className={`${cards.grid3} ${styles.helpGrid}`}>
        {HELP_CARDS.map((card) => (
          <Container
            key={card.id}
            surface="elevated"
            layout="flex"
            direction="row"
            align="center"
            gap="3"
            padding="4"
            width="full"
            className={cards.card}
          >
            <IconContained icon={card.icon} appearance="primary" attention="high" size="m" aria-hidden />
            <Container surface="ghost" layout="flex" direction="column" gap="0">
              <Text variant="title" size="S" weight="high">{card.title}</Text>
              <Text variant="body" size="S" attention="medium">{card.desc}</Text>
            </Container>
          </Container>
        ))}
      </div>

      <TabGroup
        value={tab}
        onValueChange={(v) => v != null && setTab(String(v))}
        aria-label="FAQ categories"
        className={styles.tabs}
      >
        {CATEGORIES.map((c) => (
          <TabItem key={c.id} value={c.id} data-testid={TESTIDS.support.categoryTab(c.id)}>
            {c.label}
          </TabItem>
        ))}
      </TabGroup>

      {filteredFaqs.length === 0 ? (
        <Container surface="subtle" padding="5" width="full">
          <Text variant="body" size="M" attention="medium">No FAQs match your search. Try contacting support.</Text>
        </Container>
      ) : (
        <div className={styles.faqList}>
          {filteredFaqs.map((faq) => (
            <FaqDisclosure key={faq.id} faq={faq} />
          ))}
        </div>
      )}

      <Modal
        open={contactOpen}
        onOpenChange={(open) => (open ? setContactOpen(true) : closeContact())}
        title={submitted ? 'Request submitted' : 'Contact support'}
        description={submitted ? undefined : 'Tell us what you need help with.'}
        dismissible
        footerEnd={
          submitted ? (
            <Button appearance="primary" attention="high" onPress={closeContact}>Done</Button>
          ) : (
            <>
              <Button attention="low" onPress={closeContact}>Cancel</Button>
              <Button
                appearance="primary"
                attention="high"
                loading={submitting}
                onPress={submitContact}
                data-testid={TESTIDS.support.contactSubmit}
              >
                Submit request
              </Button>
            </>
          )
        }
        data-testid={TESTIDS.support.contactModal}
      >
        {submitted ? (
          <Container surface="ghost" layout="flex" direction="row" align="center" gap="2" data-testid={TESTIDS.support.contactSuccess}>
            <Icon icon="checkCircle" size="6" appearance="positive" aria-hidden />
            <Text variant="body" size="M">We received your request and will email you within 24 hours.</Text>
          </Container>
        ) : (
          <Container surface="ghost" layout="flex" direction="column" gap="3">
            <InputField label="Subject" value={subject} onChange={setSubject} placeholder="Brief summary" fullWidth required />
            <InputField label="Message" value={message} onChange={setMessage} placeholder="Describe your issue" fullWidth required />
          </Container>
        )}
      </Modal>
    </Container>
  )
}

function FaqDisclosure({ faq }: { faq: FaqItem }) {
  const [open, setOpen] = useState(false)
  const panelId = `faq-panel-${faq.id}`

  return (
    <Container surface="elevated" layout="flex" direction="column" gap="0" width="full" className={cards.card}>
      <Button
        appearance="neutral"
        attention="low"
        fullWidth
        onPress={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        end={<Icon icon={open ? 'chevronUp' : 'chevronDown'} size="4" aria-hidden />}
        data-testid={TESTIDS.support.faqItem(faq.id)}
      >
        {faq.question}
      </Button>
      {open && (
        <div id={panelId} className={styles.faqPanel}>
          <Text variant="body" size="S" attention="medium">{faq.answer}</Text>
        </div>
      )}
    </Container>
  )
}
