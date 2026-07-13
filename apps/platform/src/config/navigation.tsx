/**
 * navigation.tsx
 *
 * Mode-aware navigation structure for the platform.
 *
 * The shell now has four high-level "modes" (Home / Build / System / Agents)
 * rendered as top-center tabs. Each mode owns its own left-sidebar nav items
 * + landing route. The existing (studio) / (builder) route groups remain as-is
 * — we derive the active mode from the pathname rather than physically moving
 * every page to a new URL prefix.
 *
 * Consumer layouts call `resolveModeFromPath(pathname)` to pick the active
 * mode, then render `NAVIGATION_MODES[activeMode].items` in the LeftNav and
 * `MODE_NAV_ITEMS` in the top-center ModeNav.
 */

import React from 'react';
import { Icon } from '@oneui/ui/icons/Icon';
import IcHellojio from '../Jio_Icons/icons/IcHellojio';
import { resolveModeFromPath as resolveModeFromPathImpl } from '@oneui/shared';
import type { NavigationItem, ModeNavItem, PlatformModeId } from '@oneui/ui/components/Platform';

// ---------------------------------------------------------------------------
// Mode definitions — single source of truth
// ---------------------------------------------------------------------------

/**
 * Top-level mode tab strip. Order here is the order in the ModeNav.
 */
export const MODE_NAV_ITEMS: ModeNavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'build', label: 'Build' },
  { id: 'system', label: 'System' },
  { id: 'agents', label: 'Agents' },
];

export interface ModeDefinition {
  id: PlatformModeId;
  label: string;
  /** Where to land when the user clicks this mode's tab. */
  landingRoute: string;
  /**
   * Pathname prefixes that belong to this mode. First match wins when resolving
   * a pathname → mode. Empty array = this mode only owns its exact landing route.
   */
  pathPrefixes: string[];
  /** Items rendered in the LeftNav while this mode is active. */
  items: NavigationItem[];
}

// Home mode — the new prompt-first landing + chat threads rail.
// "Home" lands on the prompt surface (new/resume chat). "History" shows
// past threads in the secondary nav — same pattern as System mode showing
// Brand / Foundations sub-pages in the secondary panel.
const homeMode: ModeDefinition = {
  id: 'home',
  label: 'Home',
  landingRoute: '/',
  pathPrefixes: ['/chat'],
  items: [
    {
      id: 'home-landing',
      label: 'Home',
      icon: <IcHellojio width={20} height={20} />,
      path: '/',
      section: 'Home',
    },
    {
      id: 'history',
      label: 'History',
      icon: <Icon name="clock" />,
      path: '/chat',
      section: 'Home',
    },
  ],
};

// Build mode — Experience Builder (Canvas + Create campaign builder).
const buildMode: ModeDefinition = {
  id: 'build',
  label: 'Build',
  landingRoute: '/canvas',
  pathPrefixes: ['/canvas', '/create'],
  items: [
    {
      id: 'canvas',
      label: 'Canvas',
      icon: <Icon name="canvas" />,
      path: '/canvas',
      section: 'Experience Builder',
    },
    {
      id: 'create',
      label: 'Create',
      icon: <Icon name="sparkles" />,
      path: '/create/start-here',
      badge: 'AI',
      section: 'Experience Builder',
    },
  ],
};

// System mode — Design System studio (Brand + Foundations + Components).
const systemMode: ModeDefinition = {
  id: 'system',
  label: 'System',
  landingRoute: '/brand/overview',
  // `/settings` (Platform access) is a system-level admin surface reached from
  // the Settings gear, so it keeps the System mode tab active.
  pathPrefixes: ['/brand', '/foundations', '/components', '/settings'],
  items: [
    {
      id: 'brand',
      label: 'Brand',
      icon: <Icon name="palette" />,
      path: '/brand/overview',
      section: 'Design System',
    },
    {
      id: 'foundations',
      label: 'Foundations',
      icon: <Icon name="layers" />,
      path: '/foundations/color',
      section: 'Design System',
    },
    {
      id: 'components',
      label: 'Components',
      icon: <Icon name="components" />,
      path: '/components',
      section: 'Design System',
    },
  ],
};

// Agents mode — hub landing + individual agent entries.
// Each agent appears as a LeftNav item that, when clicked, opens the
// agent's secondary nav (same pattern as System mode: Brand → Overview /
// Sub-brands, Tone of Voice → Configuration / Rules / Skills / etc.).
const agentsMode: ModeDefinition = {
  id: 'agents',
  label: 'Agents',
  landingRoute: '/agents',
  pathPrefixes: ['/agents'],
  items: [
    {
      id: 'agents-home',
      label: 'Agents',
      icon: <Icon name="sparkles" />,
      path: '/agents',
      section: 'Agents',
    },
    {
      id: 'tone-of-voice',
      label: 'Tone of Voice',
      icon: <Icon name="chat" />,
      path: '/agents/tone-of-voice',
      section: 'Agents',
    },
    {
      id: 'design-composition',
      label: 'Design Composition',
      icon: <Icon name="palette" />,
      path: '/agents/design-composition',
      section: 'Agents',
    },
  ],
};

export const NAVIGATION_MODES: Record<PlatformModeId, ModeDefinition> = {
  home: homeMode,
  build: buildMode,
  system: systemMode,
  agents: agentsMode,
};

// ---------------------------------------------------------------------------
// Pathname → mode resolver
// ---------------------------------------------------------------------------

const MODE_RESOLUTION_ORDER: PlatformModeId[] = ['agents', 'build', 'system', 'home'];

/**
 * Derive the active mode from a pathname. Longest-prefix-first order so
 * `/agents` resolves to agents mode before falling through to system mode
 * (which also owns `/brand/*`).
 *
 * Returns 'home' as a safe default for '/' and anything unrecognised —
 * the home mode is the entry point so unknown paths land there.
 */
export function resolveModeFromPath(pathname: string): PlatformModeId {
  return resolveModeFromPathImpl<PlatformModeId>(
    pathname,
    NAVIGATION_MODES,
    MODE_RESOLUTION_ORDER,
    'home',
  );
}

// ---------------------------------------------------------------------------
// Navigation slug whitelist (for the agent `navigate_to` tool)
// ---------------------------------------------------------------------------

/**
 * All destinations the global agent is allowed to hand back via
 * `navigate_to`. Derived from `NAVIGATION_MODES` (landing routes + every
 * LeftNav item path) plus a small list of sub-routes inside tools that
 * live below the item-level granularity (voice playground, voice rules).
 *
 * Single source of truth — adding a new nav item automatically opens it
 * up to the agent, and removing one closes it off.
 */
const MODE_LANDING_ROUTES = Object.values(NAVIGATION_MODES).map((m) => m.landingRoute);
const MODE_ITEM_PATHS = Object.values(NAVIGATION_MODES).flatMap((m) =>
  m.items.map((item) => item.path),
);
const TOOL_SUBROUTES = [
  '/brand/overview',
  '/brand/sub-brands',
  '/brand/members',
  '/agents/tone-of-voice',
  '/agents/tone-of-voice/rules',
  '/agents/tone-of-voice/playground',
  '/agents/design-composition',
  '/agents/design-composition/rules',
  '/agents/design-composition/skills',
  '/agents/design-composition/references',
  '/agents/design-composition/evaluation',
  '/agents/design-composition/playground',
  '/agents/design-composition/feedback',
];

export const ALL_NAVIGATION_SLUGS: readonly string[] = Array.from(
  new Set([...MODE_LANDING_ROUTES, ...MODE_ITEM_PATHS, ...TOOL_SUBROUTES]),
);

// ---------------------------------------------------------------------------
// Secondary navigation tabs per section
// ---------------------------------------------------------------------------

export const brandConfigTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'sub-brands', label: 'Sub-brands' },
  { id: 'members', label: 'Members' },
];

/**
 * Per-agent secondary nav — flat tab lists exposed directly in the
 * secondary rail when the user is inside a specific agent. Each agent
 * owns its own rail so the other agents' options aren't visible; the
 * LeftNav icons are the switching surface between agents.
 */
export const toneOfVoiceTabs = [
  { id: 'tone-of-voice', label: 'Configuration' },
  { id: 'tone-of-voice/rules', label: 'Rules' },
  { id: 'tone-of-voice/skills', label: 'Skills' },
  { id: 'tone-of-voice/evaluation', label: 'Evaluation' },
  { id: 'tone-of-voice/playground', label: 'Playground' },
  { id: 'tone-of-voice/feedback', label: 'Feedback' },
];

export const designCompositionTabs = [
  { id: 'design-composition', label: 'Configuration' },
  { id: 'design-composition/rules', label: 'Rules' },
  { id: 'design-composition/skills', label: 'Skills' },
  { id: 'design-composition/references', label: 'References' },
  { id: 'design-composition/evaluation', label: 'Evaluation' },
  { id: 'design-composition/playground', label: 'Playground' },
  { id: 'design-composition/feedback', label: 'Feedback' },
];

export const foundationTabs = [
  { id: 'color', label: 'Color' },
  { id: 'surfaces', label: 'Surfaces' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'materials', label: 'Materials' },
  { id: 'gradients', label: 'Gradients' },
  { id: 'typography', label: 'Typography' },
  { id: 'dimension', label: 'Dimension' },
  { id: 'grid', label: 'Grid' },
  { id: 'platforms', label: 'Density & Platforms' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'strokes', label: 'Strokes' },
  { id: 'elevation', label: 'Elevation' },
  { id: 'motion', label: 'Motion' },
  { id: 'icons', label: 'Icons' },
  { id: 'decorations', label: 'Decorations' },
];

export const createTabs = [
  { id: 'start-here', label: 'Start Here' },
  { id: 'projects', label: 'Projects' },
  { id: 'canvas', label: 'Canvas' },
];

export const componentTabs = [
  { id: 'global', label: 'Global Theme' },
  // Styled — components with token editor + brand customization
  { id: 'styled-divider', label: 'Styled', divider: true },
  { id: 'button', label: 'Button' },
  { id: 'icon-button', label: 'IconButton' },
  { id: 'chip', label: 'Chip' },
  { id: 'chip-group', label: 'ChipGroup' },
  { id: 'selectable-button', label: 'SelectableButton' },
  { id: 'selectable-icon-button', label: 'SelectableIconButton' },
  { id: 'selectable-single-text-button', label: 'SelectableSingleTextButton' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'checkbox-field', label: 'CheckboxField' },
  { id: 'radio-field', label: 'RadioField' },
  { id: 'radio', label: 'Radio' },
  { id: 'switch', label: 'Switch' },
  { id: 'stepper', label: 'Stepper' },
  { id: 'avatar', label: 'Avatar' },
  { id: 'icon', label: 'Icon' },
  { id: 'icon-contained', label: 'IconContained' },
  { id: 'image', label: 'Image' },
  { id: 'logo', label: 'Logo' },
  { id: 'divider', label: 'Divider' },
  { id: 'circular-progress-indicator', label: 'CircularProgress' },
  // All Components — Storybook catalog
  { id: 'all-divider', label: 'All Components', divider: true },
  // Actions
  { id: 'fab', label: 'FAB' },
  { id: 'link-button', label: 'LinkButton' },
  { id: 'single-text-button', label: 'SingleTextButton' },
  // Inputs
  { id: 'input', label: 'Input' },
  { id: 'slider', label: 'Slider' },
  { id: 'touch-slider', label: 'TouchSlider' },
  // Feedback & Status
  { id: 'badge', label: 'Badge' },
  { id: 'counter-badge', label: 'CounterBadge' },
  { id: 'indicator-badge', label: 'IndicatorBadge' },
  { id: 'spinner', label: 'Spinner' },
  // Navigation
  { id: 'tabs', label: 'Tabs' },
  { id: 'pagination-dots', label: 'PaginationDots' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'bottom-navigation', label: 'BottomNavigation' },
  // Overlays
  { id: 'tooltip', label: 'Tooltip' },
  { id: 'modal', label: 'Modal' },
  { id: 'scrim', label: 'Scrim' },
  // Content
  { id: 'card', label: 'Card' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'list-item', label: 'ListItem' },
  { id: 'list-item-group', label: 'ListItemGroup' },
  // Layout
  { id: 'surface', label: 'Surface' },
  { id: 'container', label: 'Container' },
  { id: 'grid', label: 'Grid' },
  { id: 'text', label: 'Text' },
  // Compositions
  { id: 'web-header', label: 'WebHeader' },
  { id: 'chat-composer', label: 'ChatComposer' },
  { id: 'agent-pulse', label: 'AgentPulse' },
];
