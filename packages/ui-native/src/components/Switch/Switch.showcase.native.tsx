/**
 * Switch.showcase.native.tsx
 *
 * Full mirror of the web `Switch.stories.tsx` + `Switch.showcase.tsx` matrix.
 * Every exported function corresponds to a named Storybook story.
 *
 * Stories covered:
 *   Default            — interactive uncontrolled with label
 *   SwitchSizes        — S / M / L × unchecked / checked
 *   SwitchStates       — off / on / disabled-off / disabled-on / readonly-off / readonly-on
 *   SwitchAppearances  — all 7 roles × unchecked / checked / readOnly-unchecked / readOnly-checked
 *   SwitchAccents      — primary / secondary / sparkle × unchecked / checked
 *   SwitchReadOnly     — all 9 appearances × readOnly unchecked / checked
 *   SwitchWithLabel    — short / medium / long / multi-line labels, all sizes
 *   SwitchSurfaceContext — all 6 surface modes × checked / unchecked / readOnly
 *   SwitchControlled   — external state binding
 *
 * Web parity notes:
 *   - FocusState: RN has no keyboard focus ring — idle state shown instead.
 *   - Motion: no autoplay; interaction drives the Animated spring.
 *   - Accent cross-role: listed as v1 gap in parity doc; switches still render.
 */

import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Surface, useSurfaceTokens } from '../../theme';
import { Switch } from './Switch.native';

// ─── Shared layout ────────────────────────────────────────────────────────────

const column = { flexDirection: 'column' as const, gap: tokens.spacing['4-5'] };
const row = {
  flexDirection: 'row' as const,
  flexWrap: 'wrap' as const,
  alignItems: 'center' as const,
  gap: tokens.spacing['4'],
};

// ─── Typography helpers ───────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        lineHeight: typography.size.xs * 1.4,
        color: role.content.low,
      }}
    >
      {children}
    </Text>
  );
}

function RowLabel({
  children,
  width = tokens.spacing['28'],
}: {
  children: React.ReactNode;
  width?: number;
}) {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.s,
        lineHeight: typography.size.s * 1.4,
        fontWeight: typography.weight.medium,
        color: role.content.high,
        width,
      }}
    >
      {children}
    </Text>
  );
}

function ColHeader({ children }: { children: React.ReactNode }) {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        lineHeight: typography.size.xs * 1.4,
        fontWeight: typography.weight.medium,
        color: role.content.low,
        width: tokens.spacing['20'],
        textAlign: 'center',
      }}
    >
      {children}
    </Text>
  );
}

// ─── Appearance roles ─────────────────────────────────────────────────────────

const MATRIX_APPEARANCES = [
  'primary',
  'neutral',
  'secondary',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

const READONLY_APPEARANCES = [
  'primary',
  'neutral',
  'secondary',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

const ACCENT_FILLS = ['primary', 'secondary', 'sparkle'] as const;

// ─── Showcase exports ─────────────────────────────────────────────────────────

/**
 * Default — interactive uncontrolled with label.
 * Mirrors `Default` story.
 */
export function SwitchDefault(): React.ReactElement {
  return (
    <View style={column}>
      <Switch>Enable notifications</Switch>
      <Switch defaultChecked>Enable notifications</Switch>
    </View>
  );
}

/**
 * S / M / L × unchecked / checked.
 * Mirrors `Sizes` story.
 */
export function SwitchSizes(): React.ReactElement {
  return (
    <View style={column}>
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}>
        <View style={{ width: tokens.spacing['12'] }} />
        <ColHeader>Unchecked</ColHeader>
        <ColHeader>Checked</ColHeader>
      </View>
      {(['s', 'm', 'l'] as const).map((size) => (
        <View
          key={size}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}
        >
          <RowLabel width={tokens.spacing['12']}>{size.toUpperCase()}</RowLabel>
          <View style={{ width: tokens.spacing['20'], alignItems: 'center' }}>
            <Switch size={size} checked={false} onCheckedChange={() => { }} />
          </View>
          <View style={{ width: tokens.spacing['20'], alignItems: 'center' }}>
            <Switch size={size} checked onCheckedChange={() => { }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * All visual states — off / on / disabled-off / disabled-on / readonly-off / readonly-on.
 * Mirrors `States` story.
 */
export function SwitchStates(): React.ReactElement {
  return (
    <View style={column}>
      {[
        { label: 'Unchecked', el: <Switch checked={false} onCheckedChange={() => { }}>Label</Switch> },
        { label: 'Checked', el: <Switch checked onCheckedChange={() => { }}>Label</Switch> },
        { label: 'Disabled (unchecked)', el: <Switch disabled checked={false} onCheckedChange={() => { }}>Label</Switch> },
        { label: 'Disabled (checked)', el: <Switch disabled checked onCheckedChange={() => { }}>Label</Switch> },
        { label: 'Read-only (unchecked)', el: <Switch readOnly checked={false} onCheckedChange={() => { }}>Label</Switch> },
        { label: 'Read-only (checked)', el: <Switch readOnly checked onCheckedChange={() => { }}>Label</Switch> },
      ].map(({ label, el }) => (
        <View
          key={label}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['5'] }}
        >
          <RowLabel width={tokens.spacing['32']}>{label}</RowLabel>
          {el}
        </View>
      ))}
    </View>
  );
}

/** Reusable 7-role × 4-state matrix — rendered once per surface context. */
function AppearanceMatrix(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['1-5'] }}>
        <View style={{ width: tokens.spacing['28'] }} />
        <ColHeader>Unchecked</ColHeader>
        <ColHeader>Checked</ColHeader>
        <ColHeader>RO off</ColHeader>
        <ColHeader>RO on</ColHeader>
      </View>
      {MATRIX_APPEARANCES.map((appearance) => (
        <View
          key={appearance}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['1-5'] }}
        >
          <RowLabel>{appearance}</RowLabel>
          <View style={{ width: tokens.spacing['20'], alignItems: 'center' }}>
            <Switch appearance={appearance} checked={false} onCheckedChange={() => { }} />
          </View>
          <View style={{ width: tokens.spacing['20'], alignItems: 'center' }}>
            <Switch appearance={appearance} checked onCheckedChange={() => { }} />
          </View>
          <View style={{ width: tokens.spacing['20'], alignItems: 'center' }}>
            <Switch appearance={appearance} readOnly checked={false} />
          </View>
          <View style={{ width: tokens.spacing['20'], alignItems: 'center' }}>
            <Switch appearance={appearance} readOnly checked />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * All 7 roles × 4 states, repeated on 5 surface contexts.
 * Mirrors `Appearances` story — default surface + subtle/bold × primary/secondary.
 */
export function SwitchAppearances(): React.ReactElement {
  const surfaceContexts = [
    { label: 'default surface', mode: undefined, appearance: undefined },
    { label: 'subtle — primary', mode: 'subtle' as const, appearance: 'primary' as const },
    { label: 'bold — primary', mode: 'bold' as const, appearance: 'primary' as const },
    { label: 'subtle — secondary', mode: 'subtle' as const, appearance: 'secondary' as const },
    { label: 'bold — secondary', mode: 'bold' as const, appearance: 'secondary' as const },
  ];

  return (
    <View style={{ ...column, gap: tokens.spacing['6'] }}>
      {surfaceContexts.map(({ label, mode, appearance }) =>
        mode ? (
          <View key={label} style={column}>
            <Label>{label}</Label>
            <Surface
              mode={mode}
              appearance={appearance}
              style={{
                padding: tokens.spacing['5'],
                borderRadius: tokens.shape.m,
              }}
            >
              <AppearanceMatrix />
            </Surface>
          </View>
        ) : (
          <View key={label} style={column}>
            <Label>{label}</Label>
            <AppearanceMatrix />
          </View>
        ),
      )}
    </View>
  );
}

/**
 * Three accent fill colors — primary / secondary / sparkle × unchecked / checked.
 * Mirrors `Accents` story.
 */
export function SwitchAccents(): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', gap: tokens.spacing['6'], flexWrap: 'wrap' }}>
      {ACCENT_FILLS.map((accent) => (
        <View
          key={accent}
          style={{ flexDirection: 'column', alignItems: 'center', gap: tokens.spacing['3-5'] }}
        >
          <Label>{accent}</Label>
          <View style={{ flexDirection: 'row', gap: tokens.spacing['3-5'] }}>
            <Switch accent={accent} checked={false} onCheckedChange={() => { }} />
            <Switch accent={accent} checked onCheckedChange={() => { }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * All 9 appearances × readOnly unchecked / checked.
 * Mirrors `ReadOnly` story.
 */
export function SwitchReadOnly(): React.ReactElement {
  return (
    <View style={column}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['3'] }}>
        <View style={{ width: tokens.spacing['28'] }} />
        <ColHeader>Unchecked</ColHeader>
        <ColHeader>Checked</ColHeader>
      </View>
      {READONLY_APPEARANCES.map((appearance) => (
        <View
          key={appearance}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['3'] }}
        >
          <RowLabel>{appearance}</RowLabel>
          <View style={{ width: tokens.spacing['20'], alignItems: 'center' }}>
            <Switch readOnly appearance={appearance} checked={false} />
          </View>
          <View style={{ width: tokens.spacing['20'], alignItems: 'center' }}>
            <Switch readOnly appearance={appearance} checked />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Short / medium / long labels — alignment across sizes.
 * Mirrors `WithLabel` story.
 */
export function SwitchWithLabel(): React.ReactElement {
  return (
    <View style={{ ...column, maxWidth: 320 }}>
      <Switch checked>Short label</Switch>
      <Switch>A medium-length label for a switch option</Switch>
      <Switch checked>
        A longer label that demonstrates how the switch aligns with multi-line text content
        that wraps to the next line
      </Switch>
      <Switch size="s">Small switch with label</Switch>
      <Switch size="l">Large switch with label</Switch>
      <Switch disabled>Disabled option</Switch>
      <Switch readOnly checked>Read-only checked</Switch>
    </View>
  );
}

/**
 * All 6 surface modes × checked / unchecked / readOnly off / readOnly on
 * with secondary appearance.
 * Mirrors `SurfaceContext` story.
 */
export function SwitchSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default — page background' },
    { mode: 'minimal' as const, label: 'minimal — light tint' },
    { mode: 'subtle' as const, label: 'subtle — medium tint' },
    { mode: 'moderate' as const, label: 'moderate — heavier tint' },
    { mode: 'bold' as const, label: 'bold — full accent colour' },
    { mode: 'elevated' as const, label: 'elevated — floating card' },
  ];

  return (
    <View style={column}>
      {surfaceModes.map(({ mode, label }) => (
        <View key={mode} style={{ flexDirection: 'column', gap: tokens.spacing['3'] }}>
          <Label>{label}</Label>
          <Surface
            mode={mode}
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: tokens.spacing['4-5'],
              padding: tokens.spacing['4-5'],
              borderRadius: tokens.shape.m,
            }}
          >
            <Switch appearance="secondary" checked>Checked</Switch>
            <Switch appearance="secondary">Unchecked</Switch>
            <Switch appearance="secondary" readOnly checked={false} />
            <Switch appearance="secondary" readOnly checked />
          </Surface>
        </View>
      ))}
    </View>
  );
}

/**
 * Controlled — external state driven by a counter text.
 * Mirrors `Interactive` story behaviour.
 */
export function SwitchControlled(): React.ReactElement {
  const [checked, setChecked] = useState(false);

  return (
    <View style={column}>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        aria-label={`Notifications — currently ${checked ? 'on' : 'off'}`}
      >
        {`Notifications — currently ${checked ? 'on' : 'off'}`}
      </Switch>
      <View style={{ flexDirection: 'row', gap: tokens.spacing['5'], flexWrap: 'wrap' }}>
        {(['primary', 'secondary', 'positive', 'warning', 'negative'] as const).map((app) => (
          <Switch key={app} appearance={app} checked={checked} onCheckedChange={setChecked} />
        ))}
      </View>
      <Label>All switches share state — tap any one to toggle all.</Label>
    </View>
  );
}

/**
 * Themes — 5 surface modes × secondary appearance × checked/unchecked with label.
 * Mirrors `Themes` story.
 */
export function SwitchThemes(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default' },
    { mode: 'minimal' as const, label: 'minimal' },
    { mode: 'subtle' as const, label: 'subtle' },
    { mode: 'bold' as const, label: 'bold' },
    { mode: 'elevated' as const, label: 'elevated' },
  ] as const;

  return (
    <View style={column}>
      {surfaceModes.map(({ mode, label }) => (
        <View
          key={mode}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}
        >
          <RowLabel>{label}</RowLabel>
          <Surface
            mode={mode}
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: tokens.spacing['4'],
              padding: tokens.spacing['4-5'],
              borderRadius: tokens.shape.m,
            }}
          >
            <Switch appearance="secondary" checked={false} onCheckedChange={() => { }} />
            <Switch appearance="secondary" checked onCheckedChange={() => { }} />
            <Switch appearance="secondary" checked={false} onCheckedChange={() => { }}>Label</Switch>
            <Switch appearance="secondary" checked onCheckedChange={() => { }}>Label</Switch>
          </Surface>
        </View>
      ))}
    </View>
  );
}
