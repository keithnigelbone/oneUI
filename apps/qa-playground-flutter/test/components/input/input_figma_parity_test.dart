/// Input Figma-parity QA suite — `[figma]`.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../../support/components/input_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputIconsLoaded();
  });

  group('[figma] Input — size', () {
    for (final entry in {
      'xs': OneUiInputSize.xs,
      's': OneUiInputSize.s,
      'm': OneUiInputSize.m,
      'l': OneUiInputSize.l,
    }.entries) {
      final numeric = resolveOneUiInputNumericSize(entry.value);
      testWidgetsAllPlatforms(
          '[figma] size=${entry.key} → f$numeric height (S-360 touch clamp)',
          (tester) async {
        await pumpInputQaHarness(
          tester,
          OneUiInput(size: entry.value, placeholder: entry.key),
        );
        // PROBED: shell minHeight — token f-step, clamped to 44px on S-360.
        expect(inputShellHeightPx(tester), expectedInputShellHeightPx(numeric));
      });
    }

    test('[figma] native xs resolves to f6 (web coerces xs→s)', () {
      expect(resolveOneUiInputNumericSize(OneUiInputSize.xs), 6);
      expect(resolveOneUiInputNumericSize(OneUiInputSize.s), 8);
    });
  });

  group('[figma] Input — attention', () {
    for (final attention in OneUiInputAttention.values) {
      testWidgetsAllPlatforms('[figma] attention=${attention.name} renders',
          (tester) async {
        await pumpInputQaHarness(
          tester,
          OneUiInput(attention: attention, placeholder: attention.name),
        );
        expect(inputRootFinder(), findsOneWidget);
      });
    }
  });

  group('[figma] Input — appearance', () {
    test('[figma] auto resolves to secondary without surface context', () {
      expect(
        resolveOneUiInputAppearance(OneUiInputAppearance.auto),
        'secondary',
      );
    });

    test('[figma] brand-bg parent falls back to secondary', () {
      expect(
        resolveOneUiInputAppearance(
          OneUiInputAppearance.auto,
          parentAppearance: 'brand-bg',
        ),
        'secondary',
      );
    });

    for (final app in OneUiInputAppearance.values) {
      if (app == OneUiInputAppearance.auto) continue;
      testWidgetsAllPlatforms('[figma] appearance=${app.name} renders', (tester) async {
        await pumpInputQaHarness(
          tester,
          OneUiInput(appearance: app, placeholder: app.name),
        );
        expect(inputRootFinder(), findsOneWidget);
      });
    }
  });

  group('[figma] Input — shape', () {
    testWidgetsAllPlatforms('[figma] shape=default', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(shape: OneUiInputShape.defaultShape, placeholder: 'x'),
      );
      final radius = inputShellDecoration(tester).borderRadius;
      expect(radius, isNot(BorderRadius.circular(9999)));
    });

    testWidgetsAllPlatforms('[figma] shape=pill', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(shape: OneUiInputShape.pill, placeholder: 'x'),
      );
      final radius = inputShellDecoration(tester).borderRadius as BorderRadius?;
      expect(radius?.topLeft.x, greaterThan(100));
    });
  });

  group('[figma] Input — state', () {
    testWidgetsAllPlatforms('[figma] disabled blocks editing', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(value: 'Locked', disabled: true),
      );
      expect(inputTextField(tester).enabled, isFalse);
    });

    testWidgetsAllPlatforms('[figma] readOnly stays enabled', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(value: 'Read', readOnly: true),
      );
      expect(inputTextField(tester).enabled, isTrue);
      expect(inputTextField(tester).readOnly, isTrue);
    });

    testWidgetsAllPlatforms('[figma] filled value renders', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(value: 'Filled'),
      );
      expect(find.text('Filled'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] placeholder shows when empty', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(placeholder: 'Hint'),
      );
      expect(find.text('Hint'), findsOneWidget);
    });
  });
}
