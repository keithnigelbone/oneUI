import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/button_color_resolve.dart';
import 'package:ui_flutter/engine/focus_ring_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

ThemeConfig _jioLikeThemeConfig() {
  final palette = <int, String>{
    100: '#000000',
    600: '#3900AD',
    900: '#5540D8',
    1300: '#7C78F8',
    2400: '#F3F4FF',
    2500: '#FFFFFF',
  };
  return ThemeConfig(
    appearances: {
      'primary': buildScaleDefinition(
        'indigo',
        palette,
        600,
        anchorBoldToBaseStep: true,
      ),
    },
  );
}

NativeDesignSystemPayload _jioLikeButtonDs() {
  final props = <String, dynamic>{
    '--Button-fontWeight': '600',
    '--Button-textTransform': 'none',
    '--Button-letterSpacing': 'normal',
    '--Button-borderRadius': '9999px',
    '--Button-iconGap': '4px',
    '--Button-iconGapEnd-10': '6px',
    '--Button-borderWidth-ghost': '0px',
    '--Button-textColor-ghost': 'var(--Primary-TintedA11y)',
    '--Button-backgroundColor-ghost-hover': 'var(--Primary-Subtle-Hover)',
    '--Disabled-Opacity': '0.38',
    '--Button-minHeight-10': '40px',
    '--Button-paddingVertical-10': '10px',
    '--Button-paddingHorizontal-10': '16px',
    '--Button-paddingHorizontalStart-10': '16px',
    '--Button-paddingHorizontalEnd-10': '16px',
    '--Button-paddingHorizontalEnd-10-slot': '12px',
    '--Button-fontSize-10': '14px',
    '--Button-lineHeight-10': '20px',
    '--Button-iconSize-10': '18px',
    '--Focus-Outline': '#8E90FF',
  };

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-1': '4px',
        '--Spacing-1-5': '6px',
        '--Stroke-XL': '2px',
        '--Focus-Outline-Width': '2px',
        '--Surface-Halo-Gap': '#ffffff',
        '--Surface-Main': '#ffffff',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

NativeTypographySnapshot _minimalTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        'M': {'fontSize': 14, 'lineHeight': 20},
      },
      'weights': {'high': 600},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

BoxDecoration? _buttonCoreDecoration(WidgetTester tester) {
  for (final deco
      in tester.widgetList<DecoratedBox>(find.byType(DecoratedBox))) {
    final box = deco.decoration;
    if (box is BoxDecoration &&
        box.borderRadius != null &&
        (box.boxShadow == null || box.boxShadow!.isEmpty)) {
      return box;
    }
  }
  return null;
}

void main() {
  testWidgets(
      'jio-like ghost on bold keeps transparent fill and readable label',
      (tester) async {
    final themeConfig = _jioLikeThemeConfig();
    final ds = _jioLikeButtonDs();
    final root = buildRootSurfaceContext(
      themeConfig: themeConfig,
      rootParentStep: 2500,
      darkMode: false,
    );

    Color? ghostFg;
    Color? ghostHoverBg;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            nativeTypography: _minimalTypography(),
            designSystem: ds,
            child: OneUiSurface(
              mode: 'bold',
              child: Builder(
                builder: (ctx) {
                  final c = resolveButtonColors(
                    ctx,
                    ds,
                    variant: OneUiButtonVariantKind.ghost,
                    appearance: 'primary',
                  );
                  ghostFg = c.foreground;
                  ghostHoverBg = c.backgroundHover;
                  return const OneUiButton(
                    label: 'Low',
                    attention: OneUiButtonAttention.low,
                    end: OneUiButtonSlotIcon(),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(ConvexGapCard), findsNothing);

    expect(ghostFg!.alpha, greaterThan(0));
    expect(
      (ghostFg!.computeLuminance() - ghostHoverBg!.computeLuminance()).abs(),
      greaterThan(0.08),
      reason: 'fg=$ghostFg hover=$ghostHoverBg',
    );

    final fill = _buttonCoreDecoration(tester)?.color;
    expect(fill?.alpha ?? 0, lessThan(255),
        reason: 'ghost resting fill must stay transparent');

    final text = tester.widget<Text>(find.text('Low'));
    expect(text.style?.color?.alpha, greaterThan(0));
    expect(find.text('Low'), findsOneWidget);
  });

  testWidgets(
      'ghost forceFocusRing on bold uses container halo gap not page white',
      (tester) async {
    final themeConfig = _jioLikeThemeConfig();
    final ds = _jioLikeButtonDs();
    final root = buildRootSurfaceContext(
      themeConfig: themeConfig,
      rootParentStep: 2500,
      darkMode: false,
    );

    Color? rootGap;
    Color? boldGap;
    const boldContainerHex = '#3900AD';

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            nativeTypography: _minimalTypography(),
            designSystem: ds,
            child: Builder(
              builder: (ctx) {
                rootGap = resolveOneUiFocusRingSpec(
                  ctx,
                  ds,
                  semanticAppearanceFallback: 'primary',
                )?.innerGapShadowColor;
                return OneUiSurface(
                  mode: 'bold',
                  child: Builder(
                    builder: (inner) {
                      boldGap = resolveOneUiFocusRingSpec(
                        inner,
                        ds,
                        semanticAppearanceFallback: 'primary',
                        innerGapColorOverride:
                            resolveSurfaceHaloGapFromScope(inner),
                      )?.innerGapShadowColor;
                      return const OneUiButton(
                        label: 'Low focused',
                        attention: OneUiButtonAttention.low,
                        forceFocusRing: true,
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(rootGap, isNotNull);
    expect(boldGap, isNotNull);
    expect(boldGap, isNot(equals(rootGap)));
    expect(boldGap, equals(oneUiHexColor(boldContainerHex)));

    final text = tester.widget<Text>(find.text('Low focused'));
    expect(text.style?.color?.alpha, greaterThan(0));
    expect(
      (text.style!.color!.computeLuminance() - boldGap!.computeLuminance())
          .abs(),
      greaterThan(0.08),
      reason: 'label must contrast with halo gap behind transparent ghost fill',
    );
  });
}
