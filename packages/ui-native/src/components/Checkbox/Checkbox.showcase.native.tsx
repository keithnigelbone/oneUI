/**
 * Checkbox.showcase.native.tsx
 *
 * RN mirror of `Checkbox.showcase.tsx` and the story matrix in
 * `Checkbox.stories.tsx`. Each export shadows a Storybook story so the
 * native component-gallery screen stays in lockstep with what reviewers
 * see on the web.
 *
 * Sections:
 *   - CheckboxDefault       (Default with label, neutral / m)
 *   - CheckboxSizes         (s / m / l × unselected / selected / indeterminate)
 *   - CheckboxStates        (default / selected / indeterminate / disabled / read-only)
 *   - CheckboxAccents       (primary / secondary / sparkle fill roles)
 *   - CheckboxAppearances   (8 roles × 3 states)
 *   - CheckboxReadOnly      (s / m / l × unselected / selected / indeterminate, readOnly)
 *   - CheckboxWithLabel     (label-length variations + small / large)
 *   - CheckboxSurfaceContext(default / minimal / subtle / moderate / bold / elevated)
 *   - CheckboxThemes        (BG surface modes × secondary fills)
 *
 * Web parity gaps documented in
 * `docs/parity/checkbox-web-native-parity.md`:
 *   - The `Motion` story (press-scale + indeterminate↔selected rotation
 *     crossfade) is not mirrored — native uses opacity fade only.
 *   - The `FocusState` story has no native equivalent (RN touch surfaces
 *     have no focus indicator).
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { Surface, useSurfaceTokens } from '../../theme';
import { Checkbox } from './Checkbox.native';

// ─── Layout helpers ─────────────────────────────────────────────────────────

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const labeledItem: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: tokens.spacing['3'],
};

const rowLabel: StyleProp<ViewStyle> = {
  minWidth: tokens.spacing['10'],
};

const themeCell: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4'],
  padding: tokens.spacing['4-5'],
  borderRadius: tokens.shape.m,
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        color: role.content.low,
      }}
    >
      {children}
    </Text>
  );
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

const SIZES = ['s', 'm', 'l'] as const;
const SIZE_LABELS: Record<(typeof SIZES)[number], string> = { s: 'S', m: 'M', l: 'L' };
const ACCENT_ROLES = ['primary', 'secondary', 'sparkle'] as const;
const APPEARANCE_ROLES = COMPONENT_APPEARANCE_ROLES.filter(
  (r) => r !== 'sparkle' && r !== 'brand-bg',
);

// ─── Showcase exports ───────────────────────────────────────────────────────

/**
 * Mirrors `CheckboxStories.Default` — interactive uncontrolled checkbox
 * with label, default size and appearance.
 */
export function CheckboxDefault(): React.ReactElement {
  return (
    <View style={column}>
      <Checkbox label='Accept terms and conditions' />
    </View>
  );
}

/**
 * S / M / L sizes × unselected / selected / indeterminate.
 * Mirrors `CheckboxShowcase.CheckboxSizes`.
 */
export function CheckboxSizes(): React.ReactElement {
  return (
    <View style={column}>
      {SIZES.map((size) => (
        <View
          key={size}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['4'],
          }}
        >
          <View style={rowLabel}>
            <Label>{SIZE_LABELS[size]}</Label>
          </View>
          <View style={row}>
            <Checkbox size={size} selected={false} />
            <Checkbox size={size} selected />
            <Checkbox size={size} indeterminate />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * All visual states — unselected, selected, indeterminate, disabled, read-only.
 * Mirrors `CheckboxShowcase.CheckboxStates`.
 */
export function CheckboxStates(): React.ReactElement {
  return (
    <View style={column}>
      {[
        { label: 'Unselected', el: <Checkbox selected={false} label='Label' /> },
        { label: 'Checked', el: <Checkbox selected label='Label' /> },
        { label: 'Indeterminate', el: <Checkbox indeterminate label='Label' /> },
        { label: 'Disabled (unselected)', el: <Checkbox disabled selected={false} label='Label' /> },
        { label: 'Disabled (selected)', el: <Checkbox disabled selected label='Label' /> },
        { label: 'Read-only (unselected)', el: <Checkbox readOnly selected={false} label='Label' /> },
        { label: 'Read-only (selected)', el: <Checkbox readOnly selected label='Label' /> },
      ].map(({ label, el }) => (
        <View
          key={label}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['5'],
          }}
        >
          <View style={{ minWidth: tokens.spacing['24'] }}>
            <Label>{label}</Label>
          </View>
          {el}
        </View>
      ))}
    </View>
  );
}

/**
 * Primary / secondary / sparkle as **`appearance`** (border + fill).
 * Mirrors `CheckboxShowcase.CheckboxAccents`.
 */
export function CheckboxAccents(): React.ReactElement {
  return (
    <View style={row}>
      {ACCENT_ROLES.map((appearance) => (
        <View key={appearance} style={labeledItem}>
          <Label>{appearance}</Label>
          <View style={row}>
            <Checkbox appearance={appearance} />
            <Checkbox appearance={appearance} selected />
            <Checkbox appearance={appearance} indeterminate />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * 8 appearance roles × (unselected / selected / indeterminate). Mirrors the
 * Storybook `Appearances` story.
 */
export function CheckboxAppearances(): React.ReactElement {
  return (
    <View style={column}>
      {APPEARANCE_ROLES.map((appearance) => (
        <View
          key={appearance}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['5'],
            flexWrap: 'wrap',
          }}
        >
          <View style={{ minWidth: tokens.spacing['24'] }}>
            <Label>{appearance}</Label>
          </View>
          <View style={row}>
            <Checkbox appearance={appearance} />
            <Checkbox appearance={appearance} selected />
            <Checkbox appearance={appearance} indeterminate />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * S / M / L × read-only unselected / selected / indeterminate.
 * Mirrors `CheckboxShowcase.CheckboxReadOnly`.
 */
export function CheckboxReadOnly(): React.ReactElement {
  return (
    <View style={column}>
      {SIZES.map((size) => (
        <View
          key={size}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['4'],
          }}
        >
          <View style={rowLabel}>
            <Label>{SIZE_LABELS[size]}</Label>
          </View>
          <View style={row}>
            <Checkbox size={size} readOnly selected={false} />
            <Checkbox size={size} readOnly selected />
            <Checkbox size={size} readOnly indeterminate />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Short / medium / long labels + size-aware label typography.
 * Mirrors `CheckboxShowcase.CheckboxWithLabel`.
 */
export function CheckboxWithLabel(): React.ReactElement {
  return (
    <View style={[column, { maxWidth: tokens.spacing['40'] }]}>
      <Checkbox selected label='Short label' />
      <Checkbox label='A medium-length label for a checkbox option' />
      <Checkbox
        selected
        label='A longer label that demonstrates how the checkbox aligns with multi-line text content that wraps to the next line'
      />
      <Checkbox
        size='s'
        label='Small checkbox'
        description='Compact body description to verify font size'
      />
      <Checkbox
        size='l'
        label='Large checkbox'
        description='Inline supplementary description renders below the label.'
      />
    </View>
  );
}

/**
 * Six surface modes × (unselected / selected / indeterminate) using the
 * secondary appearance — same pattern as the web Storybook
 * `SurfaceContext` story.
 */
export function CheckboxSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default', desc: 'page background' },
    { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
    { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
    { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
    { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
    { mode: 'elevated' as const, label: 'elevated', desc: 'floating card' },
  ];

  return (
    <View style={column}>
      {surfaceModes.map(({ mode, label, desc }) => (
        <View key={mode} style={{ flexDirection: 'column', gap: tokens.spacing['3'] }}>
          <Label>
            {label} — {desc}
          </Label>
          <Surface mode={mode} style={themeCell}>
            <Checkbox appearance='secondary' label='Checked' selected />
            <Checkbox appearance='secondary' label='Unselected' />
            <Checkbox appearance='secondary' label='Indeterminate' indeterminate />
          </Surface>
        </View>
      ))}
    </View>
  );
}

/**
 * BG surface modes × secondary fills (mirrors the web Storybook `Themes`
 * story which iterates over a small set of surface modes and overrides
 * the surface fill tokens with secondary equivalents).
 */
export function CheckboxThemes(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default' },
    { mode: 'minimal' as const, label: 'minimal' },
    { mode: 'subtle' as const, label: 'subtle' },
    { mode: 'bold' as const, label: 'bold' },
    { mode: 'elevated' as const, label: 'elevated' },
  ];

  return (
    <View style={column}>
      {surfaceModes.map(({ mode, label }) => (
        <View
          key={mode}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['4'],
            flexWrap: 'wrap',
          }}
        >
          <View style={rowLabel}>
            <Label>{label}</Label>
          </View>
          <Surface mode={mode} style={themeCell}>
            <Checkbox appearance='secondary' />
            <Checkbox appearance='secondary' selected />
            <Checkbox appearance='secondary' indeterminate />
            <Checkbox appearance='secondary' label='Label' />
            <Checkbox appearance='secondary' label='Label' selected />
          </Surface>
        </View>
      ))}
    </View>
  );
}

/**
 * Local interactive demo — uncontrolled toggle to verify press handler +
 * controlled state plumbing in the gallery without a parent harness.
 */
export function CheckboxInteractive(): React.ReactElement {
  const [selected, setSelected] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  return (
    <View style={column}>
      <SectionLabel>Controlled</SectionLabel>
      <Checkbox
        label={`Toggle me — currently ${indeterminate ? 'mixed' : selected ? 'selected' : 'unselected'}`}
        selected={selected}
        indeterminate={indeterminate}
        onSelectedChange={(next) => {
          setIndeterminate(false);
          setSelected(next);
        }}
      />
      <View style={row}>
        <Checkbox label='Toggle indeterminate' onSelectedChange={() => setIndeterminate((v) => !v)} />
      </View>
    </View>
  );
}
