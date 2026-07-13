import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

NativeDesignSystemPayload _radioDs({
  required String boxSizeM,
  required String roleBold,
}) {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Stroke-M': '1px',
      '--Stroke-XL': '2px',
      '--Focus-Outline-Width': '2px',
      '--Disabled-Opacity': '0.5',
      '--Radio-boxSize-m': boxSizeM,
      '--Radio-dotSize-m': '10px',
      '--Radio-roleBold': roleBold,
      '--Radio-roleBoldHigh': 'var(--Primary-Bold-TintedA11y)',
      '--Radio-roleStrokeMedium': 'var(--Primary-Stroke-Medium)',
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
        brandHash: 'brand-a',
        ds: _radioDs(boxSizeM: '20px', roleBold: '#111111'),
        child: OneUiRadioGroup(
          value: 'x',
          children: [OneUiRadio(value: 'x')],
        ),
      ),
    );
    await tester.pumpAndSettle();

    final boxA = tester.getSize(find.byType(AnimatedContainer).first);
    expect(boxA.width, 20);

    await tester.pumpWidget(
      _harness(
        brandHash: 'brand-b',
        ds: _radioDs(boxSizeM: '24px', roleBold: '#222222'),
        child: OneUiRadioGroup(
          key: const ValueKey('brand-b-group'),
          value: 'x',
          children: [OneUiRadio(value: 'x')],
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
      final root = buildRootSurfaceContext(
        themeConfig: theme,
        rootParentStep: 2500,
        darkMode: false,
      );
      return _harness(
        brandHash: hash,
        themeConfig: theme,
        ds: _radioDs(boxSizeM: '20px', roleBold: 'var(--Secondary-Bold)'),
        child: OneUiRadioGroup(
          value: 'x',
          children: [OneUiRadio(value: 'x')],
        ),
      );
    }

    await tester
        .pumpWidget(build(theme: _themeWithSecondaryHue(600), hash: 'hue-a'));
    await tester.pumpAndSettle();
    final dotA = tester.widget<AnimatedContainer>(
      find.byType(AnimatedContainer).at(1),
    );
    final colorA = (dotA.decoration! as BoxDecoration).color;

    await tester
        .pumpWidget(build(theme: _themeWithSecondaryHue(1800), hash: 'hue-b'));
    await tester.pumpAndSettle();
    final dotB = tester.widget<AnimatedContainer>(
      find.byType(AnimatedContainer).at(1),
    );
    final colorB = (dotB.decoration! as BoxDecoration).color;

    expect(colorA, isNotNull);
    expect(colorB, isNotNull);
    expect(colorA, isNot(equals(colorB)));
  });

  testWidgets('readOnly radio stays enabled in semantics but cannot toggle',
      (tester) async {
    final root = buildRootSurfaceContext(
      themeConfig: _theme(),
      rootParentStep: 2500,
      darkMode: false,
    );
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: _radioDs(boxSizeM: '20px', roleBold: '#000'),
            child: OneUiRadioGroup(
              value: '',
              readOnly: true,
              children: [OneUiRadio(value: 'x', child: 'Option')],
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final handle = tester.ensureSemantics();
    try {
      final node = tester.getSemantics(find.text('Option'));
      expect(node.hasFlag(SemanticsFlag.isChecked), isFalse);
      expect(node.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
      expect(node.hasFlag(SemanticsFlag.isEnabled), isTrue);
    } finally {
      handle.dispose();
    }

    await tester.tap(find.text('Option'));
    await tester.pump();
    final handle2 = tester.ensureSemantics();
    try {
      expect(
        tester
            .getSemantics(find.text('Option'))
            .hasFlag(SemanticsFlag.isChecked),
        isFalse,
      );
    } finally {
      handle2.dispose();
    }
  });
}
