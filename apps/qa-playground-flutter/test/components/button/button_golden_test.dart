/// Button visual-regression tests — captures golden PNG images of the
/// component across every meaningful API combination. Headless, single-platform
/// on purpose (Android default) so baselines stay deterministic.
///
/// Workflow:
///   1. After an intentional visual change, regenerate baselines:
///      flutter test --update-goldens test/components/button/button_golden_test.dart
///   2. Inspect the new PNGs in test/components/button/goldens/ before committing.
///   3. CI re-runs without `--update-goldens`; pixel diffs fail the suite.
///
/// Coverage layout:
///   - "core states"   — high/medium/low, disabled, loading, slots, condensed
///                       (the original 7 baselines).
///   - "attention × appearance matrix" — 3 × 9 = 27 combos at size m,
///                                       proves every appearance role renders
///                                       at every attention level.
///   - "size × condensed"  — 4 × 2 = 8 combos at attention=high, appearance=primary,
///                           proves the sizing token table is wired across all
///                           t-shirt sizes for both regular and condensed mode.
///   - "slot configurations" — label-only, start-only, end-only, fullWidth (4).
///   - "state combos"  — disabled × {high, medium, low}, loading × {high, medium, low}.
///
/// Loading determinism: the loading variant overlays an infinite
/// `CircularProgressIndicator`. `TickerMode(enabled: false)` freezes the
/// spinner at angle 0 so `pumpAndSettle` returns and the pixel diff stays stable.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';

import '../../support/components/button_harness.dart';

/// Freezes ticker-driven animations (e.g. the loading spinner) so subsequent
/// `pumpAndSettle` returns and pixel diffs are deterministic.
Widget _freezeTickers(Widget child) =>
    TickerMode(enabled: false, child: child);

const _kAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
  'brand-bg',
];

const _kAttentions = <String, OneUiButtonAttention>{
  'high': OneUiButtonAttention.high,
  'medium': OneUiButtonAttention.medium,
  'low': OneUiButtonAttention.low,
};

const _kSizes = <String>['xs', 's', 'm', 'l'];

void main() {
  // Preload the Jio Convex fixture (theme snapshot + brand overview) BEFORE
  // any `testWidgets` runs. Doing this inside a per-test pumpButtonQaHarness
  // call works in small probe files but appears to deadlock in this 52-test
  // file — the cold-isolate async bundle load fights the testWidgets
  // scheduler. setUpAll resolves the fixture in a plain test-zone, so the
  // synchronous `jioFixture` accessor returns instantly inside every test.
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Button — core states', () {
    testWidgets('high attention / bold variant', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_high_primary.png'),
      );
    });

    testWidgets('medium attention / subtle variant', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.medium,
          appearance: 'primary',
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_medium_primary.png'),
      );
    });

    testWidgets('low attention / ghost variant', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.low,
          appearance: 'primary',
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_low_primary.png'),
      );
    });

    testWidgets('disabled state', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          disabled: true,
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_disabled.png'),
      );
    });

    testWidgets('loading state preserves layout', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        _freezeTickers(
          const OneUiButton(
            label: 'Save changes',
            attention: OneUiButtonAttention.high,
            appearance: 'primary',
            loading: true,
            start: OneUiIcon(icon: 'check'),
          ),
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_loading.png'),
      );
    });

    testWidgets('with start + end icon slots', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Continue',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          start: OneUiIcon(icon: 'star', emphasis: OneUiIconEmphasis.high),
          end: OneUiIcon(icon: 'arrow_forward', emphasis: OneUiIconEmphasis.high),
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_with_slots.png'),
      );
    });

    testWidgets('condensed sizing', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          condensed: true,
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_condensed.png'),
      );
    });
  });

  group('[golden] Button — attention × appearance matrix', () {
    for (final att in _kAttentions.entries) {
      for (final app in _kAppearances) {
        testWidgets('${att.key} / $app', (tester) async {
          await pumpButtonQaHarnessSettled(
            tester,
            OneUiButton(
              label: 'Save',
              attention: att.value,
              appearance: app,
            ),
          );
          await expectLater(
            find.byType(OneUiButton),
            matchesGoldenFile(
              'goldens/button_matrix_${att.key}_$app.png',
            ),
          );
        });
      }
    }
  });

  group('[golden] Button — size × condensed', () {
    for (final size in _kSizes) {
      for (final condensed in [false, true]) {
        final tag = condensed ? '${size}_condensed' : size;
        testWidgets('size=$size condensed=$condensed', (tester) async {
          await pumpButtonQaHarnessSettled(
            tester,
            OneUiButton(
              label: 'Save',
              sizeAlias: size,
              attention: OneUiButtonAttention.high,
              appearance: 'primary',
              condensed: condensed,
            ),
          );
          await expectLater(
            find.byType(OneUiButton),
            matchesGoldenFile('goldens/button_size_$tag.png'),
          );
        });
      }
    }
  });

  group('[golden] Button — slot configurations', () {
    testWidgets('label only', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Continue',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_slots_label_only.png'),
      );
    });

    testWidgets('start icon + label', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Continue',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          start: OneUiIcon(icon: 'star', emphasis: OneUiIconEmphasis.high),
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_slots_start.png'),
      );
    });

    testWidgets('label + end icon', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Continue',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          end: OneUiIcon(icon: 'arrow_forward', emphasis: OneUiIconEmphasis.high),
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_slots_end.png'),
      );
    });

    testWidgets('fullWidth fills harness', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          fullWidth: true,
        ),
      );
      await expectLater(
        find.byType(OneUiButton),
        matchesGoldenFile('goldens/button_full_width.png'),
      );
    });
  });

  group('[golden] Button — state combos', () {
    for (final att in _kAttentions.entries) {
      testWidgets('disabled / ${att.key}', (tester) async {
        await pumpButtonQaHarnessSettled(
          tester,
          OneUiButton(
            label: 'Save',
            attention: att.value,
            appearance: 'primary',
            disabled: true,
          ),
        );
        await expectLater(
          find.byType(OneUiButton),
          matchesGoldenFile('goldens/button_state_disabled_${att.key}.png'),
        );
      });

      testWidgets('loading / ${att.key}', (tester) async {
        await pumpButtonQaHarnessSettled(
          tester,
          _freezeTickers(
            OneUiButton(
              label: 'Save',
              attention: att.value,
              appearance: 'primary',
              loading: true,
              start: const OneUiIcon(icon: 'check'),
            ),
          ),
        );
        await expectLater(
          find.byType(OneUiButton),
          matchesGoldenFile('goldens/button_state_loading_${att.key}.png'),
        );
      });
    }
  });
}
