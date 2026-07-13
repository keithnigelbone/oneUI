/// React parity — `Icon.test.tsx` + `IconContained.test.tsx` (functionality + a11y).
///
/// Each test name mirrors the web spec so Flutter stays aligned when React changes.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_types.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';

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

  // ---------------------------------------------------------------------------
  // packages/ui/src/components/Icon/Icon.test.tsx
  // ---------------------------------------------------------------------------
  group('React parity — Icon.test.tsx', () {
    group('accessibility', () {
      test('decorative by default (aria-hidden, no role=img)', () {
        expect(
          oneUiIconIsExposedToA11y(ariaLabel: null, ariaHidden: null),
          isFalse,
        );
        expect(
          oneUiIconEffectiveLabel(ariaLabel: null, semanticIconName: 'star'),
          isNull,
        );
      });

      testWidgets('exposes role=img with aria-label when label is provided', (
        tester,
      ) async {
        await tester.pumpWidget(
          _harness(const OneUiIcon(icon: 'star', semanticsLabel: 'Favourite')),
        );
        await tester.pumpAndSettle();

        expect(find.bySemanticsLabel('Favourite'), findsOneWidget);
        final semantics =
            tester.getSemantics(find.bySemanticsLabel('Favourite'));
        expect(semantics.label, 'Favourite');
        expect(semantics.hasFlag(SemanticsFlag.isImage), isTrue);
      });

      testWidgets('testId attaches ValueKey', (tester) async {
        await tester.pumpWidget(
          _harness(const OneUiIcon(icon: 'star', testId: 'icon-root')),
        );
        expect(find.byKey(const ValueKey('icon-root')), findsOneWidget);
      });

      testWidgets('excludeFromSemantics hides from assistive tech',
          (tester) async {
        await tester.pumpWidget(
          _harness(
            const OneUiIcon(
              icon: 'star',
              semanticsLabel: 'Hidden',
              excludeFromSemantics: true,
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
      });
    });

    group('functionality', () {
      test('emits data-size, data-appearance, data-emphasis (useIconState)',
          () {
        final state = resolveOneUiIconState(
          size: '6',
          appearance: 'primary',
          emphasis: OneUiIconEmphasis.medium,
        );
        expect(state.dataAttributes['data-size'], '6');
        expect(state.dataAttributes['data-appearance'], 'primary');
        expect(state.dataAttributes['data-emphasis'], 'medium');
      });

      testWidgets('data attributes encoded on widget subtree key',
          (tester) async {
        await tester.pumpWidget(
          _harness(
            const OneUiIcon(
              icon: 'star',
              size: '6',
              appearance: 'primary',
              emphasis: OneUiIconEmphasis.medium,
            ),
          ),
        );
        expect(
          find.byKey(
            const ValueKey<String>(
              'oneui-icon|data-size=6|data-appearance=primary|data-emphasis=medium',
            ),
          ),
          findsOneWidget,
        );
      });

      testWidgets('renders custom Widget as icon glyph', (tester) async {
        await tester.pumpWidget(
          _harness(
            const OneUiIcon(
              icon: Icon(Icons.star, key: Key('custom-svg')),
              semanticsLabel: 'Custom',
            ),
          ),
        );
        expect(find.byKey(const Key('custom-svg')), findsOneWidget);
      });

      testWidgets('renders semantic icon via Jio catalog', (tester) async {
        await tester
            .pumpWidget(_harness(const OneUiIcon(icon: 'heart', size: '8')));
        expect(find.byType(SvgPicture), findsOneWidget);
        expect(find.byIcon(Icons.favorite_border), findsNothing);
      });

      // Web forwards ref to root <span> — Flutter StatelessWidget has no ref API.
      test('ref forwarding is web-only (not applicable on Flutter)', () {
        expect(true, isTrue);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // packages/ui/src/components/IconContained/IconContained.test.tsx
  // ---------------------------------------------------------------------------
  group('React parity — IconContained.test.tsx', () {
    group('accessibility', () {
      testWidgets('renders with role=img and supplied aria-label',
          (tester) async {
        await tester.pumpWidget(
          _harness(const OneUiIconContained(
              icon: 'star', semanticsLabel: 'Favourite')),
        );
        await tester.pumpAndSettle();

        expect(find.bySemanticsLabel('Favourite'), findsOneWidget);
        final semantics =
            tester.getSemantics(find.bySemanticsLabel('Favourite'));
        expect(semantics.hasFlag(SemanticsFlag.isImage), isTrue);
      });

      testWidgets('inner icon glyph is aria-hidden (excluded from tree)',
          (tester) async {
        await tester.pumpWidget(
          _harness(
              const OneUiIconContained(icon: 'star', semanticsLabel: 'Star')),
        );
        await tester.pumpAndSettle();
        expect(find.bySemanticsLabel('star'), findsNothing);
      });

      test('resolveOneUiIconContainedSemantics matches RN aria-hidden', () {
        expect(
          resolveOneUiIconContainedSemantics(
            semanticsLabel: 'Heart',
            excludeFromSemantics: true,
            isDisabled: false,
          ).exposed,
          isFalse,
        );
      });

      testWidgets('excludeFromSemantics hides contained icon', (tester) async {
        await tester.pumpWidget(
          _harness(
            const OneUiIconContained(
              icon: 'star',
              semanticsLabel: 'Hidden',
              excludeFromSemantics: true,
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
      });

      testWidgets('disabled maps accessibilityState.disabled', (tester) async {
        await tester.pumpWidget(
          _harness(
            const OneUiIconContained(
              icon: 'star',
              semanticsLabel: 'Star',
              disabled: true,
            ),
          ),
        );
        await tester.pumpAndSettle();
        final handle = tester.ensureSemantics();
        try {
          final data = tester
              .getSemantics(find.bySemanticsLabel('Star'))
              .getSemanticsData();
          expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
        } finally {
          handle.dispose();
        }
      });
    });

    group('functionality', () {
      test(
          'emits data-size, data-attention, data-appearance (useIconContainedState)',
          () {
        final state = resolveOneUiIconContainedState(
          size: 'l',
          attention: OneUiIconContainedAttention.medium,
          appearance: 'secondary',
        );
        expect(state.dataAttributes['data-size'], 'l');
        expect(state.dataAttributes['data-attention'], 'medium');
        expect(state.dataAttributes['data-appearance'], 'secondary');
      });

      testWidgets('data attributes encoded on widget subtree key',
          (tester) async {
        await tester.pumpWidget(
          _harness(
            const OneUiIconContained(
              icon: 'star',
              size: 'l',
              attention: OneUiIconContainedAttention.medium,
              appearance: 'secondary',
              semanticsLabel: 'Star',
            ),
          ),
        );
        expect(
          find.byKey(
            const ValueKey<String>(
              'oneui-icon-contained|data-size=l|data-attention=medium|data-appearance=secondary|disabled=false',
            ),
          ),
          findsOneWidget,
        );
      });

      test('resolves appearance=auto to primary', () {
        final state = resolveOneUiIconContainedState(appearance: 'auto');
        expect(state.appearance, 'primary');
        expect(state.dataAttributes['data-appearance'], 'primary');
      });

      testWidgets('renders custom Widget as icon glyph', (tester) async {
        await tester.pumpWidget(
          _harness(
            const OneUiIconContained(
              icon: Icon(Icons.star, key: Key('custom-svg')),
              semanticsLabel: 'Custom',
            ),
          ),
        );
        expect(find.byKey(const Key('custom-svg')), findsOneWidget);
      });

      testWidgets('disabled applies opacity token', (tester) async {
        await tester.pumpWidget(
          _harness(
            const OneUiIconContained(
              icon: 'star',
              disabled: true,
              semanticsLabel: 'Disabled',
            ),
          ),
        );
        final opacity = tester.widget<Opacity>(find.byType(Opacity));
        expect(opacity.opacity, lessThan(1.0));
      });

      test('ref forwarding is web-only (not applicable on Flutter)', () {
        expect(true, isTrue);
      });
    });
  });
}
