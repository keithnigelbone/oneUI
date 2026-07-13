import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Container,
  Divider,
  Icon,
  InputField,
  Modal,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  TabGroup,
  TabItem,
  TabPanel,
  Text,
} from '@/debug/oneui'
import { useNavigate } from 'react-router-dom'
import { PLANS } from '@/sample-app/services/catalog'
import type { Language } from '@/sample-app/store/appStore'
import { useAppStore } from '@/sample-app/store/appStore'
import { ThemeSettings } from '@/sample-app/components/ThemeSettings'
import { PageHeading } from '@/sample-app/components/PageHeading'
import { useAnnouncer } from '@/sample-app/accessibility/announcer'
import { formatINR } from '@/sample-app/utils/format'
import { ROUTES } from '@/sample-app/routes/paths'
import { TESTIDS } from '@/sample-app/testids'
import type { SemanticIconName } from '@/sample-app/types/oneui'
import cards from '@/sample-app/components/cards.module.css'
import styles from './AccountPage.module.css'

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी (Hindi)' },
  { id: 'mr', label: 'मराठी (Marathi)' },
]

export function AccountPage() {
  const navigate = useNavigate()
  const announce = useAnnouncer((s) => s.announce)

  const profileName = useAppStore((s) => s.profileName)
  const profileEmail = useAppStore((s) => s.profileEmail)
  const profilePhone = useAppStore((s) => s.profilePhone)
  const setProfile = useAppStore((s) => s.setProfile)

  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)

  const pushNotifications = useAppStore((s) => s.pushNotifications)
  const smsAlerts = useAppStore((s) => s.smsAlerts)
  const emailAlerts = useAppStore((s) => s.emailAlerts)
  const setPushNotifications = useAppStore((s) => s.setPushNotifications)
  const setSmsAlerts = useAppStore((s) => s.setSmsAlerts)
  const setEmailAlerts = useAppStore((s) => s.setEmailAlerts)
  const dataLimitGb = useAppStore((s) => s.dataLimitGb)
  const setDataLimitGb = useAppStore((s) => s.setDataLimitGb)
  const qaComponentInspector = useAppStore((s) => s.qaComponentInspector)
  const setQaComponentInspector = useAppStore((s) => s.setQaComponentInspector)

  const savedPlans = useAppStore((s) => s.savedPlans)
  const toggleSavedPlan = useAppStore((s) => s.toggleSavedPlan)

  const [tab, setTab] = useState('profile')
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(profileName)
  const [email, setEmail] = useState(profileEmail)
  const [phone, setPhone] = useState(profilePhone)
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  const openEdit = () => {
    setName(profileName)
    setEmail(profileEmail)
    setPhone(profilePhone)
    setEditOpen(true)
  }

  const saveProfile = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setProfile(name.trim() || profileName, email.trim() || profileEmail, phone.trim() || profilePhone)
    setSaving(false)
    setEditOpen(false)
    setSavedToast(true)
    announce('Profile updated successfully')
    setTimeout(() => setSavedToast(false), 3000)
  }

  const savedPlanDetails = PLANS.filter((p) => savedPlans.includes(p.id))

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="2" width="full" data-testid={TESTIDS.account.page}>
      <PageHeading title="My Account" subtitle="Manage your profile, settings and preferences" />

      {savedToast && (
        <Container surface="moderate" appearance="positive" padding="3" width="full" data-testid={TESTIDS.account.saveSuccess}>
          <Container surface="ghost" layout="flex" direction="row" align="center" gap="2">
            <Icon icon="checkCircle" size="4" appearance="positive" aria-hidden />
            <Text variant="body" size="S">Changes saved.</Text>
          </Container>
        </Container>
      )}

      <TabGroup value={tab} onValueChange={(v) => v != null && setTab(String(v))} aria-label="Account sections">
        <TabItem value="profile" data-testid={TESTIDS.account.tab('profile')}>Profile</TabItem>
        <TabItem value="settings" data-testid={TESTIDS.account.tab('settings')}>Settings</TabItem>
        <TabItem value="preferences" data-testid={TESTIDS.account.tab('preferences')}>Preferences</TabItem>
        <TabItem value="saved" data-testid={TESTIDS.account.tab('saved')}>Saved plans</TabItem>

        <TabPanel value="profile">
          <Container surface="elevated" layout="flex" direction="column" gap="4" padding="5" width="full" className={cards.card}>
            <Container surface="ghost" layout="flex" direction="row" align="center" gap="3" wrap>
              <Avatar content="text" alt={profileName} size="l" />
              <Container surface="ghost" layout="flex" direction="column" gap="1" align="start">
                <Text variant="title" size="M" weight="high" data-testid={TESTIDS.account.profileName}>{profileName}</Text>
                <Badge appearance="positive" size="s">Verified · Prime member</Badge>
              </Container>
            </Container>
            <Divider />
            <DetailRow label="Email" value={profileEmail} icon="mail" />
            <DetailRow label="Phone" value={profilePhone} icon="phone" />
            <Button appearance="primary" attention="high" onPress={openEdit} data-testid={TESTIDS.account.editProfileBtn}>
              Edit profile
            </Button>
          </Container>
        </TabPanel>

        <TabPanel value="settings">
          <Container surface="elevated" layout="flex" direction="column" gap="4" padding="5" width="full" className={cards.card}>
            <Text variant="title" size="S" weight="high">Notifications</Text>
            <ToggleRow
              label="Push notifications"
              hint="Recharge, offers and account alerts"
              checked={pushNotifications}
              onChange={(v) => { setPushNotifications(v); announce(`Push notifications ${v ? 'on' : 'off'}`) }}
              testId={TESTIDS.account.notifySwitch}
            />
            <ToggleRow
              label="SMS alerts"
              hint="Get a text for every transaction"
              checked={smsAlerts}
              onChange={setSmsAlerts}
              testId={TESTIDS.account.smsSwitch}
            />
            <ToggleRow
              label="Email alerts"
              hint="Monthly statements and receipts"
              checked={emailAlerts}
              onChange={setEmailAlerts}
              testId={TESTIDS.account.emailSwitch}
            />
            <Divider />
            <Text variant="title" size="S" weight="high">Daily data limit</Text>
            <Text variant="body" size="S" attention="medium">Alert me after {dataLimitGb} GB of daily usage</Text>
            <div data-testid={TESTIDS.account.dataSlider}>
              <Slider
                value={dataLimitGb}
                onValueChange={(v) => setDataLimitGb(Array.isArray(v) ? v[0] : v)}
                min={1}
                max={5}
                step={0.5}
                showSteps
                aria-label="Daily data limit in gigabytes"
              />
            </div>
          </Container>
        </TabPanel>

        <TabPanel value="preferences">
          <Container surface="elevated" layout="flex" direction="column" gap="4" padding="5" width="full" className={cards.card}>
            <Text variant="title" size="S" weight="high">Appearance</Text>
            <ThemeSettings testIdPrefix="account-theme" />
            <Divider />
            <ToggleRow
              label="Component inspector"
              hint="Hover or long-press any OneUI component to see its props and state (QA mode)"
              checked={qaComponentInspector}
              onChange={setQaComponentInspector}
              testId={TESTIDS.account.componentInfoSwitch}
            />
            <Divider />
            <Text variant="title" size="S" weight="high">Language</Text>
            <RadioGroup
              value={language}
              onValueChange={(v) => setLanguage(v as Language)}
              aria-label="Preferred language"
            >
              {LANGUAGES.map((l) => (
                <Radio key={l.id} value={l.id} label={l.label} data-testid={TESTIDS.account.languageRadio(l.id)} />
              ))}
            </RadioGroup>
          </Container>
        </TabPanel>

        <TabPanel value="saved">
          <Container surface="ghost" layout="flex" direction="column" gap="3" width="full">
            {savedPlanDetails.length === 0 ? (
              <Container surface="subtle" padding="5" width="full">
                <Text variant="body" size="M" attention="medium">No saved plans yet. Browse plans to add some.</Text>
              </Container>
            ) : (
              savedPlanDetails.map((plan) => (
                <Container
                  key={plan.id}
                  surface="elevated"
                  layout="flex"
                  direction="row"
                  justify="space-between"
                  align="center"
                  gap="3"
                  padding="4"
                  width="full"
                  className={cards.card}
                  data-testid={TESTIDS.account.savedPlan(plan.id)}
                >
                  <Container surface="ghost" layout="flex" direction="column" gap="1">
                    <Text variant="title" size="S" weight="high">{plan.name} · {formatINR(plan.price)}</Text>
                    <Text variant="body" size="S" attention="medium">
                      {plan.dataPerDay} GB/day · {plan.validityDays} days
                    </Text>
                  </Container>
                  <Container surface="ghost" layout="flex" direction="row" gap="2" align="center">
                    <Button appearance="primary" attention="high" onPress={() => navigate(ROUTES.plans)}>Recharge</Button>
                    <Button
                      appearance="primary"
                      attention="low"
                      onPress={() => { toggleSavedPlan(plan.id); announce('Removed from saved plans') }}
                      aria-label={`Remove ${plan.name} from saved`}
                    >
                      <Icon icon="delete" size="4" aria-hidden />
                    </Button>
                  </Container>
                </Container>
              ))
            )}
          </Container>
        </TabPanel>
      </TabGroup>

      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit profile"
        description="Update your personal details."
        dismissible
        footerEnd={
          <>
            <Button attention="low" onPress={() => setEditOpen(false)}>Cancel</Button>
            <Button appearance="primary" attention="high" loading={saving} onPress={saveProfile} data-testid={TESTIDS.account.profileSave}>
              Save changes
            </Button>
          </>
        }
        data-testid={TESTIDS.account.profileModal}
      >
        <Container surface="ghost" layout="flex" direction="column" gap="3">
          <InputField label="Full name" value={name} onChange={setName} fullWidth />
          <InputField label="Email" value={email} onChange={setEmail} fullWidth />
          <InputField label="Phone" value={phone} onChange={setPhone} fullWidth />
        </Container>
      </Modal>
    </Container>
  )
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon: SemanticIconName }) {
  return (
    <Container surface="ghost" layout="flex" direction="row" align="center" gap="3">
      <Icon icon={icon} size="5" appearance="informative" aria-hidden />
      <Container surface="ghost" layout="flex" direction="column" gap="0">
        <Text variant="label" size="XS" attention="medium">{label}</Text>
        <Text variant="body" size="M">{value}</Text>
      </Container>
    </Container>
  )
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  testId,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (v: boolean) => void
  testId: string
}) {
  return (
    <Container surface="subtle" layout="flex" direction="row" align="center" justify="space-between" gap="3" padding="3" width="full" className={styles.toggleRow}>
      <Container surface="ghost" layout="flex" direction="column" gap="0">
        <Text variant="body" size="M" weight="medium">{label}</Text>
        <Text variant="body" size="S" attention="medium">{hint}</Text>
      </Container>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} data-testid={testId} />
    </Container>
  )
}
