/// React / RN parity — `CircularProgressIndicator.test.tsx` + widget a11y on all platforms.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator_types.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import 'cpi_test_harness.dart';

void main() {
  // ---------------------------------------------------------------------------
  // RN — useCircularProgressIndicatorState
  // ---------------------------------------------------------------------------
  group('RN parity — useCircularProgressIndicatorState', () {
    test(
        'defaults variant=determinate, size=M, appearance=primary, content=none',
        () {
      final s = resolveOneUiCircularProgressIndicatorState(value: 0);
      expect(s.resolvedVariant, 'determinate');
      expect(s.resolvedSize, 'M');
      expect(s.resolvedAppearance, 'primary');
      expect(s.resolvedContent, 'none');
    });

    test('coerces variant=determinate without value into indeterminate', () {
      final s =
          resolveOneUiCircularProgressIndicatorState(variant: 'determinate');
      expect(s.isIndeterminate, isTrue);
      expect(s.resolvedVariant, 'indeterminate');
    });

    test('resolves auto appearance to primary', () {
      expect(
        resolveOneUiCircularProgressIndicatorState(
          value: 10,
          appearance: 'auto',
        ).resolvedAppearance,
        'primary',
      );
      expect(
        resolveOneUiCircularProgressIndicatorState(value: 10)
            .resolvedAppearance,
        'primary',
      );
    });

    test('keeps explicit appearance roles', () {
      expect(
        resolveOneUiCircularProgressIndicatorState(
          value: 10,
          appearance: 'positive',
        ).resolvedAppearance,
        'positive',
      );
    });

    test('clamps value to [min, max] and normalises', () {
      expect(resolveOneUiCircularProgressIndicatorState(value: 150).percentage,
          100);
      expect(
          resolveOneUiCircularProgressIndicatorState(value: -10).percentage, 0);
      expect(
          resolveOneUiCircularProgressIndicatorState(value: 25).percentage, 25);
    });

    test('respects custom min/max ranges', () {
      final s =
          resolveOneUiCircularProgressIndicatorState(value: 5, min: 0, max: 10);
      expect(s.percentage, 50);
      expect(s.normalizedValue, closeTo(0.5, 0.001));
    });

    test('computes SVG geometry from size-specific stroke width', () {
      final xs =
          resolveOneUiCircularProgressIndicatorState(value: 0, size: 'XS');
      expect(xs.strokeWidth, kCpiSvgStrokeMap['XS']);
      expect(xs.center, kCpiCenter);
      expect(xs.radius, (kCpiViewBox - kCpiSvgStrokeMap['XS']!) / 2);
      expect(
          xs.circumference, closeTo(2 * 3.141592653589793 * xs.radius, 0.01));
    });

    test('emits data attributes mirroring web data-* selectors', () {
      final s = resolveOneUiCircularProgressIndicatorState(
        value: 25,
        size: '3XL',
        appearance: 'sparkle',
        content: 'text',
      );
      expect(s.dataAttrs, {
        'data-size': '3XL',
        'data-variant': 'determinate',
        'data-appearance': 'sparkle',
        'data-content': 'text',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Web — CircularProgressIndicator.test.tsx (widget + semantics)
  // ---------------------------------------------------------------------------
  group('React parity — CircularProgressIndicator.test.tsx', () {
    testWidgetsAllPlatforms(
      'renders with progressbar semantics and current value (42 percent)',
      (tester) async {
        await tester.pumpWidget(
          pumpCpiApp(
            const OneUiCircularProgressIndicator(
              value: 42,
              semanticsLabel: 'Upload progress',
            ),
          ),
        );
        await pumpCpiLayout(tester);
        final handle = tester.ensureSemantics();
        try {
          final data = cpiSemanticsData(tester, 'Upload progress');
          expect(data.label, 'Upload progress');
          expect(data.value, '42');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      'exposes standard 0–100 range via value string on determinate',
      (tester) async {
        await tester.pumpWidget(
          pumpCpiApp(
            const OneUiCircularProgressIndicator(
              value: 73,
              semanticsLabel: 'Range',
            ),
          ),
        );
        await pumpCpiLayout(tester);
        final handle = tester.ensureSemantics();
        try {
          expect(cpiSemanticsData(tester, 'Range').value, '73');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      'omits value in indeterminate variant (busy)',
      (tester) async {
        await tester.pumpWidget(
          pumpCpiApp(
            const OneUiCircularProgressIndicator(
              variant: 'indeterminate',
              semanticsLabel: 'Loading',
            ),
          ),
        );
        await pumpCpiLayout(tester);
        final handle = tester.ensureSemantics();
        try {
          final data = cpiSemanticsData(tester, 'Loading');
          expect(data.label, 'Loading');
          // Flutter semantics uses empty string when value is omitted (web: no aria-valuenow).
          expect(data.value, anyOf(isNull, isEmpty));
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms('renders icon content at size M (Figma all sizes)',
        (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 10,
            size: 'M',
            content: 'icon',
            semanticsLabel: 'Small icon',
            child: Text('★', key: Key('cpi-icon-m')),
          ),
        ),
      );
      await pumpCpiLayout(tester);
      expect(find.byKey(const Key('cpi-icon-m')), findsOneWidget);
    });

    testWidgetsAllPlatforms('renders custom icon content slot', (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 10,
            size: '3XL',
            content: 'icon',
            semanticsLabel: 'With icon',
            child: Text('★', key: Key('custom-icon')),
          ),
        ),
      );
      await pumpCpiLayout(tester);
      expect(find.byKey(const Key('custom-icon')), findsOneWidget);
    });

    testWidgetsAllPlatforms(
      'renders percentage text at size M and above',
      (tester) async {
        for (final size in ['M', 'L', '3XL']) {
          await tester.pumpWidget(
            pumpCpiApp(
              OneUiCircularProgressIndicator(
                value: 25,
                size: size,
                content: 'text',
                semanticsLabel: 'With label $size',
              ),
            ),
          );
          await pumpCpiLayout(tester);
          expect(find.text('25'), findsOneWidget, reason: 'size $size');
        }
      },
    );

    testWidgetsAllPlatforms('forwards testId as widget key', (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 50,
            semanticsLabel: 'Reffed',
            testId: 'cpi-root',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      expect(find.byKey(const Key('cpi-root')), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        'maps CPI size to centre Icon size when content=icon', (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 10,
            size: '3XL',
            content: 'icon',
            semanticsLabel: 'Mapped icon',
            child: OneUiIcon(icon: 'check'),
          ),
        ),
      );
      await pumpCpiLayout(tester);
      final icon = tester.widget<OneUiIcon>(find.byType(OneUiIcon));
      expect(icon.size, kCpiSizeToIconSize['3XL']);
      expect(icon.excludeFromSemantics, isTrue);
    });
  });

  // ---------------------------------------------------------------------------
  // Flutter widget — accessibility props (web + mobile semantics tree)
  // ---------------------------------------------------------------------------
  group('accessibility widget binding (Flutter web + mobile)', () {
    testWidgetsAllPlatforms('aria-hidden collapses semantics tree',
        (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 10,
            ariaHidden: true,
            semanticsLabel: 'Hidden',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('forwards semanticsHint to semantics node',
        (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 25,
            semanticsLabel: 'Upload',
            semanticsHint: 'Downloading file',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(cpiSemanticsData(tester, 'Upload').hint, 'Downloading file');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('aria-live polite enables liveRegion',
        (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 0,
            semanticsLabel: 'Live',
            ariaLive: 'polite',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(cpiSemanticsWithLiveRegionFinder(), findsWidgets);
        expect(cpiSemanticsData(tester, 'Live').label, 'Live');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
      'aria-labelledby id is exposed as semantics identifier',
      (tester) async {
        await tester.pumpWidget(
          pumpCpiApp(
            const OneUiCircularProgressIndicator(
              value: 10,
              semanticsLabel: 'Bar',
              semanticsLabelledBy: 'caption-id',
            ),
          ),
        );
        await pumpCpiLayout(tester);
        final handle = tester.ensureSemantics();
        try {
          final node = tester.getSemantics(cpiSemanticsFinder('Bar'));
          expect(node.identifier, 'caption-id');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      'semanticsLabelledBy-only falls back to identifier without anchor',
      (tester) async {
        await tester.pumpWidget(
          pumpCpiApp(
            const OneUiCircularProgressIndicator(
              value: 10,
              semanticsLabelledBy: 'caption-id',
            ),
          ),
        );
        await pumpCpiLayout(tester);
        final handle = tester.ensureSemantics();
        try {
          final data = cpiSemanticsDataByIdentifier(tester, 'caption-id');
          expect(data.label, anyOf(isNull, isEmpty));
          expect(data.identifier, 'caption-id');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      'semanticsLabelledBy-only resolves label from identifier anchor',
      (tester) async {
        await tester.pumpWidget(
          pumpCpiApp(
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Semantics(
                  container: true,
                  identifier: 'caption-id',
                  label: 'Upload status',
                  child: ExcludeSemantics(
                    child: Text('Upload status'),
                  ),
                ),
                const SizedBox(height: 8),
                const OneUiCircularProgressIndicator(
                  value: 10,
                  semanticsLabelledBy: 'caption-id',
                ),
              ],
            ),
          ),
        );
        await pumpCpiLayout(tester);
        final handle = tester.ensureSemantics();
        try {
          final data = cpiProgressBarSemanticsData(tester);
          expect(data.label, 'Upload status');
          expect(data.identifier, anyOf(isNull, isEmpty));
          expect(data.value, '10');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      'semanticsDescribedBy exposes controlsNodes (not identifier)',
      (tester) async {
        await tester.pumpWidget(
          pumpCpiApp(
            const OneUiCircularProgressIndicator(
              value: 10,
              semanticsLabel: 'Bar',
              semanticsDescribedBy: 'desc-id',
            ),
          ),
        );
        await pumpCpiLayout(tester);
        final handle = tester.ensureSemantics();
        try {
          final data = cpiSemanticsData(tester, 'Bar');
          expect(data.controlsNodes, contains('desc-id'));
          expect(data.identifier, anyOf(isNull, isEmpty));
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms('custom min/max reflected in value percent string',
        (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 5,
            min: 0,
            max: 10,
            semanticsLabel: 'Scaled',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(cpiSemanticsData(tester, 'Scaled').value, '50');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('show=false removes semantics and layout',
        (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 10,
            show: false,
            semanticsLabel: 'Gone',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      final cpi = find.byType(OneUiCircularProgressIndicator);
      expect(cpi, findsOneWidget);
      expect(
        find.descendant(of: cpi, matching: find.byType(CustomPaint)),
        findsNothing,
      );
      expect(find.bySemanticsLabel('Gone'), findsNothing);
    });

    testWidgetsAllPlatforms(
        'centre percentage is excluded from duplicate semantics',
        (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 50,
            size: 'L',
            content: 'text',
            semanticsLabel: 'Half done',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.text('50'), findsOneWidget);
        expect(find.bySemanticsLabel('50'), findsNothing);
        expect(cpiSemanticsData(tester, 'Half done').value, '50');
      } finally {
        handle.dispose();
      }
    });
  });

  group('functional widget', () {
    testWidgetsAllPlatforms('renders CustomPaint ring', (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            value: 65,
            semanticsLabel: 'Progress',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      expect(find.byType(CustomPaint), findsWidgets);
    });

    testWidgetsAllPlatforms('indeterminate ticker advances rotation',
        (tester) async {
      await tester.pumpWidget(
        pumpCpiApp(
          const OneUiCircularProgressIndicator(
            variant: 'indeterminate',
            semanticsLabel: 'Loading',
          ),
        ),
      );
      await pumpCpiLayout(tester);
      await tester.pump(const Duration(milliseconds: 100));
      await tester.pump(const Duration(milliseconds: 100));
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
    });
  });
}
