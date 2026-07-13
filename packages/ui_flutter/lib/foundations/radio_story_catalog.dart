import 'package:flutter/material.dart';

import 'radio_default_story_page.dart';
import 'radio_interactive_story_page.dart';
import 'radio_motion_story_page.dart';
import 'radio_showcase.dart';

enum RadioFoundationStory {
  docs,
  defaultStory,
  sizes,
  states,
  focusState,
  appearances,
  accents,
  surfaceContext,
  themes,
  withLabel,
  interactive,
  motion,
  responsive,
  readOnly,
}

/// Matches React Storybook `Radio.stories.tsx` export order.
const List<RadioFoundationStory> kRadioStoryNavOrder = [
  RadioFoundationStory.docs,
  RadioFoundationStory.defaultStory,
  RadioFoundationStory.sizes,
  RadioFoundationStory.states,
  RadioFoundationStory.focusState,
  RadioFoundationStory.appearances,
  RadioFoundationStory.accents,
  RadioFoundationStory.surfaceContext,
  RadioFoundationStory.themes,
  RadioFoundationStory.withLabel,
  RadioFoundationStory.interactive,
  RadioFoundationStory.motion,
  RadioFoundationStory.responsive,
  RadioFoundationStory.readOnly,
];

extension RadioFoundationStoryMeta on RadioFoundationStory {
  String get title => switch (this) {
        RadioFoundationStory.docs => 'Docs',
        RadioFoundationStory.defaultStory => 'Default',
        RadioFoundationStory.sizes => 'Sizes',
        RadioFoundationStory.states => 'States',
        RadioFoundationStory.focusState => 'Focus State',
        RadioFoundationStory.appearances => 'Appearances',
        RadioFoundationStory.accents => 'Appearance (fill roles)',
        RadioFoundationStory.surfaceContext => 'Surface Context',
        RadioFoundationStory.themes => 'Themes',
        RadioFoundationStory.withLabel => 'With Label',
        RadioFoundationStory.interactive => 'Interactive',
        RadioFoundationStory.motion => 'Motion',
        RadioFoundationStory.responsive => 'Responsive',
        RadioFoundationStory.readOnly => 'Read Only',
      };

  String get description => switch (this) {
        RadioFoundationStory.docs =>
          'Single-select control with multi-accent appearance roles and surface context.',
        RadioFoundationStory.defaultStory =>
          'Default M, neutral — argTypes-style controls (size, appearance, checked, disabled, readOnly).',
        RadioFoundationStory.sizes => 'S / M / L × unchecked and checked.',
        RadioFoundationStory.states =>
          'Unchecked, checked, disabled, and read-only.',
        RadioFoundationStory.focusState =>
          'Informative focus halo via forceFocusRing (web data-force-state).',
        RadioFoundationStory.appearances =>
          'Configured appearance roles on the brand.',
        RadioFoundationStory.accents =>
          'Primary, secondary, sparkle — each sets border and checked fill (subset of Appearances).',
        RadioFoundationStory.surfaceContext =>
          'Checked and unchecked on secondary Surface modes.',
        RadioFoundationStory.themes =>
          'Surface modes with secondary-tinted fills.',
        RadioFoundationStory.withLabel => 'Label length examples in one group.',
        RadioFoundationStory.interactive => 'Two-option group — tap to select.',
        RadioFoundationStory.motion =>
          'Tap scale + subtle-motion toggle (reduced motion).',
        RadioFoundationStory.responsive =>
          'S / M / L groups for viewport testing.',
        RadioFoundationStory.readOnly => 'Read-only at all sizes.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        RadioFoundationStory.docs => buildRadioDocsMerged(context),
        RadioFoundationStory.defaultStory => buildRadioDefaultPreview(context),
        RadioFoundationStory.sizes => buildRadioSizesSection(context),
        RadioFoundationStory.states => buildRadioStatesSection(context),
        RadioFoundationStory.focusState => buildRadioFocusStateSection(context),
        RadioFoundationStory.appearances =>
          buildRadioAppearancesSection(context),
        RadioFoundationStory.accents => buildRadioAccentsSection(context),
        RadioFoundationStory.surfaceContext =>
          buildRadioSurfaceContextSection(context),
        RadioFoundationStory.themes => buildRadioThemesSection(context),
        RadioFoundationStory.withLabel => buildRadioWithLabelSection(context),
        RadioFoundationStory.interactive => const RadioInteractiveStoryPage(),
        RadioFoundationStory.motion => buildRadioMotionPreview(context),
        RadioFoundationStory.responsive => buildRadioResponsiveSection(context),
        RadioFoundationStory.readOnly => buildRadioReadOnlySection(context),
      };
}

Widget buildRadioDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kRadioStoryNavOrder)
        if (story != RadioFoundationStory.docs &&
            story != RadioFoundationStory.defaultStory &&
            story != RadioFoundationStory.interactive &&
            story != RadioFoundationStory.motion)
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
                    style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 16),
                story.buildSection(context),
              ],
            ),
          ),
    ],
  );
}
