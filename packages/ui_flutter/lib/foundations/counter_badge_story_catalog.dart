import 'package:flutter/material.dart';

import 'counter_badge_default_story_page.dart';
import 'counter_badge_showcase.dart';

enum CounterBadgeFoundationStory {
  docs,
  defaultStory,
  variants,
  sizes,
  maxValue,
  appearances,
  edgeCases,
  interactive,
  responsive,
  motion,
  themes,
}

const List<CounterBadgeFoundationStory> kCounterBadgeStoryNavOrder = [
  CounterBadgeFoundationStory.docs,
  CounterBadgeFoundationStory.defaultStory,
  CounterBadgeFoundationStory.variants,
  CounterBadgeFoundationStory.sizes,
  CounterBadgeFoundationStory.maxValue,
  CounterBadgeFoundationStory.appearances,
  CounterBadgeFoundationStory.edgeCases,
  CounterBadgeFoundationStory.interactive,
  CounterBadgeFoundationStory.responsive,
  CounterBadgeFoundationStory.motion,
  CounterBadgeFoundationStory.themes,
];

extension CounterBadgeFoundationStoryMeta on CounterBadgeFoundationStory {
  String get title => switch (this) {
        CounterBadgeFoundationStory.docs => 'Docs',
        CounterBadgeFoundationStory.defaultStory => 'Default',
        CounterBadgeFoundationStory.variants => 'Variants',
        CounterBadgeFoundationStory.sizes => 'Sizes',
        CounterBadgeFoundationStory.maxValue => 'Max Value',
        CounterBadgeFoundationStory.appearances => 'Appearances',
        CounterBadgeFoundationStory.edgeCases => 'Edge Cases',
        CounterBadgeFoundationStory.interactive => 'Interactive',
        CounterBadgeFoundationStory.responsive => 'Responsive',
        CounterBadgeFoundationStory.motion => 'Motion',
        CounterBadgeFoundationStory.themes => 'Themes',
      };

  String get description => switch (this) {
        CounterBadgeFoundationStory.docs =>
          'Non-interactive numeric count chip — web autodocs parity.',
        CounterBadgeFoundationStory.defaultStory =>
          'Value 5, high attention, size M — Controls on Interactive.',
        CounterBadgeFoundationStory.variants =>
          'High / medium / low attention.',
        CounterBadgeFoundationStory.sizes => 'XS through L.',
        CounterBadgeFoundationStory.maxValue =>
          'Overflow (99+) and custom max.',
        CounterBadgeFoundationStory.appearances =>
          'Nine roles × three attentions.',
        CounterBadgeFoundationStory.edgeCases =>
          'Invalid appearance, hidden zero, variant precedence, auto on Surface.',
        CounterBadgeFoundationStory.interactive => 'Live Controls panel.',
        CounterBadgeFoundationStory.responsive =>
          'All sizes in mobile viewport.',
        CounterBadgeFoundationStory.motion => 'Entry / exit / increment demo.',
        CounterBadgeFoundationStory.themes =>
          'Surface modes × attention levels.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        CounterBadgeFoundationStory.docs =>
          buildCounterBadgeDocsMerged(context),
        CounterBadgeFoundationStory.defaultStory =>
          buildCounterBadgeDefaultPreview(context),
        CounterBadgeFoundationStory.variants =>
          buildCounterBadgeVariantsSection(context),
        CounterBadgeFoundationStory.sizes =>
          buildCounterBadgeSizesSection(context),
        CounterBadgeFoundationStory.maxValue =>
          buildCounterBadgeMaxValueSection(context),
        CounterBadgeFoundationStory.appearances =>
          buildCounterBadgeAppearancesSection(context),
        CounterBadgeFoundationStory.edgeCases =>
          buildCounterBadgeEdgeCasesSection(context),
        CounterBadgeFoundationStory.interactive =>
          const CounterBadgeDefaultStoryPage(),
        CounterBadgeFoundationStory.responsive =>
          buildCounterBadgeResponsiveSection(context),
        CounterBadgeFoundationStory.motion =>
          buildCounterBadgeMotionSection(context),
        CounterBadgeFoundationStory.themes =>
          buildCounterBadgeThemesSection(context),
      };
}

Widget buildCounterBadgeDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kCounterBadgeStoryNavOrder)
        if (story != CounterBadgeFoundationStory.docs &&
            story != CounterBadgeFoundationStory.defaultStory &&
            story != CounterBadgeFoundationStory.interactive)
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
