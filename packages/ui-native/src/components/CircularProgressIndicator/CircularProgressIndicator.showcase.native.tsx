/**
 * CircularProgressIndicator.showcase.native.tsx
 *
 * Mirrors `packages/ui/src/components/CircularProgressIndicator/CircularProgressIndicator.stories.tsx`.
 * One showcase function per web story so the native sample app + parity docs
 * line up section-for-section.
 */

import React, { useEffect, useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@oneui/tokens';
import { CircularProgressIndicator } from './CircularProgressIndicator.native';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorSize,
} from './interface';
import { Surface, useSurfaceTokens, useTypographyTokens } from '../../theme';

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

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const typo = useTypographyTokens('label', 'S', { emphasis: 'medium' });
  return (
    <Text
      style={{
        fontSize: typo.fontSize,
        lineHeight: typo.lineHeight,
        fontWeight: typo.fontWeight,
        color: role.content.low,
      }}
    >
      {children}
    </Text>
  );
}

/* ========================================
   1. Default
   ======================================== */
export function CircularProgressIndicatorDefault(): React.ReactElement {
  return (
    <View style={row}>
      <CircularProgressIndicator value={25} size="M" aria-label="Task progress" />
      <SectionLabel>Default (M, 25%)</SectionLabel>
    </View>
  );
}

/* ========================================
   2. Variants — Determinate vs Indeterminate
   ======================================== */
export function CircularProgressIndicatorVariants(): React.ReactElement {
  return (
    <View style={column}>
      <View style={row}>
        <View style={{ alignItems: 'center', gap: tokens.spacing['3'] }}>
          <CircularProgressIndicator
            variant="determinate"
            value={65}
            size="3XL"
            aria-label="Determinate progress"
          />
          <SectionLabel>Determinate + value</SectionLabel>
        </View>
        <View style={{ alignItems: 'center', gap: tokens.spacing['3'] }}>
          <CircularProgressIndicator
            variant="indeterminate"
            size="3XL"
            aria-label="Indeterminate progress"
          />
          <SectionLabel>Indeterminate</SectionLabel>
        </View>
        <View style={{ alignItems: 'center', gap: tokens.spacing['3'] }}>
          <CircularProgressIndicator
            variant="determinate"
            size="3XL"
            aria-label="Missing value — coerced to spinner"
          />
          <SectionLabel>Determinate, no value (spins — dev warns)</SectionLabel>
        </View>
      </View>
    </View>
  );
}

/* ========================================
   3. Sizes — All 10 presets
   ======================================== */
export function CircularProgressIndicatorSizes(): React.ReactElement {
  const sizes: CircularProgressIndicatorSize[] = [
    '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL',
  ];
  return (
    <View style={column}>
      <SectionLabel>All sizes</SectionLabel>
      <View style={row}>
        {sizes.map((s) => (
          <View key={s} style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
            <CircularProgressIndicator value={65} size={s} aria-label={`${s} progress`} />
            <SectionLabel>{s}</SectionLabel>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ========================================
   4. Appearances — All 9 multi-accent roles
   ======================================== */
export function CircularProgressIndicatorAppearances(): React.ReactElement {
  const appearances: Exclude<CircularProgressIndicatorAppearance, 'auto'>[] = [
    'primary',
    'secondary',
    'sparkle',
    'brand-bg',
    'neutral',
    'positive',
    'negative',
    'warning',
    'informative',
  ];
  return (
    <View style={row}>
      {appearances.map((appearance) => (
        <View key={appearance} style={{ alignItems: 'center', gap: tokens.spacing['3'] }}>
          <CircularProgressIndicator
            value={65}
            size="3XL"
            appearance={appearance}
            aria-label={`${appearance} progress`}
          />
          <SectionLabel>{appearance}</SectionLabel>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   5. With Content — Text + Icon center modes
   ======================================== */
function DownloadIcon({ color }: { color: string }): React.ReactElement {
  return (
    <Svg width={tokens.spacing['4']} height={tokens.spacing['4']} viewBox="0 0 24 24">
      <Path
        d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
        stroke={color}
        strokeWidth={tokens.borderWidth.thin}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function CircularProgressIndicatorWithContent(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <View style={column}>
      <SectionLabel>Text size gate — S / M show ring only; L shows 50%</SectionLabel>
      <View style={row}>
        {(['S', 'M', 'L'] as const).map((s) => (
          <View key={s} style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
            <CircularProgressIndicator
              value={50}
              size={s}
              content="text"
              aria-label={`${s} text progress`}
            />
            <SectionLabel>
              {s}
              {s === 'L' ? ' — label visible' : ' — no label (Figma)'}
            </SectionLabel>
          </View>
        ))}
      </View>
      <SectionLabel>Text (auto percentage) — L through 5XL</SectionLabel>
      <View style={row}>
        {(['L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const).map((s) => (
          <CircularProgressIndicator
            key={s}
            value={25}
            size={s}
            content="text"
            aria-label={`${s} text progress`}
          />
        ))}
      </View>
      <SectionLabel>Icon (children — all sizes; text is L+ only)</SectionLabel>
      <View style={row}>
        {(
          [
            '2XS',
            'XS',
            'S',
            'M',
            'L',
            'XL',
            '2XL',
            '3XL',
            '4XL',
            '5XL',
          ] as const
        ).map((s) => (
          <View key={s} style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
            <CircularProgressIndicator
              value={50}
              size={s}
              content="icon"
              aria-label={`${s} icon progress`}
            >
              <DownloadIcon color={role.content.tintedA11y} />
            </CircularProgressIndicator>
            <SectionLabel>{s}</SectionLabel>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ========================================
   6. States — 0%, 25%, 50%, 75%, 100%
   ======================================== */
export function CircularProgressIndicatorStates(): React.ReactElement {
  const values = [0, 25, 50, 75, 100];
  return (
    <View style={row}>
      {values.map((v) => (
        <View key={v} style={{ alignItems: 'center', gap: tokens.spacing['3'] }}>
          <CircularProgressIndicator
            value={v}
            size="3XL"
            content="text"
            aria-label={`${v}% progress`}
          />
          <SectionLabel>{`${v}%`}</SectionLabel>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   7. Interactive — Tracking vs Jumping vs Indeterminate
   ======================================== */
export function CircularProgressIndicatorInteractive(): React.ReactElement {
  const [tracking, setTracking] = useState(0);
  const [jumping, setJumping] = useState(25);

  useEffect(() => {
    const trackingInterval = setInterval(() => {
      setTracking((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    const jumpingInterval = setInterval(() => {
      setJumping(() => Math.floor(Math.random() * 101));
    }, 2000);
    return () => {
      clearInterval(trackingInterval);
      clearInterval(jumpingInterval);
    };
  }, []);

  const itemStyle: ViewStyle = {
    alignItems: 'center',
    gap: tokens.spacing['3'],
  };

  return (
    <View style={row}>
      <View style={itemStyle}>
        <CircularProgressIndicator
          value={tracking}
          size="4XL"
          content="text"
          aria-label="Continuous tracking progress"
          // Continuous mode: instant per-update transitions so cumulative
          // motion reads as smooth/linear (peer of web's
          // `--CircularProgressIndicator-valueTransitionDuration: 0s` override).
          valueTransitionDuration={0}
        />
        <SectionLabel>Tracking — continuous</SectionLabel>
      </View>
      <View style={itemStyle}>
        <CircularProgressIndicator
          value={jumping}
          size="4XL"
          content="text"
          appearance="positive"
          aria-label="Jumping progress"
        />
        <SectionLabel>Jumping</SectionLabel>
      </View>
      <View style={itemStyle}>
        <CircularProgressIndicator
          variant="indeterminate"
          size="4XL"
          appearance="secondary"
          aria-label="Indeterminate loading"
        />
        <SectionLabel>Indeterminate</SectionLabel>
      </View>
    </View>
  );
}

/* ========================================
   8. Surface Context — adapts inside every Surface mode
   ======================================== */
export function CircularProgressIndicatorSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'minimal' as const, label: 'minimal' },
    { mode: 'subtle' as const, label: 'subtle' },
    { mode: 'moderate' as const, label: 'moderate' },
    { mode: 'bold' as const, label: 'bold' },
    { mode: 'elevated' as const, label: 'elevated' },
  ];
  const contentStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['6'],
    padding: tokens.spacing['5'],
    borderRadius: tokens.shape.m,
  };
  return (
    <View style={column}>
      <SectionLabel>default — page background</SectionLabel>
      <View style={[row, { gap: tokens.spacing['6'] }]}>
        <CircularProgressIndicator value={65} size="3XL" aria-label="Determinate" />
        <CircularProgressIndicator
          variant="indeterminate"
          size="3XL"
          aria-label="Indeterminate"
        />
      </View>
      {surfaceModes.map(({ mode, label }) => (
        <View key={mode} style={{ gap: tokens.spacing['3'] }}>
          <SectionLabel>{label}</SectionLabel>
          <Surface mode={mode} style={contentStyle}>
            <CircularProgressIndicator value={65} size="3XL" aria-label="Determinate" />
            <CircularProgressIndicator
              variant="indeterminate"
              size="3XL"
              aria-label="Indeterminate"
            />
          </Surface>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   9. Motion — Entry & Exit
   Mirrors the web `MotionEntryExit` story: an indeterminate spinner with
   `animate` enabled and `show` toggled every 2s, so entry and exit
   animations alternate forever. Uses the `animate` + `show` props that the
   component already exposes — no new API needed.
   ======================================== */
export function CircularProgressIndicatorEntryExit(): React.ReactElement {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setShow((s) => !s), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={row}>
      <View style={{ alignItems: 'center', gap: tokens.spacing['3'] }}>
        <CircularProgressIndicator
          variant="indeterminate"
          size="4XL"
          aria-label="Indeterminate with entry and exit"
          animate
          show={show}
        />
        <SectionLabel>Indeterminate — animate + show toggle</SectionLabel>
      </View>
    </View>
  );
}

/* ========================================
   10. Disabled — opacity treatment via wrapper style
   ======================================== */
export function CircularProgressIndicatorDisabled(): React.ReactElement {
  return (
    <View style={row}>
      <View style={{ alignItems: 'center', gap: tokens.spacing['3'] }}>
        <CircularProgressIndicator
          value={65}
          size="3XL"
          aria-label="Disabled determinate progress"
          style={{ opacity: 0.5 }}
        />
        <SectionLabel>Disabled determinate</SectionLabel>
      </View>
      <View style={{ alignItems: 'center', gap: tokens.spacing['3'] }}>
        <CircularProgressIndicator
          variant="indeterminate"
          size="3XL"
          aria-label="Disabled indeterminate progress"
          style={{ opacity: 0.5 }}
        />
        <SectionLabel>Disabled indeterminate</SectionLabel>
      </View>
    </View>
  );
}
