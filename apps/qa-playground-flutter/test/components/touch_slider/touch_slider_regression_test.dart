/// TouchSlider regression + parity-attribution suite (TSL- prefix scaffold).
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider_types.dart';

void main() {
  group('[parity] TouchSlider — matches the web contract', () {
    test('[parity] [TSL-PAR-001] readOnly is distinct from disabled (Figma + Slider)',
        () {
      // Figma states row + Slider parity: read-only stays focusable/announced.
      final state = resolveOneUiTouchSliderState(
        value: 50,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'horizontal',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: true,
      );
      expect(state.isDisabled, isFalse);
      expect(state.isReadOnly, isTrue);
    });

    test('[parity] [TSL-PAR-002] appearance=auto resolves to secondary', () {
      final state = resolveOneUiTouchSliderState(
        value: 50,
        min: 0,
        max: 100,
        appearance: 'auto',
        orientation: 'horizontal',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: false,
      );
      expect(state.resolvedAppearance, 'secondary');
    });
  });

  group('[regression][meta] TouchSlider', () {
    test('[meta] attribution counts', () {
      const confirmedFlutterBugs = 0;
      const debatable = 0;
      const parityProofs = 2;
      expect(confirmedFlutterBugs + debatable + parityProofs, 2);
    });
  });
}
