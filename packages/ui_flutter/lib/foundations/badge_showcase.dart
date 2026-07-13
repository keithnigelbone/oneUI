/// Badge showcase — `Badge.stories.tsx` / `Badge.showcase.tsx`.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_avatar.dart';
import '../widgets/one_ui_avatar_types.dart';
import '../widgets/one_ui_badge.dart';
import '../widgets/one_ui_badge_types.dart';
import '../widgets/one_ui_icon.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_surface.dart';

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

Widget _label(BuildContext context, String text, {double? width}) {
  final child = Text(text, style: _caption(context));
  if (width != null) {
    return SizedBox(width: width, child: child);
  }
  return child;
}

Widget _badge(
  BuildContext context, {
  String attention = 'high',
  String size = 'm',
  String appearance = 'auto',
  String text = 'Badge',
  Widget? start,
  Widget? end,
}) {
  return OneUiBadge(
    attention: attention,
    size: size,
    appearance: appearance,
    semanticsLabel: text,
    start: start,
    end: end,
    child: text,
  );
}

Widget _slotIconHeart() =>
    const OneUiIcon(icon: 'heart', excludeFromSemantics: true);

Widget _slotIconUser() =>
    const OneUiIcon(icon: 'user', excludeFromSemantics: true);

Widget _slotAvatar() => const OneUiAvatar(
      content: OneUiAvatarContent.icon,
      size: 'm',
      appearance: 'primary',
      alt: '',
      excludeFromSemantics: true,
    );

Widget _slotCounter() => const OneUiCounterBadge(
    value: 3, appearance: 'negative', semanticsLabel: '3');

Widget _slotIndicator() => const OneUiIndicatorBadge(
      appearance: 'negative',
      semanticsLabel: 'Unread',
    );

Widget buildBadgeDefaultPreview(BuildContext context) {
  return const Center(
    child: OneUiBadge(
      attention: 'high',
      size: 'm',
      semanticsLabel: 'Status badge',
      child: 'Badge',
    ),
  );
}

Widget buildBadgeVariantsSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context),
    runSpacing: _gap(context, '2'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      _badge(context, attention: 'high'),
      _badge(context, attention: 'medium'),
      _badge(context, attention: 'low'),
    ],
  );
}

Widget buildBadgeSizesSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context),
    runSpacing: _gap(context, '2'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final s in kOneUiBadgeSizes) _badge(context, size: s),
    ],
  );
}

Widget _attentionRow(
  BuildContext context,
  Widget Function(String attention) builder,
) {
  return Wrap(
    spacing: _gap(context),
    runSpacing: _gap(context, '2'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      builder('high'),
      builder('medium'),
      builder('low'),
    ],
  );
}

Widget _withSlotsSection(
  BuildContext context, {
  required String title,
  required Widget Function(String attention) builder,
}) {
  return Padding(
    padding: EdgeInsets.only(bottom: _gap(context, '4')),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label(context, title),
        SizedBox(height: _gap(context, '2')),
        _attentionRow(context, builder),
      ],
    ),
  );
}

Widget buildBadgeWithSlotsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _withSlotsSection(
        context,
        title: 'Text only',
        builder: (a) => _badge(context, attention: a),
      ),
      _withSlotsSection(
        context,
        title: 'Start: Icon',
        builder: (a) => _badge(context, attention: a, start: _slotIconHeart()),
      ),
      _withSlotsSection(
        context,
        title: 'Start + End: Icon',
        builder: (a) => _badge(
          context,
          attention: a,
          start: _slotIconHeart(),
          end: _slotIconHeart(),
        ),
      ),
      _withSlotsSection(
        context,
        title: 'Start: IndicatorBadge (negative)',
        builder: (a) => _badge(context, attention: a, start: _slotIndicator()),
      ),
      _withSlotsSection(
        context,
        title: 'End: IndicatorBadge (negative)',
        builder: (a) => _badge(context, attention: a, end: _slotIndicator()),
      ),
      _withSlotsSection(
        context,
        title: 'Start: IndicatorBadge + End: Icon',
        builder: (a) => _badge(
          context,
          attention: a,
          start: _slotIndicator(),
          end: _slotIconHeart(),
        ),
      ),
      _withSlotsSection(
        context,
        title: 'Start: Icon + End: IndicatorBadge',
        builder: (a) => _badge(
          context,
          attention: a,
          start: _slotIconHeart(),
          end: _slotIndicator(),
        ),
      ),
      _withSlotsSection(
        context,
        title: 'Start: CounterBadge',
        builder: (a) => _badge(context, attention: a, start: _slotCounter()),
      ),
      _withSlotsSection(
        context,
        title: 'Start: Avatar',
        builder: (a) => _badge(context, attention: a, start: _slotAvatar()),
      ),
      _withSlotsSection(
        context,
        title: 'End: CounterBadge',
        builder: (a) => _badge(context, attention: a, end: _slotCounter()),
      ),
      _withSlotsSection(
        context,
        title: 'End: Avatar',
        builder: (a) => _badge(context, attention: a, end: _slotAvatar()),
      ),
      Padding(
        padding: EdgeInsets.only(bottom: _gap(context, '4')),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _label(context, 'Sizes with Icon start slot'),
            SizedBox(height: _gap(context, '2')),
            Wrap(
              spacing: _gap(context),
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                for (final s in kOneUiBadgeSizes)
                  _badge(context, size: s, start: _slotIconHeart()),
              ],
            ),
          ],
        ),
      ),
    ],
  );
}

Widget _sizesWithSlotsRow(
  BuildContext context, {
  required String positionLabel,
  required List<Widget> nodes,
}) {
  return Padding(
    padding: EdgeInsets.only(bottom: _gap(context, '3')),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        _label(context, positionLabel, width: 56),
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              for (var i = 0; i < kOneUiBadgeSizes.length; i++)
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      nodes[i],
                      SizedBox(height: _gap(context, '2')),
                      _label(context, kOneUiBadgeSizes[i].toUpperCase()),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    ),
  );
}

Widget buildBadgeSizesWithSlotsSection(BuildContext context) {
  Widget counterNode(String size) {
    if (size == 'xs' || size == 's') {
      return Opacity(
        opacity: 0.25,
        child: Center(child: _label(context, '—')),
      );
    }
    return Center(child: _badge(context, size: size, start: _slotCounter()));
  }

  Widget counterEndNode(String size) {
    if (size == 'xs' || size == 's') {
      return Opacity(
        opacity: 0.25,
        child: Center(child: _label(context, '—')),
      );
    }
    return Center(child: _badge(context, size: size, end: _slotCounter()));
  }

  final sections = <({String label, List<Widget> start, List<Widget> end})>[
    (
      label: 'Icon',
      start: [
        for (final s in kOneUiBadgeSizes)
          Center(child: _badge(context, size: s, start: _slotIconHeart())),
      ],
      end: [
        for (final s in kOneUiBadgeSizes)
          Center(child: _badge(context, size: s, end: _slotIconHeart())),
      ],
    ),
    (
      label: 'Avatar',
      start: [
        for (final s in kOneUiBadgeSizes)
          Center(child: _badge(context, size: s, start: _slotAvatar())),
      ],
      end: [
        for (final s in kOneUiBadgeSizes)
          Center(child: _badge(context, size: s, end: _slotAvatar())),
      ],
    ),
    (
      label: 'CounterBadge',
      start: [for (final s in kOneUiBadgeSizes) counterNode(s)],
      end: [for (final s in kOneUiBadgeSizes) counterEndNode(s)],
    ),
    (
      label: 'IndicatorBadge',
      start: [
        for (final s in kOneUiBadgeSizes)
          Center(child: _badge(context, size: s, start: _slotIndicator())),
      ],
      end: [
        for (final s in kOneUiBadgeSizes)
          Center(child: _badge(context, size: s, end: _slotIndicator())),
      ],
    ),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final section in sections) ...[
        _label(context, section.label),
        SizedBox(height: _gap(context, '2')),
        _sizesWithSlotsRow(context,
            positionLabel: 'start', nodes: section.start),
        _sizesWithSlotsRow(context, positionLabel: 'end', nodes: section.end),
        SizedBox(height: _gap(context, '4')),
      ],
    ],
  );
}

Widget buildBadgeAppearancesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final role
          in OneUiSurfaceScope.appearanceRolesForBrand(context)) ...[
        _label(context, role),
        SizedBox(height: _gap(context, '2')),
        Wrap(
          spacing: _gap(context),
          runSpacing: _gap(context, '2'),
          children: [
            _badge(context, appearance: role, attention: 'high'),
            _badge(context, appearance: role, attention: 'medium'),
            _badge(context, appearance: role, attention: 'low'),
          ],
        ),
        SizedBox(height: _gap(context, '4')),
      ],
    ],
  );
}

Widget buildBadgeThemesSection(BuildContext context) {
  const surfaceModes = [
    ('default', 'default'),
    ('minimal', 'minimal'),
    ('subtle', 'subtle'),
    ('bold', 'bold'),
    ('elevated', 'elevated'),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, label) in surfaceModes)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _label(context, label, width: 90),
              Expanded(
                child: OneUiSurface(
                  mode: mode,
                  child: Padding(
                    padding: EdgeInsets.all(_gap(context, '4-5')),
                    child: Wrap(
                      spacing: _gap(context),
                      runSpacing: _gap(context, '2'),
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        _badge(context, attention: 'high'),
                        _badge(context, attention: 'medium'),
                        _badge(context, attention: 'low'),
                        _badge(
                          context,
                          attention: 'high',
                          start: _slotIndicator(),
                        ),
                        _badge(
                          context,
                          attention: 'high',
                          start: _slotCounter(),
                        ),
                        _badge(
                          context,
                          attention: 'high',
                          start: _slotIconHeart(),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildBadgeSurfaceContextSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final mode in [
        'default',
        'ghost',
        'minimal',
        'subtle',
        'moderate',
        'bold',
        'elevated',
      ]) ...[
        _label(context, mode),
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: OneUiSurface(
            mode: mode,
            child: Padding(
              padding: EdgeInsets.all(_gap(context, '4')),
              child: Wrap(
                spacing: _gap(context),
                children: [
                  _badge(context, attention: 'high'),
                  _badge(context, attention: 'medium'),
                  _badge(context, attention: 'low'),
                ],
              ),
            ),
          ),
        ),
      ],
    ],
  );
}

Widget buildBadgeInsideBoldSurfaceSection(BuildContext context) {
  return OneUiSurface(
    mode: 'bold',
    child: Padding(
      padding: EdgeInsets.all(_gap(context, '6')),
      child: Wrap(
        spacing: _gap(context),
        children: [
          _badge(context, attention: 'high'),
          _badge(context, attention: 'medium'),
          _badge(context, attention: 'low'),
        ],
      ),
    ),
  );
}

Widget buildBadgeInsideSubtleSurfaceSection(BuildContext context) {
  return OneUiSurface(
    mode: 'subtle',
    child: Padding(
      padding: EdgeInsets.all(_gap(context, '6')),
      child: Wrap(
        spacing: _gap(context),
        children: [
          _badge(context, attention: 'high'),
          _badge(context, attention: 'medium'),
          _badge(context, attention: 'low'),
        ],
      ),
    ),
  );
}

Widget buildBadgeSlotAdaptationSection(BuildContext context) {
  return buildBadgeWithSlotsSection(context);
}

Widget buildBadgeResponsiveSection(BuildContext context) {
  return buildBadgeSizesSection(context);
}

Widget _figmaSlotMatrixRow(
  BuildContext context, {
  required String label,
  required Widget Function(String variant) builder,
}) {
  const variants = ['high', 'medium', 'low'];
  return Padding(
    padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label(context, label),
        SizedBox(height: _gap(context, '3')),
        Wrap(
          spacing: _gap(context),
          runSpacing: _gap(context, '2'),
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [for (final v in variants) builder(v)],
        ),
      ],
    ),
  );
}

Widget buildBadgeFigmaSlotMatrixSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _figmaSlotMatrixRow(
        context,
        label: 'Text only',
        builder: (v) => _badge(context, attention: v, size: 'm'),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'Start: Icon',
        builder: (v) =>
            _badge(context, attention: v, size: 'm', start: _slotIconUser()),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'Start + End: Icon',
        builder: (v) => _badge(
          context,
          attention: v,
          size: 'm',
          start: _slotIconUser(),
          end: _slotIconUser(),
        ),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'Start: IndicatorBadge (negative)',
        builder: (v) =>
            _badge(context, attention: v, size: 'm', start: _slotIndicator()),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'End: IndicatorBadge (negative)',
        builder: (v) =>
            _badge(context, attention: v, size: 'm', end: _slotIndicator()),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'Start: IndicatorBadge + End: Icon',
        builder: (v) => _badge(
          context,
          attention: v,
          size: 'm',
          start: _slotIndicator(),
          end: _slotIconUser(),
        ),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'Start: Icon + End: IndicatorBadge',
        builder: (v) => _badge(
          context,
          attention: v,
          size: 'm',
          start: _slotIconUser(),
          end: _slotIndicator(),
        ),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'Start: CounterBadge',
        builder: (v) =>
            _badge(context, attention: v, size: 'm', start: _slotCounter()),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'Start: Avatar',
        builder: (v) =>
            _badge(context, attention: v, size: 'm', start: _slotAvatar()),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'End: CounterBadge',
        builder: (v) =>
            _badge(context, attention: v, size: 'm', end: _slotCounter()),
      ),
      _figmaSlotMatrixRow(
        context,
        label: 'End: Avatar',
        builder: (v) =>
            _badge(context, attention: v, size: 'm', end: _slotAvatar()),
      ),
      Padding(
        padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _label(context, 'Sizes with Icon start slot'),
            SizedBox(height: _gap(context, '3')),
            Wrap(
              spacing: _gap(context),
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                for (final s in kOneUiBadgeSizes)
                  _badge(context,
                      attention: 'high', size: s, start: _slotIconUser()),
              ],
            ),
          ],
        ),
      ),
      Padding(
        padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _label(context, 'Sizes with Avatar start slot (regression target)'),
            SizedBox(height: _gap(context, '3')),
            Wrap(
              spacing: _gap(context),
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                for (final s in kOneUiBadgeSizes)
                  _badge(context,
                      attention: 'high', size: s, start: _slotAvatar()),
              ],
            ),
          ],
        ),
      ),
    ],
  );
}

Widget _narrowBadgeDemo(
  BuildContext context, {
  required double width,
  required String label,
  Widget? start,
  Widget? end,
  String appearance = 'auto',
}) {
  final scheme = Theme.of(context).colorScheme;
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    mainAxisSize: MainAxisSize.min,
    children: [
      _label(context, '$width px max'),
      SizedBox(height: _gap(context, '2')),
      DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: scheme.outlineVariant),
        ),
        child: SizedBox(
          width: width,
          child: OneUiBadge(
            appearance: appearance,
            semanticsLabel: label,
            start: start,
            end: end,
            child: label,
          ),
        ),
      ),
    ],
  );
}

/// Label ellipsis in narrow layouts + invalid explicit appearance fallback.
Widget buildBadgeEdgeCasesSection(BuildContext context) {
  final gap = _gap(context);
  final caption = _caption(context);

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      if (caption != null)
        Text(
          'Long labels truncate with ellipsis inside narrow parents (RN `numberOfLines={1}` '
          'parity). Invalid explicit `appearance` values normalise to `neutral` role tokens '
          'with a debug warning — not Material `colorScheme` colours.',
          style: caption,
        ),
      SizedBox(height: gap),
      _label(context, 'Long label — text only'),
      SizedBox(height: _gap(context, '2')),
      _narrowBadgeDemo(
        context,
        width: 72,
        label: 'Very long badge label',
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Long label — with start slot'),
      SizedBox(height: _gap(context, '2')),
      _narrowBadgeDemo(
        context,
        width: 96,
        label: 'Very long badge label',
        start: _slotIconHeart(),
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context,
          'Invalid appearance `primry` → neutral (compare `negative`)'),
      SizedBox(height: _gap(context, '2')),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _badge(context, appearance: 'primry', text: 'primry typo'),
          _badge(context, appearance: 'negative', text: 'negative'),
          _badge(context, appearance: 'auto', text: 'auto → sparkle'),
        ],
      ),
    ],
  );
}
