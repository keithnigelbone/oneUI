import 'package:flutter/material.dart';

import '../engine/text_style_resolve.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'radio_field_brand_bind.dart';
import '../widgets/one_ui_icon_button.dart';
import '../widgets/one_ui_icon_button_types.dart';
import '../widgets/one_ui_input_feedback.dart';
import '../widgets/one_ui_input_feedback_types.dart';
import '../widgets/one_ui_input_dynamic_text.dart';
import '../widgets/one_ui_radio.dart';
import '../widgets/one_ui_radio_field.dart';
import '../widgets/one_ui_text_types.dart';

/// Parity with web `RadioField.stories.tsx` — one section per exported story.
const _demoWidth = 348.0;

void _bind(BuildContext context) => bindRadioFieldBrandScope(context);

Widget _storyCanvas(Widget child, {double width = _demoWidth}) =>
    SizedBox(width: width, child: child);

/// `Default` — integrated single, no Radio children.
Widget buildRadioFieldDefaultSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    const OneUiRadioField(
      label: 'Enable push notifications',
      defaultValue: 'on',
    ),
  );
}

/// `MultiOptions` — field label above RadioGroup (no description).
Widget buildRadioFieldMultiOptionsSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiRadioField(
      label: 'Contact method',
      defaultValue: 'email',
      children: [
        OneUiRadio(value: 'email', label: 'Email'),
        OneUiRadio(value: 'sms', label: 'SMS'),
        OneUiRadio(value: 'post', label: 'Post'),
      ],
    ),
  );
}

/// `MultiOptionsWithDescription`.
Widget buildRadioFieldMultiOptionsWithDescriptionSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiRadioField(
      label: 'Contact method',
      description: 'Choose how we should reach you.',
      defaultValue: 'email',
      children: [
        OneUiRadio(value: 'email', label: 'Email'),
        OneUiRadio(value: 'sms', label: 'SMS'),
        OneUiRadio(value: 'post', label: 'Post'),
      ],
    ),
  );
}

/// `MultiOptionsFragment` — list children (Flutter has no Fragment; same flat list).
Widget buildRadioFieldMultiOptionsFragmentSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiRadioField(
      label: 'Theme',
      defaultValue: 'system',
      children: [
        OneUiRadio(value: 'light', label: 'Light'),
        OneUiRadio(value: 'dark', label: 'Dark'),
        OneUiRadio(value: 'system', label: 'System'),
      ],
    ),
  );
}

/// `MultiOptionsHorizontal`.
Widget buildRadioFieldMultiOptionsHorizontalSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiRadioField(
      label: 'Density',
      orientation: 'horizontal',
      defaultValue: 'default',
      children: [
        OneUiRadio(value: 'compact', label: 'Compact'),
        OneUiRadio(value: 'default', label: 'Default'),
        OneUiRadio(value: 'comfortable', label: 'Comfortable'),
      ],
    ),
  );
}

/// `WithFeedback`.
Widget buildRadioFieldWithFeedbackSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiRadioField(
      label: 'Contact method',
      description: 'Choose how we should reach you.',
      defaultValue: 'email',
      feedback: const OneUiInputFeedback(
        attention: OneUiInputFeedbackAttention.low,
        feedbackMessage: 'You can change this later in settings.',
      ),
      children: [
        OneUiRadio(value: 'email', label: 'Email'),
        OneUiRadio(value: 'sms', label: 'SMS'),
        OneUiRadio(value: 'post', label: 'Post'),
      ],
    ),
  );
}

/// `WithDynamicText`.
Widget buildRadioFieldWithDynamicTextSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiRadioField(
      label: 'Contact method',
      description: 'Choose how we should reach you.',
      defaultValue: 'email',
      dynamicTextSlot: const OneUiInputDynamicText(
        content: 'Recommended for account security',
      ),
      children: [
        OneUiRadio(value: 'email', label: 'Email'),
        OneUiRadio(value: 'sms', label: 'SMS'),
        OneUiRadio(value: 'post', label: 'Post'),
      ],
    ),
  );
}

/// `Required`.
Widget buildRadioFieldRequiredSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiRadioField(
      label: 'Billing cycle',
      required: true,
      defaultValue: 'monthly',
      children: [
        OneUiRadio(value: 'monthly', label: 'Monthly'),
        OneUiRadio(value: 'annual', label: 'Annual'),
      ],
    ),
  );
}

/// `Disabled`.
Widget buildRadioFieldDisabledSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiRadioField(
      label: 'Plan tier',
      defaultValue: 'pro',
      disabled: true,
      children: [
        OneUiRadio(value: 'free', label: 'Free'),
        OneUiRadio(value: 'pro', label: 'Pro'),
        OneUiRadio(value: 'enterprise', label: 'Enterprise'),
      ],
    ),
  );
}

/// `SingleOptionWithDescription` — integrated single with custom `singleOptionValue`.
Widget buildRadioFieldSingleOptionWithDescriptionSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    const OneUiRadioField(
      label: 'Marketing emails',
      description: 'Occasional product updates only.',
      defaultValue: 'yes',
      singleOptionValue: 'yes',
    ),
  );
}

/// `WithInfoIcon` — integrated single + info trigger (web `InputFieldDefaultInfo`).
Widget buildRadioFieldWithInfoIconSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiRadioField(
      label: 'Desktop alerts',
      description: 'Browser notifications when the app is open.',
      defaultChecked: true,
      infoIconSlot: OneUiIconButton(
        icon: 'info',
        semanticsLabel: 'More about desktop alerts',
        size: 10,
        appearance: 'neutral',
        attention: OneUiIconButtonAttention.low,
        variant: OneUiIconButtonVariant.ghost,
        condensed: true,
      ),
    ),
  );
}

/// Docs page live preview — same as `Default`.
Widget buildRadioFieldDocsMerged(BuildContext context) =>
    buildRadioFieldDefaultSection(context);

Widget buildRadioFieldDefaultPreview(BuildContext context) =>
    buildRadioFieldDefaultSection(context);
