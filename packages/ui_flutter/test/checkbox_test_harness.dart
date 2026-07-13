/// Shared harness for [OneUiCheckbox] / [OneUiCheckboxField] tests.
library;

import 'input_field_test_harness.dart';

export 'input_field_test_harness.dart'
    show
        inputFieldTestDesignSystem,
        pumpInputFieldApp,
        testWidgetsAllPlatforms,
        kOneUiInputFieldTestPlatforms;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/one_ui_brand_scope.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

import 'input_field_test_harness.dart' show inputFieldTestTypography;

NativeDesignSystemPayload checkboxTestDesignSystem() {
  final base = inputFieldTestDesignSystem();
  final merged = Map<String, dynamic>.from(base.componentCustomProperties)
    ..addAll({
      '--Checkbox-boxSize-s': '16px',
      '--Checkbox-boxSize-m': '20px',
      '--Checkbox-boxSize-l': '24px',
      '--Checkbox-iconSize-s': '12px',
      '--Checkbox-iconSize-m': '16px',
      '--Checkbox-iconSize-l': '18px',
      '--Checkbox-borderRadius-s': '4px',
      '--Checkbox-borderRadius-m': '6px',
      '--Checkbox-borderRadius-l': '8px',
      '--CheckboxField-gap': '6px',
      '--CheckboxField-singleColumnGap': '4px',
      '--CheckboxField-singleRowGap': '4px',
      '--Checkbox-roleBold': 'var(--Secondary-Bold)',
      '--Checkbox-roleBoldHigh': 'var(--Secondary-Bold-TintedA11y)',
      '--Checkbox-roleStrokeMedium': 'var(--Secondary-Stroke-Medium)',
    });
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': merged,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': base.activeDimensionContext,
  })!;
}

ThemeConfig checkboxStoryTestThemeConfig() {
  final grey = buildGreyscalePalette();
  final accent = buildColoredPalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ])
        role: buildScaleDefinition(
          role,
          role == 'primary' || role == 'sparkle' ? accent : grey,
          role == 'primary' ? 600 : 1300,
          anchorBoldToBaseStep: role == 'brand-bg' || role == 'primary',
        ),
    },
  );
}

/// Full-size shell for Checkbox Storybook pages (Default / Motion use [Expanded]).
Widget pumpCheckboxStoryApp(
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  String brandHash = 'checkbox-story-brand',
}) {
  final ds = designSystem ?? checkboxTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: checkboxStoryTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );

  return OneUiBrandLoadState(
    loading: false,
    snapshot: null,
    brandOverview: {'brandHash': brandHash},
    child: OneUiScope(
      platformId: 'S',
      density: 'default',
      nativeTypography: inputFieldTestTypography(),
      designSystem: ds,
      child: OneUiSurfaceScope(
        value: surface,
        child: MaterialApp(
          home: Scaffold(
            body: SizedBox.expand(child: child),
          ),
        ),
      ),
    ),
  );
}

Future<void> pumpCheckboxStoryHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    pumpCheckboxStoryApp(child, designSystem: designSystem),
  );
  await tester.pumpAndSettle();
}

Future<void> pumpCheckboxHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    pumpInputFieldApp(
      child,
      designSystem: designSystem ?? checkboxTestDesignSystem(),
    ),
  );
  await tester.pumpAndSettle();
}

Finder checkboxSemanticsLabel(String label) {
  return find.descendant(
    of: find.byType(OneUiCheckbox),
    matching: find.byWidgetPredicate((widget) {
      if (widget is! Semantics) return false;
      final props = widget.properties;
      final isCheckbox = props.checked != null || props.mixed == true;
      return isCheckbox && props.label == label;
    }),
  );
}

Finder checkboxFieldSemanticsLabel(String label) {
  return find.descendant(
    of: find.byType(OneUiCheckboxField),
    matching: find.bySemanticsLabel(label),
  );
}

void withSemanticsHandle(
  WidgetTester tester,
  void Function() body,
) {
  final handle = tester.ensureSemantics();
  try {
    body();
  } finally {
    handle.dispose();
  }
}

Finder _checkboxControlSemanticsFinder({String? label}) {
  return find.descendant(
    of: find.byType(OneUiCheckbox),
    matching: find.byWidgetPredicate((widget) {
      if (widget is! Semantics) return false;
      final props = widget.properties;
      final isCheckbox = props.checked != null || props.mixed == true;
      if (!isCheckbox) return false;
      if (label == null) return true;
      return props.label == label;
    }),
  );
}

/// Semantics node for [OneUiCheckbox] with [label] (web `role=checkbox` / RN `accessibilityRole`).
SemanticsData checkboxSemanticsData(
  WidgetTester tester,
  String label, {
  bool? checked,
}) {
  final scoped = checkboxSemanticsLabel(label);
  final candidates = scoped.evaluate().isNotEmpty
      ? scoped
      : _checkboxControlSemanticsFinder(label: label);
  expect(candidates, findsWidgets);

  for (var i = 0; i < candidates.evaluate().length; i++) {
    final data = tester.getSemantics(candidates.at(i)).getSemanticsData();
    if (checked == null) return data;
    if (!data.hasFlag(SemanticsFlag.hasCheckedState)) continue;
    if (data.hasFlag(SemanticsFlag.isChecked) == checked) return data;
  }
  fail('No checkbox semantics for "$label" with checked=$checked');
}

void expectCheckboxChecked(
  WidgetTester tester,
  String label, {
  required bool checked,
}) {
  withSemanticsHandle(tester, () {
    final data = checkboxSemanticsData(tester, label, checked: checked);
    expect(data.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isChecked), checked);
    expect(data.hasFlag(SemanticsFlag.isCheckStateMixed), isFalse);
  });
}

void expectCheckboxMixed(WidgetTester tester, String label) {
  withSemanticsHandle(tester, () {
    final data = checkboxSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isChecked), isFalse);
    expect(data.hasFlag(SemanticsFlag.isCheckStateMixed), isTrue);
  });
}

void expectCheckboxDisabled(WidgetTester tester, String label) {
  withSemanticsHandle(tester, () {
    final data = checkboxSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
  });
}

void expectCheckboxReadOnlyEnabled(WidgetTester tester, String label) {
  withSemanticsHandle(tester, () {
    final data = checkboxSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
  });
}

/// Border colour on the token-backed checkbox box (`AnimatedContainer`).
Color? checkboxBoxBorderColor(WidgetTester tester, {int index = 0}) {
  final containers = find.byType(AnimatedContainer);
  expect(containers, findsWidgets);
  final widget = tester.widget<AnimatedContainer>(containers.at(index));
  final decoration = widget.decoration;
  if (decoration is! BoxDecoration) return null;
  final border = decoration.border;
  if (border is! Border) return null;
  return border.top.color;
}
