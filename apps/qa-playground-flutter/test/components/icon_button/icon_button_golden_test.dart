/// IconButton visual-regression tests — LIGHT. Captures golden PNGs across the
/// Figma matrix using the real Jio Convex fixture.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines:
///   flutter test --update-goldens test/components/icon_button/icon_button_golden_test.dart
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';

import '../../support/components/icon_button_harness.dart';

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

const _kSizeAliases = <String>['2xs', 'xs', 's', 'm', 'l', 'xl'];

OneUiIconButton _iconBtn({
  OneUiIconButtonAttention? attention,
  String appearance = 'primary',
  String? sizeAlias,
  bool condensed = false,
  bool contained = true,
  OneUiIconButtonLayout layout = OneUiIconButtonLayout.square,
  bool fullWidth = false,
  bool disabled = false,
  bool loading = false,
}) {
  return OneUiIconButton(
    icon: 'heart',
    semanticsLabel: 'Like',
    attention: attention,
    appearance: appearance,
    sizeAlias: sizeAlias,
    condensed: condensed,
    contained: contained,
    layout: layout,
    fullWidth: fullWidth,
    disabled: disabled,
    loading: loading,
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    // Preload the SVG icon catalog in real-async setUpAll — a lazy load inside
    // the fake-async testWidgets zone hangs golden capture to the 10-min timeout.
    await ensureIconButtonIconsLoaded();
  });

  group('[golden] IconButton — core attention levels', () {
    for (final entry in {
      'high': OneUiIconButtonAttention.high,
      'medium': OneUiIconButtonAttention.medium,
      'low': OneUiIconButtonAttention.low,
    }.entries) {
      testWidgets('attention=${entry.key} / primary', (tester) async {
        await pumpIconButtonJioHarnessSettled(
          tester,
          _iconBtn(attention: entry.value),
        );
        await expectLater(
          find.byType(OneUiIconButton),
          matchesGoldenFile('goldens/icon_button_${entry.key}_primary.png'),
        );
      });
    }
  });

  group('[golden] IconButton — states', () {
    testWidgets('disabled / high', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        _iconBtn(
          attention: OneUiIconButtonAttention.high,
          disabled: true,
        ),
      );
      await expectLater(
        find.byType(OneUiIconButton),
        matchesGoldenFile('goldens/icon_button_disabled_high.png'),
      );
    });

    testWidgets('loading / high', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        _freezeTickers(
          _iconBtn(
            attention: OneUiIconButtonAttention.high,
            loading: true,
          ),
        ),
      );
      await expectLater(
        find.byType(OneUiIconButton),
        matchesGoldenFile('goldens/icon_button_loading_high.png'),
      );
    });
  });

  group('[golden] IconButton — layout variants', () {
    testWidgets('condensed / high', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        _iconBtn(attention: OneUiIconButtonAttention.high, condensed: true),
      );
      await expectLater(
        find.byType(OneUiIconButton),
        matchesGoldenFile('goldens/icon_button_condensed_high.png'),
      );
    });

    testWidgets('wide 3:2 / high', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        _iconBtn(
          attention: OneUiIconButtonAttention.high,
          layout: OneUiIconButtonLayout.wide,
        ),
      );
      await expectLater(
        find.byType(OneUiIconButton),
        matchesGoldenFile('goldens/icon_button_wide_high.png'),
      );
    });

    testWidgets('fullWidth / high', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        SizedBox(
          width: 160,
          child: _iconBtn(
            attention: OneUiIconButtonAttention.high,
            fullWidth: true,
          ),
        ),
      );
      await expectLater(
        find.byType(OneUiIconButton),
        matchesGoldenFile('goldens/icon_button_fullwidth_high.png'),
      );
    });

    testWidgets('uncontained / high', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        _iconBtn(
          attention: OneUiIconButtonAttention.high,
          contained: false,
        ),
      );
      await expectLater(
        find.byType(OneUiIconButton),
        matchesGoldenFile('goldens/icon_button_uncontained_high.png'),
      );
    });
  });

  group('[golden] IconButton — sizes (high / primary)', () {
    for (final alias in _kSizeAliases) {
      testWidgets('size=$alias', (tester) async {
        await pumpIconButtonJioHarnessSettled(
          tester,
          _iconBtn(
            attention: OneUiIconButtonAttention.high,
            sizeAlias: alias,
          ),
        );
        await expectLater(
          find.byType(OneUiIconButton),
          matchesGoldenFile('goldens/icon_button_size_$alias.png'),
        );
      });
    }
  });

  group('[golden] IconButton — attention × appearance matrix (high only)', () {
    for (final app in _kAppearances) {
      testWidgets('high / $app', (tester) async {
        await pumpIconButtonJioHarnessSettled(
          tester,
          _iconBtn(
            attention: OneUiIconButtonAttention.high,
            appearance: app,
          ),
        );
        await expectLater(
          find.byType(OneUiIconButton),
          matchesGoldenFile('goldens/icon_button_high_$app.png'),
        );
      });
    }
  });
}
