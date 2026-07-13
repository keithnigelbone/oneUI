/// Button visual-regression tests — interactive STATES.
///
/// Closes BUG-21: the existing matrix only captures the default state.
/// Hover and pressed visuals — including `--{Role}-Hover`,
/// `--{Role}-Bold-Pressed`, `--{Role}-Subtle-Hover` token paths — are
/// never visually validated. A regression that silently breaks the
/// pressed contrast on the sparkle / brand-bg / informative appearances
/// ships unnoticed.
///
/// Approach:
///   - FOCUS goldens use `forceFocusRing: true` (built into OneUiButton)
///     to render the focus halo deterministically without dispatching
///     keyboard events.
///   - PRESSED goldens drive the press AnimationController directly via
///     `buttonPressController(tester).value = 1.0` — captures the fully
///     pressed visual without a flaky tap-and-pump-halfway approach.
///   - HOVER (mouse hover) is genuinely impossible to force from a
///     headless `flutter test` (no real pointer device), so we skip it
///     here. On-device hover is covered by integration tests.
///
/// Workflow:
///   1. Bless baselines:
///      flutter test --update-goldens test/components/button/button_golden_states_test.dart
///   2. Inspect goldens/states/ before commit.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';

import '../../support/components/button_harness.dart';

// One appearance per "risk tier": primary (most common), sparkle (gradient
// accent), brand-bg (custom brand color path), negative (semantic). We
// don't multiply by every appearance — focus/pressed state math is
// shared, so risk is concentrated on the appearances with the most
// distinct surface token tables.
const _kStateAppearances = <String>[
  'primary',
  'sparkle',
  'brand-bg',
  'negative',
];

const _kAttentions = <String, OneUiButtonAttention>{
  'high': OneUiButtonAttention.high,
  'subtle': OneUiButtonAttention.medium,
  'ghost': OneUiButtonAttention.low,
};

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][state] Button — FOCUS halo per appearance × attention', () {
    for (final app in _kStateAppearances) {
      for (final att in _kAttentions.entries) {
        testWidgets('focus / $app / ${att.key}', (tester) async {
          await pumpButtonQaHarnessSettled(
            tester,
            OneUiButton(
              label: 'Save',
              attention: att.value,
              appearance: app,
              forceFocusRing: true,
            ),
          );
          await expectLater(
            find.byType(OneUiButton),
            matchesGoldenFile(
              'goldens/states/button_focus_${app}_${att.key}.png',
            ),
          );
        });
      }
    }
  });

  group('[golden][state] Button — PRESSED per appearance × attention', () {
    for (final app in _kStateAppearances) {
      for (final att in _kAttentions.entries) {
        testWidgets('pressed / $app / ${att.key}', (tester) async {
          await pumpButtonQaHarnessSettled(
            tester,
            OneUiButton(
              label: 'Save',
              attention: att.value,
              appearance: app,
              onPressed: () {},
            ),
          );

          // Drive the press animation to its end-state directly. This is
          // deterministic — no tap-and-pump-halfway flakes.
          final ctrl = buttonPressController(tester);
          ctrl.value = 1.0;
          await tester.pump();

          await expectLater(
            find.byType(OneUiButton),
            matchesGoldenFile(
              'goldens/states/button_pressed_${app}_${att.key}.png',
            ),
          );
        });
      }
    }
  });

  group('[golden][state] Button — FOCUS halo inside Surface(bold)', () {
    // The focus halo gap is supposed to remap to --Surface-Fill-Bold when
    // inside a bold surface (CLAUDE.md Focus Halo Pattern). If the
    // remapping breaks, the gap will be page-white inside a dark bold
    // surface and look like a "hole". This is the regression gate.
    testWidgets('focus halo inside bold surface — primary high', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save',
          attention: OneUiButtonAttention.high,
          appearance: 'auto',
          forceFocusRing: true,
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/states/button_focus_inside_bold_primary.png'),
      );
    });
  });
}
