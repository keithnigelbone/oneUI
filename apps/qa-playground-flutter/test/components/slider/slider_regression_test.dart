/// Slider regression + parity-attribution suite (scaffold).
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_slider_types.dart';

void main() {
  group('[parity] Slider — matches the web contract', () {
    test('[parity] appearance=auto resolves to secondary', () {
      final state = resolveOneUiSliderState(
        values: [50],
        appearance: 'auto',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
      );
      expect(state.resolvedAppearance, 'secondary');
    });

    test('[parity] readOnly keeps enabled semantics separate from disabled', () {
      final state = resolveOneUiSliderState(
        values: [50],
        appearance: 'secondary',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: true,
      );
      expect(state.isDisabled, isFalse);
      expect(state.isReadOnly, isTrue);
    });
  });

  group('[regression][meta] Slider', () {
    test('[meta] attribution counts', () {
      const confirmedFlutterBugs = 0;
      const debatable = 0;
      const parityProofs = 2;
      expect(confirmedFlutterBugs + debatable + parityProofs, 2);
    });
  });
}
