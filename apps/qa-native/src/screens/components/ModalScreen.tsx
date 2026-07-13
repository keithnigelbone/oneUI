/**
 * ModalScreen — focused test surface for `<Modal>` from
 * `@oneui/ui-native/components/Modal`, per CombinationsRules/ModalRules.txt.
 *
 * Sections:
 *   1. Sizes                  — S / M / L
 *   2. Header visibility      — header true / false
 *   3. Header alignment       — left / center
 *   4. Header start slot      — none / icon / badge
 *   5. Title visibility       — showTitle true / false
 *   6. Description visibility — showDescription true / false
 *   7. Divider top            — none / onScroll / always
 *   8. Divider bottom         — none / onScroll / always
 *   9. Footer visibility      — footer true / false
 *  10. Footer orientation     — horizontal / vertical
 *  11. Footer start slot      — none / with slot content
 *  12. Dismissible            — dismissible true / false
 *  13. Open state             — controlled trigger / defaultOpen
 *  14. Scrollable body        — long content for max-height behaviour
 *  15. fullWidth              — size FullWidth
 *
 * Each cell renders an INLINE PREVIEW CARD — the modal's exact visual
 * structure (header / dividers / body / footer / close button) replicated as
 * a plain View using the same tokens and styles as the real Modal component.
 * This lets all variants be visible simultaneously while scrolling, with no
 * trigger buttons needed and no portal-stacking issues.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text as RNText, View, type ViewStyle } from 'react-native';
import {
  useSurfaceTokens,
  useOneUITheme,
  useTypographyTokens,
  typographyToTextStyle,
} from '@oneui/ui-native';
import { Button } from '@oneui/ui-native/components/Button';
import { IconButton } from '@oneui/ui-native/components/IconButton';
import { Icon } from '@oneui/ui-native/components/Icon';
import { Badge } from '@oneui/ui-native/components/Badge';
import { Divider } from '@oneui/ui-native/components/Divider';
import type {
  DividerVisibility,
  FooterOrientation,
  HeaderAlign,
  ModalSize,
} from '@oneui/ui-native/components/Modal';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

const GLYPH = JdsIcons.IcFavorite;
const noOp = () => {};

const SIZES: readonly ModalSize[] = ['S', 'M', 'L'];
const HEADER_ALIGNS: readonly HeaderAlign[] = ['left', 'center'];
const DIVIDER_VIS: readonly DividerVisibility[] = ['none', 'onScroll', 'always'];
const FOOTER_ORIENTATIONS: readonly FooterOrientation[] = ['horizontal', 'vertical'];

/* ─── Popup size — mirrors Modal.styles.native.ts POPUP_SIZE ────────────── */

const INLINE_SIZE: Record<ModalSize, ViewStyle> = {
  S: { width: 320, maxHeight: 400 },
  M: { width: 320, maxHeight: 520 },
  L: { width: 320, maxHeight: 600 },
  FullWidth: { alignSelf: 'stretch', maxHeight: 600 },
};

/* ─── Cell spec ─────────────────────────────────────────────────────────── */

type HeaderStartKind = 'none' | 'icon' | 'badge';

interface ModalSpec {
  readonly testID: string;
  readonly label: string;
  readonly size?: ModalSize;
  readonly header?: boolean;
  readonly headerAlign?: HeaderAlign;
  readonly headerStart?: HeaderStartKind;
  readonly showTitle?: boolean;
  readonly showDescription?: boolean;
  readonly dividerTopVisibility?: DividerVisibility;
  readonly dividerBottomVisibility?: DividerVisibility;
  readonly footer?: boolean;
  readonly footerOrientation?: FooterOrientation;
  readonly footerStart?: boolean;
  readonly dismissible?: boolean;
  readonly scrollableBody?: boolean;
  readonly ariaLabel?: string;
}

/* ─── Section specs ─────────────────────────────────────────────────────── */

const SIZE_CELLS: readonly ModalSpec[] = SIZES.map((size) => ({
  testID: `modal-size-${size}`,
  label: `size ${size}`,
  size,
}));

const HEADER_CELLS: readonly ModalSpec[] = [true, false].map((header) => ({
  testID: `modal-header-${header}`,
  label: `header ${header}`,
  header,
  ariaLabel: header ? undefined : 'Headerless modal',
}));

const HEADER_ALIGN_CELLS: readonly ModalSpec[] = HEADER_ALIGNS.map((headerAlign) => ({
  testID: `modal-header-align-${headerAlign}`,
  label: `align ${headerAlign}`,
  headerAlign,
}));

const HEADER_START_CELLS: readonly ModalSpec[] = (
  ['none', 'icon', 'badge'] as const
).map((kind) => ({
  testID: `modal-header-start-${kind}`,
  label: `headerStart ${kind}`,
  headerStart: kind,
}));

const TITLE_CELLS: readonly ModalSpec[] = [true, false].map((showTitle) => ({
  testID: `modal-title-${showTitle}`,
  label: `showTitle ${showTitle}`,
  showTitle,
}));

const DESCRIPTION_CELLS: readonly ModalSpec[] = [true, false].map((showDescription) => ({
  testID: `modal-description-${showDescription}`,
  label: `showDescription ${showDescription}`,
  showDescription,
}));

const DIVIDER_TOP_CELLS: readonly ModalSpec[] = DIVIDER_VIS.map((dividerTopVisibility) => ({
  testID: `modal-divider-top-${dividerTopVisibility}`,
  label: `top ${dividerTopVisibility}`,
  dividerTopVisibility,
  scrollableBody: dividerTopVisibility === 'onScroll',
}));

const DIVIDER_BOTTOM_CELLS: readonly ModalSpec[] = DIVIDER_VIS.map((dividerBottomVisibility) => ({
  testID: `modal-divider-bottom-${dividerBottomVisibility}`,
  label: `bottom ${dividerBottomVisibility}`,
  dividerBottomVisibility,
  scrollableBody: dividerBottomVisibility === 'onScroll',
}));

const FOOTER_CELLS: readonly ModalSpec[] = [true, false].map((footer) => ({
  testID: `modal-footer-${footer}`,
  label: `footer ${footer}`,
  footer,
}));

const FOOTER_ORIENTATION_CELLS: readonly ModalSpec[] = FOOTER_ORIENTATIONS.map(
  (footerOrientation) => ({
    testID: `modal-footer-orient-${footerOrientation}`,
    label: footerOrientation,
    footerOrientation,
  }),
);

const FOOTER_START_CELLS: readonly ModalSpec[] = [false, true].map((footerStart) => ({
  testID: `modal-footer-start-${footerStart ? 'slot' : 'none'}`,
  label: footerStart ? 'footerStart slot' : 'footerStart none',
  footerStart,
}));

const DISMISSIBLE_CELLS: readonly ModalSpec[] = [true, false].map((dismissible) => ({
  testID: `modal-dismissible-${dismissible}`,
  label: `dismissible ${dismissible}`,
  dismissible,
}));

const OPEN_CELLS: readonly ModalSpec[] = [
  {
    testID: 'modal-open-controlled',
    label: 'open controlled',
  },
  {
    testID: 'modal-open-default',
    label: 'defaultOpen true',
  },
];

const SCROLL_CELLS: readonly ModalSpec[] = [
  {
    testID: 'modal-scroll-body',
    label: 'scrollable body',
    scrollableBody: true,
    dividerTopVisibility: 'onScroll',
    dividerBottomVisibility: 'onScroll',
  },
];

const FULLWIDTH_CELLS: readonly ModalSpec[] = [
  {
    testID: 'modal-size-FullWidth',
    label: 'size fullWidth',
    size: 'FullWidth',
  },
];

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly ModalSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-sizes', title: '1 · Sizes (S / M / L)', cells: SIZE_CELLS },
  { testID: 'section-header', title: '2 · Header visibility', cells: HEADER_CELLS },
  { testID: 'section-header-align', title: '3 · Header alignment', cells: HEADER_ALIGN_CELLS },
  { testID: 'section-header-start', title: '4 · Header start slot', cells: HEADER_START_CELLS },
  { testID: 'section-title', title: '5 · Title visibility', cells: TITLE_CELLS },
  { testID: 'section-description', title: '6 · Description visibility', cells: DESCRIPTION_CELLS },
  { testID: 'section-divider-top', title: '7 · Divider top visibility', cells: DIVIDER_TOP_CELLS },
  {
    testID: 'section-divider-bottom',
    title: '8 · Divider bottom visibility',
    cells: DIVIDER_BOTTOM_CELLS,
  },
  { testID: 'section-footer', title: '9 · Footer visibility', cells: FOOTER_CELLS },
  { testID: 'section-footer-orient', title: '10 · Footer orientation', cells: FOOTER_ORIENTATION_CELLS },
  { testID: 'section-footer-start', title: '11 · Footer start slot', cells: FOOTER_START_CELLS },
  { testID: 'section-dismissible', title: '12 · Dismissible', cells: DISMISSIBLE_CELLS },
  { testID: 'section-open', title: '13 · Open state', cells: OPEN_CELLS },
  { testID: 'section-scroll', title: '14 · Scrollable body', cells: SCROLL_CELLS },
  { testID: 'section-fullwidth', title: '15 · Modal with size fullWidth', cells: FULLWIDTH_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function ModalScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Modal'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {SECTIONS.map((section) => (
        <Section key={section.testID} testID={section.testID} title={section.title} cells={section.cells} />
      ))}
    </ScrollView>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────────── */

function Section({
  testID,
  title,
  cells,
}: {
  testID: string;
  title: string;
  cells: readonly ModalSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <RNText style={[styles.sectionTitle, { color: role.content.high }]}>{title}</RNText>
      <View style={styles.column}>
        {cells.map((cell) => (
          <ModalPreviewCard key={cell.testID} {...cell} />
        ))}
      </View>
    </View>
  );
}

/* ─── Inline modal preview card ────────────────────────────────────────────
 *
 * Replicates the visual structure of the real Modal component using the same
 * tokens and layout — without the RNModal portal. This lets all variants render
 * simultaneously in the ScrollView.
 * ────────────────────────────────────────────────────────────────────────── */

function headerStartNode(kind: HeaderStartKind | undefined): React.ReactNode {
  if (kind === 'icon') return <Icon icon={GLYPH} size='4' appearance='secondary' aria-hidden />;
  if (kind === 'badge') return <Badge size='s' attention='high' appearance='informative'>New</Badge>;
  return undefined;
}

function ModalPreviewCard(spec: ModalSpec): React.ReactElement {
  const theme = useOneUITheme();
  const surfaceRole = useSurfaceTokens('neutral');
  const contentRole = useSurfaceTokens('neutral');
  const titleTypo = useTypographyTokens('title', 'M');
  const descriptionTypo = useTypographyTokens('body', 'S');

  const resolvedSize = spec.size ?? 'S';
  const showHeader = spec.header !== false;
  const showTitleText = spec.showTitle !== false;
  const showDescriptionText = spec.showDescription !== false;
  const showFooter = spec.footer !== false;
  const vertical = spec.footerOrientation === 'vertical';
  const isCenter = spec.headerAlign === 'center';
  const headerStart = headerStartNode(spec.headerStart);

  // For the static preview, show dividers whenever 'always', or when
  // 'onScroll' and the body is scrollable (simulates mid-scroll state).
  const showTopDivider =
    spec.dividerTopVisibility === 'always' ||
    (spec.dividerTopVisibility === 'onScroll' && spec.scrollableBody);
  const showBottomDivider =
    spec.dividerBottomVisibility === 'always' ||
    (spec.dividerBottomVisibility === 'onScroll' && spec.scrollableBody);

  const footerActions = (
    <View style={vertical ? previewStyles.footerActionsVertical : previewStyles.footerActionsRow}>
      <Button attention='low' fullWidth={vertical} onPress={noOp}>Cancel</Button>
      <Button attention='high' fullWidth={vertical} onPress={noOp}>Confirm</Button>
    </View>
  );

  return (
    <View
      testID={spec.testID}
      style={[
        previewStyles.popup,
        INLINE_SIZE[resolvedSize],
        {
          backgroundColor: surfaceRole.surfaces.elevated,
          borderRadius: theme.shape.M,
        },
      ]}
    >
      {/* Header */}
      {showHeader && (
        <View style={previewStyles.header}>
          <View
            style={[
              previewStyles.headerContent,
              isCenter && previewStyles.headerContentCenter,
            ]}
          >
            {headerStart && (
              <View style={previewStyles.headerStartSlot}>{headerStart}</View>
            )}
            <View
              style={[
                previewStyles.headerText,
                isCenter && previewStyles.headerTextCenter,
              ]}
            >
              {showTitleText && (
                <RNText
                  style={[
                    typographyToTextStyle(titleTypo),
                    { color: contentRole.content.high },
                    isCenter && { textAlign: 'center' },
                  ]}
                >
                  Modal title
                </RNText>
              )}
              {showDescriptionText && (
                <RNText
                  style={[
                    typographyToTextStyle(descriptionTypo),
                    { color: contentRole.content.medium },
                    isCenter && { textAlign: 'center' },
                  ]}
                >
                  Supporting description for this modal variant.
                </RNText>
              )}
            </View>
          </View>
          <IconButton icon='close' size='xs' attention='low' aria-label='Close' onPress={noOp} />
        </View>
      )}

      {/* Top divider */}
      {showTopDivider && <Divider />}

      {/* Body */}
      <View style={previewStyles.body}>
        {spec.scrollableBody ? (
          <>
            {Array.from({ length: 6 }, (_, i) => (
              <RNText
                key={i}
                style={[styles.bodyText, { color: contentRole.content.high }]}
              >
                Paragraph {i + 1}: scrollable body for divider onScroll and max-height.
              </RNText>
            ))}
          </>
        ) : (
          <RNText style={[styles.bodyText, { color: contentRole.content.high }]}>
            {spec.label} — modal body slot. Insert any layout or elements as needed.
          </RNText>
        )}
      </View>

      {/* Bottom divider */}
      {showBottomDivider && <Divider />}

      {/* Footer */}
      {showFooter && (
        <View style={[previewStyles.footer, vertical && previewStyles.footerVertical]}>
          {spec.footerStart && (
            <View
              style={[
                previewStyles.footerStart,
                vertical && previewStyles.footerStartVertical,
              ]}
            >
              <RNText style={[styles.footerStartLabel, { color: contentRole.content.medium }]}>
                Optional
              </RNText>
            </View>
          )}
          {footerActions}
        </View>
      )}
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
  bodyText: {
    fontSize: typography.size.m,
    lineHeight: typography.size.m * 1.5,
    marginVertical: tokens.spacing['1'],
  },
  footerStartLabel: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
});

// Mirror Modal.styles.native.ts exactly so the preview matches the real component.
const previewStyles = StyleSheet.create({
  popup: {
    flexDirection: 'column',
    overflow: 'hidden',
    // Elevation / shadow for the card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: tokens.spacing['4'],
    minHeight: tokens.spacing['14'],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: tokens.spacing['2'],
  },
  headerContentCenter: {
    justifyContent: 'center',
  },
  headerText: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacing['1'],
    flex: 1,
    minHeight: tokens.spacing['6'],
  },
  headerTextCenter: {
    alignItems: 'center',
  },
  headerStartSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: tokens.spacing['4'],
    paddingVertical: tokens.spacing['2'],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: tokens.spacing['4'],
    gap: tokens.spacing['2'],
  },
  footerVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  footerStart: {
    marginRight: 'auto',
  },
  footerStartVertical: {
    marginRight: 0,
    marginBottom: tokens.spacing['2'],
  },
  footerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['2'],
  },
  footerActionsVertical: {
    flexDirection: 'column',
    width: '100%',
    gap: tokens.spacing['2'],
  },
});
