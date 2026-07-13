import 'package:flutter/material.dart';

import 'divider_default_story_page.dart';
import 'divider_interactive_story_page.dart';
import 'divider_showcase.dart';

enum DividerFoundationStory {
  docs,
  defaultStory,
  orientations,
  sizes,
  attentionLevels,
  attentionLevelsWithIcon,
  attentionLevelsWithText,
  withIcon,
  withLabel,
  roundCaps,
  surfaceContext,
  interactive,
  verticalSizes,
  verticalAttentionLevels,
  verticalWithIcon,
  verticalWithLabel,
  verticalInlineUsage,
}

const List<DividerFoundationStory> kDividerStoryNavOrder = [
  DividerFoundationStory.docs,
  DividerFoundationStory.defaultStory,
  DividerFoundationStory.orientations,
  DividerFoundationStory.sizes,
  DividerFoundationStory.attentionLevels,
  DividerFoundationStory.attentionLevelsWithIcon,
  DividerFoundationStory.attentionLevelsWithText,
  DividerFoundationStory.withIcon,
  DividerFoundationStory.withLabel,
  DividerFoundationStory.roundCaps,
  DividerFoundationStory.surfaceContext,
  DividerFoundationStory.interactive,
  DividerFoundationStory.verticalSizes,
  DividerFoundationStory.verticalAttentionLevels,
  DividerFoundationStory.verticalWithIcon,
  DividerFoundationStory.verticalWithLabel,
  DividerFoundationStory.verticalInlineUsage,
];

extension DividerFoundationStoryMeta on DividerFoundationStory {
  String get title => switch (this) {
        DividerFoundationStory.docs => 'Docs',
        DividerFoundationStory.defaultStory => 'Default',
        DividerFoundationStory.orientations => 'Orientations',
        DividerFoundationStory.sizes => 'Sizes',
        DividerFoundationStory.attentionLevels => 'Attention Levels',
        DividerFoundationStory.attentionLevelsWithIcon =>
          'Attention Levels With Icon',
        DividerFoundationStory.attentionLevelsWithText =>
          'Attention Levels With Text',
        DividerFoundationStory.withIcon => 'With Icon',
        DividerFoundationStory.withLabel => 'With Label',
        DividerFoundationStory.roundCaps => 'Round Caps',
        DividerFoundationStory.surfaceContext => 'Surface Context',
        DividerFoundationStory.interactive => 'Interactive',
        DividerFoundationStory.verticalSizes => 'Vertical Sizes',
        DividerFoundationStory.verticalAttentionLevels =>
          'Vertical Attention Levels',
        DividerFoundationStory.verticalWithIcon => 'Vertical With Icon',
        DividerFoundationStory.verticalWithLabel => 'Vertical With Label',
        DividerFoundationStory.verticalInlineUsage => 'Vertical Inline Usage',
      };

  String get description => switch (this) {
        DividerFoundationStory.docs =>
          'Visual separator for content sections — orientation, size, attention, centre content.',
        DividerFoundationStory.defaultStory =>
          'Bare horizontal separator (content=none) — controls on Default story.',
        DividerFoundationStory.orientations =>
          'Horizontal full-width vs vertical inline.',
        DividerFoundationStory.sizes => 'Stroke widths S (hairline), M, L.',
        DividerFoundationStory.attentionLevels =>
          'High / medium / low prominence.',
        DividerFoundationStory.attentionLevelsWithIcon =>
          'Attention drives centre Icon emphasis.',
        DividerFoundationStory.attentionLevelsWithText =>
          'Plain-string centre content auto-styled Label XS Medium.',
        DividerFoundationStory.withIcon =>
          'Icon centre slot — start / center / end align.',
        DividerFoundationStory.withLabel =>
          'Text centre slot — start / center / end align.',
        DividerFoundationStory.roundCaps => 'Sharp vs pill-shaped stroke ends.',
        DividerFoundationStory.surfaceContext =>
          'Divider adapts inside Surface modes (neutral → primary stroke).',
        DividerFoundationStory.interactive =>
          'Separator role smoke check — mirrors React Interactive play function.',
        DividerFoundationStory.verticalSizes =>
          'Vertical S / M / L stroke widths.',
        DividerFoundationStory.verticalAttentionLevels =>
          'Vertical high / medium / low attention.',
        DividerFoundationStory.verticalWithIcon =>
          'Vertical icon centre content with alignment.',
        DividerFoundationStory.verticalWithLabel =>
          'Vertical text centre content with alignment.',
        DividerFoundationStory.verticalInlineUsage =>
          'Breadcrumb-style inline vertical separators.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        DividerFoundationStory.docs => buildDividerDocsMerged(context),
        DividerFoundationStory.defaultStory => const DividerDefaultStoryPage(),
        DividerFoundationStory.orientations =>
          buildDividerOrientationsSection(context),
        DividerFoundationStory.sizes => buildDividerSizesSection(context),
        DividerFoundationStory.attentionLevels =>
          buildDividerAttentionLevelsSection(context),
        DividerFoundationStory.attentionLevelsWithIcon =>
          buildDividerAttentionWithIconSection(context),
        DividerFoundationStory.attentionLevelsWithText =>
          buildDividerAttentionWithTextSection(context),
        DividerFoundationStory.withIcon => buildDividerWithIconSection(context),
        DividerFoundationStory.withLabel =>
          buildDividerWithLabelSection(context),
        DividerFoundationStory.roundCaps =>
          buildDividerRoundCapsSection(context),
        DividerFoundationStory.surfaceContext =>
          buildDividerSurfaceContextSection(context),
        DividerFoundationStory.interactive =>
          const DividerInteractiveStoryPage(),
        DividerFoundationStory.verticalSizes =>
          buildDividerVerticalSizesSection(context),
        DividerFoundationStory.verticalAttentionLevels =>
          buildDividerVerticalAttentionSection(context),
        DividerFoundationStory.verticalWithIcon =>
          buildDividerVerticalWithIconSection(context),
        DividerFoundationStory.verticalWithLabel =>
          buildDividerVerticalWithLabelSection(context),
        DividerFoundationStory.verticalInlineUsage =>
          buildDividerVerticalInlineSection(context),
      };
}

Widget buildDividerDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      buildDividerDefaultPreview(context),
      const SizedBox(height: 32),
      buildDividerSizesSection(context),
      const SizedBox(height: 32),
      buildDividerAttentionLevelsSection(context),
    ],
  );
}
