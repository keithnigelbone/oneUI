import { useState } from 'react'
import {
  Avatar,
  Badge,
  BottomNavItem,
  BottomNavigation,
  Button,
  Checkbox,
  CheckboxField,
  Chip,
  ChipGroup,
  CircularProgressIndicator,
  Container,
  CounterBadge,
  Divider,
  Icon,
  IconButton,
  IconContained,
  Image,
  IndicatorBadge,
  Input,
  InputDynamicText,
  InputFeedback,
  InputField,
  Logo,
  Modal,
  Pagination,
  PaginationDots,
  Radio,
  RadioField,
  RadioGroup,
  SelectableButton,
  SelectableIconButton,
  SelectableSingleTextButton,
  SingleTextButton,
  Slider,
  Stepper,
  Switch,
  TabGroup,
  TabItem,
  TabPanel,
  Text,
  TouchSlider,
  Tooltip,
} from '@/debug/oneui'
import { PageHeading } from '@/sample-app/components/PageHeading'
import { ShowcaseRow, ShowcaseSection } from '@/sample-app/components/showcase/ShowcaseSection'
import { TESTIDS } from '@/sample-app/testids'
import cards from '@/sample-app/components/cards.module.css'
import showcaseStyles from '@/sample-app/components/showcase/ShowcaseSection.module.css'

const FILTER_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'popular', label: 'Popular' },
  { id: 'new', label: 'New' },
]

export function ComponentShowcasePage() {
  const [nav, setNav] = useState('home')
  const [tab, setTab] = useState('inputs')
  const [chip, setChip] = useState<string[]>(['all'])
  const [checkbox, setCheckbox] = useState(true)
  const [checkboxField, setCheckboxField] = useState(false)
  const [switchOn, setSwitchOn] = useState(true)
  const [radio, setRadio] = useState('prepaid')
  const [radioField, setRadioField] = useState('daily')
  const [standaloneInput, setStandaloneInput] = useState('')
  const [fieldInput, setFieldInput] = useState('')
  const [slider, setSlider] = useState(3)
  const [touchSlider, setTouchSlider] = useState(40)
  const [page, setPage] = useState(2)
  const [dot, setDot] = useState(1)
  const [selectable, setSelectable] = useState(true)
  const [selectIcon, setSelectIcon] = useState(false)
  const [selectText, setSelectText] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [qty, setQty] = useState(1)

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="6" width="full" data-testid={TESTIDS.showcase.page}>
      <PageHeading
        title="OneUI Component Showcase"
        subtitle="Canonical samples for QA validation — every listed JDS / OneUI component with representative props and states."
      />

      <ShowcaseSection id="brand-layout" title="Brand & layout" subtitle="Logo, Container (ghost inherits parent surface), Text, Divider">
        <ShowcaseRow label="Logo">
          <Logo variant="mark" size="m" alt="Jio mark">
            <span className={showcaseStyles.logoMark}>J</span>
          </Logo>
          <Logo variant="full" size="s" alt="Jio full wordmark">
            <Text variant="title" size="S" weight="high">Jio</Text>
          </Logo>
        </ShowcaseRow>
        <ShowcaseRow label="Container">
          <Container surface="ghost" padding="4" layout="flex" direction="column" gap="2">
            <Text variant="body" size="S">surface=ghost · inherits parent (no new fill)</Text>
          </Container>
          <Container surface="subtle" padding="4" layout="flex" direction="column" gap="2">
            <Text variant="body" size="S">surface=subtle · padding=4</Text>
          </Container>
          <Container surface="elevated" padding="4" layout="flex" direction="column" gap="2">
            <Text variant="body" size="S">surface=elevated</Text>
          </Container>
        </ShowcaseRow>
        <ShowcaseRow label="Text">
          <Text variant="display" size="S" weight="high">Display S</Text>
          <Text variant="headline" size="S" weight="high">Headline S</Text>
          <Text variant="body" size="M" attention="medium">Body M medium</Text>
          <Text variant="label" size="S" weight="medium">Label S</Text>
        </ShowcaseRow>
        <Divider />
      </ShowcaseSection>

      <ShowcaseSection id="navigation" title="Navigation" subtitle="BottomNavigation, BottomNavItem (BottomNavigation.Item), Tabs">
        <ShowcaseRow label="BottomNavigation + BottomNavItem">
          <div className={showcaseStyles.bottomNavDemo}>
            <BottomNavigation aria-label="Showcase bottom nav" value={nav} onValueChange={(v) => v && setNav(v)} appearance="primary">
              <BottomNavItem value="home" icon="home" label="Home" />
              <BottomNavItem value="plans" icon="smartphone" label="Plans" />
              <BottomNavItem value="rewards" icon="star" label="Rewards" />
            </BottomNavigation>
          </div>
        </ShowcaseRow>
        <ShowcaseRow label="Tabs (TabGroup + TabItem + TabPanel)">
          <TabGroup value={tab} onValueChange={(v) => v && setTab(String(v))} aria-label="Showcase tabs">
            <TabItem value="inputs">Inputs</TabItem>
            <TabItem value="actions">Actions</TabItem>
            <TabItem value="feedback">Feedback</TabItem>
            <TabPanel value="inputs">
              <Text variant="body" size="S">Input family samples are in the Form controls section below.</Text>
            </TabPanel>
            <TabPanel value="actions">
              <Text variant="body" size="S">Button and selectable control samples below.</Text>
            </TabPanel>
            <TabPanel value="feedback">
              <Text variant="body" size="S">Badge, tooltip, and progress samples below.</Text>
            </TabPanel>
          </TabGroup>
        </ShowcaseRow>
      </ShowcaseSection>

      <ShowcaseSection id="actions" title="Actions" subtitle="Button, IconButton, selectable and text buttons">
        <ShowcaseRow label="Button">
          <Button appearance="primary" attention="high" size="l">Primary L</Button>
          <Button attention="medium" size="m">Secondary M</Button>
          <Button attention="low" size="s">Low S</Button>
          <Button appearance="primary" attention="high" loading>Loading</Button>
          <Button attention="high" disabled>Disabled</Button>
        </ShowcaseRow>
        <ShowcaseRow label="IconButton">
          <IconButton icon="bookmark" aria-label="Bookmark" attention="low" />
          <IconButton icon="notification" aria-label="Notify" attention="medium" />
          <IconButton icon="settings" aria-label="Settings" disabled />
        </ShowcaseRow>
        <ShowcaseRow label="SelectableButton">
          <SelectableButton selected={selectable} onSelectedChange={setSelectable}>Selectable</SelectableButton>
        </ShowcaseRow>
        <ShowcaseRow label="SelectableIconButton">
          <SelectableIconButton icon="star" aria-label="Favourite" selected={selectIcon} onSelectedChange={setSelectIcon} />
        </ShowcaseRow>
        <ShowcaseRow label="SelectableSingleTextButton">
          <SelectableSingleTextButton selected={selectText} onSelectedChange={setSelectText}>Toggle me</SelectableSingleTextButton>
        </ShowcaseRow>
        <ShowcaseRow label="SingleTextButton">
          <SingleTextButton>Text action</SingleTextButton>
        </ShowcaseRow>
      </ShowcaseSection>

      <ShowcaseSection id="form-controls" title="Form controls" subtitle="Input, InputField, Checkbox, CheckboxField, Radio, RadioField, Switch, Slider, TouchSlider, Stepper">
        <div className={showcaseStyles.stack}>
          <ShowcaseRow label="Input (standalone bordered control)">
            <Input
              aria-label="Standalone Input"
              value={standaloneInput}
              onChange={setStandaloneInput}
              placeholder="Type here"
              start={<Icon icon="search" size="4" aria-hidden />}
            />
          </ShowcaseRow>

          <ShowcaseRow label="InputField">
            <InputField
              label="InputField"
              description="Full field with label stack"
              value={fieldInput}
              onChange={setFieldInput}
              placeholder="Email address"
              required
              fullWidth
            />
          </ShowcaseRow>

          <ShowcaseRow label="InputField + error (uses InputFeedback internally)">
            <InputField label="With validation error" error="Enter a valid email address" fullWidth defaultValue="not-an-email" />
          </ShowcaseRow>

          <ShowcaseRow label="InputField + dynamicText (uses InputDynamicText internally)">
            <InputField
              label="With helper row"
              dynamicText="Maximum 140 characters"
              helperButton="Clear"
              fullWidth
            />
          </ShowcaseRow>

          <ShowcaseRow label="InputFeedback [internal part]">
            <InputFeedback variant="negative" feedback_message="Negative feedback message" />
            <InputFeedback variant="positive" feedback_message="Positive feedback message" />
          </ShowcaseRow>

          <ShowcaseRow label="InputDynamicText [internal part]">
            <InputDynamicText content="Helper copy with trailing action" end="Action" onEndClick={() => undefined} />
          </ShowcaseRow>

          <ShowcaseRow label="Checkbox">
            <Checkbox label="Standalone Checkbox" checked={checkbox} onCheckedChange={setCheckbox} />
            <Checkbox label="Disabled" disabled defaultChecked />
            <Checkbox label="Read only" readOnly checked />
          </ShowcaseRow>

          <ShowcaseRow label="CheckboxField">
            <CheckboxField
              label="CheckboxField with description"
              description="Field wrapper integrates label, validation, and feedback"
              checked={checkboxField}
              onCheckedChange={setCheckboxField}
            />
          </ShowcaseRow>

          <ShowcaseRow label="Radio + RadioGroup">
            <RadioGroup value={radio} onValueChange={setRadio} aria-label="Plan type">
              <Radio value="prepaid" label="Prepaid" />
              <Radio value="postpaid" label="Postpaid" />
            </RadioGroup>
          </ShowcaseRow>

          <ShowcaseRow label="RadioField">
            <RadioField
              label="Notification frequency"
              description="RadioField composes label stack + RadioGroup"
              value={radioField}
              onValueChange={setRadioField}
              required
              fullWidth
            >
              <Radio value="daily" label="Daily" />
              <Radio value="weekly" label="Weekly" />
              <Radio value="monthly" label="Monthly" />
            </RadioField>
          </ShowcaseRow>

          <ShowcaseRow label="Switch">
            <Switch checked={switchOn} onCheckedChange={setSwitchOn} aria-label="Enable notifications" />
            <Switch defaultChecked={false} disabled aria-label="Disabled switch" />
          </ShowcaseRow>

          <ShowcaseRow label="Slider">
            <Slider
              value={slider}
              onValueChange={(v) => setSlider(Array.isArray(v) ? v[0] : v)}
              min={1}
              max={5}
              step={1}
              showSteps
              aria-label="Data limit in GB"
            />
          </ShowcaseRow>

          <ShowcaseRow label="TouchSlider">
            <TouchSlider
              value={touchSlider}
              onValueChange={(v) => setTouchSlider(Array.isArray(v) ? v[0] : v)}
              min={0}
              max={100}
              aria-label="Touch slider volume"
            />
          </ShowcaseRow>

          <ShowcaseRow label="Stepper">
            <Stepper value={qty} onChange={(_event, value) => setQty(value ?? 1)} min={1} max={9} aria-label="Quantity" />
          </ShowcaseRow>
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="selection" title="Selection" subtitle="Chip, ChipGroup">
        <ShowcaseRow label="ChipGroup + Chip">
          <ChipGroup value={chip} onValueChange={setChip} aria-label="Filter showcase chips">
            {FILTER_CHIPS.map((c) => (
              <Chip key={c.id} value={c.id}>{c.label}</Chip>
            ))}
          </ChipGroup>
        </ShowcaseRow>
      </ShowcaseSection>

      <ShowcaseSection id="media" title="Media & icons" subtitle="Avatar, Image, Icon, IconContained">
        <ShowcaseRow label="Avatar">
          <Avatar content="text" alt="Demo user" size="s" />
          <Avatar content="text" alt="Demo user" size="m" />
        </ShowcaseRow>
        <ShowcaseRow label="Image">
          <Image src="https://picsum.photos/seed/showcase/120/120" alt="Sample product" width={120} height={120} />
        </ShowcaseRow>
        <ShowcaseRow label="Icon">
          <Icon icon="home" size="4" aria-hidden />
          <Icon icon="star" size="5" appearance="warning" aria-hidden />
        </ShowcaseRow>
        <ShowcaseRow label="IconContained">
          <IconContained icon="smartphone" size="m" appearance="primary" aria-hidden />
          <IconContained icon="tv" size="l" appearance="secondary" aria-hidden />
        </ShowcaseRow>
      </ShowcaseSection>

      <ShowcaseSection id="feedback" title="Feedback & overlay" subtitle="Badge, CounterBadge, IndicatorBadge, Tooltip, Modal, CircularProgressIndicator">
        <ShowcaseRow label="Badge">
          <Badge variant="subtle" appearance="primary" attention="high">Primary</Badge>
          <Badge variant="subtle" appearance="positive" attention="medium">Positive</Badge>
          <Badge variant="subtle" appearance="negative" attention="medium">Negative</Badge>
        </ShowcaseRow>
        <ShowcaseRow label="CounterBadge">
          <CounterBadge value={3} appearance="primary" size="s" aria-label="3 items" />
          <CounterBadge value={12} appearance="negative" size="m" aria-label="12 alerts" />
        </ShowcaseRow>
        <ShowcaseRow label="IndicatorBadge">
          <IndicatorBadge appearance="positive" size="m" aria-label="Online" />
          <IndicatorBadge appearance="negative" size="s" aria-label="Busy" />
          <IndicatorBadge appearance="warning" size="l" aria-label="Away" />
        </ShowcaseRow>
        <ShowcaseRow label="Tooltip">
          <Tooltip content="Tooltip on hover" side="top">
            <Button attention="low">Hover for tooltip</Button>
          </Tooltip>
        </ShowcaseRow>
        <ShowcaseRow label="Modal">
          <Button appearance="primary" attention="high" onPress={() => setModalOpen(true)} data-testid={TESTIDS.showcase.modalOpen}>
            Open modal
          </Button>
          <Modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title="Sample modal"
            description="Modal overlay with dismissible footer actions."
            dismissible
            footerEnd={
              <Button appearance="primary" attention="high" onPress={() => setModalOpen(false)}>
                Done
              </Button>
            }
            data-testid={TESTIDS.showcase.modal}
          >
            <Text variant="body" size="M">Use this pattern for confirmations and forms.</Text>
          </Modal>
        </ShowcaseRow>
        <ShowcaseRow label="CircularProgressIndicator">
          <CircularProgressIndicator variant="indeterminate" size="L" aria-label="Loading" />
          <CircularProgressIndicator variant="determinate" value={65} size="M" content="text" aria-label="65 percent" />
        </ShowcaseRow>
      </ShowcaseSection>

      <ShowcaseSection id="pagination" title="Pagination" subtitle="Pagination, PaginationDots">
        <ShowcaseRow label="Pagination">
          <Pagination totalPages={5} page={page} onPageChange={setPage} aria-label="Showcase pagination" />
        </ShowcaseRow>
        <ShowcaseRow label="PaginationDots">
          <PaginationDots pageCount={5} activeIndex={dot} onActiveIndexChange={setDot} aria-label="Carousel dots" />
        </ShowcaseRow>
      </ShowcaseSection>

      <Container surface="subtle" padding="4" width="full" className={cards.card}>
        <Text variant="body" size="S" attention="medium">
          Hover any component with QA inspector enabled (Account → Preferences) to see live props.
          Coverage metrics update when you run <code>pnpm run coverage:analyze</code>.
        </Text>
      </Container>
    </Container>
  )
}
