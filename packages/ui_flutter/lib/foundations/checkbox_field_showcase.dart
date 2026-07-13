import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'checkbox_field_brand_bind.dart';
import '../widgets/one_ui_checkbox.dart';
import '../widgets/one_ui_checkbox_field.dart';
import '../widgets/one_ui_checkbox_types.dart';
import '../widgets/one_ui_icon_button.dart';
import '../widgets/one_ui_icon_button_types.dart';
import '../widgets/one_ui_input_dynamic_text.dart';
import '../widgets/one_ui_input_feedback.dart';
import '../widgets/one_ui_input_feedback_types.dart';
import '../widgets/one_ui_surface.dart';

/// Parity with web `CheckboxField.stories.tsx` — one section per exported story.
const _demoWidth = 348.0;

void _bind(BuildContext context) => bindCheckboxFieldBrandScope(context);

double _gap(BuildContext context, [String tail = '4']) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: tail,
  );
}

TextStyle? _caption(BuildContext context) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', 'XS', emphasis: 'low') ??
      Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
}

Widget _storyCanvas(Widget child, {double width = _demoWidth}) =>
    SizedBox(width: width, child: child);

/// `Default` — integrated single, no Checkbox children.
Widget buildCheckboxFieldDefaultSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    const OneUiCheckboxField(
      label: 'Email me about product updates',
    ),
  );
}

/// `MultiOptions` — field label above checkbox group.
Widget buildCheckboxFieldMultiOptionsSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiCheckboxField(
      label: 'Notifications',
      description: 'Select all that apply.',
      groupDefaultValue: const ['news'],
      children: [
        OneUiCheckbox(value: 'news', label: 'Product news'),
        OneUiCheckbox(value: 'tips', label: 'Tips and tutorials'),
        OneUiCheckbox(value: 'research', label: 'Research invites'),
      ],
    ),
  );
}

/// `MultiOptionsFragment` — flat child list (Flutter has no Fragment).
Widget buildCheckboxFieldMultiOptionsFragmentSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiCheckboxField(
      label: 'Topics',
      description: 'Wrapped in `<>…</>`.',
      groupDefaultValue: const ['a'],
      children: [
        OneUiCheckbox(value: 'a', label: 'Alpha'),
        OneUiCheckbox(value: 'b', label: 'Beta'),
        OneUiCheckbox(value: 'c', label: 'Gamma'),
      ],
    ),
  );
}

/// `WithDescription`.
Widget buildCheckboxFieldWithDescriptionSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    const OneUiCheckboxField(
      label: 'Subscribe to digest',
      description: 'We never sell your address. Unsubscribe anytime.',
    ),
  );
}

/// `FeedbackOnly`.
Widget buildCheckboxFieldFeedbackOnlySection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    const OneUiCheckboxField(
      label: 'Accept terms',
      feedback: OneUiInputFeedback(
        variant: OneUiInputFeedbackVariant.negative,
        attention: OneUiInputFeedbackAttention.low,
        feedbackMessage: 'You must accept to continue.',
      ),
    ),
  );
}

/// `Required`.
Widget buildCheckboxFieldRequiredSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    const OneUiCheckboxField(
      label: 'I agree to the terms',
      required: true,
    ),
  );
}

/// `WithInfoIcon` — integrated single + info trigger.
Widget buildCheckboxFieldWithInfoIconSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiCheckboxField(
      label: 'Share crash reports',
      description: 'Helps us fix bugs faster.',
      infoIconSlot: OneUiIconButton(
        icon: 'info',
        semanticsLabel: 'More about crash reports',
        size: 10,
        appearance: 'neutral',
        attention: OneUiIconButtonAttention.low,
        variant: OneUiIconButtonVariant.ghost,
        condensed: true,
      ),
    ),
  );
}

/// `Disabled`.
Widget buildCheckboxFieldDisabledSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    const OneUiCheckboxField(
      label: 'Unavailable option',
      disabled: true,
      defaultChecked: true,
    ),
  );
}

/// `Invalid`.
Widget buildCheckboxFieldInvalidSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    const OneUiCheckboxField(
      label: 'Confirm you are human',
      invalid: true,
      error: 'Please complete verification.',
    ),
  );
}

/// `MultiOptionsWithFeedback`.
Widget buildCheckboxFieldMultiOptionsWithFeedbackSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    OneUiCheckboxField(
      label: 'Delivery options',
      groupDefaultValue: const ['standard'],
      feedback: const OneUiInputFeedback(
        variant: OneUiInputFeedbackVariant.informative,
        attention: OneUiInputFeedbackAttention.low,
        feedbackMessage: 'Changing options may reset your delivery window.',
      ),
      children: [
        OneUiCheckbox(value: 'standard', label: 'Standard'),
        OneUiCheckbox(value: 'express', label: 'Express'),
      ],
    ),
  );
}

/// `WithDynamicText`.
Widget buildCheckboxFieldWithDynamicTextSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    const OneUiCheckboxField(
      label: 'Nickname',
      dynamicTextSlot:
          OneUiInputDynamicText(content: '0 / 32', end: 'Generate'),
    ),
  );
}

/// `FullExample` — mirrors web `CheckboxFieldDefault` showcase.
Widget buildCheckboxFieldFullExampleSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Same contract as InputField: feedback / error, optional InputDynamicText via '
          'dynamicText / helperButton or dynamicTextSlot.',
          style: _caption(context),
        ),
        SizedBox(height: _gap(context, '4')),
        const OneUiCheckboxField(
          label: 'Send me product news',
          dynamicTextSlot:
              OneUiInputDynamicText(content: 'Optional', end: 'Learn more'),
          feedback: OneUiInputFeedback(
            variant: OneUiInputFeedbackVariant.informative,
            attention: OneUiInputFeedbackAttention.low,
            feedbackMessage: 'Preferences sync across your devices.',
          ),
        ),
      ],
    ),
  );
}

/// `Sizes`.
Widget buildCheckboxFieldSizesSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final size in kOneUiCheckboxSizes) ...[
          OneUiCheckboxField(
            size: size,
            label: 'Size ${size.toUpperCase()}',
            feedback: const OneUiInputFeedback(
              attention: OneUiInputFeedbackAttention.low,
              feedbackMessage: 'Feedback scales with field size.',
            ),
          ),
          if (size != kOneUiCheckboxSizes.last)
            SizedBox(height: _gap(context, '5')),
        ],
      ],
    ),
  );
}

/// `States`.
Widget buildCheckboxFieldStatesSection(BuildContext context) {
  _bind(context);
  return _storyCanvas(
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const OneUiCheckboxField(label: 'Default', checked: false),
        SizedBox(height: _gap(context, '5')),
        const OneUiCheckboxField(label: 'Checked', checked: true),
        SizedBox(height: _gap(context, '5')),
        const OneUiCheckboxField(label: 'Indeterminate', indeterminate: true),
        SizedBox(height: _gap(context, '5')),
        const OneUiCheckboxField(label: 'Disabled', disabled: true),
        SizedBox(height: _gap(context, '5')),
        const OneUiCheckboxField(
            label: 'Read-only', readOnly: true, checked: true),
      ],
    ),
  );
}

/// `SurfaceContext`.
Widget buildCheckboxFieldSurfaceContextSection(BuildContext context) {
  _bind(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Inside a bold surface, the inner Checkbox tokens remap via [data-surface].',
        style: _caption(context),
      ),
      SizedBox(height: _gap(context, '4')),
      OneUiSurface(
        mode: 'bold',
        padding: EdgeInsets.all(_gap(context, '4')),
        borderRadius: BorderRadius.circular(_gap(context, '4')),
        child: _storyCanvas(
          const OneUiCheckboxField(
            appearance: 'neutral',
            label: 'Enable backup',
            feedback: OneUiInputFeedback(
              attention: OneUiInputFeedbackAttention.low,
              feedbackMessage: 'Stored encrypted in your region.',
            ),
          ),
        ),
      ),
    ],
  );
}

/// `OnGhostSurface`.
Widget buildCheckboxFieldOnGhostSurfaceSection(BuildContext context) {
  _bind(context);
  return OneUiSurface(
    mode: 'subtle',
    padding: EdgeInsets.all(_gap(context, '5')),
    borderRadius: BorderRadius.circular(_gap(context, '4')),
    child: _storyCanvas(
      const OneUiCheckboxField(
        label: 'Share usage diagnostics',
        appearance: 'neutral',
        feedback: OneUiInputFeedback(
          attention: OneUiInputFeedbackAttention.low,
          feedbackMessage: 'Helps us improve reliability.',
        ),
      ),
    ),
  );
}

/// Docs page live preview — same as `Default`.
Widget buildCheckboxFieldDocsMerged(BuildContext context) =>
    buildCheckboxFieldDefaultSection(context);

Widget buildCheckboxFieldDefaultPreview(BuildContext context) =>
    buildCheckboxFieldDefaultSection(context);
