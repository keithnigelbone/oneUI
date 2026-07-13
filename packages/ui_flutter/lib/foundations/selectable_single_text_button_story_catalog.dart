import 'package:flutter/material.dart';

import 'selectable_single_text_button_default_story_page.dart';
import 'selectable_single_text_button_showcase.dart';

/// Sidebar order — web `Components/Actions/SelectableSingleTextButton`.
enum SelectableSingleTextButtonFoundationStory {
  docs,
  defaultStory,
  focusState,
  attentionLevels,
  selectedUnselected,
  sizes,
  condensed,
  appearances,
  interactive,
  states,
  surfaceContext,
  realWorldLanguageSelector,
}

const List<SelectableSingleTextButtonFoundationStory>
    kSelectableSingleTextButtonStoryNavOrder = [
  SelectableSingleTextButtonFoundationStory.docs,
  SelectableSingleTextButtonFoundationStory.defaultStory,
  SelectableSingleTextButtonFoundationStory.focusState,
  SelectableSingleTextButtonFoundationStory.attentionLevels,
  SelectableSingleTextButtonFoundationStory.selectedUnselected,
  SelectableSingleTextButtonFoundationStory.sizes,
  SelectableSingleTextButtonFoundationStory.condensed,
  SelectableSingleTextButtonFoundationStory.appearances,
  SelectableSingleTextButtonFoundationStory.interactive,
  SelectableSingleTextButtonFoundationStory.states,
  SelectableSingleTextButtonFoundationStory.surfaceContext,
  SelectableSingleTextButtonFoundationStory.realWorldLanguageSelector,
];

extension SelectableSingleTextButtonFoundationStoryMeta
    on SelectableSingleTextButtonFoundationStory {
  String get title => switch (this) {
        SelectableSingleTextButtonFoundationStory.docs => 'Docs',
        SelectableSingleTextButtonFoundationStory.defaultStory => 'Default',
        SelectableSingleTextButtonFoundationStory.focusState => 'Focus State',
        SelectableSingleTextButtonFoundationStory.attentionLevels =>
          'Attention Levels',
        SelectableSingleTextButtonFoundationStory.selectedUnselected =>
          'Selected / Unselected',
        SelectableSingleTextButtonFoundationStory.sizes => 'Sizes',
        SelectableSingleTextButtonFoundationStory.condensed => 'Condensed',
        SelectableSingleTextButtonFoundationStory.appearances => 'Appearances',
        SelectableSingleTextButtonFoundationStory.interactive => 'Interactive',
        SelectableSingleTextButtonFoundationStory.states => 'States',
        SelectableSingleTextButtonFoundationStory.surfaceContext =>
          'Surface Context',
        SelectableSingleTextButtonFoundationStory.realWorldLanguageSelector =>
          'Real-world: Language Selector',
      };

  String get description => switch (this) {
        SelectableSingleTextButtonFoundationStory.docs =>
          'Circular 1–2 character toggle — merged React autodocs.',
        SelectableSingleTextButtonFoundationStory.defaultStory =>
          'High attention, size M, default selected.',
        SelectableSingleTextButtonFoundationStory.focusState =>
          'FocusStateGrid — idle/focus × selected/unselected per attention.',
        SelectableSingleTextButtonFoundationStory.attentionLevels =>
          'Selected vs unselected across high/medium/low.',
        SelectableSingleTextButtonFoundationStory.selectedUnselected =>
          'Side-by-side selected and unselected per attention.',
        SelectableSingleTextButtonFoundationStory.sizes => 'S / M / L.',
        SelectableSingleTextButtonFoundationStory.condensed =>
          'Condensed reduces diameter; typography unchanged.',
        SelectableSingleTextButtonFoundationStory.appearances =>
          'Nine appearance roles × attention levels.',
        SelectableSingleTextButtonFoundationStory.interactive =>
          'Live controls (Storybook argTypes).',
        SelectableSingleTextButtonFoundationStory.states =>
          'Disabled and loading.',
        SelectableSingleTextButtonFoundationStory.surfaceContext =>
          'Surface modes with context-aware tokens.',
        SelectableSingleTextButtonFoundationStory.realWorldLanguageSelector =>
          'Mutually exclusive language code toggles.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        SelectableSingleTextButtonFoundationStory.docs =>
          buildSelectableSingleTextButtonDocsMerged(context),
        SelectableSingleTextButtonFoundationStory.defaultStory =>
          buildSelectableSingleTextButtonDefaultPreview(context),
        SelectableSingleTextButtonFoundationStory.focusState =>
          buildSelectableSingleTextButtonFocusStateSection(context),
        SelectableSingleTextButtonFoundationStory.attentionLevels =>
          buildSelectableSingleTextButtonAttentionLevelsSection(context),
        SelectableSingleTextButtonFoundationStory.selectedUnselected =>
          buildSelectableSingleTextButtonSelectedUnselectedSection(context),
        SelectableSingleTextButtonFoundationStory.sizes =>
          buildSelectableSingleTextButtonSizesSection(context),
        SelectableSingleTextButtonFoundationStory.condensed =>
          buildSelectableSingleTextButtonCondensedSection(context),
        SelectableSingleTextButtonFoundationStory.appearances =>
          buildSelectableSingleTextButtonAppearancesSection(context),
        SelectableSingleTextButtonFoundationStory.interactive =>
          const SelectableSingleTextButtonDefaultStoryPage(),
        SelectableSingleTextButtonFoundationStory.states =>
          buildSelectableSingleTextButtonStatesSection(context),
        SelectableSingleTextButtonFoundationStory.surfaceContext =>
          buildSelectableSingleTextButtonSurfaceContextSection(context),
        SelectableSingleTextButtonFoundationStory.realWorldLanguageSelector =>
          buildSelectableSingleTextButtonLanguageSelectorSection(context),
      };
}

Widget buildSelectableSingleTextButtonDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kSelectableSingleTextButtonStoryNavOrder)
        if (story != SelectableSingleTextButtonFoundationStory.docs &&
            story != SelectableSingleTextButtonFoundationStory.defaultStory &&
            story != SelectableSingleTextButtonFoundationStory.interactive)
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
                Text(story.description),
                const SizedBox(height: 16),
                story.buildSection(context),
              ],
            ),
          ),
    ],
  );
}
