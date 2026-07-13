import 'package:flutter/material.dart';

import 'icon_button_default_story_page.dart';
import 'icon_button_showcase.dart';

/// Sidebar order — web `Components/Actions/IconButton`.
enum IconButtonFoundationStory {
  docs,
  defaultStory,
  attentionLevels,
  sizes,
  condensed,
  states,
  focusState,
  appearances,
  shapeLayouts,
  fullWidth,
  interactive,
  responsive,
  themes,
  surfaceContext,
  density,
  loadingStates,
  motion,
}

const List<IconButtonFoundationStory> kIconButtonStoryNavOrder = [
  IconButtonFoundationStory.docs,
  IconButtonFoundationStory.defaultStory,
  IconButtonFoundationStory.attentionLevels,
  IconButtonFoundationStory.sizes,
  IconButtonFoundationStory.condensed,
  IconButtonFoundationStory.states,
  IconButtonFoundationStory.focusState,
  IconButtonFoundationStory.appearances,
  IconButtonFoundationStory.shapeLayouts,
  IconButtonFoundationStory.fullWidth,
  IconButtonFoundationStory.interactive,
  IconButtonFoundationStory.responsive,
  IconButtonFoundationStory.themes,
  IconButtonFoundationStory.surfaceContext,
  IconButtonFoundationStory.density,
  IconButtonFoundationStory.loadingStates,
  IconButtonFoundationStory.motion,
];

extension IconButtonFoundationStoryMeta on IconButtonFoundationStory {
  String get title => switch (this) {
        IconButtonFoundationStory.docs => 'Docs',
        IconButtonFoundationStory.defaultStory => 'Default',
        IconButtonFoundationStory.attentionLevels => 'Attention Levels',
        IconButtonFoundationStory.sizes => 'Sizes',
        IconButtonFoundationStory.condensed => 'Condensed',
        IconButtonFoundationStory.states => 'States',
        IconButtonFoundationStory.focusState => 'Focus State',
        IconButtonFoundationStory.appearances => 'Appearances',
        IconButtonFoundationStory.shapeLayouts => 'Shape Layouts',
        IconButtonFoundationStory.fullWidth => 'Full Width',
        IconButtonFoundationStory.interactive => 'Interactive',
        IconButtonFoundationStory.responsive => 'Responsive',
        IconButtonFoundationStory.themes => 'Themes',
        IconButtonFoundationStory.surfaceContext => 'Surface Context',
        IconButtonFoundationStory.density => 'Density',
        IconButtonFoundationStory.loadingStates => 'Loading States',
        IconButtonFoundationStory.motion => 'Motion',
      };

  String get description => switch (this) {
        IconButtonFoundationStory.docs =>
          'Merged documentation — all IconButton stories (web autodocs parity).',
        IconButtonFoundationStory.defaultStory =>
          'Centered preview — High attention, size M, primary appearance.',
        IconButtonFoundationStory.attentionLevels =>
          'High / Medium / Low — bold, subtle, ghost.',
        IconButtonFoundationStory.sizes => '2XS through XL spacing tokens.',
        IconButtonFoundationStory.condensed =>
          'Reduced container with same icon size.',
        IconButtonFoundationStory.states => 'Default, disabled, loading.',
        IconButtonFoundationStory.focusState =>
          'Idle vs forced focus ring + keyboard traversal (Tab / Enter / Space).',
        IconButtonFoundationStory.appearances =>
          'Nine colour roles × three attention levels.',
        IconButtonFoundationStory.shapeLayouts => '1:1 square vs 3:2 wide.',
        IconButtonFoundationStory.fullWidth => 'Stretch within 320px column.',
        IconButtonFoundationStory.interactive =>
          'Controls panel (attention, size, appearance, states).',
        IconButtonFoundationStory.responsive =>
          'Toolbar row — Menu, Search, Notifications, Profile.',
        IconButtonFoundationStory.themes =>
          'High / medium / low on surface modes.',
        IconButtonFoundationStory.surfaceContext =>
          'Attention levels inside each [OneUiSurface] mode.',
        IconButtonFoundationStory.density =>
          'Use toolbar density to compare compact/default/open.',
        IconButtonFoundationStory.loadingStates =>
          'Loading spinner across attention and sizes.',
        IconButtonFoundationStory.motion =>
          'Tap scale + colour transition from Convex motion tokens.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        IconButtonFoundationStory.docs => buildIconButtonDocsMerged(context),
        IconButtonFoundationStory.defaultStory =>
          buildIconButtonDefaultPreview(context),
        IconButtonFoundationStory.attentionLevels =>
          buildIconButtonAttentionLevelsSection(context),
        IconButtonFoundationStory.sizes => buildIconButtonSizesSection(context),
        IconButtonFoundationStory.condensed =>
          buildIconButtonCondensedSection(context),
        IconButtonFoundationStory.states =>
          buildIconButtonStatesSection(context),
        IconButtonFoundationStory.focusState =>
          buildIconButtonFocusStateSection(context),
        IconButtonFoundationStory.appearances =>
          buildIconButtonAppearancesSection(context),
        IconButtonFoundationStory.shapeLayouts =>
          buildIconButtonShapeLayoutsSection(context),
        IconButtonFoundationStory.fullWidth =>
          buildIconButtonFullWidthSection(context),
        IconButtonFoundationStory.interactive =>
          const IconButtonDefaultStoryPage(),
        IconButtonFoundationStory.responsive =>
          buildIconButtonResponsiveSection(context),
        IconButtonFoundationStory.themes =>
          buildIconButtonThemesSection(context),
        IconButtonFoundationStory.surfaceContext =>
          buildIconButtonSurfaceContextSection(context),
        IconButtonFoundationStory.density =>
          buildIconButtonDensitySection(context),
        IconButtonFoundationStory.loadingStates =>
          buildIconButtonLoadingStatesSection(context),
        IconButtonFoundationStory.motion =>
          buildIconButtonMotionSection(context),
      };
}

Widget buildIconButtonDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kIconButtonStoryNavOrder)
        if (story != IconButtonFoundationStory.docs &&
            story != IconButtonFoundationStory.defaultStory &&
            story != IconButtonFoundationStory.interactive)
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
