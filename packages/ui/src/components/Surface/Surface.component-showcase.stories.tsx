/**
 * Surface.component-showcase.stories.tsx
 *
 * A comprehensive showcase rendering every major UI component with multiple
 * variant combinations across all 3 mediaContext values (dynamic / dark / light).
 *
 * Each mediaContext gets a visually distinct gradient backdrop so the
 * transparent-material adaptation is immediately visible:
 *   - dynamic: rich multi-chroma gradient (unpredictable brightness) → components
 *              adapt with maximum-opacity fills to stay readable
 *   - dark:    deep dark cool gradient → components render lighter fills / text
 *   - light:   warm pale gradient → components render darker fills / text
 *
 * Rules:
 * - Token-only styling (no literal colors, pixels, or opacities)
 * - Every component is imported from its direct module path
 * - material="transparent" + mediaContext drives every Surface in this file
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import type { MediaContext } from '@oneui/shared/engine';
import { Surface } from './Surface';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Badge } from '../Badge/Badge';
import { CounterBadge } from '../CounterBadge/CounterBadge';
import { IndicatorBadge } from '../IndicatorBadge/IndicatorBadge';
import { Chip } from '../Chip/Chip';
import { Avatar } from '../Avatar/Avatar';
import { Switch } from '../Switch/Switch';
import { Checkbox } from '../Checkbox/Checkbox';
import { Slider } from '../Slider/Slider';
import { TouchSlider } from '../TouchSlider/TouchSlider';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { RadioGroup, Radio } from '../Radio/Radio';
import { RadioField } from '../RadioField/RadioField';
import { Stepper } from '../Stepper/Stepper';
import { TabGroup } from '../Tabs/TabGroup';
import { TabItem } from '../Tabs/TabItem';
import { CircularProgressIndicator } from '../CircularProgressIndicator/CircularProgressIndicator';
import { Spinner } from '../Spinner/Spinner';
import { ChipGroup } from '../ChipGroup/ChipGroup';
import { CheckboxField } from '../CheckboxField/CheckboxField';
import { Input } from '../Input/Input';
import { InputField } from '../InputField/InputField';
import { Text } from '../Text/Text';
import { Icon } from '../Icon/Icon';
import { IconContained } from '../IconContained/IconContained';
import { Image } from '../Image/Image';
import { Logo } from '../Logo/Logo';
import { Divider } from '../Divider/Divider';
import { Container } from '../Container/Container';
import { SingleTextButton } from '../SingleTextButton/SingleTextButton';
import { SelectableButton } from '../SelectableButton/SelectableButton';
import { SelectableIconButton } from '../SelectableIconButton/SelectableIconButton';
import { SelectableSingleTextButton } from '../SelectableSingleTextButton/SelectableSingleTextButton';
import { BottomNavigation } from '../BottomNavigation/BottomNavigation';
import { BottomNavItem } from '../BottomNavigation/BottomNavItem';
import { Pagination } from '../Pagination/Pagination';
import { PaginationDots } from '../PaginationDots/PaginationDots';
import { Modal } from '../Modal/Modal';
import { Tooltip } from '../Tooltip/Tooltip';

// ─── Gradient backdrops ────────────────────────────────────────────────────────

/** Demo image for Image section (same fixture as Image.stories). */
const SHOWCASE_IMAGE =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop';

const BACKDROPS: Record<MediaContext, string> = {
  dynamic:
    'radial-gradient(ellipse at 15% 25%, #0b1d6e 0%, transparent 50%), ' +
    'radial-gradient(ellipse at 85% 75%, #6d1a85 0%, transparent 50%), ' +
    'radial-gradient(ellipse at 60% 10%, #00897b 0%, transparent 45%), ' +
    'linear-gradient(135deg, #0b0d2c 0%, #1d3a8a 35%, #2a6a8a 65%, #4e1060 100%)',
  dark: 'linear-gradient(135deg, #060610 0%, #0d1b3e 40%, #162247 70%, #1e2d5a 100%)',
  light: 'linear-gradient(135deg, #fef8ef 0%, #fde7c5 30%, #fbc96e 65%, #f9a825 100%)',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--Spacing-3)',
};

const columnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-2)',
  width: '100%',
};

const ShowcaseHeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--Typography-Font-Primary)',
        fontSize: 'var(--Label-S-FontSize)',
        lineHeight: 'var(--Label-S-LineHeight)',
        fontWeight: 'var(--Label-FontWeight-Medium)',
        color: 'var(--Text-Medium)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        borderBottom: 'var(--Stroke-S) solid var(--Border-Subtle)',
        paddingBottom: 'var(--Spacing-1)',
        marginBottom: 'var(--Spacing-1-5)',
      }}
    >
      {children}
    </div>
  );
}

function ComponentGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1-5)' }}>
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  );
}

// ─── Per-component sections ────────────────────────────────────────────────────

function ButtonSection() {
  return (
    <ComponentGroup title="Button">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
        {(['primary', 'secondary', 'positive'] as const).map((appearance) => (
          <div key={appearance} style={rowStyle}>
            {(['high', 'medium', 'low'] as const).map((attention) => (
              <Button key={attention} attention={attention} appearance={appearance} size="s">
                {appearance} · {attention}
              </Button>
            ))}
          </div>
        ))}
        <div style={rowStyle}>
          <Button attention="high" appearance="negative" size="s">Negative</Button>
          <Button attention="medium" appearance="warning" size="s">Warning</Button>
          <Button attention="low" appearance="informative" size="s">Informative</Button>
          <Button attention="high" appearance="primary" size="s" disabled>Disabled</Button>
          <Button attention="high" appearance="primary" size="s" loading>Loading</Button>
        </div>
      </div>
    </ComponentGroup>
  );
}

function IconButtonSection() {
  return (
    <ComponentGroup title="IconButton">
      <div style={rowStyle}>
        {(['high', 'medium', 'low'] as const).map((attention) => (
          <IconButton
            key={attention}
            icon="settings"
            attention={attention}
            appearance="primary"
            size="s"
            aria-label={`Settings ${attention}`}
          />
        ))}
        <IconButton icon="add" attention="high" appearance="secondary" size="s" aria-label="Add" />
        <IconButton icon="delete" attention="medium" appearance="negative" size="s" aria-label="Delete" />
        <IconButton icon="info" attention="low" appearance="informative" size="s" aria-label="Info" />
        <IconButton icon="settings" attention="high" appearance="primary" size="s" disabled aria-label="Disabled" />
        <IconButton icon="settings" attention="high" appearance="primary" size="s" loading aria-label="Loading" />
      </div>
    </ComponentGroup>
  );
}

function BadgeSection() {
  return (
    <ComponentGroup title="Badge">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1-5)' }}>
        {(['sparkle', 'primary', 'positive', 'negative', 'warning', 'informative'] as const).map(
          (appearance) => (
            <div key={appearance} style={rowStyle}>
              {(['high', 'medium', 'low'] as const).map((attention) => (
                <Badge key={attention} attention={attention} appearance={appearance} size="s">
                  {appearance}
                </Badge>
              ))}
            </div>
          ),
        )}
      </div>
    </ComponentGroup>
  );
}

function CounterAndIndicatorSection() {
  return (
    <ComponentGroup title="CounterBadge · IndicatorBadge">
      <div style={rowStyle}>
        {([1, 9, 99, 999] as const).map((v) => (
          <CounterBadge key={v} value={v} size="m" aria-label={`${v} items`} />
        ))}
        <IndicatorBadge size="m" aria-label="Default indicator" />
        <IndicatorBadge size="m" appearance="positive" aria-label="Positive indicator" />
        <IndicatorBadge size="m" appearance="negative" aria-label="Negative indicator" />
        <IndicatorBadge size="m" appearance="warning" aria-label="Warning indicator" />
        <IndicatorBadge size="m" appearance="informative" aria-label="Informative indicator" />
      </div>
    </ComponentGroup>
  );
}

function ChipSection() {
  return (
    <ComponentGroup title="Chip">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1-5)' }}>
        {(['secondary', 'primary', 'sparkle'] as const).map((appearance) => (
          <div key={appearance} style={rowStyle}>
            {(['high', 'medium', 'low'] as const).map((attention) => (
              <React.Fragment key={attention}>
                <Chip attention={attention} appearance={appearance} size="m" defaultSelected>
                  {appearance} on
                </Chip>
                <Chip attention={attention} appearance={appearance} size="m" defaultSelected={false}>
                  {appearance} off
                </Chip>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </ComponentGroup>
  );
}

function AvatarSection() {
  return (
    <ComponentGroup title="Avatar">
      <div style={rowStyle}>
        {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
          <Avatar key={size} size={size} content="initials" alt={`${size} avatar`}>
            JD
          </Avatar>
        ))}
        <Avatar content="icon" alt="Icon avatar" />
        <Avatar content="initials" appearance="secondary" alt="Secondary avatar">AB</Avatar>
        <Avatar content="initials" appearance="positive" alt="Positive avatar">OK</Avatar>
        <Avatar content="initials" appearance="negative" alt="Negative avatar">NO</Avatar>
      </div>
    </ComponentGroup>
  );
}

function SwitchSection() {
  return (
    <ComponentGroup title="Switch">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1-5)' }}>
        <div style={rowStyle}>
          {(['s', 'm', 'l'] as const).map((size) => (
            <Switch key={size} size={size} defaultChecked aria-label={`${size} on`}>
              {size} on
            </Switch>
          ))}
          {(['s', 'm', 'l'] as const).map((size) => (
            <Switch key={`${size}-off`} size={size} aria-label={`${size} off`}>
              {size} off
            </Switch>
          ))}
        </div>
        <div style={rowStyle}>
          <Switch appearance="primary" defaultChecked aria-label="Primary switch">Primary</Switch>
          <Switch appearance="secondary" defaultChecked aria-label="Secondary switch">Secondary</Switch>
          <Switch appearance="sparkle" defaultChecked aria-label="Sparkle switch">Sparkle</Switch>
          <Switch disabled defaultChecked aria-label="Disabled on">Disabled on</Switch>
          <Switch disabled aria-label="Disabled off">Disabled off</Switch>
        </div>
      </div>
    </ComponentGroup>
  );
}

function CheckboxSection() {
  return (
    <ComponentGroup title="Checkbox">
      <div style={rowStyle}>
        <Checkbox defaultChecked aria-label="Checked">Checked</Checkbox>
        <Checkbox aria-label="Unchecked">Unchecked</Checkbox>
        <Checkbox defaultChecked appearance="secondary" aria-label="Secondary">Secondary</Checkbox>
        <Checkbox defaultChecked appearance="sparkle" aria-label="Sparkle">Sparkle</Checkbox>
        <Checkbox indeterminate aria-label="Indeterminate">Indeterminate</Checkbox>
        <Checkbox disabled defaultChecked aria-label="Disabled on">Disabled on</Checkbox>
        <Checkbox disabled aria-label="Disabled off">Disabled off</Checkbox>
      </div>
    </ComponentGroup>
  );
}

function SliderSection() {
  return (
    <ComponentGroup title="Slider">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <Slider defaultValue={40} aria-label="Primary slider" appearance="primary" />
        <Slider defaultValue={65} aria-label="Secondary slider" appearance="secondary" />
        <Slider defaultValue={[20, 75]} aria-label="Range slider" appearance="primary" />
        <Slider defaultValue={50} knobStyle="inside" aria-label="Inside knob" />
        <Slider defaultValue={30} disabled aria-label="Disabled slider" />
      </div>
    </ComponentGroup>
  );
}

function SpinnerSection() {
  return (
    <ComponentGroup title="Spinner">
      <div style={rowStyle}>
        {(['XS', 'S', 'M', 'L', 'XL', '2XL'] as const).map((size) => (
          <Spinner key={size} size={size} label={`${size} spinner`} />
        ))}
      </div>
    </ComponentGroup>
  );
}

function TouchSliderSection() {
  return (
    <ComponentGroup title="TouchSlider">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', width: '100%' }}>
        <TouchSlider defaultValue={35} appearance="primary" aria-label="Primary touch slider" />
        <TouchSlider defaultValue={60} appearance="secondary" progressStyle="sharp" aria-label="Secondary sharp" />
        <TouchSlider defaultValue={80} appearance="positive" aria-label="Positive touch slider" />
        <TouchSlider defaultValue={25} disabled aria-label="Disabled touch slider" />
      </div>
    </ComponentGroup>
  );
}

function SegmentedControlSection() {
  const [value, setValue] = useState('week');

  return (
    <ComponentGroup title="SegmentedControl [WIP]">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <SegmentedControl
          value={value}
          onValueChange={setValue}
          attention="high"
          trackEmphasis="high"
          aria-label="Time range"
        >
          <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
          <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
          <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
        </SegmentedControl>
        <SegmentedControl
          defaultValue="list"
          attention="medium"
          trackEmphasis="medium"
          appearance="secondary"
          aria-label="View mode"
        >
          <SegmentedControl.Item value="list">List</SegmentedControl.Item>
          <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
          <SegmentedControl.Item
            value="map"
            end={<CounterBadge value={3} size="s" aria-label="3 map pins" />}
          >
            Map
          </SegmentedControl.Item>
        </SegmentedControl>
      </div>
    </ComponentGroup>
  );
}

function RadioSection() {
  return (
    <ComponentGroup title="Radio">
      <RadioGroup defaultValue="standard" aria-label="Delivery speed">
        <Radio value="standard" label="Standard" appearance="primary" />
        <Radio value="express" label="Express" appearance="primary" />
        <Radio value="pickup" label="Pickup" appearance="secondary" disabled />
      </RadioGroup>
    </ComponentGroup>
  );
}

function StepperSection() {
  return (
    <ComponentGroup title="Stepper">
      <div style={rowStyle}>
        <Stepper defaultValue={1} size="s" aria-label="Small stepper" />
        <Stepper defaultValue={5} size="m" attention="high" appearance="primary" aria-label="Medium stepper" />
        <Stepper defaultValue={10} size="l" attention="medium" appearance="secondary" aria-label="Large stepper" />
        <Stepper defaultValue={3} disabled aria-label="Disabled stepper" />
      </div>
    </ComponentGroup>
  );
}

function TabsSection() {
  return (
    <ComponentGroup title="Tabs">
      <TabGroup defaultValue="overview" size="s" appearance="primary" aria-label="Account sections">
        <TabItem value="overview">Overview</TabItem>
        <TabItem value="billing">Billing</TabItem>
        <TabItem value="settings">Settings</TabItem>
      </TabGroup>
    </ComponentGroup>
  );
}

function CircularProgressSection() {
  return (
    <ComponentGroup title="CircularProgressIndicator">
      <div style={rowStyle}>
        <CircularProgressIndicator value={25} size="M" aria-label="25 percent" />
        <CircularProgressIndicator value={60} size="L" appearance="primary" aria-label="60 percent" />
        <CircularProgressIndicator value={90} size="L" appearance="positive" aria-label="90 percent" />
        <CircularProgressIndicator variant="indeterminate" size="M" aria-label="Loading" />
      </div>
    </ComponentGroup>
  );
}

function SingleTextButtonSection() {
  return (
    <ComponentGroup title="SingleTextButton">
      <div style={rowStyle}>
        {(['high', 'medium', 'low'] as const).map((attention) => (
          <SingleTextButton key={attention} attention={attention} size="s" aria-label={`Lang ${attention}`}>
            Ag
          </SingleTextButton>
        ))}
        <SingleTextButton attention="high" appearance="secondary" size="m" aria-label="Secondary lang">
          En
        </SingleTextButton>
        <SingleTextButton attention="high" size="s" disabled aria-label="Disabled lang">
          Hi
        </SingleTextButton>
      </div>
    </ComponentGroup>
  );
}

function SelectableButtonSection() {
  return (
    <ComponentGroup title="SelectableButton">
      <div style={rowStyle}>
        <SelectableButton defaultSelected attention="high" size="s">
          Selected
        </SelectableButton>
        <SelectableButton attention="medium" size="s">Unselected</SelectableButton>
        <SelectableButton defaultSelected attention="high" appearance="secondary" size="s">
          Secondary
        </SelectableButton>
        <SelectableButton attention="low" size="s" disabled>
          Disabled
        </SelectableButton>
      </div>
    </ComponentGroup>
  );
}

function SelectableIconButtonSection() {
  return (
    <ComponentGroup title="SelectableIconButton">
      <div style={rowStyle}>
        <SelectableIconButton
          icon={<ShowcaseHeartIcon />}
          defaultSelected
          attention="high"
          size="s"
          aria-label="Like selected"
        />
        <SelectableIconButton
          icon={<ShowcaseHeartIcon />}
          attention="medium"
          size="s"
          aria-label="Like unselected"
        />
        <SelectableIconButton
          icon={<ShowcaseHeartIcon />}
          defaultSelected
          attention="high"
          appearance="secondary"
          size="s"
          aria-label="Secondary like"
        />
        <SelectableIconButton
          icon={<ShowcaseHeartIcon />}
          size="s"
          disabled
          aria-label="Disabled like"
        />
      </div>
    </ComponentGroup>
  );
}

function SelectableSingleTextButtonSection() {
  return (
    <ComponentGroup title="SelectableSingleTextButton">
      <div style={rowStyle}>
        <SelectableSingleTextButton defaultSelected attention="high" size="s" aria-label="Ag selected">
          Ag
        </SelectableSingleTextButton>
        <SelectableSingleTextButton attention="medium" size="s" aria-label="En unselected">
          En
        </SelectableSingleTextButton>
        <SelectableSingleTextButton defaultSelected attention="high" appearance="secondary" size="s" aria-label="Hi secondary">
          Hi
        </SelectableSingleTextButton>
      </div>
    </ComponentGroup>
  );
}

function ChipGroupSection() {
  return (
    <ComponentGroup title="ChipGroup">
      <ChipGroup defaultValue="all" size="s">
        <Chip value="all">All</Chip>
        <Chip value="news">News</Chip>
        <Chip value="sport">Sport</Chip>
        <Chip value="tech">Tech</Chip>
      </ChipGroup>
    </ComponentGroup>
  );
}

function TextSection() {
  return (
    <ComponentGroup title="Text">
      <div style={columnStyle}>
        <Text variant="body" size="M" weight="low">
          Body text adapts to surface context automatically.
        </Text>
        <div style={rowStyle}>
          <Text variant="label" size="S" appearance="primary" weight="medium">Primary</Text>
          <Text variant="label" size="S" appearance="secondary" weight="medium">Secondary</Text>
          <Text variant="label" size="S" appearance="positive" weight="medium">Positive</Text>
          <Text variant="label" size="S" appearance="negative" weight="medium">Negative</Text>
        </div>
      </div>
    </ComponentGroup>
  );
}

function IconSection() {
  return (
    <ComponentGroup title="Icon">
      <div style={rowStyle}>
        <Icon icon="home" size="5" appearance="primary" />
        <Icon icon="settings" size="5" appearance="secondary" />
        <Icon icon="info" size="5" appearance="informative" emphasis="medium" />
        <Icon icon="warning" size="5" appearance="warning" />
        <Icon icon="check" size="5" appearance="positive" />
        <Icon icon="close" size="5" appearance="negative" />
      </div>
    </ComponentGroup>
  );
}

function IconContainedSection() {
  return (
    <ComponentGroup title="IconContained">
      <div style={rowStyle}>
        <IconContained icon="home" size="s" attention="high" appearance="primary" />
        <IconContained icon="settings" size="s" attention="medium" appearance="secondary" />
        <IconContained icon="info" size="s" attention="high" appearance="informative" />
        <IconContained icon="check" size="s" attention="medium" appearance="positive" />
        <IconContained icon="close" size="s" attention="high" appearance="negative" disabled />
      </div>
    </ComponentGroup>
  );
}

function ImageSection() {
  return (
    <ComponentGroup title="Image">
      <div style={rowStyle}>
        <Image src={SHOWCASE_IMAGE} alt="Landscape preview" aspectRatio="16:9" width={120} />
        <Image src={SHOWCASE_IMAGE} alt="Square preview" aspectRatio="1:1" width={80} />
        <Image src={SHOWCASE_IMAGE} alt="Disabled preview" aspectRatio="1:1" width={80} disabled />
      </div>
    </ComponentGroup>
  );
}

function LogoSection() {
  return (
    <ComponentGroup title="Logo">
      <div style={rowStyle}>
        <Logo size="s" alt="Brand mark small" />
        <Logo size="m" alt="Brand mark medium" />
        <Logo variant="full" size="m" alt="Brand logo full" />
      </div>
    </ComponentGroup>
  );
}

function DividerSection() {
  return (
    <ComponentGroup title="Divider">
      <div style={columnStyle}>
        <Divider />
        <Divider attention="medium">Section label</Divider>
        <Divider attention="low" appearance="primary" />
      </div>
    </ComponentGroup>
  );
}

function ContainerSection() {
  return (
    <ComponentGroup title="Container">
      <Container variant="fluid" padding="m" style={{ width: '100%' }}>
        <Text variant="body" size="S" weight="low">
          Fluid container with token padding — content inherits surface context from the parent card.
        </Text>
      </Container>
    </ComponentGroup>
  );
}

function InputSection() {
  return (
    <ComponentGroup title="Input">
      <div style={columnStyle}>
        <Input placeholder="Standalone input" size="m" aria-label="Standalone input" />
        <Input placeholder="Primary appearance" size="m" appearance="primary" aria-label="Primary input" />
        <Input placeholder="Disabled" size="m" disabled aria-label="Disabled input" />
      </div>
    </ComponentGroup>
  );
}

function InputFieldSection() {
  return (
    <ComponentGroup title="InputField">
      <div style={columnStyle}>
        <InputField label="Email" placeholder="name@example.com" size="m" />
        <InputField
          label="Promo code"
          placeholder="Enter code"
          size="m"
          appearance="secondary"
          description="Optional field description."
        />
        <InputField label="Read only" defaultValue="Locked value" size="m" readOnly />
      </div>
    </ComponentGroup>
  );
}

function CheckboxFieldSection() {
  return (
    <ComponentGroup title="CheckboxField">
      <div style={columnStyle}>
        <CheckboxField label="Send me product news" size="m" defaultChecked />
        <CheckboxField label="Marketing emails" size="m" appearance="secondary" />
        <CheckboxField label="Disabled option" size="m" disabled />
      </div>
    </ComponentGroup>
  );
}

function RadioFieldSection() {
  return (
    <ComponentGroup title="RadioField">
      <div style={columnStyle}>
        <RadioField label="Enable push notifications" defaultValue="on" name="push-showcase" />
        <RadioField label="Delivery speed" defaultValue="standard" name="delivery-showcase">
          <Radio value="standard" label="Standard" />
          <Radio value="express" label="Express" />
        </RadioField>
      </div>
    </ComponentGroup>
  );
}

function BottomNavigationSection() {
  return (
    <ComponentGroup title="BottomNavigation">
      <div style={{ width: '100%', maxWidth: 'min(100%, 360px)' }}>
        <BottomNavigation defaultValue="home" appearance="primary" aria-label="Main navigation">
          <BottomNavItem value="home" icon="home" label="Home" />
          <BottomNavItem value="search" icon="search" label="Search" />
          <BottomNavItem value="profile" icon="user" label="Profile" />
        </BottomNavigation>
      </div>
    </ComponentGroup>
  );
}

function PaginationSection() {
  return (
    <ComponentGroup title="Pagination">
      <Pagination totalPages={7} defaultPage={3} size="s" attention="medium" aria-label="Page navigation" />
    </ComponentGroup>
  );
}

function PaginationDotsSection() {
  return (
    <ComponentGroup title="PaginationDots">
      <div style={rowStyle}>
        <PaginationDots pageCount={5} defaultActiveIndex={1} aria-label="Slide indicator" />
        <PaginationDots pageCount={8} defaultActiveIndex={3} appearance="secondary" aria-label="Secondary dots" />
        <PaginationDots pageCount={4} defaultActiveIndex={0} readOnly aria-label="Read-only dots" />
      </div>
    </ComponentGroup>
  );
}

function ModalSection() {
  const [open, setOpen] = useState(false);

  return (
    <ComponentGroup title="Modal">
      <div style={rowStyle}>
        <Button attention="medium" size="s" onPress={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          size="S"
          title="Transparent context"
          description="Modal chrome adapts when opened from a glass surface."
          showDescription
          footerEnd={(
            <Button attention="high" size="s" onPress={() => setOpen(false)}>
              Done
            </Button>
          )}
        >
          <Text variant="body" size="S" weight="low">
            Sample modal body — verify header, body, and footer tokens inside transparent material.
          </Text>
        </Modal>
      </div>
    </ComponentGroup>
  );
}

function TooltipSection() {
  return (
    <ComponentGroup title="Tooltip">
      <div style={rowStyle}>
        <Tooltip content="Helpful context on hover or focus">
          <Button attention="medium" size="s">Hover me</Button>
        </Tooltip>
        <Tooltip content="Longer guidance copy for glass overlays" position="bottom">
          <Button attention="low" size="s">Bottom tip</Button>
        </Tooltip>
        <Tooltip content="Icon trigger tooltip">
          <IconButton icon="info" attention="low" size="s" aria-label="More info" />
        </Tooltip>
      </div>
    </ComponentGroup>
  );
}

// ─── All-components panel (inside one surface card) ───────────────────────────

function AllComponents() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      <ButtonSection />
      <IconButtonSection />
      <SingleTextButtonSection />
      <SelectableButtonSection />
      <SelectableIconButtonSection />
      <SelectableSingleTextButtonSection />
      <BadgeSection />
      <CounterAndIndicatorSection />
      <ChipSection />
      <ChipGroupSection />
      <AvatarSection />
      <TextSection />
      <IconSection />
      <IconContainedSection />
      <ImageSection />
      <LogoSection />
      <DividerSection />
      <ContainerSection />
      <SwitchSection />
      <CheckboxSection />
      <CheckboxFieldSection />
      <InputSection />
      <InputFieldSection />
      <RadioSection />
      <RadioFieldSection />
      <SliderSection />
      <TouchSliderSection />
      <StepperSection />
      <TabsSection />
      <BottomNavigationSection />
      <PaginationSection />
      <PaginationDotsSection />
      <CircularProgressSection />
      <SpinnerSection />
      <ModalSection />
      <TooltipSection />
      <SegmentedControlSection />
    </div>
  );
}

// ─── Surface card ──────────────────────────────────────────────────────────────

const SHOWCASE_MODES = ['ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] as const;

function SurfaceCard({
  mode,
  mediaContext,
}: {
  mode: (typeof SHOWCASE_MODES)[number];
  mediaContext: MediaContext;
}) {
  return (
    <Surface
      mode={mode}
      material="transparent"
      mediaContext={mediaContext}
      style={{
        padding: 'var(--Spacing-5)',
        borderRadius: 'var(--Shape-M)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Label-S-FontSize)',
          lineHeight: 'var(--Label-S-LineHeight)',
          fontWeight: 'var(--Label-FontWeight-Medium)',
          color: 'var(--Text-Medium)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          paddingBottom: 'var(--Spacing-1-5)',
          borderBottom: 'var(--Stroke-M) solid var(--Border-Subtle)',
        }}
      >
        surface: <strong style={{ color: 'var(--Text-High)' }}>{mode}</strong>
      </div>
      <AllComponents />
    </Surface>
  );
}

// ─── Media context banner ──────────────────────────────────────────────────────

const CTX_DESCRIPTIONS: Record<MediaContext, string> = {
  dynamic:
    'Dynamic — rich multi-chroma mixed-brightness backdrop. Components use maximum-opacity transparent fills to guarantee readability against unpredictable imagery.',
  dark:
    'Dark — deep cool blue gradient. Transparent fills resolve to pale overlays so fills and text read lighter against the dark background.',
  light:
    'Light — warm amber-cream gradient. Transparent fills resolve to darker overlays so fills and text read darker against the light background.',
};

function MediaContextBanner({ ctx }: { ctx: MediaContext }) {
  const isDark = ctx !== 'light';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Headline-S-FontSize)',
          lineHeight: 'var(--Headline-S-LineHeight)',
          fontWeight: 'var(--Headline-S-FontWeight)',
          color: isDark ? '#fff' : '#111',
        }}
      >
        mediaContext=&quot;{ctx}&quot;
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Body-S-FontSize)',
          lineHeight: 'var(--Body-S-LineHeight)',
          fontWeight: 'var(--Body-FontWeight-Low)',
          color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
          maxWidth: '72ch',
        }}
      >
        {CTX_DESCRIPTIONS[ctx]}
      </p>
    </div>
  );
}

// ─── Media context section ─────────────────────────────────────────────────────

function MediaContextSection({ ctx }: { ctx: MediaContext }) {
  return (
    <section
      aria-label={`${ctx} media context showcase`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-5)',
        padding: 'var(--Spacing-6)',
        borderRadius: 'var(--Shape-L)',
        background: BACKDROPS[ctx],
      }}
    >
      <MediaContextBanner ctx={ctx} />
      {/* Surface grid — two columns on wide viewports, one on narrow */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 'var(--Spacing-4)',
        }}
      >
        {SHOWCASE_MODES.map((mode) => (
          <SurfaceCard key={mode} mode={mode} mediaContext={ctx} />
        ))}
      </div>
    </section>
  );
}

// ─── Root page ─────────────────────────────────────────────────────────────────

function ComponentShowcasePage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-8)',
        padding: 'var(--Spacing-6)',
        background: 'var(--Surface-Default)',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Headline-L-FontSize)',
            lineHeight: 'var(--Headline-L-LineHeight)',
            fontWeight: 'var(--Headline-L-FontWeight)',
            color: 'var(--Text-High)',
          }}
        >
          Transparent Material · Component Showcase
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-M-FontSize)',
            lineHeight: 'var(--Body-M-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Low)',
            color: 'var(--Text-Medium)',
            maxWidth: '80ch',
          }}
        >
          Every released `@oneui/ui` component plus WIP extras (Spinner, SegmentedControl) rendered with
          representative variant combinations inside transparent-material surfaces across all three{' '}
          <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>mediaContext</code> values.
          The gradient backdrops simulate real-world use-cases (hero photography, brand splash
          screens, and light content backgrounds) and make per-mode fill adaptation immediately
          visible.
        </p>
      </header>

      <MediaContextSection ctx="dynamic" />
      <MediaContextSection ctx="dark" />
      <MediaContextSection ctx="light" />
    </div>
  );
}

// ─── Storybook meta & export ───────────────────────────────────────────────────

const meta: Meta = {
  title: 'Components/Containers/Surface/Component Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Comprehensive transparent-material component showcase. Renders every component from `releasedComponents.ts` (36 released) plus WIP Spinner and SegmentedControl across 6 surface modes and 3 media contexts. Gradient backdrops visually expose per-mode fill differences.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const AllComponentsAllContexts: Story = {
  name: 'All Components · All Media Contexts',
  parameters: {
    docs: {
      description: {
        story:
          'All released components with representative attention levels, appearances, and states inside every transparent-material surface mode. WIP Spinner and SegmentedControl included at the end. Dynamic context uses a saturated multi-chroma gradient; dark context produces lighter fills/text; light context produces darker fills/text.',
      },
    },
  },
  render: () => <ComponentShowcasePage />,
};
