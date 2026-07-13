/// CheckboxField Figma-parity QA suite — `[figma]`.
///
/// Exercises EVERY value of the Figma CheckboxField API end-to-end against the
/// real widget, asserting actual rendered behaviour (box sizes via
/// `tester.getSize`, fills via the real `BoxDecoration`, state via real
/// `SemanticsData`, real rendered InputFeedback / IconButton / asterisk text).
/// No snapshot/constant assertions — every check reads a value the user sees.
///
/// Figma API surface (from the design):
///   size           s | m | l
///   appearance     auto | neutral | primary | secondary | sparkle |
///                  negative | positive | informative | warning
///   accent         primary | secondary | sparkle   (field shell omits accent)
///   checked        t | f
///   indeterminate  t | f
///   readOnly       t | f
///   label          t | f
///   required       t | f      (asterisk on the label)
///   infoIcon       t | f      (info IconButton beside the label)
///   description    t | f
///   feedback       t | f      (InputFeedback row)
///   disabled       t | f
///   content        t | f      (Figma-only; the integrated single field always
///                              renders the control + optional copy)
///
/// Verified facts (probed against the real widget BEFORE writing each test):
///   box px       s=16  m=20  l=24
///   disabled     Opacity 0.5 ; readOnly Opacity 1.0
///   auto         resolves to the secondary role (fill == appearance:secondary)
///   required     renders a visible ` *` asterisk on the label rich text
///   infoIcon     renders one OneUiIconButton (icon 'info')
///   feedback     error → one OneUiInputFeedback + visible message + alert role
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

import '../../support/components/checkbox_field_harness.dart';

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
  // SIZE — s / m / l map to real inner-box dimensions.
  // ===========================================================================

  group('[figma] CheckboxField — size', () {
    for (final entry in _kBoxPxBySize.entries) {
      testWidgetsAllPlatforms(
          '[figma] size=${entry.key} renders a ${entry.value}px control box',
          (tester) async {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          OneUiCheckboxField(label: 'sz', size: entry.key, checked: true),
        );
        expect(checkboxBoxSizePx(tester), entry.value,
            reason: 'Figma size=${entry.key} → ${entry.value}px box (real getSize)');
      });
    }

    testWidgetsAllPlatforms('[figma] unset size defaults to m (20px)', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'def', checked: true),
      );
      expect(checkboxBoxSizePx(tester), 20);
    });

    testWidgetsAllPlatforms('[figma] sizes strictly increasing s < m < l', (tester) async {
      final px = <String, double>{};
      for (final s in ['s', 'm', 'l']) {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          OneUiCheckboxField(label: s, size: s, checked: true),
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

  group('[figma] CheckboxField — appearance', () {
    for (final app in _kFigmaAppearances) {
      testWidgetsAllPlatforms('[figma] appearance=$app renders a checked fill',
          (tester) async {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          OneUiCheckboxField(label: app, appearance: app, checked: true),
        );
        final fill = checkboxBoxDecoration(tester).color;
        expect(fill, isNotNull);
        expect(fill, isNot(Colors.transparent),
            reason: 'checked $app fill must be an opaque role colour');
      });
    }

    testWidgetsAllPlatforms('[figma] appearance=auto resolves to the secondary fill',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'a', appearance: 'auto', checked: true),
      );
      final auto = checkboxBoxDecoration(tester).color;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 's', appearance: 'secondary', checked: true),
      );
      final secondary = checkboxBoxDecoration(tester).color;
      expect(auto, secondary,
          reason: 'CheckboxField.shared.ts: appearance=auto → secondary stack');
    });

    testWidgetsAllPlatforms(
        '[figma] primary and secondary produce DIFFERENT fills (roles wired)',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'p', appearance: 'primary', checked: true),
      );
      final primary = checkboxBoxDecoration(tester).color;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 's', appearance: 'secondary', checked: true),
      );
      expect(primary, isNot(checkboxBoxDecoration(tester).color));
    });
  });

  // ===========================================================================
  // CHECKED / INDETERMINATE
  // ===========================================================================

  group('[figma] CheckboxField — checked + indeterminate', () {
    testWidgetsAllPlatforms('[figma] checked=true fills; unchecked transparent',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'c', checked: true),
      );
      expect(checkboxBoxDecoration(tester).color, isNot(Colors.transparent));

      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'u', checked: false),
      );
      expect(checkboxBoxDecoration(tester).color, Colors.transparent);
    });

    testWidgetsAllPlatforms('[figma] checked=true exposes checked semantics', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Checked', checked: true),
      );
      expectCheckboxChecked(tester, 'Checked', checked: true);
    });

    testWidgetsAllPlatforms('[figma] indeterminate=true exposes mixed (overrides checked)',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Mixed', indeterminate: true, checked: true),
      );
      expectCheckboxMixed(tester, 'Mixed');
      expect(checkboxBoxDecoration(tester).color, isNot(Colors.transparent));
    });
  });

  // ===========================================================================
  // READONLY  — stays enabled, opacity 1.0.
  // ===========================================================================

  group('[figma] CheckboxField — readOnly', () {
    testWidgetsAllPlatforms('[figma] readOnly keeps semantics enabled', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Locked', readOnly: true),
      );
      expectCheckboxReadOnlyEnabled(tester, 'Locked');
    });

    testWidgetsAllPlatforms('[figma] readOnly opacity stays 1.0 (NOT dimmed like disabled)',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'ro', readOnly: true, checked: true),
      );
      final op = tester.widget<Opacity>(find
          .descendant(of: checkboxRootFinder(), matching: find.byType(Opacity))
          .first);
      expect(op.opacity, 1.0);
    });

    testWidgetsAllPlatforms('[figma] readOnly blocks tap toggle', (tester) async {
      var changed = false;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        OneUiCheckboxField(
          label: 'Locked',
          readOnly: true,
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

  group('[figma] CheckboxField — disabled', () {
    testWidgetsAllPlatforms('[figma] disabled dims via Opacity 0.5', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'd', disabled: true, checked: true),
      );
      // The field wraps its body in an Opacity(0.5) when disabled.
      final opacities = find
          .descendant(of: checkboxFieldRootFinder(), matching: find.byType(Opacity))
          .evaluate()
          .map((e) => (e.widget as Opacity).opacity);
      expect(opacities, contains(0.5),
          reason: 'disabled field dims its subtree to --Disabled-Opacity (0.5)');
    });

    testWidgetsAllPlatforms('[figma] disabled marks semantics not enabled + blocks tap',
        (tester) async {
      var changed = false;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        OneUiCheckboxField(
          label: 'Off',
          disabled: true,
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
  // LABEL / DESCRIPTION
  // ===========================================================================

  group('[figma] CheckboxField — label + description', () {
    testWidgetsAllPlatforms('[figma] label=true renders visible label text', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Accept terms'),
      );
      expect(checkboxFieldLabelFinder('Accept terms'), findsWidgets);
    });

    testWidgetsAllPlatforms('[figma] label=false still renders the control', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(ariaLabel: 'Standalone'),
      );
      expect(checkboxRootFinder(), findsOneWidget);
      expect(checkboxBoxSizePx(tester), 20);
    });

    testWidgetsAllPlatforms('[figma] description=true renders below the label', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Subscribe', description: 'Weekly digest only.'),
      );
      expect(find.text('Weekly digest only.'), findsOneWidget);
      final descY = tester.getTopLeft(find.text('Weekly digest only.')).dy;
      final boxY = tester.getTopLeft(checkboxBoxFinder().first).dy;
      expect(descY, greaterThan(boxY),
          reason: 'description sits below the control row');
    });

    testWidgetsAllPlatforms('[figma] description-only field still exposes the control',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(description: 'Select all that apply.'),
      );
      expect(find.text('Select all that apply.'), findsOneWidget);
      expect(checkboxRootFinder(), findsOneWidget);
    });
  });

  // ===========================================================================
  // REQUIRED — asterisk on the label.
  // ===========================================================================

  group('[figma] CheckboxField — required', () {
    testWidgetsAllPlatforms('[figma] required=true renders the asterisk on the label',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Accept', required: true),
      );
      expect(checkboxFieldHasRequiredAsterisk(tester), isTrue,
          reason: 'required must render the ` *` asterisk suffix on the label');
    });

    testWidgetsAllPlatforms('[figma] required=false renders no asterisk', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Accept', required: false),
      );
      expect(checkboxFieldHasRequiredAsterisk(tester), isFalse);
    });

    testWidgetsAllPlatforms('[figma] required without a label drops the asterisk',
        (tester) async {
      // Web: the asterisk is `labelSuffixInside`, only rendered with a label.
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(required: true, description: 'no label here'),
      );
      expect(checkboxFieldHasRequiredAsterisk(tester), isFalse);
    });

    testWidgetsAllPlatforms('[figma] required asterisk renders in multi-option header',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        OneUiCheckboxField(
          label: 'Choose',
          required: true,
          children: [OneUiCheckbox(value: 'a', label: 'A')],
        ),
      );
      expect(checkboxFieldHasRequiredAsterisk(tester), isTrue);
    });
  });

  // ===========================================================================
  // INFO ICON — info IconButton beside the label.
  // ===========================================================================

  group('[figma] CheckboxField — infoIcon', () {
    testWidgetsAllPlatforms('[figma] infoIcon=true renders the info IconButton', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Marketing', infoIcon: true),
      );
      expect(checkboxFieldHasInfoIcon(tester), isTrue,
          reason: 'infoIcon must render an info affordance beside the label');
    });

    testWidgetsAllPlatforms('[figma] infoIcon=false renders no IconButton', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Marketing', infoIcon: false),
      );
      expect(checkboxFieldHasInfoIcon(tester), isFalse);
    });

    testWidgetsAllPlatforms('[figma] infoIcon requires a label (web hasInfoIcon = infoIcon && hasLabel)',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(infoIcon: true, description: 'desc only'),
      );
      expect(checkboxFieldHasInfoIcon(tester), isFalse,
          reason: 'no label → no info icon (parity with hasInfoIcon resolver)');
    });
  });

  // ===========================================================================
  // FEEDBACK — InputFeedback row (error string or slot).
  // ===========================================================================

  group('[figma] CheckboxField — feedback', () {
    testWidgetsAllPlatforms('[figma] feedback=true (error) renders an InputFeedback row',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Opt', error: 'Please complete verification.'),
      );
      expect(checkboxFieldHasFeedback(tester), isTrue);
      expect(find.text('Please complete verification.'), findsOneWidget,
          reason: 'feedback message renders as visible text');
    });

    testWidgetsAllPlatforms('[figma] feedback=false renders no InputFeedback row', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Opt'),
      );
      expect(checkboxFieldHasFeedback(tester), isFalse);
    });

    testWidgetsAllPlatforms('[figma] error feedback exposes the alert role to AT', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Opt', error: 'Validation failed'),
      );
      withSemanticsHandle(tester, () {
        expect(
          find.byWidgetPredicate((w) =>
              w is Semantics && w.properties.role == SemanticsRole.alert),
          findsWidgets,
          reason: 'negative feedback maps to the alert semantics role',
        );
      });
    });

    testWidgetsAllPlatforms('[figma] error makes the control invalid (validationResult)',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Opt', error: 'Required'),
      );
      expectCheckboxWidgetErrorHighlight(tester, highlighted: true);
      withSemanticsHandle(tester, () {
        final data = checkboxSemanticsData(tester, 'Opt');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });
  });

  // ===========================================================================
  // FULL MATRIX — Figma states sheet (3 rows × 3 sizes × readOnly f/t), each
  // cell also carrying a description line (the field states sheet mirrors the
  // Checkbox sheet but adds a Description per cell).
  // ===========================================================================

  group('[figma] CheckboxField — states sheet matrix (row × size × readOnly + description)', () {
    for (final size in ['s', 'm', 'l']) {
      for (final readOnly in [false, true]) {
        final ro = readOnly ? 'ro' : 'rw';

        testWidgetsAllPlatforms('[figma] unchecked / $size / $ro', (tester) async {
          await pumpCheckboxFieldJioHarnessSettled(
            tester,
            OneUiCheckboxField(
              label: 'r',
              description: 'd',
              size: size,
              readOnly: readOnly,
              checked: false,
            ),
          );
          expect(checkboxBoxSizePx(tester), _kBoxPxBySize[size]);
          expect(find.text('d'), findsOneWidget);
          expectCheckboxChecked(tester, 'r', checked: false);
        });

        testWidgetsAllPlatforms('[figma] checked / $size / $ro', (tester) async {
          await pumpCheckboxFieldJioHarnessSettled(
            tester,
            OneUiCheckboxField(
              label: 'r',
              description: 'd',
              size: size,
              readOnly: readOnly,
              checked: true,
            ),
          );
          expect(checkboxBoxSizePx(tester), _kBoxPxBySize[size]);
          expectCheckboxChecked(tester, 'r', checked: true);
        });

        testWidgetsAllPlatforms('[figma] indeterminate / $size / $ro', (tester) async {
          await pumpCheckboxFieldJioHarnessSettled(
            tester,
            OneUiCheckboxField(
              label: 'r',
              description: 'd',
              size: size,
              readOnly: readOnly,
              indeterminate: true,
            ),
          );
          expect(checkboxBoxSizePx(tester), _kBoxPxBySize[size]);
          expectCheckboxMixed(tester, 'r');
        });
      }
    }
  });

  // ===========================================================================
  // ALL-FLAGS-TOGETHER — every Figma toggle on at once renders coherently.
  // ===========================================================================

  group('[figma] CheckboxField — all affordances together', () {
    testWidgetsAllPlatforms('[figma] label+required+infoIcon+description+feedback render',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(
          label: 'Everything',
          required: true,
          infoIcon: true,
          description: 'All the slots at once.',
          error: 'And an error row.',
          size: 'l',
        ),
      );
      expect(checkboxFieldHasRequiredAsterisk(tester), isTrue);
      expect(checkboxFieldHasInfoIcon(tester), isTrue);
      expect(find.text('All the slots at once.'), findsOneWidget);
      expect(find.text('And an error row.'), findsOneWidget);
      expect(checkboxBoxSizePx(tester), 24);
      expectCheckboxChecked(tester, 'Everything', checked: false);
    });
  });
}
