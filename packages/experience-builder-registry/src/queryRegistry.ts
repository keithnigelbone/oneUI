/**
 * queryRegistry.ts
 *
 * The deterministic registry adapter for the Jio AI Experience Builder Lab.
 *
 * It exposes the single source of truth — the Jio web alpha component catalog
 * (`@oneui/ui/registry/jioAlphaCatalog`) joined with the per-component
 * generated metadata (`@oneui/shared/meta/generated/*`) — as production-shaped
 * `JioComponentRegistryItem`s (the contract frozen in
 * `@oneui/experience-builder-core`, plan 01).
 *
 * Core-value invariants this module enforces (REG-01/02/03, Pitfalls 5/6):
 *
 *  - **Derive, never hand-author (Pitfall 5).** Every item's id, importPath,
 *    surfaceAware/multiAccent flags trace to `JIO_WEB_ALPHA_COMPONENTS`; props /
 *    variants / slots trace to the generated meta. There is no parallel
 *    hand-maintained registry shape that could drift from the real metadata.
 *  - **Exact membership (REG-03).** `getRegistryItem(id)` is an exact map
 *    lookup. An unregistered id yields a typed component-gap descriptor —
 *    never a fuzzy / near match. (Embeddings are deferred — REG-05.)
 *  - **Jio-only import paths (VAL-02 source / T-01-06).** Every emitted
 *    `importPath` is `@oneui/ui/components/<Folder>`; nothing else can be
 *    smuggled in as "approved".
 *  - **Known-drift exclusion (CONCERNS.md).** `Modal` is excluded from the
 *    generatable set until its metadata drift is fixed, while still being
 *    derived from the same catalog.
 *
 * Deep-import boundary: this module imports `@oneui/ui` ONLY via deep paths
 * (`@oneui/ui/registry/...`), never the `@oneui/ui` barrel (eslint
 * `no-restricted-imports`). It is pure-TS, JSON-compatible, and runs in
 * Node / browser / worker.
 */

import {
  JIO_WEB_ALPHA_COMPONENTS,
  type JioAlphaComponentCatalogEntry,
} from '@oneui/ui/registry/jioAlphaCatalog';
import { COMPONENT_META_REGISTRY } from '@oneui/ui/registry/metaRegistry';
import type { PropDescriptor } from '@oneui/shared';
import type { JioComponentRegistryItemT, JioRegistryPropT } from '@oneui/experience-builder-core';

// ---------------------------------------------------------------------------
// Generated-meta props source (single source of truth for props/variants/slots)
//
// The per-component `*_GENERATED_PROPS` arrays are the machine-generated
// projection of each component's real public API (regenerated via
// `pnpm docs:machine`). Importing them here — rather than re-declaring props —
// is what keeps the Lab registry shape derived rather than hand-authored
// (Pitfall 5). They are pure-TS / node-safe (no React / CSS), unlike the
// `componentRegistry` barrel, so they can be consumed from a node-env adapter.
//
// Catalog entries without a generated-meta file (currently Surface / Container
// / Grid / Carousel) use their checked-in ComponentMeta props. This is still a
// derived source of truth from @oneui/ui, not a Lab-maintained parallel list.
// ---------------------------------------------------------------------------

import { AVATAR_GENERATED_PROPS } from '@oneui/shared/meta/generated/Avatar.generated';
import { BADGE_GENERATED_PROPS } from '@oneui/shared/meta/generated/Badge.generated';
import { BOTTOM_NAVIGATION_GENERATED_PROPS } from '@oneui/shared/meta/generated/BottomNavigation.generated';
import { BUTTON_GENERATED_PROPS } from '@oneui/shared/meta/generated/Button.generated';
import { CHECKBOX_GENERATED_PROPS } from '@oneui/shared/meta/generated/Checkbox.generated';
import { CHIP_GENERATED_PROPS } from '@oneui/shared/meta/generated/Chip.generated';
import { CHIP_GROUP_GENERATED_PROPS } from '@oneui/shared/meta/generated/ChipGroup.generated';
import { COUNTER_BADGE_GENERATED_PROPS } from '@oneui/shared/meta/generated/CounterBadge.generated';
import { DIVIDER_GENERATED_PROPS } from '@oneui/shared/meta/generated/Divider.generated';
import { FAB_GENERATED_PROPS } from '@oneui/shared/meta/generated/FAB.generated';
import { ICON_GENERATED_PROPS } from '@oneui/shared/meta/generated/Icon.generated';
import { ICON_BUTTON_GENERATED_PROPS } from '@oneui/shared/meta/generated/IconButton.generated';
import { IMAGE_GENERATED_PROPS } from '@oneui/shared/meta/generated/Image.generated';
import { INDICATOR_BADGE_GENERATED_PROPS } from '@oneui/shared/meta/generated/IndicatorBadge.generated';
import { INPUT_FIELD_GENERATED_PROPS } from '@oneui/shared/meta/generated/InputField.generated';
import { LINK_BUTTON_GENERATED_PROPS } from '@oneui/shared/meta/generated/LinkButton.generated';
import { LIST_ITEM_GENERATED_PROPS } from '@oneui/shared/meta/generated/ListItem.generated';
import { LIST_ITEM_GROUP_GENERATED_PROPS } from '@oneui/shared/meta/generated/ListItemGroup.generated';
import { LOGO_GENERATED_PROPS } from '@oneui/shared/meta/generated/Logo.generated';
import { PAGINATION_DOTS_GENERATED_PROPS } from '@oneui/shared/meta/generated/PaginationDots.generated';
import { RADIO_GENERATED_PROPS } from '@oneui/shared/meta/generated/Radio.generated';
import { SLIDER_GENERATED_PROPS } from '@oneui/shared/meta/generated/Slider.generated';
import { SPINNER_GENERATED_PROPS } from '@oneui/shared/meta/generated/Spinner.generated';
import { STEPPER_GENERATED_PROPS } from '@oneui/shared/meta/generated/Stepper.generated';
import { SWITCH_GENERATED_PROPS } from '@oneui/shared/meta/generated/Switch.generated';
import { TABS_GENERATED_PROPS } from '@oneui/shared/meta/generated/Tabs.generated';
import { TEXT_GENERATED_PROPS } from '@oneui/shared/meta/generated/Text.generated';
import { TOOLTIP_GENERATED_PROPS } from '@oneui/shared/meta/generated/Tooltip.generated';
import { WEB_HEADER_GENERATED_PROPS } from '@oneui/shared/meta/generated/WebHeader.generated';

const PRIMARY_NAV_GENERATED_PROPS: readonly PropDescriptor[] = [
  { name: 'type', type: 'enum', options: ['homeBar', 'contextBar', 'searchBar'] as const },
  { name: 'middle', type: 'enum', options: ['none', 'fluid', 'centred'] as const },
  { name: 'searchInput', type: 'enum', options: ['none', 'middle', 'end'] as const },
  { name: 'showMenuButton', type: 'boolean' },
  { name: 'primaryNavItems', type: 'boolean' },
  { name: 'divider', type: 'boolean' },
  { name: 'showAvatar', type: 'boolean' },
  { name: 'logo', type: 'ReactNode' },
  { name: 'end', type: 'ReactNode' },
  { name: 'avatar', type: 'ReactNode' },
  { name: 'activeValue', type: 'string' },
  { name: 'children', type: 'ReactNode' },
  { name: 'aria-label', type: 'string' },
  { name: 'aria-labelledby', type: 'string' },
];

const SECONDARY_NAV_GENERATED_PROPS: readonly PropDescriptor[] = [
  { name: 'type', type: 'enum', options: ['navStart', 'navMiddle', 'marketing'] as const },
  { name: 'subheader', type: 'ReactNode' },
  { name: 'end', type: 'ReactNode' },
  { name: 'activeValue', type: 'string' },
  { name: 'children', type: 'ReactNode' },
  { name: 'aria-label', type: 'string' },
  { name: 'aria-labelledby', type: 'string' },
];

const HEADER_ITEM_GENERATED_PROPS: readonly PropDescriptor[] = [
  { name: 'value', type: 'string', required: true },
  { name: 'active', type: 'boolean' },
  { name: 'attention', type: 'enum', options: ['low', 'medium', 'high'] as const },
  { name: 'start', type: 'ReactNode' },
  { name: 'startSize', type: 'enum', options: ['none', 'S', 'M'] as const },
  { name: 'end', type: 'ReactNode' },
  { name: 'endSize', type: 'enum', options: ['none', 'S', 'M'] as const },
  { name: 'href', type: 'string' },
  { name: 'children', type: 'ReactNode', required: true },
];

/**
 * Catalog `name` → generated `PropDescriptor[]`. Keys are exactly the catalog
 * entry names (so the join is by id). Any catalog entry absent from this map
 * has no machine-generated meta yet and contributes empty props/variants/slots
 * — present and derived, never fabricated.
 */
const GENERATED_PROPS_BY_NAME: Readonly<Record<string, readonly PropDescriptor[]>> = {
  Avatar: AVATAR_GENERATED_PROPS,
  Badge: BADGE_GENERATED_PROPS,
  BottomNavigation: BOTTOM_NAVIGATION_GENERATED_PROPS,
  Button: BUTTON_GENERATED_PROPS,
  Checkbox: CHECKBOX_GENERATED_PROPS,
  Chip: CHIP_GENERATED_PROPS,
  ChipGroup: CHIP_GROUP_GENERATED_PROPS,
  CounterBadge: COUNTER_BADGE_GENERATED_PROPS,
  Divider: DIVIDER_GENERATED_PROPS,
  FAB: FAB_GENERATED_PROPS,
  Icon: ICON_GENERATED_PROPS,
  IconButton: ICON_BUTTON_GENERATED_PROPS,
  Image: IMAGE_GENERATED_PROPS,
  IndicatorBadge: INDICATOR_BADGE_GENERATED_PROPS,
  InputField: INPUT_FIELD_GENERATED_PROPS,
  LinkButton: LINK_BUTTON_GENERATED_PROPS,
  ListItem: LIST_ITEM_GENERATED_PROPS,
  ListItemGroup: LIST_ITEM_GROUP_GENERATED_PROPS,
  Logo: LOGO_GENERATED_PROPS,
  PaginationDots: PAGINATION_DOTS_GENERATED_PROPS,
  Radio: RADIO_GENERATED_PROPS,
  Slider: SLIDER_GENERATED_PROPS,
  Spinner: SPINNER_GENERATED_PROPS,
  Stepper: STEPPER_GENERATED_PROPS,
  Switch: SWITCH_GENERATED_PROPS,
  Tabs: TABS_GENERATED_PROPS,
  Text: TEXT_GENERATED_PROPS,
  Tooltip: TOOLTIP_GENERATED_PROPS,
  WebHeader: WEB_HEADER_GENERATED_PROPS,
  PrimaryNav: PRIMARY_NAV_GENERATED_PROPS,
  SecondaryNav: SECONDARY_NAV_GENERATED_PROPS,
  HeaderItem: HEADER_ITEM_GENERATED_PROPS,
  Carousel: COMPONENT_META_REGISTRY.Carousel.props,
  Container: COMPONENT_META_REGISTRY.Container.props,
  Grid: COMPONENT_META_REGISTRY.Grid.props,
  Surface: COMPONENT_META_REGISTRY.Surface.props,
};

// ---------------------------------------------------------------------------
// Known-drift exclusion (CONCERNS.md / Pitfall 5)
//
// Modal shows registry/metadata drift in the base repo (failing
// `check:metadata` / `check:jio-alpha-catalog`). It is excluded from the
// generatable set until fixed — the generator (plan 04) must never select it,
// and an LLM that names it gets a component gap (REG-03), not a near match.
// Text is allowed because Experience Lab recipes need a typography primitive.
// ---------------------------------------------------------------------------

export const KNOWN_DRIFT_EXCLUSIONS: readonly string[] = ['Modal'];

const EXCLUSION_SET = new Set<string>(KNOWN_DRIFT_EXCLUSIONS);

// ---------------------------------------------------------------------------
// Component-gap descriptor (REG-03 / T-01-04)
// ---------------------------------------------------------------------------

/**
 * Returned by `getRegistryItem` when an id is NOT an exact member of the
 * generatable registry. This is the typed gap path — the generator must
 * short-circuit to a component-reference gap card, never substitute a
 * near-match component.
 */
export interface JioComponentGap {
  ok: false;
  kind: 'component-gap';
  /** The unregistered component id that was requested. */
  requestedId: string;
  /**
   * Why the lookup failed: either the id is unknown to the catalog, or it is
   * a known-drift component deliberately excluded from the generatable set.
   */
  reason: 'unregistered' | 'excluded-known-drift';
  /** Human-readable, markup-free explanation for the gap-report card. */
  message: string;
}

export interface JioRegistryItemFound {
  ok: true;
  item: JioComponentRegistryItemT;
}

export type GetRegistryItemResult = JioRegistryItemFound | JioComponentGap;

/** Optional deterministic filter for `queryRegistry`. */
export interface QueryRegistryFilter {
  /** Restrict to surface-aware components. */
  surfaceAware?: boolean;
  /** Restrict to multi-accent components. */
  multiAccent?: boolean;
  /** Restrict to a specific support status. */
  status?: JioAlphaComponentCatalogEntry['status'];
}

// ---------------------------------------------------------------------------
// Derivation helpers
// ---------------------------------------------------------------------------

const VARIANT_PROP_NAMES = new Set(['variant', 'attention', 'appearance']);

function stringifyOption(value: string | number | boolean): string {
  return String(value);
}

/** Build the allowlistable prop list from generated descriptors. */
function deriveProps(descriptors: readonly PropDescriptor[]): JioRegistryPropT[] {
  return (
    descriptors
      // Drop function props (callbacks) — not part of the static allowlist surface.
      .filter((d) => d.type !== 'function')
      .map((d) => {
        const prop: JioRegistryPropT = { name: d.name };
        if (d.options && d.options.length > 0) {
          prop.values = d.options.map(stringifyOption);
        }
        if (d.required) {
          prop.required = true;
        }
        return prop;
      })
  );
}

/**
 * Variants = the union of enumerated values on the canonical variant-defining
 * props (`variant`, falling back to `attention`/`appearance`). Derived from the
 * same generated meta — never a separate hand-kept list.
 */
function deriveVariants(descriptors: readonly PropDescriptor[]): string[] {
  const variantProp =
    descriptors.find((d) => d.name === 'variant') ??
    descriptors.find((d) => VARIANT_PROP_NAMES.has(d.name));
  if (!variantProp?.options) return [];
  return variantProp.options.map(stringifyOption);
}

/**
 * Slots = the names of `ReactNode`-typed props (content slots such as
 * `children`, `start`, `end`). Derived from the generated meta, so it stays in
 * lockstep with the real component API.
 */
function deriveSlots(descriptors: readonly PropDescriptor[]): string[] {
  return descriptors.filter((d) => d.type === 'ReactNode').map((d) => d.name);
}

/**
 * Build the production-shaped registry item for one catalog entry by joining
 * catalog facts (id/importPath/flags) with generated-meta facts
 * (props/variants/slots).
 */
function toRegistryItem(entry: JioAlphaComponentCatalogEntry): JioComponentRegistryItemT {
  const descriptors = GENERATED_PROPS_BY_NAME[entry.name] ?? [];
  return {
    id: entry.name,
    name: entry.name,
    status: entry.status,
    // Catalog always defines importPath for alpha entries; assert the
    // Jio-component shape so a malformed catalog row surfaces loudly.
    importPath: entry.importPath ?? `@oneui/ui/components/${entry.name}`,
    storyPath: entry.storyPath,
    docsPath: entry.docsPath,
    surfaceAware: entry.surfaceAware,
    multiAccent: entry.multiAccent,
    props: deriveProps(descriptors),
    variants: deriveVariants(descriptors),
    slots: deriveSlots(descriptors),
    // States / per-brand / per-profile support and token dependencies are not
    // yet machine-derivable from the alpha catalog + generated props; they
    // default to empty (contract-shaped, never fabricated). Plan 03/04 enrich.
    states: [],
    supportedBrands: [],
    supportedProfiles: [],
    tokenDependencies: [],
    usageRules: [],
    antiPatterns: [],
    notes: entry.notes,
  };
}

// ---------------------------------------------------------------------------
// The generatable registry (built once, deterministically)
// ---------------------------------------------------------------------------

/** All catalog entries minus the known-drift exclusions. */
const GENERATABLE_ENTRIES: readonly JioAlphaComponentCatalogEntry[] =
  JIO_WEB_ALPHA_COMPONENTS.filter((entry) => !EXCLUSION_SET.has(entry.name));

/** Deterministically-ordered list of registry items (catalog order preserved). */
const REGISTRY_ITEMS: readonly JioComponentRegistryItemT[] =
  GENERATABLE_ENTRIES.map(toRegistryItem);

/** Exact-lookup index by id (REG-03 membership). */
const REGISTRY_BY_ID: ReadonlyMap<string, JioComponentRegistryItemT> = new Map(
  REGISTRY_ITEMS.map((item) => [item.id, item])
);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return the production-shaped, catalog-derived registry candidates, optionally
 * narrowed by a deterministic filter. This is what the generator (plan 04)
 * retrieves from BEFORE generating (REG-02). Known-drift components are never
 * present (CONCERNS.md). The returned array is a fresh copy each call.
 */
export function queryRegistry(filter?: QueryRegistryFilter): JioComponentRegistryItemT[] {
  let items = REGISTRY_ITEMS.slice();
  if (filter) {
    if (filter.surfaceAware !== undefined) {
      items = items.filter((i) => i.surfaceAware === filter.surfaceAware);
    }
    if (filter.multiAccent !== undefined) {
      items = items.filter((i) => i.multiAccent === filter.multiAccent);
    }
    if (filter.status !== undefined) {
      items = items.filter((i) => i.status === filter.status);
    }
  }
  return items;
}

/**
 * EXACT membership lookup (REG-03 / T-01-04). Returns the registry item when
 * `id` is an exact member of the generatable set, otherwise a typed
 * component-gap descriptor. NEVER a fuzzy / near match. Known-drift exclusions
 * resolve to a gap with `reason: 'excluded-known-drift'`.
 */
export function getRegistryItem(id: string): GetRegistryItemResult {
  const item = REGISTRY_BY_ID.get(id);
  if (item) {
    return { ok: true, item };
  }
  if (EXCLUSION_SET.has(id)) {
    return {
      ok: false,
      kind: 'component-gap',
      requestedId: id,
      reason: 'excluded-known-drift',
      message: `Component "${id}" exists in the Jio catalog but is excluded from the generatable set due to known metadata drift. It cannot be emitted until the drift is resolved.`,
    };
  }
  return {
    ok: false,
    kind: 'component-gap',
    requestedId: id,
    reason: 'unregistered',
    message: `Component "${id}" is not a registered Jio component. Only registry-approved components may be emitted; this is a component gap.`,
  };
}

/** Convenience boolean membership check (exact lookup). */
export function isRegistered(id: string): boolean {
  return REGISTRY_BY_ID.has(id);
}
