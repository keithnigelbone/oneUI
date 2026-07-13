/**
 * SingleTextButton.showcase.native.tsx
 *
 * Native peer of `packages/ui/src/components/SingleTextButton/SingleTextButton.stories.tsx`.
 * One showcase function per Storybook "story" — every export mirrors the web
 * story's name and intent so the native-sample gallery matches Storybook.
 *
 * Parity notes:
 *   - Focus ring — RN touch surfaces have no focus indicator, so the web focus
 *     halo has no native equivalent (documented in the parity doc).
 *   - Surface Context — native `<Surface mode>` establishes the same
 *     token-remapping boundary web drives via `[data-surface]`.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { SingleTextButton } from './SingleTextButton.native';
import type {
  SingleTextButtonAppearance,
  SingleTextButtonAttention,
  SingleTextButtonSize,
} from './interface';
import { Surface, useSurfaceTokens } from '../../theme';

// ─── Layout helpers ───────────────────────────────────────────────────────────

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4-5'],
};

const group: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3'],
};

const ATTENTIONS: readonly SingleTextButtonAttention[] = ['high', 'medium', 'low'];
const SIZES: readonly SingleTextButtonSize[] = ['s', 'm', 'l'];

/** All 11 roles wired by SingleTextButton (9 canonical + tertiary / quaternary). */
const APPEARANCES: readonly SingleTextButtonAppearance[] = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

function CaptionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text style={{ fontSize: typography.size.s, color: role.content.low, textTransform: 'capitalize' }}>
      {children}
    </Text>
  );
}

// ─── Showcases ────────────────────────────────────────────────────────────────

/** Default — single instance, mirrors web `Default`. */
export function SingleTextButtonDefault(): React.ReactElement {
  return (
    <View style={row}>
      <SingleTextButton attention="high" size="m">
        Ag
      </SingleTextButton>
    </View>
  );
}

/** Attention Levels — high / medium / low. Mirrors web `AttentionLevels`. */
export function SingleTextButtonAttentionLevels(): React.ReactElement {
  return (
    <View style={group}>
      <CaptionLabel>Attention drives the visual</CaptionLabel>
      <View style={row}>
        {ATTENTIONS.map((attention) => (
          <SingleTextButton key={attention} attention={attention}>
            Ag
          </SingleTextButton>
        ))}
      </View>
    </View>
  );
}

/** Sizes — S/M/L across every attention. Mirrors web `Sizes`. */
export function SingleTextButtonSizes(): React.ReactElement {
  return (
    <View style={column}>
      {ATTENTIONS.map((attention) => (
        <View key={attention} style={group}>
          <CaptionLabel>{`${attention} attention`}</CaptionLabel>
          <View style={row}>
            {SIZES.map((size) => (
              <SingleTextButton key={size} attention={attention} size={size}>
                Ag
              </SingleTextButton>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Condensed — reduced size, same typography. Mirrors web `Condensed`. */
export function SingleTextButtonCondensed(): React.ReactElement {
  return (
    <View style={column}>
      <View style={group}>
        <CaptionLabel>Normal</CaptionLabel>
        <View style={row}>
          {SIZES.map((size) => (
            <SingleTextButton key={size} size={size}>
              Ag
            </SingleTextButton>
          ))}
        </View>
      </View>
      <View style={group}>
        <CaptionLabel>Condensed (same typography, reduced size)</CaptionLabel>
        <View style={row}>
          {SIZES.map((size) => (
            <SingleTextButton key={size} size={size} condensed>
              Ag
            </SingleTextButton>
          ))}
        </View>
      </View>
    </View>
  );
}

/** Appearances — all 11 roles across attentions. Mirrors web `Appearances`. */
export function SingleTextButtonAppearances(): React.ReactElement {
  return (
    <View style={column}>
      {APPEARANCES.map((appearance) => (
        <View key={appearance} style={group}>
          <CaptionLabel>{appearance}</CaptionLabel>
          <View style={row}>
            {ATTENTIONS.map((attention) => (
              <SingleTextButton key={attention} appearance={appearance} attention={attention}>
                Ag
              </SingleTextButton>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Disabled (`disabled`) — across high / medium / low attention. */
export function SingleTextButtonDisabled(): React.ReactElement {
  return (
    <View style={row}>
      {ATTENTIONS.map((attention) => (
        <SingleTextButton key={attention} attention={attention} disabled>
          Ag
        </SingleTextButton>
      ))}
    </View>
  );
}

/** Loading (`loading`) — spinner replaces the label, across attentions. */
export function SingleTextButtonLoading(): React.ReactElement {
  return (
    <View style={row}>
      {ATTENTIONS.map((attention) => (
        <SingleTextButton key={attention} attention={attention} loading>
          Ag
        </SingleTextButton>
      ))}
    </View>
  );
}

/**
 * Surface Context — verifies token remapping across surfaces. Mirrors web
 * `SurfaceContext`; native `<Surface mode>` is the peer of `[data-surface]`.
 */
export function SingleTextButtonSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, desc: 'page background' },
    { mode: 'minimal' as const, desc: 'light tint' },
    { mode: 'subtle' as const, desc: 'medium tint' },
    { mode: 'moderate' as const, desc: 'heavier tint' },
    { mode: 'bold' as const, desc: 'full accent colour' },
    { mode: 'elevated' as const, desc: 'floating card / popover' },
  ];

  const surfacePad: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacing['4'],
    padding: tokens.spacing['5'],
    borderRadius: tokens.shape.m,
  };

  return (
    <View style={column}>
      {surfaceModes.map(({ mode, desc }) => (
        <View key={mode} style={group}>
          <CaptionLabel>{`${mode} — ${desc}`}</CaptionLabel>
          <Surface mode={mode} style={surfacePad}>
            {ATTENTIONS.map((attention) => (
              <SingleTextButton key={attention} attention={attention}>
                Ag
              </SingleTextButton>
            ))}
          </Surface>
        </View>
      ))}
    </View>
  );
}

/** Real-world — avatar-style initials row. Mirrors web `RealWorldInitialsRow`. */
export function SingleTextButtonRealWorldInitialsRow(): React.ReactElement {
  return (
    <View style={row}>
      <SingleTextButton attention="high" appearance="primary">
        Ak
      </SingleTextButton>
      <SingleTextButton attention="medium" appearance="secondary">
        Mw
      </SingleTextButton>
      <SingleTextButton attention="medium" appearance="tertiary">
        Jp
      </SingleTextButton>
      <SingleTextButton attention="medium" appearance="positive">
        Ra
      </SingleTextButton>
      <SingleTextButton attention="low" appearance="neutral">
        +3
      </SingleTextButton>
    </View>
  );
}
