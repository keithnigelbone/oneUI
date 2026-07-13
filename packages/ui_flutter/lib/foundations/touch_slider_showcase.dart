/// TouchSlider showcase — `TouchSlider.showcase.tsx` / `TouchSlider.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_surface.dart';
import '../widgets/one_ui_touch_slider.dart';
import '../widgets/one_ui_touch_slider_types.dart';
import 'subtle_motion_scope.dart';

double touchSliderStoryGap(BuildContext context, [String tail = '4']) {
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

Widget _volumeIcon() => const OneUiIcon(icon: 'volumeOn', size: '5');

Widget _muteIcon() => const OneUiIcon(icon: 'volumeOff', size: '5');

Widget _touchSliderRow(BuildContext context, String label, Widget slider) {
  return Row(
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      SizedBox(
        width: touchSliderStoryGap(context, '12'),
        child: Text(label, style: _rowLabelStyle(context)),
      ),
      SizedBox(width: touchSliderStoryGap(context, '5')),
      // Web row is `inline-flex` on the slider — no flex-grow stretch.
      slider,
    ],
  );
}

Widget _stack(BuildContext context, List<Widget> children) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (var i = 0; i < children.length; i++) ...[
        if (i > 0) SizedBox(height: touchSliderStoryGap(context, '4-5')),
        children[i],
      ],
    ],
  );
}

/// Figma appearance roles configured on the active brand.
List<String> touchSliderFigmaAppearancesForBrand(BuildContext context) {
  final configured = OneUiSurfaceScope.appearanceRolesForBrand(context);
  return configured
      .where(kOneUiTouchSliderFigmaAppearanceRoles.contains)
      .toList(growable: false);
}

Widget buildTouchSliderDefaultPreview(BuildContext context) {
  return OneUiTouchSlider(
    defaultValue: 50,
    appearance: 'auto',
    progressStyle: 'rounded',
    start: _volumeIcon(),
    ariaLabel: 'Volume',
  );
}

Widget buildTouchSliderProgressStylesSection(BuildContext context) {
  return _stack(
    context,
    [
      _touchSliderRow(
        context,
        'rounded 0',
        OneUiTouchSlider(
          defaultValue: 0,
          progressStyle: 'rounded',
          start: _volumeIcon(),
          ariaLabel: 'Rounded at zero',
        ),
      ),
      _touchSliderRow(
        context,
        'rounded 50',
        OneUiTouchSlider(
          defaultValue: 50,
          progressStyle: 'rounded',
          start: _volumeIcon(),
          ariaLabel: 'Rounded at half',
        ),
      ),
      _touchSliderRow(
        context,
        'rounded 100',
        OneUiTouchSlider(
          defaultValue: 100,
          progressStyle: 'rounded',
          start: _volumeIcon(),
          ariaLabel: 'Rounded at max',
        ),
      ),
      _touchSliderRow(
        context,
        'sharp 0',
        OneUiTouchSlider(
          defaultValue: 0,
          progressStyle: 'sharp',
          start: _volumeIcon(),
          ariaLabel: 'Sharp at zero',
        ),
      ),
      _touchSliderRow(
        context,
        'sharp 50',
        OneUiTouchSlider(
          defaultValue: 50,
          progressStyle: 'sharp',
          start: _volumeIcon(),
          ariaLabel: 'Sharp at half',
        ),
      ),
      _touchSliderRow(
        context,
        'sharp 100',
        OneUiTouchSlider(
          defaultValue: 100,
          progressStyle: 'sharp',
          start: _volumeIcon(),
          ariaLabel: 'Sharp at max',
        ),
      ),
    ],
  );
}

Widget buildTouchSliderSlotMatrixSection(BuildContext context) {
  const values = [0, 50, 100];
  const configs = [
    ('rounded', 'horizontal'),
    ('rounded', 'vertical'),
    ('sharp', 'horizontal'),
    ('sharp', 'vertical'),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (progressStyle, orientation) in configs) ...[
        Padding(
          padding: EdgeInsets.only(bottom: touchSliderStoryGap(context, '4')),
          child: Text(
            '$progressStyle · $orientation',
            style: _sectionTitleStyle(context),
            textAlign: TextAlign.center,
          ),
        ),
        Wrap(
          spacing: touchSliderStoryGap(context, '6'),
          runSpacing: touchSliderStoryGap(context, '4'),
          crossAxisAlignment: WrapCrossAlignment.end,
          children: [
            for (final value in values)
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  OneUiTouchSlider(
                    key: ValueKey('matrix-$progressStyle-$orientation-$value'),
                    defaultValue: value.toDouble(),
                    progressStyle: progressStyle,
                    orientation: orientation,
                    start: _volumeIcon(),
                    ariaLabel: '$progressStyle $orientation $value',
                  ),
                  SizedBox(height: touchSliderStoryGap(context, '2')),
                  Text('$value', style: _microLabelStyle(context)),
                ],
              ),
          ],
        ),
        SizedBox(height: touchSliderStoryGap(context, '8')),
      ],
    ],
  );
}

Widget buildTouchSliderWithSlotsSection(BuildContext context) {
  return _stack(
    context,
    [
      _touchSliderRow(
        context,
        'start slot',
        OneUiTouchSlider(
          defaultValue: 60,
          start: _volumeIcon(),
          ariaLabel: 'Volume with icon',
        ),
      ),
      _touchSliderRow(
        context,
        'no slots',
        const OneUiTouchSlider(
          defaultValue: 60,
          ariaLabel: 'Volume no icon',
        ),
      ),
    ],
  );
}

Widget buildTouchSliderAppearancesSection(BuildContext context) {
  final roles = touchSliderFigmaAppearancesForBrand(context);
  return _stack(
    context,
    [
      for (final role in roles)
        _touchSliderRow(
          context,
          role,
          OneUiTouchSlider(
            key: ValueKey('touch-appearance-$role'),
            defaultValue: 60,
            appearance: role,
            ariaLabel: '$role touch',
          ),
        ),
    ],
  );
}

Widget buildTouchSliderStatesSection(BuildContext context) {
  return _stack(
    context,
    [
      _touchSliderRow(
        context,
        'default',
        const OneUiTouchSlider(defaultValue: 60, ariaLabel: 'Default'),
      ),
      _touchSliderRow(
        context,
        'disabled',
        const OneUiTouchSlider(
          defaultValue: 60,
          disabled: true,
          ariaLabel: 'Disabled',
        ),
      ),
      _touchSliderRow(
        context,
        'readOnly',
        const OneUiTouchSlider(
          defaultValue: 60,
          readOnly: true,
          ariaLabel: 'Read only',
        ),
      ),
    ],
  );
}

Widget buildTouchSliderFocusStateSection(BuildContext context) {
  return _stack(
    context,
    [
      _touchSliderRow(
        context,
        'idle',
        OneUiTouchSlider(
          defaultValue: 60,
          start: _muteIcon(),
          ariaLabel: 'Idle',
        ),
      ),
      _touchSliderRow(
        context,
        'focus',
        OneUiTouchSlider(
          defaultValue: 60,
          start: _muteIcon(),
          forceFocusRing: true,
          ariaLabel: 'Focused',
        ),
      ),
      _touchSliderRow(
        context,
        'disabled',
        OneUiTouchSlider(
          defaultValue: 60,
          disabled: true,
          start: _muteIcon(),
          ariaLabel: 'Disabled',
        ),
      ),
      _touchSliderRow(
        context,
        'readOnly',
        OneUiTouchSlider(
          defaultValue: 60,
          readOnly: true,
          start: _muteIcon(),
          ariaLabel: 'Read only',
        ),
      ),
    ],
  );
}

Widget _verticalCell(
  BuildContext context, {
  required String label,
  String progressStyle = 'rounded',
  required double defaultValue,
  Widget? start,
}) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      OneUiTouchSlider(
        key: ValueKey('vertical-$label'),
        defaultValue: defaultValue,
        orientation: 'vertical',
        progressStyle: progressStyle,
        start: start,
        ariaLabel: 'Vertical $label',
      ),
      SizedBox(height: touchSliderStoryGap(context, '2')),
      Text(
        label,
        style: _microLabelStyle(context),
        textAlign: TextAlign.center,
      ),
    ],
  );
}

Widget buildTouchSliderVerticalSection(BuildContext context) {
  return Wrap(
    spacing: touchSliderStoryGap(context, '10'),
    runSpacing: touchSliderStoryGap(context, '8'),
    alignment: WrapAlignment.center,
    children: [
      Column(
        children: [
          Text('Progress × value', style: _sectionTitleStyle(context)),
          SizedBox(height: touchSliderStoryGap(context, '4-5')),
          Wrap(
            spacing: touchSliderStoryGap(context, '6'),
            children: [
              _verticalCell(context, label: 'rounded 0', defaultValue: 0, start: _volumeIcon()),
              _verticalCell(context, label: 'rounded 50', defaultValue: 50, start: _volumeIcon()),
              _verticalCell(context, label: 'rounded 100', defaultValue: 100, start: _volumeIcon()),
              _verticalCell(context, label: 'sharp 0', progressStyle: 'sharp', defaultValue: 0, start: _volumeIcon()),
              _verticalCell(context, label: 'sharp 50', progressStyle: 'sharp', defaultValue: 50, start: _volumeIcon()),
              _verticalCell(context, label: 'sharp 100', progressStyle: 'sharp', defaultValue: 100, start: _volumeIcon()),
            ],
          ),
        ],
      ),
      Column(
        children: [
          Text('Slot combinations', style: _sectionTitleStyle(context)),
          SizedBox(height: touchSliderStoryGap(context, '4-5')),
          Wrap(
            spacing: touchSliderStoryGap(context, '6'),
            children: [
              _verticalCell(context, label: 'no slots', defaultValue: 60),
              _verticalCell(context, label: 'start', defaultValue: 60, start: _volumeIcon()),
              _verticalCell(context, label: 'start @ 0', defaultValue: 0, start: _muteIcon()),
              _verticalCell(context, label: 'start @ 100', defaultValue: 100, start: _volumeIcon()),
            ],
          ),
        ],
      ),
      Column(
        children: [
          Text('Progress × slots', style: _sectionTitleStyle(context)),
          SizedBox(height: touchSliderStoryGap(context, '4-5')),
          Wrap(
            spacing: touchSliderStoryGap(context, '6'),
            children: [
              _verticalCell(context, label: 'rounded + start', defaultValue: 60, start: _volumeIcon()),
              _verticalCell(context, label: 'sharp + start', progressStyle: 'sharp', defaultValue: 60, start: _volumeIcon()),
            ],
          ),
        ],
      ),
    ],
  );
}

typedef _SurfaceCase = ({
  String label,
  String surfaceMode,
  String surfaceAppearance,
  String sliderAppearance,
  String progressStyle,
  double defaultValue,
  String orientation,
  bool withSlots,
});

Widget _surfaceContextRow(BuildContext context, _SurfaceCase config) {
  return _touchSliderRow(
    context,
    config.label,
    OneUiSurface(
      mode: config.surfaceMode,
      appearance: config.surfaceAppearance,
      padding: EdgeInsets.symmetric(
        horizontal: touchSliderStoryGap(context, '4-5'),
        vertical: touchSliderStoryGap(context, '4'),
      ),
      borderRadius: BorderRadius.circular(touchSliderStoryGap(context, '4')),
      child: OneUiTouchSlider(
        defaultValue: config.defaultValue,
        appearance: config.sliderAppearance,
        progressStyle: config.progressStyle,
        orientation: config.orientation,
        start: config.withSlots ? _muteIcon() : null,
        ariaLabel:
            '${config.label}: surface ${config.surfaceAppearance}, slider ${config.sliderAppearance}',
      ),
    ),
  );
}

Widget _surfaceSection(BuildContext context, String title, List<_SurfaceCase> cases) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Padding(
        padding: EdgeInsets.only(bottom: touchSliderStoryGap(context, '1')),
        child: Text(title, style: _sectionTitleStyle(context)),
      ),
      ...cases.map((c) => Padding(
            padding: EdgeInsets.only(bottom: touchSliderStoryGap(context, '4-5')),
            child: _surfaceContextRow(context, c),
          )),
    ],
  );
}

Widget buildTouchSliderSurfaceContextSection(BuildContext context) {
  const modeCases = [
    (
      label: 'default · secondary',
      surfaceMode: 'default',
      surfaceAppearance: 'secondary',
      sliderAppearance: 'secondary',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'minimal · secondary',
      surfaceMode: 'minimal',
      surfaceAppearance: 'secondary',
      sliderAppearance: 'secondary',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'subtle · secondary',
      surfaceMode: 'subtle',
      surfaceAppearance: 'secondary',
      sliderAppearance: 'secondary',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'bold · secondary',
      surfaceMode: 'bold',
      surfaceAppearance: 'secondary',
      sliderAppearance: 'secondary',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
  ];

  const appearanceCases = [
    (
      label: 'bold · primary',
      surfaceMode: 'bold',
      surfaceAppearance: 'primary',
      sliderAppearance: 'primary',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'bold · sparkle',
      surfaceMode: 'bold',
      surfaceAppearance: 'sparkle',
      sliderAppearance: 'sparkle',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'subtle · positive',
      surfaceMode: 'subtle',
      surfaceAppearance: 'positive',
      sliderAppearance: 'positive',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'subtle · negative',
      surfaceMode: 'subtle',
      surfaceAppearance: 'negative',
      sliderAppearance: 'negative',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
  ];

  const sharpCases = [
    (
      label: 'sharp · subtle secondary',
      surfaceMode: 'subtle',
      surfaceAppearance: 'secondary',
      sliderAppearance: 'secondary',
      progressStyle: 'sharp',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'sharp · bold primary',
      surfaceMode: 'bold',
      surfaceAppearance: 'primary',
      sliderAppearance: 'primary',
      progressStyle: 'sharp',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'sharp @ 0 · bold',
      surfaceMode: 'bold',
      surfaceAppearance: 'secondary',
      sliderAppearance: 'secondary',
      progressStyle: 'sharp',
      defaultValue: 0.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'sharp · vertical subtle',
      surfaceMode: 'subtle',
      surfaceAppearance: 'secondary',
      sliderAppearance: 'secondary',
      progressStyle: 'sharp',
      defaultValue: 60.0,
      orientation: 'vertical',
      withSlots: true,
    ),
  ];

  const mismatchCases = [
    (
      label: 'surface primary · slider secondary',
      surfaceMode: 'bold',
      surfaceAppearance: 'primary',
      sliderAppearance: 'secondary',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'surface secondary · slider primary',
      surfaceMode: 'bold',
      surfaceAppearance: 'secondary',
      sliderAppearance: 'primary',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'surface positive · slider negative',
      surfaceMode: 'subtle',
      surfaceAppearance: 'positive',
      sliderAppearance: 'negative',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
    (
      label: 'surface sparkle · slider informative',
      surfaceMode: 'subtle',
      surfaceAppearance: 'sparkle',
      sliderAppearance: 'informative',
      progressStyle: 'rounded',
      defaultValue: 60.0,
      orientation: 'horizontal',
      withSlots: true,
    ),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _surfaceSection(context, 'Surface modes (matched secondary)', modeCases),
      SizedBox(height: touchSliderStoryGap(context, '8')),
      _surfaceSection(context, 'Surface appearances (matched)', appearanceCases),
      SizedBox(height: touchSliderStoryGap(context, '8')),
      _surfaceSection(context, 'Sharp edge on tinted surfaces', sharpCases),
      SizedBox(height: touchSliderStoryGap(context, '8')),
      _surfaceSection(
        context,
        'Surface vs slider appearance mismatch',
        mismatchCases,
      ),
    ],
  );
}

Widget buildTouchSliderMotionSection(BuildContext context) {
  return const _TouchSliderMotionDemo();
}

class _TouchSliderMotionDemo extends StatefulWidget {
  const _TouchSliderMotionDemo();

  @override
  State<_TouchSliderMotionDemo> createState() => _TouchSliderMotionDemoState();
}

class _TouchSliderMotionDemoState extends State<_TouchSliderMotionDemo> {
  bool _subtleMotion = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Fill settle animation on value change. Toggle Subtle motion to compare '
          'reduced-motion behaviour.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        SizedBox(height: touchSliderStoryGap(context, '4')),
        FilterChip(
          label: const Text('subtleMotion'),
          selected: _subtleMotion,
          onSelected: (v) => setState(() => _subtleMotion = v),
        ),
        SizedBox(height: touchSliderStoryGap(context, '4-5')),
        oneUiSubtleMotionScope(
          context: context,
          subtleMotion: _subtleMotion,
          touchSlider: true,
          child: _stack(
            context,
            [
              _touchSliderRow(
                context,
                'rounded',
                const OneUiTouchSlider(
                  defaultValue: 60,
                  progressStyle: 'rounded',
                  ariaLabel: 'Rounded motion',
                ),
              ),
              _touchSliderRow(
                context,
                'sharp',
                const OneUiTouchSlider(
                  defaultValue: 60,
                  progressStyle: 'sharp',
                  ariaLabel: 'Sharp motion',
                ),
              ),
              _touchSliderRow(
                context,
                'rounded + icon',
                OneUiTouchSlider(
                  defaultValue: 60,
                  progressStyle: 'rounded',
                  start: _volumeIcon(),
                  ariaLabel: 'Rounded with icon motion',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
