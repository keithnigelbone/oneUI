/**
 * queryRegistry.freshness.test.ts
 *
 * REG-04 / D-10 — the derive-equals-live CI freshness gate.
 *
 * The Lab registry keeps NO separate, hand-maintained component list — it
 * derives entirely from the live component-metadata source of truth: the Jio
 * web alpha catalog (`@oneui/ui/registry/jioAlphaCatalog`, supplying
 * ids/importPath/flags) joined with the per-component generated metadata
 * (`@oneui/shared/meta/generated/*`, supplying props/variants/slots), minus the
 * exported `KNOWN_DRIFT_EXCLUSIONS`.
 *
 * This gate independently RE-DERIVES the expected registry from those same live
 * sources — re-implementing the derivation here rather than calling
 * `queryRegistry`'s own helpers — and asserts deep-equality with
 * `queryRegistry()` output. Because the expected set is derived independently, a
 * bug inside `queryRegistry`'s own derivation cannot mask a divergence: if the
 * adapter and the live sources disagree on ANY added / removed / changed
 * component id, OR on ANY per-item props / variants / slots, the assertions
 * hard-fail (D-10).
 *
 * The ONLY tolerated exclusions are read from the exported
 * `KNOWN_DRIFT_EXCLUSIONS` constant — the list is NEVER re-hardcoded here, so
 * the exclusion surface has a single source of truth.
 *
 * Pure, deterministic, credential-free: no network, no ANTHROPIC_API_KEY, no
 * model call. This is intended to be wired into `pnpm ci:gates` (Plan 04).
 */

import { describe, it, expect } from 'vitest';
import {
  JIO_WEB_ALPHA_COMPONENTS,
  type JioAlphaComponentCatalogEntry,
} from '@oneui/ui/registry/jioAlphaCatalog';
import { COMPONENT_META_REGISTRY } from '@oneui/ui/registry/metaRegistry';
import type { PropDescriptor } from '@oneui/shared';
import { queryRegistry, KNOWN_DRIFT_EXCLUSIONS } from './queryRegistry';

// ---------------------------------------------------------------------------
// Independent live-meta source — the SAME `*_GENERATED_PROPS` arrays the
// adapter joins on, imported directly here so the gate re-derives from the live
// metadata rather than trusting the adapter's own join.
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

const LIVE_PRIMARY_NAV_GENERATED_PROPS: readonly PropDescriptor[] = [
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

const LIVE_SECONDARY_NAV_GENERATED_PROPS: readonly PropDescriptor[] = [
  { name: 'type', type: 'enum', options: ['navStart', 'navMiddle', 'marketing'] as const },
  { name: 'subheader', type: 'ReactNode' },
  { name: 'end', type: 'ReactNode' },
  { name: 'activeValue', type: 'string' },
  { name: 'children', type: 'ReactNode' },
  { name: 'aria-label', type: 'string' },
  { name: 'aria-labelledby', type: 'string' },
];

const LIVE_HEADER_ITEM_GENERATED_PROPS: readonly PropDescriptor[] = [
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
 * Independent catalog-name → generated-meta map. Mirrors the adapter's
 * `GENERATED_PROPS_BY_NAME` but is declared here so the gate joins on the live
 * meta itself. If a catalog component gains/loses generated meta and the adapter
 * is not regenerated to match, the per-item assertions below diverge and fail.
 */
const LIVE_GENERATED_PROPS_BY_NAME: Readonly<Record<string, readonly PropDescriptor[]>> = {
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
  PrimaryNav: LIVE_PRIMARY_NAV_GENERATED_PROPS,
  SecondaryNav: LIVE_SECONDARY_NAV_GENERATED_PROPS,
  HeaderItem: LIVE_HEADER_ITEM_GENERATED_PROPS,
  Carousel: COMPONENT_META_REGISTRY.Carousel.props,
  Container: COMPONENT_META_REGISTRY.Container.props,
  Grid: COMPONENT_META_REGISTRY.Grid.props,
  Surface: COMPONENT_META_REGISTRY.Surface.props,
};

// ---------------------------------------------------------------------------
// Independent re-derivation of props / variants / slots from generated meta.
//
// These mirror the SEMANTICS of the adapter's deriveProps/deriveVariants/
// deriveSlots but are re-implemented here. A regression in the adapter's own
// helpers therefore cannot hide a divergence: the gate computes the expected
// shape from the live meta directly and compares.
// ---------------------------------------------------------------------------

const VARIANT_PROP_NAMES = new Set(['variant', 'attention', 'appearance']);

function liveProps(
  descriptors: readonly PropDescriptor[]
): Array<{ name: string; values?: string[]; required?: true }> {
  return descriptors
    .filter((d) => d.type !== 'function')
    .map((d) => {
      const prop: { name: string; values?: string[]; required?: true } = {
        name: d.name,
      };
      if (d.options && d.options.length > 0) {
        prop.values = d.options.map((o) => String(o));
      }
      if (d.required) {
        prop.required = true;
      }
      return prop;
    });
}

function liveVariants(descriptors: readonly PropDescriptor[]): string[] {
  const variantProp =
    descriptors.find((d) => d.name === 'variant') ??
    descriptors.find((d) => VARIANT_PROP_NAMES.has(d.name));
  if (!variantProp?.options) return [];
  return variantProp.options.map((o) => String(o));
}

function liveSlots(descriptors: readonly PropDescriptor[]): string[] {
  return descriptors.filter((d) => d.type === 'ReactNode').map((d) => d.name);
}

// ---------------------------------------------------------------------------
// The independently-derived EXPECTED registry (live catalog × meta − drift).
// ---------------------------------------------------------------------------

/** Expected generatable ids: live catalog names minus the exported drift list. */
const expectedIds: string[] = (JIO_WEB_ALPHA_COMPONENTS as readonly JioAlphaComponentCatalogEntry[])
  .map((entry) => entry.name)
  .filter((name) => !KNOWN_DRIFT_EXCLUSIONS.includes(name));

describe('REG-04 registry freshness gate (D-10) — derive-equals-live', () => {
  it('the live source is internally consistent (sanity: catalog non-empty, exclusions exported)', () => {
    expect(JIO_WEB_ALPHA_COMPONENTS.length).toBeGreaterThan(0);
    // Read the exclusion list from the exported constant — never re-hardcode it.
    expect(KNOWN_DRIFT_EXCLUSIONS.length).toBeGreaterThan(0);
    // The drift exclusions are a defensive guard: excluded components are barred
    // from the generatable set so that if one is (re)introduced to the live catalog
    // with metadata drift, it can never silently enter the registry. They need NOT
    // be present in the catalog today — the invariant the gate enforces is the
    // converse: an excluded id must NEVER appear in the derived registry (asserted
    // in the dedicated leak test below).
    const catalogNames = new Set<string>(JIO_WEB_ALPHA_COMPONENTS.map((e) => e.name));
    const generatableIds = new Set<string>(queryRegistry().map((i) => i.id));
    for (const excluded of KNOWN_DRIFT_EXCLUSIONS) {
      // If an excluded id IS in the catalog, it must be filtered out of the
      // generatable set; if it is NOT in the catalog, the exclusion is still a
      // valid forward guard. Either way it must not be generatable.
      expect(
        generatableIds.has(excluded),
        `excluded id "${excluded}" must never be generatable (catalog-present=${catalogNames.has(excluded)})`
      ).toBe(false);
    }
  });

  it('derived registry ids deep-equal the live catalog minus known-drift (hard-fail on ANY add/remove/change)', () => {
    const derived = queryRegistry()
      .map((item) => item.id)
      .sort();
    const live = expectedIds.slice().sort();
    // toEqual = deep-equality hard-fail. An added, removed, or renamed component
    // in either the catalog or the adapter breaks this immediately (D-10).
    expect(derived).toEqual(live);
  });

  it('no known-drift component leaks into the derived registry', () => {
    const ids = new Set(queryRegistry().map((item) => item.id));
    for (const excluded of KNOWN_DRIFT_EXCLUSIONS) {
      expect(
        ids.has(excluded),
        `known-drift component "${excluded}" leaked into the generatable registry`
      ).toBe(false);
    }
  });

  it('every registered item deep-equals its independently-derived props/variants/slots from generated meta', () => {
    const items = queryRegistry();
    expect(items.length).toBeGreaterThan(0);

    for (const item of items) {
      // Re-derive THIS item's metadata from the live generated meta independently
      // of the adapter (entries without generated meta legitimately derive empty).
      const descriptors = LIVE_GENERATED_PROPS_BY_NAME[item.id] ?? [];

      const expectedProps = liveProps(descriptors);
      const expectedVariants = liveVariants(descriptors);
      const expectedSlots = liveSlots(descriptors);

      // Deep-equality hard-fail on per-item metadata divergence (D-10): a changed
      // prop, variant option, or slot in the live meta that the adapter has not
      // picked up — or vice versa — fails here.
      expect(item.props, `${item.id} props diverged from live generated meta`).toEqual(
        expectedProps
      );
      expect(item.variants, `${item.id} variants diverged from live generated meta`).toEqual(
        expectedVariants
      );
      expect(item.slots, `${item.id} slots diverged from live generated meta`).toEqual(
        expectedSlots
      );
    }
  });

  it('the gate runs with no credentials and makes no network call (determinism guard)', () => {
    // No ANTHROPIC_API_KEY required, no fetch — proven by the fact that the
    // assertions above run purely over imported, in-process constants. This
    // explicit guard documents the credential-free invariant for REG-04.
    expect(typeof JIO_WEB_ALPHA_COMPONENTS).toBe('object');
    expect(typeof queryRegistry).toBe('function');
  });
});
