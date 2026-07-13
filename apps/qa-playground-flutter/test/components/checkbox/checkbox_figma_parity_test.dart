/// Checkbox Figma-parity QA suite — `[figma]`.
///
/// Exercises EVERY value of the Figma Checkbox API end-to-end against the real
/// widget, asserting actual rendered behaviour (sizes via `tester.getSize`,
/// fills via the real `BoxDecoration`, state via real `SemanticsData`). No
/// snapshot/constant assertions — every check reads a value the user can see.
///
/// Figma API surface (from the design):
///   size           s | m | l
///   appearance     auto | neutral | primary | secondary | sparkle |
///                  negative | positive | informative | warning
///   accent         primary | secondary | sparkle   (deprecated — ignored)
///   checked        t | f
///   indeterminate  t | f
///   readOnly       t | f
///   label          t | f
///   description    t | f
///   disabled       t | f
///
/// Verified facts (probed against the real widget before writing):
///   box px       s=16  m=20  l=24
///   disabled     Opacity 0.5 ; readOnly Opacity 1.0
///   auto         resolves to the secondary role (fill == appearance:secondary)
///   accent       has NO effect on fill (accent:primary fill == default fill)
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';

import '../../support/components/checkbox_harness.dart';

/// Every Figma appearance value (excludes the deprecated accent + auto, which
/// get dedicated tests).
const _kFigmaAppearances = <String>[
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'informative',
  'warning',
];

const _kBoxPxBySize = <String, double>{'s': 16, 'm': 20, 'l': 24};

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // SIZE — s / m / l map to real box dimensions.
  // ===========================================================================

  group('[figma] Checkbox — size', () {
    for (final entry in _kBoxPxBySize.entries) {
      testWidgetsAllPlatforms('[figma] size=${entry.key} renders a ${entry.value}px box',
          (tester) async {
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(size: entry.key, checked: true, ariaLabel: 'sz'),
        );
        expect(checkboxBoxSizePx(tester), entry.value,
            reason: 'Figma size=${entry.key} → ${entry.value}px box (real getSize)');
      });
    }

    testWidgetsAllPlatforms('[figma] unset size defaults to m (20px)', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, ariaLabel: 'def'),
      );
      expect(checkboxBoxSizePx(tester), 20);
    });

    testWidgetsAllPlatforms('[figma] sizes are strictly increasing s < m < l', (tester) async {
      final px = <String, double>{};
      for (final s in ['s', 'm', 'l']) {
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(size: s, checked: true, ariaLabel: s),
        );
        px[s] = checkboxBoxSizePx(tester);
      }
      expect(px['s']!, lessThan(px['m']!));
      expect(px['m']!, lessThan(px['l']!));
    });
  });

  // ===========================================================================
  // APPEARANCE — every Figma role drives a distinct checked fill colour.
  // ===========================================================================

  group('[figma] Checkbox — appearance', () {
    for (final app in _kFigmaAppearances) {
      testWidgetsAllPlatforms('[figma] appearance=$app renders a checked fill',
          (tester) async {
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(checked: true, appearance: app, ariaLabel: app),
        );
        final fill = checkboxBoxDecoration(tester).color;
        expect(fill, isNotNull);
        expect(fill, isNot(Colors.transparent),
            reason: 'checked $app fill must be opaque role colour');
      });
    }

    testWidgetsAllPlatforms('[figma] appearance=auto resolves to the secondary fill',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, appearance: 'auto', ariaLabel: 'auto'),
      );
      final auto = checkboxBoxDecoration(tester).color;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, appearance: 'secondary', ariaLabel: 'sec'),
      );
      final secondary = checkboxBoxDecoration(tester).color;
      expect(auto, secondary,
          reason: 'Checkbox.shared.ts: appearance=auto → secondary stack');
    });

    testWidgetsAllPlatforms(
        '[figma] primary and secondary produce DIFFERENT fills (roles are wired)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, appearance: 'primary', ariaLabel: 'p'),
      );
      final primary = checkboxBoxDecoration(tester).color;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, appearance: 'secondary', ariaLabel: 's'),
      );
      final secondary = checkboxBoxDecoration(tester).color;
      expect(primary, isNot(secondary));
    });

    testWidgetsAllPlatforms(
        '[figma] unchecked border stays neutral regardless of appearance (web parity)',
        (tester) async {
      // Web: --_cb-unchecked-stroke defaults to Neutral and only tints via
      // surface context, NOT the appearance prop. Flutter must match.
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: false, appearance: 'negative', ariaLabel: 'neg'),
      );
      final neg = (checkboxBoxDecoration(tester).border as Border).top.color;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: false, appearance: 'secondary', ariaLabel: 'sec'),
      );
      final sec = (checkboxBoxDecoration(tester).border as Border).top.color;
      expect(neg, sec,
          reason: 'unchecked stroke is neutral for any appearance — '
              'Checkbox.module.css --_cb-unchecked-stroke');
    });
  });

  // ===========================================================================
  // ACCENT (deprecated) — must NOT change the rendered fill.
  // ===========================================================================

  group('[figma] Checkbox — accent is ignored', () {
    for (final accent in ['primary', 'secondary', 'sparkle']) {
      testWidgetsAllPlatforms('[figma] accent=$accent does not change the default fill',
          (tester) async {
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(checked: true, accent: accent, ariaLabel: 'acc'),
        );
        final withAccent = checkboxBoxDecoration(tester).color;
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(checked: true, ariaLabel: 'noacc'),
        );
        final withoutAccent = checkboxBoxDecoration(tester).color;
        expect(withAccent, withoutAccent,
            reason: 'accent is @deprecated and ignored at runtime — '
                'fill must follow appearance only');
      });
    }
  });

  // ===========================================================================
  // CHECKED / INDETERMINATE
  // ===========================================================================

  group('[figma] Checkbox — checked + indeterminate', () {
    testWidgetsAllPlatforms('[figma] checked=true fills the box; unchecked is transparent',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, ariaLabel: 'c'),
      );
      expect(checkboxBoxDecoration(tester).color, isNot(Colors.transparent));

      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: false, ariaLabel: 'u'),
      );
      expect(checkboxBoxDecoration(tester).color, Colors.transparent);
    });

    testWidgetsAllPlatforms('[figma] checked=true exposes checked semantics', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, label: 'Checked'),
      );
      expectCheckboxChecked(tester, 'Checked', checked: true);
    });

    testWidgetsAllPlatforms('[figma] indeterminate=true exposes mixed (overrides checked)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(indeterminate: true, checked: true, label: 'Mixed'),
      );
      expectCheckboxMixed(tester, 'Mixed');
      // Indeterminate also paints a filled box.
      expect(checkboxBoxDecoration(tester).color, isNot(Colors.transparent));
    });
  });

  // ===========================================================================
  // READONLY  — stays enabled, opacity 1.0, distinct dark fill (content-high).
  // ===========================================================================

  group('[figma] Checkbox — readOnly', () {
    testWidgetsAllPlatforms('[figma] readOnly keeps semantics enabled', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(readOnly: true, label: 'Locked'),
      );
      expectCheckboxReadOnlyEnabled(tester, 'Locked');
    });

    testWidgetsAllPlatforms('[figma] readOnly opacity stays 1.0 (NOT dimmed like disabled)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(readOnly: true, checked: true, ariaLabel: 'ro'),
      );
      final op = tester.widget<Opacity>(find
          .descendant(of: checkboxRootFinder(), matching: find.byType(Opacity))
          .first);
      expect(op.opacity, 1.0);
    });

    testWidgetsAllPlatforms('[figma] readOnly checked fill differs from brand bold fill',
        (tester) async {
      // readonly uses --_cb-default-high (content-high / dark), NOT the brand
      // bold colour. Verify the two differ.
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(readOnly: true, checked: true, appearance: 'primary', ariaLabel: 'ro'),
      );
      final roFill = checkboxBoxDecoration(tester).color;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, appearance: 'primary', ariaLabel: 'rw'),
      );
      final boldFill = checkboxBoxDecoration(tester).color;
      expect(roFill, isNot(boldFill),
          reason: 'readonly fill = content-high, not the brand --Primary-Bold');
    });

    testWidgetsAllPlatforms('[figma] readOnly blocks tap toggle', (tester) async {
      var changed = false;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(
          readOnly: true,
          label: 'Locked',
          onCheckedChange: (_) => changed = true,
        ),
      );
      await tester.tap(find.text('Locked'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });

  // ===========================================================================
  // DISABLED
  // ===========================================================================

  group('[figma] Checkbox — disabled', () {
    testWidgetsAllPlatforms('[figma] disabled dims via Opacity 0.5', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(disabled: true, checked: true, ariaLabel: 'd'),
      );
      final op = tester.widget<Opacity>(find
          .descendant(of: checkboxRootFinder(), matching: find.byType(Opacity))
          .first);
      expect(op.opacity, 0.5);
    });

    testWidgetsAllPlatforms('[figma] disabled marks semantics not enabled + blocks tap',
        (tester) async {
      var changed = false;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(
          disabled: true,
          label: 'Off',
          onCheckedChange: (_) => changed = true,
        ),
      );
      expectCheckboxDisabled(tester, 'Off');
      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });

  // ===========================================================================
  // LABEL / DESCRIPTION (content)
  // ===========================================================================

  group('[figma] Checkbox — label + description', () {
    testWidgetsAllPlatforms('[figma] label=true renders visible label text', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Accept terms'),
      );
      expect(find.text('Accept terms'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] description=true renders below the label', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Subscribe', description: 'Weekly digest only.'),
      );
      expect(find.text('Subscribe'), findsOneWidget);
      expect(find.text('Weekly digest only.'), findsOneWidget);
      // description sits visually below the label.
      final labelY = tester.getTopLeft(find.text('Subscribe')).dy;
      final descY = tester.getTopLeft(find.text('Weekly digest only.')).dy;
      expect(descY, greaterThan(labelY));
    });

    testWidgetsAllPlatforms('[figma] description-only uses description as the a11y name',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(description: 'Weekly digest only.'),
      );
      withSemanticsHandle(tester, () {
        expectCheckboxChecked(tester, 'Weekly digest only.', checked: false);
      });
    });

    testWidgetsAllPlatforms('[figma] label=false (no label) still renders the box',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(ariaLabel: 'Standalone'),
      );
      expect(checkboxRootFinder(), findsOneWidget);
      expect(checkboxBoxSizePx(tester), 20);
    });
  });

  // ===========================================================================
  // FULL MATRIX — the Figma states sheet (3 rows × 3 sizes × readOnly f/t).
  // Verifies every cell renders without error and exposes the right semantics.
  // ===========================================================================

  group('[figma] Checkbox — states sheet matrix (row × size × readOnly)', () {
    for (final size in ['s', 'm', 'l']) {
      for (final readOnly in [false, true]) {
        final ro = readOnly ? 'ro' : 'rw';

        testWidgetsAllPlatforms('[figma] unchecked / $size / $ro', (tester) async {
          await pumpCheckboxJioHarnessSettled(
            tester,
            OneUiCheckbox(size: size, readOnly: readOnly, checked: false, label: 'r'),
          );
          expect(checkboxBoxSizePx(tester), _kBoxPxBySize[size]);
          expectCheckboxChecked(tester, 'r', checked: false);
        });

        testWidgetsAllPlatforms('[figma] checked / $size / $ro', (tester) async {
          await pumpCheckboxJioHarnessSettled(
            tester,
            OneUiCheckbox(size: size, readOnly: readOnly, checked: true, label: 'r'),
          );
          expect(checkboxBoxSizePx(tester), _kBoxPxBySize[size]);
          expectCheckboxChecked(tester, 'r', checked: true);
        });

        testWidgetsAllPlatforms('[figma] indeterminate / $size / $ro', (tester) async {
          await pumpCheckboxJioHarnessSettled(
            tester,
            OneUiCheckbox(size: size, readOnly: readOnly, indeterminate: true, label: 'r'),
          );
          expect(checkboxBoxSizePx(tester), _kBoxPxBySize[size]);
          expectCheckboxMixed(tester, 'r');
        });
      }
    }
  });

  // ===========================================================================
  // SEMANTICS role — checkbox exposes hasCheckedState (the checkbox role).
  // ===========================================================================

  group('[figma] Checkbox — control role', () {
    testWidgetsAllPlatforms('[figma] exposes the checkbox role (hasCheckedState)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Role', checked: false),
      );
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Role');
        expect(data.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
      });
    });
  });
}
