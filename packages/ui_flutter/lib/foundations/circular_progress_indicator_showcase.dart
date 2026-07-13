/// CircularProgressIndicator showcase — `CircularProgressIndicator.stories.tsx`.
library;

import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_circular_progress_indicator.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_surface.dart';

double cpiStoryGap(BuildContext context, [String tail = '4']) {
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
  return typo?.emphasisStyle('label', 'S', emphasis: 'low') ??
      Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
}

Widget _sectionLabel(BuildContext context, String text) {
  return Text(text, style: _caption(context));
}

Widget cpiStoryColumn(
  BuildContext context, {
  required Widget indicator,
  required String label,
}) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      indicator,
      SizedBox(height: cpiStoryGap(context, '3')),
      _sectionLabel(context, label),
    ],
  );
}

Widget buildCpiDefaultPreview(BuildContext context) {
  return OneUiCircularProgressIndicator(
    value: 25,
    size: 'M',
    appearance: 'secondary',
    semanticsLabel: 'Task progress',
  );
}

Widget buildCpiVariantsSection(BuildContext context) {
  return Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      cpiStoryColumn(
        context,
        indicator: const OneUiCircularProgressIndicator(
          key: ValueKey('cpi-variant-determinate'),
          variant: 'determinate',
          value: 65,
          size: '3XL',
          semanticsLabel: 'Determinate progress',
        ),
        label: 'Determinate',
      ),
      SizedBox(width: cpiStoryGap(context, '6')),
      cpiStoryColumn(
        context,
        indicator: const OneUiCircularProgressIndicator(
          key: ValueKey('cpi-variant-indeterminate'),
          variant: 'indeterminate',
          size: '3XL',
          semanticsLabel: 'Indeterminate progress',
        ),
        label: 'Indeterminate',
      ),
    ],
  );
}

Widget buildCpiSizesSection(BuildContext context) {
  return Wrap(
    spacing: cpiStoryGap(context, '4-5'),
    runSpacing: cpiStoryGap(context, '4'),
    crossAxisAlignment: WrapCrossAlignment.end,
    children: [
      for (final size in kOneUiCircularProgressIndicatorSizes)
        cpiStoryColumn(
          context,
          indicator: OneUiCircularProgressIndicator(
            key: ValueKey('cpi-size-$size'),
            value: 65,
            size: size,
            semanticsLabel: '$size progress',
          ),
          label: size,
        ),
    ],
  );
}

Widget buildCpiAppearancesSection(BuildContext context) {
  return Wrap(
    spacing: cpiStoryGap(context, '6'),
    runSpacing: cpiStoryGap(context, '4'),
    children: [
      for (final appearance
          in OneUiSurfaceScope.appearanceRolesForBrand(context))
        cpiStoryColumn(
          context,
          indicator: OneUiCircularProgressIndicator(
            key: ValueKey('cpi-appearance-$appearance'),
            value: 65,
            size: '3XL',
            appearance: appearance,
            semanticsLabel: '$appearance progress',
          ),
          label: appearance,
        ),
    ],
  );
}

Widget buildCpiWithContentSection(BuildContext context) {
  return Row(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _sectionLabel(context, 'Text (auto percentage)'),
          SizedBox(height: cpiStoryGap(context, '4-5')),
          Wrap(
            spacing: cpiStoryGap(context, '4-5'),
            runSpacing: cpiStoryGap(context, '4'),
            children: [
              for (final size in kCpiLabelVisibleSizes)
                OneUiCircularProgressIndicator(
                  value: 25,
                  size: size,
                  content: 'text',
                  semanticsLabel: '$size text progress',
                ),
            ],
          ),
        ],
      ),
      SizedBox(width: cpiStoryGap(context, '7')),
      Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _sectionLabel(context, 'Icon (children)'),
          SizedBox(height: cpiStoryGap(context, '4-5')),
          Wrap(
            spacing: cpiStoryGap(context, '4-5'),
            runSpacing: cpiStoryGap(context, '4'),
            children: [
              for (final size in kOneUiCircularProgressIndicatorSizes)
                OneUiCircularProgressIndicator(
                  value: 50,
                  size: size,
                  content: 'icon',
                  semanticsLabel: '$size icon progress',
                  child: const OneUiIcon(icon: 'download'),
                ),
            ],
          ),
        ],
      ),
    ],
  );
}

Widget buildCpiStatesSection(BuildContext context) {
  const values = [0, 25, 50, 75, 100];
  return Wrap(
    spacing: cpiStoryGap(context, '6'),
    children: [
      for (final v in values)
        cpiStoryColumn(
          context,
          indicator: OneUiCircularProgressIndicator(
            value: v.toDouble(),
            size: '3XL',
            semanticsLabel: '$v percent',
          ),
          label: '$v%',
        ),
    ],
  );
}

Widget buildCpiSurfaceContextSection(BuildContext context) {
  const modes = [
    ('default', 'page background'),
    ('minimal', 'light tint'),
    ('subtle', 'medium tint'),
    ('moderate', 'heavier tint'),
    ('bold', 'full accent colour'),
    ('elevated', 'floating card / popover'),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, desc) in modes) ...[
        _sectionLabel(context, '$mode — $desc'),
        SizedBox(height: cpiStoryGap(context, '3')),
        OneUiSurface(
          mode: mode,
          child: Padding(
            padding: EdgeInsets.all(cpiStoryGap(context, '5')),
            child: Row(
              children: [
                const OneUiCircularProgressIndicator(
                  key: ValueKey('cpi-surface-determinate'),
                  value: 65,
                  size: '3XL',
                  semanticsLabel: 'Determinate',
                ),
                SizedBox(width: cpiStoryGap(context, '6')),
                const OneUiCircularProgressIndicator(
                  key: ValueKey('cpi-surface-indeterminate'),
                  variant: 'indeterminate',
                  size: '3XL',
                  semanticsLabel: 'Indeterminate',
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: cpiStoryGap(context, '4-5')),
      ],
    ],
  );
}

Widget buildCpiMotionIndeterminateSection(BuildContext context) {
  return const OneUiCircularProgressIndicator(
    variant: 'indeterminate',
    size: '4XL',
    semanticsLabel: 'Loading',
  );
}

Widget buildCpiMotionJumpingSection(BuildContext context) {
  return const _CpiJumpingMotionDemo();
}

Widget buildCpiMotionTrackingSection(BuildContext context) {
  return const _CpiTrackingMotionDemo();
}

Widget buildCpiMotionEntryExitSection(BuildContext context) {
  return const _CpiEntryExitMotionDemo();
}

class _CpiJumpingMotionDemo extends StatefulWidget {
  const _CpiJumpingMotionDemo();

  @override
  State<_CpiJumpingMotionDemo> createState() => _CpiJumpingMotionDemoState();
}

class _CpiJumpingMotionDemoState extends State<_CpiJumpingMotionDemo> {
  int _value = 25;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 2), (_) {
      if (!mounted) return;
      setState(() => _value = math.Random().nextInt(101));
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return OneUiCircularProgressIndicator(
      value: _value.toDouble(),
      size: '4XL',
      content: 'text',
      semanticsLabel: 'Jumping progress',
    );
  }
}

class _CpiTrackingMotionDemo extends StatefulWidget {
  const _CpiTrackingMotionDemo();

  @override
  State<_CpiTrackingMotionDemo> createState() => _CpiTrackingMotionDemoState();
}

class _CpiTrackingMotionDemoState extends State<_CpiTrackingMotionDemo> {
  int _value = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 50), (_) {
      if (!mounted) return;
      setState(() => _value = _value >= 100 ? 0 : _value + 1);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return OneUiCircularProgressIndicator(
      value: _value.toDouble(),
      size: '4XL',
      content: 'text',
      valueTransitionDuration: 0,
      semanticsLabel: 'Tracking progress',
    );
  }
}

class _CpiEntryExitMotionDemo extends StatefulWidget {
  const _CpiEntryExitMotionDemo();

  @override
  State<_CpiEntryExitMotionDemo> createState() =>
      _CpiEntryExitMotionDemoState();
}

class _CpiEntryExitMotionDemoState extends State<_CpiEntryExitMotionDemo> {
  bool _show = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        OneUiCircularProgressIndicator(
          animate: true,
          show: _show,
          value: 40,
          size: '3XL',
          semanticsLabel: 'Animated visibility',
        ),
        SizedBox(height: cpiStoryGap(context, '4')),
        TextButton(
          onPressed: () => setState(() => _show = !_show),
          child: Text(_show ? 'Hide' : 'Show'),
        ),
      ],
    );
  }
}
