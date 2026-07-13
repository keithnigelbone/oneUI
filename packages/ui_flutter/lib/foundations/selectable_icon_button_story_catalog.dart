import 'package:flutter/material.dart';

import 'selectable_icon_button_default_story_page.dart';
import 'selectable_icon_button_showcase.dart';

/// Sidebar order — web `Components/Actions/SelectableIconButton`.
enum SelectableIconButtonFoundationStory {
  docs,
  defaultStory,
  focusState,
  attentionLevels,
  selectedUnselected,
  sizes,
  shapes,
  containedUncontained,
  fullWidth,
  condensed,
  appearances,
  interactive,
  states,
  surfaceContext,
  realWorldFavourite,
}

const List<SelectableIconButtonFoundationStory>
    kSelectableIconButtonStoryNavOrder = [
  SelectableIconButtonFoundationStory.docs,
  SelectableIconButtonFoundationStory.defaultStory,
  SelectableIconButtonFoundationStory.focusState,
  SelectableIconButtonFoundationStory.attentionLevels,
  SelectableIconButtonFoundationStory.selectedUnselected,
  SelectableIconButtonFoundationStory.sizes,
  SelectableIconButtonFoundationStory.shapes,
  SelectableIconButtonFoundationStory.containedUncontained,
  SelectableIconButtonFoundationStory.fullWidth,
  SelectableIconButtonFoundationStory.condensed,
  SelectableIconButtonFoundationStory.appearances,
  SelectableIconButtonFoundationStory.interactive,
  SelectableIconButtonFoundationStory.states,
  SelectableIconButtonFoundationStory.surfaceContext,
  SelectableIconButtonFoundationStory.realWorldFavourite,
];

extension SelectableIconButtonFoundationStoryMeta
    on SelectableIconButtonFoundationStory {
  String get title => switch (this) {
        SelectableIconButtonFoundationStory.docs => 'Docs',
        SelectableIconButtonFoundationStory.defaultStory => 'Default',
        SelectableIconButtonFoundationStory.focusState => 'Focus State',
        SelectableIconButtonFoundationStory.attentionLevels =>
          'Attention Levels',
        SelectableIconButtonFoundationStory.selectedUnselected =>
          'Selected / Unselected',
        SelectableIconButtonFoundationStory.sizes => 'Sizes',
        SelectableIconButtonFoundationStory.shapes => 'Shapes (1:1 vs 2:3)',
        SelectableIconButtonFoundationStory.containedUncontained =>
          'Contained vs Uncontained',
        SelectableIconButtonFoundationStory.fullWidth => 'Full Width',
        SelectableIconButtonFoundationStory.condensed => 'Condensed',
        SelectableIconButtonFoundationStory.appearances => 'Appearances',
        SelectableIconButtonFoundationStory.interactive => 'Interactive',
        SelectableIconButtonFoundationStory.states => 'States',
        SelectableIconButtonFoundationStory.surfaceContext =>
          'Surface Context',
        SelectableIconButtonFoundationStory.realWorldFavourite =>
          'Real-world: Favourite Button',
      };

  String get description => switch (this) {
        SelectableIconButtonFoundationStory.docs =>
          'Merged documentation — all SelectableIconButton stories.',
        SelectableIconButtonFoundationStory.defaultStory =>
          'Interactive controls — high attention, size M, default selected.',
        SelectableIconButtonFoundationStory.focusState =>
          'Forced focus ring across attention × selected matrix.',
        SelectableIconButtonFoundationStory.attentionLevels =>
          'Selected vs unselected — attention only affects selected chrome.',
        SelectableIconButtonFoundationStory.selectedUnselected =>
          'Side-by-side selected/unselected per attention level.',
        SelectableIconButtonFoundationStory.sizes =>
          '2XS through XL — selected and unselected pairs.',
        SelectableIconButtonFoundationStory.shapes =>
          'Square 1:1 vs wide 2:3 proportions.',
        SelectableIconButtonFoundationStory.containedUncontained =>
          'Contained chrome vs uncontained icon-only.',
        SelectableIconButtonFoundationStory.fullWidth =>
          'Stretch within fixed-width column.',
        SelectableIconButtonFoundationStory.condensed =>
          'Reduced container with same icon size.',
        SelectableIconButtonFoundationStory.appearances =>
          'Nine colour roles × three attention levels.',
        SelectableIconButtonFoundationStory.interactive =>
          'Toggle like/favourite with play-function parity.',
        SelectableIconButtonFoundationStory.states =>
          'Disabled and loading states.',
        SelectableIconButtonFoundationStory.surfaceContext =>
          'Attention levels inside each [OneUiSurface] mode.',
        SelectableIconButtonFoundationStory.realWorldFavourite =>
          'Controlled bookmark toggle with status label.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        SelectableIconButtonFoundationStory.docs =>
          buildSelectableIconButtonDocsMerged(context),
        SelectableIconButtonFoundationStory.defaultStory =>
          buildSelectableIconButtonDefaultPreview(context),
        SelectableIconButtonFoundationStory.focusState =>
          buildSelectableIconButtonFocusStateSection(context),
        SelectableIconButtonFoundationStory.attentionLevels =>
          buildSelectableIconButtonAttentionLevelsSection(context),
        SelectableIconButtonFoundationStory.selectedUnselected =>
          buildSelectableIconButtonSelectedUnselectedSection(context),
        SelectableIconButtonFoundationStory.sizes =>
          buildSelectableIconButtonSizesSection(context),
        SelectableIconButtonFoundationStory.shapes =>
          buildSelectableIconButtonShapesSection(context),
        SelectableIconButtonFoundationStory.containedUncontained =>
          buildSelectableIconButtonContainedSection(context),
        SelectableIconButtonFoundationStory.fullWidth =>
          buildSelectableIconButtonFullWidthSection(context),
        SelectableIconButtonFoundationStory.condensed =>
          buildSelectableIconButtonCondensedSection(context),
        SelectableIconButtonFoundationStory.appearances =>
          buildSelectableIconButtonAppearancesSection(context),
        SelectableIconButtonFoundationStory.interactive =>
          const SelectableIconButtonDefaultStoryPage(),
        SelectableIconButtonFoundationStory.states =>
          buildSelectableIconButtonStatesSection(context),
        SelectableIconButtonFoundationStory.surfaceContext =>
          buildSelectableIconButtonSurfaceContextSection(context),
        SelectableIconButtonFoundationStory.realWorldFavourite =>
          buildSelectableIconButtonRealWorldFavouriteSection(context),
      };
}

Widget buildSelectableIconButtonDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kSelectableIconButtonStoryNavOrder)
        if (story != SelectableIconButtonFoundationStory.docs &&
            story != SelectableIconButtonFoundationStory.defaultStory &&
            story != SelectableIconButtonFoundationStory.interactive)
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
