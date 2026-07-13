import 'package:flutter/material.dart';

import 'chip_default_story_page.dart';
import 'chip_showcase.dart';

enum ChipFoundationStory {
  docs,
  defaultStory,
  attentionLevels,
  sizes,
  states,
  focusState,
  withSlots,
  interactive,
  appearances,
  surfaceContext,
  motion,
}

const List<ChipFoundationStory> kChipStoryNavOrder = [
  ChipFoundationStory.docs,
  ChipFoundationStory.defaultStory,
  ChipFoundationStory.attentionLevels,
  ChipFoundationStory.sizes,
  ChipFoundationStory.states,
  ChipFoundationStory.focusState,
  ChipFoundationStory.withSlots,
  ChipFoundationStory.interactive,
  ChipFoundationStory.appearances,
  ChipFoundationStory.surfaceContext,
  ChipFoundationStory.motion,
];

extension ChipFoundationStoryMeta on ChipFoundationStory {
  String get title => switch (this) {
        ChipFoundationStory.docs => 'Docs',
        ChipFoundationStory.defaultStory => 'Default',
        ChipFoundationStory.attentionLevels => 'Attention Levels',
        ChipFoundationStory.sizes => 'Sizes',
        ChipFoundationStory.states => 'States',
        ChipFoundationStory.focusState => 'Focus State',
        ChipFoundationStory.withSlots => 'With Slots',
        ChipFoundationStory.interactive => 'Interactive',
        ChipFoundationStory.appearances => 'Appearances',
        ChipFoundationStory.surfaceContext => 'Surface Context',
        ChipFoundationStory.motion => 'Motion',
      };

  String get description => switch (this) {
        ChipFoundationStory.docs =>
          'Toggleable pill for filtering and selection — Base UI Toggle parity.',
        ChipFoundationStory.defaultStory =>
          'High attention, size M — Controls on Interactive.',
        ChipFoundationStory.attentionLevels =>
          'High / medium / low × selected.',
        ChipFoundationStory.sizes => 'S / M / L.',
        ChipFoundationStory.states => 'Default, selected, disabled.',
        ChipFoundationStory.focusState =>
          'Idle vs forced focus ring + keyboard traversal (Tab / Enter / Space).',
        ChipFoundationStory.withSlots =>
          'Icon, Avatar, CounterBadge, IndicatorBadge slots.',
        ChipFoundationStory.interactive =>
          'Live controls (Storybook argTypes).',
        ChipFoundationStory.appearances => 'Nine appearance roles.',
        ChipFoundationStory.surfaceContext =>
          'Chips on secondary Surface modes.',
        ChipFoundationStory.motion => 'Tap scale + colour transitions.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        ChipFoundationStory.docs => buildChipDocsMerged(context),
        ChipFoundationStory.defaultStory => buildChipDefaultPreview(context),
        ChipFoundationStory.attentionLevels =>
          buildChipAttentionLevelsSection(context),
        ChipFoundationStory.sizes => buildChipSizesSection(context),
        ChipFoundationStory.states => buildChipStatesSection(context),
        ChipFoundationStory.focusState => buildChipFocusStateSection(context),
        ChipFoundationStory.withSlots => buildChipWithSlotsSection(context),
        ChipFoundationStory.interactive => const ChipDefaultStoryPage(),
        ChipFoundationStory.appearances => buildChipAppearancesSection(context),
        ChipFoundationStory.surfaceContext =>
          buildChipSurfaceContextSection(context),
        ChipFoundationStory.motion => buildChipMotionSection(context),
      };
}

Widget buildChipDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kChipStoryNavOrder)
        if (story != ChipFoundationStory.docs &&
            story != ChipFoundationStory.defaultStory &&
            story != ChipFoundationStory.interactive)
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
