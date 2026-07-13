/// Image accessibility QA tests — resolver units + real widget SemanticsData.
///
/// Probed contract: a non-interactive image exposes the web `role="img"`
/// landmark (Flutter `Semantics(image: true)`) carrying `alt` (or `aria-label`,
/// which wins); an interactive image is a button carrying the same label; the
/// inner raster is excluded from semantics (decorative); and the broken-image
/// fallback icon is silent (empty semanticLabel). The default `loading` lazy/
/// eager strategy never reaches the AT tree (parity no-op on Flutter).
///
/// Every widget assertion reads REAL `SemanticsData` / real finders — never a
/// bare `findsOneWidget`.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_a11y.dart';

import '../../support/components/image_harness.dart';

const _src = 'https://example.com/photo.jpg';

void main() {
  setUp(clearImageNetworkCache);
  tearDown(clearImageNetworkCache);

  // ===========================================================================
  // RESOLVER — resolveOneUiImageA11y units.
  // ===========================================================================

  group('[a11y] resolveOneUiImageA11y', () {
    test('[a11y] alt becomes the accessible label', () {
      final a = resolveOneUiImageA11y(alt: 'Team photo', interactive: false, disabled: false);
      expect(a.label, 'Team photo');
      expect(a.isInteractive, isFalse);
    });

    test('[a11y] ariaLabel overrides alt', () {
      final a = resolveOneUiImageA11y(
        alt: 'alt',
        ariaLabel: 'Override',
        interactive: false,
        disabled: false,
      );
      expect(a.label, 'Override');
    });

    test('[a11y] label is trimmed', () {
      final a = resolveOneUiImageA11y(alt: '  Logo  ', interactive: false, disabled: false);
      expect(a.label, 'Logo');
    });

    test('[a11y] interactive+disabled is NOT reported interactive', () {
      final a = resolveOneUiImageA11y(alt: 'x', interactive: true, disabled: true);
      expect(a.isInteractive, isFalse);
    });

    test('[a11y] inner raster is always excluded from semantics', () {
      final a = resolveOneUiImageA11y(alt: 'x', interactive: false, disabled: false);
      expect(a.excludeInnerFromSemantics, isTrue);
    });
  });

  // ===========================================================================
  // WIDGET — real SemanticsData on the rendered node.
  // ===========================================================================

  group('[a11y] Image widget — real semantics', () {
    testWidgetsAllPlatforms('[a11y] static image exposes the img role with alt label', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'Team photo'));
      withSemanticsHandle(tester, () {
        expect(imageSemanticsRoleFinder(), findsWidgets);
        expect(find.bySemanticsLabel('Team photo'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] ariaLabel wins over alt in the AT tree', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(src: _src, alt: 'ignored', ariaLabel: 'Company logo'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Company logo'), findsOneWidget);
        expect(find.bySemanticsLabel('ignored'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[a11y] interactive image is a button carrying the label', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(src: _src, alt: 'Open gallery', interactive: true, onPress: () {}),
      );
      withSemanticsHandle(tester, () {
        final data = imageRootSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(data.label, 'Open gallery');
      });
    });

    testWidgetsAllPlatforms('[a11y] static image is NOT a button/focusable', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'x'));
      withSemanticsHandle(tester, () {
        final data = imageRootSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse);
        expect(data.hasFlag(SemanticsFlag.isTextField), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] the broken-image fallback icon is silent', (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'x'));
      withSemanticsHandle(tester, () {
        // The fallback landscape icon is decorative (empty semanticLabel) — only
        // the outer img landmark with `alt` is announced.
        expect(imageFallbackIconFinder(), findsOneWidget);
        expect(find.bySemanticsLabel('x'), findsOneWidget);
      });
    });
  });
}
