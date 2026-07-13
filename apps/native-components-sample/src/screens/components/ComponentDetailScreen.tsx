/**
 * ComponentDetailScreen.tsx
 *
 * Renders the detail view for a component identified by `route.params.id`.
 * Each component dispatches its showcase suite based on the active
 * library (`native | rnr | tamagui`). The native, rnr, and tamagui
 * implementations of every Wave 1 primitive expose the same showcase
 * function names so the dispatch table is a static mapping.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';

// ============================================================================
// Native showcases
// ============================================================================

import * as NativeButton from '@oneui/ui-native/showcase/Button';
import * as NativeIconButton from '@oneui/ui-native/showcase/IconButton';
import * as NativeSingleTextButton from '@oneui/ui-native/showcase/SingleTextButton';
import * as NativeBadge from '@oneui/ui-native/showcase/Badge';
import * as NativeCard from '@oneui/ui-native/showcase/Card';
import * as NativeCounterBadge from '@oneui/ui-native/showcase/CounterBadge';
import * as NativeIndicatorBadge from '@oneui/ui-native/showcase/IndicatorBadge';
import * as NativeContainer from '@oneui/ui-native/showcase/Container';
import * as NativeDivider from '@oneui/ui-native/showcase/Divider';
import * as NativeSeparator from '@oneui/ui-native/showcase/Separator';
import * as NativeSpinner from '@oneui/ui-native/showcase/Spinner';
import * as NativeProgress from '@oneui/ui-native/showcase/Progress';
import * as NativeCircularProgressIndicator from '@oneui/ui-native/showcase/CircularProgressIndicator';
import * as NativePaginationDots from '@oneui/ui-native/showcase/PaginationDots';
import * as NativeCarousel from '@oneui/ui-native/showcase/Carousel';
import * as NativePagination from '@oneui/ui-native/showcase/Pagination';
import * as NativeImage from '@oneui/ui-native/showcase/Image';
import * as NativeLogo from '@oneui/ui-native/showcase/Logo';
import * as NativeAvatar from '@oneui/ui-native/showcase/Avatar';
import * as NativeAgentPulse from '@oneui/ui-native/showcase/AgentPulse';
import * as NativeIconContained from '@oneui/ui-native/showcase/IconContained';
import * as NativeBottomNavigation from '@oneui/ui-native/showcase/BottomNavigation';
import * as NativeHeaderNative from '@oneui/ui-native/showcase/HeaderNative';
import * as NativeHeaderItem from '@oneui/ui-native/showcase/HeaderItem';
import * as NativeText from '@oneui/ui-native/showcase/Text';
import * as NativeChip from '@oneui/ui-native/showcase/Chip';
import * as NativeChipGroup from '@oneui/ui-native/showcase/ChipGroup';
import * as NativeCheckbox from '@oneui/ui-native/showcase/Checkbox';
import * as NativeCheckboxField from '@oneui/ui-native/showcase/CheckboxField';
import * as NativeRadio from '@oneui/ui-native/showcase/Radio';
import * as NativeRadioField from '@oneui/ui-native/showcase/RadioField';
import * as NativeInputDynamicText from '@oneui/ui-native/showcase/InputDynamicText';
import * as NativeInputFeedback from '@oneui/ui-native/showcase/InputFeedback';
import * as NativeInput from '@oneui/ui-native/showcase/Input';
import * as NativeInputField from '@oneui/ui-native/showcase/InputField';
import * as NativeSelect from '@oneui/ui-native/showcase/Select';
import * as NativeModal from '@oneui/ui-native/showcase/Modal';
import * as NativeIcon from '@oneui/ui-native/showcase/Icon';
import * as NativeScrim from '@oneui/ui-native/showcase/Scrim';
import * as NativeTooltip from '@oneui/ui-native/showcase/Tooltip';
import * as NativeSwitch from '@oneui/ui-native/showcase/Switch';
import * as NativeTabs from '@oneui/ui-native/showcase/Tabs';
import * as NativeSegmentedControl from '@oneui/ui-native/showcase/SegmentedControl';
import * as NativeTouchSlider from '@oneui/ui-native/showcase/TouchSlider';
import * as NativeSlider from '@oneui/ui-native/showcase/Slider';

import { ComponentsChrome } from '../../components/ComponentsChrome';
import { SelectorCluster } from '../../components/SelectorCluster';
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
  | 'ButtonDefault'
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
  | 'ButtonResponsive'
  | 'ButtonAppearances'
  | 'ButtonDensity'
  | 'ButtonMotion'
  | 'ButtonSurfaceContext'
  | 'ButtonPlayground'
>;
const BUTTON_SUITES: Record<LibraryName, ButtonSuite> = {
  native: NativeButton,
};

type IconButtonSuite = Pick<
  typeof NativeIconButton,
  | 'IconButtonDefault'
  | 'IconButtonAttentionLevels'
  | 'IconButtonSizes'
  | 'IconButtonCondensed'
  | 'IconButtonStates'
  | 'IconButtonAppearances'
  | 'IconButtonLayouts'
  | 'IconButtonFullWidth'
  | 'IconButtonWithJdsIcon'
  | 'IconButtonResponsive'
  | 'IconButtonSurfaceContext'
  | 'IconButtonLoadingSizes'
  | 'IconButtonLoadingStates'
  | 'IconButtonMotion'
>;
const ICON_BUTTON_SUITES: Record<LibraryName, IconButtonSuite> = {
  native: NativeIconButton,
};

type SingleTextButtonSuite = Pick<
  typeof NativeSingleTextButton,
  | 'SingleTextButtonDefault'
  | 'SingleTextButtonAttentionLevels'
  | 'SingleTextButtonSizes'
  | 'SingleTextButtonCondensed'
  | 'SingleTextButtonAppearances'
  | 'SingleTextButtonDisabled'
  | 'SingleTextButtonLoading'
  | 'SingleTextButtonSurfaceContext'
  | 'SingleTextButtonRealWorldInitialsRow'
>;
const SINGLE_TEXT_BUTTON_SUITES: Record<LibraryName, SingleTextButtonSuite> = {
  native: NativeSingleTextButton,
};

type BadgeSuite = Pick<
  typeof NativeBadge,
  | 'BadgeDefault'
  | 'BadgeVariants'
  | 'BadgeSizes'
  | 'BadgeWithSlots'
  | 'BadgeSizesWithSlots'
  | 'BadgeAppearances'
  | 'BadgeResponsive'
  | 'BadgeThemes'
  | 'BadgeSlotAdaptation'
  | 'BadgeFigmaSlotMatrix'
  | 'BadgeSurfaceContextBold'
  | 'BadgeSurfaceContextSubtle'
  | 'BadgeSurfaceContextAllModes'
  | 'BadgeAccessibilityWithSlots'
>;
const BADGE_SUITES: Record<LibraryName, BadgeSuite> = {
  native: NativeBadge,
};

type CardSuite = typeof NativeCard;
const CARD_SUITES: Record<LibraryName, CardSuite> = {
  native: NativeCard,
};

type CounterBadgeSuite = Pick<
  typeof NativeCounterBadge,
  | 'CounterBadgeDefault'
  | 'CounterBadgeVariants'
  | 'CounterBadgeSizes'
  | 'CounterBadgeMaxValue'
  | 'CounterBadgeAppearances'
  | 'CounterBadgeResponsive'
  | 'CounterBadgeMotion'
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
  | 'IndicatorBadgeResponsive'
  | 'IndicatorBadgeThemes'
  | 'IndicatorBadgeMotion'
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

type ScrimSuite = typeof NativeScrim;
const SCRIM_SUITES: Record<LibraryName, ScrimSuite> = {
  native: NativeScrim,
};

type SpinnerSuite = typeof NativeSpinner;
const SPINNER_SUITES: Record<LibraryName, SpinnerSuite> = {
  native: NativeSpinner,
};

type ProgressSuite = Pick<
  typeof NativeProgress,
  | 'ProgressDefault'
  | 'ProgressSizes'
  | 'ProgressIndeterminate'
  | 'ProgressBoundaries'
  | 'ProgressValueRange'
  | 'ProgressSurfaceContext'
>;
const PROGRESS_SUITES: Record<LibraryName, ProgressSuite> = {
  native: NativeProgress,
};

type CircularProgressIndicatorSuite = Pick<
  typeof NativeCircularProgressIndicator,
  | 'CircularProgressIndicatorDefault'
  | 'CircularProgressIndicatorVariants'
  | 'CircularProgressIndicatorSizes'
  | 'CircularProgressIndicatorAppearances'
  | 'CircularProgressIndicatorWithContent'
  | 'CircularProgressIndicatorStates'
  | 'CircularProgressIndicatorInteractive'
  | 'CircularProgressIndicatorEntryExit'
  | 'CircularProgressIndicatorSurfaceContext'
  | 'CircularProgressIndicatorDisabled'
>;
const CIRCULAR_PROGRESS_INDICATOR_SUITES: Record<LibraryName, CircularProgressIndicatorSuite> = {
  native: NativeCircularProgressIndicator,
};

type PaginationDotsSuite = typeof NativePaginationDots;
const PAGINATION_DOTS_SUITES: Record<LibraryName, PaginationDotsSuite> = {
  native: NativePaginationDots,
};

type CarouselSuite = Pick<
  typeof NativeCarousel,
  | 'CarouselDefault'
  | 'CarouselImageAspectRatios'
  | 'CarouselAlignments'
  | 'CarouselContentWidthsStartBottom'
  | 'CarouselContentWidthsStartMiddle'
  | 'CarouselContentWidthsMiddleBottom'
  | 'CarouselContentWidthsMiddleMiddle'
  | 'CarouselContentWidthsMiddleTop'
  | 'CarouselControlsShowcase'
  | 'CarouselSelectionRailShowcase'
  | 'CarouselSelectionRailDefaultShowcase'
  | 'CarouselFigma281850672'
  | 'CarouselFigmaPaginationParity'
  | 'CarouselContentCompositions'
  | 'CarouselBadges'
  | 'CarouselPeek'
  | 'CarouselAutoPlay'
  | 'CarouselSurfaceContext'
  | 'CarouselCentered'
  | 'CarouselAdoptionMatrix'
>;
const CAROUSEL_SUITES: Record<LibraryName, CarouselSuite> = {
  native: NativeCarousel,
};

const CAROUSEL_DETAIL_TABS = [
  'Default',
  'Aspect ratios',
  'Alignments',
  'Content Alignments',
  'Content Compositions',
  'Badges',
  'Controls',
  'Selection rail',
  'Behavior',
  'Context',
  'Figma',
] as const;
type CarouselDetailTab = (typeof CAROUSEL_DETAIL_TABS)[number];

type PaginationSuite = typeof NativePagination;
const PAGINATION_SUITES: Record<LibraryName, PaginationSuite> = {
  native: NativePagination,
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
  | 'AvatarResponsive'
>;
const AVATAR_SUITES: Record<LibraryName, AvatarSuite> = {
  native: NativeAvatar,
};

type AgentPulseSuite = typeof NativeAgentPulse;
const AGENT_PULSE_SUITES: Record<LibraryName, AgentPulseSuite> = {
  native: NativeAgentPulse,
};

type IconSuite = Pick<
  typeof NativeIcon,
  | 'IconDefault'
  | 'IconSizes'
  | 'IconAppearances'
  | 'IconEmphasisLevels'
  | 'IconWithIcons'
  | 'IconInteractive'
  | 'IconSurfaceContext'
  | 'IconInContext'
>;
const ICON_SUITES: Record<LibraryName, IconSuite> = {
  native: NativeIcon,
};

type BottomNavigationSuite = Pick<
  typeof NativeBottomNavigation,
  | 'BottomNavigationDefault'
  | 'BottomNavigationLabelTypes'
  | 'BottomNavigationTwoLineLongLabels'
  | 'BottomNavigationIconOnlyAccessibility'
  | 'BottomNavigationItemCounts'
  | 'BottomNavigationMaxItemsEnforced'
  | 'BottomNavigationStates'
  | 'BottomNavigationControlled'
  | 'BottomNavigationSelectionExclusivity'
  | 'BottomNavigationSurfaceModes'
  | 'BottomNavigationAppearances'
>;
const BOTTOM_NAVIGATION_SUITES: Record<LibraryName, BottomNavigationSuite> = {
  native: NativeBottomNavigation,
};

type HeaderNativeSuite = Pick<
  typeof NativeHeaderNative,
  | 'HeaderComposedWithoutSecondary'
  | 'HeaderComposedWithSecondary'
  | 'HeaderPrimaryNavHomeBar'
  | 'HeaderPrimaryNavHomeBarExpanded'
  | 'HeaderPrimaryNavHomeBarWithSearch'
  | 'HeaderPrimaryNavContextBar'
  | 'HeaderPrimaryNavContextBarExpanded'
  | 'HeaderPrimaryNavSearchBarCollapsed'
  | 'HeaderPrimaryNavSearchBarExpanded'
>;
const HEADER_NATIVE_SUITES: Record<LibraryName, HeaderNativeSuite> = {
  native: NativeHeaderNative,
};

type HeaderItemSuite = Pick<
  typeof NativeHeaderItem,
  | 'HeaderItemAttentionLevels'
  | 'HeaderItemFullMatrix'
  | 'HeaderItemStartSlots'
  | 'HeaderItemEndSlots'
  | 'HeaderItemCombinedSlots'
  | 'HeaderItemAlignToStart'
  | 'HeaderItemAttentionSlotMatrix'
  | 'HeaderItemDisabled'
>;
const HEADER_ITEM_SUITES: Record<LibraryName, HeaderItemSuite> = {
  native: NativeHeaderItem,
};

type TabsSuite = Pick<
  typeof NativeTabs,
  | 'TabsDefault'
  | 'TabsVariants'
  | 'TabsSizes'
  | 'TabsStates'
  | 'TabsWithIcons'
  | 'TabsInteractive'
  | 'TabsManyItems'
  | 'TabsManyItemsVertical'
  | 'TabsThemes'
  | 'TabsAppearances'
  | 'TabsAdoptionMatrix'
  | 'TabsOnBoldSurface'
  | 'TabsCompoundAPI'
>;
const TABS_SUITES: Record<LibraryName, TabsSuite> = {
  native: NativeTabs,
};

type SegmentedControlSuite = Pick<
  typeof NativeSegmentedControl,
  | 'SegmentedControlDefault'
  | 'SegmentedControlAttentionLevels'
  | 'SegmentedControlTrackEmphasisLevels'
  | 'SegmentedControlSizes'
  | 'SegmentedControlShapes'
  | 'SegmentedControlEqualWidth'
  | 'SegmentedControlWithSlots'
  | 'SegmentedControlIconOnly'
  | 'SegmentedControlAppearances'
  | 'SegmentedControlStates'
  | 'SegmentedControlSurfaceContext'
  | 'SegmentedControlOnBoldSurface'
  | 'SegmentedControlNestedSurfaces'
>;
const SEGMENTED_CONTROL_SUITES: Record<LibraryName, SegmentedControlSuite> = {
  native: NativeSegmentedControl,
};

type TextSuite = Pick<
  typeof NativeText,
  | 'TextDefault'
  | 'TextVariants'
  | 'TextSizes'
  | 'TextAttentionAndWeight'
  | 'TextAppearances'
  | 'TextDecorations'
  | 'TextSurfaceContext'
  | 'TextTruncation'
  | 'TextAlignment'
  | 'TextLink'
  | 'TextTruncationAlignmentAndLink'
  | 'TextDisabled'
>;
const TEXT_SUITES: Record<LibraryName, TextSuite> = {
  native: NativeText,
};

type IconContainedSuite = Pick<
  typeof NativeIconContained,
  | 'IconContainedDefault'
  | 'IconContainedAttentionLevels'
  | 'IconContainedSizes'
  | 'IconContainedStates'
  | 'IconContainedWithIcons'
  | 'IconContainedAppearances'
  | 'IconContainedThemes'
  | 'IconContainedSurfaceContext'
>;
const ICON_CONTAINED_SUITES: Record<LibraryName, IconContainedSuite> = {
  native: NativeIconContained,
};

type ChipSuite = Pick<
  typeof NativeChip,
  | 'ChipAttentionLevels'
  | 'ChipSizes'
  | 'ChipSelectedChange'
  | 'ChipStates'
  | 'ChipWithSlots'
  | 'ChipSlotPaddingMatrix'
  | 'ChipAppearances'
  | 'ChipSurfaceContext'
>;
const CHIP_SUITES: Record<LibraryName, ChipSuite> = {
  native: NativeChip,
};

type ChipGroupSuite = Pick<
  typeof NativeChipGroup,
  | 'ChipGroupDefault'
  | 'ChipGroupDefaultValueNormalization'
  | 'ChipGroupSingleSelect'
  | 'ChipGroupMultiSelect'
  | 'ChipGroupVariants'
  | 'ChipGroupVertical'
  | 'ChipGroupNoWrap'
  | 'ChipGroupDisabled'
>;
const CHIP_GROUP_SUITES: Record<LibraryName, ChipGroupSuite> = {
  native: NativeChipGroup,
};

type CheckboxSuite = Pick<
  typeof NativeCheckbox,
  | 'CheckboxDefault'
  | 'CheckboxSizes'
  | 'CheckboxStates'
  | 'CheckboxAccents'
  | 'CheckboxAppearances'
  | 'CheckboxReadOnly'
  | 'CheckboxWithLabel'
  | 'CheckboxSurfaceContext'
  | 'CheckboxThemes'
  | 'CheckboxInteractive'
>;
const CHECKBOX_SUITES: Record<LibraryName, CheckboxSuite> = {
  native: NativeCheckbox,
};

type CheckboxFieldSuite = Pick<
  typeof NativeCheckboxField,
  | 'CheckboxFieldDefault'
  | 'CheckboxFieldSizes'
  | 'CheckboxFieldStates'
  | 'CheckboxFieldRequiredAndError'
  | 'CheckboxFieldMultiOption'
  | 'CheckboxFieldWithDynamicText'
  | 'CheckboxFieldSurfaceContext'
  | 'CheckboxFieldFullWidth'
>;
const CHECKBOX_FIELD_SUITES: Record<LibraryName, CheckboxFieldSuite> = {
  native: NativeCheckboxField,
};

type RadioSuite = Pick<
  typeof NativeRadio,
  | 'RadioSizes'
  | 'RadioStates'
  | 'RadioAppearances'
  | 'RadioReadOnly'
  | 'RadioWithLabel'
  | 'RadioSurfaceContext'
  | 'RadioInteractive'
>;
const RADIO_SUITES: Record<LibraryName, RadioSuite> = {
  native: NativeRadio,
};

type RadioFieldSuite = Pick<
  typeof NativeRadioField,
  | 'RadioFieldDefault'
  | 'RadioFieldSizes'
  | 'RadioFieldStates'
  | 'RadioFieldRequiredAndError'
  | 'RadioFieldIntegratedSingle'
  | 'RadioFieldWithDynamicText'
  | 'RadioFieldSurfaceContext'
  | 'RadioFieldFullWidth'
>;
const RADIO_FIELD_SUITES: Record<LibraryName, RadioFieldSuite> = {
  native: NativeRadioField,
};

type InputDynamicTextSuite = Pick<
  typeof NativeInputDynamicText,
  | 'InputDynamicTextDefault'
  | 'InputDynamicTextFigmaSizes'
  | 'InputDynamicTextSlotCombinations'
  | 'InputDynamicTextDisabled'
  | 'InputDynamicTextLiveRegion'
  | 'InputDynamicTextOnSurfaceBold'
  | 'InputDynamicTextEmpty'
>;
const INPUT_DYNAMIC_TEXT_SUITES: Record<LibraryName, InputDynamicTextSuite> = {
  native: NativeInputDynamicText,
};

type InputFeedbackSuite = Pick<
  typeof NativeInputFeedback,
  | 'InputFeedbackDefault'
  | 'InputFeedbackVariants'
  | 'InputFeedbackAttentionLevels'
  | 'InputFeedbackSizes'
  | 'InputFeedbackMatrix'
  | 'InputFeedbackSurfaceContext'
  | 'InputFeedbackDisabled'
>;
const INPUT_FEEDBACK_SUITES: Record<LibraryName, InputFeedbackSuite> = {
  native: NativeInputFeedback,
};

type InputSuite = Pick<
  typeof NativeInput,
  | 'InputDefault'
  | 'InputSizes'
  | 'InputAttentionLevels'
  | 'InputAppearances'
  | 'InputShapes'
  | 'InputStates'
  | 'InputDisabled'
  | 'InputWithSlots'
  | 'InputControlled'
  | 'InputSurfaceContext'
  | 'InputSearch'
>;
const INPUT_SUITES: Record<LibraryName, InputSuite> = {
  native: NativeInput,
};

type SelectSuite = typeof NativeSelect;
const SELECT_SUITES: Record<LibraryName, SelectSuite> = {
  native: NativeSelect,
};

type InputFieldSuite = Pick<
  typeof NativeInputField,
  | 'InputFieldDefault'
  | 'InputFieldSizes'
  | 'InputFieldAttentions'
  | 'InputFieldAppearances'
  | 'InputFieldShapes'
  | 'InputFieldStates'
  | 'InputFieldWithSlots'
  | 'InputFieldFullComposition'
  | 'InputFieldControlled'
  | 'InputFieldSurfaceContext'
  | 'InputFieldSearch'
>;
const INPUT_FIELD_SUITES: Record<LibraryName, InputFieldSuite> = {
  native: NativeInputField,
};

type ModalSuite = typeof NativeModal;
const MODAL_SUITES: Record<LibraryName, ModalSuite> = {
  native: NativeModal,
};

type TooltipSuite = Pick<
  typeof NativeTooltip,
  | 'TooltipDefault'
  | 'TooltipPositions'
  | 'TooltipArrow'
  | 'TooltipTriggerModes'
  | 'TooltipDelay'
  | 'TooltipDisabled'
  | 'TooltipControlled'
  | 'TooltipMaxWidth'
  | 'TooltipMotion'
  | 'TooltipLongContent'
  | 'TooltipPortal'
  | 'TooltipInsideBoldSurface'
  | 'TooltipInsideSubtleSurface'
  | 'TooltipSurfaceContext'
>;
const TOOLTIP_SUITES: Record<LibraryName, TooltipSuite> = {
  native: NativeTooltip,
};

type SwitchSuite = Pick<
  typeof NativeSwitch,
  | 'SwitchDefault'
  | 'SwitchSizes'
  | 'SwitchStates'
  | 'SwitchAppearances'
  | 'SwitchAccents'
  | 'SwitchReadOnly'
  | 'SwitchWithLabel'
  | 'SwitchSurfaceContext'
  | 'SwitchThemes'
  | 'SwitchControlled'
>;
const SWITCH_SUITES: Record<LibraryName, SwitchSuite> = {
  native: NativeSwitch,
};
type TouchSliderSuite = Pick<
  typeof NativeTouchSlider,
  | 'TouchSliderProgressStyles'
  | 'TouchSliderWithSlots'
  | 'TouchSliderAppearances'
  | 'TouchSliderStates'
  | 'TouchSliderVertical'
  | 'TouchSliderSurfaceContext'
>;
const TOUCH_SLIDER_SUITES: Record<LibraryName, TouchSliderSuite> = {
  native: NativeTouchSlider,
};

type SliderSuite = Pick<typeof NativeSlider, 'SliderShowcase'>;
const SLIDER_SUITES: Record<LibraryName, SliderSuite> = {
  native: NativeSlider,
};

// ============================================================================
// Screen
// ============================================================================

export function ComponentDetailScreen({ route, navigation }: Props): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const { library } = usePageContext();
  const { id } = route.params;
  const entry = getEntry(id);

  return (
    <View style={styles.outer}>
      <ComponentsChrome variant="detail" navigation={navigation} title={route.params.name} />
      <ScrollView
        style={[styles.root, { flex: 1, backgroundColor: roles.surfaces.default }]}
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
    </View>
  );
}

function renderDetail(
  id: string,
  name: string,
  hasNativeImpl: boolean,
  library: LibraryName
): React.ReactElement {
  // The 10 Wave 1 primitives all ship parity across native / rnr / tamagui.
  // Anything else with `hasNativeImpl: true` (composite components yet to
  // be cross-library-ported) still falls back to native-only.
  switch (id) {
    case 'button':
      return <ButtonDetail library={library} />;
    case 'iconbutton':
      return <IconButtonDetail library={library} />;
    case 'singletextbutton':
      return <SingleTextButtonDetail library={library} />;
    case 'divider':
      return <DividerDetail library={library} />;
    case 'separator':
      return <SeparatorDetail library={library} />;
    case 'scrim':
      return <ScrimDetail library={library} />;
    case 'spinner':
      return <SpinnerDetail library={library} />;
    case 'progress':
      return <ProgressDetail library={library} />;
    case 'circularprogressindicator':
      return <CircularProgressIndicatorDetail library={library} />;
    case 'badge':
      return <BadgeDetail library={library} />;
    case 'card':
      return <CardDetail library={library} />;
    case 'counterbadge':
      return <CounterBadgeDetail library={library} />;
    case 'indicatorbadge':
      return <IndicatorBadgeDetail library={library} />;
    case 'pagination':
      return <PaginationDetail library={library} />;
    case 'paginationdots':
      return <PaginationDotsDetail library={library} />;
    case 'carousel':
      return <CarouselDetail library={library} />;
    case 'container':
      return <ContainerDetail library={library} />;
    case 'image':
      return <ImageDetail library={library} />;
    case 'logo':
      return <LogoDetail library={library} />;
    case 'avatar':
      return <AvatarDetail library={library} />;
    case 'icon':
      return <IconDetail library={library} />;
    case 'iconcontained':
      return <IconContainedDetail library={library} />;
    case 'bottomnavigation':
      return <BottomNavigationDetail library={library} />;
    case 'headernative':
      return <HeaderNativeDetail library={library} />;
    case 'headeritem':
      return <HeaderItemDetail library={library} />;
    case 'tabs':
      return <TabsDetail library={library} />;
    case 'segmentedcontrol':
      return <SegmentedControlDetail library={library} />;
    case 'text':
      return <TextDetail library={library} />;
    case 'chip':
      return <ChipDetail library={library} />;
    case 'chipgroup':
      return <ChipGroupDetail library={library} />;
    case 'checkbox':
      return <CheckboxDetail library={library} />;
    case 'checkboxfield':
      return <CheckboxFieldDetail library={library} />;
    case 'radio':
      return <RadioDetail library={library} />;
    case 'radiofield':
      return <RadioFieldDetail library={library} />;
    case 'inputdynamictext':
      return <InputDynamicTextDetail library={library} />;
    case 'inputfeedback':
      return <InputFeedbackDetail library={library} />;
    case 'agentpulse':
      return <AgentPulseDetail library={library} />;
    case 'input':
      return <InputDetail library={library} />;
    case 'select':
      return <SelectDetail library={library} />;
    case 'inputfield':
      return <InputFieldDetail library={library} />;
    case 'modal':
      return <ModalDetail library={library} />;
    case 'tooltip':
      return <TooltipDetail library={library} />;
    case 'switch':
      return <SwitchDetail library={library} />;
    case 'touchslider':
      return <TouchSliderDetail library={library} />;
    case 'slider':
      return <SliderDetail library={library} />;
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

function ChipDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = CHIP_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Attention levels">
        <suite.ChipAttentionLevels />
      </Section>
      <Section title="Sizes">
        <suite.ChipSizes />
      </Section>
      <Section title="Selected change callback">
        <suite.ChipSelectedChange />
      </Section>
      <Section title="States">
        <suite.ChipStates />
      </Section>
      <Section title="With slots">
        <suite.ChipWithSlots />
      </Section>
      <Section title="Slot padding matrix">
        <suite.ChipSlotPaddingMatrix />
      </Section>
      <Section title="Appearances">
        <suite.ChipAppearances />
      </Section>
      <Section title="Surface context">
        <suite.ChipSurfaceContext />
      </Section>
    </View>
  );
}

function ChipGroupDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = CHIP_GROUP_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.ChipGroupDefault />
      </Section>
      <Section title="Default value normalization">
        <suite.ChipGroupDefaultValueNormalization />
      </Section>
      <Section title="Single select">
        <suite.ChipGroupSingleSelect />
      </Section>
      <Section title="Multi select">
        <suite.ChipGroupMultiSelect />
      </Section>
      <Section title="Variants">
        <suite.ChipGroupVariants />
      </Section>
      <Section title="Vertical">
        <suite.ChipGroupVertical />
      </Section>
      <Section title="No wrap">
        <suite.ChipGroupNoWrap />
      </Section>
      <Section title="Disabled">
        <suite.ChipGroupDisabled />
      </Section>
    </View>
  );
}

function CheckboxDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = CHECKBOX_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.CheckboxDefault />
      </Section>
      <Section title="Sizes">
        <suite.CheckboxSizes />
      </Section>
      <Section title="States">
        <suite.CheckboxStates />
      </Section>
      <Section title="Accents">
        <suite.CheckboxAccents />
      </Section>
      <Section title="Appearances">
        <suite.CheckboxAppearances />
      </Section>
      <Section title="Read only">
        <suite.CheckboxReadOnly />
      </Section>
      <Section title="With label">
        <suite.CheckboxWithLabel />
      </Section>
      <Section title="Surface context">
        <suite.CheckboxSurfaceContext />
      </Section>
      <Section title="Themes">
        <suite.CheckboxThemes />
      </Section>
      <Section title="Interactive">
        <suite.CheckboxInteractive />
      </Section>
    </View>
  );
}

function CheckboxFieldDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = CHECKBOX_FIELD_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.CheckboxFieldDefault />
      </Section>
      <Section title="Sizes">
        <suite.CheckboxFieldSizes />
      </Section>
      <Section title="States">
        <suite.CheckboxFieldStates />
      </Section>
      <Section title="Required and error">
        <suite.CheckboxFieldRequiredAndError />
      </Section>
      <Section title="Multi-option (children)">
        <suite.CheckboxFieldMultiOption />
      </Section>
      <Section title="Dynamic text + helper">
        <suite.CheckboxFieldWithDynamicText />
      </Section>
      <Section title="Surface context">
        <suite.CheckboxFieldSurfaceContext />
      </Section>
      <Section title="Full width">
        <suite.CheckboxFieldFullWidth />
      </Section>
    </View>
  );
}

function RadioDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = RADIO_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Sizes">
        <suite.RadioSizes />
      </Section>
      <Section title="States">
        <suite.RadioStates />
      </Section>
      <Section title="Appearances">
        <suite.RadioAppearances />
      </Section>
      <Section title="Read only">
        <suite.RadioReadOnly />
      </Section>
      <Section title="With label">
        <suite.RadioWithLabel />
      </Section>
      <Section title="Surface context">
        <suite.RadioSurfaceContext />
      </Section>
      <Section title="Interactive">
        <suite.RadioInteractive />
      </Section>
    </View>
  );
}

function RadioFieldDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = RADIO_FIELD_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.RadioFieldDefault />
      </Section>
      <Section title="Sizes">
        <suite.RadioFieldSizes />
      </Section>
      <Section title="States">
        <suite.RadioFieldStates />
      </Section>
      <Section title="Required and error">
        <suite.RadioFieldRequiredAndError />
      </Section>
      <Section title="Integrated single">
        <suite.RadioFieldIntegratedSingle />
      </Section>
      <Section title="Dynamic text + helper">
        <suite.RadioFieldWithDynamicText />
      </Section>
      <Section title="Surface context">
        <suite.RadioFieldSurfaceContext />
      </Section>
      <Section title="Full width">
        <suite.RadioFieldFullWidth />
      </Section>
    </View>
  );
}

function InputDynamicTextDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = INPUT_DYNAMIC_TEXT_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.InputDynamicTextDefault />
      </Section>
      <Section title="Figma sizes (S / M / L)">
        <suite.InputDynamicTextFigmaSizes />
      </Section>
      <Section title="Slot combinations">
        <suite.InputDynamicTextSlotCombinations />
      </Section>
      <Section title="Disabled">
        <suite.InputDynamicTextDisabled />
      </Section>
      <Section title="Polite live region">
        <suite.InputDynamicTextLiveRegion />
      </Section>
      <Section title="Surface context">
        <suite.InputDynamicTextOnSurfaceBold />
      </Section>
      <Section title="Empty (renders null)">
        <suite.InputDynamicTextEmpty />
      </Section>
    </View>
  );
}

function InputFeedbackDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = INPUT_FEEDBACK_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.InputFeedbackDefault />
      </Section>
      <Section title="Variants">
        <suite.InputFeedbackVariants />
      </Section>
      <Section title="Attention levels">
        <suite.InputFeedbackAttentionLevels />
      </Section>
      <Section title="Sizes">
        <suite.InputFeedbackSizes />
      </Section>
      <Section title="Variant × Size × Attention matrix">
        <suite.InputFeedbackMatrix />
      </Section>
      <Section title="Surface context">
        <suite.InputFeedbackSurfaceContext />
      </Section>
      <Section title="Empty message (renders null)">
        <suite.InputFeedbackDisabled />
      </Section>
    </View>
  );
}

function AgentPulseDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = AGENT_PULSE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="States">
        <suite.AgentPulseStates />
      </Section>
      <Section title="Sizes">
        <suite.AgentPulseSizes />
      </Section>
      <Section title="Appearances">
        <suite.AgentPulseAppearances />
      </Section>
      <Section title="Surface context">
        <suite.AgentPulseSurfaceContext />
      </Section>
      <Section title="Transitions loop">
        <suite.AgentPulseTransitions />
      </Section>
    </View>
  );
}

function SelectDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SELECT_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.SelectDefault />
      </Section>
      <Section title="Triggers (input / button / iconButton)">
        <suite.SelectTriggers />
      </Section>
      <Section title="Single vs multi select">
        <suite.SelectSingleVsMulti />
      </Section>
      <Section title="Secondary text (multi)">
        <suite.SelectWithSecondaryText />
      </Section>
      <Section title="Sections">
        <suite.SelectWithSections />
      </Section>
      <Section title="Searchable">
        <suite.SelectSearchable />
      </Section>
      <Section title="Menu directions (below / align / above)">
        <suite.SelectMenuDirections />
      </Section>
      <Section title="Attention levels (button trigger)">
        <suite.SelectAttentionLevels />
      </Section>
      <Section title="Sizes (S / M / L)">
        <suite.SelectSizes />
      </Section>
      <Section title="States (disabled / required / error)">
        <suite.SelectStates />
      </Section>
      <Section title="Surface context (default / subtle / bold)">
        <suite.SelectSurfaceContext />
      </Section>
      <Section title="Controlled">
        <suite.SelectControlled />
      </Section>
    </View>
  );
}

function InputDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = INPUT_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.InputDefault />
      </Section>
      <Section title="Sizes (XS / S / M / L)">
        <suite.InputSizes />
      </Section>
      <Section title="Attention levels (medium / high)">
        <suite.InputAttentionLevels />
      </Section>
      <Section title="Appearances">
        <suite.InputAppearances />
      </Section>
      <Section title="Shapes (default / pill)">
        <suite.InputShapes />
      </Section>
      <Section title="States (idle / filled / disabled / read-only / error)">
        <suite.InputStates />
      </Section>
      <Section title="Disabled">
        <suite.InputDisabled />
      </Section>
      <Section title="4-slot system (start / start2 / end / end2)">
        <suite.InputWithSlots />
      </Section>
      <Section title="Controlled">
        <suite.InputControlled />
      </Section>
      <Section title="Surface context">
        <suite.InputSurfaceContext />
      </Section>
      <Section title="Search pattern">
        <suite.InputSearch />
      </Section>
    </View>
  );
}

function InputFieldDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = INPUT_FIELD_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.InputFieldDefault />
      </Section>
      <Section title="Sizes (S / M / L)">
        <suite.InputFieldSizes />
      </Section>
      <Section title="Attention levels (medium / high)">
        <suite.InputFieldAttentions />
      </Section>
      <Section title="Appearances">
        <suite.InputFieldAppearances />
      </Section>
      <Section title="Shapes (default / pill)">
        <suite.InputFieldShapes />
      </Section>
      <Section title="States (idle / filled / disabled / read-only / error / description / required)">
        <suite.InputFieldStates />
      </Section>
      <Section title="4-slot system (start / start2 / end / end2)">
        <suite.InputFieldWithSlots />
      </Section>
      <Section title="Full composition (label + description + info + error + dynamic row)">
        <suite.InputFieldFullComposition />
      </Section>
      <Section title="Controlled">
        <suite.InputFieldControlled />
      </Section>
      <Section title="Surface context">
        <suite.InputFieldSurfaceContext />
      </Section>
      <Section title="Search pattern">
        <suite.InputFieldSearch />
      </Section>
    </View>
  );
}

function ModalDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = MODAL_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.ModalDefault />
      </Section>
      <Section title="Sizes">
        <suite.ModalSizes />
      </Section>
      <Section title="Header alignment">
        <suite.ModalHeaderAlign />
      </Section>
      <Section title="Scrollable content">
        <suite.ModalScrollable />
      </Section>
      <Section title="Vertical footer">
        <suite.ModalVerticalFooter />
      </Section>
      <Section title="No header">
        <suite.ModalNoHeader />
      </Section>
      <Section title="No footer">
        <suite.ModalNoFooter />
      </Section>
      <Section title="Always dividers">
        <suite.ModalWithDividers />
      </Section>
      <Section title="With description">
        <suite.ModalWithDescription />
      </Section>
    </View>
  );
}

function IconButtonDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = ICON_BUTTON_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.IconButtonDefault />
      </Section>
      <Section title="Attention levels">
        <suite.IconButtonAttentionLevels />
      </Section>
      <Section title="Sizes">
        <suite.IconButtonSizes />
      </Section>
      <Section title="Condensed">
        <suite.IconButtonCondensed />
      </Section>
      <Section title="States">
        <suite.IconButtonStates />
      </Section>
      <Section title="Appearances">
        <suite.IconButtonAppearances />
      </Section>
      <Section title="Layouts">
        <suite.IconButtonLayouts />
      </Section>
      <Section title="Full width">
        <suite.IconButtonFullWidth />
      </Section>
      <Section title="Responsive">
        <suite.IconButtonResponsive />
      </Section>
      <Section title="JDS icon">
        <suite.IconButtonWithJdsIcon />
      </Section>
      <Section title="Surface context">
        <suite.IconButtonSurfaceContext />
      </Section>
      <Section title="Loading sizes">
        <suite.IconButtonLoadingSizes />
      </Section>
      <Section title="Loading states">
        <suite.IconButtonLoadingStates />
      </Section>
      <Section title="Motion">
        <suite.IconButtonMotion />
      </Section>
    </View>
  );
}

function SingleTextButtonDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SINGLE_TEXT_BUTTON_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.SingleTextButtonDefault />
      </Section>
      <Section title="Attention levels">
        <suite.SingleTextButtonAttentionLevels />
      </Section>
      <Section title="Sizes">
        <suite.SingleTextButtonSizes />
      </Section>
      <Section title="Condensed">
        <suite.SingleTextButtonCondensed />
      </Section>
      <Section title="Appearances">
        <suite.SingleTextButtonAppearances />
      </Section>
      <Section title="Disabled">
        <suite.SingleTextButtonDisabled />
      </Section>
      <Section title="Loading">
        <suite.SingleTextButtonLoading />
      </Section>
      <Section title="Surface context">
        <suite.SingleTextButtonSurfaceContext />
      </Section>
      <Section title="Real-world: initials row">
        <suite.SingleTextButtonRealWorldInitialsRow />
      </Section>
    </View>
  );
}

function ButtonDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = BUTTON_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.ButtonDefault />
      </Section>
      <Section title="Attention levels">
        <suite.ButtonAttentionLevels />
      </Section>
      <Section title="Themes">
        <suite.ButtonThemes />
      </Section>
      <Section title="Sizes">
        <suite.ButtonSizes />
      </Section>
      <Section title="Contained">
        <suite.ButtonContained />
      </Section>
      <Section title="Condensed">
        <suite.ButtonCondensed />
      </Section>
      <Section title="Slot-aware padding">
        <suite.ButtonSlotPadding />
      </Section>
      <Section title="States">
        <suite.ButtonStates />
      </Section>
      <Section title="With slots">
        <suite.ButtonWithSlots />
      </Section>
      <Section title="Loading with slots">
        <suite.ButtonLoadingWithSlots />
      </Section>
      <Section title="Full width">
        <suite.ButtonFullWidth />
      </Section>
      <Section title="Responsive">
        <suite.ButtonResponsive />
      </Section>
      <Section title="Appearances">
        <suite.ButtonAppearances />
      </Section>
      <Section title="Density">
        <suite.ButtonDensity />
      </Section>
      <Section title="Motion">
        <suite.ButtonMotion />
      </Section>
      <Section title="Surface context">
        <suite.ButtonSurfaceContext />
      </Section>
      <Section title="Playground">
        <suite.ButtonPlayground />
      </Section>
    </View>
  );
}

function DividerDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = DIVIDER_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.DividerDefault />
      </Section>
      <Section title="Orientations">
        <suite.DividerOrientations />
      </Section>
      <Section title="Sizes">
        <suite.DividerSizes />
      </Section>
      <Section title="Attention levels">
        <suite.DividerAttentionLevels />
      </Section>
      {'DividerWithIcon' in suite ? (
        <Section title="With icon">
          <suite.DividerWithIcon />
        </Section>
      ) : null}
      {'DividerWithLabel' in suite ? (
        <Section title="With label">
          <suite.DividerWithLabel />
        </Section>
      ) : null}
      <Section title="Round caps">
        <suite.DividerRoundCaps />
      </Section>
      <Section title="Surface context">
        <suite.DividerSurfaceContext />
      </Section>
      <Section title="Vertical sizes">
        <suite.DividerVerticalSizes />
      </Section>
      <Section title="Vertical attention levels">
        <suite.DividerVerticalAttentionLevels />
      </Section>
      <Section title="Vertical with icon">
        <suite.DividerVerticalWithIcon />
      </Section>
      <Section title="Vertical with label">
        <suite.DividerVerticalWithLabel />
      </Section>
      <Section title="Vertical inline usage">
        <suite.DividerVertical />
      </Section>
      <Section title="Appearances">
        <suite.DividerAppearances />
      </Section>
    </View>
  );
}

function SeparatorDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SEPARATOR_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Horizontal">
        <suite.SeparatorHorizontal />
      </Section>
      <Section title="Vertical">
        <suite.SeparatorVertical />
      </Section>
    </View>
  );
}

function ScrimDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SCRIM_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.ScrimDefault />
      </Section>
      <Section title="Gradient positions">
        <suite.ScrimGradientPositions />
      </Section>
      <Section title="Size · bottom">
        <suite.ScrimSizeBottom />
      </Section>
      <Section title="Size · left">
        <suite.ScrimSizeStart />
      </Section>
      <Section title="Size · top">
        <suite.ScrimSizeTop />
      </Section>
      <Section title="Size · right">
        <suite.ScrimSizeEnd />
      </Section>
      <Section title="Attention · bottom">
        <suite.ScrimAttentionBottom />
      </Section>
      <Section title="Attention · left">
        <suite.ScrimAttentionStart />
      </Section>
      <Section title="Attention · top">
        <suite.ScrimAttentionTop />
      </Section>
      <Section title="Attention · right">
        <suite.ScrimAttentionEnd />
      </Section>
      <Section title="Size full · bottom">
        <suite.ScrimSizeFullBottom />
      </Section>
      <Section title="Size full · left">
        <suite.ScrimSizeFullStart />
      </Section>
      <Section title="Size full · top">
        <suite.ScrimSizeFullTop />
      </Section>
      <Section title="Size full · right">
        <suite.ScrimSizeFullEnd />
      </Section>
      <Section title="Size full · center">
        <suite.ScrimSizeFullCenter />
      </Section>
      <Section title="Positions">
        <suite.ScrimPositions />
      </Section>
      <Section title="Attention · XL bottom">
        <suite.ScrimAttention />
      </Section>
      <Section title="Overlay">
        <suite.ScrimOverlay />
      </Section>
      <Section title="Over image">
        <suite.ScrimOverImage />
      </Section>
      <Section title="Surface context">
        <suite.ScrimSurfaceContext />
      </Section>
    </View>
  );
}

function SpinnerDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SPINNER_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.SpinnerDefault />
      </Section>
      <Section title="All sizes">
        <suite.SpinnerSizes />
      </Section>
      <Section title="On surface context">
        <suite.SpinnerSurfaceContext />
      </Section>
      <Section title="Motion">
        <suite.SpinnerMotion />
      </Section>
    </View>
  );
}

function ProgressDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = PROGRESS_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.ProgressDefault />
      </Section>
      <Section title="Sizes">
        <suite.ProgressSizes />
      </Section>
      <Section title="Value range">
        <suite.ProgressValueRange />
      </Section>
      <Section title="Indeterminate">
        <suite.ProgressIndeterminate />
      </Section>
      <Section title="Boundaries">
        <suite.ProgressBoundaries />
      </Section>
      <Section title="Surface context">
        <suite.ProgressSurfaceContext />
      </Section>
    </View>
  );
}

function CircularProgressIndicatorDetail({
  library,
}: {
  library: LibraryName;
}): React.ReactElement {
  const suite = CIRCULAR_PROGRESS_INDICATOR_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.CircularProgressIndicatorDefault />
      </Section>
      <Section title="Variants">
        <suite.CircularProgressIndicatorVariants />
      </Section>
      <Section title="Sizes">
        <suite.CircularProgressIndicatorSizes />
      </Section>
      <Section title="Appearances">
        <suite.CircularProgressIndicatorAppearances />
      </Section>
      <Section title="With content">
        <suite.CircularProgressIndicatorWithContent />
      </Section>
      <Section title="States">
        <suite.CircularProgressIndicatorStates />
      </Section>
      <Section title="Interactive">
        <suite.CircularProgressIndicatorInteractive />
      </Section>
      <Section title="Motion — entry &amp; exit">
        <suite.CircularProgressIndicatorEntryExit />
      </Section>
      <Section title="Surface context">
        <suite.CircularProgressIndicatorSurfaceContext />
      </Section>
      <Section title="Disabled">
        <suite.CircularProgressIndicatorDisabled />
      </Section>
    </View>
  );
}

function BadgeDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = BADGE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.BadgeDefault />
      </Section>
      <Section title="Variants">
        <suite.BadgeVariants />
      </Section>
      <Section title="Sizes">
        <suite.BadgeSizes />
      </Section>
      <Section title="With Slots">
        <suite.BadgeWithSlots />
      </Section>
      <Section title="Accessibility (slots)">
        <suite.BadgeAccessibilityWithSlots />
      </Section>
      <Section title="Sizes with Slots">
        <suite.BadgeSizesWithSlots />
      </Section>
      <Section title="Appearances">
        <suite.BadgeAppearances />
      </Section>
      <Section title="Responsive">
        <suite.BadgeResponsive />
      </Section>
      <Section title="Themes">
        <suite.BadgeThemes />
      </Section>
      <Section title="Slot Adaptation">
        <suite.BadgeSlotAdaptation />
      </Section>
      <Section title="Figma Slot Matrix">
        <suite.BadgeFigmaSlotMatrix />
      </Section>
      <Section title="Surface Context / Bold">
        <suite.BadgeSurfaceContextBold />
      </Section>
      <Section title="Surface Context / Subtle">
        <suite.BadgeSurfaceContextSubtle />
      </Section>
      <Section title="Surface Context / All Modes">
        <suite.BadgeSurfaceContextAllModes />
      </Section>
    </View>
  );
}

function CardDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = CARD_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.CardDefault />
      </Section>
      <Section title="Interactive">
        <suite.CardInteractive />
      </Section>
      <Section title="Surface modes">
        <suite.CardSurfaceModes />
      </Section>
      <Section title="Appearances (Secondary)">
        <suite.CardAppearances />
      </Section>
      <Section title="Nested on Bold">
        <suite.CardNestedOnBold />
      </Section>
    </View>
  );
}

function CounterBadgeDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = COUNTER_BADGE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.CounterBadgeDefault />
      </Section>
      <Section title="Variants">
        <suite.CounterBadgeVariants />
      </Section>
      <Section title="Sizes">
        <suite.CounterBadgeSizes />
      </Section>
      <Section title="Max Value">
        <suite.CounterBadgeMaxValue />
      </Section>
      <Section title="Appearances">
        <suite.CounterBadgeAppearances />
      </Section>
      <Section title="Responsive">
        <suite.CounterBadgeResponsive />
      </Section>
      <Section title="Motion">
        <suite.CounterBadgeMotion />
      </Section>
      <Section title="Themes">
        <suite.CounterBadgeThemes />
      </Section>
    </View>
  );
}

function IndicatorBadgeDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = INDICATOR_BADGE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.IndicatorBadgeDefault />
      </Section>
      <Section title="Sizes">
        <suite.IndicatorBadgeSizes />
      </Section>
      <Section title="Appearances">
        <suite.IndicatorBadgeAppearances />
      </Section>
      <Section title="Surface Context">
        <suite.IndicatorBadgeSurfaceContext />
      </Section>
      <Section title="Responsive">
        <suite.IndicatorBadgeResponsive />
      </Section>
      <Section title="Themes">
        <suite.IndicatorBadgeThemes />
      </Section>
      <Section title="Motion">
        <suite.IndicatorBadgeMotion />
      </Section>
      <Section title="With Components">
        <suite.IndicatorBadgeWithComponents />
      </Section>
    </View>
  );
}

function CarouselDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = CAROUSEL_SUITES[library];
  const [tab, setTab] = useState<CarouselDetailTab>('Default');

  return (
    <View style={styles.body}>
      <SelectorCluster
        label="Showcase"
        value={tab}
        options={CAROUSEL_DETAIL_TABS}
        onChange={(value) => setTab(value as CarouselDetailTab)}
      />

      <View style={{ marginHorizontal: -18 }}>
        {tab === 'Default' ? (
          <Section title="Default">
            <suite.CarouselDefault />
          </Section>
        ) : null}

        {tab === 'Aspect ratios' ? (
          <Section title="Image aspect ratios">
            <suite.CarouselImageAspectRatios />
          </Section>
        ) : null}

        {tab === 'Alignments' ? (
          <Section title="Alignments">
            <suite.CarouselAlignments />
          </Section>
        ) : null}

        {tab === 'Content Alignments' ? (
          <>
            <Section title="Content widths · start bottom">
              <suite.CarouselContentWidthsStartBottom />
            </Section>
            <Section title="Content widths · start middle">
              <suite.CarouselContentWidthsStartMiddle />
            </Section>
            <Section title="Content widths · middle bottom">
              <suite.CarouselContentWidthsMiddleBottom />
            </Section>
            <Section title="Content widths · middle middle">
              <suite.CarouselContentWidthsMiddleMiddle />
            </Section>
            <Section title="Content widths · middle top">
              <suite.CarouselContentWidthsMiddleTop />
            </Section>
          </>
        ) : null}

        {tab === 'Content Compositions' ? (
          <Section title="Content compositions">
            <suite.CarouselContentCompositions />
          </Section>
        ) : null}

        {tab === 'Badges' ? (
          <Section title="Badges">
            <suite.CarouselBadges />
          </Section>
        ) : null}

        {tab === 'Controls' ? (
          <Section title="Controls">
            <suite.CarouselControlsShowcase />
          </Section>
        ) : null}

        {tab === 'Selection rail' ? (
          <>
            <Section title="Selection rail">
              <suite.CarouselSelectionRailShowcase />
            </Section>
            <Section title="Default · selection rail below">
              <suite.CarouselSelectionRailDefaultShowcase />
            </Section>
          </>
        ) : null}

        {tab === 'Behavior' ? (
          <>
            <Section title="Auto play">
              <suite.CarouselAutoPlay />
            </Section>
            <Section title="Peek">
              <suite.CarouselPeek />
            </Section>
          </>
        ) : null}

        {tab === 'Context' ? (
          <>
            <Section title="Surface context">
              <suite.CarouselSurfaceContext />
            </Section>
            <Section title="Adoption matrix">
              <suite.CarouselAdoptionMatrix />
            </Section>
          </>
        ) : null}

        {tab === 'Figma' ? (
          <>
            <Section title="Figma parity · 2818:50672">
              <suite.CarouselFigma281850672 />
            </Section>
            <Section title="Figma parity · pagination (2775:10878 / 10745)">
              <suite.CarouselFigmaPaginationParity />
            </Section>
          </>
        ) : null}
      </View>
    </View>
  );
}

function PaginationDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = PAGINATION_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.PaginationDefault />
      </Section>
      <Section title="Sizes × attention">
        <suite.PaginationSizesAttention />
      </Section>
      <Section title="Appearances">
        <suite.PaginationAppearances />
      </Section>
      <Section title="Controlled">
        <suite.PaginationControlled />
      </Section>
      <Section title="First / last">
        <suite.PaginationWithFirstLast />
      </Section>
      <Section title="Edge cases">
        <suite.PaginationEdgeCases />
      </Section>
      <Section title="Surface context">
        <suite.PaginationSurfaceContext />
      </Section>
      <Section title="PaginationItem">
        <suite.PaginationItemShowcase />
      </Section>
      <Section title="Focus state">
        <suite.PaginationFocusState />
      </Section>
    </View>
  );
}

function PaginationDotsDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = PAGINATION_DOTS_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.PaginationDotsDefault />
      </Section>
      <Section title="Basic (interactive)">
        <suite.PaginationDotsBasic />
      </Section>
      <Section title="Appearances">
        <suite.PaginationDotsAppearances />
      </Section>
      <Section title="Loop vs Non-loop">
        <suite.PaginationDotsLoopVsNonLoop />
      </Section>
      <Section title="Long sequence">
        <suite.PaginationDotsLongSequence />
      </Section>
      <Section title="Interactive (carousel)">
        <suite.PaginationDotsInteractive />
      </Section>
      <Section title="Read-only">
        <suite.PaginationDotsReadOnly />
      </Section>
      <Section title="Degenerate cases">
        <suite.PaginationDotsDegenerate />
      </Section>
      <Section title="Surface context">
        <suite.PaginationDotsSurfaceContext />
      </Section>
    </View>
  );
}

function ContainerDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = CONTAINER_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Fluid">
        <suite.ContainerFluid />
      </Section>
      <Section title="Fixed">
        <suite.ContainerFixed />
      </Section>
      <Section title="Full bleed">
        <suite.ContainerFullBleed />
      </Section>
      <Section title="Custom maxWidth">
        <suite.ContainerCustomMaxWidth />
      </Section>
    </View>
  );
}

function ImageDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = IMAGE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.ImageDefault />
      </Section>
      <Section title="Aspect ratios">
        <suite.ImageAspectRatios />
      </Section>
      <Section title="Object fit modes">
        <suite.ImageObjectFitModes />
      </Section>
      <Section title="States">
        <suite.ImageStates />
      </Section>
      <Section title="With fallback">
        <suite.ImageWithFallback />
      </Section>
      <Section title="Interactive">
        <suite.ImageInteractive />
      </Section>
      <Section title="Responsive">
        <suite.ImageResponsive />
      </Section>
      <Section title="Corner radius">
        <suite.ImageCornerRadius />
      </Section>
      <Section title="Tile gallery">
        <suite.ImageGallery />
      </Section>
    </View>
  );
}

function LogoDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = LOGO_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.LogoDefault />
      </Section>
      <Section title="Variants">
        <suite.LogoVariants />
      </Section>
      <Section title="Sizes">
        <suite.LogoSizes />
      </Section>
      <Section title="Custom size">
        <suite.LogoCustomSize />
      </Section>
      <Section title="From src URL">
        <suite.LogoFromImage />
      </Section>
      <Section title="From JSX children">
        <suite.LogoFromChildren />
      </Section>
      {'LogoContentSources' in suite ? (
        <Section title="Content sources">
          <suite.LogoContentSources />
        </Section>
      ) : null}
      <Section title="Surface context">
        <suite.LogoSurfaceContext />
      </Section>
      {'LogoImageFallback' in suite ? (
        <Section title="Image fallback">
          <suite.LogoImageFallback />
        </Section>
      ) : null}
      <Section title="Interactive">
        <suite.LogoInteractive />
      </Section>
      <Section title="Themes">
        <suite.LogoThemes />
      </Section>
    </View>
  );
}

function AvatarDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = AVATAR_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.AvatarDefault />
      </Section>
      <Section title="Variants">
        <suite.AvatarVariants />
      </Section>
      <Section title="Attention Levels">
        <suite.AvatarAttentionLevels />
      </Section>
      <Section title="Sizes">
        <suite.AvatarSizes />
      </Section>
      <Section title="Appearances">
        <suite.AvatarAppearances />
      </Section>
      <Section title="Themes">
        <suite.AvatarThemes />
      </Section>
      <Section title="Surface Context">
        <suite.AvatarSurfaceContext />
      </Section>
      <Section title="States">
        <suite.AvatarStates />
      </Section>
      <Section title="Image Fallback">
        <suite.AvatarImageFallback />
      </Section>
      <Section title="With Icons">
        <suite.AvatarWithIcons />
      </Section>
      <Section title="Responsive">
        <suite.AvatarResponsive />
      </Section>
    </View>
  );
}

function IconContainedDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = ICON_CONTAINED_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.IconContainedDefault />
      </Section>
      <Section title="Attention Levels">
        <suite.IconContainedAttentionLevels />
      </Section>
      <Section title="Sizes">
        <suite.IconContainedSizes />
      </Section>
      <Section title="States">
        <suite.IconContainedStates />
      </Section>
      <Section title="With Icons">
        <suite.IconContainedWithIcons />
      </Section>
      <Section title="Appearances">
        <suite.IconContainedAppearances />
      </Section>
      <Section title="Themes">
        <suite.IconContainedThemes />
      </Section>
      <Section title="Surface Context">
        <suite.IconContainedSurfaceContext />
      </Section>
    </View>
  );
}

function BottomNavigationDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = BOTTOM_NAVIGATION_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.BottomNavigationDefault />
      </Section>
      <Section title="Label types">
        <suite.BottomNavigationLabelTypes />
      </Section>
      <Section title="2-line long labels">
        <suite.BottomNavigationTwoLineLongLabels />
      </Section>
      <Section title="Icon-only accessibility">
        <suite.BottomNavigationIconOnlyAccessibility />
      </Section>
      <Section title="Item counts (2–5)">
        <suite.BottomNavigationItemCounts />
      </Section>
      <Section title="Max items (6 → 5)">
        <suite.BottomNavigationMaxItemsEnforced />
      </Section>
      <Section title="States">
        <suite.BottomNavigationStates />
      </Section>
      <Section title="Controlled">
        <suite.BottomNavigationControlled />
      </Section>
      <Section title="Selection exclusivity">
        <suite.BottomNavigationSelectionExclusivity />
      </Section>
      <Section title="Surface context">
        <suite.BottomNavigationSurfaceModes />
      </Section>
      <Section title="Appearances">
        <suite.BottomNavigationAppearances />
      </Section>
    </View>
  );
}

function HeaderItemDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = HEADER_ITEM_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Attention levels (inactive vs active)">
        <suite.HeaderItemAttentionLevels />
      </Section>
      <Section title="Full matrix — attention × active (label only)">
        <suite.HeaderItemFullMatrix />
      </Section>
      <Section title="Start slots (S badge · M icon)">
        <suite.HeaderItemStartSlots />
      </Section>
      <Section title="End slots (S badge · M icon)">
        <suite.HeaderItemEndSlots />
      </Section>
      <Section title="Combined start + end slots">
        <suite.HeaderItemCombinedSlots />
      </Section>
      <Section title="Attention × slots (active)">
        <suite.HeaderItemAttentionSlotMatrix />
      </Section>
      <Section title="visuallyAlignToStart (first item)">
        <suite.HeaderItemAlignToStart />
      </Section>
      <Section title="Disabled">
        <suite.HeaderItemDisabled />
      </Section>
    </View>
  );
}

function HeaderNativeDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = HEADER_NATIVE_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Composed header (secondaryNav=false)">
        <suite.HeaderComposedWithoutSecondary />
      </Section>
      <Section title="Composed header (secondaryNav=true)">
        <suite.HeaderComposedWithSecondary />
      </Section>
      <Section title="PrimaryNav type = homeBar (collapsed)">
        <suite.HeaderPrimaryNavHomeBar />
      </Section>
      <Section title="PrimaryNav type = homeBar (expanded)">
        <suite.HeaderPrimaryNavHomeBarExpanded />
      </Section>
      <Section title="PrimaryNav type = homeBar (inline search)">
        <suite.HeaderPrimaryNavHomeBarWithSearch />
      </Section>
      <Section title="PrimaryNav type = contextBar (collapsed)">
        <suite.HeaderPrimaryNavContextBar />
      </Section>
      <Section title="PrimaryNav type = contextBar (expanded)">
        <suite.HeaderPrimaryNavContextBarExpanded />
      </Section>
      <Section title="PrimaryNav type = searchBar (collapsed)">
        <suite.HeaderPrimaryNavSearchBarCollapsed />
      </Section>
      <Section title="PrimaryNav type = searchBar (expanded)">
        <suite.HeaderPrimaryNavSearchBarExpanded />
      </Section>
    </View>
  );
}

function TabsDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = TABS_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.TabsDefault />
      </Section>
      <Section title="Variants">
        <suite.TabsVariants />
      </Section>
      <Section title="Sizes">
        <suite.TabsSizes />
      </Section>
      <Section title="States">
        <suite.TabsStates />
      </Section>
      <Section title="With icons">
        <suite.TabsWithIcons />
      </Section>
      <Section title="Interactive">
        <suite.TabsInteractive />
      </Section>
      <Section title="Many items (10)">
        <suite.TabsManyItems />
      </Section>
      <Section title="Many items vertical (10)">
        <suite.TabsManyItemsVertical />
      </Section>
      <Section title="Themes">
        <suite.TabsThemes />
      </Section>
      <Section title="Appearances">
        <suite.TabsAppearances />
      </Section>
      <Section title="Adoption matrix">
        <suite.TabsAdoptionMatrix />
      </Section>
      <Section title="On bold surface">
        <suite.TabsOnBoldSurface />
      </Section>
      <Section title="Compound API">
        <suite.TabsCompoundAPI />
      </Section>
    </View>
  );
}

function SegmentedControlDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SEGMENTED_CONTROL_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.SegmentedControlDefault />
      </Section>
      <Section title="Attention levels">
        <suite.SegmentedControlAttentionLevels />
      </Section>
      <Section title="Track emphasis">
        <suite.SegmentedControlTrackEmphasisLevels />
      </Section>
      <Section title="Sizes">
        <suite.SegmentedControlSizes />
      </Section>
      <Section title="Shapes">
        <suite.SegmentedControlShapes />
      </Section>
      <Section title="Equal width vs hug">
        <suite.SegmentedControlEqualWidth />
      </Section>
      <Section title="With slots">
        <suite.SegmentedControlWithSlots />
      </Section>
      <Section title="Icon only">
        <suite.SegmentedControlIconOnly />
      </Section>
      <Section title="Appearances">
        <suite.SegmentedControlAppearances />
      </Section>
      <Section title="States">
        <suite.SegmentedControlStates />
      </Section>
      <Section title="Surface context">
        <suite.SegmentedControlSurfaceContext />
      </Section>
      <Section title="On bold surface">
        <suite.SegmentedControlOnBoldSurface />
      </Section>
      <Section title="Nested surfaces">
        <suite.SegmentedControlNestedSurfaces />
      </Section>
    </View>
  );
}

function IconDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = ICON_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.IconDefault />
      </Section>
      <Section title="Sizes">
        <suite.IconSizes />
      </Section>
      <Section title="Appearance × Emphasis">
        <suite.IconAppearances />
      </Section>
      <Section title="Emphasis levels">
        <suite.IconEmphasisLevels />
      </Section>
      <Section title="With Icons">
        <suite.IconWithIcons />
      </Section>
      <Section title="Interactive">
        <suite.IconInteractive />
      </Section>
      <Section title="Surface Context">
        <suite.IconSurfaceContext />
      </Section>
      <Section title="In Context">
        <suite.IconInContext />
      </Section>
    </View>
  );
}

function TextDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = TEXT_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.TextDefault />
      </Section>
      <Section title="Variants & Attention ( low, medium, high)">
        <suite.TextVariants />
      </Section>
      <Section title="Sizes">
        <suite.TextSizes />
      </Section>
      <Section title="Alignment">
        <suite.TextAlignment />
      </Section>
      <Section title="Decorations">
        <suite.TextDecorations />
      </Section>
      <Section title="Surface Context">
        <suite.TextSurfaceContext />
      </Section>
      <Section title="Truncation, Alignment & Link">
        <suite.TextTruncationAlignmentAndLink />
      </Section>
      <Section title="Truncation">
        <suite.TextTruncation />
      </Section>
      <Section title="Alignment">
        <suite.TextAlignment />
      </Section>
      <Section title="Link">
        <suite.TextLink />
      </Section>
      <Section title="Disabled">
        <suite.TextDisabled />
      </Section>
    </View>
  );
}

function TooltipDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = TOOLTIP_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.TooltipDefault />
      </Section>
      <Section title="Positions">
        <suite.TooltipPositions />
      </Section>
      <Section title="Arrow">
        <suite.TooltipArrow />
      </Section>
      <Section title="Trigger modes">
        <suite.TooltipTriggerModes />
      </Section>
      <Section title="Delay">
        <suite.TooltipDelay />
      </Section>
      <Section title="Disabled">
        <suite.TooltipDisabled />
      </Section>
      <Section title="Controlled">
        <suite.TooltipControlled />
      </Section>
      <Section title="Max width">
        <suite.TooltipMaxWidth />
      </Section>
      <Section title="Motion">
        <suite.TooltipMotion />
      </Section>
      <Section title="Long content">
        <suite.TooltipLongContent />
      </Section>
      <Section title="Portal">
        <suite.TooltipPortal />
      </Section>
      <Section title="Surface context / Bold">
        <suite.TooltipInsideBoldSurface />
      </Section>
      <Section title="Surface context / Subtle">
        <suite.TooltipInsideSubtleSurface />
      </Section>
      <Section title="Surface context / All modes">
        <suite.TooltipSurfaceContext />
      </Section>
    </View>
  );
}

function SwitchDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SWITCH_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Default">
        <suite.SwitchDefault />
      </Section>
      <Section title="Sizes">
        <suite.SwitchSizes />
      </Section>
      <Section title="States">
        <suite.SwitchStates />
      </Section>
      <Section title="Appearances">
        <suite.SwitchAppearances />
      </Section>
      <Section title="Accents">
        <suite.SwitchAccents />
      </Section>
      <Section title="Read Only">
        <suite.SwitchReadOnly />
      </Section>
      <Section title="With Label">
        <suite.SwitchWithLabel />
      </Section>
      <Section title="Surface Context">
        <suite.SwitchSurfaceContext />
      </Section>
      <Section title="Themes">
        <suite.SwitchThemes />
      </Section>
      <Section title="Controlled">
        <suite.SwitchControlled />
      </Section>
    </View>
  );
}

function TouchSliderDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = TOUCH_SLIDER_SUITES[library];
  return (
    <View style={styles.body}>
      <Section title="Progress styles">
        <suite.TouchSliderProgressStyles />
      </Section>
      <Section title="With slots">
        <suite.TouchSliderWithSlots />
      </Section>
      <Section title="Appearances">
        <suite.TouchSliderAppearances />
      </Section>
      <Section title="States">
        <suite.TouchSliderStates />
      </Section>
      <Section title="Vertical">
        <suite.TouchSliderVertical />
      </Section>
      <Section title="Surface context">
        <suite.TouchSliderSurfaceContext />
      </Section>
    </View>
  );
}

function SliderDetail({ library }: { library: LibraryName }): React.ReactElement {
  const suite = SLIDER_SUITES[library];
  return (
    <View style={styles.body}>
      <suite.SliderShowcase />
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
        {name} hasn't been ported to the {library} renderer yet. Switch the Library selector to{' '}
        <Text style={{ fontWeight: typography.weight.high }}>native</Text> to see this component, or
        pick one of the Wave 1 primitives — they ship full multi-library parity.
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
        {name} hasn't shipped a `*.native.tsx` implementation yet. See the web verifier
        (`apps/v4-sample`) for the full prop / variant / a11y reference. Contributions to
        `packages/ui-native` welcome — start from `Button.native.tsx` for the established pattern.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
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
