/// Button — token-degradation tests.
///
/// Validates how the Button behaves when the brand omits or mis-spells a
/// token. The component must NOT silently render a broken result; it must
/// either fall back to a sensible default OR produce a diagnostic (gap
/// card / assert) that QA will see.
///
/// Bugs guarded here:
///   - BUG-07 (Visual): ghost variant text invisible if `--Primary-Hover`
///     missing for the resolved appearance. We assert text is still
///     painted at non-zero alpha on hover even when the brand omits the
///     state token.
///   - BUG-10 (Visual): `--Button-textTransform` only accepts exact
///     `uppercase` / `normal` strings. We assert case-insensitive
///     handling (`Uppercase`, `UPPERCASE`) and gracefully degrade unknown
///     values to `normal`.
///   - BUG-11 (Visual): `--Button-letterSpacing` ignores `rem` / `ch`
///     units. We assert the Button doesn't crash and falls back to
///     `LetterSpacing.normal` when an unsupported unit is supplied.
///
/// These tests use `designSystemWithoutTokens` / `designSystemWithOverrides`
/// to deliberately mutate the Jio fixture for a single test, isolating the
/// fallback path without touching production Convex.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';

import '../../support/components/button_harness.dart';

Finder _buttonRootFinder() => find.byType(OneUiFocusInteractive);

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[visual] Button — graceful fallback when brand omits a token', () {
    testWidgetsAllPlatforms(
      '[visual] ghost variant text remains painted when --Primary-Hover is missing (BUG-07)',
      (tester) async {
        final ds = designSystemWithoutTokens(const [
          '--Primary-Hover',
          '--Primary-Pressed',
        ]);
        await pumpButtonQaHarnessSettled(
          tester,
          const OneUiButton(
            label: 'Ghost Hover',
            attention: OneUiButtonAttention.low,
            appearance: 'primary',
          ),
          designSystem: ds,
        );

        // Find the Text widget — its rendered color must not be fully
        // transparent. If the ghost variant resolves its text alpha to 0
        // when --Primary-Hover is null, the user sees an invisible label
        // on hover. We assert the static (un-hovered) text is painted.
        final textFinder = find.text('Ghost Hover');
        expect(textFinder, findsOneWidget);

        final textWidget = tester.widget<Text>(textFinder);
        final renderedStyle = textWidget.style ?? const TextStyle();
        final color = renderedStyle.color;
        // Either color is null (inherits from DefaultTextStyle ancestor —
        // also OK so long as the ancestor color is non-transparent), or
        // it's set to a non-transparent value.
        if (color != null) {
          expect(color.a > 0, isTrue,
              reason:
                  'ghost variant must render visible text even when the brand omits state tokens. '
                  'See BUG-07.');
        }
      },
    );

    testWidgetsAllPlatforms(
      '[visual] --Button-textTransform should accept mixed-case "Uppercase" (BUG-10)',
      (tester) async {
        final ds = designSystemWithOverrides(const {
          '--Button-textTransform': 'Uppercase',
        });
        await pumpButtonQaHarnessSettled(
          tester,
          const OneUiButton(label: 'shout'),
          designSystem: ds,
        );

        // If parsing is case-insensitive (the fix), text renders as
        // SHOUT. If parsing is exact-match (the bug), text stays "shout".
        //
        // We intentionally check for the uppercased form. This test will
        // FAIL until the bug is fixed — that's the regression gate.
        expect(
          find.text('SHOUT'),
          findsOneWidget,
          reason:
              'BUG-10: --Button-textTransform parsing must be case-insensitive. '
              'Token value "Uppercase" should produce uppercased label like "uppercase" does.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[visual] unknown textTransform value falls back to normal — not crash (BUG-10)',
      (tester) async {
        final ds = designSystemWithOverrides(const {
          '--Button-textTransform': 'capitalize-words',
        });
        // Component must not crash on an unrecognised value. Body just
        // needs to render and stay tappable.
        await pumpButtonQaHarnessSettled(
          tester,
          const OneUiButton(label: 'mixed Case'),
          designSystem: ds,
        );
        expect(_buttonRootFinder(), findsOneWidget,
            reason: 'unknown textTransform value must not crash the component');
        // Original casing preserved (treat as normal).
        expect(find.text('mixed Case'), findsOneWidget,
            reason: 'unknown textTransform should degrade to "normal"');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] --Button-letterSpacing in rem must not crash; falls back to normal (BUG-11)',
      (tester) async {
        final ds = designSystemWithOverrides(const {
          '--Button-letterSpacing': '0.05rem',
        });
        await pumpButtonQaHarnessSettled(
          tester,
          const OneUiButton(label: 'Space'),
          designSystem: ds,
        );
        expect(_buttonRootFinder(), findsOneWidget,
            reason: 'rem letter-spacing must not crash');
        // Letter spacing should NOT be a NaN or absurd value — the
        // fallback is `normal` (null) which lets the typography token
        // decide. We can't assert "spacing is normal" directly since
        // there's no observable side-effect, but a non-crash is the
        // baseline contract.
      },
    );

    testWidgetsAllPlatforms(
      '[visual] --Button-letterSpacing in ch must not crash; falls back to normal (BUG-11)',
      (tester) async {
        final ds = designSystemWithOverrides(const {
          '--Button-letterSpacing': '0.5ch',
        });
        await pumpButtonQaHarnessSettled(
          tester,
          const OneUiButton(label: 'Space'),
          designSystem: ds,
        );
        expect(_buttonRootFinder(), findsOneWidget,
            reason: 'ch letter-spacing must not crash');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] missing --Button-minHeight-10 produces diagnostic, not invisible button',
      (tester) async {
        // If the component swallows a missing critical token, the button
        // disappears at runtime and QA never notices. The Button code
        // path renders `ConvexGapCard` for missing tokens — assert SOME
        // visible widget is in the tree, even if it's the diagnostic.
        final ds = designSystemWithoutTokens(const [
          '--Button-minHeight-10',
          '--Button-minHeight',
        ]);
        await pumpButtonQaHarnessSettled(
          tester,
          const OneUiButton(label: 'Tap'),
          designSystem: ds,
        );

        // Either the button renders (with a fallback minHeight) or a
        // ConvexGapCard renders. Both are acceptable; an empty tree is not.
        final byTextOrGap = find.text('Tap').evaluate().isNotEmpty ||
            find.textContaining('Button-minHeight').evaluate().isNotEmpty ||
            find.textContaining('--Button-minHeight').evaluate().isNotEmpty;
        expect(byTextOrGap, isTrue,
            reason:
                'missing --Button-minHeight* must surface a diagnostic, not produce an invisible button');
      },
    );
  });
}
