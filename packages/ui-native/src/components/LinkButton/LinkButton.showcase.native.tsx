/**
 * LinkButton.showcase.native.tsx
 *
 * Native peer of `packages/ui/src/components/LinkButton/LinkButton.stories.tsx`.
 * One showcase function per Storybook story so the components-sample screen
 * mirrors what reviewers see in Storybook.
 *
 * Web-only stories that don't translate to RN:
 *   - `FocusState`   — RN has no visible focus ring, no native equivalent.
 *   - `Density`      — Density is a global theme context on native; we render
 *                      the active density only.
 *   - `Themes`       — Theme is a global theme context on native; we render
 *                      the active theme only.
 *   - `Interactive`  — Storybook play function calling `userEvent.click` and
 *                      `userEvent.keyboard`. Equivalent assertions live in
 *                      the LinkButtonA11y peer test.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens, typography } from '@oneui/tokens';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { LinkButton } from './LinkButton.native';
import type { LinkButtonAttention, LinkButtonSize } from './interface';
import { Surface, useSurfaceTokens } from '../../theme';

// ─── Layout helpers ──────────────────────────────────────────────────────────

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const subsection: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3'],
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>
      {children}
    </Text>
  );
}

// Slot icon — sized via the parent LinkButton's icon-size cascade.
function SlotIcon({
  size = tokens.spacing['5'],
  color,
}: {
  size?: number;
  color?: string;
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M14 3v2H5v14h14v-9h2v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h10zm7 0v6h-2V6.413l-7.293 7.294-1.414-1.414L17.585 5H15V3h6z'
        fill={color ?? role.content.high}
      />
    </Svg>
  );
}

const ATTENTION_LEVELS: LinkButtonAttention[] = ['high', 'medium', 'low'];
const SIZE_KEYS: LinkButtonSize[] = ['s', 'm', 'l'];
const SIZE_LABELS: Record<string, string> = { s: 'S', m: 'M', l: 'L' };

/* ============================================================================
 * 1. Default — single LinkButton at default size/attention
 * ========================================================================= */
export function LinkButtonDefault(): React.ReactElement {
  return (
    <View style={row}>
      <LinkButton aria-label='LinkButton'>LinkButton</LinkButton>
    </View>
  );
}

/* ============================================================================
 * 2. AttentionLevels (Figma: High / Medium / Low)
 * ========================================================================= */
export function LinkButtonAttentionLevels(): React.ReactElement {
  return (
    <View style={row}>
      {ATTENTION_LEVELS.map((level) => (
        <LinkButton key={level} attention={level} aria-label={`${level} attention`}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </LinkButton>
      ))}
    </View>
  );
}

/* ============================================================================
 * 3. Sizes — S / M / L
 * ========================================================================= */
export function LinkButtonSizes(): React.ReactElement {
  return (
    <View style={row}>
      {SIZE_KEYS.map((size) => (
        <LinkButton key={String(size)} size={size} aria-label={`${SIZE_LABELS[String(size)]} size`}>
          {SIZE_LABELS[String(size)]}
        </LinkButton>
      ))}
    </View>
  );
}

/* ============================================================================
 * 4. States — Default / Disabled / Loading
 * ========================================================================= */
export function LinkButtonStates(): React.ReactElement {
  return (
    <View style={column}>
      <View style={subsection}>
        <Label>High</Label>
        <View style={row}>
          <LinkButton attention='high' aria-label='Default'>
            Default
          </LinkButton>
          <LinkButton attention='high' disabled aria-label='Disabled'>
            Disabled
          </LinkButton>
          <LinkButton attention='high' loading aria-label='Loading'>
            Loading
          </LinkButton>
        </View>
      </View>
      <View style={subsection}>
        <Label>Medium</Label>
        <View style={row}>
          <LinkButton attention='medium' aria-label='Default'>
            Default
          </LinkButton>
          <LinkButton attention='medium' disabled aria-label='Disabled'>
            Disabled
          </LinkButton>
          <LinkButton attention='medium' loading aria-label='Loading'>
            Loading
          </LinkButton>
        </View>
      </View>
      <View style={subsection}>
        <Label>Low</Label>
        <View style={row}>
          <LinkButton attention='low' aria-label='Default'>
            Default
          </LinkButton>
          <LinkButton attention='low' disabled aria-label='Disabled'>
            Disabled
          </LinkButton>
          <LinkButton attention='low' loading aria-label='Loading'>
            Loading
          </LinkButton>
        </View>
      </View>
    </View>
  );
}

/* ============================================================================
 * 5. Appearances — all 9 multi-accent roles × 3 attention levels
 * ========================================================================= */
export function LinkButtonAppearances(): React.ReactElement {
  return (
    <View style={[column, { gap: tokens.spacing['4-5'] }]}>
      {COMPONENT_APPEARANCE_ROLES.map((role) => (
        <View key={role} style={subsection}>
          <Label>{role.charAt(0).toUpperCase() + role.slice(1)}</Label>
          <View style={row}>
            {ATTENTION_LEVELS.map((level) => (
              <LinkButton
                key={level}
                appearance={role}
                attention={level}
                aria-label={`${role} ${level}`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </LinkButton>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/* ============================================================================
 * 6. WithSlots — start / end icon slots × attention levels
 * ========================================================================= */
export function LinkButtonWithSlots(): React.ReactElement {
  return (
    <View style={column}>
      <View style={subsection}>
        <Label>Start slot</Label>
        <View style={row}>
          {ATTENTION_LEVELS.map((level) => (
            <LinkButton
              key={level}
              attention={level}
              start={<SlotIcon />}
              aria-label={`${level} with start icon`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </LinkButton>
          ))}
        </View>
      </View>
      <View style={subsection}>
        <Label>End slot</Label>
        <View style={row}>
          {ATTENTION_LEVELS.map((level) => (
            <LinkButton
              key={level}
              attention={level}
              end={<SlotIcon />}
              aria-label={`${level} with end icon`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </LinkButton>
          ))}
        </View>
      </View>
      <View style={subsection}>
        <Label>Start + end</Label>
        <View style={row}>
          {ATTENTION_LEVELS.map((level) => (
            <LinkButton
              key={level}
              attention={level}
              start={<SlotIcon />}
              end={<SlotIcon />}
              aria-label={`${level} with both icons`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </LinkButton>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ============================================================================
 * 7. Responsive — same matrix as Sizes, framed for a narrow viewport.
 * ========================================================================= */
export function LinkButtonResponsive(): React.ReactElement {
  return (
    <View style={column}>
      <View style={row}>
        <LinkButton size='s' attention='high' aria-label='Small'>
          Small
        </LinkButton>
        <LinkButton size='m' attention='high' aria-label='Medium'>
          Medium
        </LinkButton>
        <LinkButton size='l' attention='high' aria-label='Large'>
          Large
        </LinkButton>
      </View>
      <View style={row}>
        <LinkButton size='s' attention='low' aria-label='Cancel'>
          Cancel
        </LinkButton>
        <LinkButton size='s' attention='high' aria-label='Confirm'>
          Confirm
        </LinkButton>
      </View>
    </View>
  );
}

/* ============================================================================
 * 8. SurfaceContext — every surface mode in a flat list.
 * ========================================================================= */
const SURFACE_MODES = [
  { mode: 'default' as const, label: 'default', desc: 'page background' },
  { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
  { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
  { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
  { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
  { mode: 'elevated' as const, label: 'elevated', desc: 'floating card' },
];

const surfaceCell: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4'],
  padding: tokens.spacing['5'],
  borderRadius: tokens.shape.l,
};

export function LinkButtonSurfaceContext(): React.ReactElement {
  return (
    <View style={column}>
      {SURFACE_MODES.map(({ mode, label, desc }) => (
        <View key={mode} style={subsection}>
          <Label>
            {label} — {desc}
          </Label>
          <Surface mode={mode} style={surfaceCell}>
            {ATTENTION_LEVELS.map((level) => (
              <LinkButton key={level} attention={level} aria-label={`${level} on ${mode}`}>
                {level}
              </LinkButton>
            ))}
          </Surface>
        </View>
      ))}
    </View>
  );
}

/* ============================================================================
 * 9. LoadingStates — spinner combinations
 * ========================================================================= */
export function LinkButtonLoadingStates(): React.ReactElement {
  return (
    <View style={[column, { gap: tokens.spacing['4-5'] }]}>
      <View style={row}>
        <LinkButton loading attention='high' aria-label='Loading high'>
          Loading
        </LinkButton>
        <LinkButton loading attention='medium' aria-label='Loading medium'>
          Loading
        </LinkButton>
        <LinkButton loading attention='low' aria-label='Loading low'>
          Loading
        </LinkButton>
      </View>
      <View style={row}>
        <LinkButton loading start={<SlotIcon />} aria-label='Loading with start'>
          With Start
        </LinkButton>
        <LinkButton loading end={<SlotIcon />} aria-label='Loading with end'>
          With End
        </LinkButton>
      </View>
      <View style={row}>
        <LinkButton loading size='s' aria-label='Loading small'>
          Small
        </LinkButton>
        <LinkButton loading size='m' aria-label='Loading medium'>
          Medium
        </LinkButton>
        <LinkButton loading size='l' aria-label='Loading large'>
          Large
        </LinkButton>
      </View>
    </View>
  );
}
