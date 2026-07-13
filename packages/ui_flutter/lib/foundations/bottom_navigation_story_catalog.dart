import 'package:flutter/material.dart';

import 'bottom_navigation_default_story_page.dart';
import 'bottom_navigation_interactive_story_page.dart';
import 'bottom_navigation_showcase.dart';

enum BottomNavigationFoundationStory {
  docs,
  defaultStory,
  labelTypes,
  itemCounts,
  states,
  focusState,
  withIcons,
  interactive,
  responsive,
  surfaceModes,
  appearances,
  defaultShowcase,
}

const List<BottomNavigationFoundationStory> kBottomNavigationStoryNavOrder = [
  BottomNavigationFoundationStory.docs,
  BottomNavigationFoundationStory.defaultStory,
  BottomNavigationFoundationStory.labelTypes,
  BottomNavigationFoundationStory.itemCounts,
  BottomNavigationFoundationStory.states,
  BottomNavigationFoundationStory.focusState,
  BottomNavigationFoundationStory.withIcons,
  BottomNavigationFoundationStory.interactive,
  BottomNavigationFoundationStory.responsive,
  BottomNavigationFoundationStory.surfaceModes,
  BottomNavigationFoundationStory.appearances,
  BottomNavigationFoundationStory.defaultShowcase,
];

extension BottomNavigationFoundationStoryMeta
    on BottomNavigationFoundationStory {
  String get title => switch (this) {
        BottomNavigationFoundationStory.docs => 'Docs',
        BottomNavigationFoundationStory.defaultStory => 'Default',
        BottomNavigationFoundationStory.labelTypes => 'Label Types',
        BottomNavigationFoundationStory.itemCounts => 'Item Counts (2–5)',
        BottomNavigationFoundationStory.states => 'States',
        BottomNavigationFoundationStory.focusState => 'Focus State',
        BottomNavigationFoundationStory.withIcons => 'With Icons',
        BottomNavigationFoundationStory.interactive => 'Interactive',
        BottomNavigationFoundationStory.responsive =>
          'Responsive (phone vs tablet)',
        BottomNavigationFoundationStory.surfaceModes => 'Surface Modes',
        BottomNavigationFoundationStory.appearances => 'Appearances',
        BottomNavigationFoundationStory.defaultShowcase => 'Default (Showcase)',
      };

  String get description => switch (this) {
        BottomNavigationFoundationStory.docs =>
          'Bottom navigation for mobile and tablet — 2–5 items with icon + optional label.',
        BottomNavigationFoundationStory.defaultStory =>
          'Three-item nav with Search active — interactive controls on Default story.',
        BottomNavigationFoundationStory.labelTypes =>
          'none / 1line / 2line label layouts.',
        BottomNavigationFoundationStory.itemCounts =>
          'Even distribution for 2–5 items.',
        BottomNavigationFoundationStory.states =>
          'Default, active, and disabled items.',
        BottomNavigationFoundationStory.focusState =>
          'Idle vs keyboard focus halo (forceFocusRing).',
        BottomNavigationFoundationStory.withIcons =>
          'Active colour shift across icons.',
        BottomNavigationFoundationStory.interactive =>
          'Controlled value — mirrors React Interactive story.',
        BottomNavigationFoundationStory.responsive =>
          'Phone (360) vs tablet (720) widths.',
        BottomNavigationFoundationStory.surfaceModes =>
          'Nav on default / minimal / subtle / moderate / bold / elevated surfaces.',
        BottomNavigationFoundationStory.appearances =>
          'Primary, secondary, sparkle, and positive roles.',
        BottomNavigationFoundationStory.defaultShowcase =>
          'Smoke check for visual regression.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        BottomNavigationFoundationStory.docs =>
          buildBottomNavigationDocsMerged(context),
        BottomNavigationFoundationStory.defaultStory =>
          bottomNavigationDefaultSection(context),
        BottomNavigationFoundationStory.labelTypes =>
          bottomNavigationLabelTypesSection(context),
        BottomNavigationFoundationStory.itemCounts =>
          bottomNavigationItemCountsSection(context),
        BottomNavigationFoundationStory.states =>
          bottomNavigationStatesSection(context),
        BottomNavigationFoundationStory.focusState =>
          bottomNavigationFocusStateSection(context),
        BottomNavigationFoundationStory.withIcons =>
          bottomNavigationWithIconsSection(context),
        BottomNavigationFoundationStory.interactive =>
          const BottomNavigationInteractiveStoryPage(),
        BottomNavigationFoundationStory.responsive =>
          bottomNavigationResponsiveSection(context),
        BottomNavigationFoundationStory.surfaceModes =>
          bottomNavigationSurfaceModesSection(context),
        BottomNavigationFoundationStory.appearances =>
          bottomNavigationAppearancesSection(context),
        BottomNavigationFoundationStory.defaultShowcase =>
          bottomNavigationDefaultSection(context),
      };
}

Widget buildBottomNavigationDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kBottomNavigationStoryNavOrder)
        if (story != BottomNavigationFoundationStory.docs &&
            story != BottomNavigationFoundationStory.defaultStory &&
            story != BottomNavigationFoundationStory.interactive)
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
