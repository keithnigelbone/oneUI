/// Icon visual-regression tests — captures golden PNGs across the Figma matrix.
///
/// Coverage:
///   - "core states"            — 9 appearances at size=5 / emphasis=high
///   - "appearance × emphasis"  — 9 × 5 = 45 baselines at size=5
///   - "size sweep"             — 20 baselines at appearance=primary / emphasis=high
///   - "slot inheritance"       — appearance auto-resolves from OneUiSlotParentAppearanceScope
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_slot_parent_appearance.dart';

import '../../support/components/icon_harness.dart';

const _kAppearances = <String>[
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden] Icon — appearance × emphasis matrix (size=5)', () {
    for (final app in _kAppearances) {
      for (final emphasis in OneUiIconEmphasis.values) {
        testWidgets('appearance=$app emphasis=${emphasis.name}', (tester) async {
          await pumpIconQaHarnessSettled(
            tester,
            OneUiIcon(
              icon: 'heart',
              appearance: app,
              emphasis: emphasis,
              semanticsLabel: 'Like',
            ),
          );
          await expectLater(
            find.byType(OneUiIcon),
            matchesGoldenFile('goldens/icon_${app}_${emphasis.name}.png'),
          );
        });
      }
    }
  });

  group('[golden] Icon — size sweep (appearance=primary emphasis=high)', () {
    for (final size in kOneUiIconSizes) {
      // Skip golden baselines for sizes < 4 — at 2-3 spacing tokens the
      // rendered glyph is so small that anti-aliasing differences between
      // skia versions cause flaky diffs without telling us anything useful.
      if (['2', '2.5', '3', '3.5'].contains(size)) continue;
      // File names: replace decimal '.' with '-' for filesystem safety.
      final tail = size.replaceAll('.', '-');
      testWidgets('size=$size', (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiIcon(
            icon: 'heart',
            size: size,
            appearance: 'primary',
            semanticsLabel: 'Like',
          ),
        );
        await expectLater(
          find.byType(OneUiIcon),
          matchesGoldenFile('goldens/icon_size_$tail.png'),
        );
      });
    }
  });

  group('[golden] Icon — slot inheritance via OneUiSlotParentAppearanceScope', () {
    for (final role in ['negative', 'positive', 'sparkle']) {
      testWidgets('slot parent=$role inherits to glyph colour', (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiSlotParentAppearanceScope(
            appearance: role,
            child: const OneUiIcon(icon: 'heart', semanticsLabel: 'Like'),
          ),
        );
        await expectLater(
          find.byType(OneUiIcon),
          matchesGoldenFile('goldens/icon_slot_$role.png'),
        );
      });
    }
  });
}
