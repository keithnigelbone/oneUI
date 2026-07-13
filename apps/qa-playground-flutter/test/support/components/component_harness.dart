/// Shared harness for QA component widget tests — extends input-field shell with
/// token props needed by display/action components.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';

import '../pump_one_ui_app.dart';
import '../semantics_helpers.dart';
import '../test_widgets_all_platforms.dart';

export '../pump_one_ui_app.dart'
    show
        pumpOneUiQaApp,
        pumpOneUiQaHarness,
        qaInputFieldTestDesignSystem,
        kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

NativeDesignSystemPayload qaComponentTestDesignSystem() {
  final base = qaInputFieldTestDesignSystem();
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
      '--Radio-boxSize-m': '20px',
      '--Radio-dotSize-m': '10px',
      '--Radio-roleBold': 'var(--Secondary-Bold)',
      '--Radio-roleBoldHigh': 'var(--Secondary-Bold-TintedA11y)',
      '--Radio-roleStrokeMedium': 'var(--Secondary-Stroke-Medium)',
      '--Chip-borderRadius': '9999px',
      '--Chip-fontWeight': '500',
      '--Chip-borderWidth': '1px',
      '--Chip-height-s': '24px',
      '--Chip-height-m': '28px',
      '--Chip-height-l': '32px',
      '--Chip-paddingHorizontal-s': '8px',
      '--Chip-paddingHorizontal-m': '10px',
      '--Chip-paddingHorizontal-l': '12px',
      '--Chip-gap-s': '4px',
      '--Chip-gap-m': '4px',
      '--Chip-gap-l': '6px',
      '--Chip-fontSize-s': '12px',
      '--Chip-fontSize-m': '14px',
      '--Chip-fontSize-l': '16px',
      '--Chip-lineHeight-s': '17px',
      '--Chip-lineHeight-m': '20px',
      '--Chip-lineHeight-l': '22px',
      '--Badge-height-xs': '16px',
      '--Badge-height-s': '18px',
      '--Badge-height-m': '20px',
      '--Badge-height-l': '24px',
      '--Badge-height-xl': '28px',
      '--Badge-paddingHorizontal-m': '6px',
      '--Badge-gap-m': '4px',
      '--CounterBadge-height-xs': '12px',
      '--CounterBadge-height-s': '14px',
      '--CounterBadge-height-m': '16px',
      '--IndicatorBadge-size-s': '8px',
      '--IndicatorBadge-size-m': '10px',
      '--Avatar-size-2xs': '16px',
      '--Avatar-size-xs': '20px',
      '--Avatar-size-s': '32px',
      '--Avatar-size-m': '40px',
      '--Avatar-size-l': '48px',
      '--Avatar-size-xl': '64px',
      '--Avatar-size-2xl': '80px',
      '--Avatar-fontSize-m': '12px',
      '--Avatar-fontWeight': '500',
      '--Avatar-iconSize-s': '16px',
      '--Avatar-iconSize-m': '20px',
      '--Avatar-iconSize-l': '24px',
      '--Avatar-borderRadius': '9999px',
      '--CPI-size-s': '16px',
      '--CPI-size-m': '24px',
      '--CPI-size-l': '32px',
      '--CPI-strokeWidth-s': '2px',
      '--CPI-strokeWidth-m': '3px',
      '--CPI-strokeWidth-l': '4px',
      '--Motion-Duration-M': '200ms',
      '--Motion-Tap-Scale-Default': '3',
      '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.5, 0, 0.3, 1)',
    });

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': merged,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': base.activeDimensionContext,
  })!;
}

Future<void> pumpComponentQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  bool settle = true,
}) async {
  await tester.pumpWidget(
    pumpOneUiQaApp(
      child,
      designSystem: designSystem ?? qaComponentTestDesignSystem(),
    ),
  );
  if (settle) {
    await tester.pumpAndSettle();
  } else {
    await tester.pump();
  }
}

Future<void> ensureJioIconsLoaded() async {
  TestWidgetsFlutterBinding.ensureInitialized();
  await JioIconCatalog.instance.ensureLoaded();
}
