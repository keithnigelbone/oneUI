import 'package:flutter/material.dart';

import 'image_showcase.dart';

enum ImageFoundationStory {
  docs,
  defaultStory,
  aspectRatios,
  objectFitModes,
  states,
  withFallback,
  interactive,
  responsive,
  cornerRadius,
}

const List<ImageFoundationStory> kImageStoryNavOrder = [
  ImageFoundationStory.docs,
  ImageFoundationStory.defaultStory,
  ImageFoundationStory.aspectRatios,
  ImageFoundationStory.objectFitModes,
  ImageFoundationStory.states,
  ImageFoundationStory.withFallback,
  ImageFoundationStory.interactive,
  ImageFoundationStory.responsive,
  ImageFoundationStory.cornerRadius,
];

extension ImageFoundationStoryMeta on ImageFoundationStory {
  String get title => switch (this) {
        ImageFoundationStory.docs => 'Docs',
        ImageFoundationStory.defaultStory => 'Default',
        ImageFoundationStory.aspectRatios => 'Aspect Ratios',
        ImageFoundationStory.objectFitModes => 'Object Fit Modes',
        ImageFoundationStory.states => 'States',
        ImageFoundationStory.withFallback => 'With Fallback',
        ImageFoundationStory.interactive => 'Interactive',
        ImageFoundationStory.responsive => 'Responsive',
        ImageFoundationStory.cornerRadius => 'Corner Radius',
      };

  String get description => switch (this) {
        ImageFoundationStory.docs =>
          'Image component overview — web Storybook parity.',
        ImageFoundationStory.defaultStory => '16:9 landscape at 320px width.',
        ImageFoundationStory.aspectRatios => 'All twelve aspect ratio presets.',
        ImageFoundationStory.objectFitModes =>
          'Common and extended CSS object-fit keywords (Flutter maps web-only keywords to cover).',
        ImageFoundationStory.states => 'Default, interactive, disabled, error.',
        ImageFoundationStory.withFallback =>
          'Valid, broken, custom, fallbackSrc.',
        ImageFoundationStory.interactive => 'Tappable image with focus ring.',
        ImageFoundationStory.responsive => '100%, 75%, 50% column widths.',
        ImageFoundationStory.cornerRadius =>
          'Shape token scale (`Shape-0-5` … `Shape-4`) at 1:1, 16:9, and 4:3.',
      };

  Widget Function(BuildContext) get buildSection => switch (this) {
        ImageFoundationStory.docs => (_) => const SizedBox.shrink(),
        ImageFoundationStory.defaultStory => (_) => imageDefaultSection(),
        ImageFoundationStory.aspectRatios => (_) => imageAspectRatiosSection(),
        ImageFoundationStory.objectFitModes => (_) => imageObjectFitSection(),
        ImageFoundationStory.states => (_) => imageStatesSection(),
        ImageFoundationStory.withFallback => (_) => imageWithFallbackSection(),
        ImageFoundationStory.interactive => (_) => imageInteractiveSection(),
        ImageFoundationStory.responsive => (_) => imageResponsiveSection(),
        ImageFoundationStory.cornerRadius => (_) => imageCornerRadiusSection(),
      };
}
