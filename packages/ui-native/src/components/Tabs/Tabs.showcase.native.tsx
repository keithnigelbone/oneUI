/**
 * Tabs.showcase.native.tsx — peer of Tabs.stories.tsx + Tabs.showcase.tsx
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { tokens, typography } from '@oneui/tokens';
import { CounterBadge } from '../CounterBadge/CounterBadge.native';
import { Icon } from '../Icon/Icon.native';
import {
  IcGlobeGlyph,
  IcHomeGlyph,
  IcMailGlyph,
  IcUserGlyph,
} from '../BottomNavigationItem/bottomNavShowcaseGlyphs';
import { Surface, useSurfaceTokens } from '../../theme';
import { TabGroup, TabItem, TabPanel, Tabs } from './Tabs.native';
import type { TabsOrientation, TabsSize } from './interface';

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: tokens.spacing['6'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4-5'],
  width: '100%',
};

const SIZES: readonly TabsSize[] = ['s', 'm', 'l'];
const ORIENTATIONS: readonly TabsOrientation[] = ['horizontal', 'vertical'];

function Caption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>{children}</Text>;
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.s,
        color: role.content.medium,
        fontWeight: typography.weight.medium,
        textTransform: 'capitalize',
      }}
    >
      {children}
    </Text>
  );
}

function SampleTabs({
  size = 'm',
  orientation = 'horizontal',
  appearance,
  withSlots = false,
}: {
  size?: TabsSize;
  orientation?: TabsOrientation;
  appearance?: string;
  withSlots?: boolean;
}): React.ReactElement {
  const [value, setValue] = useState<string | number | null>('one');
  return (
    <TabGroup
      value={value}
      onValueChange={setValue}
      size={size}
      orientation={orientation}
      appearance={appearance as never}
    >
      <TabItem
        value="one"
        start={
          withSlots ? <Icon icon={IcHomeGlyph} size={tokens.spacing['5']} aria-hidden /> : undefined
        }
      >
        Overview
      </TabItem>
      <TabItem
        value="two"
        start={
          withSlots ? <Icon icon={IcMailGlyph} size={tokens.spacing['5']} aria-hidden /> : undefined
        }
        end={
          withSlots ? (
            <CounterBadge value={3} size="s" appearance="negative" aria-label="3 unread messages" />
          ) : undefined
        }
      >
        Inbox
      </TabItem>
      <TabItem
        value="three"
        start={
          withSlots ? <Icon icon={IcUserGlyph} size={tokens.spacing['5']} aria-hidden /> : undefined
        }
      >
        Settings
      </TabItem>
    </TabGroup>
  );
}

/** Story: Default */
export function TabsDefault(): React.ReactElement {
  return (
    <TabGroup defaultValue="overview" size="m" appearance="primary">
      <TabItem value="overview">Overview</TabItem>
      <TabItem value="projects">Projects</TabItem>
      <TabItem value="account">Account</TabItem>
    </TabGroup>
  );
}

/** Story: Variants — horizontal + vertical */
export function TabsVariants(): React.ReactElement {
  return (
    <View style={row}>
      <View style={column}>
        <SectionLabel>Horizontal</SectionLabel>
        <TabGroup defaultValue="a">
          <TabItem value="a">One</TabItem>
          <TabItem value="b">Two</TabItem>
          <TabItem value="c">Three</TabItem>
        </TabGroup>
      </View>
      <View style={[column, { minWidth: tokens.spacing['18'] }]}>
        <SectionLabel>Vertical</SectionLabel>
        <TabGroup defaultValue="a" orientation="vertical">
          <TabItem value="a">One</TabItem>
          <TabItem value="b">Two</TabItem>
          <TabItem value="c">Three</TabItem>
        </TabGroup>
      </View>
    </View>
  );
}

/** Story: Sizes */
export function TabsSizes(): React.ReactElement {
  return (
    <View style={column}>
      {SIZES.map((size) => (
        <View key={size} style={column}>
          <SectionLabel>Size {size.toUpperCase()}</SectionLabel>
          <TabGroup size={size} defaultValue="a">
            <TabItem value="a">Overview</TabItem>
            <TabItem value="b">Projects</TabItem>
            <TabItem value="c">Account</TabItem>
          </TabGroup>
        </View>
      ))}
    </View>
  );
}

/** Story: States — disabled + selected */
export function TabsStates(): React.ReactElement {
  return (
    <TabGroup defaultValue="b">
      <TabItem value="a">Enabled</TabItem>
      <TabItem value="b">Selected</TabItem>
      <TabItem value="c" disabled>
        Disabled
      </TabItem>
    </TabGroup>
  );
}

/** Story: WithIcons */
export function TabsWithIcons(): React.ReactElement {
  return (
    <TabGroup defaultValue="home">
      <TabItem
        value="home"
        start={<Icon icon={IcHomeGlyph} size={tokens.spacing['5']} aria-hidden />}
      >
        Home
      </TabItem>
      <TabItem
        value="inbox"
        start={<Icon icon={IcMailGlyph} size={tokens.spacing['5']} aria-hidden />}
        end={<CounterBadge value={3} appearance="negative" size="s" aria-label="3 unread" />}
      >
        Inbox
      </TabItem>
      <TabItem
        value="settings"
        start={<Icon icon={IcUserGlyph} size={tokens.spacing['5']} aria-hidden />}
      >
        Settings
      </TabItem>
    </TabGroup>
  );
}

/** Story: Interactive — controlled + panels */
export function TabsInteractive(): React.ReactElement {
  const [value, setValue] = useState<string | number | null>('a');
  return (
    <View style={column}>
      <TabGroup value={value} onValueChange={setValue}>
        <TabItem value="a">First</TabItem>
        <TabItem value="b">Second</TabItem>
        <TabItem value="c">Third</TabItem>
        <TabPanel value="a">
          <Caption>First panel content</Caption>
        </TabPanel>
        <TabPanel value="b">
          <Caption>Second panel content</Caption>
        </TabPanel>
        <TabPanel value="c">
          <Caption>Third panel content</Caption>
        </TabPanel>
      </TabGroup>
    </View>
  );
}

/** Story: Themes / surface context */
export function TabsThemes(): React.ReactElement {
  return (
    <View style={column}>
      <Surface mode="default">
        <View style={{ padding: tokens.spacing['4-5'], gap: tokens.spacing['3-5'] }}>
          <Caption>Default surface</Caption>
          <TabGroup defaultValue="a">
            <TabItem value="a">One</TabItem>
            <TabItem value="b">Two</TabItem>
            <TabItem value="c">Three</TabItem>
          </TabGroup>
        </View>
      </Surface>
      <Surface mode="subtle">
        <View style={{ padding: tokens.spacing['4-5'], gap: tokens.spacing['3-5'] }}>
          <Caption>Subtle surface</Caption>
          <TabGroup defaultValue="a">
            <TabItem value="a">One</TabItem>
            <TabItem value="b">Two</TabItem>
            <TabItem value="c">Three</TabItem>
          </TabGroup>
        </View>
      </Surface>
      <Surface mode="bold">
        <View style={{ padding: tokens.spacing['4-5'], gap: tokens.spacing['3-5'] }}>
          <Caption>Bold surface — labels + indicator flip to on-colour</Caption>
          <TabGroup defaultValue="a">
            <TabItem value="a">One</TabItem>
            <TabItem value="b">Two</TabItem>
            <TabItem value="c">Three</TabItem>
          </TabGroup>
        </View>
      </Surface>
    </View>
  );
}

/** Story: Appearances — all 9 roles */
export function TabsAppearances(): React.ReactElement {
  return (
    <View style={column}>
      {COMPONENT_APPEARANCE_ROLES.map((appearance) => (
        <View key={appearance} style={column}>
          <SectionLabel>{appearance}</SectionLabel>
          <TabGroup defaultValue="a" appearance={appearance}>
            <TabItem value="a">One</TabItem>
            <TabItem value="b">Two</TabItem>
            <TabItem value="c">Three</TabItem>
          </TabGroup>
        </View>
      ))}
    </View>
  );
}

/** Story: Adoption Matrix — surface × appearance × slots */
export function TabsAdoptionMatrix(): React.ReactElement {
  const surfaceModes = ['default', 'subtle', 'bold'] as const;
  const appearances = ['primary', 'secondary', 'neutral', 'negative'] as const;

  return (
    <View style={column}>
      {surfaceModes.map((mode) => (
        <Surface key={mode} mode={mode}>
          <View style={{ padding: tokens.spacing['4-5'], gap: tokens.spacing['4'] }}>
            <Caption>{mode} surface</Caption>
            {appearances.map((appearance) => (
              <View key={appearance} style={{ gap: tokens.spacing['3'] }}>
                <Caption>{appearance}</Caption>
                <SampleTabs appearance={appearance} withSlots />
              </View>
            ))}
          </View>
        </Surface>
      ))}
    </View>
  );
}

/** Story: Surface context sections (peer of TabsSurfaceContext showcase) */
export function TabsSurfaceContext(): React.ReactElement {
  return (
    <View style={column}>
      <Surface mode="default">
        <View style={{ padding: tokens.spacing['4-5'], gap: tokens.spacing['3-5'] }}>
          <Caption>Default surface</Caption>
          <SampleTabs />
        </View>
      </Surface>
      <Surface mode="subtle">
        <View style={{ padding: tokens.spacing['4-5'], gap: tokens.spacing['3-5'] }}>
          <Caption>Subtle surface — tinted panel background</Caption>
          <SampleTabs />
        </View>
      </Surface>
      <Surface mode="bold">
        <View style={{ padding: tokens.spacing['4-5'], gap: tokens.spacing['3-5'] }}>
          <Caption>Bold surface — label + indicator remap to on-colour</Caption>
          <SampleTabs />
        </View>
      </Surface>
    </View>
  );
}

/** Story: Orientations grid */
export function TabsOrientations(): React.ReactElement {
  return (
    <View style={row}>
      {ORIENTATIONS.map((orientation) => (
        <View key={orientation} style={column}>
          <SectionLabel>{orientation}</SectionLabel>
          <SampleTabs orientation={orientation} />
        </View>
      ))}
    </View>
  );
}

/** Story: Many horizontal tabs — overflow scroll when row exceeds screen width */
const MANY_TAB_LABELS = [
  'Summary',
  'Details',
  'History',
  'Billing',
  'Support',
  'Analytics',
  'Reports',
  'Settings',
  'Integrations',
  'Archive',
] as const;

export function TabsManyItems(): React.ReactElement {
  const [value, setValue] = useState<string | number | null>('summary');
  return (
    <View style={[column, { width: '100%' }]}>
      <Caption>
        Ten content-sized tabs — swipe horizontally when the row is wider than the screen; the
        active tab scrolls into view on selection.
      </Caption>
      <TabGroup value={value} onValueChange={setValue} size="m" orientation="horizontal">
        {MANY_TAB_LABELS.map((label) => {
          const tabValue = label.toLowerCase();
          return (
            <TabItem key={tabValue} value={tabValue}>
              {label}
            </TabItem>
          );
        })}
        {MANY_TAB_LABELS.map((label) => {
          const tabValue = label.toLowerCase();
          return (
            <TabPanel key={tabValue} value={tabValue}>
              <Caption>{label} panel</Caption>
            </TabPanel>
          );
        })}
      </TabGroup>
    </View>
  );
}

/** Story: Many vertical tabs — overflow scroll when list height is constrained */
const MANY_VERTICAL_LIST_HEIGHT = tokens.spacing['40'];

export function TabsManyItemsVertical(): React.ReactElement {
  const [value, setValue] = useState<string | number | null>('summary');
  return (
    <View style={[column, { width: '100%' }]}>
      <Caption>
        Ten vertical tabs in a fixed-height column — swipe vertically when the list is taller than
        the viewport; the active tab scrolls into view on selection.
      </Caption>
      <View style={{ height: MANY_VERTICAL_LIST_HEIGHT, width: '100%' }}>
        <TabGroup
          value={value}
          onValueChange={setValue}
          size="m"
          orientation="vertical"
          style={{ height: '100%' }}
        >
          {MANY_TAB_LABELS.map((label) => {
            const tabValue = label.toLowerCase();
            return (
              <TabItem key={tabValue} value={tabValue}>
                {label}
              </TabItem>
            );
          })}
          {MANY_TAB_LABELS.map((label) => {
            const tabValue = label.toLowerCase();
            return (
              <TabPanel key={tabValue} value={tabValue}>
                <Caption>{label} panel</Caption>
              </TabPanel>
            );
          })}
        </TabGroup>
      </View>
    </View>
  );
}

/** Story: Compound API */
export function TabsCompoundAPI(): React.ReactElement {
  return (
    <Tabs defaultValue="overview">
      <Tabs.List aria-label="Compound tabs">
        <Tabs.Item value="overview">Overview</Tabs.Item>
        <Tabs.Item value="projects">Projects</Tabs.Item>
        <Tabs.Item value="account">Account</Tabs.Item>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="overview">
        <Caption>Overview body</Caption>
      </Tabs.Panel>
      <Tabs.Panel value="projects">
        <Caption>Projects body</Caption>
      </Tabs.Panel>
      <Tabs.Panel value="account">
        <Caption>Account body</Caption>
      </Tabs.Panel>
    </Tabs>
  );
}

/** Story: With icons sections */
export function TabsWithIconsSections(): React.ReactElement {
  return (
    <View style={column}>
      <View style={column}>
        <SectionLabel>Icons only</SectionLabel>
        <SampleTabs withSlots />
      </View>
      <View style={column}>
        <SectionLabel>Icons + badge</SectionLabel>
        <SampleTabs withSlots />
      </View>
    </View>
  );
}

/** Bold surface section for sample app */
export function TabsOnBoldSurface(): React.ReactElement {
  return (
    <Surface mode="bold">
      <View style={{ padding: tokens.spacing['4-5'], gap: tokens.spacing['3-5'] }}>
        <Caption>Tabs on bold surface</Caption>
        <TabGroup defaultValue="a">
          <TabItem
            value="a"
            start={<Icon icon={IcGlobeGlyph} size={tokens.spacing['5']} aria-hidden />}
          >
            Explore
          </TabItem>
          <TabItem value="b">Profile</TabItem>
          <TabItem value="c" disabled>
            Disabled
          </TabItem>
        </TabGroup>
      </View>
    </Surface>
  );
}
