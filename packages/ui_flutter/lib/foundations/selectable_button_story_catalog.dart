import 'package:flutter/material.dart';

import 'selectable_button_default_story_page.dart';
import 'selectable_button_showcase.dart';

enum SelectableButtonFoundationStory {
  docs,
  defaultStory,
  focusState,
  attentionLevels,
  selectedUnselected,
  sizes,
  containedMode,
  condensed,
  withSlots,
  appearances,
  interactive,
  states,
  surfaceContext,
  realWorldLike,
  fullWidth,
}

const List<SelectableButtonFoundationStory> kSelectableButtonStoryNavOrder = [
  SelectableButtonFoundationStory.docs,
  SelectableButtonFoundationStory.defaultStory,
  SelectableButtonFoundationStory.focusState,
  SelectableButtonFoundationStory.attentionLevels,
  SelectableButtonFoundationStory.selectedUnselected,
  SelectableButtonFoundationStory.sizes,
  SelectableButtonFoundationStory.containedMode,
  SelectableButtonFoundationStory.condensed,
  SelectableButtonFoundationStory.withSlots,
  SelectableButtonFoundationStory.appearances,
  SelectableButtonFoundationStory.interactive,
  SelectableButtonFoundationStory.states,
  SelectableButtonFoundationStory.surfaceContext,
  SelectableButtonFoundationStory.realWorldLike,
  SelectableButtonFoundationStory.fullWidth,
];

extension SelectableButtonFoundationStoryMeta on SelectableButtonFoundationStory {
  String get title => switch (this) {
        SelectableButtonFoundationStory.docs => 'Docs',
        SelectableButtonFoundationStory.defaultStory => 'Default',
        SelectableButtonFoundationStory.focusState => 'Focus State',
        SelectableButtonFoundationStory.attentionLevels => 'Attention Levels',
        SelectableButtonFoundationStory.selectedUnselected =>
          'Selected / Unselected',
        SelectableButtonFoundationStory.sizes => 'Sizes',
        SelectableButtonFoundationStory.containedMode =>
          'Contained vs Uncontained',
        SelectableButtonFoundationStory.condensed => 'Condensed',
        SelectableButtonFoundationStory.withSlots => 'With Start/End Slots',
        SelectableButtonFoundationStory.appearances => 'Appearances',
        SelectableButtonFoundationStory.interactive => 'Interactive',
        SelectableButtonFoundationStory.states => 'States',
        SelectableButtonFoundationStory.surfaceContext => 'Surface Context',
        SelectableButtonFoundationStory.realWorldLike =>
          'Real-world: Like Button',
        SelectableButtonFoundationStory.fullWidth => 'Full Width',
      };

  String get description => switch (this) {
        SelectableButtonFoundationStory.docs =>
          'Toggle button that stays selected after click — Base UI Toggle parity.',
        SelectableButtonFoundationStory.defaultStory =>
          'High attention, size M — controls on Interactive.',
        SelectableButtonFoundationStory.focusState =>
          'Idle vs forced focus ring + keyboard traversal.',
        SelectableButtonFoundationStory.attentionLevels =>
          'Selected vs unselected across high/medium/low.',
        SelectableButtonFoundationStory.selectedUnselected =>
          'Per-attention selected/unselected pairs.',
        SelectableButtonFoundationStory.sizes => 'XS / S / M / L (selected).',
        SelectableButtonFoundationStory.containedMode =>
          'Pill container vs inline text-only modes.',
        SelectableButtonFoundationStory.condensed =>
          'Normal vs condensed S/M/L (contained only).',
        SelectableButtonFoundationStory.withSlots =>
          'Start, end, and both icon slots.',
        SelectableButtonFoundationStory.appearances =>
          'All nine appearance roles × three attention levels.',
        SelectableButtonFoundationStory.interactive =>
          'Live controls (Storybook argTypes).',
        SelectableButtonFoundationStory.states =>
          'Disabled and loading states.',
        SelectableButtonFoundationStory.surfaceContext =>
          'default / minimal / subtle / moderate / bold / elevated.',
        SelectableButtonFoundationStory.realWorldLike =>
          'Controlled like toggle with heart icon.',
        SelectableButtonFoundationStory.fullWidth =>
          'fullWidth across attention levels.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        SelectableButtonFoundationStory.docs =>
          buildSelectableButtonDocsMerged(context),
        SelectableButtonFoundationStory.defaultStory =>
          buildSelectableButtonDefaultPreview(context),
        SelectableButtonFoundationStory.focusState =>
          buildSelectableButtonFocusStateSection(context),
        SelectableButtonFoundationStory.attentionLevels =>
          buildSelectableButtonAttentionLevelsSection(context),
        SelectableButtonFoundationStory.selectedUnselected =>
          buildSelectableButtonSelectedUnselectedSection(context),
        SelectableButtonFoundationStory.sizes =>
          buildSelectableButtonSizesSection(context),
        SelectableButtonFoundationStory.containedMode =>
          buildSelectableButtonContainedModeSection(context),
        SelectableButtonFoundationStory.condensed =>
          buildSelectableButtonCondensedSection(context),
        SelectableButtonFoundationStory.withSlots =>
          buildSelectableButtonWithSlotsSection(context),
        SelectableButtonFoundationStory.appearances =>
          buildSelectableButtonAppearancesSection(context),
        SelectableButtonFoundationStory.interactive =>
          const SelectableButtonDefaultStoryPage(),
        SelectableButtonFoundationStory.states =>
          buildSelectableButtonStatesSection(context),
        SelectableButtonFoundationStory.surfaceContext =>
          buildSelectableButtonSurfaceContextSection(context),
        SelectableButtonFoundationStory.realWorldLike =>
          buildSelectableButtonRealWorldSection(context),
        SelectableButtonFoundationStory.fullWidth =>
          buildSelectableButtonFullWidthSection(context),
      };
}

Widget buildSelectableButtonDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kSelectableButtonStoryNavOrder)
        if (story != SelectableButtonFoundationStory.docs &&
            story != SelectableButtonFoundationStory.defaultStory &&
            story != SelectableButtonFoundationStory.interactive)
          Padding(
            padding: const EdgeInsets.only(bottom: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  story.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 8),
                Text(story.description,
                    style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 16),
                story.buildSection(context),
              ],
            ),
          ),
    ],
  );
}
