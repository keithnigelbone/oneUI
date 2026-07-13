/**
 * ButtonScreen — focused test surface for `<Button>` from `@oneui/ui-native`.
 *
 * Replaces the exhaustive attention × contained × size × slot matrix with the
 * 10 targeted sections defined in conditions.txt:
 *
 *   1. All attentions (high/medium/low) + slot variations (start/end/both)
 *   2. Slots — start / end / both, as icons AND as CPIs
 *   3. CPI variants — determinate / indeterminate
 *   4. Sizes — S / M / L (no slot variations)
 *   5. fullWidth true/false + slot variations (start/end/both)
 *   6. Loading — true / false
 *   7. Disabled — true only
 *   8. Condensed — true / false
 *   9. Uncontained (contained=false) × attentions high/medium/low
 *  10. All appearances
 *
 * Each button carries a stable, descriptive `testID` so Maestro / Detox can
 * target a specific variant. Every button's `onPress` reports to the shared
 * "last pressed" banner at the top of the screen.
 */

import React, { createContext, useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, useSurfaceTokens } from '@oneui/ui-native';
import { Icon } from '@oneui/ui-native/components/Icon';
import { CircularProgressIndicator } from '@oneui/ui-native/components/CircularProgressIndicator';
import type {
  ButtonAttention,
  ButtonSize,
} from '@oneui/ui-native/components/Button';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

/* ─── Slot elements ──────────────────────────────────────────────────────── */

// Module-scope elements — no per-render allocation. Size + colour resolve
// against each Button's slot context, so the same element renders correctly
// across attention / surface variants.
const StartIcon = <Icon icon={JdsIcons.IcFavorite} />;
const EndIcon = <Icon icon='settings' />;

const SlotCpi = (
  <CircularProgressIndicator value={50} variant='determinate' size='XS' aria-label='Loading' />
);
const CpiDeterminate = (
  <CircularProgressIndicator variant='determinate' size='XS' value={50} aria-label='Loading 50%' />
);
const CpiIndeterminate = (
  <CircularProgressIndicator variant='indeterminate' size='XS' aria-label='Loading' />
);

const ATTENTIONS: readonly ButtonAttention[] = ['high', 'medium', 'low'];

const APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

/* ─── Specs ──────────────────────────────────────────────────────────────── */

type ButtonSpecProps = Omit<
  React.ComponentProps<typeof Button>,
  'children' | 'testID' | 'key'
>;

interface ButtonSpec {
  readonly testID: string;
  readonly label: string;
  readonly props?: ButtonSpecProps;
}

// Slot variations reused by section 1 (icons) and section 5 (fullWidth).
const ICON_SLOT_VARIATIONS = [
  { key: 'start', slot: { start: StartIcon } },
  { key: 'end', slot: { end: EndIcon } },
  { key: 'both', slot: { start: StartIcon, end: EndIcon } },
] as const;

// 1 · All attentions — each attention with no slot + start / end / both icons.
const SECTION_ATTENTIONS: readonly ButtonSpec[] = ATTENTIONS.flatMap((attention) => [
  { testID: `btn-attn-${attention}-none`, label: attention, props: { attention } },
  ...ICON_SLOT_VARIATIONS.map(({ key, slot }) => ({
    testID: `btn-attn-${attention}-${key}`,
    label: attention,
    props: { attention, ...slot },
  })),
]);

// 2 · Slots — start / end / both as icons, then start / end / both as CPIs.
const SECTION_SLOTS: readonly ButtonSpec[] = [
  { testID: 'btn-slot-icon-start', label: 'Start icon', props: { start: StartIcon } },
  { testID: 'btn-slot-icon-end', label: 'End icon', props: { end: EndIcon } },
  { testID: 'btn-slot-icon-both', label: 'Both icons', props: { start: StartIcon, end: EndIcon } },
  { testID: 'btn-slot-cpi-start', label: 'Start CPI', props: { start: SlotCpi } },
  { testID: 'btn-slot-cpi-end', label: 'End CPI', props: { end: SlotCpi } },
  { testID: 'btn-slot-cpi-both', label: 'Both CPI', props: { start: SlotCpi, end: SlotCpi } },
];

// 3 · CPI variants — determinate / indeterminate.
const SECTION_CPI: readonly ButtonSpec[] = [
  { testID: 'btn-cpi-determinate', label: 'Determinate', props: { start: CpiDeterminate } },
  { testID: 'btn-cpi-indeterminate', label: 'Indeterminate', props: { start: CpiIndeterminate } },
];

// 4 · Sizes — S / M / L (no slot variations).
const SECTION_SIZES: readonly ButtonSpec[] = (
  [
    ['s', 'S'],
    ['m', 'M'],
    ['l', 'L'],
  ] as const
).map(([value, label]) => ({
  testID: `btn-size-${value}`,
  label: `Size ${label}`,
  props: { size: value as ButtonSize },
}));

// 5 · fullWidth true/false + slot variations (start / end / both).
const SECTION_FULLWIDTH: readonly ButtonSpec[] = [false, true].flatMap((fullWidth) =>
  ICON_SLOT_VARIATIONS.map(({ key, slot }) => ({
    testID: `btn-fw-${fullWidth}-${key}`,
    label: `fullWidth ${fullWidth} · ${key}`,
    props: { fullWidth, ...slot },
  })),
);

// 6 · Loading — true / false.
const SECTION_LOADING: readonly ButtonSpec[] = [
  { testID: 'btn-loading-true', label: 'Loading true', props: { loading: true } },
  { testID: 'btn-loading-false', label: 'Loading false', props: { loading: false } },
];

// 7 · Disabled — true only.
const SECTION_DISABLED: readonly ButtonSpec[] = [
  { testID: 'btn-disabled-true', label: 'Disabled true', props: { disabled: true } },
];

// 8 · Condensed — true / false.
const SECTION_CONDENSED: readonly ButtonSpec[] = [
  { testID: 'btn-condensed-true', label: 'Condensed true', props: { condensed: true } },
  { testID: 'btn-condensed-false', label: 'Condensed false', props: { condensed: false } },
];

// 9 · Uncontained (contained=false) × attentions + slot variations (start/end/both).
// Label is dynamic: "<slot> x <attention>" (e.g. "start x high").
const SECTION_UNCONTAINED: readonly ButtonSpec[] = ATTENTIONS.flatMap((attention) =>
  ICON_SLOT_VARIATIONS.map(({ key, slot }) => ({
    testID: `btn-uncontained-${attention}-${key}`,
    label: `${key} x ${attention}`,
    props: { contained: false, attention, ...slot },
  })),
);

// 10 · All appearances.
const SECTION_APPEARANCES: readonly ButtonSpec[] = APPEARANCES.map((appearance) => ({
  testID: `btn-appearance-${appearance}`,
  label: appearance,
  props: { appearance },
}));

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly buttons: readonly ButtonSpec[];
  /** Stack buttons vertically (used for fullWidth so the stretch is visible). */
  readonly column?: boolean;
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-attentions', title: '1 · All attentions (+ slots)', buttons: SECTION_ATTENTIONS },
  { testID: 'section-slots', title: '2 · Slots — icon & CPI', buttons: SECTION_SLOTS },
  { testID: 'section-cpi', title: '3 · CPI variants', buttons: SECTION_CPI },
  { testID: 'section-sizes', title: '4 · Sizes (S / M / L)', buttons: SECTION_SIZES },
  { testID: 'section-fullwidth', title: '5 · fullWidth (+ slots)', buttons: SECTION_FULLWIDTH, column: true },
  { testID: 'section-loading', title: '6 · Loading', buttons: SECTION_LOADING },
  { testID: 'section-disabled', title: '7 · Disabled', buttons: SECTION_DISABLED },
  { testID: 'section-condensed', title: '8 · Condensed', buttons: SECTION_CONDENSED },
  { testID: 'section-uncontained', title: '9 · Uncontained × attentions', buttons: SECTION_UNCONTAINED },
  { testID: 'section-appearances', title: '10 · Appearances', buttons: SECTION_APPEARANCES },
];

/* ─── Press tracking ─────────────────────────────────────────────────────── */

/**
 * Every Button reports its press through this context. The provider records the
 * last-pressed `testID` (rendered in the banner) and logs to the Metro console.
 */
const ButtonPressContext = createContext<(id: string) => void>(() => {});

function usePressHandler(testID: string): () => void {
  const report = useContext(ButtonPressContext);
  return useCallback(() => {
    // eslint-disable-next-line no-console
    console.log(`[ButtonScreen] pressed: ${testID}`);
    report(testID);
  }, [report, testID]);
}

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function ButtonScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const [lastPressed, setLastPressed] = useState<string | null>(null);
  return (
    <ButtonPressContext.Provider value={setLastPressed}>
      <ScrollView
        testID='screen-Button'
        style={{ backgroundColor: role.surfaces.default }}
        contentContainerStyle={styles.content}
      >
        <Text testID='button-last-pressed' style={[styles.banner, { color: role.content.medium }]}>
          {lastPressed ? `last pressed: ${lastPressed}` : 'last pressed: (none)'}
        </Text>
        {SECTIONS.map((section) => (
          <SimpleSection
            key={section.testID}
            testID={section.testID}
            title={section.title}
            buttons={section.buttons}
            column={section.column}
          />
        ))}
      </ScrollView>
    </ButtonPressContext.Provider>
  );
}

/* ─── Section primitives ─────────────────────────────────────────────────── */

function SimpleSection({
  testID,
  title,
  buttons,
  column,
}: {
  testID: string;
  title: string;
  buttons: readonly ButtonSpec[];
  column?: boolean;
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={column ? styles.slotColumn : styles.slotRow}>
        {buttons.map(({ testID: btnTestID, label, props }) => (
          <PressableButton key={btnTestID} testID={btnTestID} {...props}>
            {label}
          </PressableButton>
        ))}
      </View>
    </View>
  );
}

/**
 * Button wrapper that attaches the screen's shared press handler keyed off the
 * button's own `testID`, without repeating the handler at each call site.
 */
function PressableButton({
  testID,
  children,
  ...props
}: React.ComponentProps<typeof Button>): React.ReactElement {
  const onPress = usePressHandler(testID ?? 'unknown');
  return (
    <Button testID={testID} {...props} onPress={onPress}>
      {children}
    </Button>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  content: {
    padding: tokens.spacing['4'],
    gap: tokens.spacing['5'],
  },
  banner: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
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
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['2-5'],
    alignItems: 'center',
  },
  slotColumn: {
    flexDirection: 'column',
    gap: tokens.spacing['2-5'],
  },
});
