/**
 * ListItemGroup.stories.tsx
 *
 * The ListItemGroup primitive is a thin layout shell. The 6 compositions
 * below reproduce the Figma variants (ContactProfile, Address, Media,
 * Settings, ProductListing) one-to-one without introducing new code
 * exports — this is the design-system "primitive vs pattern" split.
 *
 * Figma references (file F7KEYdO8R8Nbe2N4gI8dIU):
 *   Default         → 2429-14645
 *   ContactProfile  → 2429-14734
 *   Address         → 2429-14823
 *   Media           → 2429-14913
 *   Settings        → 2429-15002
 *   ProductListing  → 2429-15091
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ListItemGroup } from './ListItemGroup';
import { ListItem } from '../ListItem';
import { Icon } from '../../icons/Icon';
import { Avatar } from '../Avatar';
import { Image } from '../Image';
import { Switch } from '../Switch';
import { Stepper } from '../Stepper';
import { IconButton } from '../IconButton';

const meta = {
  title: 'Components/Display/ListItemGroup [WIP]',
  component: ListItemGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A layout shell that stacks <ListItem> children with an optional top `sectionDivider` and `inset` framing. Per-row dividers are owned by each <ListItem> via its `divider` prop — the group does not inject state into children. The 6 stories below reproduce the Figma "micropattern" variants (ContactProfile, Address, Media, Settings, ProductListing) using only this single primitive.',
      },
    },
  },
  argTypes: {
    sectionDivider: {
      control: 'boolean',
      description: 'Top edge-to-edge hairline above the first row',
      table: { defaultValue: { summary: 'true' } },
    },
    container: {
      control: 'radio',
      options: ['fullWidth', 'inset'],
      table: { defaultValue: { summary: 'fullWidth' } },
    },
    divider: {
      control: 'radio',
      options: ['none', 'full', 'inset'],
      description:
        'Inter-row divider injected into all <ListItem> children. Per-child `divider` overrides this.',
      table: { defaultValue: { summary: 'inset' } },
    },
    role: {
      control: 'radio',
      options: ['group', 'list', 'menu'],
      table: { defaultValue: { summary: 'group' } },
    },
  },
} satisfies Meta<typeof ListItemGroup>;

export default meta;
type Story = StoryObj<typeof ListItemGroup>;

/** Phone-frame-ish width so Storybook renders the groups like they appear in-app. */
function GroupFrame({ children, width = 360 }: { children: React.ReactNode; width?: number }) {
  return <div style={{ width, paddingBlock: 'var(--Spacing-3-5)' }}>{children}</div>;
}

// =============================================================================
// 1. Default — the base Figma pattern (2429-14645)
// =============================================================================

export const Default: Story = {
  name: 'Default',
  render: () => (
    <GroupFrame>
      <ListItemGroup aria-label="Items" container="inset" sectionDivider={false}>
        <ListItem
          title="Title"
          supportText="Support text"
          supportStart={<Icon name="heart" />}
          start={<Icon name="heart" />}
          end={<Icon name="chevronRight" />}
          divider="inset"
          onClick={() => undefined}
        />
        <ListItem
          selected="medium"
          title="Title"
          supportText="Support text"
          supportStart={<Icon name="heart" />}
          start={<Icon name="heart" />}
          end={<Icon name="chevronRight" />}
          divider="inset"
          onClick={() => undefined}
        />
        <ListItem
          title="Title"
          supportText="Support text"
          supportStart={<Icon name="heart" />}
          start={<Icon name="heart" />}
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
      </ListItemGroup>
    </GroupFrame>
  ),
};

// =============================================================================
// 2. ContactProfile — contact card with phone/WhatsApp actions (2429-14734)
// =============================================================================

/** Inline timestamp + filled phone IconButton — primary action sits to the right of muted metadata. */
function ContactEnd({ time }: { time: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
      <span
        style={{
          fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
          fontSize: 'var(--Label-S-FontSize)',
          lineHeight: 'var(--Label-S-LineHeight)',
          color: 'var(--Text-Low)',
        }}
      >
        {time}
      </span>
      <IconButton
        icon="phone"
        aria-label="Call back"
        attention="medium"
        size="s"
        appearance="primary"
      />
    </div>
  );
}

/** Wrap a supportStart icon in a per-row semantic colour. The supportSlot inherits
    --_li-accent (Secondary) by default; setting --Icon-color/colour locally promotes
    the icon to a positive/informative role for call-type semantics. */
function SemanticSupportIcon({
  icon,
  role,
}: {
  icon: React.ReactNode;
  role: 'secondary' | 'positive' | 'informative';
}) {
  const colourMap: Record<typeof role, string> = {
    secondary: 'var(--Secondary-Tinted)',
    positive: 'var(--Positive-Tinted)',
    informative: 'var(--Informative-Tinted)',
  };
  return (
    <span
      style={
        {
          color: colourMap[role],
          ['--Icon-color' as string]: colourMap[role],
          display: 'inline-flex',
        } as React.CSSProperties
      }
    >
      {icon}
    </span>
  );
}

export const ContactProfile: Story = {
  name: 'ContactProfile',
  render: () => (
    <GroupFrame>
      <ListItemGroup aria-label="Contact actions" container="inset" sectionDivider={false}>
        <ListItem
          start={<Avatar content="image" size="xl" src="https://i.pravatar.cc/80?img=47" alt="Pannu Tulshiram" appearance="secondary" />}
          startSize="L"
          title="Pannu Tulshiram"
          supportText="Other"
          supportStart={<SemanticSupportIcon role="secondary" icon={<Icon name="user" />} />}
          end={<ContactEnd time="10:20 AM" />}
          divider="inset"
          onClick={() => undefined}
        />
        <ListItem
          start={<Avatar content="icon" size="xl" icon={<Icon name="user" />} attention="medium" appearance="secondary" />}
          startSize="L"
          title="+91 99999 99999"
          supportText="India"
          supportStart={<SemanticSupportIcon role="positive" icon={<Icon name="location" />} />}
          end={<ContactEnd time="Yesterday" />}
          divider="inset"
          onClick={() => undefined}
        />
        <ListItem
          start={<Avatar content="text" size="xl" alt="Nathan" appearance="secondary" />}
          startSize="L"
          title="Nathan"
          supportText="WhatsApp Call"
          supportStart={<SemanticSupportIcon role="informative" icon={<Icon name="chat" />} />}
          end={<ContactEnd time="Thursday" />}
          onClick={() => undefined}
        />
      </ListItemGroup>
    </GroupFrame>
  ),
};

// =============================================================================
// 3. Address — saved addresses with multi-line support (2429-14823)
// =============================================================================

export const Address: Story = {
  name: 'Address',
  render: () => (
    <GroupFrame>
      <ListItemGroup aria-label="Saved addresses" container="inset" sectionDivider={false}>
        <ListItem
          start={<Icon name="home" />}
          startSize="M"
          slotAlignment="top"
          title="Home"
          supportText="A2024, Jimmie Esplanda, Koramangala, Bengaluru"
          end={<Icon name="chevronRight" />}
          divider="inset"
          onClick={() => undefined}
        />
        <ListItem
          start={<Icon name="folder" />}
          startSize="M"
          slotAlignment="top"
          title="Work"
          supportText="Reliance Jio, Avana Building, Sarjapur road, Bengaluru"
          end={<Icon name="chevronRight" />}
          divider="inset"
          onClick={() => undefined}
        />
        <ListItem
          start={<Icon name="location" />}
          startSize="M"
          slotAlignment="top"
          title="Beverly Park"
          supportText="Kopar Khairane, Navi Mumbai"
          end={<Icon name="chevronRight" />}
          onClick={() => undefined}
        />
      </ListItemGroup>
    </GroupFrame>
  ),
};

// =============================================================================
// 4. Media — audio/video library rows (2429-14913)
// =============================================================================

export const Media: Story = {
  name: 'Media',
  render: () => (
    <GroupFrame>
      <ListItemGroup aria-label="Recently played" container="inset" sectionDivider={false}>
        <ListItem
          start={
            <Image
              src="https://picsum.photos/seed/media1/80"
              alt="While We Wait album art"
              aspectRatio="1:1"
              width="var(--Spacing-8)"
              height="var(--Spacing-8)"
            />
          }
          startSize="L"
          title="While We Wait"
          supportText="Kehlani · 03:45"
          supportStart={<Icon name="play" />}
          end={<IconButton icon="menu" aria-label="More options" attention="low" size="s" appearance="primary" />}
          divider="inset"
          onClick={() => undefined}
        />
        <ListItem
          start={
            <Image
              src="https://picsum.photos/seed/media2/80"
              alt="Phil Collins Essentials cover"
              aspectRatio="1:1"
              width="var(--Spacing-8)"
              height="var(--Spacing-8)"
            />
          }
          startSize="L"
          title="Phil Collins Essentials"
          supportText="Playlist · 01:30:19"
          supportStart={<Icon name="folder" />}
          end={<IconButton icon="menu" aria-label="More options" attention="low" size="s" appearance="primary" />}
          divider="inset"
          onClick={() => undefined}
        />
        <ListItem
          start={
            <Image
              src="https://picsum.photos/seed/media3/80"
              alt="Dices Que Te Vas album art"
              aspectRatio="1:1"
              width="var(--Spacing-8)"
              height="var(--Spacing-8)"
            />
          }
          startSize="L"
          title="Dices Que Te Vas"
          supportText="Karol G · 03:04"
          supportStart={<Icon name="play" />}
          end={<IconButton icon="menu" aria-label="More options" attention="low" size="s" appearance="primary" />}
          onClick={() => undefined}
        />
      </ListItemGroup>
    </GroupFrame>
  ),
};

// =============================================================================
// 5. Settings — settings rows with Switch / status label / chevron (2429-15002)
// =============================================================================

function SettingsDemo() {
  const [airplane, setAirplane] = React.useState(true);
  return (
    <ListItemGroup aria-label="Connectivity" container="inset" sectionDivider={false}>
      <ListItem
        start={<Icon name="globe" />}
        startSize="M"
        title="Airplane Mode"
        end={
          <Switch
            checked={airplane}
            onCheckedChange={setAirplane}
            aria-label="Toggle airplane mode"
          />
        }
        divider="inset"
      />
      <ListItem
        start={<Icon name="globe" />}
        startSize="M"
        title="Wi-Fi"
        end={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
            <span
              style={{
                fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
                fontSize: 'var(--Label-S-FontSize)',
                lineHeight: 'var(--Label-S-LineHeight)',
                color: 'var(--Text-Low)',
              }}
            >
              Not Connected
            </span>
            <Icon name="chevronRight" />
          </div>
        }
        divider="inset"
        onClick={() => undefined}
      />
      <ListItem
        start={<Icon name="link" />}
        startSize="M"
        title="Bluetooth"
        end={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
            <span
              style={{
                fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
                fontSize: 'var(--Label-S-FontSize)',
                lineHeight: 'var(--Label-S-LineHeight)',
                color: 'var(--Text-Low)',
              }}
            >
              Not Connected
            </span>
            <Icon name="chevronRight" />
          </div>
        }
        onClick={() => undefined}
      />
    </ListItemGroup>
  );
}

export const Settings: Story = {
  name: 'Settings',
  render: () => (
    <GroupFrame>
      <SettingsDemo />
    </GroupFrame>
  ),
};

// =============================================================================
// 6. ProductListing — e-commerce row with Stepper quantity control (2429-15091)
// =============================================================================

function ProductListingDemo() {
  const [q1, setQ1] = React.useState(1);
  const [q2, setQ2] = React.useState(2);
  const [q3, setQ3] = React.useState(1);
  return (
    <ListItemGroup aria-label="Cart items" container="inset" sectionDivider={false}>
      <ListItem
        start={
          <Image
            src="https://picsum.photos/seed/prod1/80"
            alt="Corriander Bunch"
            aspectRatio="1:1"
            width="var(--Spacing-8)"
            height="var(--Spacing-8)"
          />
        }
        startSize="L"
        title="Corriander Bunch"
        supportText="100 g x 2"
        end={<Stepper value={q1} onChange={(_, v) => setQ1(v ?? 0)} min={0} aria-label="Corriander Bunch quantity" />}
        divider="inset"
      />
      <ListItem
        start={
          <Image
            src="https://picsum.photos/seed/prod2/80"
            alt="Indian Tomato"
            aspectRatio="1:1"
            width="var(--Spacing-8)"
            height="var(--Spacing-8)"
          />
        }
        startSize="L"
        title="Indian Tomato"
        supportText="1 kg"
        end={<Stepper value={q2} onChange={(_, v) => setQ2(v ?? 0)} min={0} aria-label="Indian Tomato quantity" />}
        divider="inset"
      />
      <ListItem
        start={
          <Image
            src="https://picsum.photos/seed/prod3/80"
            alt="Potato"
            aspectRatio="1:1"
            width="var(--Spacing-8)"
            height="var(--Spacing-8)"
          />
        }
        startSize="L"
        title="Potato"
        supportText="500 g"
        end={<Stepper value={q3} onChange={(_, v) => setQ3(v ?? 0)} min={0} aria-label="Potato quantity" />}
      />
    </ListItemGroup>
  );
}

export const ProductListing: Story = {
  name: 'ProductListing',
  render: () => (
    <GroupFrame>
      <ProductListingDemo />
    </GroupFrame>
  ),
};

// =============================================================================
// Extras — section divider on / off + interactive controls for the args table
// =============================================================================

export const WithSectionDivider: Story = {
  name: 'With Top Section Divider',
  args: {
    sectionDivider: true,
    container: 'fullWidth',
    'aria-label': 'Section',
  },
  render: (args: React.ComponentProps<typeof ListItemGroup>) => (
    <GroupFrame>
      <ListItemGroup {...args}>
        <ListItem
          title="First row"
          supportText="Top hairline is drawn by the group above this row"
          start={<Icon name="info" />}
          end={<Icon name="chevronRight" />}
          slotAlignment="top"
          divider="full"
          onClick={() => undefined}
        />
        <ListItem
          title="Second row"
          supportText="Inter-row dividers are per-ListItem, not per-group"
          start={<Icon name="info" />}
          end={<Icon name="chevronRight" />}
          slotAlignment="top"
          onClick={() => undefined}
        />
      </ListItemGroup>
    </GroupFrame>
  ),
};
