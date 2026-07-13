import 'package:flutter/material.dart';

import 'chip_group_default_story_page.dart';
import 'chip_group_showcase.dart';

enum ChipGroupFoundationStory {
  docs,
  defaultStory,
  variants,
  sizes,
  states,
  multiSelect,
  interactive,
  responsive,
  surfaceContext,
}

const List<ChipGroupFoundationStory> kChipGroupStoryNavOrder = [
  ChipGroupFoundationStory.docs,
  ChipGroupFoundationStory.defaultStory,
  ChipGroupFoundationStory.variants,
  ChipGroupFoundationStory.sizes,
  ChipGroupFoundationStory.states,
  ChipGroupFoundationStory.multiSelect,
  ChipGroupFoundationStory.interactive,
  ChipGroupFoundationStory.responsive,
  ChipGroupFoundationStory.surfaceContext,
];

extension ChipGroupFoundationStoryMeta on ChipGroupFoundationStory {
  String get title => switch (this) {
        ChipGroupFoundationStory.docs => 'Docs',
        ChipGroupFoundationStory.defaultStory => 'Default',
        ChipGroupFoundationStory.variants => 'Variants',
        ChipGroupFoundationStory.sizes => 'Sizes',
        ChipGroupFoundationStory.states => 'States',
        ChipGroupFoundationStory.multiSelect => 'Multi Select',
        ChipGroupFoundationStory.interactive => 'Interactive',
        ChipGroupFoundationStory.responsive => 'Responsive',
        ChipGroupFoundationStory.surfaceContext => 'Surface Context',
      };

  String get description => switch (this) {
        ChipGroupFoundationStory.docs =>
          'Groups Chips with shared selection, layout, and propagated defaults.',
        ChipGroupFoundationStory.defaultStory =>
          'Horizontal filter row — size M, five categories.',
        ChipGroupFoundationStory.variants =>
          'Ghost / subtle / bold propagated to all chips.',
        ChipGroupFoundationStory.sizes => 'S / M / L propagated to children.',
        ChipGroupFoundationStory.states =>
          'Disabled group, required selection, per-chip disabled.',
        ChipGroupFoundationStory.multiSelect =>
          'Multiple selection with live value caption.',
        ChipGroupFoundationStory.interactive =>
          'maxSelections=2 — third chip cannot be added.',
        ChipGroupFoundationStory.responsive =>
          'Wrap vs horizontal scroll (wrap=false).',
        ChipGroupFoundationStory.surfaceContext =>
          'Multi-select on secondary Surface modes.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        ChipGroupFoundationStory.docs => buildChipGroupDocsMerged(context),
        ChipGroupFoundationStory.defaultStory =>
          buildChipGroupDefaultPreview(context),
        ChipGroupFoundationStory.variants =>
          buildChipGroupVariantsSection(context),
        ChipGroupFoundationStory.sizes => buildChipGroupSizesSection(context),
        ChipGroupFoundationStory.states => buildChipGroupStatesSection(context),
        ChipGroupFoundationStory.multiSelect =>
          buildChipGroupMultiSelectSection(context),
        ChipGroupFoundationStory.interactive =>
          buildChipGroupInteractiveSection(context),
        ChipGroupFoundationStory.responsive =>
          buildChipGroupResponsiveSection(context),
        ChipGroupFoundationStory.surfaceContext =>
          buildChipGroupSurfaceContextSection(context),
      };
}

Widget buildChipGroupDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kChipGroupStoryNavOrder)
        if (story != ChipGroupFoundationStory.docs &&
            story != ChipGroupFoundationStory.defaultStory)
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
