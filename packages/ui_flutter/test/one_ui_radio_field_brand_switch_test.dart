import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

NativeDesignSystemPayload _radioFieldDs({
  required String boxSizeM,
  required String fieldGap,
}) {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Stroke-M': '1px',
      '--Stroke-XL': '2px',
      '--Focus-Outline-Width': '2px',
      '--Disabled-Opacity': '0.5',
      '--Radio-boxSize-m': boxSizeM,
      '--Radio-dotSize-m': '10px',
      '--Radio-roleBold': 'var(--Secondary-Bold)',
      '--Radio-roleBoldHigh': 'var(--Secondary-Bold-TintedA11y)',
      '--Radio-roleStrokeMedium': 'var(--Secondary-Stroke-Medium)',
      '--RadioField-gap': fieldGap,
      '--RadioField-singleColumnGap': '8px',
      '--RadioField-singleRowGap': '8px',
      '--InputLabel-stackGap': '8px',
      '--Spacing-0-5': '4px',
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
      'secondary':
          buildScaleDefinition('secondary', buildGreyscalePalette(), 1300),
      'neutral': buildScaleDefinition('neutral', buildGreyscalePalette(), 1300),
      'negative': buildScaleDefinition('negative', buildColoredPalette(), 600),
    },
  );
}

Widget _harness({
  required NativeDesignSystemPayload ds,
  required String brandHash,
  required Widget child,
}) {
  final root = buildRootSurfaceContext(
    themeConfig: _theme(),
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
  testWidgets('RadioField repaints when brand tokens change', (tester) async {
    await tester.pumpWidget(
      _harness(
        brandHash: 'rf-brand-a',
        ds: _radioFieldDs(boxSizeM: '20px', fieldGap: '6px'),
        child: OneUiRadioField(
          label: 'Contact',
          defaultValue: 'email',
          children: [
            OneUiRadio(value: 'email', label: 'Email'),
            OneUiRadio(value: 'sms', label: 'SMS'),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();
    final boxA = tester.getSize(find.byType(AnimatedContainer).first);

    await tester.pumpWidget(
      _harness(
        brandHash: 'rf-brand-b',
        ds: _radioFieldDs(boxSizeM: '28px', fieldGap: '12px'),
        child: OneUiRadioField(
          key: const ValueKey('rf-brand-b-field'),
          label: 'Contact',
          defaultValue: 'email',
          children: [
            OneUiRadio(value: 'email', label: 'Email'),
            OneUiRadio(value: 'sms', label: 'SMS'),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();
    final boxB = tester.getSize(find.byType(AnimatedContainer).first);

    expect(boxA.width, 20);
    expect(boxB.width, 28);
  });

  testWidgets('multi RadioField radio size follows brand tokens',
      (tester) async {
    await tester.pumpWidget(
      _harness(
        brandHash: 'rf-size-a',
        ds: _radioFieldDs(boxSizeM: '18px', fieldGap: '6px'),
        child: OneUiRadioField(
          label: 'Pick',
          defaultValue: 'a',
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();
    final wA = tester.getSize(find.byType(AnimatedContainer).first).width;

    await tester.pumpWidget(
      _harness(
        brandHash: 'rf-size-b',
        ds: _radioFieldDs(boxSizeM: '26px', fieldGap: '6px'),
        child: OneUiRadioField(
          key: const ValueKey('rf-size-b'),
          label: 'Pick',
          defaultValue: 'a',
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();
    final wB = tester.getSize(find.byType(AnimatedContainer).first).width;
    expect(wA, 18);
    expect(wB, 26);
  });
}
