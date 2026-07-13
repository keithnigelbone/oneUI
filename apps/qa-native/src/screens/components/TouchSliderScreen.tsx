/**
 * TouchSliderScreen — focused test surface for `<TouchSlider>` from
 * `@oneui/ui-native`, per CombinationsRules/TouchSliderRules.txt.
 *
 * Sections:
 *   1. orientation × trackStyle (progressStyle) — 2×2 matrix
 *   2. value × orientation       — 3 values (0/50/100) × 2 orientations
 *   3. start slot × orientation  — none/icon × horizontal/vertical
 *   4. appearance × orientation  — 8 appearances × 2 orientations
 *   5. disabled / readOnly       — both states × 2 orientations + disabled+slot
 *
 * Layout convention:
 *   - Horizontal sliders: stacked in a column, each stretching to full width.
 *   - Vertical sliders: laid out in a flex row, each cell given a fixed height.
 *
 * Each slider is wrapped in StatefulSlider so it shows its initial value and
 * stays interactive.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchSlider, useSurfaceTokens } from '@oneui/ui-native';
import type {
  TouchSliderAppearance,
  TouchSliderOrientation,
  TouchSliderProgressStyle,
} from '@oneui/ui-native/components/TouchSlider';
import { Icon } from '@oneui/ui-native/components/Icon';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

const GLYPH = JdsIcons.IcFavorite;
const StartIcon = <Icon icon={GLYPH} size='5' appearance='neutral' aria-hidden />;

const ORIENTATIONS: readonly TouchSliderOrientation[] = ['horizontal', 'vertical'];
const PROGRESS_STYLES: readonly TouchSliderProgressStyle[] = ['rounded', 'sharp'];

const APPEARANCES: readonly TouchSliderAppearance[] = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'negative',
  'positive',
  'informative',
  'warning',
];

/* ─── Slider spec ─────────────────────────────────────────────────────────── */

interface SliderSpec {
  readonly testID: string;
  readonly label: string;
  readonly initialValue?: number;
  readonly orientation?: TouchSliderOrientation;
  readonly progressStyle?: TouchSliderProgressStyle;
  readonly appearance?: TouchSliderAppearance;
  readonly start?: React.ReactNode;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
}

/* ─── Section specs ───────────────────────────────────────────────────────── */

// 1 · orientation × trackStyle (progressStyle)
const SECTION_TRACK_STYLE: readonly SliderSpec[] = ORIENTATIONS.flatMap((orientation) =>
  PROGRESS_STYLES.map((progressStyle) => ({
    testID: `slider-track-${orientation}-${progressStyle}`,
    label: `${orientation} · ${progressStyle}`,
    orientation,
    progressStyle,
    initialValue: 60,
  })),
);

// 2 · value × orientation
const SECTION_VALUE: readonly SliderSpec[] = [0, 50, 100].flatMap((v) =>
  ORIENTATIONS.map((orientation) => ({
    testID: `slider-value-${v}-${orientation}`,
    label: `value=${v} · ${orientation}`,
    orientation,
    initialValue: v,
  })),
);

// 3 · start slot × orientation
const SECTION_START_SLOT: readonly SliderSpec[] = [
  { slot: undefined, slotLabel: 'none' },
  { slot: StartIcon, slotLabel: 'icon' },
].flatMap(({ slot, slotLabel }) =>
  ORIENTATIONS.map((orientation) => ({
    testID: `slider-slot-${slotLabel}-${orientation}`,
    label: `start=${slotLabel} · ${orientation}`,
    orientation,
    start: slot,
    initialValue: 50,
  })),
);

// 4 · appearance × orientation
const SECTION_APPEARANCE: readonly SliderSpec[] = APPEARANCES.flatMap((appearance) =>
  ORIENTATIONS.map((orientation) => ({
    testID: `slider-appearance-${appearance}-${orientation}`,
    label: `${appearance} · ${orientation}`,
    appearance,
    orientation,
    initialValue: 50,
  })),
);

// 5 · disabled / readOnly × orientation (+ disabled+slot for horizontal)
const SECTION_STATES: readonly SliderSpec[] = [
  ...ORIENTATIONS.map((orientation) => ({
    testID: `slider-disabled-${orientation}`,
    label: `disabled · ${orientation}`,
    orientation,
    disabled: true,
    initialValue: 50,
  })),
  ...ORIENTATIONS.map((orientation) => ({
    testID: `slider-readonly-${orientation}`,
    label: `readOnly · ${orientation}`,
    orientation,
    readOnly: true,
    initialValue: 50,
  })),
  {
    testID: 'slider-disabled-slot-horizontal',
    label: 'disabled + start=icon · horizontal',
    orientation: 'horizontal' as const,
    disabled: true,
    start: StartIcon,
    initialValue: 50,
  },
];

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly sliders: readonly SliderSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  {
    testID: 'section-track-style',
    title: '1 · orientation × trackStyle (progressStyle)',
    sliders: SECTION_TRACK_STYLE,
  },
  {
    testID: 'section-value',
    title: '2 · value (0 / 50 / 100) × orientation',
    sliders: SECTION_VALUE,
  },
  {
    testID: 'section-start-slot',
    title: '3 · start slot (none / icon) × orientation',
    sliders: SECTION_START_SLOT,
  },
  {
    testID: 'section-appearances',
    title: '4 · appearances × orientation',
    sliders: SECTION_APPEARANCE,
  },
  {
    testID: 'section-disabled-readonly',
    title: '5 · disabled / readOnly × orientation',
    sliders: SECTION_STATES,
  },
];

/* ─── Screen ──────────────────────────────────────────────────────────────── */

export function TouchSliderScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-TouchSlider'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {SECTIONS.map((section) => (
        <Section
          key={section.testID}
          testID={section.testID}
          title={section.title}
          sliders={section.sliders}
        />
      ))}
    </ScrollView>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────────── */

function Section({
  testID,
  title,
  sliders,
}: {
  testID: string;
  title: string;
  sliders: readonly SliderSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const horizontalSliders = sliders.filter((s) => s.orientation !== 'vertical');
  const verticalSliders = sliders.filter((s) => s.orientation === 'vertical');

  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>

      {/* Horizontal sliders — full-width, stacked */}
      {horizontalSliders.length > 0 && (
        <View style={styles.column}>
          {horizontalSliders.map((spec) => (
            <StatefulSlider key={spec.testID} {...spec} />
          ))}
        </View>
      )}

      {/* Vertical sliders — fixed height, side by side */}
      {verticalSliders.length > 0 && (
        <View style={styles.row}>
          {verticalSliders.map((spec) => (
            <StatefulSlider key={spec.testID} {...spec} />
          ))}
        </View>
      )}
    </View>
  );
}

/* ─── StatefulSlider ──────────────────────────────────────────────────────── */

function StatefulSlider({
  testID,
  label,
  initialValue = 50,
  orientation,
  progressStyle,
  appearance,
  start,
  disabled,
  readOnly,
}: SliderSpec): React.ReactElement {
  const [value, setValue] = useState(initialValue);
  const role = useSurfaceTokens('neutral');
  const isVertical = orientation === 'vertical';

  return (
    <View style={isVertical ? styles.verticalCell : styles.horizontalCell}>
      {!isVertical && (
        <Text style={[styles.cellLabel, { color: role.content.medium }]}>{label}</Text>
      )}
      <TouchSlider
        testID={testID}
        value={value}
        onValueChange={(v) => setValue(Array.isArray(v) ? v[0] : v)}
        min={0}
        max={100}
        orientation={orientation}
        progressStyle={progressStyle}
        appearance={appearance}
        start={start}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={label}
        style={isVertical ? styles.verticalSlider : undefined}
      />
      {isVertical && (
        <Text style={[styles.cellLabel, { color: role.content.medium }]} numberOfLines={2}>
          {label}
        </Text>
      )}
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  content: {
    padding: tokens.spacing['4'],
    gap: tokens.spacing['5'],
  },
  section: {
    gap: tokens.spacing['4'],
    paddingBottom: tokens.spacing['4'],
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.size.l,
    fontWeight: typography.weight.high,
  },
  column: {
    flexDirection: 'column',
    gap: tokens.spacing['4'],
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['5'],
    alignItems: 'flex-start',
  },
  horizontalCell: {
    gap: tokens.spacing['2'],
  },
  verticalCell: {
    alignItems: 'center',
    gap: tokens.spacing['2'],
    width: 56,
  },
  verticalSlider: {
    height: 120,
  },
  cellLabel: {
    fontSize: typography.size.xs,
    textAlign: 'center',
  },
});
