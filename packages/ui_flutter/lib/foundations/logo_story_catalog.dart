import 'package:flutter/material.dart';

import 'logo_showcase.dart';

enum LogoFoundationStory {
  docs,
  defaultStory,
  variants,
  sizes,
  contentSources,
  surfaceContext,
  imageFallback,
  interactive,
  themes,
}

const List<LogoFoundationStory> kLogoStoryNavOrder = [
  LogoFoundationStory.docs,
  LogoFoundationStory.defaultStory,
  LogoFoundationStory.variants,
  LogoFoundationStory.sizes,
  LogoFoundationStory.contentSources,
  LogoFoundationStory.surfaceContext,
  LogoFoundationStory.imageFallback,
  LogoFoundationStory.interactive,
  LogoFoundationStory.themes,
];

extension LogoFoundationStoryMeta on LogoFoundationStory {
  String get sidebarTitle => switch (this) {
        LogoFoundationStory.docs => 'Docs',
        LogoFoundationStory.defaultStory => 'Default',
        LogoFoundationStory.variants => 'Variants',
        LogoFoundationStory.sizes => 'Sizes',
        LogoFoundationStory.contentSources => 'Content Sources',
        LogoFoundationStory.surfaceContext => 'Surface Context',
        LogoFoundationStory.imageFallback => 'Image Fallback',
        LogoFoundationStory.interactive => 'Interactive',
        LogoFoundationStory.themes => 'Themes',
      };

  String get title => sidebarTitle;

  String get description => switch (this) {
        LogoFoundationStory.docs =>
          'Logo component overview — React Storybook parity.',
        LogoFoundationStory.defaultStory =>
          'Brand logo from Convex when available.',
        LogoFoundationStory.variants => 'Mark vs full wordmark container.',
        LogoFoundationStory.sizes => 'XS–XL presets plus custom pixel size.',
        LogoFoundationStory.contentSources =>
          'children, svgContent, and src modes.',
        LogoFoundationStory.surfaceContext => 'Logo on all surface modes.',
        LogoFoundationStory.imageFallback =>
          'Broken src and empty content fallbacks.',
        LogoFoundationStory.interactive => 'Tappable logo with focus ring.',
        LogoFoundationStory.themes => 'All sizes on default and bold surfaces.',
      };

  Widget Function(BuildContext) get buildSection => switch (this) {
        LogoFoundationStory.docs => (_) => const SizedBox.shrink(),
        LogoFoundationStory.defaultStory => logoDefaultSection,
        LogoFoundationStory.variants => logoVariantsSection,
        LogoFoundationStory.sizes => logoSizesSection,
        LogoFoundationStory.contentSources => logoContentSourcesSection,
        LogoFoundationStory.surfaceContext => logoSurfaceContextSection,
        LogoFoundationStory.imageFallback => logoImageFallbackSection,
        LogoFoundationStory.interactive => logoInteractiveSection,
        LogoFoundationStory.themes => logoThemesSection,
      };
}
