import 'package:flutter/material.dart';

import 'button_showcase.dart';

/// Sidebar order — parity with web `Components/Actions/Button` in Storybook.
enum ButtonFoundationStory {
  docs,
  defaultStory,
  attentionLevels,
  sizes,
  condensed,
  contained,
  slotPadding,
  states,
  focusState,
  withSlots,
  appearances,
  fullWidth,
  interactive,
  responsive,
  themes,
  loadingWithSlots,
  surfaceContext,
  typographyTokens,
  density,
  motion,
}

/// Stories listed under Button (excludes internal-only helpers).
const List<ButtonFoundationStory> kButtonStoryNavOrder = [
  ButtonFoundationStory.docs,
  ButtonFoundationStory.defaultStory,
  ButtonFoundationStory.attentionLevels,
  ButtonFoundationStory.sizes,
  ButtonFoundationStory.condensed,
  ButtonFoundationStory.contained,
  ButtonFoundationStory.slotPadding,
  ButtonFoundationStory.states,
  ButtonFoundationStory.focusState,
  ButtonFoundationStory.withSlots,
  ButtonFoundationStory.appearances,
  ButtonFoundationStory.fullWidth,
  ButtonFoundationStory.interactive,
  ButtonFoundationStory.responsive,
  ButtonFoundationStory.themes,
  ButtonFoundationStory.loadingWithSlots,
  ButtonFoundationStory.surfaceContext,
  ButtonFoundationStory.typographyTokens,
  ButtonFoundationStory.density,
  ButtonFoundationStory.motion,
];

extension ButtonFoundationStoryMeta on ButtonFoundationStory {
  String get title => switch (this) {
        ButtonFoundationStory.docs => 'Docs',
        ButtonFoundationStory.defaultStory => 'Default',
        ButtonFoundationStory.attentionLevels => 'Attention Levels',
        ButtonFoundationStory.sizes => 'Sizes',
        ButtonFoundationStory.condensed => 'Condensed',
        ButtonFoundationStory.contained => 'Contained',
        ButtonFoundationStory.slotPadding => 'Slot-Aware Padding',
        ButtonFoundationStory.states => 'States',
        ButtonFoundationStory.focusState => 'Focus State',
        ButtonFoundationStory.withSlots => 'With Start/End Slots',
        ButtonFoundationStory.appearances => 'Appearances',
        ButtonFoundationStory.fullWidth => 'Full Width',
        ButtonFoundationStory.interactive => 'Interactive',
        ButtonFoundationStory.responsive => 'Responsive',
        ButtonFoundationStory.themes => 'Themes',
        ButtonFoundationStory.loadingWithSlots => 'Loading with Slots',
        ButtonFoundationStory.surfaceContext => 'Surface Context',
        ButtonFoundationStory.typographyTokens => 'Typography & Tokens',
        ButtonFoundationStory.density => 'Density',
        ButtonFoundationStory.motion => 'Motion',
      };

  String get description => switch (this) {
        ButtonFoundationStory.docs =>
          'Merged documentation — all Button stories on one page (web autodocs parity).',
        ButtonFoundationStory.defaultStory =>
          'Live preview with Controls (attention, size, slots, appearance, states).',
        ButtonFoundationStory.attentionLevels =>
          'High / Medium / Low — bold, subtle, ghost.',
        ButtonFoundationStory.sizes => 'XS · S · M · L (f6 · f8 · f10 · f12).',
        ButtonFoundationStory.condensed =>
          'Default vs condensed at every size.',
        ButtonFoundationStory.contained =>
          'Filled pill (`--Button-*`) vs LinkButton text form (`--LinkButton-*` tokens).',
        ButtonFoundationStory.slotPadding => 'Slot-aware horizontal padding.',
        ButtonFoundationStory.states => 'Default, disabled, loading.',
        ButtonFoundationStory.focusState =>
          'Idle vs focus ring; Tab + Enter/Space activation (web/RN parity).',
        ButtonFoundationStory.withSlots => 'Start / end icon slots.',
        ButtonFoundationStory.appearances => 'Multi-accent roles × attention.',
        ButtonFoundationStory.fullWidth => 'Full-width layout.',
        ButtonFoundationStory.interactive => 'Tap / activate.',
        ButtonFoundationStory.responsive => 'Full-width + compact action row.',
        ButtonFoundationStory.themes =>
          'Light/dark caption only — attention variants are in Attention Levels (no duplicate row).',
        ButtonFoundationStory.loadingWithSlots => 'Loading + slots.',
        ButtonFoundationStory.surfaceContext => 'Surface context remapping.',
        ButtonFoundationStory.typographyTokens =>
          'textTransform (case-insensitive), letterSpacing (rem/ch), ghost transparent text + hover.',
        ButtonFoundationStory.density => 'compact · default · open columns.',
        ButtonFoundationStory.motion =>
          'Convex motion tokens applied (tap shrink + durations).',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        ButtonFoundationStory.docs => const SizedBox.shrink(),
        ButtonFoundationStory.defaultStory => buttonDefaultSection(context),
        ButtonFoundationStory.attentionLevels =>
          buttonAttentionLevelsSection(context),
        ButtonFoundationStory.sizes => buttonSizesSection(context),
        ButtonFoundationStory.condensed => buttonCondensedSection(context),
        ButtonFoundationStory.contained => buttonContainedSection(context),
        ButtonFoundationStory.slotPadding => buttonSlotPaddingSection(context),
        ButtonFoundationStory.states => buttonStatesSection(context),
        ButtonFoundationStory.focusState => buttonFocusStateSection(context),
        ButtonFoundationStory.withSlots => buttonWithSlotsSection(context),
        ButtonFoundationStory.appearances => buttonAppearancesSection(context),
        ButtonFoundationStory.fullWidth => buttonFullWidthSection(context),
        ButtonFoundationStory.interactive => buttonInteractiveSection(context),
        ButtonFoundationStory.responsive => buttonResponsiveSection(context),
        ButtonFoundationStory.themes => buttonThemesSection(context),
        ButtonFoundationStory.loadingWithSlots =>
          buttonLoadingWithSlotsSection(context),
        ButtonFoundationStory.surfaceContext =>
          buttonSurfaceContextSection(context),
        ButtonFoundationStory.typographyTokens =>
          buttonTypographyTokensSection(context),
        ButtonFoundationStory.density => buttonDensitySection(context),
        ButtonFoundationStory.motion => buttonMotionSection(context),
      };
}
