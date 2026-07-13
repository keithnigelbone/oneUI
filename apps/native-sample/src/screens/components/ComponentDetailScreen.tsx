/**
 * ComponentDetailScreen.tsx
 *
 * Renders the detail view for a component identified by `route.params.id`.
 * Each component dispatches its showcase suite based on the active
 * library (`native | rnr | tamagui`). The native, rnr, and tamagui
 * implementations of every Wave 1 primitive expose the same showcase
 * function names so the dispatch table is a static mapping.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';

// ============================================================================
// Native showcases
// ============================================================================

import * as NativeButton from '@oneui/ui-native/showcase/Button';
import * as NativeBadge from '@oneui/ui-native/showcase/Badge';
import * as NativeCounterBadge from '@oneui/ui-native/showcase/CounterBadge';
import * as NativeIndicatorBadge from '@oneui/ui-native/showcase/IndicatorBadge';
import * as NativeContainer from '@oneui/ui-native/showcase/Container';
import * as NativeDivider from '@oneui/ui-native/showcase/Divider';
import * as NativeSeparator from '@oneui/ui-native/showcase/Separator';
import * as NativeSpinner from '@oneui/ui-native/showcase/Spinner';
import * as NativeProgress from '@oneui/ui-native/showcase/Progress';
import * as NativePaginationDots from '@oneui/ui-native/showcase/PaginationDots';
import * as NativeImage from '@oneui/ui-native/showcase/Image';
import * as NativeLogo from '@oneui/ui-native/showcase/Logo';
import * as NativeAvatar from '@oneui/ui-native/showcase/Avatar';

import { Section } from '../../shared/Section';
import { usePageContext } from '../../PageContext';
import type { LibraryName } from '../../tokens';
import { getEntry } from './nativeRegistry';
import type { ComponentsStackParamList } from './ComponentsStack';

type Props = NativeStackScreenProps<ComponentsStackParamList, 'Detail'>;

// ============================================================================
// Per-library suite tables
// ============================================================================

// Each suite type uses Pick over the native showcase module so we only
// require the showcase functions that the Detail dispatcher actually
// renders. The native suite ships extra exports (e.g. ButtonThemes) that
// are not part of the cross-library parity contract.
type ButtonSuite = Pick<
  typeof NativeButton,
  | 'ButtonAttentionLevels'
  | 'ButtonThemes'
  | 'ButtonSizes'
  | 'ButtonContained'
  | 'ButtonCondensed'
  | 'ButtonSlotPadding'
  | 'ButtonStates'
  | 'ButtonWithSlots'
  | 'ButtonLoadingWithSlots'
  | 'ButtonFullWidth'
  | 'ButtonAppearances'
  | 'ButtonDensity'
  | 'ButtonMotion'
  | 'ButtonSurfaceContext'
>;
const BUTTON_SUITES: Record<LibraryName, ButtonSuite> = {
  native: NativeButton,
};

type BadgeSuite = Pick<
  typeof NativeBadge,
  | 'BadgeDefault'
  | 'BadgeVariants'
  | 'BadgeSizes'
  | 'BadgeWithSlots'
  | 'BadgeSizesWithSlots'
  | 'BadgeAppearances'
  | 'BadgeThemes'
  | 'BadgeSlotAdaptation'
  | 'BadgeSurfaceContextBold'
  | 'BadgeSurfaceContextSubtle'
  | 'BadgeSurfaceContextAllModes'
>;
const BADGE_SUITES: Record<LibraryName, BadgeSuite> = {
  native: NativeBadge,
};

type CounterBadgeSuite = Pick<
  typeof NativeCounterBadge,
  | 'CounterBadgeDefault'
  | 'CounterBadgeVariants'
  | 'CounterBadgeSizes'
  | 'CounterBadgeMaxValue'
  | 'CounterBadgeAppearances'
  | 'CounterBadgeThemes'
>;
const COUNTER_BADGE_SUITES: Record<LibraryName, CounterBadgeSuite> = {
  native: NativeCounterBadge,
};

type IndicatorBadgeSuite = Pick<
  typeof NativeIndicatorBadge,
  | 'IndicatorBadgeDefault'
  | 'IndicatorBadgeSizes'
  | 'IndicatorBadgeAppearances'
  | 'IndicatorBadgeSurfaceContext'
  | 'IndicatorBadgeThemes'
  | 'IndicatorBadgeWithComponents'
>;
const INDICATOR_BADGE_SUITES: Record<LibraryName, IndicatorBadgeSuite> = {
  native: NativeIndicatorBadge,
};

type ContainerSuite = typeof NativeContainer;
const CONTAINER_SUITES: Record<LibraryName, ContainerSuite> = {
  native: NativeContainer,
};

type DividerSuite = typeof NativeDivider;
const DIVIDER_SUITES: Record<LibraryName, DividerSuite> = {
  native: NativeDivider,
};

type SeparatorSuite = typeof NativeSeparator;
const SEPARATOR_SUITES: Record<LibraryName, SeparatorSuite> = {
  native: NativeSeparator,
};

type SpinnerSuite = typeof NativeSpinner;
const SPINNER_SUITES: Record<LibraryName, SpinnerSuite> = {
  native: NativeSpinner,
};

type ProgressSuite = Pick<
  typeof NativeProgress,
  'ProgressSizes' | 'ProgressIndeterminate' | 'ProgressBoundaries'
>;
const PROGRESS_SUITES: Record<LibraryName, ProgressSuite> = {
  native: NativeProgress,
};

type PaginationDotsSuite = typeof NativePaginationDots;
const PAGINATION_DOTS_SUITES: Record<LibraryName, PaginationDotsSuite> = {
  native: NativePaginationDots,
};

type ImageSuite = typeof NativeImage;
const IMAGE_SUITES: Record<LibraryName, ImageSuite> = {
  native: NativeImage,
};

type LogoSuite = typeof NativeLogo;
const LOGO_SUITES: Record<LibraryName, LogoSuite> = {
  native: NativeLogo,
};

type AvatarSuite = Pick<
  typeof NativeAvatar,
  | 'AvatarDefault'
  | 'AvatarVariants'
  | 'AvatarAttentionLevels'
  | 'AvatarSizes'
  | 'AvatarAppearances'
  | 'AvatarThemes'
  | 'AvatarSurfaceContext'
  | 'AvatarStates'
  | 'AvatarImageFallback'
  | 'AvatarWithIcons'
>;
const AVATAR_SUITES: Record<LibraryName, AvatarSuite> = {
  native: NativeAvatar,
};

// ============================================================================
// Screen
// ============================================================================

export function ComponentDetailScreen({ route }: Props): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const { library } = usePageContext();
  const { id } = route.params;
  const entry = getEntry(id);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: roles.surfaces.default }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text
          style={{
            color: roles.content.high,
            fontSize: typography.size['3xl'],
            fontWeight: typography.weight.high,
          }}
        >
          {entry?.name ?? id}
        </Text>
        <Text
          style={{
            color: roles.content.medium,
            fontSize: typography.size.s,
          }}
        >
          {entry?.category ?? 'Unknown category'} · {library}
          {entry?.hasNativeImpl ? ' · primitive parity' : ' · native port pending'}
        </Text>
      </View>

      {renderDetail(id, entry?.name ?? id, entry?.hasNativeImpl ?? false, library)}
    </ScrollView>
  );
}

function renderDetail(
  id: string,
  name: string,
  hasNativeImpl: boolean,
  library: LibraryName,
): React.ReactElement {
  // The 10 Wave 1 primitives all ship parity across native / rnr / tamagui.
  // Anything else with `hasNativeImpl: true` (composite components yet to
  // be cross-library-ported) still falls back to native-only.
  switch (id) {
    case 'button':
      return <ButtonDetail library={library} />;
    case 'divider':
      return <DividerDetail library={library} />;
    case 'separator':
      return <SeparatorDetail library={library} />;
    case 'spinner':
      return <SpinnerDetail library={library} />;
    case 'progress':
      return <ProgressDetail library={library} />;
    case 'badge':
      return <BadgeDetail library={library} />;
    case 'counterbadge':
      return <CounterBadgeDetail library={library} />;
    case 'indicatorbadge':
      return <IndicatorBadgeDetail library={library} />;
    case 'paginationdots':
      return <PaginationDotsDetail library={library} />;
    case 'container':
      return <ContainerDetail library={library} />;
    case 'image':
      return <ImageDetail library={library} />;
    case 'logo':
      return <LogoDetail library={library} />;
    case 'avatar':
      return <AvatarDetail library={library} />;
    default:
      if (library !== 'native') {
        return <NonNativeLibraryNotice name={name} library={library} />;
      }
      if (!hasNativeImpl) return <PendingDetail name={name} />;
      return <PendingDetail name={name} />;
  }
}

// ============================================================================
// Per-component Detail screens — each dispatches to its library's suite
// ============================================================================

function ButtonDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = BUTTON_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Attention levels'>
        <suite.ButtonAttentionLevels />
      </Section>
      <Section title='Themes'>
        <suite.ButtonThemes />
      </Section>
      <Section title='Sizes'>
        <suite.ButtonSizes />
      </Section>
      <Section title='Contained'>
        <suite.ButtonContained />
      </Section>
      <Section title='Condensed'>
        <suite.ButtonCondensed />
      </Section>
      <Section title='Slot-aware padding'>
        <suite.ButtonSlotPadding />
      </Section>
      <Section title='States'>
        <suite.ButtonStates />
      </Section>
      <Section title='With slots'>
        <suite.ButtonWithSlots />
      </Section>
      <Section title='Loading with slots'>
        <suite.ButtonLoadingWithSlots />
      </Section>
      <Section title='Full width'>
        <suite.ButtonFullWidth />
      </Section>
      <Section title='Appearances'>
        <suite.ButtonAppearances />
      </Section>
      <Section title='Density'>
        <suite.ButtonDensity />
      </Section>
      <Section title='Motion'>
        <suite.ButtonMotion />
      </Section>
      <Section title='Surface context'>
        <suite.ButtonSurfaceContext />
      </Section>
    </View>
  );
}

function DividerDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = DIVIDER_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Sizes'>
        <suite.DividerSizes />
      </Section>
      <Section title='Attention levels'>
        <suite.DividerAttentionLevels />
      </Section>
      {'DividerWithIcon' in suite ? (
        <Section title='With icon'>
          <suite.DividerWithIcon />
        </Section>
      ) : null}
      {'DividerWithLabel' in suite ? (
        <Section title='With label'>
          <suite.DividerWithLabel />
        </Section>
      ) : null}
      <Section title='Round caps'>
        <suite.DividerRoundCaps />
      </Section>
      <Section title='Vertical orientation'>
        <suite.DividerVertical />
      </Section>
      <Section title='Appearances'>
        <suite.DividerAppearances />
      </Section>
    </View>
  );
}

function SeparatorDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SEPARATOR_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Horizontal'>
        <suite.SeparatorHorizontal />
      </Section>
      <Section title='Vertical'>
        <suite.SeparatorVertical />
      </Section>
    </View>
  );
}

function SpinnerDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SPINNER_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Default'>
        <suite.SpinnerDefault />
      </Section>
      <Section title='All sizes'>
        <suite.SpinnerSizes />
      </Section>
    </View>
  );
}

function ProgressDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = PROGRESS_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Sizes'>
        <suite.ProgressSizes />
      </Section>
      <Section title='Indeterminate'>
        <suite.ProgressIndeterminate />
      </Section>
      <Section title='Boundaries'>
        <suite.ProgressBoundaries />
      </Section>
    </View>
  );
}

function BadgeDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = BADGE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Default'>
        <suite.BadgeDefault />
      </Section>
      <Section title='Variants'>
        <suite.BadgeVariants />
      </Section>
      <Section title='Sizes'>
        <suite.BadgeSizes />
      </Section>
      <Section title='With Slots'>
        <suite.BadgeWithSlots />
      </Section>
      <Section title='Sizes with Slots'>
        <suite.BadgeSizesWithSlots />
      </Section>
      <Section title='Appearances'>
        <suite.BadgeAppearances />
      </Section>
      <Section title='Themes'>
        <suite.BadgeThemes />
      </Section>
      <Section title='Slot Adaptation'>
        <suite.BadgeSlotAdaptation />
      </Section>
      <Section title='Surface Context / Bold'>
        <suite.BadgeSurfaceContextBold />
      </Section>
      <Section title='Surface Context / Subtle'>
        <suite.BadgeSurfaceContextSubtle />
      </Section>
      <Section title='Surface Context / All Modes'>
        <suite.BadgeSurfaceContextAllModes />
      </Section>
    </View>
  );
}

function CounterBadgeDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = COUNTER_BADGE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Default'>
        <suite.CounterBadgeDefault />
      </Section>
      <Section title='Variants'>
        <suite.CounterBadgeVariants />
      </Section>
      <Section title='Sizes'>
        <suite.CounterBadgeSizes />
      </Section>
      <Section title='Max Value'>
        <suite.CounterBadgeMaxValue />
      </Section>
      <Section title='Appearances'>
        <suite.CounterBadgeAppearances />
      </Section>
      <Section title='Themes'>
        <suite.CounterBadgeThemes />
      </Section>
    </View>
  );
}

function IndicatorBadgeDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = INDICATOR_BADGE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Default'>
        <suite.IndicatorBadgeDefault />
      </Section>
      <Section title='Sizes'>
        <suite.IndicatorBadgeSizes />
      </Section>
      <Section title='Appearances'>
        <suite.IndicatorBadgeAppearances />
      </Section>
      <Section title='Surface Context'>
        <suite.IndicatorBadgeSurfaceContext />
      </Section>
      <Section title='Themes'>
        <suite.IndicatorBadgeThemes />
      </Section>
      <Section title='With Components'>
        <suite.IndicatorBadgeWithComponents />
      </Section>
    </View>
  );
}

function PaginationDotsDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = PAGINATION_DOTS_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Basic (interactive)'>
        <suite.PaginationDotsBasic />
      </Section>
      <Section title='Short sequence (≤ 5)'>
        <suite.PaginationDotsShortSequence />
      </Section>
      <Section title='Loop mode'>
        <suite.PaginationDotsLoop />
      </Section>
      <Section title='Read-only'>
        <suite.PaginationDotsReadOnly />
      </Section>
      <Section title='Appearances'>
        <suite.PaginationDotsAppearances />
      </Section>
    </View>
  );
}

function ContainerDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = CONTAINER_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Variants'>
        <suite.ContainerVariants />
      </Section>
      <Section title='Custom maxWidth'>
        <suite.ContainerCustomMaxWidth />
      </Section>
    </View>
  );
}

function ImageDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = IMAGE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Aspect ratios'>
        <suite.ImageAspectRatios />
      </Section>
      <Section title='Object fit'>
        <suite.ImageObjectFit />
      </Section>
      <Section title='Interactive + disabled'>
        <suite.ImageInteractive />
      </Section>
      <Section title='Fallback on error'>
        <suite.ImageFallback />
      </Section>
      <Section title='Tile gallery'>
        <suite.ImageGallery />
      </Section>
    </View>
  );
}

function LogoDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = LOGO_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Sizes'>
        <suite.LogoSizes />
      </Section>
      <Section title='Variants'>
        <suite.LogoVariants />
      </Section>
      <Section title='Custom size'>
        <suite.LogoCustomSize />
      </Section>
      <Section title='From src URL'>
        <suite.LogoFromImage />
      </Section>
      <Section title='From JSX children'>
        <suite.LogoFromChildren />
      </Section>
      {'LogoContentSources' in suite ? (
        <Section title='Content sources'>
          <suite.LogoContentSources />
        </Section>
      ) : null}
      {'LogoImageFallback' in suite ? (
        <Section title='Image fallback'>
          <suite.LogoImageFallback />
        </Section>
      ) : null}
    </View>
  );
}

function AvatarDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = AVATAR_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title='Default'>
        <suite.AvatarDefault />
      </Section>
      <Section title='Variants'>
        <suite.AvatarVariants />
      </Section>
      <Section title='Attention Levels'>
        <suite.AvatarAttentionLevels />
      </Section>
      <Section title='Sizes'>
        <suite.AvatarSizes />
      </Section>
      <Section title='Appearances'>
        <suite.AvatarAppearances />
      </Section>
      <Section title='Themes'>
        <suite.AvatarThemes />
      </Section>
      <Section title='Surface Context'>
        <suite.AvatarSurfaceContext />
      </Section>
      <Section title='States'>
        <suite.AvatarStates />
      </Section>
      <Section title='Image Fallback'>
        <suite.AvatarImageFallback />
      </Section>
      <Section title='With Icons'>
        <suite.AvatarWithIcons />
      </Section>
    </View>
  );
}

function NonNativeLibraryNotice({
  name,
  library,
}: {
  name: string;
  library: LibraryName;
}): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  return (
    <View
      style={[
        styles.pending,
        {
          backgroundColor: roles.surfaces.subtle,
          borderColor: roles.content.strokeLow,
        },
      ]}
    >
      <Text
        style={{
          color: roles.content.high,
          fontSize: typography.size.l,
          fontWeight: typography.weight.high,
        }}
      >
        Only available on the Native renderer
      </Text>
      <Text
        style={{
          color: roles.content.medium,
          fontSize: typography.size.s,
          lineHeight: typography.size.s * 1.5,
        }}
      >
        {name} hasn't been ported to the {library} renderer yet. Switch the
        Library selector to <Text style={{ fontWeight: typography.weight.high }}>native</Text>{' '}
        to see this component, or pick one of the Wave 1 primitives — they
        ship full multi-library parity.
      </Text>
    </View>
  );
}

function PendingDetail({ name }: { name: string }): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  return (
    <View
      style={[
        styles.pending,
        {
          backgroundColor: roles.surfaces.subtle,
          borderColor: roles.content.strokeLow,
        },
      ]}
    >
      <Text
        style={{
          color: roles.content.high,
          fontSize: typography.size.l,
          fontWeight: typography.weight.high,
        }}
      >
        Native port pending
      </Text>
      <Text
        style={{
          color: roles.content.medium,
          fontSize: typography.size.s,
          lineHeight: typography.size.s * 1.5,
        }}
      >
        {name} hasn't shipped a `*.native.tsx` implementation yet. See the
        web verifier (`apps/v4-sample`) for the full prop / variant / a11y
        reference. Contributions to `packages/ui-native` welcome — start
        from `Button.native.tsx` for the established pattern.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentContainer: {
    padding: tokens.spacing['4-5'],
    gap: tokens.spacing['4-5'],
    paddingBottom: tokens.spacing['7'],
  },
  header: {
    gap: tokens.spacing['2-5'],
  },
  body: {
    gap: tokens.spacing['4-5'],
  },
  pending: {
    padding: tokens.spacing['4-5'],
    borderWidth: tokens.borderWidth.hairline,
    borderRadius: tokens.shape.l,
    gap: tokens.spacing['2-5'],
  },
});
