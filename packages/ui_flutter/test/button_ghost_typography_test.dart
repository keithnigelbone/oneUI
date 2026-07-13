import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/button_color_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_button_types.dart';

ThemeConfig _themeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      'primary': buildScaleDefinition('primary', grey, 600),
    },
  );
}

NativeDesignSystemPayload _ds({Map<String, String>? overrides}) {
  final props = <String, dynamic>{
    '--Button-fontWeight': '600',
    '--Button-textTransform': 'none',
    '--Button-letterSpacing': 'normal',
    '--Button-borderRadius': '9999px',
    '--Button-iconGap': '4px',
    '--Button-borderWidth-ghost': '0px',
    '--Button-borderWidth-bold': '0px',
    '--Button-borderWidth-subtle': '0px',
    '--Button-minHeight-10': '40px',
    '--Button-paddingVertical-10': '10px',
    '--Button-paddingHorizontal-10': '16px',
    '--Button-paddingHorizontalStart-10': '16px',
    '--Button-paddingHorizontalEnd-10': '16px',
    '--Button-fontSize-10': '14px',
    '--Button-lineHeight-10': '20px',
    '--Button-iconGapStart-10': '4px',
    '--Button-iconGapEnd-10': '4px',
    '--Disabled-Opacity': '0.38',
    '--Button-textColor-ghost': 'transparent',
    ...?overrides,
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
        '--Stroke-XL': '2px',
        '--Focus-Outline-Width': '2px',
        '--Focus-Outline': '#0000aa',
      },
    },
  })!;
}

NativeTypographySnapshot _typography() {
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

Widget _harness({
  required NativeDesignSystemPayload ds,
  required Widget child,
}) {
  final root = buildRootSurfaceContext(
    themeConfig: _themeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return MaterialApp(
    home: OneUiSurfaceScope(
      value: root,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        nativeTypography: _typography(),
        designSystem: ds,
        child: child,
      ),
    ),
  );
}

void main() {
  testWidgets('ghost transparent textColor falls back to tintedA11y at rest',
      (tester) async {
    final ds = _ds();
    ButtonResolvedColors? colors;

    await tester.pumpWidget(
      _harness(
        ds: ds,
        child: Builder(
          builder: (ctx) {
            colors = resolveButtonColors(
              ctx,
              ds,
              variant: OneUiButtonVariantKind.ghost,
              appearance: 'primary',
            );
            return const OneUiButton(
              label: 'Ghost',
              attention: OneUiButtonAttention.low,
            );
          },
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(colors!.foreground.a, greaterThan(0));
    expect(colors!.foregroundHover!.a, greaterThan(0));

    final text = tester.widget<Text>(find.text('Ghost'));
    expect(text.style?.color?.a, greaterThan(0));
  });

  testWidgets('mixed-case textTransform uppercases label', (tester) async {
    final ds = _ds(overrides: {'--Button-textTransform': 'Uppercase'});

    await tester.pumpWidget(
      _harness(
        ds: ds,
        child: const OneUiButton(label: 'shout'),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('SHOUT'), findsOneWidget);
  });
}
