import 'package:flutter/material.dart';

import 'checkbox_field_showcase.dart';

/// Sidebar order — parity with web `CheckboxField.stories.tsx` export order.
enum CheckboxFieldFoundationStory {
  docs,
  defaultStory,
  multiOptions,
  multiOptionsFragment,
  withDescription,
  feedbackOnly,
  required,
  withInfoIcon,
  disabled,
  invalid,
  multiOptionsWithFeedback,
  withDynamicText,
  fullExample,
  sizes,
  states,
  surfaceContext,
  onGhostSurface,
}

const List<CheckboxFieldFoundationStory> kCheckboxFieldStoryNavOrder = [
  CheckboxFieldFoundationStory.docs,
  CheckboxFieldFoundationStory.defaultStory,
  CheckboxFieldFoundationStory.multiOptions,
  CheckboxFieldFoundationStory.multiOptionsFragment,
  CheckboxFieldFoundationStory.withDescription,
  CheckboxFieldFoundationStory.feedbackOnly,
  CheckboxFieldFoundationStory.required,
  CheckboxFieldFoundationStory.withInfoIcon,
  CheckboxFieldFoundationStory.disabled,
  CheckboxFieldFoundationStory.invalid,
  CheckboxFieldFoundationStory.multiOptionsWithFeedback,
  CheckboxFieldFoundationStory.withDynamicText,
  CheckboxFieldFoundationStory.fullExample,
  CheckboxFieldFoundationStory.sizes,
  CheckboxFieldFoundationStory.states,
  CheckboxFieldFoundationStory.surfaceContext,
  CheckboxFieldFoundationStory.onGhostSurface,
];

extension CheckboxFieldFoundationStoryMeta on CheckboxFieldFoundationStory {
  /// Story export id — matches web `CheckboxField.stories.tsx` export name.
  String get title => switch (this) {
        CheckboxFieldFoundationStory.docs => 'Docs',
        CheckboxFieldFoundationStory.defaultStory => 'Default',
        CheckboxFieldFoundationStory.multiOptions => 'MultiOptions',
        CheckboxFieldFoundationStory.multiOptionsFragment =>
          'MultiOptionsFragment',
        CheckboxFieldFoundationStory.withDescription => 'WithDescription',
        CheckboxFieldFoundationStory.feedbackOnly => 'FeedbackOnly',
        CheckboxFieldFoundationStory.required => 'Required',
        CheckboxFieldFoundationStory.withInfoIcon => 'WithInfoIcon',
        CheckboxFieldFoundationStory.disabled => 'Disabled',
        CheckboxFieldFoundationStory.invalid => 'Invalid',
        CheckboxFieldFoundationStory.multiOptionsWithFeedback =>
          'MultiOptionsWithFeedback',
        CheckboxFieldFoundationStory.withDynamicText => 'WithDynamicText',
        CheckboxFieldFoundationStory.fullExample => 'FullExample',
        CheckboxFieldFoundationStory.sizes => 'Sizes',
        CheckboxFieldFoundationStory.states => 'States',
        CheckboxFieldFoundationStory.surfaceContext => 'SurfaceContext',
        CheckboxFieldFoundationStory.onGhostSurface => 'OnGhostSurface',
      };

  /// Human-readable label — matches React Storybook sidebar (camelCase → words).
  String get sidebarTitle => switch (this) {
        CheckboxFieldFoundationStory.docs => 'Docs',
        CheckboxFieldFoundationStory.defaultStory => 'Default',
        CheckboxFieldFoundationStory.multiOptions => 'Multi Options',
        CheckboxFieldFoundationStory.multiOptionsFragment =>
          'Multi Options Fragment',
        CheckboxFieldFoundationStory.withDescription => 'With Description',
        CheckboxFieldFoundationStory.feedbackOnly => 'Feedback Only',
        CheckboxFieldFoundationStory.required => 'Required',
        CheckboxFieldFoundationStory.withInfoIcon => 'With Info Icon',
        CheckboxFieldFoundationStory.disabled => 'Disabled',
        CheckboxFieldFoundationStory.invalid => 'Invalid',
        CheckboxFieldFoundationStory.multiOptionsWithFeedback =>
          'Multi Options With Feedback',
        CheckboxFieldFoundationStory.withDynamicText => 'With Dynamic Text',
        CheckboxFieldFoundationStory.fullExample => 'Full Example',
        CheckboxFieldFoundationStory.sizes => 'Sizes',
        CheckboxFieldFoundationStory.states => 'States',
        CheckboxFieldFoundationStory.surfaceContext => 'Surface Context',
        CheckboxFieldFoundationStory.onGhostSurface => 'On Ghost Surface',
      };

  String get description => switch (this) {
        CheckboxFieldFoundationStory.docs =>
          'Field shell aligned with InputField. Integrated single or multi-option Checkbox children with field header, feedback, and dynamic row.',
        CheckboxFieldFoundationStory.defaultStory =>
          'Integrated single checkbox — label only (baseline).',
        CheckboxFieldFoundationStory.multiOptions =>
          'Several Checkbox children; field label / description act as the group header.',
        CheckboxFieldFoundationStory.multiOptionsFragment =>
          'Multiple options as a flat child list (web Fragment flattening parity).',
        CheckboxFieldFoundationStory.withDescription =>
          'Single field with a string description under the label row.',
        CheckboxFieldFoundationStory.feedbackOnly =>
          'InputFeedback row without other field chrome.',
        CheckboxFieldFoundationStory.required =>
          'Required asterisk on field label.',
        CheckboxFieldFoundationStory.withInfoIcon =>
          'Integrated single with info icon beside the label.',
        CheckboxFieldFoundationStory.disabled =>
          'Disabled field and inner checkbox.',
        CheckboxFieldFoundationStory.invalid =>
          'Invalid state with error message.',
        CheckboxFieldFoundationStory.multiOptionsWithFeedback =>
          'Multi-option field with InputFeedback after the option list.',
        CheckboxFieldFoundationStory.withDynamicText =>
          'InputDynamicText row after the field label.',
        CheckboxFieldFoundationStory.fullExample =>
          'Full example with dynamic text and informative feedback.',
        CheckboxFieldFoundationStory.sizes => 'S / M / L field sizes.',
        CheckboxFieldFoundationStory.states =>
          'Default, checked, indeterminate, disabled, and read-only.',
        CheckboxFieldFoundationStory.surfaceContext =>
          'Field inside a bold Surface — tokens remap via data-surface.',
        CheckboxFieldFoundationStory.onGhostSurface =>
          'Field on a subtle ghost surface with feedback.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        CheckboxFieldFoundationStory.docs =>
          buildCheckboxFieldDocsMerged(context),
        CheckboxFieldFoundationStory.defaultStory =>
          buildCheckboxFieldDefaultSection(context),
        CheckboxFieldFoundationStory.multiOptions =>
          buildCheckboxFieldMultiOptionsSection(context),
        CheckboxFieldFoundationStory.multiOptionsFragment =>
          buildCheckboxFieldMultiOptionsFragmentSection(context),
        CheckboxFieldFoundationStory.withDescription =>
          buildCheckboxFieldWithDescriptionSection(context),
        CheckboxFieldFoundationStory.feedbackOnly =>
          buildCheckboxFieldFeedbackOnlySection(context),
        CheckboxFieldFoundationStory.required =>
          buildCheckboxFieldRequiredSection(context),
        CheckboxFieldFoundationStory.withInfoIcon =>
          buildCheckboxFieldWithInfoIconSection(context),
        CheckboxFieldFoundationStory.disabled =>
          buildCheckboxFieldDisabledSection(context),
        CheckboxFieldFoundationStory.invalid =>
          buildCheckboxFieldInvalidSection(context),
        CheckboxFieldFoundationStory.multiOptionsWithFeedback =>
          buildCheckboxFieldMultiOptionsWithFeedbackSection(context),
        CheckboxFieldFoundationStory.withDynamicText =>
          buildCheckboxFieldWithDynamicTextSection(context),
        CheckboxFieldFoundationStory.fullExample =>
          buildCheckboxFieldFullExampleSection(context),
        CheckboxFieldFoundationStory.sizes =>
          buildCheckboxFieldSizesSection(context),
        CheckboxFieldFoundationStory.states =>
          buildCheckboxFieldStatesSection(context),
        CheckboxFieldFoundationStory.surfaceContext =>
          buildCheckboxFieldSurfaceContextSection(context),
        CheckboxFieldFoundationStory.onGhostSurface =>
          buildCheckboxFieldOnGhostSurfaceSection(context),
      };
}
