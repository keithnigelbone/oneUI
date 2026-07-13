/// CircularProgressIndicator Figma-parity QA suite — `[figma]`.
///
/// Exercises EVERY value of the Figma CircularProgressIndicator API against the
/// real widget, asserting actual rendered behaviour (diameter via
/// `tester.getSize`, variant via the live painter flag, sweep via the painter,
/// centre content) plus the pure resolution contract. Runs offline on the
/// synthetic measurement harness; per-role FILL COLOURS (live brand palette) are
/// covered by the Jio goldens.
///
/// Figma API surface (from the design):
///   size        2xs | xs | s | m | l | xl | 2xl | 3xl | 4xl | 5xl
///   variant     determinate | indeterminate
///   appearance  auto | neutral | primary | secondary | sparkle | negative |
///               positive | informative | warning
///   content     none | icon | text
///   (code only) min | max | value
///
/// Verified facts (probed before writing): diameter 2XS=8 … 5XL=64px ;
/// determinate sweep = value/(max-min) ; %-text only at L+ ; auto→primary.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator_types.dart';

import '../../support/components/circular_progress_indicator_harness.dart';

const _kFigmaSizes = <String>[
  '2xs',
  'xs',
  's',
  'm',
  'l',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl'
];
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

void main() {
  // ===========================================================================
  // SIZE — each Figma size maps to a real diameter (spacing scale).
  // ===========================================================================

  group('[figma] CircularProgressIndicator — size', () {
    for (final canonical in kQaCpiDiameterPx.keys) {
      testWidgetsAllPlatforms(
          '[figma] size=$canonical → ${kQaCpiDiameterPx[canonical]}px diameter',
          (tester) async {
        await pumpCpiQaHarness(
          tester,
          OneUiCircularProgressIndicator(
              value: 50, size: canonical, semanticsLabel: canonical),
        );
        expect(cpiDiameterPx(tester), kQaCpiDiameterPx[canonical],
            reason:
                'Figma size=$canonical → ${kQaCpiDiameterPx[canonical]}px (real getSize)');
      });
    }

    test(
        '[figma] lowercase Figma size aliases resolve to canonical t-shirt sizes',
        () {
      for (final figma in _kFigmaSizes) {
        final canonical = resolveCpiSize(figma);
        expect(kCpiSizeAliases[figma], canonical,
            reason: 'Figma "$figma" must alias to canonical "$canonical"');
      }
    });

    testWidgetsAllPlatforms('[figma] unset size defaults to M (20px)',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 50, semanticsLabel: 'D'),
      );
      expect(cpiDiameterPx(tester), kQaCpiDiameterPx['M']);
    });
  });

  // ===========================================================================
  // VARIANT — determinate | indeterminate (real painter flag).
  // ===========================================================================

  group('[figma] CircularProgressIndicator — variant', () {
    testWidgetsAllPlatforms('[figma] determinate paints a finite arc',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
            value: 60, variant: 'determinate', semanticsLabel: 'D'),
      );
      expect(cpiPainter(tester).isIndeterminate, isFalse);
    });

    testWidgetsAllPlatforms('[figma] indeterminate paints a busy spinner',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
            variant: 'indeterminate', semanticsLabel: 'I'),
        settle: false,
      );
      expect(cpiPainter(tester).isIndeterminate, isTrue);
    });

    test('[figma] resolver: variant + value contract', () {
      expect(
          resolveOneUiCircularProgressIndicatorState(value: 10).resolvedVariant,
          'determinate');
      expect(
          resolveOneUiCircularProgressIndicatorState(variant: 'indeterminate')
              .resolvedVariant,
          'indeterminate');
      // determinate without a value coerces to indeterminate.
      expect(
          resolveOneUiCircularProgressIndicatorState(variant: 'determinate')
              .isIndeterminate,
          isTrue);
    });
  });

  // ===========================================================================
  // APPEARANCE — nine roles render; auto resolves to primary.
  // ===========================================================================

  group('[figma] CircularProgressIndicator — appearance', () {
    for (final app in _kFigmaAppearances) {
      testWidgetsAllPlatforms(
          '[figma] appearance=$app renders with a painted indicator',
          (tester) async {
        await pumpCpiQaHarness(
          tester,
          OneUiCircularProgressIndicator(
              value: 50, appearance: app, semanticsLabel: app),
        );
        expect(cpiPainter(tester).indicatorColor, isNotNull);
        expect(
          resolveOneUiCircularProgressIndicatorState(value: 50, appearance: app)
              .resolvedAppearance,
          app,
        );
      });
    }

    test('[figma] appearance=auto resolves to primary', () {
      expect(
        resolveOneUiCircularProgressIndicatorState(
                value: 10, appearance: 'auto')
            .resolvedAppearance,
        'primary',
      );
      expect(
        resolveOneUiCircularProgressIndicatorState(value: 10)
            .resolvedAppearance,
        'primary',
      );
    });
  });

  // ===========================================================================
  // CONTENT — none | icon | text. %-text at every size (BUG-CPI-2 fix).
  // ===========================================================================

  group('[figma] CircularProgressIndicator — content', () {
    testWidgetsAllPlatforms('[figma] content=text renders % at M and above',
        (tester) async {
      for (final size in ['M', 'L', 'XL', '2XL']) {
        await pumpCpiQaHarness(
          tester,
          OneUiCircularProgressIndicator(
              value: 33, size: size, content: 'text', semanticsLabel: size),
        );
        expect(find.text('33'), findsOneWidget, reason: 'size $size shows %');
      }
    });

    testWidgetsAllPlatforms('[figma] content=text renders % at S and 2XS',
        (tester) async {
      for (final size in ['2XS', 'XS', 'S']) {
        await pumpCpiQaHarness(
          tester,
          OneUiCircularProgressIndicator(
              value: 33, size: size, content: 'text', semanticsLabel: size),
        );
        expect(find.text('33'), findsOneWidget, reason: 'size $size shows %');
      }
    });

    testWidgetsAllPlatforms('[figma] content=icon renders the centre slot',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 10,
          size: '3XL',
          content: 'icon',
          semanticsLabel: 'icon',
          child: Text('✓', key: Key('figma-icon')),
        ),
      );
      expect(find.byKey(const Key('figma-icon')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] content=none renders neither % nor child',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 33,
          size: 'L',
          semanticsLabel: 'none',
          child: Text('✓', key: Key('figma-none')),
        ),
      );
      expect(find.text('33'), findsNothing);
      expect(find.byKey(const Key('figma-none')), findsNothing);
    });
  });

  // ===========================================================================
  // MIN / MAX / VALUE (code only) — percentage + sweep contract.
  // ===========================================================================

  group('[figma] CircularProgressIndicator — min/max/value', () {
    test('[figma] percentage normalises and clamps', () {
      expect(
          resolveOneUiCircularProgressIndicatorState(value: 25).percentage, 25);
      expect(resolveOneUiCircularProgressIndicatorState(value: 150).percentage,
          100);
      expect(
          resolveOneUiCircularProgressIndicatorState(value: -5).percentage, 0);
      expect(
          resolveOneUiCircularProgressIndicatorState(value: 5, min: 0, max: 10)
              .percentage,
          50);
    });

    testWidgetsAllPlatforms(
        '[figma] sweep fraction tracks the normalised value', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
            value: 3, min: 0, max: 4, semanticsLabel: 'V'),
      );
      expect(cpiPainter(tester).determinateSweepFraction, closeTo(0.75, 0.001));
    });
  });

  // ===========================================================================
  // FULL MATRIX — size × variant renders every cell with right diameter/flag.
  // ===========================================================================

  group('[figma] CircularProgressIndicator — size × variant matrix', () {
    for (final size in ['S', 'M', 'L', '3XL']) {
      for (final indeterminate in [false, true]) {
        testWidgetsAllPlatforms(
            '[figma] $size / ${indeterminate ? 'indeterminate' : 'determinate'}',
            (tester) async {
          await pumpCpiQaHarness(
            tester,
            OneUiCircularProgressIndicator(
              variant: indeterminate ? 'indeterminate' : 'determinate',
              value: indeterminate ? null : 50,
              size: size,
              semanticsLabel: 'cell',
            ),
            settle: !indeterminate,
          );
          expect(cpiDiameterPx(tester), kQaCpiDiameterPx[size]);
          expect(cpiPainter(tester).isIndeterminate, indeterminate);
        });
      }
    }
  });
}
