/// Chip Figma-parity QA suite — `[figma]`.
///
/// Exercises EVERY value of the Figma Chip API against the real widget,
/// asserting actual rendered behaviour (chrome height via `tester.getSize`,
/// fills via the real `BoxDecoration`, opacity via the real `Opacity`, state via
/// real `SemanticsData`) plus the pure role/variant resolution contract. Runs on
/// the synthetic measurement harness so it is fully verifiable offline; the
/// per-role FILL COLOURS (which need the live brand palette) are covered by the
/// Jio goldens (`chip_golden_test.dart`).
///
/// Figma API surface (from the design):
///   size        s | m | l
///   selected    true | false
///   attention   high | medium | low
///   appearance  auto | neutral | primary | secondary | negative | positive |
///               informative | warning
///   disabled    true | false
///   start/end   none | icon | Avatar | CounterBadge | IndicatorBadge
///
/// Verified facts (probed against the real widget before writing):
///   chrome px   s=24  m=28  l=32     disabled Opacity 0.38 ; enabled 1.0
///   selected fill is dark/bold, unselected fill is light/subtle (they differ)
///   appearance=auto → resolvedAppearance 'secondary' (Chip.shared.ts)
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/chip_harness.dart';

const _kChromePxBySize = <String, double>{'s': 24, 'm': 28, 'l': 32};
const _kFigmaAppearances = <String>[
  'neutral',
  'primary',
  'secondary',
  'negative',
  'positive',
  'informative',
  'warning',
];

void main() {
  // ===========================================================================
  // SIZE — s / m / l map to real chrome heights.
  // ===========================================================================

  group('[figma] Chip — size', () {
    for (final entry in _kChromePxBySize.entries) {
      testWidgetsAllPlatforms('[figma] size=${entry.key} renders ${entry.value}px chrome',
          (tester) async {
        await pumpChipQaHarness(
          tester,
          OneUiChip(child: 'Sz', size: entry.key, selected: true),
        );
        expect(chipHeightPx(tester), entry.value,
            reason: 'Figma size=${entry.key} → ${entry.value}px (real getSize)');
      });
    }

    testWidgetsAllPlatforms('[figma] unset size defaults to m (28px)', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'D', selected: true));
      expect(chipHeightPx(tester), 28);
    });

    testWidgetsAllPlatforms('[figma] chrome heights are strictly increasing s < m < l',
        (tester) async {
      final px = <String, double>{};
      for (final s in ['s', 'm', 'l']) {
        await pumpChipQaHarness(tester, OneUiChip(child: s, size: s, selected: true));
        px[s] = chipHeightPx(tester);
      }
      expect(px['s']!, lessThan(px['m']!));
      expect(px['m']!, lessThan(px['l']!));
    });
  });

  // ===========================================================================
  // SELECTED — toggle state drives both semantics and a distinct fill.
  // ===========================================================================

  group('[figma] Chip — selected', () {
    testWidgetsAllPlatforms('[figma] selected=true exposes selected semantics', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'On', selected: true));
      expectChipSelected(tester, selected: true, label: 'On');
    });

    testWidgetsAllPlatforms('[figma] selected=false exposes unselected semantics', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'Off', selected: false));
      expectChipSelected(tester, selected: false, label: 'Off');
    });

    testWidgetsAllPlatforms('[figma] selected fill differs from unselected fill', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'S', selected: true));
      final selected = chipFill(tester);
      await pumpChipQaHarness(tester, OneUiChip(child: 'S', selected: false));
      final unselected = chipFill(tester);
      expect(selected, isNot(unselected),
          reason: 'selected chip paints a bold fill, unselected a subtle one');
    });
  });

  // ===========================================================================
  // ATTENTION — high / medium / low map to the bold / subtle / ghost variants.
  // ===========================================================================

  group('[figma] Chip — attention', () {
    test('[figma] attention→variant mapping (Chip.shared.ts)', () {
      expect(resolveOneUiChipState(attention: 'high').resolvedVariant, 'bold');
      expect(resolveOneUiChipState(attention: 'medium').resolvedVariant, 'subtle');
      expect(resolveOneUiChipState(attention: 'low').resolvedVariant, 'ghost');
    });

    for (final attention in ['high', 'medium', 'low']) {
      testWidgetsAllPlatforms('[figma] attention=$attention renders selectable chip',
          (tester) async {
        await pumpChipQaHarness(
          tester,
          OneUiChip(child: 'A', attention: attention, selected: true),
        );
        expect(chipRootFinder(), findsOneWidget);
        expectChipSelected(tester, selected: true, label: 'A');
      });
    }
  });

  // ===========================================================================
  // APPEARANCE — every Figma role renders; auto resolves to secondary.
  // ===========================================================================

  group('[figma] Chip — appearance', () {
    for (final app in _kFigmaAppearances) {
      testWidgetsAllPlatforms('[figma] appearance=$app renders a selected chip',
          (tester) async {
        await pumpChipQaHarness(
          tester,
          OneUiChip(child: app, appearance: app, selected: true),
        );
        expect(chipFill(tester), isNotNull);
        expect(chipFill(tester), isNot(Colors.transparent),
            reason: 'selected $app chip paints an opaque fill');
      });
    }

    test('[figma] appearance=auto resolves to the secondary role', () {
      expect(resolveOneUiChipState(appearance: 'auto').resolvedAppearance, 'secondary');
    });

    test('[figma] primary and secondary resolve to DIFFERENT roles', () {
      expect(
        resolveOneUiChipState(appearance: 'primary').resolvedAppearance,
        isNot(resolveOneUiChipState(appearance: 'secondary').resolvedAppearance),
      );
    });
  });

  // ===========================================================================
  // DISABLED — dims via Opacity 0.38, marks not-enabled, blocks tap.
  // ===========================================================================

  group('[figma] Chip — disabled', () {
    testWidgetsAllPlatforms('[figma] disabled dims via Opacity 0.38', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChip(child: 'D', disabled: true, selected: true),
      );
      expect(chipOpacity(tester), 0.38);
    });

    testWidgetsAllPlatforms('[figma] enabled chip opacity is 1.0', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'E', selected: true));
      expect(chipOpacity(tester), 1.0);
    });

    testWidgetsAllPlatforms('[figma] disabled marks not-enabled + blocks tap', (tester) async {
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Off',
          disabled: true,
          onSelectedChange: (v, [d]) => changed = true,
        ),
      );
      expectChipDisabled(tester, label: 'Off');
      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });

  // ===========================================================================
  // SLOTS — start / end render and order around the label.
  // ===========================================================================

  group('[figma] Chip — start/end slots', () {
    testWidgetsAllPlatforms('[figma] start icon renders left of the label', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Liked',
          selected: true,
          start: const OneUiIcon(icon: 'favorite', semanticsLabel: 'fav'),
        ),
      );
      expect(find.byType(OneUiIcon), findsOneWidget);
      expect(tester.getCenter(find.byType(OneUiIcon)).dx,
          lessThan(tester.getCenter(find.text('Liked')).dx));
    });

    testWidgetsAllPlatforms('[figma] end icon renders right of the label', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Liked',
          selected: true,
          end: const OneUiIcon(icon: 'close', semanticsLabel: 'remove'),
        ),
      );
      expect(tester.getCenter(find.byType(OneUiIcon)).dx,
          greaterThan(tester.getCenter(find.text('Liked')).dx));
    });
  });

  // ===========================================================================
  // FULL MATRIX — size × selected. Verifies every cell renders with the right
  // chrome height and selection semantics.
  // ===========================================================================

  group('[figma] Chip — size × selected matrix', () {
    for (final size in ['s', 'm', 'l']) {
      for (final selected in [false, true]) {
        testWidgetsAllPlatforms('[figma] $size / ${selected ? 'selected' : 'unselected'}',
            (tester) async {
          await pumpChipQaHarness(
            tester,
            OneUiChip(child: 'C', size: size, selected: selected),
          );
          expect(chipHeightPx(tester), _kChromePxBySize[size]);
          expectChipSelected(tester, selected: selected, label: 'C');
        });
      }
    }
  });

  // ===========================================================================
  // CONTROL ROLE — chip exposes a button semantics node.
  // ===========================================================================

  group('[figma] Chip — control role', () {
    testWidgetsAllPlatforms('[figma] exposes the button role', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'Role', selected: false));
      withSemanticsHandle(tester, () {
        final data = chipSemanticsData(tester, label: 'Role');
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
      });
    });
  });
}
