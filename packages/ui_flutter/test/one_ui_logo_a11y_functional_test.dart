/// Logo accessibility + functional tests — parity with
/// `packages/ui-native/src/components/Logo/logoA11y.test.ts`,
/// `logoInteractive.test.ts`, `logoSize.test.ts`, and
/// `packages/ui/src/components/Logo/Logo.test.tsx`.
///
/// Widget groups run on Android, iOS, and Linux ([testWidgetsAllPlatforms]).
/// Linux exercises the same semantics / focus paths as Flutter **web**; mobile
/// targets match Flutter **iOS/Android** (RN parity).
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/logo_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import 'logo_test_harness.dart';

const _kBrokenImageUrl = 'https://invalid.example/broken.png';

const _kFullWordmarkSvg = '''
<svg viewBox="0 0 200 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="40"/>
</svg>''';

SemanticsNode _logoRootSemantics(WidgetTester tester) {
  final interactive = find.byType(OneUiFocusInteractive);
  if (interactive.evaluate().isNotEmpty) {
    return tester.getSemantics(interactive);
  }
  return tester.getSemantics(find.byType(OneUiLogo));
}

Future<void> _pumpBrokenImageLogo(
  WidgetTester tester, {
  required Widget logo,
}) async {
  await tester.pumpWidget(pumpLogoApp(logo));
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 50));
  await tester.pumpAndSettle(const Duration(seconds: 3));
}

void main() {
  // ---------------------------------------------------------------------------
  // RN — logoA11y.test.ts (pure unit)
  // ---------------------------------------------------------------------------
  group('RN parity — isLogoDecorative', () {
    test('treats empty and whitespace-only alt as decorative', () {
      expect(oneUiLogoIsDecorative(''), isTrue);
      expect(oneUiLogoIsDecorative('   '), isTrue);
      expect(oneUiLogoIsDecorative('\n\t'), isTrue);
    });

    test('treats non-empty alt as meaningful', () {
      expect(oneUiLogoIsDecorative('Jio'), isFalse);
      expect(oneUiLogoIsDecorative('  Jio  '), isFalse);
    });
  });

  group('RN parity — getLogoAccessibilityProps', () {
    test('maps alt to label with image semantics for static logo', () {
      final state = resolveOneUiLogoState(
          alt: 'Jio Brand Logo', svgContent: kLogoTestSvg);
      final a11y = resolveOneUiLogoA11y(alt: 'Jio Brand Logo', state: state);
      expect(a11y.isDecorative, isFalse);
      expect(a11y.label, 'Jio Brand Logo');
      expect(a11y.isPressable, isFalse);
      expect(a11y.hint, isNull);
    });

    test('trims meaningful alt for label', () {
      final state = resolveOneUiLogoState(
          alt: '  Jio Brand Logo  ', svgContent: kLogoTestSvg);
      final a11y =
          resolveOneUiLogoA11y(alt: '  Jio Brand Logo  ', state: state);
      expect(a11y.label, 'Jio Brand Logo');
    });

    test('uses button semantics when interactive with onPress', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio home',
        svgContent: kLogoTestSvg,
        interactive: true,
        onPress: () {},
      );
      final a11y = resolveOneUiLogoA11y(alt: 'Jio home', state: state);
      expect(a11y.isPressable, isTrue);
    });

    test('stays image semantics when interactive without handler', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        svgContent: kLogoTestSvg,
        interactive: true,
      );
      expect(
        oneUiLogoIsPressable(
          isInteractive: state.isInteractive,
          alt: 'Jio',
        ),
        isFalse,
      );
      final a11y = resolveOneUiLogoA11y(alt: 'Jio', state: state);
      expect(a11y.isPressable, isFalse);
    });

    test('hides decorative logos from accessibility tree', () {
      final state = resolveOneUiLogoState(alt: '', svgContent: kLogoTestSvg);
      final a11y = resolveOneUiLogoA11y(alt: '', state: state);
      expect(a11y.isDecorative, isTrue);
      expect(a11y.label, isNull);
      expect(a11y.isPressable, isFalse);

      final ws = resolveOneUiLogoA11y(alt: '   ', state: state);
      expect(ws.isDecorative, isTrue);
      expect(ws.label, isNull);
    });

    test('ignores accessibilityHint when alt is decorative', () {
      final state = resolveOneUiLogoState(alt: '', svgContent: kLogoTestSvg);
      final a11y = resolveOneUiLogoA11y(
        alt: '',
        accessibilityHint: 'Opens home',
        state: state,
      );
      expect(a11y.isDecorative, isTrue);
      expect(a11y.hint, isNull);
    });

    test('passes accessibilityHint when alt is meaningful', () {
      final state = resolveOneUiLogoState(alt: 'Jio', svgContent: kLogoTestSvg);
      final a11y = resolveOneUiLogoA11y(
        alt: 'Jio',
        accessibilityHint: 'Opens home',
        state: state,
      );
      expect(a11y.hint, 'Opens home');
    });
  });

  // ---------------------------------------------------------------------------
  // RN — logoInteractive.test.ts (pure unit)
  // ---------------------------------------------------------------------------
  group('RN parity — Logo interactive state', () {
    test('isInteractive when interactive and not disabled', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        svgContent: kLogoTestSvg,
        interactive: true,
        onPress: () {},
      );
      expect(state.isInteractive, isTrue);
      expect(state.isPressable, isTrue);
      expect(state.dataAttrs['data-interactive'], 'true');
    });

    test('clears interactivity when disabled', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        svgContent: kLogoTestSvg,
        interactive: true,
        disabled: true,
        onPress: () {},
      );
      expect(state.isInteractive, isFalse);
      expect(state.isDisabled, isTrue);
      expect(state.isPressable, isFalse);
    });

    test('accepts onClick as a press handler', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        svgContent: kLogoTestSvg,
        interactive: true,
        onClick: () {},
      );
      expect(
        oneUiLogoIsPressable(
          isInteractive: state.isInteractive,
          alt: 'Jio',
          onClick: () {},
        ),
        isTrue,
      );
      expect(state.isPressable, isTrue);
    });

    test('is not pressable with decorative alt even when interactive', () {
      final state = resolveOneUiLogoState(
        alt: '',
        svgContent: kLogoTestSvg,
        interactive: true,
        onPress: () {},
      );
      expect(state.isPressable, isFalse);
    });
  });

  // ---------------------------------------------------------------------------
  // RN — logoSize.test.ts + React useLogoState (pure unit)
  // ---------------------------------------------------------------------------
  group('RN/React parity — resolveOneUiLogoState content priority', () {
    test('children beats svgContent and src', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        children: const Text('child'),
        svgContent: kLogoTestSvg,
        src: 'https://example.com/logo.png',
      );
      expect(state.contentMode, OneUiLogoContentMode.children);
    });

    test('svgContent when no children', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        svgContent: kLogoTestSvg,
        src: 'https://example.com/logo.png',
      );
      expect(state.contentMode, OneUiLogoContentMode.svg);
    });

    test('image when no children or svgContent', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        src: 'https://example.com/logo.png',
      );
      expect(state.contentMode, OneUiLogoContentMode.image);
    });

    test('empty when no content source', () {
      final state = resolveOneUiLogoState(alt: 'Jio');
      expect(state.contentMode, OneUiLogoContentMode.empty);
    });

    test('defaults to mark variant and m size', () {
      final state = resolveOneUiLogoState(alt: 'Jio', svgContent: kLogoTestSvg);
      expect(state.resolvedVariant, OneUiLogoVariant.mark);
      expect(state.resolvedSize, OneUiLogoSize.m);
    });

    test('respects full variant and xl size', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        svgContent: kLogoTestSvg,
        variant: OneUiLogoVariant.full,
        size: OneUiLogoSize.xl,
      );
      expect(state.resolvedVariant, OneUiLogoVariant.full);
      expect(state.resolvedSize, OneUiLogoSize.xl);
    });
  });

  group('RN parity — resolveOneUiLogoSize aliases', () {
    test('canonicalises Figma t-shirt labels', () {
      expect(resolveOneUiLogoSize('XS'), OneUiLogoSize.xs);
      expect(resolveOneUiLogoSize('S'), OneUiLogoSize.s);
      expect(resolveOneUiLogoSize('M'), OneUiLogoSize.m);
      expect(resolveOneUiLogoSize('L'), OneUiLogoSize.l);
      expect(resolveOneUiLogoSize('XL'), OneUiLogoSize.xl);
      expect(resolveOneUiLogoSize('CUSTOM'), OneUiLogoSize.custom);
    });
  });

  // ---------------------------------------------------------------------------
  // React — Logo.test.tsx (widget functional)
  // ---------------------------------------------------------------------------
  group('React parity — Logo.test.tsx functional', () {
    testWidgetsAllPlatforms('renders children as highest-priority content',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          const OneUiLogo(
            alt: 'Jio',
            svgContent: kLogoTestSvg,
            child: Text('child-slot', key: ValueKey('logo-child')),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('logo-child')), findsOneWidget);
      expect(find.byType(SvgPicture), findsNothing);
    });

    testWidgetsAllPlatforms('renders svgContent via SvgPicture',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(const OneUiLogo(alt: 'Jio', svgContent: kLogoTestSvg)),
      );
      await tester.pumpAndSettle();
      expect(find.byType(SvgPicture), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        'svg mark content is excluded from semantics (aria-hidden parity)', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpLogoApp(const OneUiLogo(alt: 'Jio', svgContent: kLogoTestSvg)),
      );
      await tester.pumpAndSettle();
      expect(
          find.descendant(
              of: find.byType(OneUiLogo),
              matching: find.byType(ExcludeSemantics)),
          findsWidgets);
    });

    testWidgetsAllPlatforms('renders fallback when empty with no sources',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          const OneUiLogo(
            alt: 'Jio',
            fallback: Text('empty-fallback', key: ValueKey('empty-fb')),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('empty-fb')), findsOneWidget);
    });

    testWidgetsAllPlatforms('renders nothing when empty and no fallback',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(const OneUiLogo(alt: 'Jio')),
      );
      await tester.pumpAndSettle();
      expect(find.byType(SvgPicture), findsNothing);
      expect(find.byType(OneUiLogo), findsOneWidget);
    });

    testWidgetsAllPlatforms('shows fallback after image load error',
        (tester) async {
      await _pumpBrokenImageLogo(
        tester,
        logo: const OneUiLogo(
          alt: 'Jio',
          src: _kBrokenImageUrl,
          fallback: Text('img-fallback', key: ValueKey('img-fb')),
        ),
      );
      expect(find.byKey(const ValueKey('img-fb')), findsOneWidget);
    });

    testWidgetsAllPlatforms('calls onError when image fails', (tester) async {
      var errors = 0;
      await _pumpBrokenImageLogo(
        tester,
        logo: OneUiLogo(
          alt: 'Jio',
          src: _kBrokenImageUrl,
          onError: () => errors++,
        ),
      );
      expect(errors, 1);
    });

    testWidgetsAllPlatforms('each preset size resolves a positive box',
        (tester) async {
      for (final size in OneUiLogoSize.values) {
        if (size == OneUiLogoSize.custom) continue;
        await tester.pumpWidget(
          pumpLogoApp(
            OneUiLogo(
              key: ValueKey('logo-$size'),
              alt: 'Jio',
              svgContent: kLogoTestSvg,
              size: size,
            ),
          ),
        );
        await tester.pumpAndSettle();
        final box = tester.getSize(find.byKey(ValueKey('logo-$size')));
        expect(box.height, greaterThan(0));
        expect(box.width, greaterThan(0));
      }
    });

    testWidgetsAllPlatforms('custom size uses customSize pixels',
        (tester) async {
      late double resolved;
      await tester.pumpWidget(
        pumpLogoApp(
          Builder(
            builder: (context) {
              resolved = resolveOneUiLogoSizePx(
                context,
                OneUiLogoSize.custom,
                customSize: 48,
              );
              return const OneUiLogo(
                alt: 'Jio',
                svgContent: kLogoTestSvg,
                size: OneUiLogoSize.custom,
                customSize: 48,
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(resolved, 48);
      final svg = tester.widget<SvgPicture>(find.byType(SvgPicture));
      expect(svg.height, 48);
    });

    testWidgetsAllPlatforms(
        'full variant expands width from viewBox aspect ratio', (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          const OneUiLogo(
            alt: 'Jio wordmark',
            svgContent: _kFullWordmarkSvg,
            variant: OneUiLogoVariant.full,
            size: OneUiLogoSize.m,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final box = tester.getSize(find.byType(OneUiLogo));
      expect(box.width, greaterThan(box.height));
    });

    testWidgetsAllPlatforms('forwards testId as ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          const OneUiLogo(
            testId: 'brand-logo',
            alt: 'Jio',
            svgContent: kLogoTestSvg,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('brand-logo')), findsOneWidget);
    });
  });

  // ---------------------------------------------------------------------------
  // RN + Web — accessibility widget semantics (all platforms)
  // ---------------------------------------------------------------------------
  group('Logo accessibility — widget semantics (web + mobile parity)', () {
    testWidgetsAllPlatforms('non-interactive exposes image label',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
            const OneUiLogo(alt: 'Jio brand logo', svgContent: kLogoTestSvg)),
      );
      await tester.pumpAndSettle();

      final node = _logoRootSemantics(tester);
      expect(node.label, 'Jio brand logo');
      expect(node.hasFlag(SemanticsFlag.isImage), isTrue);
      expect(node.hasFlag(SemanticsFlag.isButton), isFalse);
    });

    testWidgetsAllPlatforms('forwards accessibilityHint to semantics',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          const OneUiLogo(
            alt: 'Jio',
            svgContent: kLogoTestSvg,
            accessibilityHint: 'Opens home',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(_logoRootSemantics(tester).hint, 'Opens home');
    });

    testWidgetsAllPlatforms('decorative alt excludes semantics subtree',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(const OneUiLogo(alt: '', svgContent: kLogoTestSvg)),
      );
      await tester.pumpAndSettle();
      expect(
        find.descendant(
          of: find.byType(OneUiLogo),
          matching: find.byType(ExcludeSemantics),
        ),
        findsWidgets,
      );
    });

    testWidgetsAllPlatforms('interactive with onPress uses button semantics',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          OneUiLogo(
            alt: 'Jio home',
            svgContent: kLogoTestSvg,
            interactive: true,
            onPress: () {},
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
      final data = tester
          .getSemantics(find.byType(OneUiFocusInteractive))
          .getSemanticsData();
      expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
      expect(data.label, 'Jio home');
    });

    testWidgetsAllPlatforms('onClick alias fires on tap', (tester) async {
      var clicks = 0;
      await tester.pumpWidget(
        pumpLogoApp(
          OneUiLogo(
            alt: 'Jio home',
            svgContent: kLogoTestSvg,
            interactive: true,
            onClick: () => clicks++,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(OneUiFocusInteractive));
      await tester.pumpAndSettle();
      expect(clicks, 1);
    });

    testWidgetsAllPlatforms('interactive without handler stays image role',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          const OneUiLogo(
            alt: 'Jio',
            svgContent: kLogoTestSvg,
            interactive: true,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(OneUiFocusInteractive), findsNothing);
      final node = _logoRootSemantics(tester);
      expect(node.hasFlag(SemanticsFlag.isImage), isTrue);
      expect(node.hasFlag(SemanticsFlag.isButton), isFalse);
    });

    testWidgetsAllPlatforms('interactive + disabled uses image role not button',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          OneUiLogo(
            alt: 'Jio',
            svgContent: kLogoTestSvg,
            interactive: true,
            disabled: true,
            onPress: () {},
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(OneUiFocusInteractive), findsNothing);
      final node = _logoRootSemantics(tester);
      expect(node.hasFlag(SemanticsFlag.isImage), isTrue);
      expect(node.hasFlag(SemanticsFlag.isButton), isFalse);
    });

    testWidgetsAllPlatforms('disabled interactive reduces shell opacity',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          OneUiLogo(
            alt: 'Jio',
            svgContent: kLogoTestSvg,
            interactive: true,
            disabled: true,
            onPress: () {},
          ),
        ),
      );
      await tester.pumpAndSettle();
      final opacityFinder = find.descendant(
        of: find.byType(OneUiLogo),
        matching: find.byType(Opacity),
      );
      expect(opacityFinder, findsOneWidget);
      expect(
        tester.widget<Opacity>(opacityFinder).opacity,
        kOneUiLogoDisabledOpacity,
      );
    });

    testWidgetsAllPlatforms(
        'interactive pressable uses focus interactive wrapper', (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          OneUiLogo(
            alt: 'Jio home',
            svgContent: kLogoTestSvg,
            interactive: true,
            onPress: () {},
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });
  });
}
