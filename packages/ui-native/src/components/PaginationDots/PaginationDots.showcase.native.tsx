/**
 * PaginationDots.showcase.native.tsx
 *
 * Parity with `packages/ui/src/components/PaginationDots/PaginationDots.stories.tsx`
 * — one section per portable web story.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import type { PaginationDotsAppearance } from './interface';
import { PaginationDots } from './PaginationDots.native';
import { Surface, useSurfaceTokens } from '../../theme';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: tokens.spacing['4'],
  flexWrap: 'wrap',
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>
      {children}
    </Text>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text
      style={{
        fontSize: typography.size.s,
        color: role.content.high,
        fontWeight: typography.weight.medium as '500',
      }}
    >
      {children}
    </Text>
  );
}

function MiniButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: role.surfaces.subtle,
        borderRadius: tokens.shape.pill,
        paddingHorizontal: tokens.spacing['4'],
        paddingVertical: tokens.spacing['1-5'],
      }}
      accessibilityRole='button'
    >
      <Text
        style={{
          color: role.content.tintedA11y,
          fontSize: typography.size.xs,
          fontWeight: typography.weight.medium as '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ========================================
   1. Default
   ======================================== */
export function PaginationDotsDefault(): React.ReactElement {
  return (
    <PaginationDots
      count={5}
      defaultActiveIndex={0}
      aria-label='Default pagination'
    />
  );
}

/* ========================================
   Native-only: Basic (interactive controlled)
   Kept as a quick-tap demo distinct from the web `Default` story.
   ======================================== */
export function PaginationDotsBasic(): React.ReactElement {
  const [active, setActive] = useState(0);
  return (
    <View style={column}>
      <Label>Count = 8 — controlled</Label>
      <PaginationDots
        count={8}
        activeIndex={active}
        onActiveIndexChange={setActive}
      />
      <Label>Tap a dot to navigate. Active: {active + 1} / 8</Label>
    </View>
  );
}

/* ========================================
   2. Appearances
   ======================================== */
export function PaginationDotsAppearances(): React.ReactElement {
  const appearances: PaginationDotsAppearance[] = [
    'primary',
    'secondary',
    'neutral',
    'sparkle',
    'brand-bg',
    'positive',
    'negative',
    'warning',
    'informative',
  ];
  return (
    <View style={column}>
      {appearances.map((appearance) => (
        <View key={appearance} style={{ gap: tokens.spacing['2-5'] }}>
          <Label>{appearance}</Label>
          <PaginationDots
            count={5}
            defaultActiveIndex={2}
            appearance={appearance}
            readOnly
          />
        </View>
      ))}
    </View>
  );
}

/* ========================================
   3. Loop vs Non-loop
   ======================================== */
function LoopVsNonLoopColumn({
  loop,
  label,
  count = 12,
}: {
  loop: boolean;
  label: string;
  count?: number;
}): React.ReactElement {
  const [active, setActive] = useState(0);
  return (
    <View style={{ gap: tokens.spacing['3-5'], alignItems: 'center', flex: 1 }}>
      <SectionLabel>{label}</SectionLabel>
      <PaginationDots
        count={count}
        activeIndex={active}
        onActiveIndexChange={setActive}
        loop={loop}
        aria-label={label}
      />
      <View style={{ flexDirection: 'row', gap: tokens.spacing['3-5'] }}>
        <MiniButton
          label='‹ Prev'
          onPress={() =>
            setActive((a) => (loop ? (a - 1 + count) % count : Math.max(0, a - 1)))
          }
        />
        <MiniButton
          label='Next ›'
          onPress={() =>
            setActive((a) => (loop ? (a + 1) % count : Math.min(count - 1, a + 1)))
          }
        />
      </View>
      <Label>{active + 1} / {count}</Label>
    </View>
  );
}

export function PaginationDotsLoopVsNonLoop(): React.ReactElement {
  return (
    <View style={{ flexDirection: 'row', gap: tokens.spacing['5'], flexWrap: 'wrap' }}>
      <LoopVsNonLoopColumn loop={false} label='Non-loop (end state)' />
      <LoopVsNonLoopColumn loop={true} label='Loop (infinite)' />
    </View>
  );
}

/* ========================================
   Native-only: Loop mode (back-compat name)
   ======================================== */
export function PaginationDotsLoop(): React.ReactElement {
  const [active, setActive] = useState(0);
  return (
    <View style={column}>
      <Label>Count = 10 — loop mode (window centred)</Label>
      <PaginationDots
        count={10}
        loop
        activeIndex={active}
        onActiveIndexChange={setActive}
      />
    </View>
  );
}

/* ========================================
   4. Long sequence
   ======================================== */
export function PaginationDotsLongSequence(): React.ReactElement {
  const [active, setActive] = useState(0);
  const count = 20;
  return (
    <View style={{ alignItems: 'center', gap: tokens.spacing['4'] }}>
      <PaginationDots
        count={count}
        activeIndex={active}
        onActiveIndexChange={setActive}
        aria-label='Long sequence'
      />
      <View
        style={{
          flexDirection: 'row',
          gap: tokens.spacing['3-5'],
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <MiniButton label='⇤ First' onPress={() => setActive(0)} />
        <MiniButton label='‹ Prev' onPress={() => setActive((a) => Math.max(0, a - 1))} />
        <Label>Page {active + 1} / {count}</Label>
        <MiniButton
          label='Next ›'
          onPress={() => setActive((a) => Math.min(count - 1, a + 1))}
        />
        <MiniButton label='Last ⇥' onPress={() => setActive(count - 1)} />
      </View>
    </View>
  );
}

/* ========================================
   5. Interactive — fake carousel
   ======================================== */
export function PaginationDotsInteractive(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const count = 12;
  const [active, setActive] = useState(0);

  return (
    <View style={{ gap: tokens.spacing['4'] }}>
      <View
        accessible
        accessibilityLabel='Card carousel'
        style={{
          padding: tokens.spacing['3-5'],
          borderRadius: tokens.shape.l,
          backgroundColor: role.surfaces.minimal,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: tokens.spacing['4'] }}
        >
          {Array.from({ length: count }, (_, i) => (
            <View
              key={i}
              accessibilityElementsHidden={i !== active}
              style={{
                width: tokens.spacing['40'],
                height: tokens.spacing['28'],
                borderRadius: tokens.shape.l,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: role.surfaces.bold,
                opacity: i === active ? 1 : 0.35,
              }}
            >
              <Text
                style={{
                  color: role.onBoldContent.high,
                  fontSize: typography.size.l,
                  fontWeight: typography.weight.high as '700',
                }}
              >
                Slide {i + 1}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={{ alignItems: 'center' }}>
        <PaginationDots
          count={count}
          activeIndex={active}
          onActiveIndexChange={setActive}
          aria-label='Card carousel pagination'
        />
      </View>
    </View>
  );
}

/* ========================================
   6. Read-only
   ======================================== */
export function PaginationDotsReadOnly(): React.ReactElement {
  const [active, setActive] = useState(2);
  return (
    <View style={{ alignItems: 'center', gap: tokens.spacing['4'] }}>
      <PaginationDots
        count={8}
        activeIndex={active}
        readOnly
        aria-label='Read-only indicator'
      />
      <View style={{ flexDirection: 'row', gap: tokens.spacing['3-5'] }}>
        <MiniButton
          label='‹ Prev (external)'
          onPress={() => setActive((a) => Math.max(0, a - 1))}
        />
        <MiniButton
          label='Next › (external)'
          onPress={() => setActive((a) => Math.min(7, a + 1))}
        />
      </View>
      <Label>Dots are non-interactive; parent owns the state.</Label>
    </View>
  );
}

/* ========================================
   7. Degenerate cases
   ======================================== */
export function PaginationDotsDegenerate(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <Label>count = 0 (empty root, no crash)</Label>
        <View
          style={{
            minHeight: tokens.spacing['5'],
            borderWidth: tokens.borderWidth.thin,
            borderStyle: 'dashed',
            borderColor: role.content.strokeLow,
            padding: tokens.spacing['3-5'],
            borderRadius: tokens.shape.m,
          }}
        >
          <PaginationDots count={0} aria-label='Empty' />
        </View>
      </View>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <Label>count = 1</Label>
        <PaginationDots count={1} aria-label='Single page' />
      </View>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <Label>count = 3 (short — every dot visible, no edge fade)</Label>
        <PaginationDots count={3} defaultActiveIndex={1} aria-label='Short' />
      </View>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <Label>count = 2, loop</Label>
        <PaginationDots count={2} loop defaultActiveIndex={0} aria-label='Two items loop' />
      </View>
    </View>
  );
}

/* ========================================
   Native-only: short-sequence convenience export (back-compat).
   ======================================== */
export function PaginationDotsShortSequence(): React.ReactElement {
  return (
    <View style={column}>
      <Label>Count = 3 — every dot visible, no edge state</Label>
      <PaginationDots count={3} defaultActiveIndex={1} />
    </View>
  );
}

/* ========================================
   8. Surface context
   ======================================== */
export function PaginationDotsSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default', desc: 'page background' },
    { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
    { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
    { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
    { mode: 'bold' as const, label: 'bold', desc: 'full accent — active pill inverts' },
    { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
  ];

  return (
    <View style={{ gap: tokens.spacing['4-5'] }}>
      {surfaceModes.map(({ mode, label, desc }) => (
        <View key={mode} style={{ gap: tokens.spacing['3'] }}>
          <Label>
            {label} — {desc}
          </Label>
          <Surface
            mode={mode}
            appearance='primary'
            style={{
              padding: tokens.spacing['5'],
              borderRadius: tokens.shape.l,
              alignItems: 'center',
            }}
          >
            <PaginationDots
              count={9}
              defaultActiveIndex={4}
              aria-label={`${label} surface`}
            />
          </Surface>
        </View>
      ))}
    </View>
  );
}
