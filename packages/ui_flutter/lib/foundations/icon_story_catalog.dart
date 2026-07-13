import 'package:flutter/material.dart';

import 'icon_showcase.dart';

/// Sidebar order — parity with web `Components/Media/Icon` in Storybook.
enum IconFoundationStory {
  docs,
  defaultStory,
  iconProp,
  sizes,
  emphasisLevels,
  appearances,
  withIcons,
  networkIcons,
  surfaceContext,
  inContext,
}

const List<IconFoundationStory> kIconStoryNavOrder = [
  IconFoundationStory.docs,
  IconFoundationStory.defaultStory,
  IconFoundationStory.iconProp,
  IconFoundationStory.sizes,
  IconFoundationStory.emphasisLevels,
  IconFoundationStory.appearances,
  IconFoundationStory.withIcons,
  IconFoundationStory.networkIcons,
  IconFoundationStory.surfaceContext,
  IconFoundationStory.inContext,
];

extension IconFoundationStoryMeta on IconFoundationStory {
  String get title => switch (this) {
        IconFoundationStory.docs => 'Docs',
        IconFoundationStory.defaultStory => 'Default',
        IconFoundationStory.iconProp => 'Icon Prop',
        IconFoundationStory.sizes => 'Sizes',
        IconFoundationStory.emphasisLevels => 'Emphasis Levels',
        IconFoundationStory.appearances => 'Appearances',
        IconFoundationStory.withIcons => 'Jio Semantic Icons',
        IconFoundationStory.networkIcons => 'Remote URL Icons',
        IconFoundationStory.surfaceContext => 'Surface Context',
        IconFoundationStory.inContext => 'In Context',
      };

  String get description => switch (this) {
        IconFoundationStory.docs =>
          'Merged documentation — all Icon stories on one page (web autodocs parity).',
        IconFoundationStory.defaultStory =>
          'Live preview with Controls — semantic name or remote URL in the same `icon` prop.',
        IconFoundationStory.iconProp =>
          'Single `icon` prop: Jio semantic names, `https://` URLs, or custom Widget glyphs.',
        IconFoundationStory.sizes =>
          'All 20 spacing-index sizes (Figma variable modes).',
        IconFoundationStory.emphasisLevels =>
          'high · medium · low · tinted · tintedA11y.',
        IconFoundationStory.appearances =>
          'Eight colour roles × key emphasis levels.',
        IconFoundationStory.withIcons =>
          'Bundled Jio catalog — pass semantic names like `heart`, `search`, `settings`.',
        IconFoundationStory.networkIcons =>
          'CDN SVG/PNG URLs in `icon` — Tabler, Material, Twemoji; brand tinting rules.',
        IconFoundationStory.surfaceContext =>
          'Token remapping inside [OneUiSurface] containers.',
        IconFoundationStory.inContext =>
          'Inline with typography — contextual usage.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        IconFoundationStory.docs => buildIconDocsMerged(context),
        IconFoundationStory.defaultStory => buildIconDefaultPreview(context),
        IconFoundationStory.iconProp => buildIconPropOverviewSection(context),
        IconFoundationStory.sizes => buildIconSizesSection(context),
        IconFoundationStory.emphasisLevels =>
          buildIconEmphasisLevelsSection(context),
        IconFoundationStory.appearances => buildIconAppearancesSection(context),
        IconFoundationStory.withIcons => buildIconWithIconsSection(context),
        IconFoundationStory.networkIcons =>
          buildIconNetworkIconsSection(context),
        IconFoundationStory.surfaceContext =>
          buildIconSurfaceContextSection(context),
        IconFoundationStory.inContext => buildIconInContextSection(context),
      };
}

/// All sections on one scroll view (Docs story).
Widget buildIconDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kIconStoryNavOrder)
        if (story != IconFoundationStory.docs) ...[
          Text(
            story.title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(story.description, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 16),
          story.buildSection(context),
          const SizedBox(height: 32),
        ],
    ],
  );
}
