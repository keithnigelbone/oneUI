/// IconButton visual-regression tests — DARK MODE.
///
/// Re-runs the high-signal attention × appearance subset under `darkMode: true`
/// so surface-step flips (2500 → 100) and on-bold contrast inversion regress here.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';

import '../../support/components/icon_button_harness.dart';

Widget _freezeTickers(Widget child) =>
    TickerMode(enabled: false, child: child);

const _kDarkAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
];

const _kAttentions = <String, OneUiIconButtonAttention>{
  'high': OneUiIconButtonAttention.high,
  'medium': OneUiIconButtonAttention.medium,
  'low': OneUiIconButtonAttention.low,
};

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    // Preload SVG icons in real-async setUpAll (lazy in-test load hangs capture).
    await ensureIconButtonIconsLoaded();
  });

  group('[golden][dark] IconButton — attention × appearance', () {
    for (final att in _kAttentions.entries) {
      for (final app in _kDarkAppearances) {
        testWidgets('${att.key} / $app (dark)', (tester) async {
          await pumpIconButtonJioHarnessSettled(
            tester,
            OneUiIconButton(
              icon: 'heart',
              semanticsLabel: 'Like',
              attention: att.value,
              appearance: app,
            ),
            darkMode: true,
          );
          await expectLater(
            find.byType(OneUiIconButton),
            matchesGoldenFile('goldens/dark/icon_button_dark_${att.key}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden][dark] IconButton — state combos', () {
    testWidgets('disabled / high (dark)', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          attention: OneUiIconButtonAttention.high,
          appearance: 'primary',
          disabled: true,
        ),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiIconButton),
        matchesGoldenFile('goldens/dark/icon_button_dark_disabled_high.png'),
      );
    });

    testWidgets('loading / high (dark)', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        _freezeTickers(
          const OneUiIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
            attention: OneUiIconButtonAttention.high,
            appearance: 'primary',
            loading: true,
          ),
        ),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiIconButton),
        matchesGoldenFile('goldens/dark/icon_button_dark_loading_high.png'),
      );
    });
  });
}
