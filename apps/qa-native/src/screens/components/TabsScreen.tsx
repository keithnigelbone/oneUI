/**
 * TabsScreen — focused test surface for `<Tabs>` / `<TabGroup>` from
 * `@oneui/ui-native/components/Tabs`.
 *
 * ── Horizontal sections (1–10) ──────────────────────────────────────────────
 *   1.  section-size-s            — size="s" + icons
 *   2.  section-size-m            — size="m" (default) + icons
 *   3.  section-size-l            — size="l" + icons
 *   4.  section-appearance-primary    — primary appearance
 *   5.  section-appearance-secondary  — secondary appearance
 *   6.  section-appearance-neutral    — neutral appearance
 *   7.  section-disabled          — one disabled tab
 *   8.  section-scroll            — 8 tabs → horizontal overflow → scroll test
 *   9.  section-badge-indicator   — IndicatorBadge in end slot
 *   10. section-badge-counter     — CounterBadge in end slot
 *
 * ── Vertical sections (11–19) ───────────────────────────────────────────────
 *   11. section-vertical-size-s   — vertical + size="s" + icons
 *   12. section-vertical-size-m   — vertical + size="m" + icons
 *   13. section-vertical-size-l   — vertical + size="l" + icons
 *   14. section-vertical-primary  — vertical + appearance="primary"
 *   15. section-vertical-secondary — vertical + appearance="secondary"
 *   16. section-vertical-neutral  — vertical + appearance="neutral"
 *   17. section-vertical-disabled — vertical + one disabled tab
 *   18. section-vertical-indicator — vertical + IndicatorBadge in end slot
 *   19. section-vertical-counter  — vertical + CounterBadge in end slot
 *
 * ── Compound API (20) ────────────────────────────────────────────────────────
 *   20. section-compound-api      — Tabs.Root / Tabs.List / Tabs.Item / Tabs.Panel
 *
 * Every section uses defaultValue="overview" (or "home") so the first tab is
 * active and all inactive tabs render simultaneously — both states captured in
 * every Applitools screenshot.
 *
 * ─── Known bugs (QA-flagged) ────────────────────────────────────────────────
 *   BUG-TABS-1: TabItem with ReactNode children + no aria-label is inaccessible
 *               File: packages/ui-native/src/components/Tabs/interface.ts
 *   BUG-TABS-2: inactive TabPanel is unmounted instead of hidden
 *               File: packages/ui-native/src/components/Tabs/Tabs.native.tsx
 *   BUG-INDICATORBADGE-1: IndicatorBadge renders square when used outside a
 *               component that provides theme shape context (e.g. TabItem end slot)
 *               File: packages/ui-native/src/components/IndicatorBadge/IndicatorBadge.native.tsx
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Tabs, TabGroup, TabItem, TabPanel } from '@oneui/ui-native/components/Tabs';
import { Icon } from '@oneui/ui-native/components/Icon';
import { IndicatorBadge } from '@oneui/ui-native/components/IndicatorBadge';
import { CounterBadge } from '@oneui/ui-native/components/CounterBadge';
import type { TabsSize } from '@oneui/ui-native/components/Tabs';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

/* ─── Icon size matched to tab size ─────────────────────────────────────── */

const ICON_SIZE_BY_TAB: Record<TabsSize, '3' | '4' | '5'> = {
  s: '3',
  m: '4',
  l: '5',
};

/* ─── Section testIDs — single-quoted so visual/generate.mts regex picks them up ── */

const S = {
  // Horizontal
  sizeS:                  'section-size-s',
  sizeM:                  'section-size-m',
  sizeL:                  'section-size-l',
  appearancePrimary:      'section-appearance-primary',
  appearanceSecondary:    'section-appearance-secondary',
  appearanceNeutral:      'section-appearance-neutral',
  disabled:               'section-disabled',
  scroll:                 'section-scroll',
  badgeIndicator:         'section-badge-indicator',
  badgeCounter:           'section-badge-counter',
  // Vertical
  verticalSizeS:          'section-vertical-size-s',
  verticalSizeM:          'section-vertical-size-m',
  verticalSizeL:          'section-vertical-size-l',
  verticalPrimary:        'section-vertical-primary',
  verticalSecondary:      'section-vertical-secondary',
  verticalNeutral:        'section-vertical-neutral',
  verticalDisabled:       'section-vertical-disabled',
  verticalIndicator:      'section-vertical-indicator',
  verticalCounter:        'section-vertical-counter',
  // Compound
  compoundApi:            'section-compound-api',
} as const;

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function TabsScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID="screen-Tabs"
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {/* ── Horizontal ── */}
      <SectionHeader label="Horizontal tabs" />
      <SizeSection         sectionId={S.sizeS}               size="s"         title="1 · Size S" />
      <SizeSection         sectionId={S.sizeM}               size="m"         title="2 · Size M (default)" />
      <SizeSection         sectionId={S.sizeL}               size="l"         title="3 · Size L" />
      <AppearanceSection   sectionId={S.appearancePrimary}   appearance="primary"   title="4 · Appearance — Primary" />
      <AppearanceSection   sectionId={S.appearanceSecondary} appearance="secondary" title="5 · Appearance — Secondary" />
      <AppearanceSection   sectionId={S.appearanceNeutral}   appearance="neutral"   title="6 · Appearance — Neutral" />
      <HDisabledSection />
      <ScrollSection />
      <HBadgeIndicatorSection />
      <HBadgeCounterSection />

      {/* ── Vertical ── */}
      <SectionHeader label="Vertical tabs (orientation='vertical')" />
      <VerticalSizeSection      sectionId={S.verticalSizeS}     size="s"         title="11 · Vertical — Size S" />
      <VerticalSizeSection      sectionId={S.verticalSizeM}     size="m"         title="12 · Vertical — Size M (default)" />
      <VerticalSizeSection      sectionId={S.verticalSizeL}     size="l"         title="13 · Vertical — Size L" />
      <VerticalAppearanceSection sectionId={S.verticalPrimary}  appearance="primary"   title="14 · Vertical — Primary" />
      <VerticalAppearanceSection sectionId={S.verticalSecondary} appearance="secondary" title="15 · Vertical — Secondary" />
      <VerticalAppearanceSection sectionId={S.verticalNeutral}  appearance="neutral"   title="16 · Vertical — Neutral" />
      <VDisabledSection />
      <VBadgeIndicatorSection />
      <VBadgeCounterSection />

      {/* ── Compound API ── */}
      <SectionHeader label="Compound API" />
      <CompoundApiSection />
    </ScrollView>
  );
}

/* ─── Group header ───────────────────────────────────────────────────────── */

function SectionHeader({ label }: { label: string }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={[styles.groupHeader, { backgroundColor: role.surfaces.subtle }]}>
      <Text style={[styles.groupHeaderText, { color: role.content.high }]}>{label}</Text>
    </View>
  );
}

/* ─── Shared section wrapper ──────────────────────────────────────────────── */

function SectionWrapper({
  children,
  sectionId,
  title,
  note,
}: {
  children: React.ReactNode;
  sectionId: string;
  title: string;
  note?: string;
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={sectionId} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      {note ? (
        <Text style={[styles.sectionNote, { color: role.content.medium }]}>{note}</Text>
      ) : null}
      {children}
    </View>
  );
}

/* ─── Panel content ───────────────────────────────────────────────────────── */

function PanelText({ label }: { label: string }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text style={[styles.panelText, { color: role.content.medium }]}>{label}</Text>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HORIZONTAL SECTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Horizontal: Size (s / m / l) ──────────────────────────────────────── */

function SizeSection({
  sectionId,
  size,
  title,
}: {
  sectionId: string;
  size: TabsSize;
  title: string;
}): React.ReactElement {
  const iconSize = ICON_SIZE_BY_TAB[size];
  return (
    <SectionWrapper sectionId={sectionId} title={title}>
      <TabGroup defaultValue="overview" size={size}>
        <TabItem value="overview" start={<Icon icon={JdsIcons.IcHome}     size={iconSize} />}>
          Overview of the content
        </TabItem>
        <TabItem value="projects" start={<Icon icon={JdsIcons.IcStar}     size={iconSize} />}>
          All your projects
        </TabItem>
        <TabItem value="settings" start={<Icon icon={JdsIcons.IcSettings} size={iconSize} />}>
          User settings
        </TabItem>
        <TabPanel value="overview">
          <PanelText label="A summary of everything happening in the current workspace." />
        </TabPanel>
        <TabPanel value="projects">
          <PanelText label="Browse and manage all projects assigned to you." />
        </TabPanel>
        <TabPanel value="settings">
          <PanelText label="Configure your profile, preferences, and notifications." />
        </TabPanel>
      </TabGroup>
    </SectionWrapper>
  );
}

/* ─── Horizontal: Appearance ─────────────────────────────────────────────── */

function AppearanceSection({
  sectionId,
  appearance,
  title,
}: {
  sectionId: string;
  appearance: 'primary' | 'secondary' | 'neutral';
  title: string;
}): React.ReactElement {
  return (
    <SectionWrapper sectionId={sectionId} title={title}>
      <TabGroup defaultValue="overview" appearance={appearance}>
        <TabItem value="overview" start={<Icon icon={JdsIcons.IcHome}     size="4" />}>
          Overview of the content
        </TabItem>
        <TabItem value="projects" start={<Icon icon={JdsIcons.IcStar}     size="4" />}>
          All your projects
        </TabItem>
        <TabItem value="settings" start={<Icon icon={JdsIcons.IcSettings} size="4" />}>
          User settings
        </TabItem>
        <TabPanel value="overview">
          <PanelText label="A summary of everything happening in the current workspace." />
        </TabPanel>
        <TabPanel value="projects">
          <PanelText label="Browse and manage all projects assigned to you." />
        </TabPanel>
        <TabPanel value="settings">
          <PanelText label="Configure your profile, preferences, and notifications." />
        </TabPanel>
      </TabGroup>
    </SectionWrapper>
  );
}

/* ─── Horizontal: Disabled ───────────────────────────────────────────────── */

function HDisabledSection(): React.ReactElement {
  return (
    <SectionWrapper sectionId={S.disabled} title="7 · Disabled tab">
      <TabGroup defaultValue="overview">
        <TabItem value="overview" start={<Icon icon={JdsIcons.IcHome}     size="4" />}>
          Overview of the content
        </TabItem>
        <TabItem value="projects" disabled start={<Icon icon={JdsIcons.IcStar} size="4" />}>
          All your projects
        </TabItem>
        <TabItem value="settings" start={<Icon icon={JdsIcons.IcSettings} size="4" />}>
          User settings
        </TabItem>
        <TabPanel value="overview">
          <PanelText label="A summary of everything happening in the current workspace." />
        </TabPanel>
        <TabPanel value="projects">
          <PanelText label="Browse and manage all projects assigned to you." />
        </TabPanel>
        <TabPanel value="settings">
          <PanelText label="Configure your profile, preferences, and notifications." />
        </TabPanel>
      </TabGroup>
    </SectionWrapper>
  );
}

/* ─── Horizontal: Scroll (8 tabs) ───────────────────────────────────────── */

function ScrollSection(): React.ReactElement {
  return (
    <SectionWrapper
      sectionId={S.scroll}
      title="8 · Scroll (8 tabs — swipe the tab list)"
      note="Tab list overflows the viewport width. Swipe left to reveal hidden tabs."
    >
      <TabGroup defaultValue="home">
        <TabItem value="home"          start={<Icon icon={JdsIcons.IcHome}         size="4" />}>Home</TabItem>
        <TabItem value="overview"      start={<Icon icon={JdsIcons.IcInfo}         size="4" />}>Overview</TabItem>
        <TabItem value="projects"      start={<Icon icon={JdsIcons.IcStar}         size="4" />}>Projects</TabItem>
        <TabItem value="notifications" start={<Icon icon={JdsIcons.IcNotification} size="4" />}>Notifications</TabItem>
        <TabItem value="search"        start={<Icon icon={JdsIcons.IcSearch}       size="4" />}>Search</TabItem>
        <TabItem value="profile"       start={<Icon icon={JdsIcons.IcUser}         size="4" />}>My profile</TabItem>
        <TabItem value="settings"      start={<Icon icon={JdsIcons.IcSettings}     size="4" />}>Settings</TabItem>
        <TabItem value="edit"          start={<Icon icon={JdsIcons.IcEdit}         size="4" />}>Edit mode</TabItem>
        <TabPanel value="home"><PanelText label="Welcome back. Here's what's new in your workspace today." /></TabPanel>
        <TabPanel value="overview"><PanelText label="A summary of everything happening in the current workspace." /></TabPanel>
        <TabPanel value="projects"><PanelText label="Browse and manage all projects assigned to you." /></TabPanel>
        <TabPanel value="notifications"><PanelText label="You have 3 unread notifications from your teammates." /></TabPanel>
        <TabPanel value="search"><PanelText label="Search across documents, projects, and team members." /></TabPanel>
        <TabPanel value="profile"><PanelText label="Manage your personal information, avatar, and display name." /></TabPanel>
        <TabPanel value="settings"><PanelText label="Configure your profile, preferences, and notifications." /></TabPanel>
        <TabPanel value="edit"><PanelText label="Edit mode lets you rearrange sections and update content inline." /></TabPanel>
      </TabGroup>
    </SectionWrapper>
  );
}

/* ─── Horizontal: IndicatorBadge ─────────────────────────────────────────── */

function HBadgeIndicatorSection(): React.ReactElement {
  return (
    <SectionWrapper
      sectionId={S.badgeIndicator}
      title="9 · Indicator badge (end slot)"
      note="Tab 2 = red dot (negative), tab 3 = blue dot (informative), tab 4 = no badge."
    >
      <TabGroup defaultValue="overview">
        <TabItem value="overview" start={<Icon icon={JdsIcons.IcHome} size="4" />}>
          Overview
        </TabItem>
        <TabItem
          value="notifications"
          start={<Icon icon={JdsIcons.IcNotification} size="4" />}
          end={<IndicatorBadge size="xs" appearance="negative" aria-label="new notification" />}
        >
          Notifications
        </TabItem>
        <TabItem
          value="updates"
          start={<Icon icon={JdsIcons.IcInfo} size="4" />}
          end={<IndicatorBadge size="xs" appearance="informative" aria-label="update available" />}
        >
          Updates
        </TabItem>
        <TabItem value="settings" start={<Icon icon={JdsIcons.IcSettings} size="4" />}>
          Settings
        </TabItem>
        <TabPanel value="overview"><PanelText label="A summary of everything happening in the current workspace." /></TabPanel>
        <TabPanel value="notifications"><PanelText label="You have new notifications from your teammates." /></TabPanel>
        <TabPanel value="updates"><PanelText label="Platform update 2.4 is available. Tap to review what's new." /></TabPanel>
        <TabPanel value="settings"><PanelText label="Configure your profile, preferences, and notifications." /></TabPanel>
      </TabGroup>
    </SectionWrapper>
  );
}

/* ─── Horizontal: CounterBadge ──────────────────────────────────────────── */

function HBadgeCounterSection(): React.ReactElement {
  return (
    <SectionWrapper
      sectionId={S.badgeCounter}
      title="10 · Counter badge (end slot)"
      note="Tab 2 has 3 unread, tab 4 has 12 unread (capped at 9+)."
    >
      <TabGroup defaultValue="home">
        <TabItem value="home" start={<Icon icon={JdsIcons.IcHome} size="4" />}>
          Home
        </TabItem>
        <TabItem
          value="messages"
          start={<Icon icon={JdsIcons.IcNotification} size="4" />}
          end={<CounterBadge value={3} size="xs" appearance="negative" attention="high" aria-label="3 unread messages" />}
        >
          Messages
        </TabItem>
        <TabItem value="projects" start={<Icon icon={JdsIcons.IcStar} size="4" />}>
          Projects
        </TabItem>
        <TabItem
          value="activity"
          start={<Icon icon={JdsIcons.IcInfo} size="4" />}
          end={<CounterBadge value={12} max={9} size="xs" appearance="negative" attention="high" aria-label="12 unread activity items" />}
        >
          Activity
        </TabItem>
        <TabPanel value="home"><PanelText label="Welcome back. Here's what's new in your workspace today." /></TabPanel>
        <TabPanel value="messages"><PanelText label="3 unread messages from your teammates are waiting." /></TabPanel>
        <TabPanel value="projects"><PanelText label="Browse and manage all projects assigned to you." /></TabPanel>
        <TabPanel value="activity"><PanelText label="12 recent activity items across all your active projects." /></TabPanel>
      </TabGroup>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VERTICAL SECTIONS  (orientation="vertical")
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Vertical container — mirrors showcase requirement ──────────────────────
 * BUG-TABS-3: TabGroup with orientation="vertical" collapses to 0×0 when
 * placed inside an unbounded parent (e.g. ScrollView). The component's
 * listScrollViewportVertical uses maxHeight:'100%' (requires bounded height)
 * and flexGrow:0 with children using width:'100%' (circular width deadlock).
 * The official showcase fixes this by wrapping the TabGroup in a View with a
 * fixed height + passing height:'100%' to the TabGroup itself.
 * This wrapper replicates that pattern. See Tabs.showcase.native.tsx:401.
 * ─────────────────────────────────────────────────────────────────────────── */

const VERTICAL_CONTAINER_HEIGHT = tokens.spacing['40']; // 160px — mirrors showcase

function VerticalContainer({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <View style={{ height: VERTICAL_CONTAINER_HEIGHT, width: '100%' }}>
      {children}
    </View>
  );
}

/* ─── Vertical: Size (s / m / l) ─────────────────────────────────────────── */

function VerticalSizeSection({
  sectionId,
  size,
  title,
}: {
  sectionId: string;
  size: TabsSize;
  title: string;
}): React.ReactElement {
  const iconSize = ICON_SIZE_BY_TAB[size];
  return (
    <SectionWrapper sectionId={sectionId} title={title}>
      <VerticalContainer>
        <TabGroup defaultValue="overview" orientation="vertical" size={size} style={{ height: '100%' }}>
          <TabItem value="overview" start={<Icon icon={JdsIcons.IcHome}     size={iconSize} />}>
            Overview of the content
          </TabItem>
          <TabItem value="projects" start={<Icon icon={JdsIcons.IcStar}     size={iconSize} />}>
            All your projects
          </TabItem>
          <TabItem value="settings" start={<Icon icon={JdsIcons.IcSettings} size={iconSize} />}>
            User settings
          </TabItem>
          <TabItem value="activity" start={<Icon icon={JdsIcons.IcInfo}     size={iconSize} />}>
            Recent activity
          </TabItem>
          <TabPanel value="overview">
            <PanelText label="A summary of everything happening in the current workspace." />
          </TabPanel>
          <TabPanel value="projects">
            <PanelText label="Browse and manage all projects assigned to you." />
          </TabPanel>
          <TabPanel value="settings">
            <PanelText label="Configure your profile, preferences, and notifications." />
          </TabPanel>
          <TabPanel value="activity">
            <PanelText label="12 recent activity items across all your active projects." />
          </TabPanel>
        </TabGroup>
      </VerticalContainer>
    </SectionWrapper>
  );
}

/* ─── Vertical: Appearance ───────────────────────────────────────────────── */

function VerticalAppearanceSection({
  sectionId,
  appearance,
  title,
}: {
  sectionId: string;
  appearance: 'primary' | 'secondary' | 'neutral';
  title: string;
}): React.ReactElement {
  return (
    <SectionWrapper sectionId={sectionId} title={title}>
      <VerticalContainer>
        <TabGroup defaultValue="overview" orientation="vertical" appearance={appearance} style={{ height: '100%' }}>
          <TabItem value="overview" start={<Icon icon={JdsIcons.IcHome}     size="4" />}>
            Overview of the content
          </TabItem>
          <TabItem value="projects" start={<Icon icon={JdsIcons.IcStar}     size="4" />}>
            All your projects
          </TabItem>
          <TabItem value="settings" start={<Icon icon={JdsIcons.IcSettings} size="4" />}>
            User settings
          </TabItem>
          <TabItem value="activity" start={<Icon icon={JdsIcons.IcInfo}     size="4" />}>
            Recent activity
          </TabItem>
          <TabPanel value="overview">
            <PanelText label="A summary of everything happening in the current workspace." />
          </TabPanel>
          <TabPanel value="projects">
            <PanelText label="Browse and manage all projects assigned to you." />
          </TabPanel>
          <TabPanel value="settings">
            <PanelText label="Configure your profile, preferences, and notifications." />
          </TabPanel>
          <TabPanel value="activity">
            <PanelText label="12 recent activity items across all your active projects." />
          </TabPanel>
        </TabGroup>
      </VerticalContainer>
    </SectionWrapper>
  );
}

/* ─── Vertical: Disabled ─────────────────────────────────────────────────── */

function VDisabledSection(): React.ReactElement {
  return (
    <SectionWrapper sectionId={S.verticalDisabled} title="17 · Vertical — Disabled tab">
      <VerticalContainer>
        <TabGroup defaultValue="overview" orientation="vertical" style={{ height: '100%' }}>
          <TabItem value="overview" start={<Icon icon={JdsIcons.IcHome}     size="4" />}>
            Overview of the content
          </TabItem>
          <TabItem value="projects" disabled start={<Icon icon={JdsIcons.IcStar} size="4" />}>
            All your projects
          </TabItem>
          <TabItem value="settings" start={<Icon icon={JdsIcons.IcSettings} size="4" />}>
            User settings
          </TabItem>
          <TabItem value="activity" start={<Icon icon={JdsIcons.IcInfo}     size="4" />}>
            Recent activity
          </TabItem>
          <TabPanel value="overview">
            <PanelText label="A summary of everything happening in the current workspace." />
          </TabPanel>
          <TabPanel value="projects">
            <PanelText label="Browse and manage all projects assigned to you." />
          </TabPanel>
          <TabPanel value="settings">
            <PanelText label="Configure your profile, preferences, and notifications." />
          </TabPanel>
          <TabPanel value="activity">
            <PanelText label="12 recent activity items across all your active projects." />
          </TabPanel>
        </TabGroup>
      </VerticalContainer>
    </SectionWrapper>
  );
}

/* ─── Vertical: IndicatorBadge ───────────────────────────────────────────── */

function VBadgeIndicatorSection(): React.ReactElement {
  return (
    <SectionWrapper
      sectionId={S.verticalIndicator}
      title="18 · Vertical — Indicator badge (end slot)"
      note="Tab 2 = red dot, tab 3 = blue dot, tab 4 = no badge."
    >
      <VerticalContainer>
        <TabGroup defaultValue="overview" orientation="vertical" style={{ height: '100%' }}>
          <TabItem value="overview" start={<Icon icon={JdsIcons.IcHome} size="4" />}>
            Overview
          </TabItem>
          <TabItem
            value="notifications"
            start={<Icon icon={JdsIcons.IcNotification} size="4" />}
            end={<IndicatorBadge size="xs" appearance="negative" aria-label="new notification" />}
          >
            Notifications
          </TabItem>
          <TabItem
            value="updates"
            start={<Icon icon={JdsIcons.IcInfo} size="4" />}
            end={<IndicatorBadge size="xs" appearance="informative" aria-label="update available" />}
          >
            Updates
          </TabItem>
          <TabItem value="settings" start={<Icon icon={JdsIcons.IcSettings} size="4" />}>
            Settings
          </TabItem>
          <TabPanel value="overview"><PanelText label="A summary of everything happening in the current workspace." /></TabPanel>
          <TabPanel value="notifications"><PanelText label="You have new notifications from your teammates." /></TabPanel>
          <TabPanel value="updates"><PanelText label="Platform update 2.4 is available. Tap to review what's new." /></TabPanel>
          <TabPanel value="settings"><PanelText label="Configure your profile, preferences, and notifications." /></TabPanel>
        </TabGroup>
      </VerticalContainer>
    </SectionWrapper>
  );
}

/* ─── Vertical: CounterBadge ─────────────────────────────────────────────── */

function VBadgeCounterSection(): React.ReactElement {
  return (
    <SectionWrapper
      sectionId={S.verticalCounter}
      title="19 · Vertical — Counter badge (end slot)"
      note="Tab 2 has 3 unread, tab 4 has 12 unread (capped at 9+)."
    >
      <VerticalContainer>
        <TabGroup defaultValue="home" orientation="vertical" style={{ height: '100%' }}>
          <TabItem value="home" start={<Icon icon={JdsIcons.IcHome} size="4" />}>
            Home
          </TabItem>
          <TabItem
            value="messages"
            start={<Icon icon={JdsIcons.IcNotification} size="4" />}
            end={<CounterBadge value={3} size="xs" appearance="negative" attention="high" aria-label="3 unread messages" />}
          >
            Messages
          </TabItem>
          <TabItem value="projects" start={<Icon icon={JdsIcons.IcStar} size="4" />}>
            Projects
          </TabItem>
          <TabItem
            value="activity"
            start={<Icon icon={JdsIcons.IcInfo} size="4" />}
            end={<CounterBadge value={12} max={9} size="xs" appearance="negative" attention="high" aria-label="12 unread activity items" />}
          >
            Activity
          </TabItem>
          <TabPanel value="home"><PanelText label="Welcome back. Here's what's new in your workspace today." /></TabPanel>
          <TabPanel value="messages"><PanelText label="3 unread messages from your teammates are waiting." /></TabPanel>
          <TabPanel value="projects"><PanelText label="Browse and manage all projects assigned to you." /></TabPanel>
          <TabPanel value="activity"><PanelText label="12 recent activity items across all your active projects." /></TabPanel>
        </TabGroup>
      </VerticalContainer>
    </SectionWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOUND API
   ═══════════════════════════════════════════════════════════════════════════ */

function CompoundApiSection(): React.ReactElement {
  return (
    <SectionWrapper sectionId={S.compoundApi} title="20 · Compound API (Tabs.Root)">
      <Tabs.Root defaultValue="overview">
        <Tabs.List aria-label="Content sections">
          <Tabs.Item value="overview" start={<Icon icon={JdsIcons.IcHome}     size="4" />}>
            Overview of the content
          </Tabs.Item>
          <Tabs.Item value="projects" start={<Icon icon={JdsIcons.IcStar}     size="4" />}>
            All your projects
          </Tabs.Item>
          <Tabs.Item value="settings" start={<Icon icon={JdsIcons.IcSettings} size="4" />}>
            User settings
          </Tabs.Item>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="overview">
          <PanelText label="A summary of everything happening in the current workspace." />
        </Tabs.Panel>
        <Tabs.Panel value="projects">
          <PanelText label="Browse and manage all projects assigned to you." />
        </Tabs.Panel>
        <Tabs.Panel value="settings">
          <PanelText label="Configure your profile, preferences, and notifications." />
        </Tabs.Panel>
      </Tabs.Root>
    </SectionWrapper>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  content: {
    padding: tokens.spacing['4'],
    gap: tokens.spacing['5'],
  },
  groupHeader: {
    paddingHorizontal: tokens.spacing['3'],
    paddingVertical: tokens.spacing['2'],
    borderRadius: tokens.spacing['1'],
  },
  groupHeaderText: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.high,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  section: {
    gap: tokens.spacing['3'],
    paddingBottom: tokens.spacing['4'],
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.size.l,
    fontWeight: typography.weight.high,
  },
  sectionNote: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  panelText: {
    fontSize: typography.size.m,
    fontWeight: typography.weight.medium,
    paddingVertical: tokens.spacing['2'],
  },
});
