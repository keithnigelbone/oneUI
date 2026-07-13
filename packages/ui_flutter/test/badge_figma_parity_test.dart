import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/avatar_size_resolve.dart';
import 'package:ui_flutter/engine/badge_size_resolve.dart';
import 'package:ui_flutter/engine/badge_slot_context.dart';
import 'package:ui_flutter/engine/badge_slot_padding.dart';
import 'package:ui_flutter/engine/counter_badge_size_resolve.dart';
import 'package:ui_flutter/engine/indicator_badge_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/dimensions_resolve.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_badge_types.dart';

/// Figma frame `409:10060` / web `Badge.module.css` parity (L platform, default density).
///
/// Values from `docs/badge-figma-parity.md` — spacing token names map to px via
/// the dimension cascade, not hard-coded literals.
NativeDesignSystemPayload _figmaBadgeDesignSystem() {
  const shell = {
    'xs': (height: '3', gap: '0-5', radius: '1'),
    's': (height: '4', gap: '0-5', radius: '1'),
    'm': (height: '5', gap: '1', radius: '1-5'),
    'l': (height: '6', gap: '1', radius: '2'),
    'xl': (height: '8', gap: '1-5', radius: '2-5'),
  };
  final props = <String, String>{};
  for (final entry in shell.entries) {
    final size = entry.key;
    final spec = entry.value;
    props['--Badge-height-$size'] = 'var(--Spacing-${spec.height})';
    props['--Badge-gap-$size'] = 'var(--Spacing-${spec.gap})';
    props['--Badge-borderRadius-$size'] = 'var(--Shape-${spec.radius})';
    props['--Badge-paddingHorizontal-$size'] =
        'var(--Spacing-${size == 'xl' || size == 'm' ? '1-5' : size == 'l' ? '2' : '1'})';
  }
  return NativeDesignSystemPayload(
    componentCustomProperties: props,
    dimensionContexts: const [],
    activeDimensionKey: 'L:default',
  );
}

Widget _harness({required Widget child}) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        designSystem: _figmaBadgeDesignSystem(),
        child: child,
      ),
    ),
  );
}

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

void main() {
  group('Figma 409:10060 — badge shell geometry', () {
    const shell = {
      'xs': (height: '3', gap: '0-5', radius: '1'),
      's': (height: '4', gap: '0-5', radius: '1'),
      'm': (height: '5', gap: '1', radius: '1-5'),
      'l': (height: '6', gap: '1', radius: '2'),
      'xl': (height: '8', gap: '1-5', radius: '2-5'),
    };

    for (final entry in shell.entries) {
      testWidgets('size=${entry.key} height/gap/radius tokens', (tester) async {
        await tester.pumpWidget(
          _harness(
            child: Builder(
              builder: (context) {
                final ds = OneUiScope.of(context).designSystem!;
                final layout = resolveBadgeLayout(
                  context,
                  ds,
                  size: entry.key,
                  hasStart: false,
                  hasEnd: false,
                );
                expect(layout.height, _spacing(context, entry.value.height));
                expect(layout.gap, _spacing(context, entry.value.gap));
                expect(
                  layout.borderRadius,
                  _spacing(context, entry.value.radius),
                );
                return const SizedBox();
              },
            ),
          ),
        );
      });
    }
  });

  group('Figma 409:10060 — slot-aware horizontal padding', () {
    /// Web `:has(.start)` / `:has(.end)` effective L/R (slot-side token names).
    const matrix = {
      'xs': (
        base: '1',
        slotSide: '0-5',
      ),
      's': (
        base: '1',
        slotSide: '0-5',
      ),
      'm': (
        base: '1-5',
        slotSide: '1',
      ),
      'l': (
        base: '2',
        slotSide: '1',
      ),
    };

    for (final size in matrix.keys) {
      final spec = matrix[size]!;

      testWidgets('size=$size no slots — symmetric base padH', (tester) async {
        await tester.pumpWidget(
          _harness(
            child: Builder(
              builder: (context) {
                final ds = OneUiScope.of(context).designSystem!;
                final pad = resolveBadgeLayout(
                  context,
                  ds,
                  size: size,
                  hasStart: false,
                  hasEnd: false,
                ).padding;
                final base = _spacing(context, spec.base);
                expect(pad.left, closeTo(base, 0.01));
                expect(pad.right, closeTo(base, 0.01));
                return const SizedBox();
              },
            ),
          ),
        );
      });

      testWidgets('size=$size start-only — slot side reduced on left', (
        tester,
      ) async {
        await tester.pumpWidget(
          _harness(
            child: Builder(
              builder: (context) {
                final ds = OneUiScope.of(context).designSystem!;
                final pad = resolveBadgeLayout(
                  context,
                  ds,
                  size: size,
                  hasStart: true,
                  hasEnd: false,
                ).padding;
                expect(pad.left, closeTo(_spacing(context, spec.slotSide), 0.01));
                expect(pad.right, closeTo(_spacing(context, spec.base), 0.01));
                return const SizedBox();
              },
            ),
          ),
        );
      });

      testWidgets('size=$size end-only — slot side reduced on right', (
        tester,
      ) async {
        await tester.pumpWidget(
          _harness(
            child: Builder(
              builder: (context) {
                final ds = OneUiScope.of(context).designSystem!;
                final pad = resolveBadgeLayout(
                  context,
                  ds,
                  size: size,
                  hasStart: false,
                  hasEnd: true,
                ).padding;
                expect(pad.left, closeTo(_spacing(context, spec.base), 0.01));
                expect(
                  pad.right,
                  closeTo(_spacing(context, spec.slotSide), 0.01),
                );
                return const SizedBox();
              },
            ),
          ),
        );
      });

      testWidgets('size=$size both slots — symmetric slot-side padH', (
        tester,
      ) async {
        await tester.pumpWidget(
          _harness(
            child: Builder(
              builder: (context) {
                final ds = OneUiScope.of(context).designSystem!;
                final pad = resolveBadgeLayout(
                  context,
                  ds,
                  size: size,
                  hasStart: true,
                  hasEnd: true,
                ).padding;
                final slot = _spacing(context, spec.slotSide);
                expect(pad.left, closeTo(slot, 0.01));
                expect(pad.right, closeTo(slot, 0.01));
                return const SizedBox();
              },
            ),
          ),
        );
      });

      testWidgets(
        'size=$size CounterBadge end-only uses same pad as icon end-only',
        (tester) async {
          await tester.pumpWidget(
            _harness(
              child: Builder(
                builder: (context) {
                  final ds = OneUiScope.of(context).designSystem!;
                  final iconPad = resolveBadgeLayout(
                    context,
                    ds,
                    size: size,
                    hasStart: false,
                    hasEnd: true,
                  ).padding;
                  final badgePad = resolveBadgeLayout(
                    context,
                    ds,
                    size: size,
                    hasStart: false,
                    hasEnd: true,
                    slotFlags: const BadgeSlotPaddingFlags(endIsBadge: true),
                  ).padding;
                  expect(badgePad.left, closeTo(iconPad.left, 0.01));
                  expect(badgePad.right, closeTo(iconPad.right, 0.01));
                  return const SizedBox();
                },
              ),
            ),
          );
        },
      );
    }

    testWidgets('xl keeps symmetric padH with slots (Figma 409:10118)', (
      tester,
    ) async {
      await tester.pumpWidget(
        _harness(
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.of(context).designSystem!;
              final base = _spacing(context, '1-5');
              for (final flags in [
                const BadgeSlotPaddingFlags.empty(),
                const BadgeSlotPaddingFlags(startIsBadge: true),
                const BadgeSlotPaddingFlags(endIsBadge: true),
                const BadgeSlotPaddingFlags(
                  startIsBadge: false,
                  endIsBadge: true,
                ),
              ]) {
                final pad = resolveBadgeLayout(
                  context,
                  ds,
                  size: 'xl',
                  hasStart: true,
                  hasEnd: true,
                  slotFlags: flags,
                ).padding;
                expect(pad.left, closeTo(base, 0.01));
                expect(pad.right, closeTo(base, 0.01));
              }
              return const SizedBox();
            },
          ),
        ),
      );
    });
  });

  group('Figma 409:10060 — slot child auto-sizing', () {
    const slotPx = {
      'xs': (avatar: '2', counter: '3', indicator: '1', icon: 8.0),
      's': (avatar: '3', counter: '3', indicator: '1-5', icon: 12.0),
      'm': (avatar: '3', counter: '3', indicator: '2', icon: 12.0),
      'l': (avatar: '4', counter: '4', indicator: '2', icon: 16.0),
      'xl': (avatar: '5', counter: '5', indicator: '3', icon: 20.0),
    };

    for (final entry in slotPx.entries) {
      testWidgets('size=${entry.key} slot scope tokens', (tester) async {
        await tester.pumpWidget(
          _harness(
            child: BadgeSlotSizeScope(
              sizes: kBadgeSlotSizes[entry.key]!,
              child: Builder(
                builder: (context) {
                  final scope = OneUiScope.of(context);
                  final ds = scope.designSystem!;
                  final slot = kBadgeSlotSizes[entry.key]!;

                  expect(slot.iconPx, entry.value.icon);

                  final avatar = resolveAvatarMetrics(context, size: 'm');
                  expect(
                    avatar?.containerPx,
                    _spacing(context, entry.value.avatar),
                  );

                  final counter = resolveCounterBadgeLayout(
                    context,
                    ds,
                    size: slot.counterBadgeSize,
                    inheritSlotGeometry: true,
                  );
                  expect(
                    counter.height,
                    _spacing(context, entry.value.counter),
                  );

                  final indicator = resolveIndicatorBadgeLayout(
                    context,
                    ds,
                    size: slot.indicatorBadgeSize,
                    inheritSlotGeometry: true,
                  );
                  expect(
                    indicator.side,
                    _spacing(context, entry.value.indicator),
                  );

                  return const SizedBox();
                },
              ),
            ),
          ),
        );
      });
    }
  });
}
