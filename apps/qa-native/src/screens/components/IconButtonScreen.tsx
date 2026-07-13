/**
 * IconButtonScreen — focused test surface for `<IconButton>` from
 * `@oneui/ui-native`, per CombinationsRules/IconButtonRules.txt.
 *
 * IMPORTANT — how IconButton's API differs from Button:
 *   • IconButton renders a SINGLE `icon` (required) with a required `aria-label`.
 *     It has NO `start` / `end` slots and NO text children.
 *   • There is NO `contained` prop — on IconButton, attention IS the variant
 *     (high=bold, medium=subtle, low=ghost), so the "uncontained" look is just
 *     the ghost variant (attention=low). There is no separate contained axis.
 *   • It adds a `layout` prop ('1:1' | '3:2') for shape.
 *
 * Rule section 7 (contained=false × attentions) therefore has no literal mapping
 * and is intentionally omitted (the uncontained look is the ghost/low variant
 * already shown in section 1).
 *
 * Every IconButton's `onPress` reports to the shared "last pressed" banner.
 */

import React, { createContext, useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconButton, useSurfaceTokens } from '@oneui/ui-native';
import type {
  IconButtonAttention,
  IconButtonLayout,
  IconButtonSize,
} from '@oneui/ui-native/components/IconButton';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

/* ─── Shared icon ────────────────────────────────────────────────────────── */

// Single glyph for every cell — IconButton's colour + pixel size resolve from
// its own variant / size, so one icon renders correctly across all variants.
const ICON = JdsIcons.IcFavorite;

const ATTENTIONS: readonly IconButtonAttention[] = ['high', 'medium', 'low'];

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

type IconButtonSpecProps = Omit<
  React.ComponentProps<typeof IconButton>,
  'icon' | 'aria-label' | 'testID' | 'onPress' | 'key'
>;

interface IconButtonSpec {
  readonly testID: string;
  readonly ariaLabel: string;
  readonly props?: IconButtonSpecProps;
}

// 1 · All attentions (high / medium / low). IconButton has no slots, so the
// "slot variations" from the rule don't apply — the icon is the content.
const SECTION_ATTENTIONS: readonly IconButtonSpec[] = ATTENTIONS.map((attention) => ({
  testID: `ib-attn-${attention}`,
  ariaLabel: `${attention} attention`,
  props: { attention },
}));

// 4 · Sizes — 2XS / XS / S / M / L / XL (no slot variations).
const SECTION_SIZES: readonly IconButtonSpec[] = (
  ['2xs', 'xs', 's', 'm', 'l', 'xl'] as const
).map((size) => ({
  testID: `ib-size-${size}`,
  ariaLabel: `size ${size}`,
  props: { size: size as IconButtonSize },
}));

// 5 · fullWidth true / false. (No slots on IconButton.)
const SECTION_FULLWIDTH: readonly IconButtonSpec[] = [false, true].map((fullWidth) => ({
  testID: `ib-fw-${fullWidth}`,
  ariaLabel: `fullWidth ${fullWidth}`,
  props: { fullWidth },
}));

// 6 · Loading — true / false (loading renders the internal spinner).
const SECTION_LOADING: readonly IconButtonSpec[] = [true, false].map((loading) => ({
  testID: `ib-loading-${loading}`,
  ariaLabel: `loading ${loading}`,
  props: { loading },
}));

// 7 · Disabled — true only.
const SECTION_DISABLED: readonly IconButtonSpec[] = [
  { testID: 'ib-disabled-true', ariaLabel: 'disabled', props: { disabled: true } },
];

// 8 · Condensed — true / false.
const SECTION_CONDENSED: readonly IconButtonSpec[] = [true, false].map((condensed) => ({
  testID: `ib-condensed-${condensed}`,
  ariaLabel: `condensed ${condensed}`,
  props: { condensed },
}));

// 10 · Shapes — layout '1:1' and '3:2' (the rule's "2:3" maps to the supported '3:2').
const SECTION_SHAPES: readonly IconButtonSpec[] = (
  ['1:1', '3:2'] as const
).map((layout) => ({
  testID: `ib-layout-${layout}`,
  ariaLabel: `layout ${layout}`,
  props: { layout: layout as IconButtonLayout },
}));

// 11 · All appearances.
const SECTION_APPEARANCES: readonly IconButtonSpec[] = APPEARANCES.map((appearance) => ({
  testID: `ib-appearance-${appearance}`,
  ariaLabel: `${appearance} appearance`,
  props: { appearance },
}));

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly buttons: readonly IconButtonSpec[];
  /** Stack vertically (used for fullWidth so the stretch is visible). */
  readonly column?: boolean;
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-attentions', title: '1 · All attentions', buttons: SECTION_ATTENTIONS },
  { testID: 'section-sizes', title: '2 · Sizes (2XS–XL)', buttons: SECTION_SIZES },
  { testID: 'section-fullwidth', title: '3 · fullWidth', buttons: SECTION_FULLWIDTH, column: true },
  { testID: 'section-loading', title: '4 · Loading', buttons: SECTION_LOADING },
  { testID: 'section-disabled', title: '5 · Disabled', buttons: SECTION_DISABLED },
  { testID: 'section-condensed', title: '6 · Condensed', buttons: SECTION_CONDENSED },
  // Rule "contained=false × attentions" is omitted: IconButton has no `contained`
  // prop (the uncontained look is the ghost/low variant already in section 1).
  { testID: 'section-shapes', title: '7 · Shapes (layout 1:1 / 3:2)', buttons: SECTION_SHAPES },
  { testID: 'section-appearances', title: '8 · Appearances', buttons: SECTION_APPEARANCES },
];

/* ─── Press tracking ─────────────────────────────────────────────────────── */

const IconButtonPressContext = createContext<(id: string) => void>(() => {});

function usePressHandler(testID: string): () => void {
  const report = useContext(IconButtonPressContext);
  return useCallback(() => {
    // eslint-disable-next-line no-console
    console.log(`[IconButtonScreen] pressed: ${testID}`);
    report(testID);
  }, [report, testID]);
}

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function IconButtonScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const [lastPressed, setLastPressed] = useState<string | null>(null);
  return (
    <IconButtonPressContext.Provider value={setLastPressed}>
      <ScrollView
        testID='screen-IconButton'
        style={{ backgroundColor: role.surfaces.default }}
        contentContainerStyle={styles.content}
      >
        <Text
          testID='icon-button-last-pressed'
          style={[styles.banner, { color: role.content.medium }]}
        >
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
    </IconButtonPressContext.Provider>
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
  buttons: readonly IconButtonSpec[];
  column?: boolean;
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={column ? styles.slotColumn : styles.slotRow}>
        {buttons.map(({ testID: btnTestID, ariaLabel, props }) => (
          <PressableIconButton
            key={btnTestID}
            testID={btnTestID}
            ariaLabel={ariaLabel}
            {...props}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * IconButton wrapper that attaches the screen's shared press handler keyed off
 * the button's `testID`, and supplies the shared icon.
 */
function PressableIconButton({
  testID,
  ariaLabel,
  ...props
}: { testID: string; ariaLabel: string } & IconButtonSpecProps): React.ReactElement {
  const onPress = usePressHandler(testID);
  return (
    <IconButton
      testID={testID}
      aria-label={ariaLabel}
      icon={ICON}
      {...props}
      onPress={onPress}
    />
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
