/// Parity tests for [OneUiIcon] — mirrors `Icon.test.tsx` + RN `iconA11y.test.ts`.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon_remote.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:ui_flutter/widgets/one_ui_icon_a11y.dart';
import 'package:ui_flutter/widgets/semantic_icon_material.dart';
import 'package:ui_flutter/engine/icon_color_resolve.dart';
import 'package:ui_flutter/engine/icon_size_resolve.dart';
import 'package:ui_flutter/engine/badge_slot_context.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_slot_parent_appearance.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

Widget _harness(Widget child) {
  final themeConfig = buildStorybookDemoThemeConfig();
  final root = buildRootSurfaceContext(
    themeConfig: themeConfig,
    rootParentStep: 2500,
    darkMode: false,
  );
  return OneUiScope(
    platformId: 'S',
    density: 'default',
    child: OneUiSurfaceScope(
      value: root,
      child: MaterialApp(home: Scaffold(body: Center(child: child))),
    ),
  );
}

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('formatOneUiIconName', () {
    test('formats IcPascalCase catalog ids', () {
      expect(formatOneUiIconName('IcAdd'), 'add icon');
      expect(formatOneUiIconName('IcChevronDown'), 'chevron down icon');
    });

    test('formats semantic keys', () {
      expect(formatOneUiIconName('add'), 'add');
      expect(formatOneUiIconName('chevronDown'), 'chevron down');
    });

    test('lowercases ic_snake_case catalog ids', () {
      expect(formatOneUiIconName('ic_star'), 'star icon');
      expect(formatOneUiIconName('ic_USER_PROFILE'), 'user profile icon');
    });
  });

  group('resolveOneUiIconState', () {
    test('defaults to neutral when appearance unset', () {
      final s = resolveOneUiIconState();
      expect(s.appearance, 'neutral');
      expect(s.size, '5');
      expect(s.emphasis, OneUiIconEmphasis.high);
    });

    test('inherits slot parent appearance', () {
      final s = resolveOneUiIconState(
        slotParentAppearance: 'secondary',
      );
      expect(s.appearance, 'secondary');
    });

    test('maps brand-bg slot parent to primary', () {
      final s = resolveOneUiIconState(slotParentAppearance: 'brand-bg');
      expect(s.appearance, 'primary');
    });

    test('emits data attributes', () {
      final s = resolveOneUiIconState(
        size: '8',
        appearance: 'primary',
        emphasis: OneUiIconEmphasis.medium,
      );
      expect(s.dataAttributes['data-size'], '8');
      expect(s.dataAttributes['data-appearance'], 'primary');
      expect(s.dataAttributes['data-emphasis'], 'medium');
    });

    test('resolves auto appearance to neutral in pure state', () {
      expect(resolveOneUiIconState(appearance: 'auto').appearance, 'neutral');
    });

    test('auto inherits slot parent in pure state', () {
      expect(
        resolveOneUiIconState(
          appearance: 'auto',
          slotParentAppearance: 'positive',
        ).appearance,
        'positive',
      );
    });

    testWidgets(
      'auto prefers nested surface over slot parent in context resolver only',
      (tester) async {
        late BuildContext captured;
        await tester.pumpWidget(
          _harness(
            OneUiSurface(
              mode: 'subtle',
              appearance: 'secondary',
              child: OneUiSlotParentAppearanceScope(
                appearance: 'positive',
                child: Builder(
                  builder: (context) {
                    captured = context;
                    return const SizedBox.shrink();
                  },
                ),
              ),
            ),
          ),
        );
        expect(
          resolveOneUiIconAppearance(
            captured,
            appearance: 'auto',
            slotParentAppearance:
                OneUiSlotParentAppearanceScope.maybeOf(captured),
          ),
          'secondary',
        );
        expect(
          resolveOneUiIconState(
            appearance: 'auto',
            slotParentAppearance: 'positive',
          ).appearance,
          'positive',
        );
      },
    );

    test('invalid size falls back to 5', () {
      expect(resolveOneUiIconState(size: '99').size, '5');
      expect(oneUiResolveIconSize('invalid'), '5');
    });

    for (final sz in kOneUiIconSizes) {
      test('accepts Figma size $sz', () {
        expect(oneUiResolveIconSize(sz), sz);
      });
    }
  });

  group('resolveOneUiIconAppearance', () {
    testWidgets('auto inherits surface parent appearance', (tester) async {
      late BuildContext captured;
      await tester.pumpWidget(
        _harness(
          OneUiSurface(
            mode: 'subtle',
            appearance: 'secondary',
            child: Builder(
              builder: (context) {
                captured = context;
                return const OneUiIcon(icon: 'heart', appearance: 'auto');
              },
            ),
          ),
        ),
      );
      expect(
        resolveOneUiIconAppearance(captured, appearance: 'auto'),
        'secondary',
      );
    });

    testWidgets('auto inherits root surface appearance (primary)',
        (tester) async {
      late BuildContext captured;
      await tester.pumpWidget(
        _harness(
          Builder(
            builder: (context) {
              captured = context;
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(
        resolveOneUiIconAppearance(captured, appearance: 'auto'),
        'primary',
      );
    });

    testWidgets('auto inherits slot parent outside nested Surface',
        (tester) async {
      late BuildContext captured;
      await tester.pumpWidget(
        _harness(
          OneUiSlotParentAppearanceScope(
            appearance: 'positive',
            child: Builder(
              builder: (context) {
                captured = context;
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
      expect(
        resolveOneUiIconAppearance(
          captured,
          appearance: 'auto',
          slotParentAppearance:
              OneUiSlotParentAppearanceScope.maybeOf(captured),
        ),
        'positive',
      );
    });
  });

  group('OneUiIcon semantics', () {
    testWidgets('decorative by default — no img label', (tester) async {
      await tester.pumpWidget(_harness(const OneUiIcon(icon: 'star')));
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Favourite'), findsNothing);
      expect(find.bySemanticsLabel('star'), findsNothing);
    });

    testWidgets('exposes semantics when semanticsLabel set', (tester) async {
      await tester.pumpWidget(
        _harness(const OneUiIcon(icon: 'star', semanticsLabel: 'Favourite')),
      );
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Favourite'), findsOneWidget);
    });

    testWidgets('data attributes encoded on subtree key', (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIcon(
            icon: 'star',
            size: '8',
            appearance: 'primary',
            emphasis: OneUiIconEmphasis.medium,
            semanticsLabel: 'Star',
          ),
        ),
      );
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-icon|data-size=8|data-appearance=primary|data-emphasis=medium',
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgets('hides from a11y when excludeFromSemantics is true',
        (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIcon(
            icon: 'star',
            semanticsLabel: 'Ignored',
            excludeFromSemantics: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Ignored'), findsNothing);
    });

    testWidgets('empty semanticsLabel is decorative with debug warning',
        (tester) async {
      await tester.pumpWidget(
        _harness(const OneUiIcon(icon: 'star', semanticsLabel: '')),
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isA<FlutterError>());
      expect(find.bySemanticsLabel('star'), findsNothing);
      expect(find.bySemanticsLabel('Favourite'), findsNothing);
    });
  });

  group('OneUiIcon rendering', () {
    testWidgets('renders Jio IcCare for semantic heart (not Material)',
        (tester) async {
      await tester
          .pumpWidget(_harness(const OneUiIcon(icon: 'heart', size: '8')));
      expect(find.byType(SvgPicture), findsOneWidget);
      expect(find.byIcon(Icons.favorite_border), findsNothing);
      expect(JioIconCatalog.instance.record('IcCare'), isNotNull);
    });

    testWidgets('renders custom widget glyph', (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIcon(
            icon: Icon(Icons.star, key: Key('custom-star')),
            size: '6',
          ),
        ),
      );
      expect(find.byKey(const Key('custom-star')), findsOneWidget);
    });

    testWidgets('appearance auto renders with resolved colour', (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIcon(icon: 'heart', appearance: 'auto', size: '8'),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(SvgPicture), findsOneWidget);
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-icon|data-size=8|data-appearance=primary|data-emphasis=high',
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgets('all Figma emphasis levels resolve non-transparent colour',
        (tester) async {
      for (final emphasis in OneUiIconEmphasis.values) {
        await tester.pumpWidget(
          _harness(
            OneUiIcon(
              icon: 'heart',
              appearance: 'primary',
              emphasis: emphasis,
              size: '8',
            ),
          ),
        );
        await tester.pumpAndSettle();
        final icon =
            tester.widget<OneUiSemanticIcon>(find.byType(OneUiSemanticIcon));
        expect(icon.color, isNotNull);
        expect(icon.color!.alpha, greaterThan(0));
      }
    });

    testWidgets('all Figma appearance roles resolve colour', (tester) async {
      await tester
          .pumpWidget(_harness(const OneUiIcon(icon: 'heart', size: '8')));
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(OneUiIcon));
      for (final role in kOneUiIconAppearances) {
        final color = resolveOneUiIconColor(
          ctx,
          appearance: role,
          emphasis: OneUiIconEmphasis.high,
        );
        expect(color.alpha, greaterThan(0), reason: role);
      }
    });

    testWidgets('slot parent appearance scope composes', (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiSlotParentAppearanceScope(
            appearance: 'negative',
            child: OneUiIcon(icon: 'warning', size: '5'),
          ),
        ),
      );
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgets('badge slot icon size applies only for default size 5',
        (tester) async {
      late double defaultPx;
      late double explicitPx;
      await tester.pumpWidget(
        _harness(
          BadgeSlotSizeScope(
            sizes: kBadgeSlotSizes['xl']!,
            child: Builder(
              builder: (context) {
                defaultPx = resolveOneUiIconSizePx(context, '5');
                explicitPx = resolveOneUiIconSizePx(context, '8');
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
      expect(defaultPx, kBadgeSlotSizes['xl']!.iconPx);
      expect(explicitPx, isNot(defaultPx));
      expect(explicitPx, greaterThan(defaultPx));
    });

    testWidgets('renders without OneUiScope using fallback sizing',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceBootstrap(
            themeConfig: buildStorybookDemoThemeConfig(),
            darkMode: false,
            child: const Scaffold(
              body: Center(child: OneUiIcon(icon: 'heart')),
            ),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgets('unsupported icon type renders empty shell', (tester) async {
      await tester.pumpWidget(_harness(const OneUiIcon(icon: 42)));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isA<FlutterError>());
      expect(find.byType(OneUiIcon), findsOneWidget);
      expect(find.byType(OneUiSemanticIcon), findsNothing);
    });

    testWidgets('resolveOneUiIconSizePx survives missing OneUiScope',
        (tester) async {
      late double px;
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              px = resolveOneUiIconSizePx(context, '5');
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(px, greaterThan(0));
    });
  });

  group('OneUiIcon network icon', () {
    test('isOneUiIconNetworkSrc detects http(s) URLs', () {
      expect(isOneUiIconNetworkSrc('https://cdn.example.com/icons/star.svg'),
          isTrue);
      expect(isOneUiIconNetworkSrc('http://localhost/icon.png'), isTrue);
      expect(isOneUiIconNetworkSrc('search'), isFalse);
      expect(isOneUiIconNetworkSrc(''), isFalse);
    });

    test('isOneUiIconRemoteSvgUrl detects svg paths', () {
      expect(isOneUiIconRemoteSvgUrl('https://cdn.example.com/a/icon.svg'),
          isTrue);
      expect(isOneUiIconRemoteSvgUrl('https://cdn.example.com/a/icon.png'),
          isFalse);
    });

    test('prepareOneUiRemoteSvgForTint maps monochrome fills to currentColor',
        () {
      const raw = '<svg fill="black"><path fill="#000"/></svg>';
      final prepared = prepareOneUiRemoteSvgForTint(raw);
      expect(prepared, contains('currentColor'));
      expect(oneUiRemoteSvgUsesCurrentColor(prepared), isTrue);
    });

    testWidgets('remote URL in icon prop mounts OneUiIconRemote',
        (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIcon(
            icon: 'https://cdn.example.com/icons/custom.png',
            size: '5',
          ),
        ),
      );
      await tester.pump();
      expect(find.byType(OneUiIconRemote), findsOneWidget);
    });

    testWidgets('semantic name does not mount OneUiIconRemote', (tester) async {
      await tester.pumpWidget(
        _harness(const OneUiIcon(icon: 'heart', size: '5')),
      );
      await tester.pumpAndSettle();
      expect(find.byType(OneUiIconRemote), findsNothing);
      expect(find.byType(OneUiSemanticIcon), findsOneWidget);
    });
  });
}
