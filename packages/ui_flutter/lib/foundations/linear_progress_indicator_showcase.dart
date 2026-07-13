/// LinearProgressIndicator showcase — `LinearProgressIndicator.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_linear_progress_indicator.dart';
import '../widgets/one_ui_surface.dart';

double lpiStoryGap(BuildContext context, [String tail = '4']) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: tail,
  );
}

double lpiStoryBarWidth(BuildContext context) {
  return resolveSpacingPx(
    designSystem: OneUiScope.of(context).designSystem,
    platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
    platformId: OneUiScope.of(context).platformId,
    density: OneUiScope.of(context).density,
    spacingName: '40',
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

Widget lpiStoryColumn(
  BuildContext context, {
  required Widget indicator,
  required String label,
}) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SizedBox(width: lpiStoryBarWidth(context), child: indicator),
      SizedBox(height: lpiStoryGap(context, '2')),
      _sectionLabel(context, label),
    ],
  );
}

Widget buildLpiDefaultPreview(BuildContext context) {
  return SizedBox(
    width: lpiStoryBarWidth(context),
    child: const OneUiLinearProgressIndicator(
      type: 'determinate',
      size: 'M',
      appearance: 'primary',
      roundCaps: true,
      value: 60,
      semanticsLabel: 'Task progress',
    ),
  );
}

Widget buildLpiDeterminateSection(BuildContext context) {
  return SizedBox(
    width: lpiStoryBarWidth(context),
    child: const OneUiLinearProgressIndicator(
      type: 'determinate',
      value: 75,
      semanticsLabel: 'Determinate progress',
    ),
  );
}

Widget buildLpiIndeterminateSection(BuildContext context) {
  return SizedBox(
    width: lpiStoryBarWidth(context),
    child: const OneUiLinearProgressIndicator(
      type: 'indeterminate',
      semanticsLabel: 'Loading',
    ),
  );
}

Widget buildLpiSizesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final size in kOneUiLinearProgressIndicatorSizes)
        Padding(
          padding: EdgeInsets.only(bottom: lpiStoryGap(context)),
          child: lpiStoryColumn(
            context,
            indicator: OneUiLinearProgressIndicator(
              key: ValueKey('lpi-size-$size'),
              size: size,
              value: 55,
              semanticsLabel: 'Size $size',
            ),
            label: size,
          ),
        ),
    ],
  );
}

Widget buildLpiAppearancesSection(BuildContext context) {
  const appearances = [
    'primary',
    'secondary',
    'neutral',
    'sparkle',
    'positive',
    'negative',
    'warning',
    'informative',
  ];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final appearance in appearances)
        Padding(
          padding: EdgeInsets.only(bottom: lpiStoryGap(context)),
          child: lpiStoryColumn(
            context,
            indicator: OneUiLinearProgressIndicator(
              key: ValueKey('lpi-appearance-$appearance'),
              appearance: appearance,
              value: 65,
              semanticsLabel: appearance,
            ),
            label: appearance,
          ),
        ),
    ],
  );
}

Widget buildLpiRoundCapsSection(BuildContext context) {
  return SizedBox(
    width: lpiStoryBarWidth(context),
    child: const OneUiLinearProgressIndicator(
      roundCaps: true,
      value: 45,
      semanticsLabel: 'Round caps',
    ),
  );
}

Widget buildLpiFlatCapsSection(BuildContext context) {
  return SizedBox(
    width: lpiStoryBarWidth(context),
    child: const OneUiLinearProgressIndicator(
      roundCaps: false,
      value: 45,
      semanticsLabel: 'Flat caps',
    ),
  );
}

Widget buildLpiProgressValuesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final value in [0, 25, 50, 75, 100])
        Padding(
          padding: EdgeInsets.only(bottom: lpiStoryGap(context)),
          child: lpiStoryColumn(
            context,
            indicator: OneUiLinearProgressIndicator(
              key: ValueKey('lpi-value-$value'),
              value: value.toDouble(),
              semanticsLabel: '$value percent',
            ),
            label: '$value%',
          ),
        ),
    ],
  );
}

Widget buildLpiSurfaceContextSection(BuildContext context) {
  const modes = [
    'default',
    'minimal',
    'subtle',
    'moderate',
    'bold',
    'elevated',
  ];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final mode in modes)
        Padding(
          padding: EdgeInsets.only(bottom: lpiStoryGap(context, '5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _sectionLabel(context, mode),
              SizedBox(height: lpiStoryGap(context, '2')),
              OneUiSurface(
                mode: mode,
                appearance: 'secondary',
                padding: EdgeInsets.all(lpiStoryGap(context)),
                borderRadius: BorderRadius.circular(lpiStoryGap(context)),
                child: SizedBox(
                  width: double.infinity,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      OneUiLinearProgressIndicator(
                        type: 'determinate',
                        appearance: 'secondary',
                        value: 60,
                        semanticsLabel: 'Determinate on $mode',
                      ),
                      SizedBox(height: lpiStoryGap(context, '3')),
                      OneUiLinearProgressIndicator(
                        type: 'indeterminate',
                        appearance: 'secondary',
                        semanticsLabel: 'Indeterminate on $mode',
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildLpiAllVariantsSection(BuildContext context) {
  final barWidth = lpiStoryBarWidth(context);
  Widget section(String title, List<Widget> bars) {
    return Padding(
      padding: EdgeInsets.only(bottom: lpiStoryGap(context, '6')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionLabel(context, title),
          SizedBox(height: lpiStoryGap(context, '3')),
          for (final bar in bars)
            Padding(
              padding: EdgeInsets.only(bottom: lpiStoryGap(context, '3')),
              child: SizedBox(width: barWidth, child: bar),
            ),
        ],
      ),
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      section(
        'Determinate · round caps · sizes',
        [
          for (final size in kOneUiLinearProgressIndicatorSizes)
            OneUiLinearProgressIndicator(
              size: size,
              value: 60,
              semanticsLabel: 'Det $size',
            ),
        ],
      ),
      section(
        'Determinate · flat caps · sizes',
        [
          for (final size in kOneUiLinearProgressIndicatorSizes)
            OneUiLinearProgressIndicator(
              size: size,
              roundCaps: false,
              value: 60,
              semanticsLabel: 'Det flat $size',
            ),
        ],
      ),
      section(
        'Indeterminate · round caps · sizes',
        [
          for (final size in kOneUiLinearProgressIndicatorSizes)
            OneUiLinearProgressIndicator(
              type: 'indeterminate',
              size: size,
              semanticsLabel: 'Ind round $size',
            ),
        ],
      ),
      section(
        'Indeterminate · flat caps · sizes',
        [
          for (final size in kOneUiLinearProgressIndicatorSizes)
            OneUiLinearProgressIndicator(
              type: 'indeterminate',
              size: size,
              roundCaps: false,
              semanticsLabel: 'Ind flat $size',
            ),
        ],
      ),
    ],
  );
}
