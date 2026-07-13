/// Slider platform-specific QA tests.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';

import '../../support/components/slider_harness.dart';

const _kMobilePlatforms = [TargetPlatform.android, TargetPlatform.iOS];
const _kWebDesktopPlatforms = [TargetPlatform.linux, TargetPlatform.macOS];

void _onPlatforms(
  List<TargetPlatform> platforms,
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in platforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      debugDefaultTargetPlatformOverride = platform;
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  }
}

void main() {
  group('[platform][mobile] Slider', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] slider role + value string',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(defaultValue: 33, ariaLabel: 'Level'),
      );
      withSemanticsHandle(tester, () {
        final data = sliderSemanticsData(tester, 'Level');
        expect(data.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(data.value, anyOf('33', '33.0'));
      });
    });
  });

  group('[platform][web-desktop] Slider', () {
    _onPlatforms(_kWebDesktopPlatforms, '[desktop] slider role + value string',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(defaultValue: 66, ariaLabel: 'Gain'),
      );
      withSemanticsHandle(tester, () {
        final data = sliderSemanticsData(tester, 'Gain');
        expect(data.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(data.value, anyOf('66', '66.0'));
      });
    });
  });
}
