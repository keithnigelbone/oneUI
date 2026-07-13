import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_directional_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/semantic_icon_material.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

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

Transform? _directionalTransform(WidgetTester tester) {
  final finder = find.byWidgetPredicate(
    (widget) =>
        widget is Transform &&
        widget.transform.getRow(0)[0] == -1 &&
        widget.transform.getRow(1)[1] == 1,
  );
  if (finder.evaluate().isEmpty) return null;
  return tester.widget<Transform>(finder);
}

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('oneUiSemanticIconMirrorsInRtl', () {
    test('horizontal navigation icons mirror', () {
      expect(oneUiSemanticIconMirrorsInRtl('arrowLeft'), isTrue);
      expect(oneUiSemanticIconMirrorsInRtl('chevronRight'), isTrue);
      expect(oneUiSemanticIconMirrorsInRtl('back'), isTrue);
    });

    test('vertical and non-directional icons do not mirror', () {
      expect(oneUiSemanticIconMirrorsInRtl('arrowUp'), isFalse);
      expect(oneUiSemanticIconMirrorsInRtl('heart'), isFalse);
      expect(oneUiSemanticIconMirrorsInRtl('externalLink'), isFalse);
    });
  });

  group('OneUiIcon visual regressions', () {
    testWidgets('directional icons mirror in RTL', (tester) async {
      await tester.pumpWidget(
        _harness(
          Directionality(
            textDirection: TextDirection.rtl,
            child: const OneUiIcon(icon: 'arrowLeft'),
          ),
        ),
      );
      await tester.pump();
      expect(_directionalTransform(tester), isNotNull);
    });

    testWidgets('non-directional icons stay unmirrored in RTL', (tester) async {
      await tester.pumpWidget(
        _harness(
          Directionality(
            textDirection: TextDirection.rtl,
            child: const OneUiIcon(icon: 'heart'),
          ),
        ),
      );
      await tester.pump();
      expect(_directionalTransform(tester), isNull);
    });

    testWidgets('custom widget glyph uses single IconTheme layer',
        (tester) async {
      const customKey = Key('custom-glyph');
      await tester.pumpWidget(
        _harness(
          const OneUiIcon(
            icon: Icon(Icons.star, key: customKey),
            size: '8',
          ),
        ),
      );
      await tester.pump();

      final fitted = find.descendant(
        of: find.byType(OneUiIcon),
        matching: find.byType(FittedBox),
      );
      expect(fitted, findsOneWidget);
      expect(
        find.descendant(of: fitted, matching: find.byType(IconTheme)),
        findsNothing,
      );
    });

    testWidgets('catalog-ready semantic icon renders Jio SVG not Material', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: OneUiSemanticIcon('heart', size: 24),
          ),
        ),
      );
      await tester.pump();
      expect(find.byType(SvgPicture), findsOneWidget);
      expect(find.byIcon(Icons.favorite_border), findsNothing);
    });

    testWidgets('unknown semantic icon uses Material only after catalog ready',
        (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: OneUiSemanticIcon('not_a_real_semantic_icon', size: 24),
          ),
        ),
      );
      await tester.pump();
      expect(find.byIcon(Icons.crop_square), findsOneWidget);
    });
  });
}
