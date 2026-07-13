import 'package:flutter/material.dart';

import '../engine/text_style_resolve.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'input_field_brand_bind.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_icon_button.dart';
import '../widgets/one_ui_icon_button_types.dart';
import '../widgets/one_ui_input_feedback.dart';
import '../widgets/one_ui_input_feedback_types.dart';
import '../widgets/one_ui_input_dynamic_text.dart';
import '../widgets/one_ui_input_field.dart';
import '../widgets/one_ui_input_types.dart';
import '../widgets/one_ui_surface.dart';
import '../widgets/one_ui_text_types.dart';

const _demoWidth = 348.0;
const _searchWidth = 400.0;

void _bindInputFieldBrandScope(BuildContext context) =>
    bindInputFieldBrandScope(context);

Widget _fieldDemo(Widget child, {double width = _demoWidth}) =>
    SizedBox(width: width, child: child);

Widget _slotIcon(String name) =>
    OneUiIcon(icon: name, size: '5', appearance: 'secondary');

double _spacing(BuildContext context, String name) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: name,
  );
}

TextStyle? _captionStyle(BuildContext context) {
  return resolveOneUiTextTypographyStyle(
    context,
    variant: OneUiTextVariant.label,
    size: 'XS',
    weight: OneUiTextWeight.low,
  );
}

Widget _lowText(BuildContext context, String text) {
  final neutral = OneUiSurfaceScope.tokensMaybe(context, 'neutral');
  final style = resolveOneUiTextTypographyStyle(
    context,
    variant: OneUiTextVariant.body,
    size: 'S',
    weight: OneUiTextWeight.low,
  )?.copyWith(
    color: neutral != null ? oneUiHexColor(neutral.content['low']!) : null,
  );
  return Text(text, style: style);
}

Widget _labeledShowcase(BuildContext context, String caption, Widget child) {
  return Padding(
    padding: EdgeInsets.only(bottom: _spacing(context, '4')),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(caption, style: _captionStyle(context)),
        SizedBox(height: _spacing(context, '3')),
        child,
      ],
    ),
  );
}

/// Controlled value — `InputFieldControlled` in `InputField.showcase.native.tsx`.
Widget inputFieldControlledSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return _InputFieldControlledDemo();
}

class _InputFieldControlledDemo extends StatefulWidget {
  @override
  State<_InputFieldControlledDemo> createState() =>
      _InputFieldControlledDemoState();
}

class _InputFieldControlledDemoState extends State<_InputFieldControlledDemo> {
  String _value = 'Hello';

  @override
  Widget build(BuildContext context) {
    return _fieldDemo(
      Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OneUiInputField(
            label: 'Controlled',
            value: _value,
            onChanged: (v) => setState(() => _value = v),
            placeholder: 'Type to update',
            start: _slotIcon('search'),
          ),
          SizedBox(height: _spacing(context, '3')),
          Text(
            'value = "$_value"',
            style: _captionStyle(context),
          ),
        ],
      ),
    );
  }
}

Widget inputFieldDefaultSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return _fieldDemo(
    const OneUiInputField(
      label: 'Label',
      placeholder: 'Placeholder',
      size: 'm',
      appearance: OneUiInputAppearance.auto,
    ),
  );
}

/// Invalid chrome + negative [OneUiInputFeedback] — web `InputField` error story.
Widget inputFieldWithErrorSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return _fieldDemo(
    const OneUiInputField(
      id: 'field-error',
      label: 'Password',
      placeholder: 'Enter password',
      type: 'password',
      error: 'Password must be at least 8 characters.',
      invalid: true,
    ),
  );
}

Widget inputFieldSizesSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final row in [('s', 8), ('m', 10), ('l', 12)]) ...[
        _fieldDemo(
          OneUiInputField(
            size: row.$2,
            label: 'Label',
            placeholder: 'Size ${row.$1.toUpperCase()}',
            start: _slotIcon('heart'),
          ),
        ),
        SizedBox(height: _spacing(context, '4')),
      ],
    ],
  );
}

Widget inputFieldAttentionsSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final attention in OneUiInputAttention.values) ...[
        Text(
          attention == OneUiInputAttention.high
              ? 'high (filled)'
              : 'medium (outlined)',
          style: _captionStyle(context),
        ),
        SizedBox(height: _spacing(context, '2')),
        for (final row in [('s', 8), ('m', 10), ('l', 12)]) ...[
          _fieldDemo(
            OneUiInputField(
              size: row.$2,
              attention: attention,
              label: 'Label ${row.$1.toUpperCase()}',
              placeholder: 'Placeholder',
              start: _slotIcon('heart'),
            ),
          ),
          SizedBox(height: _spacing(context, '3')),
        ],
        SizedBox(height: _spacing(context, '2')),
      ],
    ],
  );
}

Widget inputFieldStatesSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return Wrap(
    spacing: 24,
    runSpacing: 24,
    children: [
      _fieldDemo(
          const OneUiInputField(label: 'Label', placeholder: 'Placeholder')),
      _fieldDemo(
          const OneUiInputField(label: 'Label', defaultValue: 'Input text')),
      _fieldDemo(const OneUiInputField(
          label: 'Label', placeholder: 'Disabled', disabled: true)),
      _fieldDemo(const OneUiInputField(
          label: 'Label', defaultValue: 'Read-only', readOnly: true)),
      _fieldDemo(
        const OneUiInputField(
          label: 'Label',
          placeholder: 'Error',
          error: 'Feedback message',
        ),
      ),
      _fieldDemo(
        const OneUiInputField(
          label: 'Label',
          description: 'Description text',
          placeholder: 'With description',
        ),
      ),
      _fieldDemo(
        const OneUiInputField(
            label: 'Label', placeholder: 'Required', required: true),
      ),
    ],
  );
}

Widget inputFieldWithSlotsSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _fieldDemo(
        OneUiInputField(
            label: 'Label',
            start: _slotIcon('heart'),
            placeholder: 'With start icon'),
      ),
      SizedBox(height: _spacing(context, '4')),
      _fieldDemo(
        OneUiInputField(
          label: 'Label',
          start: _slotIcon('star'),
          end: _slotIcon('close'),
          placeholder: 'Start and end',
        ),
      ),
      SizedBox(height: _spacing(context, '4')),
      _fieldDemo(
        const OneUiInputField(
          label: 'Amount',
          start2: Text('\$'),
          placeholder: '0.00',
          type: 'number',
        ),
      ),
      SizedBox(height: _spacing(context, '4')),
      _fieldDemo(
        const OneUiInputField(
          label: 'Weight',
          end2: Text('kg'),
          placeholder: 'Enter weight',
          type: 'number',
        ),
      ),
    ],
  );
}

Widget inputFieldAppearancesSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return Wrap(
    spacing: 24,
    runSpacing: 24,
    children: [
      for (final role in kOneUiInputAppearances)
        SizedBox(
          width: 280,
          child: OneUiInputField(
            label: 'Label',
            appearance: role,
            placeholder: role.wireValue,
          ),
        ),
    ],
  );
}

Widget inputFieldFeedbackSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return SizedBox(
    width: 500,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final variant in OneUiInputFeedbackVariant.values) ...[
          Text(variant.name, style: Theme.of(context).textTheme.labelMedium),
          const SizedBox(height: 8),
          for (final size in ['s', 'm', 'l']) ...[
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: [
                for (final attention in OneUiInputFeedbackAttention.values)
                  OneUiInputFeedback(
                    variant: variant,
                    attention: attention,
                    size: size,
                    feedbackMessage: 'Feedback message',
                  ),
              ],
            ),
            const SizedBox(height: 12),
          ],
          const SizedBox(height: 16),
        ],
      ],
    ),
  );
}

/// `InputDynamicTextShowcase` — `Input.showcase.tsx` parity.
Widget inputFieldDynamicTextSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return SizedBox(
    width: _demoWidth,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _labeledShowcase(
          context,
          'Dynamic text only',
          const OneUiInputDynamicText(
              size: OneUiInputLabelSize.m, content: '0/100 characters'),
        ),
        _labeledShowcase(
          context,
          'End button only',
          const OneUiInputDynamicText(size: OneUiInputLabelSize.m, end: 'Help'),
        ),
        _labeledShowcase(
          context,
          'Both',
          const OneUiInputDynamicText(
            size: OneUiInputLabelSize.m,
            content: '0/100 characters',
            end: 'Learn more',
          ),
        ),
        _labeledShowcase(
          context,
          'Sizes (S / M / L) — Figma row',
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final size in OneUiInputLabelSize.values) ...[
                OneUiInputDynamicText(
                  size: size,
                  content: 'Dynamic text',
                  end: 'Helper Button',
                ),
                SizedBox(height: _spacing(context, '3')),
              ],
            ],
          ),
        ),
        _labeledShowcase(
          context,
          'Content only',
          const OneUiInputDynamicText(
              size: OneUiInputLabelSize.m, content: '0 / 280 characters'),
        ),
        _labeledShowcase(
          context,
          'End button only (alt)',
          const OneUiInputDynamicText(
              size: OneUiInputLabelSize.m, end: 'Helper Button'),
        ),
      ],
    ),
  );
}

/// `InputFieldFullComposition` — Email + Password stack (`Input.showcase.tsx`).
Widget inputFieldFullCompositionSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return SizedBox(
    width: _demoWidth,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        OneUiInputField(
          label: 'Email',
          description: 'Shown under the label row (field description).',
          placeholder: 'you@example.com',
          type: 'email',
          start: _slotIcon('star'),
          feedback: const OneUiInputFeedback(
            variant: OneUiInputFeedbackVariant.informative,
            attention: OneUiInputFeedbackAttention.low,
            feedbackMessage: 'Optional field hint',
          ),
          dynamicText: '0 / 100 characters',
          helperButton: 'Help',
        ),
        SizedBox(height: _spacing(context, '4')),
        const OneUiInputField(
          label: 'Password',
          placeholder: 'Enter password',
          type: 'password',
          error: 'Password must be at least 8 characters',
          required: true,
        ),
      ],
    ),
  );
}

Widget inputFieldFigmaSlotsSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return _fieldDemo(
    OneUiInputField(
      label: 'Label',
      placeholder: 'Placeholder',
      start: _slotIcon('heart'),
      feedback: const OneUiInputFeedback(
        variant: OneUiInputFeedbackVariant.negative,
        attention: OneUiInputFeedbackAttention.low,
        feedbackMessage: 'Feedback message',
      ),
      dynamicTextSlot: const OneUiInputDynamicText(
        content: 'Dynamic text',
        end: 'Helper Button',
        size: OneUiInputLabelSize.m,
      ),
    ),
  );
}

OneUiIconButton _trailingIconButton(
  String icon,
  String semanticsLabel, {
  required int size,
}) {
  return OneUiIconButton(
    icon: icon,
    semanticsLabel: semanticsLabel,
    size: size,
    appearance: 'secondary',
    attention: OneUiIconButtonAttention.low,
    variant: OneUiIconButtonVariant.ghost,
    condensed: true,
  );
}

const _searchStart =
    OneUiIcon(icon: 'search', size: '5', appearance: 'secondary');

/// `InputFieldSearch` — full slot-system search patterns (`Input.showcase.tsx`).
Widget inputFieldSearchSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  const trailingM = 10;

  return SizedBox(
    width: _searchWidth,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _labeledShowcase(
          context,
          'Search icon only (leading)',
          _fieldDemo(
            const OneUiInputField(
              label: 'Search',
              shape: OneUiInputShape.pill,
              start: _searchStart,
              placeholder: 'Search products, brands, categories…',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'Search + clear icon button (trailing)',
          _fieldDemo(
            OneUiInputField(
              label: 'Search',
              shape: OneUiInputShape.pill,
              start: _searchStart,
              end:
                  _trailingIconButton('close', 'Clear search', size: trailingM),
              defaultValue: 'Sneakers',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'Search + voice (mic icon button)',
          _fieldDemo(
            OneUiInputField(
              label: 'Search',
              shape: OneUiInputShape.pill,
              start: _searchStart,
              end: _trailingIconButton('microphone', 'Voice search',
                  size: trailingM),
              placeholder: 'Say or type to search',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'Search + clear + voice (two trailing slots)',
          _fieldDemo(
            OneUiInputField(
              label: 'Search',
              shape: OneUiInputShape.pill,
              start: _searchStart,
              end2:
                  _trailingIconButton('close', 'Clear search', size: trailingM),
              end: _trailingIconButton('microphone', 'Voice search',
                  size: trailingM),
              defaultValue: 'Ocean freight',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'Search + filter',
          _fieldDemo(
            OneUiInputField(
              label: 'Search',
              shape: OneUiInputShape.pill,
              start: _searchStart,
              end: _trailingIconButton('filter', 'Filters', size: trailingM),
              placeholder: 'Search results',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'Result counter (end2 text)',
          _fieldDemo(
            OneUiInputField(
              label: 'Search',
              shape: OneUiInputShape.pill,
              start: _searchStart,
              end2: _lowText(context, '42 results'),
              defaultValue: 'Organic',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'Back button + search (leading action)',
          _fieldDemo(
            OneUiInputField(
              label: 'Search',
              shape: OneUiInputShape.pill,
              start: _trailingIconButton('arrowLeft', 'Back', size: trailingM),
              end: _trailingIconButton('microphone', 'Voice search',
                  size: trailingM),
              placeholder: 'Search within category',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'Avatar (start) + chevron (end) — user picker',
          _fieldDemo(
            OneUiInputField(
              label: 'Assign to',
              shape: OneUiInputShape.pill,
              start: _slotIcon('user'),
              end: _slotIcon('chevronRight'),
              placeholder: 'Select a teammate',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'Currency prefix + unit suffix — no icons',
          _fieldDemo(
            OneUiInputField(
              label: 'Amount',
              shape: OneUiInputShape.pill,
              start2: _lowText(context, '\$'),
              end2: _lowText(context, 'USD'),
              placeholder: '0.00',
              type: 'number',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'All 4 slots — search with currency-style affordances',
          _fieldDemo(
            OneUiInputField(
              label: 'Catalog query',
              shape: OneUiInputShape.pill,
              start: _searchStart,
              start2: _lowText(context, 'SKU'),
              end2: _lowText(context, 'US'),
              end:
                  _trailingIconButton('close', 'Clear search', size: trailingM),
              defaultValue: '1024-OR-B',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'Filled (attention=high) — search variant',
          _fieldDemo(
            OneUiInputField(
              label: 'Search',
              shape: OneUiInputShape.pill,
              attention: OneUiInputAttention.high,
              start: _searchStart,
              end: _trailingIconButton('microphone', 'Voice search',
                  size: trailingM),
              placeholder: 'Search across everything',
            ),
            width: _searchWidth,
          ),
        ),
        _labeledShowcase(
          context,
          'All sizes, same search composition',
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final row in [('S', 8), ('M', 10), ('L', 12)]) ...[
                OneUiInputField(
                  size: row.$2,
                  shape: OneUiInputShape.pill,
                  label: 'Size ${row.$1}',
                  start: _searchStart,
                  end: _trailingIconButton('microphone', 'Voice search',
                      size: row.$2),
                  placeholder: 'Search products',
                ),
                SizedBox(height: _spacing(context, '3-5')),
              ],
            ],
          ),
        ),
      ],
    ),
  );
}

Widget inputFieldShapesSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _labeledShowcase(
        context,
        'Default shape',
        _fieldDemo(
          OneUiInputField(
            label: 'Default',
            placeholder: 'Rounded',
            start: _slotIcon('heart'),
          ),
        ),
      ),
      _labeledShowcase(
        context,
        'Pill shape',
        _fieldDemo(
          const OneUiInputField(
            label: 'Pill',
            shape: OneUiInputShape.pill,
            placeholder: 'Fully rounded',
            start: OneUiIcon(icon: 'heart', size: '5', appearance: 'secondary'),
          ),
        ),
      ),
    ],
  );
}

/// `InputFieldSurfaceContext` — `<Surface appearance="secondary">` + medium/high rows.
Widget inputFieldSurfaceContextSection(BuildContext context) {
  _bindInputFieldBrandScope(context);
  final pad = _spacing(context, '4-5');
  final gap = _spacing(context, '3-5');
  final innerGap = _spacing(context, '3');
  final radius = _spacing(context, '4');
  final neutral = OneUiSurfaceScope.tokensMaybe(context, 'neutral');
  final strokeLow = neutral != null
      ? oneUiHexColor(neutral.content['strokeLow'] ?? neutral.content['low']!)
      : Theme.of(context).colorScheme.outlineVariant;

  const surfaceRows =
      <({String mode, String label, String desc, bool dashedPage})>[
    (
      mode: 'default',
      label: 'default',
      desc: 'page background — default surface context',
      dashedPage: true
    ),
    (
      mode: 'minimal',
      label: 'minimal',
      desc: 'lightest Secondary tint',
      dashedPage: false
    ),
    (
      mode: 'subtle',
      label: 'subtle',
      desc: 'light Secondary tint',
      dashedPage: false
    ),
    (
      mode: 'moderate',
      label: 'moderate',
      desc: 'medium Secondary tint',
      dashedPage: false
    ),
    (
      mode: 'bold',
      label: 'bold',
      desc: 'full Secondary accent colour',
      dashedPage: false
    ),
  ];

  return SizedBox(
    width: double.infinity,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final row in surfaceRows) ...[
          Text('${row.label} — ${row.desc}', style: _captionStyle(context)),
          SizedBox(height: innerGap),
          if (row.dashedPage)
            DecoratedBox(
              decoration: BoxDecoration(
                border: Border.all(color: strokeLow),
                borderRadius: BorderRadius.circular(radius),
              ),
              child: OneUiSurface(
                mode: row.mode,
                appearance: 'secondary',
                transparentBackground: true,
                padding: EdgeInsets.all(pad),
                borderRadius: BorderRadius.circular(radius),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _fieldDemo(
                      OneUiInputField(
                        label: 'Medium (outlined)',
                        placeholder: 'Medium on ${row.label}',
                        start: _slotIcon('heart'),
                      ),
                    ),
                    SizedBox(height: gap),
                    _fieldDemo(
                      OneUiInputField(
                        label: 'High (filled)',
                        attention: OneUiInputAttention.high,
                        placeholder: 'Filled on ${row.label}',
                        start: _slotIcon('heart'),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            OneUiSurface(
              mode: row.mode,
              appearance: 'secondary',
              padding: EdgeInsets.all(pad),
              borderRadius: BorderRadius.circular(radius),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _fieldDemo(
                    OneUiInputField(
                      label: 'Medium (outlined)',
                      placeholder: 'Medium on ${row.label}',
                      start: _slotIcon('heart'),
                    ),
                  ),
                  SizedBox(height: gap),
                  _fieldDemo(
                    OneUiInputField(
                      label: 'High (filled)',
                      attention: OneUiInputAttention.high,
                      placeholder: 'Filled on ${row.label}',
                      start: _slotIcon('heart'),
                    ),
                  ),
                ],
              ),
            ),
          SizedBox(height: _spacing(context, '4-5')),
        ],
      ],
    ),
  );
}
