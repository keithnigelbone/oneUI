import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/nested_surface_component_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

void main() {
  group('oneUiIsRootPinnedLiteral', () {
    test('detects hex and opaque literals', () {
      expect(oneUiIsRootPinnedLiteral('#ff0000'), isTrue);
      expect(oneUiIsRootPinnedLiteral('  #AABBCC  '), isTrue);
      expect(oneUiIsRootPinnedLiteral('transparent'), isFalse);
      expect(oneUiIsRootPinnedLiteral('var(--Primary-Bold)'), isFalse);
      expect(oneUiIsRootPinnedLiteral(''), isFalse);
    });
  });

  testWidgets('oneUiComponentColorKeyOrder promotes role keys when nested', (
    tester,
  ) async {
    final themeConfig = buildStorybookDemoThemeConfig();
    late List<String> ordered;
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: themeConfig,
          darkMode: false,
          child: OneUiSurface(
            mode: kSurfaceSubtle,
            child: Builder(
              builder: (ctx) {
                ordered = oneUiComponentColorKeyOrder(ctx, [
                  '--Button-backgroundColor-bold',
                  '--Button-roleBold',
                ]);
                return const SizedBox();
              },
            ),
          ),
        ),
      ),
    );
    expect(ordered.first, '--Button-roleBold');
  });

  testWidgets(
    'skips pinned hex override inside nested OneUiSurface',
    (tester) async {
      final themeConfig = buildStorybookDemoThemeConfig();
      final ds = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': {
          '--Button-backgroundColor-bold': '#010203',
          '--Button-roleBold': 'var(--Primary-Bold)',
        },
        'dimensionContexts': <dynamic>[],
        'activeDimensionKey': 'S:default',
        'activeDimensionContext': {
          'platformId': 'S',
          'density': 'default',
          'dimensions': <String, String>{},
        },
      })!;

      Color? resolved;
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceBootstrap(
            themeConfig: themeConfig,
            darkMode: false,
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: ds,
              child: Builder(
                builder: (rootCtx) {
                  return OneUiSurface(
                    mode: kSurfaceBold,
                    appearance: 'primary',
                    child: Builder(
                      builder: (nestedCtx) {
                        resolved = resolveColorFromComponentPropertyKeys(
                          nestedCtx,
                          ds,
                          keys: [
                            '--Button-backgroundColor-bold',
                            '--Button-roleBold',
                          ],
                          appearance: 'primary',
                        );
                        return const SizedBox();
                      },
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      );

      expect(resolved, isNotNull);
      expect(
        resolved!.value & 0xFFFFFF,
        isNot(0x010203),
        reason: 'pinned hex must not win on nested surface',
      );
    },
  );
}
