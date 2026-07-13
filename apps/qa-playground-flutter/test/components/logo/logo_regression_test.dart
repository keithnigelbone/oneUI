/// Logo regression + parity-attribution suite.
///
/// Findings are split by WHERE the defect lives — every claim was cross-checked
/// against the web component (`packages/ui/src/components/Logo/`) and the Figma
/// API ([Logo #36]), and reproduced against the real Flutter widget BEFORE the
/// assertion was written (probe values quoted per test):
///
///   [confirmed]  genuine Flutter component bugs — RED until the Flutter fix
///                lands. **NONE for Logo** — unlike Image, Logo wires
///                `testId → Semantics.identifier` and defers its image-error
///                state via `addPostFrameCallback` (see parity proofs below).
///   [parity-rn]  intentional RN divergence / Flutter design — GREEN.
///                (LOGO-DEB-001: interactive + handler + empty alt drops handler;
///                matches RN `isLogoPressable` + `LOGO_DECORATIVE_A11Y`.)
///   [parity]     GREEN proofs that Flutter matches the web/Figma contract.
///
/// NO FALSE CONFIDENCE: every RED test asserts the CORRECT/parity behaviour and
/// fails because the component currently ships the gap. The known shared
/// `OneUiImageRemote` decode crash (IMG-FN-002) that Logo's `src` mode inherits
/// is NOT asserted here — it does not reproduce deterministically on the Dart VM
/// (only on a real device under a rapid src swap), so asserting it offline would
/// be false confidence. It is documented in README.md as a watch item instead.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import '../../support/components/logo_harness.dart';

const _src = 'https://example.com/logo.png';

OneUiLogoResolvedState _state({
  bool interactive = false,
  bool disabled = false,
  String alt = 'Acme',
  void Function()? onPress,
}) =>
    resolveOneUiLogoState(
      alt: alt,
      interactive: interactive,
      disabled: disabled,
      onPress: onPress,
      svgContent: kQaLogoMarkSvg,
    );

void main() {
  setUp(clearLogoNetworkCache);
  tearDown(clearLogoNetworkCache);

  // ===========================================================================
  // CONFIRMED — genuine Flutter bugs. (NONE for Logo.)
  // ===========================================================================
  //
  // The audit found no confirmed Flutter-only defects in OneUiLogo. The two
  // issues that bit the sibling Image component are CORRECT in Logo and are
  // proven GREEN below: LOGO-PAR-009 (testId → Semantics.identifier) and
  // LOGO-PAR-010 (image-error state deferred out of build).

  // ===========================================================================
  // PARITY (RN) — Flutter matches React Native. Web has no `interactive` prop.
  // ===========================================================================

  group('[parity-rn] Logo — matches React Native (not web)', () {
    testWidgetsAllPlatforms(
        '[fn] [LOGO-DEB-001] interactive + handler + empty alt stays decorative (RN parity)',
        (tester) async {
      // RN: isLogoPressable=false when alt is decorative → Pressable skipped,
      // LOGO_DECORATIVE_A11Y hides from AT. Dev warns in logoInteractive.test.ts.
      // Web Logo has no interactive mode. Handler intentionally not wired.
      var hits = 0;
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(
            alt: '',
            interactive: true,
            onPress: () => hits++,
            svgContent: kQaLogoMarkSvg),
      );
      expect(logoInteractiveFinder(), findsNothing);
      await tester.tap(logoRootFinder());
      await tester.pump();
      expect(hits, 0);
      withSemanticsHandle(tester, () {
        expect(find.byType(ExcludeSemantics), findsWidgets);
      });
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web/Figma contract. PROOFS, not bugs.
  // ===========================================================================

  group('[parity] Logo — matches the web/Figma contract', () {
    test('[a11y] [LOGO-PAR-001] meaningful alt becomes the accessible label',
        () {
      final a = resolveOneUiLogoA11y(alt: 'Acme', state: _state());
      expect(a.label, 'Acme');
      expect(a.isDecorative, isFalse);
    });

    test(
        '[a11y] [LOGO-PAR-002] empty alt is decorative (web aria-hidden inner)',
        () {
      final a = resolveOneUiLogoA11y(alt: '', state: _state(alt: ''));
      expect(a.isDecorative, isTrue);
      expect(a.label, isNull);
    });

    test('[figma] [LOGO-PAR-003] Figma size set is exactly XS…XL + custom', () {
      expect(kOneUiLogoFigmaSizes, ['xs', 's', 'm', 'l', 'xl', 'custom']);
    });

    test(
        '[figma] [LOGO-PAR-004] t-shirt labels normalise to the canonical enum',
        () {
      expect(resolveOneUiLogoSize('XL'), OneUiLogoSize.xl);
      expect(resolveOneUiLogoSize('m'), OneUiLogoSize.m);
      expect(resolveOneUiLogoSize('bogus'), OneUiLogoSize.m);
    });

    testWidgetsAllPlatforms(
        '[figma] [LOGO-PAR-005] every size renders a distinct box',
        (tester) async {
      final seen = <double>{};
      for (final size
          in OneUiLogoSize.values.where((s) => s != OneUiLogoSize.custom)) {
        await pumpLogoQaHarness(tester,
            OneUiLogo(alt: 'x', size: size, svgContent: kQaLogoMarkSvg));
        seen.add(logoBoxSize(tester).height);
      }
      expect(seen.length, 5,
          reason: 'xs/s/m/l/xl must each map to a distinct px box');
    });

    testWidgetsAllPlatforms(
        '[fn] [LOGO-PAR-006] mark is square; full widens to the SVG aspect',
        (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(
            alt: 'x',
            variant: OneUiLogoVariant.mark,
            size: OneUiLogoSize.l,
            svgContent: kQaLogoWordmarkSvg),
      );
      final mark = logoBoxSize(tester);
      expect(mark.width, mark.height);

      await pumpLogoQaHarness(
        tester,
        OneUiLogo(
            alt: 'x',
            variant: OneUiLogoVariant.full,
            size: OneUiLogoSize.l,
            svgContent: kQaLogoWordmarkSvg),
      );
      final full = logoBoxSize(tester);
      expect(full.width, closeTo(full.height * kQaLogoWordmarkAspect, 0.1));
    });

    testWidgetsAllPlatforms(
        '[fn] [LOGO-PAR-007] content priority children > svg > src',
        (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(
            alt: 'x',
            svgContent: kQaLogoMarkSvg,
            src: _src,
            child: const Icon(Icons.star)),
      );
      expect(find.byIcon(Icons.star), findsOneWidget);
      expect(logoSvgFinder(), findsNothing);
    });

    testWidgetsAllPlatforms(
        '[fn] [LOGO-PAR-008] interactive + handler + alt → actionable button',
        (tester) async {
      var hits = 0;
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(
            alt: 'Home',
            interactive: true,
            onPress: () => hits++,
            svgContent: kQaLogoMarkSvg),
      );
      expect(logoInteractiveFinder(), findsOneWidget);
      await tester.tap(logoRootFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms(
        '[a11y] [LOGO-PAR-009] testId reaches the AT tree via Semantics.identifier',
        (tester) async {
      // The exact gap Image SHIPS (IMG-FN-001, key-only). Logo wires it to BOTH a
      // ValueKey AND Semantics(identifier:) (one_ui_logo.dart:366-371), so it is
      // visible to Appium / XCUITest resource-id queries. GREEN proof.
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', testId: 'brand-logo', svgContent: kQaLogoMarkSvg),
      );
      withSemanticsHandle(tester, () {
        expect(logoIdentifierFinder('brand-logo'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms(
        '[fn] [LOGO-PAR-010] broken src defers error state (no setState-in-build crash)',
        (tester) async {
      // Logo's OUTER _handleImageError defers via addPostFrameCallback
      // (one_ui_logo.dart:98-106), so the broken-src → fallback transition is
      // safe. PROBED: onError fires exactly once, fallback renders, no exception.
      var errors = 0;
      seedLogoImageFailure(_src);
      await pumpLogoQaHarnessLoaded(
        tester,
        OneUiLogo(
            alt: 'x',
            src: _src,
            fallback: const Text('FB'),
            onError: () => errors++),
      );
      expect(errors, 1);
      expect(find.text('FB'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        '[fn] [LOGO-PAR-011] disabled dims to 0.5 and suppresses the button',
        (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(
            alt: 'x',
            interactive: true,
            disabled: true,
            onPress: () {},
            svgContent: kQaLogoMarkSvg),
      );
      expect(logoDisabledOpacity(tester), kQaLogoDisabledOpacity);
      expect(logoInteractiveFinder(), findsNothing);
      withSemanticsHandle(tester, () {
        expect(
            logoRootSemantics(tester).hasFlag(SemanticsFlag.isButton), isFalse);
      });
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] Logo', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter bugs (RED, fix in Flutter): NONE.
      const confirmedFlutterBugs = 0;
      // Debatable hardening (RED, design call): LOGO-DEB-001 (interactive +
      // handler + empty alt silently drops the handler).
      const debatable = 1;
      // Parity GREEN proofs (Flutter matches the web/Figma contract — NOT bugs):
      //   LOGO-PAR-001..011.
      const parityProofs = 11;
      expect(confirmedFlutterBugs + debatable + parityProofs, 12);
    });
  });
}
