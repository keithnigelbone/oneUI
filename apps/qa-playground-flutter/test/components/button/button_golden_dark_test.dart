/// Button visual-regression tests — DARK MODE.
///
/// Closes BUG-18: zero dark-mode visual coverage in the suite. We
/// re-run the most-discriminating subset of the light-mode matrix under
/// `darkMode: true` so a regression that breaks dark-mode token
/// remapping fails here instead of in production.
///
/// Why a SUBSET, not the full 52: the light-mode goldens already cover
/// every prop axis. Dark-mode primarily revalidates the SURFACE step
/// flip (2500 → 100) and the on-bold contrast inversion. Six attention ×
/// appearance combos + 3 state combos give us coverage proportional to
/// risk without doubling test runtime.
///
/// Workflow:
///   1. Bless baselines after an intentional dark-mode visual change:
///      flutter test --update-goldens test/components/button/button_golden_dark_test.dart
///   2. Inspect the new PNGs under test/components/button/goldens/dark/
///   3. CI re-runs without `--update-goldens`; pixel diffs fail the suite.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';

import '../../support/components/button_harness.dart';

Widget _freezeTickers(Widget child) =>
    TickerMode(enabled: false, child: child);

// The high-signal axis for dark mode: every attention level vs every
// appearance whose token table flips between light/dark surfaces. Six
// appearance roles tested (omits warning/informative/brand-bg which
// share the same surface-step flip math as positive/negative/sparkle).
const _kDarkAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
];

const _kAttentions = <String, OneUiButtonAttention>{
  'high': OneUiButtonAttention.high,
  'medium': OneUiButtonAttention.medium,
  'low': OneUiButtonAttention.low,
};

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][dark] Button — attention × appearance matrix (dark)', () {
    for (final att in _kAttentions.entries) {
      for (final app in _kDarkAppearances) {
        testWidgets('${att.key} / $app (dark)', (tester) async {
          await pumpButtonQaHarnessSettled(
            tester,
            OneUiButton(label: 'Save', attention: att.value, appearance: app),
            darkMode: true,
          );
          await expectLater(
            find.byType(OneUiButton),
            matchesGoldenFile(
              'goldens/dark/button_dark_${att.key}_$app.png',
            ),
          );
        });
      }
    }
  });

  group('[golden][dark] Button — state combos (dark)', () {
    testWidgets('disabled / high (dark)', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          disabled: true,
        ),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/dark/button_dark_disabled_high.png'),
      );
    });

    testWidgets('loading / high (dark)', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        _freezeTickers(
          const OneUiButton(
            label: 'Save',
            attention: OneUiButtonAttention.high,
            appearance: 'primary',
            loading: true,
            start: OneUiIcon(icon: 'check'),
          ),
        ),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/dark/button_dark_loading_high.png'),
      );
    });

    testWidgets('with start + end icons / high (dark)', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Continue',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          start: OneUiIcon(icon: 'star', emphasis: OneUiIconEmphasis.high),
          end: OneUiIcon(icon: 'arrow_forward', emphasis: OneUiIconEmphasis.high),
        ),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/dark/button_dark_with_slots_high.png'),
      );
    });
  });
}
