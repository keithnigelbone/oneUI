/// Divider visual-regression tests — LIGHT. Captures golden PNGs across the
/// Figma matrix: sizes, attention levels, round caps, content (icon/label) with
/// alignment, vertical, and key appearances.
///
/// Rendered with the real Jio fixture (production token resolution), so the
/// baselines are byte-identical to the qa-playground:flutter app.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens \
///     test/components/divider/divider_golden_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/divider_harness.dart';

const _kSizes = <String>['s', 'm', 'l'];
const _kAttentions = <String>['low', 'medium', 'high'];
const _kKeyAppearances = <String>['neutral', 'primary', 'secondary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    // OneUiIcon in content=icon needs the Jio SVG catalog — without this
    // OneUiSemanticIcon renders an empty SizedBox until async load completes.
    await JioIconCatalog.instance.ensureLoaded();
  });

  // size × attention (bare horizontal) — 9 baselines
  group('[golden] Divider — size × attention', () {
    for (final size in _kSizes) {
      for (final att in _kAttentions) {
        testWidgets('$size / $att', (tester) async {
          await pumpDividerJioHarness(
            tester,
            OneUiDivider(size: size, attention: att),
          );
          await expectLater(
            find.byType(OneUiDivider),
            matchesGoldenFile('goldens/divider_${size}_$att.png'),
          );
        });
      }
    }
  });

  // round caps — 2 baselines
  group('[golden] Divider — round caps', () {
    for (final round in [true, false]) {
      testWidgets('roundCaps $round', (tester) async {
        await pumpDividerJioHarness(
          tester,
          OneUiDivider(size: 'l', attention: 'high', roundCaps: round),
        );
        await expectLater(
          find.byType(OneUiDivider),
          matchesGoldenFile('goldens/divider_roundcaps_$round.png'),
        );
      });
    }
  });

  // content label × align — 3 baselines
  group('[golden] Divider — label content', () {
    for (final align in ['center', 'start', 'end']) {
      testWidgets('label / $align', (tester) async {
        await pumpDividerJioHarness(
          tester,
          OneUiDivider(content: 'label', contentAlign: align, child: 'OR'),
        );
        await expectLater(
          find.byType(OneUiDivider),
          matchesGoldenFile('goldens/divider_label_$align.png'),
        );
      });
    }
  });

  // content icon — 1 baseline
  group('[golden] Divider — icon content', () {
    testWidgets('icon / center', (tester) async {
      await pumpDividerJioHarness(
        tester,
        const OneUiDivider(content: 'icon', child: OneUiIcon(icon: 'check')),
      );
      await expectLater(
        find.byType(OneUiDivider),
        matchesGoldenFile('goldens/divider_icon_center.png'),
      );
    });
  });

  // appearance (high attention to show colour) — 5 baselines
  group('[golden] Divider — appearance', () {
    for (final app in _kKeyAppearances) {
      testWidgets('appearance $app', (tester) async {
        await pumpDividerJioHarness(
          tester,
          OneUiDivider(appearance: app, attention: 'high', size: 'l'),
        );
        await expectLater(
          find.byType(OneUiDivider),
          matchesGoldenFile('goldens/divider_appearance_$app.png'),
        );
      });
    }
  });

  // vertical sizes — 3 baselines
  group('[golden] Divider — vertical', () {
    for (final size in _kSizes) {
      testWidgets('vertical / $size', (tester) async {
        await pumpDividerJioHarness(
          tester,
          OneUiDivider(orientation: 'vertical', size: size, attention: 'high'),
          width: 80,
          height: 120,
        );
        await expectLater(
          find.byType(OneUiDivider),
          matchesGoldenFile('goldens/divider_vertical_$size.png'),
        );
      });
    }
  });
}
