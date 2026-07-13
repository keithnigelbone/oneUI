/**
 * JDSPrimaryNav — RN knowledge entry for HeaderNative.PrimaryNav.
 *
 * Mirrors the native-owned prop contract at
 * `packages/ui-native/src/components/HeaderNative/interface.ts` (`PrimaryNavProps`).
 * Figma source of truth: HeaderNative.PrimaryNav (2134:13491).
 *
 * Chrome row only — NO `children` prop. Content is passed via `startSlot`
 * (logo/back), `avatarSlot` (when `avatar=true`), and `endSlot` (actions).
 * Figma models these as nested "start"/"middle"/"end" frames inside a "Row 1"
 * wrapper; codegen must route that content into the slot props, not children.
 */

import { defineComponent } from '../defineComponent';

export const JDSPrimaryNav = defineComponent({
  schemaVersion: '5.0.0',
  name: 'PrimaryNav',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'HeaderNative chrome row — logo/back (startSlot), optional title/search, end actions (endSlot), optional avatar (avatarSlot). No children slot.',

  propsSchema: {
    $id: 'jds.kb.rn.PrimaryNav',
    type: 'object',
    properties: {
      type: { enum: ['homeBar', 'contextBar', 'searchBar'], default: 'homeBar' },
      expanded: { type: 'boolean', default: false, description: 'Two-row layout with a Headline/L title on row two. Requires titleContent.' },
      start: { type: 'boolean', default: true, description: 'Show the start slot.' },
      end: { type: 'boolean', default: true, description: 'Show the end slot.' },
      endActions: { enum: ['Button', 'IconButton'], description: 'Instance-swap hint for the end slot content type.' },
      avatar: { type: 'boolean', default: false, description: 'Show the avatar in the end area — requires avatarSlot.' },
      secondaryText: { type: 'boolean', default: false, description: 'contextBar only — show secondaryTextContent.' },
      searchInput: { type: 'boolean', default: false, description: 'homeBar only — inline search pill in the middle row.' },
      startSlot: { description: 'Start slot content — logo, back button, etc.' },
      endSlot: { description: 'End slot content — IconButtons / Buttons.' },
      avatarSlot: { description: 'Avatar element when avatar=true.' },
      titleContent: { type: 'string', description: 'contextBar collapsed — Title/M inline; expanded (any type) — Headline/L on row two.' },
      secondaryTextContent: { type: 'string' },
      searchPlaceholder: { type: 'string' },
      searchValue: { type: 'string' },
      searchAriaLabel: { type: 'string' },
      searchEndSlot: { description: 'Trailing slot inside the searchBar Input (default: microphone).' },
    },
  },

  tokens: {
    color: ['neutral', 'primary'],
    typography: ['title.M', 'headline.L'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-header-native-primarynav-v1',
    keyHistory: [],
    variantProperties: { Component: 'HeaderNative.PrimaryNav' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['navigation', 'header', 'app-shell', 'compound'],
} as const);
