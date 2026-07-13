/// IndicatorBadge showcase — `IndicatorBadge.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../engine/avatar_color_resolve.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_avatar_types.dart';
import '../widgets/one_ui_badge.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_indicator_badge.dart';
import '../widgets/one_ui_indicator_badge_overlay.dart';
import '../widgets/one_ui_indicator_badge_types.dart';
import '../widgets/one_ui_surface.dart';

const List<String> kIndicatorBadgeAppearances = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

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
  return typo?.emphasisStyle('label', 'S', emphasis: 'low') ??
      Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
}

Widget _indicator(
  BuildContext context, {
  String size = 'm',
  String appearance = 'auto',
  String semanticsLabel = 'Status',
}) {
  return OneUiIndicatorBadge(
    size: size,
    appearance: appearance,
    semanticsLabel: semanticsLabel,
  );
}

Widget buildIndicatorBadgeDefaultPreview(BuildContext context) {
  return Center(
    child: _indicator(context, semanticsLabel: 'New'),
  );
}

Widget buildIndicatorBadgeSizesSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '4-5'),
    runSpacing: _gap(context, '4'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final s in kOneUiIndicatorBadgeSizes)
        Column(
          children: [
            _indicator(context, size: s, semanticsLabel: 'Status $s'),
            SizedBox(height: _gap(context, '3')),
            Text(s.toUpperCase(), style: _caption(context)),
          ],
        ),
    ],
  );
}

Widget _label(BuildContext context, String text) {
  return Padding(
    padding: EdgeInsets.only(bottom: _gap(context, '3')),
    child: Text(text, style: _caption(context)),
  );
}

Widget buildIndicatorBadgeAppearancesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final role in kIndicatorBadgeAppearances)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: Row(
            children: [
              _indicator(context,
                  appearance: role, semanticsLabel: '$role status'),
              SizedBox(width: _gap(context, '4')),
              Text(
                role,
                style: _caption(context)?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

/// Invalid appearance, empty semanticsLabel, and auto on Surface.
Widget buildIndicatorBadgeEdgeCasesSection(BuildContext context) {
  final gap = _gap(context);
  final caption = _caption(context);

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      if (caption != null)
        Text(
          'Edge cases aligned with web/RN: invalid explicit appearance normalises to '
          '`neutral`; empty `semanticsLabel` logs a debug warning and is not accessible; '
          '`appearance=auto` inherits surface role inside [OneUiSurface].',
          style: caption,
        ),
      SizedBox(height: gap),
      _label(context,
          'Invalid appearance `primry` → neutral (compare `negative`)'),
      SizedBox(height: _gap(context, '2')),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _indicator(context, appearance: 'primry', semanticsLabel: 'invalid'),
          _indicator(context,
              appearance: 'negative', semanticsLabel: 'offline'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Empty semanticsLabel (debug warning, not accessible)'),
      SizedBox(height: _gap(context, '2')),
      Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _indicator(context, semanticsLabel: '   '),
          SizedBox(width: gap),
          if (caption != null)
            Expanded(
              child: Text(
                '← visible dot with no screen-reader name; check debug console',
                style: caption,
              ),
            ),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'appearance=auto inside bold Surface'),
      SizedBox(height: _gap(context, '2')),
      OneUiSurface(
        mode: 'bold',
        child: Padding(
          padding: EdgeInsets.all(_gap(context, '4')),
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children: [
              _indicator(context,
                  appearance: 'auto', semanticsLabel: 'Status auto'),
              _indicator(context,
                  appearance: 'primary', semanticsLabel: 'Status primary'),
            ],
          ),
        ),
      ),
    ],
  );
}

Widget buildIndicatorBadgeSurfaceContextSection(BuildContext context) {
  const modes = [
    ('default', 'page background'),
    ('minimal', 'light tint'),
    ('subtle', 'medium tint'),
    ('moderate', 'heavier tint'),
    ('bold', 'full accent colour'),
    ('elevated', 'floating card'),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, desc) in modes) ...[
        Text('$mode — $desc', style: _caption(context)),
        SizedBox(height: _gap(context, '3')),
        OneUiSurface(
          mode: mode,
          child: Padding(
            padding: EdgeInsets.all(_gap(context, '5')),
            child: Wrap(
              spacing: _gap(context, '4'),
              children: [
                _indicator(context, semanticsLabel: 'Status'),
                _indicator(context,
                    appearance: 'positive', semanticsLabel: 'Online'),
                _indicator(context,
                    appearance: 'negative', semanticsLabel: 'Offline'),
              ],
            ),
          ),
        ),
        SizedBox(height: _gap(context, '4-5')),
      ],
    ],
  );
}

Widget buildIndicatorBadgeResponsiveSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '4-5'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final s in kOneUiIndicatorBadgeSizes)
        _indicator(context, size: s, semanticsLabel: '$s indicator'),
    ],
  );
}

Widget buildIndicatorBadgeThemesSection(BuildContext context) {
  const modes = ['default', 'minimal', 'subtle', 'elevated'];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final mode in modes) ...[
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(width: 90, child: Text(mode, style: _caption(context))),
            SizedBox(width: _gap(context, '4-5')),
            OneUiSurface(
              mode: mode,
              child: Padding(
                padding: EdgeInsets.all(_gap(context, '4-5')),
                child: Wrap(
                  spacing: _gap(context, '4'),
                  children: [
                    _indicator(context, semanticsLabel: 'Primary'),
                    _indicator(context,
                        appearance: 'positive', semanticsLabel: 'Positive'),
                    _indicator(context,
                        appearance: 'negative', semanticsLabel: 'Negative'),
                    _indicator(context,
                        appearance: 'warning', semanticsLabel: 'Warning'),
                    _indicator(context,
                        appearance: 'informative', semanticsLabel: 'Info'),
                  ],
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: _gap(context, '4')),
      ],
    ],
  );
}

class IndicatorBadgeMotionDemo extends StatefulWidget {
  const IndicatorBadgeMotionDemo({
    super.key,
    this.reducedMotion = false,
    this.appearance = 'auto',
    this.size = 'm',
  });

  final bool reducedMotion;
  final String appearance;
  final String size;

  @override
  State<IndicatorBadgeMotionDemo> createState() =>
      _IndicatorBadgeMotionDemoState();
}

class _IndicatorBadgeMotionDemoState extends State<IndicatorBadgeMotionDemo> {
  bool _visible = true;

  @override
  Widget build(BuildContext context) {
    final duration = widget.reducedMotion
        ? const Duration(milliseconds: 135)
        : const Duration(milliseconds: 300);

    return Column(
      children: [
        Wrap(
          spacing: _gap(context, '3-5'),
          children: [
            TextButton(
                onPressed: () => setState(() => _visible = true),
                child: const Text('Entry')),
            TextButton(
                onPressed: () => setState(() => _visible = false),
                child: const Text('Exit')),
            TextButton(
              onPressed: () => setState(() => _visible = true),
              child: const Text('Reset'),
            ),
          ],
        ),
        SizedBox(height: _gap(context, '5')),
        Wrap(
          spacing: _gap(context, '4-5'),
          children: [
            for (final role in ['primary', 'positive', 'negative'])
              Column(
                children: [
                  Text(role, style: _caption(context)),
                  SizedBox(height: _gap(context, '3')),
                  AnimatedOpacity(
                    opacity: _visible ? 1 : 0,
                    duration: duration,
                    child: AnimatedScale(
                      scale: _visible || widget.reducedMotion ? 1 : 0.5,
                      duration: duration,
                      child: OneUiIndicatorBadge(
                        appearance: widget.appearance == 'auto'
                            ? role
                            : widget.appearance,
                        size: widget.size,
                        semanticsLabel: '$role status',
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ],
    );
  }
}

Widget buildIndicatorBadgeMotionSection(BuildContext context) {
  return const IndicatorBadgeMotionDemo();
}

Widget buildIndicatorBadgeWithComponentsSection(BuildContext context) {
  final scope = OneUiScope.of(context);
  final neutralBg = resolveAvatarColors(
    context,
    appearance: 'neutral',
    attention: OneUiAvatarAttention.medium,
    showingImage: false,
  );
  final avatarSide = resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '10',
  );
  final iconCircle = resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '9',
  );
  final surfaceRing = _gap(context, '0-5');
  final pageSurface = Theme.of(context).colorScheme.surface;
  final typo = OneUiScope.nativeTypographyOf(context);
  final avatarLabelStyle =
      typo?.emphasisStyle('label', 'M', emphasis: 'medium');

  Widget avatarHost() {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: neutralBg.background,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          'A',
          style: avatarLabelStyle?.copyWith(color: neutralBg.textColor),
        ),
      ),
    );
  }

  Widget iconHost() {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: neutralBg.background,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: OneUiIcon(
          icon: 'notification',
          size: '5',
          appearance: 'neutral',
          excludeFromSemantics: true,
        ),
      ),
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text('Inside Badge slots', style: _caption(context)),
      SizedBox(height: _gap(context, '3')),
      OneUiBadge(
        attention: 'high',
        semanticsLabel: 'Badge',
        start: const OneUiIndicatorBadge(
          appearance: 'negative',
          semanticsLabel: 'Unread',
        ),
        child: 'Badge',
      ),
      SizedBox(height: _gap(context, '4-5')),
      OneUiBadge(
        attention: 'medium',
        semanticsLabel: 'Badge',
        end: const OneUiIndicatorBadge(
          appearance: 'positive',
          semanticsLabel: 'Online',
        ),
        child: 'Badge',
      ),
      SizedBox(height: _gap(context, '6')),
      Text('Overlaid on components', style: _caption(context)),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context, '6'),
        runSpacing: _gap(context, '4'),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          OneUiIndicatorBadgeOverlay(
            hostSide: avatarSide,
            host: avatarHost(),
            indicatorSize: 's',
            anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
            surfaceRingColor: pageSurface,
            surfaceRingWidth: surfaceRing,
            indicator: const OneUiIndicatorBadge(
              size: 's',
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
          ),
          OneUiIndicatorBadgeOverlay(
            hostSide: iconCircle,
            host: iconHost(),
            indicatorSize: 'xs',
            anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
            indicator: const OneUiIndicatorBadge(
              size: 'xs',
              appearance: 'negative',
              semanticsLabel: '3 notifications',
            ),
          ),
        ],
      ),
    ],
  );
}
