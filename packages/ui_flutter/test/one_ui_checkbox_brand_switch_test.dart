import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/checkbox_color_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

NativeDesignSystemPayload _checkboxDs({
  required String boxSizeM,
  required String roleBold,
  String? strokeMedium,
}) {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Stroke-M': '1px',
      '--Stroke-XL': '2px',
      '--Focus-Outline-Width': '2px',
      '--Disabled-Opacity': '0.5',
      '--Checkbox-boxSize-m': boxSizeM,
      '--Checkbox-iconSize-m': '16px',
      '--Checkbox-borderRadius-m': '6px',
      '--Checkbox-roleBold': roleBold,
      '--Checkbox-roleBoldHigh': 'var(--Primary-Bold-TintedA11y)',
      '--Checkbox-roleStrokeMedium':
          strokeMedium ?? 'var(--Primary-Stroke-Medium)',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': <String, String>{},
    },
  })!;
}

ThemeConfig _theme() {
  return ThemeConfig(
    appearances: {
      'primary': buildScaleDefinition('primary', buildColoredPalette(), 600),
      'secondary':
          buildScaleDefinition('secondary', buildGreyscalePalette(), 1300),
      'neutral': buildScaleDefinition('neutral', buildGreyscalePalette(), 1300),
      'informative':
          buildScaleDefinition('informative', buildColoredPalette(), 600),
    },
  );
}

ThemeConfig _themeWithSecondaryHue(int baseStep) {
  return ThemeConfig(
    appearances: {
      'secondary':
          buildScaleDefinition('secondary', buildGreyscalePalette(), baseStep),
      'neutral': buildScaleDefinition('neutral', buildGreyscalePalette(), 1300),
      'informative':
          buildScaleDefinition('informative', buildColoredPalette(), 600),
    },
  );
}

Widget _harness({
  required NativeDesignSystemPayload ds,
  required String brandHash,
  required Widget child,
  ThemeConfig? themeConfig,
}) {
  final root = buildRootSurfaceContext(
    themeConfig: themeConfig ?? _theme(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return MaterialApp(
    home: OneUiSurfaceScope(
      value: root,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        designSystem: ds,
        child: KeyedSubtree(key: ValueKey(brandHash), child: child),
      ),
    ),
  );
}

void main() {
  testWidgets('repaints when brand design system tokens change',
      (tester) async {
    await tester.pumpWidget(
      _harness(
        brandHash: 'cb-brand-a',
        ds: _checkboxDs(boxSizeM: '20px', roleBold: '#111111'),
        child: OneUiCheckbox(label: 'Updates', defaultChecked: true),
      ),
    );
    await tester.pumpAndSettle();

    final boxA = tester.getSize(find.byType(AnimatedContainer).first);
    expect(boxA.width, 20);

    await tester.pumpWidget(
      _harness(
        brandHash: 'cb-brand-b',
        ds: _checkboxDs(boxSizeM: '24px', roleBold: '#222222'),
        child: OneUiCheckbox(
          key: ValueKey('cb-brand-b'),
          label: 'Updates',
          defaultChecked: true,
        ),
      ),
    );
    await tester.pumpAndSettle();

    final boxB = tester.getSize(find.byType(AnimatedContainer).first);
    expect(boxB.width, 24);
  });

  testWidgets('checked fill updates when surface theme roles change',
      (tester) async {
    Widget build({required ThemeConfig theme, required String hash}) {
      return _harness(
        brandHash: hash,
        themeConfig: theme,
        ds: _checkboxDs(boxSizeM: '20px', roleBold: 'var(--Secondary-Bold)'),
        child: OneUiCheckbox(label: 'Opt in', defaultChecked: true),
      );
    }

    await tester
        .pumpWidget(build(theme: _themeWithSecondaryHue(600), hash: 'hue-a'));
    await tester.pumpAndSettle();
    final fillA = tester.widget<AnimatedContainer>(
      find.byType(AnimatedContainer).first,
    );
    final colorA = (fillA.decoration! as BoxDecoration).color;

    await tester
        .pumpWidget(build(theme: _themeWithSecondaryHue(1800), hash: 'hue-b'));
    await tester.pumpAndSettle();
    final fillB = tester.widget<AnimatedContainer>(
      find.byType(AnimatedContainer).first,
    );
    final colorB = (fillB.decoration! as BoxDecoration).color;

    expect(colorA, isNotNull);
    expect(colorB, isNotNull);
    expect(colorA, isNot(equals(colorB)));
  });

  testWidgets(
      'unchecked border follows parent Surface appearance on brand switch',
      (tester) async {
    final theme = _theme();
    final root = buildRootSurfaceContext(
      themeConfig: theme,
      rootParentStep: 2500,
      darkMode: false,
    );
    final ds = _checkboxDs(
      boxSizeM: '20px',
      roleBold: 'var(--Secondary-Bold)',
      strokeMedium: 'var(--Primary-Stroke-Medium)',
    );

    late Color borderOnPrimary;
    late Color borderOnSecondary;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: ds,
            child: Builder(
              builder: (context) {
                return Column(
                  children: [
                    OneUiSurface(
                      mode: 'bold',
                      appearance: 'primary',
                      child: Builder(
                        builder: (ctx) {
                          borderOnPrimary = resolveCheckboxPaint(
                            ctx,
                            ds,
                            state: resolveOneUiCheckboxState(isChecked: false),
                            pressed: false,
                            hovered: false,
                            roleAppearance: 'secondary',
                            uncheckedRoleAppearance:
                                resolveOneUiCheckboxUncheckedAppearance(
                              ctx,
                              readOnly: false,
                            ),
                          ).borderColor;
                          return const SizedBox();
                        },
                      ),
                    ),
                    OneUiSurface(
                      mode: 'bold',
                      appearance: 'secondary',
                      child: Builder(
                        builder: (ctx) {
                          borderOnSecondary = resolveCheckboxPaint(
                            ctx,
                            ds,
                            state: resolveOneUiCheckboxState(isChecked: false),
                            pressed: false,
                            hovered: false,
                            roleAppearance: 'secondary',
                            uncheckedRoleAppearance:
                                resolveOneUiCheckboxUncheckedAppearance(
                              ctx,
                              readOnly: false,
                            ),
                          ).borderColor;
                          return const SizedBox();
                        },
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(borderOnPrimary, isNot(equals(borderOnSecondary)));
  });

  testWidgets('readOnly checkbox stays enabled in semantics but cannot toggle',
      (tester) async {
    await tester.pumpWidget(
      _harness(
        brandHash: 'cb-ro',
        ds: _checkboxDs(boxSizeM: '20px', roleBold: '#000'),
        child: OneUiCheckbox(
          label: 'Locked',
          readOnly: true,
          defaultChecked: false,
        ),
      ),
    );
    await tester.pumpAndSettle();

    final handle = tester.ensureSemantics();
    try {
      final node = tester.getSemantics(find.text('Locked'));
      expect(node.hasFlag(SemanticsFlag.isChecked), isFalse);
      expect(node.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
      expect(node.hasFlag(SemanticsFlag.isEnabled), isTrue);
    } finally {
      handle.dispose();
    }

    await tester.tap(find.text('Locked'));
    await tester.pump();
    final handle2 = tester.ensureSemantics();
    try {
      expect(
        tester
            .getSemantics(find.text('Locked'))
            .hasFlag(SemanticsFlag.isChecked),
        isFalse,
      );
    } finally {
      handle2.dispose();
    }
  });
}
