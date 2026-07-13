/// TouchSlider platform-specific QA tests.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import '../../support/components/touch_slider_harness.dart';

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
  group('[platform][mobile] TouchSlider', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] slider role + value string',
        (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(defaultValue: 44, ariaLabel: 'Level'),
      );
      withSemanticsHandle(tester, () {
        final data = touchSliderSemanticsData(tester, 'Level');
        expect(data.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(data.value, anyOf('44', '44.0'));
      });
    });
  });

  group('[platform][web-desktop] TouchSlider', () {
    _onPlatforms(_kWebDesktopPlatforms, '[desktop] slider role + value string',
        (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(defaultValue: 77, ariaLabel: 'Gain'),
      );
      withSemanticsHandle(tester, () {
        final data = touchSliderSemanticsData(tester, 'Gain');
        expect(data.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(data.value, anyOf('77', '77.0'));
      });
    });
  });
}
