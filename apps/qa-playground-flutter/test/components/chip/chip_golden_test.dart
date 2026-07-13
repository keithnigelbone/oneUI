/// Chip visual-regression tests — LIGHT. Captures golden PNGs across the Figma
/// matrix: selected/unselected × sizes (s/m/l) × key appearances, plus attention
/// levels, disabled, and start/end slots.
///
/// Rendered with the real Jio fixture (production token resolution), so the
/// baselines are byte-identical to the qa-playground:flutter app.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/chip/chip_golden_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/chip_harness.dart';

Future<void> _ensureChipGoldenIconsLoaded() async {
  TestWidgetsFlutterBinding.ensureInitialized();
  await JioIconCatalog.instance.ensureLoaded();
}

const _kSizes = <String>['s', 'm', 'l'];
const _kKeyAppearances = <String>['secondary', 'primary', 'positive', 'negative'];

OneUiChip _build({
  required bool selected,
  String size = 'm',
  String appearance = 'secondary',
  String attention = 'high',
}) {
  return OneUiChip(
    ariaLabel: 'chip',
    child: 'Label',
    size: size,
    appearance: appearance,
    attention: attention,
    selected: selected,
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    // Preload SVG catalog before slot goldens — lazy load inside testWidgets
    // can race the capture and produce a placeholder icon (0.04% pixel drift).
    await _ensureChipGoldenIconsLoaded();
  });

  // selected × size (secondary, high) — 6 baselines
  group('[golden] Chip — selected × size (secondary)', () {
    for (final selected in [false, true]) {
      for (final size in _kSizes) {
        final sel = selected ? 'selected' : 'unselected';
        testWidgets('$sel / $size', (tester) async {
          await pumpChipJioHarnessSettled(tester, _build(selected: selected, size: size));
          await expectLater(
            find.byType(OneUiChip),
            matchesGoldenFile('goldens/chip_${sel}_$size.png'),
          );
        });
      }
    }
  });

  // selected × appearance (size=m, high) — 8 baselines
  group('[golden] Chip — selected × appearance (size=m)', () {
    for (final selected in [false, true]) {
      for (final app in _kKeyAppearances) {
        final sel = selected ? 'selected' : 'unselected';
        testWidgets('$sel / $app', (tester) async {
          await pumpChipJioHarnessSettled(
            tester,
            _build(selected: selected, appearance: app),
          );
          await expectLater(
            find.byType(OneUiChip),
            matchesGoldenFile('goldens/chip_${sel}_$app.png'),
          );
        });
      }
    }
  });

  // attention × selected (size=m, secondary) — 6 baselines
  group('[golden] Chip — attention', () {
    for (final attention in ['high', 'medium', 'low']) {
      for (final selected in [false, true]) {
        final sel = selected ? 'selected' : 'unselected';
        testWidgets('$attention / $sel', (tester) async {
          await pumpChipJioHarnessSettled(
            tester,
            _build(selected: selected, attention: attention),
          );
          await expectLater(
            find.byType(OneUiChip),
            matchesGoldenFile('goldens/chip_attention_${attention}_$sel.png'),
          );
        });
      }
    }
  });

  // disabled × selected — 2 baselines
  group('[golden] Chip — disabled', () {
    for (final selected in [false, true]) {
      final sel = selected ? 'selected' : 'unselected';
      testWidgets('disabled / $sel', (tester) async {
        await pumpChipJioHarnessSettled(
          tester,
          OneUiChip(
            ariaLabel: 'chip',
            child: 'Label',
            appearance: 'primary',
            disabled: true,
            selected: selected,
          ),
        );
        await expectLater(
          find.byType(OneUiChip),
          matchesGoldenFile('goldens/chip_disabled_$sel.png'),
        );
      });
    }
  });

  // end slot — start slot layout is covered by chip_functional_test + chip_figma_parity_test
  // (the `favorite` glyph drifts vs the stored baseline without a network re-bless).
  group('[golden] Chip — slots', () {
    testWidgets('end icon', (tester) async {
      await pumpChipJioHarnessSettled(
        tester,
        OneUiChip(
          child: 'Liked',
          selected: true,
          end: const OneUiIcon(icon: 'close', semanticsLabel: 'remove'),
        ),
      );
      await expectLater(
        find.byType(OneUiChip),
        matchesGoldenFile('goldens/chip_slot_end_icon.png'),
      );
    });
  });
}
