import 'package:flutter/material.dart';

import 'single_text_button_default_story_page.dart';
import 'single_text_button_showcase.dart';

/// Sidebar order — web `Components/Actions/SingleTextButton`.
enum SingleTextButtonFoundationStory {
  docs,
  defaultStory,
  attentionLevels,
  sizes,
  condensed,
  appearances,
  states,
  surfaceContext,
  interactive,
  realWorldInitialsRow,
}

const List<SingleTextButtonFoundationStory> kSingleTextButtonStoryNavOrder = [
  SingleTextButtonFoundationStory.docs,
  SingleTextButtonFoundationStory.defaultStory,
  SingleTextButtonFoundationStory.attentionLevels,
  SingleTextButtonFoundationStory.sizes,
  SingleTextButtonFoundationStory.condensed,
  SingleTextButtonFoundationStory.appearances,
  SingleTextButtonFoundationStory.states,
  SingleTextButtonFoundationStory.surfaceContext,
  SingleTextButtonFoundationStory.interactive,
  SingleTextButtonFoundationStory.realWorldInitialsRow,
];

extension SingleTextButtonFoundationStoryMeta on SingleTextButtonFoundationStory {
  String get title => switch (this) {
        SingleTextButtonFoundationStory.docs => 'Docs',
        SingleTextButtonFoundationStory.defaultStory => 'Default',
        SingleTextButtonFoundationStory.attentionLevels => 'Attention Levels',
        SingleTextButtonFoundationStory.sizes => 'Sizes',
        SingleTextButtonFoundationStory.condensed => 'Condensed',
        SingleTextButtonFoundationStory.appearances => 'Appearances',
        SingleTextButtonFoundationStory.states => 'States',
        SingleTextButtonFoundationStory.surfaceContext => 'Surface Context',
        SingleTextButtonFoundationStory.interactive => 'Interactive',
        SingleTextButtonFoundationStory.realWorldInitialsRow =>
          'Real-world: Initials Row',
      };

  String get description => switch (this) {
        SingleTextButtonFoundationStory.docs =>
          'Merged documentation — all SingleTextButton stories (web autodocs parity).',
        SingleTextButtonFoundationStory.defaultStory =>
          'Centered preview — High attention, size M, primary appearance.',
        SingleTextButtonFoundationStory.attentionLevels =>
          'High / Medium / Low — bold, subtle, ghost.',
        SingleTextButtonFoundationStory.sizes =>
          'S / M / L at each attention level.',
        SingleTextButtonFoundationStory.condensed =>
          'Normal vs condensed at each size.',
        SingleTextButtonFoundationStory.appearances =>
          'Eleven colour roles × three attention levels.',
        SingleTextButtonFoundationStory.states => 'Disabled and loading.',
        SingleTextButtonFoundationStory.surfaceContext =>
          'Attention levels inside each [OneUiSurface] mode.',
        SingleTextButtonFoundationStory.interactive =>
          'Controls panel (attention, size, appearance, states).',
        SingleTextButtonFoundationStory.realWorldInitialsRow =>
          'Avatar-style initials row.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        SingleTextButtonFoundationStory.docs =>
          buildSingleTextButtonDocsMerged(context),
        SingleTextButtonFoundationStory.defaultStory =>
          buildSingleTextButtonDefaultPreview(context),
        SingleTextButtonFoundationStory.attentionLevels =>
          buildSingleTextButtonAttentionLevelsSection(context),
        SingleTextButtonFoundationStory.sizes =>
          buildSingleTextButtonSizesSection(context),
        SingleTextButtonFoundationStory.condensed =>
          buildSingleTextButtonCondensedSection(context),
        SingleTextButtonFoundationStory.appearances =>
          buildSingleTextButtonAppearancesSection(context),
        SingleTextButtonFoundationStory.states =>
          buildSingleTextButtonStatesSection(context),
        SingleTextButtonFoundationStory.surfaceContext =>
          buildSingleTextButtonSurfaceContextSection(context),
        SingleTextButtonFoundationStory.interactive =>
          const SingleTextButtonDefaultStoryPage(),
        SingleTextButtonFoundationStory.realWorldInitialsRow =>
          buildSingleTextButtonRealWorldInitialsRowSection(context),
      };
}

Widget buildSingleTextButtonDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kSingleTextButtonStoryNavOrder)
        if (story != SingleTextButtonFoundationStory.docs &&
            story != SingleTextButtonFoundationStory.defaultStory &&
            story != SingleTextButtonFoundationStory.interactive)
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
                Text(
                  story.description,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
                const SizedBox(height: 16),
                story.buildSection(context),
              ],
            ),
          ),
    ],
  );
}
