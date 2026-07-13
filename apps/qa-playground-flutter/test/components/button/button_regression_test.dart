/// Button regression tests — closes QA gaps for bugs #3, #4, and #6.
///
/// Package-level coverage exists in `packages/ui_flutter/test/`; these mirror
/// the same contracts through the real Jio fixture harness so CI catches
/// regressions on the consumer path.
library;

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/motion_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';

import '../../support/components/button_harness.dart';

Finder _buttonRootFinder() => find.byType(OneUiFocusInteractive);

Future<void> _hoverOver(WidgetTester tester, Finder target) async {
  final center = tester.getCenter(target);
  final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
  await gesture.addPointer(location: center);
  await gesture.moveTo(center);
  await tester.pump();
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[regression] Button — tap motion (BUG-03)', () {
    testWidgets('[motion] tap scale matches web Motion-Tap-Scale chain', (tester) async {
      final ds = jioFixture.designSystem;
      OneUiTapMotionSpec? spec;

      Future<void> pumpSpec({
        required bool sizeIsXs,
        required bool fullWidthTapScale,
      }) async {
        await pumpButtonQaHarnessSettled(
          tester,
          Builder(
            builder: (ctx) {
              spec = resolveOneUiTapMotionSpec(
                ctx,
                ds,
                sizeIsXs: sizeIsXs,
                fullWidthTapScale: fullWidthTapScale,
              );
              return const SizedBox.shrink();
            },
          ),
        );
      }

      await pumpSpec(sizeIsXs: false, fullWidthTapScale: false);
      expect(spec!.pressedScale, closeTo(0.97, 0.001), reason: 'default 3%');

      await pumpSpec(sizeIsXs: true, fullWidthTapScale: false);
      expect(spec!.pressedScale, closeTo(0.93, 0.001), reason: 'XS 7%');

      await pumpSpec(sizeIsXs: true, fullWidthTapScale: true);
      expect(spec!.pressedScale, closeTo(0.99, 0.001),
          reason: 'fullWidth wins over XS');
    });
  });

  group('[regression] Button — uncontained LinkButton tokens (BUG-06)', () {
    testWidgetsAllPlatforms(
      '[fn] uncontained minHeight follows --LinkButton-minHeight override',
      (tester) async {
        final ds = designSystemWithOverrides(const {
          '--LinkButton-minHeight-10': '48px',
        });
        await pumpButtonQaHarnessSettled(
          tester,
          const OneUiButton(
            label: 'Token sized',
            size: 10,
            contained: false,
          ),
          designSystem: ds,
        );

        final constrained = tester.widget<ConstrainedBox>(
          find
              .descendant(
                of: find.byType(OneUiButton),
                matching: find.byType(ConstrainedBox),
              )
              .first,
        );
        expect(
          constrained.constraints.minHeight,
          48,
          reason:
              'contained=false must read --LinkButton-minHeight-* from brand tokens, '
              'not hardcoded Button sizing (BUG-06).',
        );
      },
    );
  });

  group('[regression] Button — ghost hover visibility (BUG-04)', () {
    testWidgetsAllPlatforms(
      '[visual] ghost label stays visible on hover when ghost textColor is transparent',
      (tester) async {
        final ds = designSystemWithOverrides(const {
          '--Button-textColor-ghost': 'transparent',
          '--Button-textColor-ghost-hover': 'transparent',
        });
        await pumpButtonQaHarnessSettled(
          tester,
          const OneUiButton(
            label: 'Ghost Hover',
            attention: OneUiButtonAttention.low,
            appearance: 'primary',
          ),
          designSystem: ds,
        );

        await _hoverOver(tester, _buttonRootFinder());

        final textWidget = tester.widget<Text>(find.text('Ghost Hover'));
        final color = textWidget.style?.color;
        expect(color, isNotNull,
            reason: 'ghost hover must paint an explicit label colour');
        expect(color!.a, greaterThan(0),
            reason:
                'BUG-04: transparent --Button-textColor-ghost-hover must fall back '
                'to tintedA11y on hover, not invisible text');
      },
    );
  });
}
