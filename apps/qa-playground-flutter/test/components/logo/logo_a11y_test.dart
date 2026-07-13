/// Logo accessibility QA tests — resolver units + real widget SemanticsData.
///
/// Probed contract (web `Logo.tsx`: outer `role="img" aria-label={alt}`, inner
/// content `aria-hidden`/`role="presentation"`):
///   - a meaningful `alt` → Flutter `Semantics(image: true, label: alt)`;
///   - an EMPTY/whitespace `alt` is DECORATIVE → wrapped in `ExcludeSemantics`
///     (root announces no label, no image role);
///   - an interactive logo (interactive + handler + meaningful alt) is a button
///     carrying the label, NOT an image;
///   - `accessibilityHint` forwards to the semantics hint.
///
/// Every widget assertion reads REAL `SemanticsData` / `find.bySemanticsLabel` —
/// never a bare `findsOneWidget` for an a11y claim (the `SvgPicture` emits its
/// own decorative Semantics widget, so the merged semantics data is the only
/// trustworthy source).
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import '../../support/components/logo_harness.dart';

OneUiLogoResolvedState _state({
  bool interactive = false,
  bool disabled = false,
  String alt = 'Acme',
  void Function()? onPress,
}) {
  return resolveOneUiLogoState(
    alt: alt,
    interactive: interactive,
    disabled: disabled,
    onPress: onPress,
    svgContent: kQaLogoMarkSvg,
  );
}

void main() {
  setUp(clearLogoNetworkCache);
  tearDown(clearLogoNetworkCache);

  // ===========================================================================
  // RESOLVER — resolveOneUiLogoA11y units (the real resolver).
  // ===========================================================================

  group('[a11y] resolveOneUiLogoA11y', () {
    test('[a11y] meaningful alt becomes the label', () {
      final a = resolveOneUiLogoA11y(alt: 'Acme', state: _state());
      expect(a.label, 'Acme');
      expect(a.isDecorative, isFalse);
    });

    test('[a11y] label is trimmed', () {
      final a = resolveOneUiLogoA11y(alt: '  Acme  ', state: _state(alt: '  Acme  '));
      expect(a.label, 'Acme');
    });

    test('[a11y] empty alt is decorative (no label)', () {
      final a = resolveOneUiLogoA11y(alt: '', state: _state(alt: ''));
      expect(a.isDecorative, isTrue);
      expect(a.label, isNull);
    });

    test('[a11y] whitespace-only alt is decorative', () {
      final a = resolveOneUiLogoA11y(alt: '   ', state: _state(alt: '   '));
      expect(a.isDecorative, isTrue);
    });

    test('[a11y] interactive + handler + alt → pressable', () {
      final a = resolveOneUiLogoA11y(
        alt: 'Home',
        state: _state(interactive: true, onPress: () {}, alt: 'Home'),
      );
      expect(a.isPressable, isTrue);
    });

    test('[a11y] interactive + disabled → not pressable', () {
      final a = resolveOneUiLogoA11y(
        alt: 'Home',
        state: _state(interactive: true, disabled: true, onPress: () {}, alt: 'Home'),
      );
      expect(a.isPressable, isFalse);
    });

    test('[a11y] accessibilityHint forwards to the hint', () {
      final a = resolveOneUiLogoA11y(
        alt: 'Home',
        accessibilityHint: 'Returns to dashboard',
        state: _state(),
      );
      expect(a.hint, 'Returns to dashboard');
    });
  });

  // ===========================================================================
  // WIDGET — real SemanticsData on the rendered node.
  // ===========================================================================

  group('[a11y] Logo widget — real semantics', () {
    testWidgetsAllPlatforms('[a11y] meaningful alt exposes the img role + label', (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'Acme', svgContent: kQaLogoMarkSvg));
      withSemanticsHandle(tester, () {
        final data = logoRootSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isImage), isTrue);
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse);
        expect(find.bySemanticsLabel('Acme'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] decorative (empty alt) announces no label / no image role', (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: '', svgContent: kQaLogoMarkSvg));
      withSemanticsHandle(tester, () {
        final data = logoRootSemantics(tester);
        expect(data.label, isEmpty);
        expect(data.hasFlag(SemanticsFlag.isImage), isFalse,
            reason: 'decorative logo is wrapped in ExcludeSemantics');
      });
    });

    testWidgetsAllPlatforms('[a11y] interactive logo is a button carrying the label', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'Go home', interactive: true, onPress: () {}, svgContent: kQaLogoMarkSvg),
      );
      withSemanticsHandle(tester, () {
        final data = logoRootSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(data.hasFlag(SemanticsFlag.isImage), isFalse);
        expect(data.label, 'Go home');
      });
    });

    testWidgetsAllPlatforms('[a11y] static logo is NOT a button/text field', (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'Acme', svgContent: kQaLogoMarkSvg));
      withSemanticsHandle(tester, () {
        final data = logoRootSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse);
        expect(data.hasFlag(SemanticsFlag.isTextField), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] accessibilityHint reaches the AT tree on an interactive logo', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(
          alt: 'Home',
          interactive: true,
          onPress: () {},
          accessibilityHint: 'Returns to dashboard',
          svgContent: kQaLogoMarkSvg,
        ),
      );
      withSemanticsHandle(tester, () {
        expect(logoRootSemantics(tester).hint, 'Returns to dashboard');
      });
    });
  });
}
