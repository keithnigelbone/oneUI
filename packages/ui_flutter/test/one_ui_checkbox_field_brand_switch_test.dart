import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

NativeDesignSystemPayload _checkboxFieldDs({
  required String boxSizeM,
  required String fieldGap,
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
      '--Checkbox-roleBold': 'var(--Secondary-Bold)',
      '--Checkbox-roleBoldHigh': 'var(--Secondary-Bold-TintedA11y)',
      '--Checkbox-roleStrokeMedium': 'var(--Secondary-Stroke-Medium)',
      '--CheckboxField-gap': fieldGap,
      '--CheckboxField-singleColumnGap': '8px',
      '--CheckboxField-singleRowGap': '8px',
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
  testWidgets('CheckboxField repaints when brand tokens change',
      (tester) async {
    await tester.pumpWidget(
      _harness(
        brandHash: 'cbf-brand-a',
        ds: _checkboxFieldDs(boxSizeM: '20px', fieldGap: '6px'),
        child: OneUiCheckboxField(
          label: 'Topics',
          groupDefaultValue: const ['a'],
          children: [
            OneUiCheckbox(value: 'a', label: 'Alpha'),
            OneUiCheckbox(value: 'b', label: 'Beta'),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();
    final boxA = tester.getSize(find.byType(AnimatedContainer).first);

    await tester.pumpWidget(
      _harness(
        brandHash: 'cbf-brand-b',
        ds: _checkboxFieldDs(boxSizeM: '28px', fieldGap: '12px'),
        child: OneUiCheckboxField(
          key: const ValueKey('cbf-brand-b'),
          label: 'Topics',
          groupDefaultValue: const ['a'],
          children: [
            OneUiCheckbox(value: 'a', label: 'Alpha'),
            OneUiCheckbox(value: 'b', label: 'Beta'),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();
    final boxB = tester.getSize(find.byType(AnimatedContainer).first);

    expect(boxA.width, 20);
    expect(boxB.width, 28);
  });

  testWidgets(
      'integrated CheckboxField label typography survives brand hash change',
      (tester) async {
    await tester.pumpWidget(
      _harness(
        brandHash: 'cbf-label-a',
        ds: _checkboxFieldDs(boxSizeM: '20px', fieldGap: '6px'),
        child: const OneUiCheckboxField(label: 'Email updates'),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Email updates'), findsOneWidget);

    await tester.pumpWidget(
      _harness(
        brandHash: 'cbf-label-b',
        ds: _checkboxFieldDs(boxSizeM: '24px', fieldGap: '10px'),
        child: const OneUiCheckboxField(
          key: ValueKey('cbf-label-b'),
          label: 'Email updates',
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Email updates'), findsOneWidget);
    expect(tester.getSize(find.byType(AnimatedContainer).first).width, 24);
  });

  testWidgets('multi CheckboxField checkbox size follows brand tokens',
      (tester) async {
    await tester.pumpWidget(
      _harness(
        brandHash: 'cbf-size-a',
        ds: _checkboxFieldDs(boxSizeM: '18px', fieldGap: '6px'),
        child: OneUiCheckboxField(
          label: 'Pick',
          groupDefaultValue: const ['a'],
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();
    final wA = tester.getSize(find.byType(AnimatedContainer).first).width;

    await tester.pumpWidget(
      _harness(
        brandHash: 'cbf-size-b',
        ds: _checkboxFieldDs(boxSizeM: '26px', fieldGap: '6px'),
        child: OneUiCheckboxField(
          key: const ValueKey('cbf-size-b'),
          label: 'Pick',
          groupDefaultValue: const ['a'],
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();
    final wB = tester.getSize(find.byType(AnimatedContainer).first).width;
    expect(wA, 18);
    expect(wB, 26);
  });

  testWidgets('invalid integrated field keeps error chrome after brand switch',
      (tester) async {
    await tester.pumpWidget(
      _harness(
        brandHash: 'cbf-invalid-a',
        ds: _checkboxFieldDs(boxSizeM: '20px', fieldGap: '6px'),
        child: const OneUiCheckboxField(
          label: 'Verify',
          invalid: true,
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byType(AnimatedContainer), findsWidgets);

    await tester.pumpWidget(
      _harness(
        brandHash: 'cbf-invalid-b',
        ds: _checkboxFieldDs(boxSizeM: '24px', fieldGap: '10px'),
        child: const OneUiCheckboxField(
          key: ValueKey('cbf-invalid-b'),
          label: 'Verify',
          invalid: true,
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byType(AnimatedContainer), findsWidgets);
    expect(tester.getSize(find.byType(AnimatedContainer).first).width, 24);
  });
}
