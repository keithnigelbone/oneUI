/// CircularProgressIndicator visual-regression tests — LIGHT. Captures golden
/// PNGs across the Figma matrix: determinate value steps, sizes, key
/// appearances, and content (text/icon).
///
/// Rendered with the real Jio fixture (production token resolution), so the
/// baselines are byte-identical to the qa-playground:flutter app. Determinate
/// only (indeterminate spins forever and cannot be captured deterministically).
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens \
///     test/components/circular_progress_indicator/circular_progress_indicator_golden_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/circular_progress_indicator_harness.dart';

const _kSizes = <String>['S', 'M', 'L', 'XL', '3XL'];
const _kKeyAppearances = <String>['primary', 'secondary', 'positive', 'negative', 'warning'];
const _kValues = <int>[0, 25, 50, 75, 100];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    // OneUiIcon inside CPI content=icon needs the Jio SVG catalog — without this
    // OneUiSemanticIcon renders an empty SizedBox until async load completes.
    await JioIconCatalog.instance.ensureLoaded();
  });

  // value steps (size 3XL, primary) — 5 baselines
  group('[golden] CPI — determinate value steps', () {
    for (final v in _kValues) {
      testWidgets('value $v', (tester) async {
        await pumpCpiJioHarnessSettled(
          tester,
          OneUiCircularProgressIndicator(value: v.toDouble(), size: '3XL', semanticsLabel: 'v'),
        );
        await expectLater(
          find.byType(OneUiCircularProgressIndicator),
          matchesGoldenFile('goldens/cpi_value_$v.png'),
        );
      });
    }
  });

  // size scale (value 50, primary) — 5 baselines
  group('[golden] CPI — sizes', () {
    for (final size in _kSizes) {
      testWidgets('size $size', (tester) async {
        await pumpCpiJioHarnessSettled(
          tester,
          OneUiCircularProgressIndicator(value: 50, size: size, semanticsLabel: 's'),
        );
        await expectLater(
          find.byType(OneUiCircularProgressIndicator),
          matchesGoldenFile('goldens/cpi_size_${size.toLowerCase()}.png'),
        );
      });
    }
  });

  // appearance (value 50, size 3XL) — 5 baselines
  group('[golden] CPI — appearance', () {
    for (final app in _kKeyAppearances) {
      testWidgets('appearance $app', (tester) async {
        await pumpCpiJioHarnessSettled(
          tester,
          OneUiCircularProgressIndicator(value: 50, size: '3XL', appearance: app, semanticsLabel: 'a'),
        );
        await expectLater(
          find.byType(OneUiCircularProgressIndicator),
          matchesGoldenFile('goldens/cpi_appearance_$app.png'),
        );
      });
    }
  });

  // content — text (L+) and icon — 2 baselines
  group('[golden] CPI — content', () {
    testWidgets('text', (tester) async {
      await pumpCpiJioHarnessSettled(
        tester,
        const OneUiCircularProgressIndicator(
          value: 66,
          size: '3XL',
          content: 'text',
          semanticsLabel: 'pct',
        ),
      );
      await expectLater(
        find.byType(OneUiCircularProgressIndicator),
        matchesGoldenFile('goldens/cpi_content_text.png'),
      );
    });

    testWidgets('icon', (tester) async {
      await pumpCpiJioHarnessSettled(
        tester,
        const OneUiCircularProgressIndicator(
          value: 50,
          size: '3XL',
          content: 'icon',
          semanticsLabel: 'ico',
          child: OneUiIcon(icon: 'check'),
        ),
      );
      await expectLater(
        find.byType(OneUiCircularProgressIndicator),
        matchesGoldenFile('goldens/cpi_content_icon.png'),
      );
    });
  });
}
