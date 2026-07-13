import 'package:flutter/material.dart';

import 'touch_slider_default_story_page.dart';
import 'touch_slider_interactive_story_page.dart';
import 'touch_slider_showcase.dart';

enum TouchSliderFoundationStory {
  docs,
  defaultStory,
  progressStyles,
  slotMatrix,
  withSlots,
  appearances,
  states,
  focusState,
  vertical,
  surfaceContext,
  motion,
  interactive,
}

/// Matches React Storybook `TouchSlider.stories.tsx` export order.
const List<TouchSliderFoundationStory> kTouchSliderStoryNavOrder = [
  TouchSliderFoundationStory.docs,
  TouchSliderFoundationStory.defaultStory,
  TouchSliderFoundationStory.progressStyles,
  TouchSliderFoundationStory.slotMatrix,
  TouchSliderFoundationStory.withSlots,
  TouchSliderFoundationStory.appearances,
  TouchSliderFoundationStory.states,
  TouchSliderFoundationStory.focusState,
  TouchSliderFoundationStory.vertical,
  TouchSliderFoundationStory.surfaceContext,
  TouchSliderFoundationStory.motion,
  TouchSliderFoundationStory.interactive,
];

extension TouchSliderFoundationStoryMeta on TouchSliderFoundationStory {
  String get title => switch (this) {
        TouchSliderFoundationStory.docs => 'Docs',
        TouchSliderFoundationStory.defaultStory => 'Default',
        TouchSliderFoundationStory.progressStyles => 'Progress Styles',
        TouchSliderFoundationStory.slotMatrix => 'Slot Position Matrix',
        TouchSliderFoundationStory.withSlots => 'With Icon Slots',
        TouchSliderFoundationStory.appearances => 'Appearances',
        TouchSliderFoundationStory.states => 'States',
        TouchSliderFoundationStory.focusState => 'Focus State',
        TouchSliderFoundationStory.vertical => 'Vertical',
        TouchSliderFoundationStory.surfaceContext => 'Surface Context',
        TouchSliderFoundationStory.motion => 'Motion',
        TouchSliderFoundationStory.interactive => 'Interactive',
      };

  String get description => switch (this) {
        TouchSliderFoundationStory.docs =>
          'Chunky fingertip-friendly slider with progress styles and surface context.',
        TouchSliderFoundationStory.defaultStory =>
          'Default value 50, appearance auto — Controls on Interactive.',
        TouchSliderFoundationStory.progressStyles =>
          'Figma progressStyle: rounded vs sharp at 0 / 50 / 100.',
        TouchSliderFoundationStory.slotMatrix =>
          'Figma matrix — values × orientation × progressStyle with start icon.',
        TouchSliderFoundationStory.withSlots =>
          'Figma start slot: icon vs none.',
        TouchSliderFoundationStory.appearances =>
          'Figma appearance roles on the active brand (excluding auto).',
        TouchSliderFoundationStory.states =>
          'Default, disabled, and read-only.',
        TouchSliderFoundationStory.focusState =>
          'Idle, focus (forceFocusRing), disabled, readOnly.',
        TouchSliderFoundationStory.vertical =>
          'Vertical progress × value, slots, and style combinations.',
        TouchSliderFoundationStory.surfaceContext =>
          'Matched and mismatched surface / slider appearances.',
        TouchSliderFoundationStory.motion =>
          'Fill settle animation with subtle-motion toggle.',
        TouchSliderFoundationStory.interactive =>
          'Single touch slider — drag to change value.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        TouchSliderFoundationStory.docs =>
          buildTouchSliderDocsMerged(context),
        TouchSliderFoundationStory.defaultStory =>
          const TouchSliderDefaultStoryPage(),
        TouchSliderFoundationStory.progressStyles =>
          buildTouchSliderProgressStylesSection(context),
        TouchSliderFoundationStory.slotMatrix =>
          buildTouchSliderSlotMatrixSection(context),
        TouchSliderFoundationStory.withSlots =>
          buildTouchSliderWithSlotsSection(context),
        TouchSliderFoundationStory.appearances =>
          buildTouchSliderAppearancesSection(context),
        TouchSliderFoundationStory.states =>
          buildTouchSliderStatesSection(context),
        TouchSliderFoundationStory.focusState =>
          buildTouchSliderFocusStateSection(context),
        TouchSliderFoundationStory.vertical =>
          buildTouchSliderVerticalSection(context),
        TouchSliderFoundationStory.surfaceContext =>
          buildTouchSliderSurfaceContextSection(context),
        TouchSliderFoundationStory.motion =>
          buildTouchSliderMotionSection(context),
        TouchSliderFoundationStory.interactive =>
          const TouchSliderInteractiveStoryPage(),
      };
}

Widget buildTouchSliderDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kTouchSliderStoryNavOrder)
        if (story != TouchSliderFoundationStory.docs &&
            story != TouchSliderFoundationStory.defaultStory &&
            story != TouchSliderFoundationStory.interactive &&
            story != TouchSliderFoundationStory.motion)
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
