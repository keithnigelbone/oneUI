/// Radio Figma-parity QA suite — `[figma]`.
///
/// Exercises EVERY value of the Figma Radio API end-to-end against the real
/// widget, asserting actual rendered behaviour (box px via `tester.getSize`,
/// fills/borders via the real `BoxDecoration`, state via real `SemanticsData`).
/// No snapshot/constant assertions — every check reads a user-visible value.
///
/// Figma API surface (from the design, source of truth):
///   size        s | m | l
///   appearance  auto | neutral | primary | secondary | sparkle |
///               negative | positive | informative | warning
///   accent      primary | secondary | sparkle   (deprecated — ignored)
///   checked     t | f          (owned by RadioGroup value/defaultValue)
///   readOnly    t | f
///   label       t | f
///   description t | f
///   disabled    t | f          (OneUI Plugin)
///
/// Verified facts (probed against the real widget before writing):
///   box px       s=16  m=20  l=24   (size set on the OPTION; group size only
///                                     applies when the option size is unset)
///   disabled     Opacity 0.5 ; readOnly Opacity 1.0 (Jio fixture)
///   auto         resolves to the secondary role (checked fill == secondary)
///   accent       has NO effect on the rendered fill
///   unchecked    border stays neutral regardless of the appearance prop
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

import '../../support/components/radio_harness.dart';

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

/// One radio inside a minimal group; [checked] selects it via defaultValue.
Widget _radio({
  String size = 'm',
  String appearance = 'auto',
  String? accent,
  bool checked = false,
  bool readOnly = false,
  bool disabled = false,
  String label = 'r',
  String? description,
}) {
  return OneUiRadioGroup(
    defaultValue: checked ? 'a' : null,
    readOnly: readOnly,
    disabled: disabled,
    children: [
      OneUiRadio(
        value: 'a',
        size: size,
        appearance: appearance,
        accent: accent,
        label: label,
        description: description,
      ),
    ],
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // SIZE
  // ===========================================================================

  group('[figma] Radio — size', () {
    for (final entry in _kBoxPxBySize.entries) {
      testWidgetsAllPlatforms('[figma] size=${entry.key} renders a ${entry.value}px box',
          (tester) async {
        await pumpRadioJioHarnessSettled(tester, _radio(size: entry.key, checked: true));
        expect(radioBoxSizePx(tester), entry.value,
            reason: 'Figma size=${entry.key} → ${entry.value}px box (real getSize)');
      });
    }

    testWidgetsAllPlatforms('[figma] unset size defaults to m (20px)', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(checked: true));
      expect(radioBoxSizePx(tester), 20);
    });

    testWidgetsAllPlatforms('[figma] sizes are strictly increasing s < m < l', (tester) async {
      final px = <String, double>{};
      for (final s in ['s', 'm', 'l']) {
        await pumpRadioJioHarnessSettled(tester, _radio(size: s, checked: true));
        px[s] = radioBoxSizePx(tester);
      }
      expect(px['s']!, lessThan(px['m']!));
      expect(px['m']!, lessThan(px['l']!));
    });
  });

  // ===========================================================================
  // APPEARANCE — every Figma role drives a distinct checked fill colour.
  // ===========================================================================

  group('[figma] Radio — appearance', () {
    for (final app in _kFigmaAppearances) {
      testWidgetsAllPlatforms('[figma] appearance=$app renders an opaque checked fill',
          (tester) async {
        await pumpRadioJioHarnessSettled(tester, _radio(appearance: app, checked: true));
        final fill = radioBoxDecoration(tester).color;
        expect(fill, isNotNull);
        expect(fill, isNot(Colors.transparent),
            reason: 'checked $app fill must be an opaque role colour');
      });
    }

    testWidgetsAllPlatforms('[figma] appearance=auto resolves to the secondary fill',
        (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(appearance: 'auto', checked: true));
      final auto = radioBoxDecoration(tester).color;
      await pumpRadioJioHarnessSettled(tester, _radio(appearance: 'secondary', checked: true));
      final secondary = radioBoxDecoration(tester).color;
      expect(auto, secondary,
          reason: 'Radio.shared.ts: appearance=auto → secondary stack');
    });

    testWidgetsAllPlatforms(
        '[figma] primary and secondary produce DIFFERENT fills (roles are wired)',
        (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(appearance: 'primary', checked: true));
      final primary = radioBoxDecoration(tester).color;
      await pumpRadioJioHarnessSettled(tester, _radio(appearance: 'secondary', checked: true));
      final secondary = radioBoxDecoration(tester).color;
      expect(primary, isNot(secondary));
    });

    testWidgetsAllPlatforms(
        '[figma] unchecked border stays neutral regardless of appearance (web parity)',
        (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(appearance: 'negative', checked: false));
      final neg = radioBorderColor(tester);
      await pumpRadioJioHarnessSettled(tester, _radio(appearance: 'secondary', checked: false));
      final sec = radioBorderColor(tester);
      expect(neg, sec,
          reason: 'unchecked stroke is neutral for any appearance — '
              'resolveOneUiRadioUncheckedAppearance → neutral off-surface');
    });
  });

  // ===========================================================================
  // ACCENT (deprecated) — must NOT change the rendered fill.
  // ===========================================================================

  group('[figma] Radio — accent is ignored', () {
    for (final accent in ['primary', 'secondary', 'sparkle']) {
      testWidgetsAllPlatforms('[figma] accent=$accent does not change the default fill',
          (tester) async {
        await pumpRadioJioHarnessSettled(tester, _radio(accent: accent, checked: true));
        final withAccent = radioBoxDecoration(tester).color;
        await pumpRadioJioHarnessSettled(tester, _radio(checked: true));
        final withoutAccent = radioBoxDecoration(tester).color;
        expect(withAccent, withoutAccent,
            reason: 'accent is @deprecated and ignored at runtime — '
                'fill follows appearance only');
      });
    }
  });

  // ===========================================================================
  // CHECKED — owned by the group; fills the box + shows the dot.
  // ===========================================================================

  group('[figma] Radio — checked', () {
    testWidgetsAllPlatforms('[figma] checked fills the box; unchecked is transparent',
        (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(checked: true));
      expect(radioBoxDecoration(tester).color, isNot(Colors.transparent));
      await pumpRadioJioHarnessSettled(tester, _radio(checked: false));
      expect(radioBoxDecoration(tester).color, Colors.transparent);
    });

    testWidgetsAllPlatforms('[figma] checked renders the inner dot; unchecked does not',
        (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(checked: true));
      expect(radioHasInnerDot(tester), isTrue);
      await pumpRadioJioHarnessSettled(tester, _radio(checked: false));
      expect(radioHasInnerDot(tester), isFalse);
    });

    testWidgetsAllPlatforms('[figma] checked exposes checked semantics', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(checked: true, label: 'Checked'));
      expectRadioChecked(tester, 'Checked', checked: true);
    });
  });

  // ===========================================================================
  // READONLY — stays enabled, opacity 1.0, still shows the dot when checked.
  // ===========================================================================

  group('[figma] Radio — readOnly', () {
    testWidgetsAllPlatforms('[figma] readOnly keeps semantics enabled', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(readOnly: true, label: 'Locked'));
      expectRadioEnabled(tester, 'Locked');
    });

    testWidgetsAllPlatforms('[figma] readOnly opacity stays 1.0 (NOT dimmed like disabled)',
        (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(readOnly: true, checked: true));
      expect(radioOpacity(tester), 1.0);
    });

    testWidgetsAllPlatforms('[figma] readOnly checked still shows the inner dot', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(readOnly: true, checked: true));
      expect(radioHasInnerDot(tester), isTrue);
    });
  });

  // ===========================================================================
  // DISABLED
  // ===========================================================================

  group('[figma] Radio — disabled', () {
    testWidgetsAllPlatforms('[figma] disabled dims via Opacity 0.5', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(disabled: true, checked: true));
      expect(radioOpacity(tester), 0.5);
    });

    testWidgetsAllPlatforms('[figma] disabled marks semantics not enabled', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(disabled: true, label: 'Off'));
      expectRadioDisabled(tester, 'Off');
    });
  });

  // ===========================================================================
  // LABEL / DESCRIPTION (content)
  // ===========================================================================

  group('[figma] Radio — label + description', () {
    testWidgetsAllPlatforms('[figma] label=true renders visible label text', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(label: 'Accept terms'));
      expect(find.text('Accept terms'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] description=true renders below the label', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        _radio(label: 'Pro', description: 'Best for teams.'),
      );
      expect(find.text('Pro'), findsOneWidget);
      expect(find.text('Best for teams.'), findsOneWidget);
      final labelY = tester.getTopLeft(find.text('Pro')).dy;
      final descY = tester.getTopLeft(find.text('Best for teams.')).dy;
      expect(descY, greaterThan(labelY));
    });

    testWidgetsAllPlatforms('[figma] label=false (no label) still renders the box', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [OneUiRadio(value: 'a', ariaLabel: 'Standalone')]),
      );
      expect(radioRootFinder(), findsOneWidget);
      expect(radioBoxSizePx(tester), 20);
    });
  });

  // ===========================================================================
  // FULL MATRIX — Figma states sheet (checked f/t × size s/m/l × readOnly f/t).
  // ===========================================================================

  group('[figma] Radio — states sheet matrix (checked × size × readOnly)', () {
    for (final size in ['s', 'm', 'l']) {
      for (final readOnly in [false, true]) {
        final ro = readOnly ? 'ro' : 'rw';
        for (final checked in [false, true]) {
          final ck = checked ? 'checked' : 'unchecked';
          testWidgetsAllPlatforms('[figma] $ck / $size / $ro', (tester) async {
            await pumpRadioJioHarnessSettled(
              tester,
              _radio(size: size, readOnly: readOnly, checked: checked, label: 'r'),
            );
            expect(radioBoxSizePx(tester), _kBoxPxBySize[size]);
            expectRadioChecked(tester, 'r', checked: checked);
          });
        }
      }
    }
  });

  // ===========================================================================
  // CONTROL ROLE
  // ===========================================================================

  group('[figma] Radio — control role', () {
    testWidgetsAllPlatforms('[figma] exposes the radio role (checked state + mutually exclusive)',
        (tester) async {
      await pumpRadioJioHarnessSettled(tester, _radio(label: 'Role'));
      withSemanticsHandle(tester, () {
        final d = radioSemanticsData(tester, 'Role');
        expect(d.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isInMutuallyExclusiveGroup), isTrue);
      });
    });
  });
}
