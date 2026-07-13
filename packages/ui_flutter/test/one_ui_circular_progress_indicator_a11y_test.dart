/// Pure a11y resolver — RN `CircularProgressIndicatorA11y.test.ts` parity.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator_types.dart';

void main() {
  group('RN parity — circularProgressIndicatorA11y', () {
    test('exposes busy=true when indeterminate (role=progressbar analogue)',
        () {
      final state = resolveOneUiCircularProgressIndicatorState(
        variant: 'indeterminate',
      );
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Loading',
      );
      expect(a11y.excludeSemantics, isFalse);
      expect(a11y.label, 'Loading');
      expect(a11y.isBusy, isTrue);
      expect(a11y.valueNow, isNull);
      expect(a11y.valueMin, isNull);
      expect(a11y.valueMax, isNull);
    });

    test('exposes valueMin/valueMax/valueNow on determinate', () {
      final state = resolveOneUiCircularProgressIndicatorState(value: 45);
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Upload',
        min: 0,
        max: 100,
      );
      expect(a11y.isBusy, isFalse);
      expect(a11y.valueMin, 0);
      expect(a11y.valueMax, 100);
      expect(a11y.valueNow, 45);
    });

    test('rounds the percentage for valueNow (33.4 → 33)', () {
      final state = resolveOneUiCircularProgressIndicatorState(value: 33.4);
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Progress',
      );
      expect(a11y.valueNow, 33);
    });

    test('forwards aria-labelledby as labelledBy', () {
      final state = resolveOneUiCircularProgressIndicatorState(value: 10);
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Bar',
        semanticsLabelledBy: 'caption',
      );
      expect(a11y.labelledBy, 'caption');
    });

    test('aria-describedby is separate from labelledBy', () {
      final state = resolveOneUiCircularProgressIndicatorState(value: 10);
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Bar',
        semanticsDescribedBy: 'desc',
      );
      expect(a11y.labelledBy, isNull);
      expect(a11y.describedBy, 'desc');
    });

    test('semanticsLabelledBy and semanticsDescribedBy are both forwarded', () {
      final state = resolveOneUiCircularProgressIndicatorState(value: 10);
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Bar',
        semanticsLabelledBy: 'caption',
        semanticsDescribedBy: 'desc',
      );
      expect(a11y.labelledBy, 'caption');
      expect(a11y.describedBy, 'desc');
    });

    test('maps aria-live polite/assertive to liveRegion', () {
      final state = resolveOneUiCircularProgressIndicatorState(value: 0);
      expect(
        resolveOneUiCircularProgressIndicatorSemantics(
          state: state,
          semanticsLabel: 'X',
          ariaLive: 'polite',
        ).liveRegion,
        isTrue,
      );
      expect(
        resolveOneUiCircularProgressIndicatorSemantics(
          state: state,
          semanticsLabel: 'X',
          ariaLive: 'assertive',
        ).liveRegion,
        isTrue,
      );
      expect(
        resolveOneUiCircularProgressIndicatorSemantics(
          state: state,
          semanticsLabel: 'X',
          ariaLive: 'off',
        ).liveRegion,
        isFalse,
      );
      expect(resolveCpiSemanticsLiveRegion('off'), isFalse);
      expect(resolveCpiSemanticsLiveRegion('polite'), isTrue);
    });

    test('hides subtree when aria-hidden=true', () {
      final state = resolveOneUiCircularProgressIndicatorState(value: 25);
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'X',
        ariaHidden: true,
      );
      expect(a11y.excludeSemantics, isTrue);
    });

    test('passes semanticsHint through unchanged', () {
      final state = resolveOneUiCircularProgressIndicatorState(value: 25);
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'X',
        semanticsHint: 'Downloading file',
      );
      expect(a11y.hint, 'Downloading file');
    });
  });
}
