/**
 * Radio.showcase.native.tsx
 *
 * RN mirror of `Radio.showcase.tsx`. Each export shadows a Storybook story
 * so the native gallery and the web docs stay aligned.
 *
 * Sections:
 *   - RadioSizes              (s / m / l × unchecked / checked)
 *   - RadioStates             (default / checked / disabled / read-only)
 *   - RadioAppearances        (primary / secondary / sparkle / neutral / positive / negative / warning / informative)
 *   - RadioReadOnly           (s / m / l × unchecked / checked, readOnly)
 *   - RadioWithLabel          (label-length variations, uncontrolled toggle)
 *   - RadioSurfaceContext     (5 surface modes; secondary appearance)
 *   - RadioInteractive        (controlled mutual-exclusion demo — peer of `<RadioField>` selection model)
 *
 * Multi-option (`<RadioGroup>`) is intentionally absent — the native Radio
 * component is a self-contained controlled/uncontrolled leaf. Mutual
 * exclusion across multiple options lives in `RadioField`.
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { Surface, useSurfaceTokens } from '../../theme';
import { Radio } from './Radio.native';

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

const stack: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: tokens.spacing['3-5'],
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
  return <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>{children}</Text>;
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return <Text style={{ fontSize: typography.size.s, color: role.content.high }}>{children}</Text>;
}

// ─── Sections ──────────────────────────────────────────────────────────────

export function RadioSizes(): React.ReactElement {
  return (
    <View style={column}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <View key={size} style={row}>
          <View style={rowLabel}>
            <Label>{size.toUpperCase()}</Label>
          </View>
          <Radio size={size} checked={false} aria-label={`${size} unchecked`} />
          <Radio size={size} checked aria-label={`${size} checked`} />
        </View>
      ))}
    </View>
  );
}

export function RadioStates(): React.ReactElement {
  return (
    <View style={column}>
      <View style={row}>
        <View style={rowLabel}>
          <Label>Unchecked</Label>
        </View>
        <Radio checked={false} aria-label="Unchecked">
          Label
        </Radio>
      </View>
      <View style={row}>
        <View style={rowLabel}>
          <Label>Checked</Label>
        </View>
        <Radio checked aria-label="Checked">
          Label
        </Radio>
      </View>
      <View style={row}>
        <View style={rowLabel}>
          <Label>Disabled (unchecked)</Label>
        </View>
        <Radio checked={false} disabled aria-label="Disabled unchecked">
          Label
        </Radio>
      </View>
      <View style={row}>
        <View style={rowLabel}>
          <Label>Disabled (checked)</Label>
        </View>
        <Radio checked disabled aria-label="Disabled checked">
          Label
        </Radio>
      </View>
      <View style={row}>
        <View style={rowLabel}>
          <Label>Read-only (unchecked)</Label>
        </View>
        <Radio checked={false} readOnly aria-label="Readonly unchecked">
          Label
        </Radio>
      </View>
      <View style={row}>
        <View style={rowLabel}>
          <Label>Read-only (checked)</Label>
        </View>
        <Radio checked readOnly aria-label="Readonly checked">
          Label
        </Radio>
      </View>
    </View>
  );
}

export function RadioAppearances(): React.ReactElement {
  return (
    <View style={column}>
      {COMPONENT_APPEARANCE_ROLES.map((appearance) => (
        <View key={appearance} style={row}>
          <View style={rowLabel}>
            <Label>{appearance}</Label>
          </View>
          <Radio appearance={appearance} checked={false} aria-label={`${appearance} unchecked`} />
          <Radio appearance={appearance} checked aria-label={`${appearance} checked`} />
        </View>
      ))}
    </View>
  );
}

export function RadioReadOnly(): React.ReactElement {
  return (
    <View style={column}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <View key={size} style={row}>
          <View style={rowLabel}>
            <Label>{size.toUpperCase()}</Label>
          </View>
          <Radio size={size} checked={false} readOnly aria-label={`${size} readonly unchecked`} />
          <Radio size={size} checked readOnly aria-label={`${size} readonly checked`} />
        </View>
      ))}
    </View>
  );
}

export function RadioWithLabel(): React.ReactElement {
  // Uncontrolled — each Radio toggles its own state independently.
  return (
    <View style={stack}>
      <Radio aria-label="Accept terms and conditions" size="s">
        Accept terms and conditions (Size - S)
      </Radio>
      <Radio aria-label="Subscribe to updates" size="m">
        Subscribe to weekly product updates (Size - M)
      </Radio>
      <Radio aria-label="Receive marketing communications" size="l">
        Receive marketing communications and offers (Size - L)
      </Radio>
    </View>
  );
}

export function RadioSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, desc: 'page background' },
    { mode: 'minimal' as const, desc: 'light tint' },
    { mode: 'subtle' as const, desc: 'medium tint' },
    { mode: 'moderate' as const, desc: 'heavier tint' },
    { mode: 'bold' as const, desc: 'full accent colour' },
    { mode: 'elevated' as const, desc: 'floating card / popover' },
  ];

  return (
    <View style={{ ...(column as object), gap: tokens.spacing['4-5'] } as ViewStyle}>
      {surfaceModes.map(({ mode, desc }) => (
        <View key={mode} style={{ gap: tokens.spacing['3'] }}>
          <Label>{`${mode} — ${desc}`}</Label>
          <Surface mode={mode} style={themeCell as ViewStyle}>
            <Radio appearance="secondary" checked aria-label="Checked">
              Checked
            </Radio>
            <Radio appearance="secondary" checked={false} aria-label="Unchecked">
              Unchecked
            </Radio>
          </Surface>
        </View>
      ))}
    </View>
  );
}

/**
 * Interactive — controlled mutual-exclusion across three options. This is
 * the pattern `<RadioField>` implements internally; here it lives in app
 * state to show the wiring.
 */
export function RadioInteractive(): React.ReactElement {
  const [value, setValue] = useState<string>('newsletter');
  const options = [
    { value: 'newsletter', label: 'Subscribe to newsletter' },
    { value: 'updates', label: 'Product updates only' },
    { value: 'none', label: 'No notifications' },
  ] as const;
  return (
    <View style={column}>
      <SectionLabel>{`Selected: ${value || '—'}`}</SectionLabel>
      <View style={stack}>
        {options.map((opt) => (
          <Radio
            key={opt.value}
            value={opt.value}
            checked={value === opt.value}
            onPress={() => setValue(opt.value)}
            aria-label={opt.label}
          >
            {opt.label}
          </Radio>
        ))}
      </View>
      <View style={labeledItem}>
        <SectionLabel>Notification preference (uncontrolled)</SectionLabel>
        <View style={stack}>
          <Radio defaultChecked>Subscribe to newsletter</Radio>
          <Radio>Product updates only</Radio>
          <Radio>No notifications</Radio>
        </View>
        <Label>
          Each Radio toggles independently when uncontrolled — use `RadioField` for true mutual
          exclusion.
        </Label>
      </View>
    </View>
  );
}
