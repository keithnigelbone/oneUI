import 'package:flutter/material.dart';

import 'radio_field_showcase.dart';

/// Sidebar order — parity with web `RadioField.stories.tsx` export order.
enum RadioFieldFoundationStory {
  docs,
  defaultStory,
  multiOptions,
  multiOptionsWithDescription,
  multiOptionsFragment,
  multiOptionsHorizontal,
  withFeedback,
  withDynamicText,
  required,
  disabled,
  singleOptionWithDescription,
  withInfoIcon,
}

const List<RadioFieldFoundationStory> kRadioFieldStoryNavOrder = [
  RadioFieldFoundationStory.docs,
  RadioFieldFoundationStory.defaultStory,
  RadioFieldFoundationStory.multiOptions,
  RadioFieldFoundationStory.multiOptionsWithDescription,
  RadioFieldFoundationStory.multiOptionsFragment,
  RadioFieldFoundationStory.multiOptionsHorizontal,
  RadioFieldFoundationStory.withFeedback,
  RadioFieldFoundationStory.withDynamicText,
  RadioFieldFoundationStory.required,
  RadioFieldFoundationStory.disabled,
  RadioFieldFoundationStory.singleOptionWithDescription,
  RadioFieldFoundationStory.withInfoIcon,
];

extension RadioFieldFoundationStoryMeta on RadioFieldFoundationStory {
  String get title => switch (this) {
        RadioFieldFoundationStory.docs => 'Docs',
        RadioFieldFoundationStory.defaultStory => 'Default',
        RadioFieldFoundationStory.multiOptions => 'MultiOptions',
        RadioFieldFoundationStory.multiOptionsWithDescription =>
          'MultiOptionsWithDescription',
        RadioFieldFoundationStory.multiOptionsFragment =>
          'MultiOptionsFragment',
        RadioFieldFoundationStory.multiOptionsHorizontal =>
          'MultiOptionsHorizontal',
        RadioFieldFoundationStory.withFeedback => 'WithFeedback',
        RadioFieldFoundationStory.withDynamicText => 'WithDynamicText',
        RadioFieldFoundationStory.required => 'Required',
        RadioFieldFoundationStory.disabled => 'Disabled',
        RadioFieldFoundationStory.singleOptionWithDescription =>
          'SingleOptionWithDescription',
        RadioFieldFoundationStory.withInfoIcon => 'WithInfoIcon',
      };

  String get description => switch (this) {
        RadioFieldFoundationStory.docs =>
          'Field shell aligned with InputField and CheckboxField. Integrated single (no children) '
              'or two+ Radio children with field header, feedback, and dynamic row.',
        RadioFieldFoundationStory.defaultStory =>
          'Integrated single option — implicit lone control beside field label.',
        RadioFieldFoundationStory.multiOptions =>
          'Two or more options — field label above the RadioGroup.',
        RadioFieldFoundationStory.multiOptionsWithDescription =>
          'Multi-option field with description under the label.',
        RadioFieldFoundationStory.multiOptionsFragment =>
          'Multiple options as a flat child list (web Fragment flattening parity).',
        RadioFieldFoundationStory.multiOptionsHorizontal =>
          'Horizontal RadioGroup orientation.',
        RadioFieldFoundationStory.withFeedback =>
          'InputFeedback row after the option list.',
        RadioFieldFoundationStory.withDynamicText =>
          'InputDynamicText row after the option list.',
        RadioFieldFoundationStory.required =>
          'Required asterisk on field label.',
        RadioFieldFoundationStory.disabled => 'Disabled field and options.',
        RadioFieldFoundationStory.singleOptionWithDescription =>
          'Integrated single with label, description, and singleOptionValue.',
        RadioFieldFoundationStory.withInfoIcon =>
          'Integrated single with info icon beside the label.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        RadioFieldFoundationStory.docs => buildRadioFieldDocsMerged(context),
        RadioFieldFoundationStory.defaultStory =>
          buildRadioFieldDefaultSection(context),
        RadioFieldFoundationStory.multiOptions =>
          buildRadioFieldMultiOptionsSection(context),
        RadioFieldFoundationStory.multiOptionsWithDescription =>
          buildRadioFieldMultiOptionsWithDescriptionSection(context),
        RadioFieldFoundationStory.multiOptionsFragment =>
          buildRadioFieldMultiOptionsFragmentSection(context),
        RadioFieldFoundationStory.multiOptionsHorizontal =>
          buildRadioFieldMultiOptionsHorizontalSection(context),
        RadioFieldFoundationStory.withFeedback =>
          buildRadioFieldWithFeedbackSection(context),
        RadioFieldFoundationStory.withDynamicText =>
          buildRadioFieldWithDynamicTextSection(context),
        RadioFieldFoundationStory.required =>
          buildRadioFieldRequiredSection(context),
        RadioFieldFoundationStory.disabled =>
          buildRadioFieldDisabledSection(context),
        RadioFieldFoundationStory.singleOptionWithDescription =>
          buildRadioFieldSingleOptionWithDescriptionSection(context),
        RadioFieldFoundationStory.withInfoIcon =>
          buildRadioFieldWithInfoIconSection(context),
      };
}
