import 'package:flutter/material.dart';

import 'checkbox_default_story_page.dart';
import 'checkbox_interactive_story_page.dart';
import 'checkbox_motion_story_page.dart';
import 'checkbox_responsive_story_page.dart';
import 'checkbox_showcase.dart';

enum CheckboxFoundationStory {
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
  density,
  readOnly,
}

/// Matches React Storybook `Checkbox.stories.tsx` export order.
const List<CheckboxFoundationStory> kCheckboxStoryNavOrder = [
  CheckboxFoundationStory.docs,
  CheckboxFoundationStory.defaultStory,
  CheckboxFoundationStory.sizes,
  CheckboxFoundationStory.states,
  CheckboxFoundationStory.focusState,
  CheckboxFoundationStory.appearances,
  CheckboxFoundationStory.accents,
  CheckboxFoundationStory.surfaceContext,
  CheckboxFoundationStory.themes,
  CheckboxFoundationStory.withLabel,
  CheckboxFoundationStory.interactive,
  CheckboxFoundationStory.motion,
  CheckboxFoundationStory.responsive,
  CheckboxFoundationStory.density,
  CheckboxFoundationStory.readOnly,
];

extension CheckboxFoundationStoryMeta on CheckboxFoundationStory {
  String get title => switch (this) {
        CheckboxFoundationStory.docs => 'Docs',
        CheckboxFoundationStory.defaultStory => 'Default',
        CheckboxFoundationStory.sizes => 'Sizes',
        CheckboxFoundationStory.states => 'States',
        CheckboxFoundationStory.focusState => 'Focus State',
        CheckboxFoundationStory.appearances => 'Appearances',
        CheckboxFoundationStory.accents => 'Appearance (fill roles)',
        CheckboxFoundationStory.surfaceContext => 'Surface Context',
        CheckboxFoundationStory.themes => 'Themes',
        CheckboxFoundationStory.withLabel => 'With Label',
        CheckboxFoundationStory.interactive => 'Interactive',
        CheckboxFoundationStory.motion => 'Motion',
        CheckboxFoundationStory.responsive => 'Responsive',
        CheckboxFoundationStory.density => 'Density',
        CheckboxFoundationStory.readOnly => 'Read Only',
      };

  String get description => switch (this) {
        CheckboxFoundationStory.docs =>
          'Multi-state control with multi-accent appearance roles and surface context.',
        CheckboxFoundationStory.defaultStory =>
          'Default M, neutral — argTypes-style controls (size, appearance, checked, indeterminate, disabled, readOnly).',
        CheckboxFoundationStory.sizes =>
          'S / M / L × unchecked, checked, and indeterminate.',
        CheckboxFoundationStory.states =>
          'Unchecked, checked, indeterminate, disabled, and read-only.',
        CheckboxFoundationStory.focusState =>
          'Informative focus halo via forceFocusRing (web data-force-state).',
        CheckboxFoundationStory.appearances =>
          'Configured appearance roles on the brand.',
        CheckboxFoundationStory.accents =>
          'Primary, secondary, sparkle — each sets border and checked fill (subset of Appearances).',
        CheckboxFoundationStory.surfaceContext =>
          'Checked, unchecked, and indeterminate on secondary Surface modes.',
        CheckboxFoundationStory.themes =>
          'Surface modes with secondary-tinted fills.',
        CheckboxFoundationStory.withLabel =>
          'Label length examples with descriptions.',
        CheckboxFoundationStory.interactive =>
          'Single checkbox — tap to toggle.',
        CheckboxFoundationStory.motion =>
          'Tap scale + subtle-motion toggle (reduced motion).',
        CheckboxFoundationStory.responsive =>
          'S / M / L for viewport testing — tap each row independently.',
        CheckboxFoundationStory.density =>
          'Compact / default / open density columns with S / M / L checkboxes.',
        CheckboxFoundationStory.readOnly => 'Read-only at all sizes.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        CheckboxFoundationStory.docs => buildCheckboxDocsMerged(context),
        CheckboxFoundationStory.defaultStory =>
          const CheckboxDefaultStoryPage(),
        CheckboxFoundationStory.sizes => buildCheckboxSizesSection(context),
        CheckboxFoundationStory.states => buildCheckboxStatesSection(context),
        CheckboxFoundationStory.focusState =>
          buildCheckboxFocusStateSection(context),
        CheckboxFoundationStory.appearances =>
          buildCheckboxAppearancesSection(context),
        CheckboxFoundationStory.accents => buildCheckboxAccentsSection(context),
        CheckboxFoundationStory.surfaceContext =>
          buildCheckboxSurfaceContextSection(context),
        CheckboxFoundationStory.themes => buildCheckboxThemesSection(context),
        CheckboxFoundationStory.withLabel =>
          buildCheckboxWithLabelSection(context),
        CheckboxFoundationStory.interactive =>
          const CheckboxInteractiveStoryPage(),
        CheckboxFoundationStory.motion => const CheckboxMotionStoryPage(),
        CheckboxFoundationStory.responsive =>
          const CheckboxResponsiveStoryPage(),
        CheckboxFoundationStory.density => buildCheckboxDensitySection(context),
        CheckboxFoundationStory.readOnly =>
          buildCheckboxReadOnlySection(context),
      };
}

Widget buildCheckboxDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kCheckboxStoryNavOrder)
        if (story != CheckboxFoundationStory.docs &&
            story != CheckboxFoundationStory.defaultStory &&
            story != CheckboxFoundationStory.interactive &&
            story != CheckboxFoundationStory.motion &&
            story != CheckboxFoundationStory.responsive)
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
