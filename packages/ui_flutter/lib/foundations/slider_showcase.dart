/// Slider showcase — `Slider.showcase.tsx` / `Slider.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_icon_button.dart';
import '../widgets/one_ui_icon_button_types.dart';
import '../widgets/one_ui_slider.dart';
import '../widgets/one_ui_slider_types.dart';
import '../widgets/one_ui_surface.dart';
import 'subtle_motion_scope.dart';

double sliderStoryGap(BuildContext context, [String tail = '4']) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: tail,
  );
}

TextStyle? _rowLabelStyle(BuildContext context) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', 'S', emphasis: 'medium') ??
      Theme.of(context).textTheme.labelSmall?.copyWith(
            fontWeight: FontWeight.w500,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
}

TextStyle? _sectionTitleStyle(BuildContext context) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', 'S', emphasis: 'medium') ??
      Theme.of(context).textTheme.labelMedium;
}

TextStyle? _microLabelStyle(BuildContext context) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', 'XS', emphasis: 'low') ??
      Theme.of(context).textTheme.labelSmall;
}

Widget _sliderWrap(BuildContext context, Widget child) {
  return Padding(
    padding: EdgeInsets.only(top: sliderStoryGap(context, '7')),
    child: SizedBox(
      width: 328,
      child: child,
    ),
  );
}

Widget _sliderRow(BuildContext context, String label, Widget slider) {
  return Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SizedBox(
        width: sliderStoryGap(context, '12'),
        child: Padding(
          padding: EdgeInsets.only(top: sliderStoryGap(context, '7')),
          child: Text(label, style: _rowLabelStyle(context)),
        ),
      ),
      SizedBox(width: sliderStoryGap(context, '5')),
      Expanded(child: _sliderWrap(context, slider)),
    ],
  );
}

Widget _stack(BuildContext context, List<Widget> children) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (var i = 0; i < children.length; i++) ...[
        if (i > 0) SizedBox(height: sliderStoryGap(context, '4-5')),
        children[i],
      ],
    ],
  );
}

/// Figma appearance roles configured on the active brand.
List<String> sliderFigmaAppearancesForBrand(BuildContext context) {
  final configured = OneUiSurfaceScope.appearanceRolesForBrand(context);
  return configured
      .where(kOneUiSliderFigmaAppearanceRoles.contains)
      .toList(growable: false);
}

OneUiIconButton _sliderSlotIconButton({
  required String icon,
  required String label,
  VoidCallback? onPressed,
}) {
  return OneUiIconButton(
    icon: icon,
    semanticsLabel: label,
    size: 10,
    appearance: 'auto',
    attention: OneUiIconButtonAttention.low,
    condensed: true,
    onPressed: onPressed ?? () {},
  );
}

Widget buildSliderDefaultPreview(BuildContext context) {
  return _sliderWrap(
    context,
    const OneUiSlider(
      defaultValue: 50,
      step: 10,
      ariaLabel: 'Volume',
    ),
  );
}

Widget buildSliderAppearancesSection(BuildContext context) {
  final roles = sliderFigmaAppearancesForBrand(context);
  return _stack(
    context,
    [
      for (final role in roles)
        _sliderRow(
          context,
          role,
          OneUiSlider(
            key: ValueKey('slider-appearance-$role'),
            defaultValue: 60,
            appearance: role,
            ariaLabel: '$role slider',
          ),
        ),
    ],
  );
}

Widget buildSliderStatesSection(BuildContext context) {
  return _stack(
    context,
    [
      _sliderRow(
        context,
        'default',
        const OneUiSlider(defaultValue: 40, ariaLabel: 'Default'),
      ),
      _sliderRow(
        context,
        'disabled',
        const OneUiSlider(
          defaultValue: 40,
          disabled: true,
          ariaLabel: 'Disabled',
        ),
      ),
      _sliderRow(
        context,
        'readOnly',
        const OneUiSlider(
          defaultValue: 40,
          readOnly: true,
          ariaLabel: 'Read only',
        ),
      ),
    ],
  );
}

Widget buildSliderTypesSection(BuildContext context) {
  return _stack(
    context,
    [
      _sliderRow(
        context,
        'continuous',
        const OneUiSlider(defaultValue: 60, ariaLabel: 'Continuous'),
      ),
      _sliderRow(
        context,
        'range',
        const OneUiSlider(
          defaultValue: [20.0, 70.0],
          ariaLabel: 'Range',
          ariaLabels: ['Min', 'Max'],
        ),
      ),
    ],
  );
}

Widget buildSliderKnobStylesSection(BuildContext context) {
  return _stack(
    context,
    [
      _sliderRow(
        context,
        'outside',
        const OneUiSlider(
          defaultValue: 50,
          knobStyle: 'outside',
          ariaLabel: 'Outside',
        ),
      ),
      _sliderRow(
        context,
        'inside',
        const OneUiSlider(
          defaultValue: 50,
          knobStyle: 'inside',
          ariaLabel: 'Inside',
        ),
      ),
      _sliderRow(
        context,
        'outside · range',
        const OneUiSlider(
          defaultValue: [25.0, 75.0],
          knobStyle: 'outside',
          ariaLabel: 'Outside range',
        ),
      ),
      _sliderRow(
        context,
        'inside · range',
        const OneUiSlider(
          defaultValue: [25.0, 75.0],
          knobStyle: 'inside',
          ariaLabel: 'Inside range',
        ),
      ),
    ],
  );
}

Widget buildSliderKnobStatesSection(BuildContext context) {
  const states = ['idle', 'hover', 'focus', 'pressed'];
  return _stack(
    context,
    [
      for (final knobStyle in ['outside', 'inside']) ...[
        Padding(
          padding: EdgeInsets.only(bottom: sliderStoryGap(context, '2')),
          child: Text(
            'knobStyle: $knobStyle',
            style: _sectionTitleStyle(context),
          ),
        ),
        for (final label in states)
          _sliderRow(
            context,
            label,
            OneUiSlider(
              key: ValueKey('knob-$knobStyle-$label'),
              defaultValue: 50,
              knobStyle: knobStyle,
              ariaLabel: '$knobStyle $label',
            ),
          ),
        if (knobStyle == 'outside')
          SizedBox(height: sliderStoryGap(context, '2')),
      ],
    ],
  );
}

Widget buildSliderWithStepsSection(BuildContext context) {
  Text stepLabel(String text) {
    final style = _microLabelStyle(context);
    return Text(text, style: style, textAlign: TextAlign.center);
  }

  return _stack(
    context,
    [
      _sliderRow(
        context,
        'snap · 5 steps',
        OneUiSlider(
          defaultValue: 50,
          min: 0,
          max: 100,
          step: 25,
          showSteps: true,
          snapToSteps: true,
          stepLabels: ['0', '25', '50', '75', '100'].map(stepLabel).toList(),
          ariaLabel: 'Snapping stepped slider',
        ),
      ),
      _sliderRow(
        context,
        'free · 5 steps',
        OneUiSlider(
          defaultValue: 50,
          min: 0,
          max: 100,
          step: 25,
          showSteps: true,
          snapToSteps: false,
          stepLabels: ['0', '25', '50', '75', '100'].map(stepLabel).toList(),
          ariaLabel: 'Free-sliding stepped slider',
        ),
      ),
      _sliderRow(
        context,
        'snap · 11 steps',
        const OneUiSlider(
          defaultValue: 50,
          min: 0,
          max: 100,
          step: 10,
          showSteps: true,
          snapToSteps: true,
          ariaLabel: '10-step snapping slider',
        ),
      ),
      _sliderRow(
        context,
        'free · 11 steps',
        const OneUiSlider(
          defaultValue: 50,
          min: 0,
          max: 100,
          step: 10,
          showSteps: true,
          snapToSteps: false,
          ariaLabel: '10-step free-sliding slider',
        ),
      ),
    ],
  );
}

Widget buildSliderSizesSection(BuildContext context) {
  return _stack(
    context,
    [
      for (final size in kOneUiSliderSizes) ...[
        Padding(
          padding: EdgeInsets.only(bottom: sliderStoryGap(context, '2')),
          child: Text(
            'size: $size',
            style: _sectionTitleStyle(context),
          ),
        ),
        _sliderRow(
          context,
          'outside · continuous',
          OneUiSlider(
            key: ValueKey('size-$size-outside-continuous'),
            size: size,
            defaultValue: 50,
            knobStyle: 'outside',
            start: _sliderSlotIconButton(icon: 'remove', label: 'Decrease'),
            end: _sliderSlotIconButton(icon: 'add', label: 'Increase'),
            ariaLabel: '$size outside continuous',
          ),
        ),
        _sliderRow(
          context,
          'outside · range',
          OneUiSlider(
            key: ValueKey('size-$size-outside-range'),
            size: size,
            defaultValue: const [25.0, 75.0],
            knobStyle: 'outside',
            start: _sliderSlotIconButton(icon: 'remove', label: 'Decrease'),
            end: _sliderSlotIconButton(icon: 'add', label: 'Increase'),
            ariaLabel: '$size outside range',
            ariaLabels: const ['Min', 'Max'],
          ),
        ),
        _sliderRow(
          context,
          'inside · continuous',
          OneUiSlider(
            key: ValueKey('size-$size-inside-continuous'),
            size: size,
            defaultValue: 50,
            knobStyle: 'inside',
            start: _sliderSlotIconButton(icon: 'remove', label: 'Decrease'),
            end: _sliderSlotIconButton(icon: 'add', label: 'Increase'),
            ariaLabel: '$size inside continuous',
          ),
        ),
        _sliderRow(
          context,
          'inside · range',
          OneUiSlider(
            key: ValueKey('size-$size-inside-range'),
            size: size,
            defaultValue: const [25.0, 75.0],
            knobStyle: 'inside',
            start: _sliderSlotIconButton(icon: 'remove', label: 'Decrease'),
            end: _sliderSlotIconButton(icon: 'add', label: 'Increase'),
            ariaLabel: '$size inside range',
            ariaLabels: const ['Min', 'Max'],
          ),
        ),
        if (size != kOneUiSliderSizes.last)
          SizedBox(height: sliderStoryGap(context, '4')),
      ],
    ],
  );
}

Widget buildSliderWithSlotsSection(BuildContext context) {
  return const _SliderWithSlotsDemo();
}

class _SliderWithSlotsDemo extends StatefulWidget {
  const _SliderWithSlotsDemo();

  @override
  State<_SliderWithSlotsDemo> createState() => _SliderWithSlotsDemoState();
}

class _SliderWithSlotsDemoState extends State<_SliderWithSlotsDemo> {
  double _continuousValue = 50;
  List<double> _rangeValue = [25, 75];
  static const _step = 5.0;

  OneUiIconButton _stepButton({
    required String icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return _sliderSlotIconButton(
      icon: icon,
      label: label,
      onPressed: onPressed,
    );
  }

  @override
  Widget build(BuildContext context) {
    return _stack(
      context,
      [
        _sliderRow(
          context,
          'continuous · iconButton',
          OneUiSlider(
            value: _continuousValue,
            onValueChange: (v) =>
                setState(() => _continuousValue = v as double),
            ariaLabel: 'Volume',
            start: _stepButton(
              icon: 'remove',
              label: 'Decrease',
              onPressed: () => setState(
                () => _continuousValue =
                    (_continuousValue - _step).clamp(0, 100),
              ),
            ),
            end: _stepButton(
              icon: 'add',
              label: 'Increase',
              onPressed: () => setState(
                () => _continuousValue =
                    (_continuousValue + _step).clamp(0, 100),
              ),
            ),
          ),
        ),
        _sliderRow(
          context,
          'continuous · icon',
          const OneUiSlider(
            defaultValue: 50,
            ariaLabel: 'Volume with icons',
            start: OneUiIcon(icon: 'remove', size: '5'),
            end: OneUiIcon(icon: 'add', size: '5'),
          ),
        ),
        _sliderRow(
          context,
          'range · iconButton',
          OneUiSlider(
            value: _rangeValue,
            onValueChange: (v) =>
                setState(() => _rangeValue = List<double>.from(v as List)),
            ariaLabels: const ['Minimum', 'Maximum'],
            start: _stepButton(
              icon: 'remove',
              label: 'Decrease minimum',
              onPressed: () => setState(() {
                _rangeValue = [
                  (_rangeValue[0] - _step).clamp(0, 100),
                  _rangeValue[1],
                ];
              }),
            ),
            end: _stepButton(
              icon: 'add',
              label: 'Increase maximum',
              onPressed: () => setState(() {
                _rangeValue = [
                  _rangeValue[0],
                  (_rangeValue[1] + _step).clamp(0, 100),
                ];
              }),
            ),
          ),
        ),
        _sliderRow(
          context,
          'range · icon',
          const OneUiSlider(
            defaultValue: [25.0, 75.0],
            ariaLabels: const ['Minimum', 'Maximum'],
            start: OneUiIcon(icon: 'remove', size: '5'),
            end: OneUiIcon(icon: 'add', size: '5'),
          ),
        ),
      ],
    );
  }
}

Widget buildSliderVerticalSection(BuildContext context) {
  return Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Column(
        children: [
          Text('outside', style: _rowLabelStyle(context)),
          SizedBox(height: sliderStoryGap(context, '3-5')),
          const SizedBox(
            height: 200,
            child: OneUiSlider(
              defaultValue: 60,
              orientation: 'vertical',
              knobStyle: 'outside',
              ariaLabel: 'Vertical outside',
            ),
          ),
        ],
      ),
      SizedBox(width: sliderStoryGap(context, '7')),
      Column(
        children: [
          Text('inside', style: _rowLabelStyle(context)),
          SizedBox(height: sliderStoryGap(context, '3-5')),
          const SizedBox(
            height: 200,
            child: OneUiSlider(
              defaultValue: 60,
              orientation: 'vertical',
              knobStyle: 'inside',
              ariaLabel: 'Vertical inside',
            ),
          ),
        ],
      ),
    ],
  );
}

Widget buildSliderSurfaceContextSection(BuildContext context) {
  const modes = ['default', 'minimal', 'subtle', 'bold'];
  return _stack(
    context,
    [
      for (final mode in modes)
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 100,
              child: Padding(
                padding: EdgeInsets.only(top: sliderStoryGap(context, '7')),
                child: Text(mode, style: _rowLabelStyle(context)),
              ),
            ),
            Expanded(
              child: OneUiSurface(
                mode: mode,
                appearance: 'secondary',
                padding: EdgeInsets.fromLTRB(
                  sliderStoryGap(context, '4-5'),
                  sliderStoryGap(context, '7'),
                  sliderStoryGap(context, '4-5'),
                  sliderStoryGap(context, '4'),
                ),
                borderRadius: BorderRadius.circular(sliderStoryGap(context, '4')),
                child: const OneUiSlider(
                  defaultValue: 50,
                  appearance: 'secondary',
                  ariaLabel: 'Slider on surface',
                ),
              ),
            ),
          ],
        ),
    ],
  );
}

Widget buildSliderMotionSection(BuildContext context) {
  return const _SliderMotionDemo();
}

/// Figma dev-node matrix: `size` × `type` × `knobStyle` with start/end slots.
Widget buildSliderFigmaMatrixSection(BuildContext context) {
  final minus = _sliderSlotIconButton(icon: 'remove', label: 'Decrease');
  final plus = _sliderSlotIconButton(icon: 'add', label: 'Increase');

  Widget matrixSlider({
    required String size,
    required Object defaultValue,
    required String knobStyle,
    required String label,
  }) {
    return OneUiSlider(
      key: ValueKey('figma-matrix-$label-$size-$knobStyle-$defaultValue'),
      size: size,
      defaultValue: defaultValue,
      knobStyle: knobStyle,
      appearance: 'secondary',
      start: minus,
      end: plus,
      ariaLabel: label,
      ariaLabels: defaultValue is List ? const ['Min', 'Max'] : null,
    );
  }

  Widget columnHeader(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: sliderStoryGap(context, '2')),
      child: Text(text, style: _sectionTitleStyle(context)),
    );
  }

  Widget matrixRow(String rowLabel, String size, String knobStyle) {
    return Padding(
      padding: EdgeInsets.only(bottom: sliderStoryGap(context, '4-5')),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: sliderStoryGap(context, '12'),
            child: Padding(
              padding: EdgeInsets.only(top: sliderStoryGap(context, '7')),
              child: Text(rowLabel, style: _rowLabelStyle(context)),
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                columnHeader('continuous'),
                matrixSlider(
                  size: size,
                  defaultValue: 60,
                  knobStyle: knobStyle,
                  label: '$rowLabel continuous',
                ),
              ],
            ),
          ),
          SizedBox(width: sliderStoryGap(context, '5')),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                columnHeader('range'),
                matrixSlider(
                  size: size,
                  defaultValue: const [25.0, 75.0],
                  knobStyle: knobStyle,
                  label: '$rowLabel range',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Figma API: size × type × knobStyle × start/end iconButton. '
        '328px layout width; track thickness and knob diameter scale per size.',
        style: _microLabelStyle(context),
      ),
      SizedBox(height: sliderStoryGap(context, '4')),
      for (final size in kOneUiSliderSizes) ...[
        Padding(
          padding: EdgeInsets.only(bottom: sliderStoryGap(context, '2')),
          child: Text('size: $size', style: _sectionTitleStyle(context)),
        ),
        matrixRow('outside', size, 'outside'),
        matrixRow('inside', size, 'inside'),
        if (size != kOneUiSliderSizes.last)
          SizedBox(height: sliderStoryGap(context, '4')),
      ],
    ],
  );
}

class _SliderMotionDemo extends StatefulWidget {
  const _SliderMotionDemo();

  @override
  State<_SliderMotionDemo> createState() => _SliderMotionDemoState();
}

class _SliderMotionDemoState extends State<_SliderMotionDemo> {
  bool _subtleMotion = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Knob scale and value-tooltip motion. Toggle Subtle motion to compare '
          'reduced-motion behaviour (colour transitions only).',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        SizedBox(height: sliderStoryGap(context, '4')),
        FilterChip(
          label: const Text('subtleMotion'),
          selected: _subtleMotion,
          onSelected: (v) => setState(() => _subtleMotion = v),
        ),
        SizedBox(height: sliderStoryGap(context, '4-5')),
        oneUiSubtleMotionScope(
          context: context,
          subtleMotion: _subtleMotion,
          child: buildSliderKnobStylesSection(context),
        ),
      ],
    );
  }
}
