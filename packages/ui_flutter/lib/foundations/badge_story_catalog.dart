import 'package:flutter/material.dart';

import 'badge_default_story_page.dart';
import 'badge_showcase.dart';

enum BadgeFoundationStory {
  docs,
  defaultStory,
  variants,
  sizes,
  withSlots,
  sizesWithSlots,
  appearances,
  edgeCases,
  interactive,
  responsive,
  themes,
  slotAdaptation,
  insideBoldSurface,
  insideSubtleSurface,
  surfaceContext,
  figmaSlotMatrix,
}

const List<BadgeFoundationStory> kBadgeStoryNavOrder = [
  BadgeFoundationStory.docs,
  BadgeFoundationStory.defaultStory,
  BadgeFoundationStory.variants,
  BadgeFoundationStory.sizes,
  BadgeFoundationStory.withSlots,
  BadgeFoundationStory.sizesWithSlots,
  BadgeFoundationStory.appearances,
  BadgeFoundationStory.edgeCases,
  BadgeFoundationStory.interactive,
  BadgeFoundationStory.responsive,
  BadgeFoundationStory.themes,
  BadgeFoundationStory.slotAdaptation,
  BadgeFoundationStory.insideBoldSurface,
  BadgeFoundationStory.insideSubtleSurface,
  BadgeFoundationStory.surfaceContext,
  BadgeFoundationStory.figmaSlotMatrix,
];

extension BadgeFoundationStoryMeta on BadgeFoundationStory {
  String get title => switch (this) {
        BadgeFoundationStory.docs => 'Docs',
        BadgeFoundationStory.defaultStory => 'Default',
        BadgeFoundationStory.variants => 'Variants',
        BadgeFoundationStory.sizes => 'Sizes',
        BadgeFoundationStory.withSlots => 'With Slots',
        BadgeFoundationStory.sizesWithSlots => 'Sizes with Slots',
        BadgeFoundationStory.appearances => 'Appearances',
        BadgeFoundationStory.edgeCases => 'Label Overflow & Appearance',
        BadgeFoundationStory.interactive => 'Interactive',
        BadgeFoundationStory.responsive => 'Responsive',
        BadgeFoundationStory.themes => 'Themes',
        BadgeFoundationStory.slotAdaptation => 'Slot Adaptation',
        BadgeFoundationStory.insideBoldSurface => 'Surface Context / Bold',
        BadgeFoundationStory.insideSubtleSurface => 'Surface Context / Subtle',
        BadgeFoundationStory.surfaceContext => 'Surface Context / All Modes',
        BadgeFoundationStory.figmaSlotMatrix => 'Figma Slot Matrix',
      };

  String get description => switch (this) {
        BadgeFoundationStory.docs =>
          'Non-interactive display component for status and categorization.',
        BadgeFoundationStory.defaultStory =>
          'High attention, size M — Controls panel on Interactive.',
        BadgeFoundationStory.variants =>
          'High / medium / low attention levels.',
        BadgeFoundationStory.sizes => 'XS through XL.',
        BadgeFoundationStory.withSlots =>
          'Start/end slots: Icon, Avatar, CounterBadge, IndicatorBadge.',
        BadgeFoundationStory.sizesWithSlots => 'All sizes × slot combinations.',
        BadgeFoundationStory.appearances => 'Multi-accent appearance roles.',
        BadgeFoundationStory.edgeCases =>
          'Long-label ellipsis in narrow layouts; invalid appearance → neutral fallback.',
        BadgeFoundationStory.interactive =>
          'Live Controls (React argTypes parity).',
        BadgeFoundationStory.responsive => 'Size scaling across viewports.',
        BadgeFoundationStory.themes => 'Badges on surface modes.',
        BadgeFoundationStory.slotAdaptation =>
          'Slot auto-sizing per Badge size.',
        BadgeFoundationStory.insideBoldSurface =>
          'Badges nested in bold Surface.',
        BadgeFoundationStory.insideSubtleSurface =>
          'Badges nested in subtle Surface.',
        BadgeFoundationStory.surfaceContext => 'All seven surface modes.',
        BadgeFoundationStory.figmaSlotMatrix => 'Figma slot layout matrix.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        BadgeFoundationStory.docs => buildBadgeDocsMerged(context),
        BadgeFoundationStory.defaultStory => buildBadgeDefaultPreview(context),
        BadgeFoundationStory.variants => buildBadgeVariantsSection(context),
        BadgeFoundationStory.sizes => buildBadgeSizesSection(context),
        BadgeFoundationStory.withSlots => buildBadgeWithSlotsSection(context),
        BadgeFoundationStory.sizesWithSlots =>
          buildBadgeSizesWithSlotsSection(context),
        BadgeFoundationStory.appearances =>
          buildBadgeAppearancesSection(context),
        BadgeFoundationStory.edgeCases => buildBadgeEdgeCasesSection(context),
        BadgeFoundationStory.interactive => const BadgeDefaultStoryPage(),
        BadgeFoundationStory.responsive => buildBadgeResponsiveSection(context),
        BadgeFoundationStory.themes => buildBadgeThemesSection(context),
        BadgeFoundationStory.slotAdaptation =>
          buildBadgeSlotAdaptationSection(context),
        BadgeFoundationStory.insideBoldSurface =>
          buildBadgeInsideBoldSurfaceSection(context),
        BadgeFoundationStory.insideSubtleSurface =>
          buildBadgeInsideSubtleSurfaceSection(context),
        BadgeFoundationStory.surfaceContext =>
          buildBadgeSurfaceContextSection(context),
        BadgeFoundationStory.figmaSlotMatrix =>
          buildBadgeFigmaSlotMatrixSection(context),
      };
}

Widget buildBadgeDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kBadgeStoryNavOrder)
        if (story != BadgeFoundationStory.docs &&
            story != BadgeFoundationStory.defaultStory &&
            story != BadgeFoundationStory.interactive)
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
