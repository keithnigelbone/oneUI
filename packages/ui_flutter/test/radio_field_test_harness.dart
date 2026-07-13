/// Shared harness for [OneUiRadioField] widget + semantics tests (web + mobile).
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

import 'input_field_test_harness.dart';

export 'input_field_test_harness.dart' show testWidgetsAllPlatforms;

NativeDesignSystemPayload radioFieldTestDesignSystem() {
  final base = inputFieldTestDesignSystem();
  final merged = Map<String, dynamic>.from(base.componentCustomProperties)
    ..addAll({
      '--RadioField-gap': '6px',
      '--RadioField-singleColumnGap': '4px',
      '--RadioField-singleRowGap': '4px',
      '--InputLabel-stackGap': '4px',
      '--InputLabel-labelIconGap': '4px',
      '--RadioGroup-verticalGap': '6px',
      '--RadioGroup-horizontalGap': '16px',
      '--Radio-boxSize-m': '20px',
      '--Radio-dotSize-m': '10px',
      '--Radio-borderRadius-m': '9999px',
      '--Radio-dotBorderRadius-m': '9999px',
      '--Radio-roleBold': 'var(--Secondary-Bold)',
      '--Radio-roleBoldHigh': 'var(--Secondary-Bold-TintedA11y)',
      '--Radio-roleStrokeMedium': 'var(--Secondary-Stroke-Medium)',
    });
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': merged,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': base.activeDimensionContext,
  })!;
}

Future<void> pumpRadioFieldHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    pumpInputFieldApp(
      child,
      designSystem: designSystem ?? radioFieldTestDesignSystem(),
    ),
  );
  await tester.pumpAndSettle();
}

/// Scoped to [OneUiRadioField] so field + option labels do not collide.
Finder radioFieldSemanticsLabel(String label) {
  return find.descendant(
    of: find.byType(OneUiRadioField),
    matching: find.bySemanticsLabel(label),
  );
}

SemanticsData radioSemanticsData(
  WidgetTester tester,
  String label, {
  bool? checked,
}) {
  final finder = radioFieldSemanticsLabel(label);
  expect(finder, findsWidgets);
  for (var i = 0; i < finder.evaluate().length; i++) {
    final data = tester.getSemantics(finder.at(i)).getSemanticsData();
    if (checked == null) return data;
    final hasChecked = data.hasFlag(SemanticsFlag.hasCheckedState);
    if (!hasChecked) continue;
    if (data.hasFlag(SemanticsFlag.isChecked) == checked) return data;
  }
  fail('No semantics node for "$label" with checked=$checked');
}

SemanticsData fieldLabelSemanticsData(WidgetTester tester, String label) {
  final finder = radioFieldSemanticsLabel(label);
  expect(finder, findsWidgets);
  return tester.getSemantics(finder.first).getSemanticsData();
}

SemanticsData? tryRadioSemanticsData(WidgetTester tester, String label) {
  final finder = radioFieldSemanticsLabel(label);
  if (finder.evaluate().isEmpty) return null;
  return tester.getSemantics(finder.first).getSemanticsData();
}

Finder radioGroupRoleFinder() {
  return find.descendant(
    of: find.byType(OneUiRadioField),
    matching: find.byWidgetPredicate(
      (w) => w is Semantics && w.properties.role == SemanticsRole.radioGroup,
    ),
  );
}

void expectRadioChecked(WidgetTester tester, String label,
    {required bool checked}) {
  final data = radioSemanticsData(tester, label, checked: checked);
  expect(data.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
  expect(data.hasFlag(SemanticsFlag.isChecked), checked);
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
