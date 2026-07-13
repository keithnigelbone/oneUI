/**
 * TooltipScreen — focused test surface for `<Tooltip>` from
 * `@oneui/ui-native/components/Tooltip`, per CombinationsRules/TooltipRules.txt.
 *
 * Sections:
 *   1. section-positions — All 12 Figma position values in a wrapped row grid
 *   2. section-arrow     — arrow=true and arrow=false (Figma: 'tip')
 *   3. section-disabled  — disabled=false (open) and disabled=true (closed)
 *   4. section-open      — controlled open=true, open=false, and defaultOpen=true
 *   5. section-maxwidth  — no maxWidth (single line) and maxWidth=160 (wrapping)
 *   6. section-subtle    — subtle=false (standard) and subtle=true (reduced motion)
 *
 * All tooltips use open=true + trigger='manual' so they are permanently visible
 * for Applitools screenshot capture via Maestro. No tap interaction needed.
 *
 * Popup positioning: the popup is absolute-positioned inside the anchor View
 * (no portal/modal). Each cell must supply enough vertical/horizontal padding
 * around the trigger so the popup renders without clipping.
 *
 * ─── Figma → code prop mapping ────────────────────────────────────────────────
 *   Figma 'tip'     → code 'arrow'    (BUG-TOOLTIP-1: different name)
 *   Figma 'disable' → code 'disabled' (BUG-TOOLTIP-2: different name)
 *   Figma position names the TIP direction; code names the POPUP side (inverse).
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Tooltip } from '@oneui/ui-native/components/Tooltip';
import type { TooltipPosition } from '@oneui/ui-native/components/Tooltip';
import { tokens, typography } from '@oneui/tokens';

/* ─── Shared trigger pill component ─────────────────────────────────────── */

function TriggerPill({ label }: { label: string }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={[styles.triggerPill, { backgroundColor: role.surfaces.subtle }]}>
      <Text style={[styles.triggerLabel, { color: role.content.high }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* ─── Section testIDs — single-quoted so visual/generate.mts regex picks them up ── */

const S = {
  posTop:         'section-pos-top',
  posTopStart:    'section-pos-topStart',
  posTopEnd:      'section-pos-topEnd',
  posBottom:      'section-pos-bottom',
  posBottomStart: 'section-pos-bottomStart',
  posBottomEnd:   'section-pos-bottomEnd',
  posLeft:        'section-pos-left',
  posLeftStart:   'section-pos-leftStart',
  posLeftEnd:     'section-pos-leftEnd',
  posRight:       'section-pos-right',
  posRightStart:  'section-pos-rightStart',
  posRightEnd:    'section-pos-rightEnd',
  arrow:          'section-arrow',
  disabled:       'section-disabled',
  open:           'section-open',
  maxwidth:       'section-maxwidth',
  subtle:         'section-subtle',
} as const;

/* ─── Position data — each position paired with its section testID ─────────── */

const POSITIONS: readonly { position: TooltipPosition; sectionId: string }[] = [
  { position: 'top',         sectionId: S.posTop },
  { position: 'topStart',    sectionId: S.posTopStart },
  { position: 'topEnd',      sectionId: S.posTopEnd },
  { position: 'bottom',      sectionId: S.posBottom },
  { position: 'bottomStart', sectionId: S.posBottomStart },
  { position: 'bottomEnd',   sectionId: S.posBottomEnd },
  { position: 'left',        sectionId: S.posLeft },
  { position: 'leftStart',   sectionId: S.posLeftStart },
  { position: 'leftEnd',     sectionId: S.posLeftEnd },
  { position: 'right',       sectionId: S.posRight },
  { position: 'rightStart',  sectionId: S.posRightStart },
  { position: 'rightEnd',    sectionId: S.posRightEnd },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function TooltipScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID="screen-Tooltip"
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {POSITIONS.map(({ position, sectionId }) => (
        <PositionSection key={position} position={position} sectionId={sectionId} />
      ))}
      <ArrowSection />
      <DisabledSection />
      <OpenSection />
      <MaxWidthSection />
      <SubtleSection />
    </ScrollView>
  );
}

/* ─── Section: one per position ──────────────────────────────────────────── */

function PositionSection({
  position,
  sectionId,
}: {
  position: TooltipPosition;
  sectionId: string;
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={sectionId} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{position}</Text>
      <View style={styles.positionCell}>
        <Tooltip
          position={position}
          content={position}
          open
          trigger="manual"
          testID={`tooltip-pos-${position}`}
        >
          <TriggerPill label={position} />
        </Tooltip>
      </View>
    </View>
  );
}

/* ─── Section: Arrow (Figma: tip) ────────────────────────────────────────── */

function ArrowSection(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={S.arrow} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>
        2 · Arrow / tip (true and false)
      </Text>
      <Text style={[styles.sectionNote, { color: role.content.medium }]}>
        Figma calls this prop 'tip'. Code uses 'arrow'. (BUG-TOOLTIP-1)
      </Text>
      <View style={styles.row}>
        <View style={styles.twoColCell}>
          <Tooltip
            position="bottom"
            content="With arrow"
            arrow={true}
            open
            trigger="manual"
            testID="tooltip-arrow-true"
          >
            <TriggerPill label="arrow=true" />
          </Tooltip>
        </View>
        <View style={styles.twoColCell}>
          <Tooltip
            position="bottom"
            content="No arrow"
            arrow={false}
            open
            trigger="manual"
            testID="tooltip-arrow-false"
          >
            <TriggerPill label="arrow=false" />
          </Tooltip>
        </View>
      </View>
    </View>
  );
}

/* ─── Section: Disabled ──────────────────────────────────────────────────── */

function DisabledSection(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={S.disabled} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>
        3 · Disabled (true and false)
      </Text>
      <Text style={[styles.sectionNote, { color: role.content.medium }]}>
        Figma calls this prop 'disable'. Code uses 'disabled'. (BUG-TOOLTIP-2)
      </Text>
      <View style={styles.row}>
        <View style={styles.twoColCell}>
          <Tooltip
            position="bottom"
            content="Enabled tooltip"
            disabled={false}
            open
            trigger="manual"
            testID="tooltip-disabled-false"
          >
            <TriggerPill label="disabled=false" />
          </Tooltip>
        </View>
        <View style={styles.twoColCell}>
          {/* disabled=true: popup should NOT be visible */}
          <Tooltip
            position="bottom"
            content="Hidden tooltip"
            disabled={true}
            trigger="click"
            testID="tooltip-disabled-true"
          >
            <TriggerPill label="disabled=true" />
          </Tooltip>
        </View>
      </View>
    </View>
  );
}

/* ─── Section: Controlled open state ─────────────────────────────────────── */

function StatefulTooltip(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <View style={styles.twoColCell}>
      <Tooltip
        position="bottom"
        content="Uncontrolled"
        defaultOpen={true}
        trigger="click"
        onOpenChange={setIsOpen}
        testID="tooltip-default-open"
      >
        <TriggerPill label={isOpen ? 'defaultOpen (open)' : 'defaultOpen (closed)'} />
      </Tooltip>
    </View>
  );
}

function OpenSection(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={S.open} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>
        4 · Controlled open state
      </Text>
      <View style={styles.row}>
        <View style={styles.twoColCell}>
          <Tooltip
            position="bottom"
            content="Controlled open"
            open={true}
            trigger="manual"
            testID="tooltip-open-true"
          >
            <TriggerPill label="open=true" />
          </Tooltip>
        </View>
        <View style={styles.twoColCell}>
          <Tooltip
            position="bottom"
            content="Controlled closed"
            open={false}
            trigger="manual"
            testID="tooltip-open-false"
          >
            <TriggerPill label="open=false" />
          </Tooltip>
        </View>
      </View>
      <View style={[styles.row, { marginTop: tokens.spacing['3'] }]}>
        <StatefulTooltip />
      </View>
    </View>
  );
}

/* ─── Section: maxWidth (multiline) ──────────────────────────────────────── */

function MaxWidthSection(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={S.maxwidth} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>
        5 · maxWidth (multiline wrapping)
      </Text>
      <View style={styles.row}>
        <View style={styles.twoColCell}>
          <Tooltip
            position="bottom"
            content="Short tooltip"
            open
            trigger="manual"
            testID="tooltip-maxwidth-none"
          >
            <TriggerPill label="no maxWidth" />
          </Tooltip>
        </View>
        <View style={styles.twoColCell}>
          <Tooltip
            position="bottom"
            content="This is a longer tooltip message that wraps onto multiple lines"
            maxWidth={160}
            open
            trigger="manual"
            testID="tooltip-maxwidth-160"
          >
            <TriggerPill label="maxWidth=160" />
          </Tooltip>
        </View>
      </View>
    </View>
  );
}

/* ─── Section: Subtle motion ─────────────────────────────────────────────── */

function SubtleSection(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={S.subtle} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>
        6 · Subtle motion
      </Text>
      <Text style={[styles.sectionNote, { color: role.content.medium }]}>
        Both cells appear visually identical at settled state. Motion path differs.
      </Text>
      <View style={styles.row}>
        <View style={styles.twoColCell}>
          <Tooltip
            position="bottom"
            content="Standard motion"
            subtle={false}
            open
            trigger="manual"
            testID="tooltip-subtle-false"
          >
            <TriggerPill label="subtle=false" />
          </Tooltip>
        </View>
        <View style={styles.twoColCell}>
          <Tooltip
            position="bottom"
            content="Subtle motion"
            subtle={true}
            open
            trigger="manual"
            testID="tooltip-subtle-true"
          >
            <TriggerPill label="subtle=true" />
          </Tooltip>
        </View>
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  content: {
    padding: tokens.spacing['4'],
    gap: tokens.spacing['5'],
  },
  section: {
    gap: tokens.spacing['3'],
    paddingBottom: tokens.spacing['4'],
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.size.l,
    fontWeight: typography.weight.high,
  },
  sectionNote: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  // Position cell: generous padding on all sides so the absolute-positioned popup
  // (top/bottom/left/right) is fully visible within its own section.
  positionCell: {
    paddingVertical: 52,
    paddingHorizontal: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Two-column cell for paired comparisons (arrow, disabled, open, maxwidth, subtle)
  row: {
    flexDirection: 'row',
    gap: tokens.spacing['3'],
  },
  twoColCell: {
    flex: 1,
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Trigger pill — backgroundColor and color are applied inline from useSurfaceTokens
  triggerPill: {
    paddingHorizontal: tokens.spacing['2-5'],
    paddingVertical: tokens.spacing['1-5'],
    borderRadius: tokens.shape.xs,
  },
  triggerLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
