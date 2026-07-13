import 'package:flutter/material.dart';

import 'slider_default_story_page.dart';
import 'slider_interactive_story_page.dart';
import 'slider_showcase.dart';

enum SliderFoundationStory {
  docs,
  defaultStory,
  appearances,
  states,
  types,
  sizes,
  knobStyles,
  knobStates,
  withSteps,
  withSlots,
  figmaMatrix,
  vertical,
  surfaceContext,
  motion,
  interactive,
}

/// Flutter Storybook export order — Figma-first validation sections included.
const List<SliderFoundationStory> kSliderStoryNavOrder = [
  SliderFoundationStory.docs,
  SliderFoundationStory.defaultStory,
  SliderFoundationStory.appearances,
  SliderFoundationStory.states,
  SliderFoundationStory.types,
  SliderFoundationStory.sizes,
  SliderFoundationStory.knobStyles,
  SliderFoundationStory.knobStates,
  SliderFoundationStory.withSteps,
  SliderFoundationStory.withSlots,
  SliderFoundationStory.figmaMatrix,
  SliderFoundationStory.vertical,
  SliderFoundationStory.surfaceContext,
  SliderFoundationStory.motion,
  SliderFoundationStory.interactive,
];

extension SliderFoundationStoryMeta on SliderFoundationStory {
  String get title => switch (this) {
        SliderFoundationStory.docs => 'Docs',
        SliderFoundationStory.defaultStory => 'Default',
        SliderFoundationStory.appearances => 'Appearances',
        SliderFoundationStory.states => 'States',
        SliderFoundationStory.types => 'Types',
        SliderFoundationStory.sizes => 'Sizes',
        SliderFoundationStory.knobStyles => 'Knob Styles',
        SliderFoundationStory.knobStates => 'Knob States',
        SliderFoundationStory.withSteps => 'With Steps',
        SliderFoundationStory.withSlots => 'With Slots',
        SliderFoundationStory.figmaMatrix => 'Figma Matrix',
        SliderFoundationStory.vertical => 'Vertical',
        SliderFoundationStory.surfaceContext => 'Surface Context',
        SliderFoundationStory.motion => 'Motion',
        SliderFoundationStory.interactive => 'Interactive',
      };

  String get description => switch (this) {
        SliderFoundationStory.docs =>
          'Precision range input with multi-accent appearance, knob styles, and surface context.',
        SliderFoundationStory.defaultStory =>
          'Default value 50, step 10 — Controls on Interactive.',
        SliderFoundationStory.appearances =>
          'Figma appearance roles on the active brand (excluding auto).',
        SliderFoundationStory.states =>
          'Default, disabled, and read-only.',
        SliderFoundationStory.types =>
          'Continuous single-thumb vs range dual-thumb.',
        SliderFoundationStory.sizes =>
          'Figma size s/m/l — track thickness and knob diameter per size.',
        SliderFoundationStory.knobStyles =>
          'Outside vs inside knob styles, including range mode.',
        SliderFoundationStory.knobStates =>
          'Idle / hover / focus / pressed rows for both knob styles.',
        SliderFoundationStory.withSteps =>
          'Snapping vs free drag with visible step ticks.',
        SliderFoundationStory.withSlots =>
          'Start/end icon and iconButton slots for continuous and range.',
        SliderFoundationStory.figmaMatrix =>
          'Full Figma grid: size × type × knobStyle × start/end iconButton.',
        SliderFoundationStory.vertical =>
          'Platform extension — vertical orientation (not in Figma API).',
        SliderFoundationStory.surfaceContext =>
          'Secondary appearance on Surface modes.',
        SliderFoundationStory.motion =>
          'Knob scale + tooltip motion with subtle-motion toggle.',
        SliderFoundationStory.interactive =>
          'Single slider — drag to change value.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        SliderFoundationStory.docs => buildSliderDocsMerged(context),
        SliderFoundationStory.defaultStory => const SliderDefaultStoryPage(),
        SliderFoundationStory.appearances =>
          buildSliderAppearancesSection(context),
        SliderFoundationStory.states => buildSliderStatesSection(context),
        SliderFoundationStory.types => buildSliderTypesSection(context),
        SliderFoundationStory.sizes => buildSliderSizesSection(context),
        SliderFoundationStory.knobStyles => buildSliderKnobStylesSection(context),
        SliderFoundationStory.knobStates => buildSliderKnobStatesSection(context),
        SliderFoundationStory.withSteps => buildSliderWithStepsSection(context),
        SliderFoundationStory.withSlots => buildSliderWithSlotsSection(context),
        SliderFoundationStory.figmaMatrix =>
          buildSliderFigmaMatrixSection(context),
        SliderFoundationStory.vertical => buildSliderVerticalSection(context),
        SliderFoundationStory.surfaceContext =>
          buildSliderSurfaceContextSection(context),
        SliderFoundationStory.motion => buildSliderMotionSection(context),
        SliderFoundationStory.interactive => const SliderInteractiveStoryPage(),
      };
}

Widget buildSliderDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kSliderStoryNavOrder)
        if (story != SliderFoundationStory.docs &&
            story != SliderFoundationStory.defaultStory &&
            story != SliderFoundationStory.interactive &&
            story != SliderFoundationStory.motion)
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
