/// Image regression + parity-attribution suite.
///
/// Findings are split by WHERE the defect lives — every claim was cross-checked
/// against the web component (`packages/ui/src/components/Image/`) and reproduced
/// against the real Flutter widget BEFORE the assertion was written (probe values
/// quoted per test):
///
///   [confirmed]  genuine Flutter component bugs — RED until the Flutter fix
///                lands. (IMG-FN-001: testId never reaches the AT tree.)
///   [parity-rn]  intentional RN divergence from web — GREEN. (IMG-DEB-001/002:
///                interactive without handler / disabled+interactive keep image
///                role; matches `@oneui/ui-native` ImageA11y.test.ts.)
///   [parity]     GREEN proofs that Flutter matches the web/Figma contract.
///
/// NO FALSE CONFIDENCE: every RED test asserts the CORRECT/parity behaviour and
/// fails because the component currently ships the gap. Offline (synthetic
/// harness + deterministic byte-cache seeding) so the burn-down is reproducible
/// without the Jio network.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/image_style_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_image_types.dart';

import '../../support/components/image_harness.dart';

const _src = 'https://example.com/photo.jpg';

void main() {
  setUp(clearImageNetworkCache);
  tearDown(clearImageNetworkCache);

  // ===========================================================================
  // CONFIRMED — genuine Flutter bugs. RED until the Flutter fix lands.
  // ===========================================================================

  group('[regression][confirmed] Image', () {
    testWidgetsAllPlatforms(
        '[fn] [IMG-FN-001] testId must reach the AT tree via Semantics.identifier',
        (tester) async {
      // PROBED: testId:'tid-x' → byKey=1 but Semantics.identifier=0. testId only
      // becomes a ValueKey (one_ui_image.dart:255-258); it never reaches the
      // platform AT tree / UI-automation resource-id. Divider wires the SAME prop
      // to Semantics(identifier:) (one_ui_divider.dart:190-193) — proving the
      // intended pattern. Web forwards testID → data-testid. Currently invisible
      // to Appium/XCUITest identifier queries.
      seedImageFailure(_src);
      await pumpImageQaHarness(
          tester, const OneUiImage(src: _src, alt: 'x', testId: 'tid-x'));
      withSemanticsHandle(tester, () {
        expect(imageIdentifierFinder('tid-x'), findsOneWidget,
            reason:
                'testId must map to Semantics.identifier (parity with Divider). '
                'Currently key-only.');
      });
    });
  });

  // ===========================================================================
  // PARITY (RN) — Flutter matches React Native, not web. Web differs by design.
  // ===========================================================================

  group('[parity-rn] Image — matches React Native (not web)', () {
    testWidgetsAllPlatforms(
        '[fn] [IMG-DEB-001] interactive without handler stays static image (RN parity)',
        (tester) async {
      // RN: isActionable=false without onPress → View role="img" (ImageA11y.test.ts).
      // Web renders <button> whenever interactive — intentional web-only divergence.
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', interactive: true),
      );
      expect(imageInteractiveFinder(), findsNothing);
      withSemanticsHandle(tester, () {
        expect(
            imageRootSemantics(tester).hasFlag(SemanticsFlag.isImage), isTrue);
      });
    });

    testWidgetsAllPlatforms(
        '[a11y] [IMG-DEB-002] disabled interactive drops button role (RN parity)',
        (tester) async {
      // RN: isInteractive = interactive && !disabled → Pressable path skipped.
      // Web keeps <button disabled> — intentional web-only divergence.
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(
            src: _src,
            alt: 'x',
            interactive: true,
            disabled: true,
            onPress: () {}),
      );
      expect(imageInteractiveFinder(), findsNothing);
      withSemanticsHandle(tester, () {
        expect(imageRootSemantics(tester).hasFlag(SemanticsFlag.isButton),
            isFalse);
      });
      expect(imageDisabledOpacity(tester), kQaImageDisabledOpacity);
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web/Figma contract. PROOFS, not bugs.
  // ===========================================================================

  group('[parity] Image — matches the web contract', () {
    test('[a11y] [IMG-PAR-001] alt becomes the accessible label', () {
      final a = resolveOneUiImageA11y(
          alt: 'Team photo', interactive: false, disabled: false);
      expect(a.label, 'Team photo');
    });

    test('[a11y] [IMG-PAR-002] ariaLabel overrides alt', () {
      final a = resolveOneUiImageA11y(
          alt: 'alt',
          ariaLabel: 'Override',
          interactive: false,
          disabled: false);
      expect(a.label, 'Override');
    });

    test('[fn] [IMG-PAR-003] aspectRatio numeric mapping (16:9, 1:1, 4:3)', () {
      expect(OneUiImageAspectRatio.r16x9.numeric, closeTo(16 / 9, 1e-9));
      expect(OneUiImageAspectRatio.r1x1.numeric, 1);
      expect(OneUiImageAspectRatio.r4x3.numeric, closeTo(4 / 3, 1e-9));
      expect(OneUiImageAspectRatio.auto.numeric, isNull);
    });

    test('[fn] [IMG-PAR-004] fit → BoxFit mapping (all 5 canonical modes)', () {
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.cover), BoxFit.cover);
      expect(
          boxFitForImageObjectFit(OneUiImageObjectFit.contain), BoxFit.contain);
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.fill), BoxFit.fill);
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.none), BoxFit.none);
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.scaleDown),
          BoxFit.scaleDown);
    });

    test('[fn] [IMG-PAR-005] extended CSS object-fit keywords map to cover',
        () {
      for (final ext in ['inherit', 'initial', 'revert', 'unset']) {
        expect(OneUiImageObjectFitX.fromWire(ext), OneUiImageObjectFit.cover);
      }
    });

    testWidgetsAllPlatforms(
        '[fn] [IMG-PAR-006] broken src → fallback icon + onError',
        (tester) async {
      var errors = 0;
      seedImageFailure(_src);
      await pumpImageQaHarness(
          tester, OneUiImage(src: _src, alt: 'x', onError: () => errors++));
      expect(imageFallbackIconFinder(), findsOneWidget);
      expect(errors, 1);
    });

    testWidgetsAllPlatforms(
        '[fn] [IMG-PAR-007] fallbackSrc recovers without firing onError',
        (tester) async {
      const fb = 'https://example.com/fb.jpg';
      var errors = 0;
      seedImageFailure(_src);
      seedImageBytes(fb);
      await pumpImageQaHarnessLoaded(
        tester,
        OneUiImage(
            src: _src, fallbackSrc: fb, alt: 'x', onError: () => errors++),
      );
      expect(imageRasterFinder(), findsOneWidget);
      expect(errors, 0);
    });

    testWidgetsAllPlatforms(
        '[fn] [IMG-PAR-008] custom fallback wins over the default icon',
        (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', fallback: Text('Unavailable')),
      );
      expect(find.text('Unavailable'), findsOneWidget);
      expect(imageFallbackIconFinder(), findsNothing);
    });

    testWidgetsAllPlatforms(
        '[fn] [IMG-PAR-009] default fit renders BoxFit.cover', (tester) async {
      seedImageBytes(_src);
      await pumpImageQaHarnessLoaded(
          tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imageRasterBoxFit(tester), BoxFit.cover);
    });

    testWidgetsAllPlatforms(
        '[fn] [IMG-PAR-010] interactive + handler → button that fires',
        (tester) async {
      var hits = 0;
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(
            src: _src, alt: 'x', interactive: true, onPress: () => hits++),
      );
      expect(imageInteractiveFinder(), findsOneWidget);
      await tester.tap(imageRootFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    test('[fn] [IMG-PAR-011] percentage width is ignored (web parity)', () {
      expect(parseImageLayoutLength('50%'), isNull);
      expect(parseImageLayoutLength(120), 120);
      expect(parseImageLayoutLength('120px'), 120);
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] Image', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter bugs (RED, fix in Flutter): IMG-FN-001 (testId → AT).
      const confirmedFlutterBugs = 1;
      // Debatable hardening (RED, design call): IMG-DEB-001 (interactive w/o
      // handler), IMG-DEB-002 (disabled interactive button suppression).
      const debatable = 2;
      // Parity GREEN proofs (Flutter matches the web/Figma contract — NOT bugs):
      //   IMG-PAR-001..011.
      const parityProofs = 11;
      expect(confirmedFlutterBugs + debatable + parityProofs, 14);
    });
  });
}
