import 'package:flutter/material.dart';

import 'avatar_default_story_page.dart';
import 'avatar_showcase.dart';

enum AvatarFoundationStory {
  docs,
  defaultStory,
  variants,
  attentionLevels,
  sizes,
  appearances,
  themes,
  surfaceContext,
  states,
  imageFallback,
  withIcons,
  density,
  interactive,
  responsive,
}

const List<AvatarFoundationStory> kAvatarStoryNavOrder = [
  AvatarFoundationStory.docs,
  AvatarFoundationStory.defaultStory,
  AvatarFoundationStory.variants,
  AvatarFoundationStory.attentionLevels,
  AvatarFoundationStory.sizes,
  AvatarFoundationStory.appearances,
  AvatarFoundationStory.themes,
  AvatarFoundationStory.surfaceContext,
  AvatarFoundationStory.states,
  AvatarFoundationStory.imageFallback,
  AvatarFoundationStory.withIcons,
  AvatarFoundationStory.density,
  AvatarFoundationStory.interactive,
  AvatarFoundationStory.responsive,
];

extension AvatarFoundationStoryMeta on AvatarFoundationStory {
  String get title => switch (this) {
        AvatarFoundationStory.docs => 'Docs',
        AvatarFoundationStory.defaultStory => 'Default',
        AvatarFoundationStory.variants => 'Variants',
        AvatarFoundationStory.attentionLevels => 'Attention Levels',
        AvatarFoundationStory.sizes => 'Sizes',
        AvatarFoundationStory.appearances => 'Appearances',
        AvatarFoundationStory.themes => 'Themes',
        AvatarFoundationStory.surfaceContext => 'Surface Context',
        AvatarFoundationStory.states => 'States',
        AvatarFoundationStory.imageFallback => 'Image Fallback',
        AvatarFoundationStory.withIcons => 'With Icons',
        AvatarFoundationStory.density => 'Density',
        AvatarFoundationStory.interactive => 'Interactive',
        AvatarFoundationStory.responsive => 'Responsive',
      };

  String get description => switch (this) {
        AvatarFoundationStory.docs =>
          'Merged documentation — web Avatar autodocs parity.',
        AvatarFoundationStory.defaultStory =>
          'Image content, size M, high attention (toolbar controls on Interactive).',
        AvatarFoundationStory.variants =>
          'Image, icon, and text (initials) modes.',
        AvatarFoundationStory.attentionLevels =>
          'High / medium / low × image, icon, and text rows.',
        AvatarFoundationStory.sizes =>
          '2XS through 2XL plus custom — image, icon, and text rows.',
        AvatarFoundationStory.appearances =>
          'Colour roles × attention × icon/text.',
        AvatarFoundationStory.themes =>
          'Avatars on default/minimal/subtle/elevated surfaces.',
        AvatarFoundationStory.surfaceContext =>
          'All seven surface modes with mixed content.',
        AvatarFoundationStory.states => 'Enabled and disabled at 2XL.',
        AvatarFoundationStory.imageFallback =>
          'Valid image, broken URL → default icon, and custom fallback slot.',
        AvatarFoundationStory.withIcons =>
          'Person, star, and check icons (primary appearance, currentColor).',
        AvatarFoundationStory.density =>
          'Compact / default / open — icon avatars at s, m, l, xl per column.',
        AvatarFoundationStory.interactive =>
          'Live Controls panel (content, src, alt, size, attention, appearance).',
        AvatarFoundationStory.responsive =>
          'S, M, L rows — image, icon, and text per row (viewport token scaling).',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        AvatarFoundationStory.docs => buildAvatarDocsMerged(context),
        AvatarFoundationStory.defaultStory =>
          buildAvatarDefaultPreview(context),
        AvatarFoundationStory.variants => buildAvatarVariantsSection(context),
        AvatarFoundationStory.attentionLevels =>
          buildAvatarAttentionLevelsSection(context),
        AvatarFoundationStory.sizes => buildAvatarSizesSection(context),
        AvatarFoundationStory.appearances =>
          buildAvatarAppearancesSection(context),
        AvatarFoundationStory.themes => buildAvatarThemesSection(context),
        AvatarFoundationStory.surfaceContext =>
          buildAvatarSurfaceContextSection(context),
        AvatarFoundationStory.states => buildAvatarStatesSection(context),
        AvatarFoundationStory.imageFallback =>
          buildAvatarImageFallbackSection(context),
        AvatarFoundationStory.withIcons => buildAvatarWithIconsSection(context),
        AvatarFoundationStory.density => buildAvatarDensitySection(context),
        AvatarFoundationStory.interactive => const AvatarDefaultStoryPage(),
        AvatarFoundationStory.responsive =>
          buildAvatarResponsiveSection(context),
      };
}

Widget buildAvatarDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kAvatarStoryNavOrder)
        if (story != AvatarFoundationStory.docs &&
            story != AvatarFoundationStory.defaultStory &&
            story != AvatarFoundationStory.interactive)
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
