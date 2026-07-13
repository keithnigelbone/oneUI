import 'package:flutter/material.dart';

import '../brand/one_ui_brand_scope.dart';
import '../engine/text_style_resolve.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_icon_button.dart';
import '../widgets/one_ui_icon_button_types.dart';
import '../widgets/one_ui_input.dart';
import '../widgets/one_ui_input_types.dart';
import '../widgets/one_ui_surface.dart';
import '../widgets/one_ui_text_types.dart';

const _demoWidth = 348.0;

/// Registers [OneUiScope] + brand snapshot so gallery stories repaint on brand change.
void _bindInputBrandScope(BuildContext context) {
  OneUiScope.of(context);
  OneUiBrandLoadState.maybeOf(context);
}

Widget _inputDemo(Widget child) => SizedBox(width: _demoWidth, child: child);

Widget _slotIcon(String name) =>
    OneUiIcon(icon: name, size: '5', appearance: 'secondary');

Widget inputDefaultSection(BuildContext context) {
  _bindInputBrandScope(context);
  return _inputDemo(
    const OneUiInput(
      placeholder: 'Placeholder',
      size: 'm',
      appearance: OneUiInputAppearance.auto,
    ),
  );
}

Widget inputWithLabelAndDescriptionSection(BuildContext context) {
  _bindInputBrandScope(context);
  return _inputDemo(
    const OneUiInput(
      label: 'Email',
      description: 'We will never share your address.',
      placeholder: 'you@example.com',
      size: 'm',
    ),
  );
}

Widget inputWithExternalLabelSection(BuildContext context) {
  _bindInputBrandScope(context);
  const controlId = 'input-with-label-demo';
  final labelStyle = resolveOneUiTextTypographyStyle(
    context,
    variant: OneUiTextVariant.label,
    size: 'S',
    weight: OneUiTextWeight.medium,
  );
  return _inputDemo(
    Semantics(
      container: true,
      label: 'Search',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Search', style: labelStyle),
          const SizedBox(height: 8),
          const OneUiInput(
            id: controlId,
            placeholder: 'Placeholder',
            size: 'm',
          ),
        ],
      ),
    ),
  );
}

Widget inputSizesSection(BuildContext context) {
  _bindInputBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final row in [
        ('xs', 6),
        ('s', 8),
        ('m', 10),
        ('l', 12),
      ]) ...[
        _inputDemo(
          OneUiInput(
            placeholder: 'Input text',
            size: row.$2,
            start: _slotIcon('heart'),
            end: _slotIcon('microphone'),
          ),
        ),
        const SizedBox(height: 12),
      ],
    ],
  );
}

Widget inputAppearancesSection(BuildContext context) {
  _bindInputBrandScope(context);
  return Wrap(
    spacing: 16,
    runSpacing: 16,
    children: [
      for (final appearance in kOneUiInputAppearances)
        SizedBox(
          width: _demoWidth,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(appearance.wireValue, style: const TextStyle(fontSize: 12)),
              const SizedBox(height: 8),
              OneUiInput(
                placeholder: 'Input text',
                appearance: appearance,
                start: _slotIcon('heart'),
                end: _slotIcon('microphone'),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget inputAttentionSection(BuildContext context) {
  _bindInputBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _inputDemo(
        const OneUiInput(
          placeholder: 'Medium attention (outlined)',
          attention: OneUiInputAttention.medium,
        ),
      ),
      const SizedBox(height: 16),
      _inputDemo(
        const OneUiInput(
          placeholder: 'High attention (filled)',
          attention: OneUiInputAttention.high,
        ),
      ),
    ],
  );
}

Widget inputWithSlotsSection(BuildContext context) {
  _bindInputBrandScope(context);
  return _inputDemo(
    OneUiInput(
      placeholder: 'Input text',
      start: _slotIcon('heart'),
      start2: const Text('₹'),
      end2: const Text('.00'),
      end: _slotIcon('microphone'),
    ),
  );
}

Widget inputStatesSection(BuildContext context) {
  _bindInputBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _inputDemo(const OneUiInput(placeholder: 'Default', value: 'Input text')),
      const SizedBox(height: 12),
      _inputDemo(const OneUiInput(
          placeholder: 'Disabled', value: 'Input text', disabled: true)),
      const SizedBox(height: 12),
      _inputDemo(const OneUiInput(
          placeholder: 'Read only', value: 'Input text', readOnly: true)),
      const SizedBox(height: 12),
      _inputDemo(const OneUiInput(
          placeholder: 'Error highlight',
          value: 'Input text',
          errorHighlight: true)),
    ],
  );
}

Widget inputShapesSection(BuildContext context) {
  _bindInputBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _inputDemo(
        OneUiInput(
          placeholder: 'Default shape',
          start: _slotIcon('heart'),
          end: _slotIcon('microphone'),
        ),
      ),
      const SizedBox(height: 12),
      _inputDemo(
        OneUiInput(
          placeholder: 'Pill shape',
          shape: OneUiInputShape.pill,
          start: _slotIcon('heart'),
          end: _slotIcon('microphone'),
        ),
      ),
    ],
  );
}

Widget inputControlledSection(BuildContext context) {
  _bindInputBrandScope(context);
  return _InputControlledDemo();
}

class _InputControlledDemo extends StatefulWidget {
  @override
  State<_InputControlledDemo> createState() => _InputControlledDemoState();
}

class _InputControlledDemoState extends State<_InputControlledDemo> {
  String _value = 'Hello';

  @override
  Widget build(BuildContext context) {
    return _inputDemo(
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          OneUiInput(
            accessibilityLabel: 'Controlled input',
            value: _value,
            onChanged: (v) => setState(() => _value = v),
            placeholder: 'Type to update',
            start: _slotIcon('search'),
          ),
          const SizedBox(height: 8),
          Text('value = "$_value"'),
        ],
      ),
    );
  }
}

Widget inputSurfaceContextSection(BuildContext context) {
  _bindInputBrandScope(context);
  final scope = OneUiScope.of(context);
  final pad = resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '4',
  );
  const modes = [
    ('default', 'page background'),
    ('minimal', 'lightest tint'),
    ('subtle', 'light tint'),
    ('moderate', 'medium tint'),
    ('bold', 'full accent fill'),
  ];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final row in modes) ...[
        Text('${row.$1} — ${row.$2}', style: const TextStyle(fontSize: 12)),
        const SizedBox(height: 8),
        OneUiSurface(
          mode: row.$1,
          appearance: 'secondary',
          padding: EdgeInsets.all(pad),
          borderRadius: BorderRadius.circular(12),
          child: Column(
            children: [
              _inputDemo(
                OneUiInput(
                  accessibilityLabel: 'Medium outlined on ${row.$1}',
                  placeholder: 'Medium on ${row.$1}',
                  start: _slotIcon('heart'),
                ),
              ),
              const SizedBox(height: 12),
              _inputDemo(
                OneUiInput(
                  accessibilityLabel: 'High filled on ${row.$1}',
                  attention: OneUiInputAttention.high,
                  placeholder: 'Filled on ${row.$1}',
                  start: _slotIcon('heart'),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
      ],
    ],
  );
}

Widget inputSearchSection(BuildContext context) {
  _bindInputBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _inputDemo(
        OneUiInput(
          accessibilityLabel: 'Search',
          shape: OneUiInputShape.pill,
          start: _slotIcon('search'),
          placeholder: 'Search products, brands, categories…',
        ),
      ),
      const SizedBox(height: 12),
      _inputDemo(
        OneUiInput(
          accessibilityLabel: 'Search',
          shape: OneUiInputShape.pill,
          start: _slotIcon('search'),
          end: OneUiIconButton(
            icon: 'close',
            semanticsLabel: 'Clear search',
            size: 10,
            appearance: 'neutral',
            attention: OneUiIconButtonAttention.low,
            condensed: true,
          ),
          defaultValue: 'Sneakers',
        ),
      ),
      const SizedBox(height: 12),
      _inputDemo(
        OneUiInput(
          accessibilityLabel: 'Search',
          shape: OneUiInputShape.pill,
          attention: OneUiInputAttention.high,
          start: _slotIcon('search'),
          end: OneUiIconButton(
            icon: 'close',
            semanticsLabel: 'Clear search',
            size: 10,
            appearance: 'neutral',
            attention: OneUiIconButtonAttention.low,
            condensed: true,
          ),
          placeholder: 'Search across everything',
        ),
      ),
    ],
  );
}
