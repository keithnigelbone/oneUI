/// LPI a11y resolver unit tests.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_types.dart';

void main() {
  group('[a11y] resolveOneUiLinearProgressIndicatorSemantics', () {
    test('[a11y] indeterminate is busy with no value', () {
      final state = resolveOneUiLinearProgressIndicatorState(
        type: 'indeterminate',
      );
      final a11y = resolveOneUiLinearProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Loading',
      );
      expect(a11y.isBusy, isTrue);
      expect(a11y.valueNow, isNull);
    });

    test('[a11y] determinate exposes valueNow', () {
      final state = resolveOneUiLinearProgressIndicatorState(value: 75);
      final a11y = resolveOneUiLinearProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Task',
      );
      expect(a11y.isBusy, isFalse);
      expect(a11y.valueNow, 75);
    });

    test('[a11y] ariaHidden excludes semantics', () {
      final a11y = resolveOneUiLinearProgressIndicatorSemantics(
        state: resolveOneUiLinearProgressIndicatorState(value: 10),
        semanticsLabel: 'X',
        ariaHidden: true,
      );
      expect(a11y.excludeSemantics, isTrue);
    });

    test('[a11y] live region for polite/assertive', () {
      expect(resolveLpiSemanticsLiveRegion('polite'), isTrue);
      expect(resolveLpiSemanticsLiveRegion('assertive'), isTrue);
      expect(resolveLpiSemanticsLiveRegion(null), isFalse);
    });

    test('[a11y] forwards semanticsLabelledBy as labelledBy', () {
      final state = resolveOneUiLinearProgressIndicatorState(value: 10);
      final a11y = resolveOneUiLinearProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Upload',
        semanticsLabelledBy: 'upload-status-label',
      );
      expect(a11y.labelledBy, 'upload-status-label');
      expect(a11y.label, 'Upload');
    });

    test('[a11y] semanticsLabelledBy wins over semanticsDescribedBy', () {
      final state = resolveOneUiLinearProgressIndicatorState(value: 10);
      final a11y = resolveOneUiLinearProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Task',
        semanticsLabelledBy: 'caption-id',
        semanticsDescribedBy: 'desc-id',
      );
      expect(a11y.labelledBy, 'caption-id');
      expect(a11y.describedBy, 'desc-id');
    });

    test('[a11y] semanticsDescribedBy is separate from labelledBy', () {
      final state = resolveOneUiLinearProgressIndicatorState(value: 10);
      final a11y = resolveOneUiLinearProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Task',
        semanticsDescribedBy: 'desc-id',
      );
      expect(a11y.labelledBy, isNull);
      expect(a11y.describedBy, 'desc-id');
    });

    test('[a11y] passes semanticsHint through unchanged', () {
      final state = resolveOneUiLinearProgressIndicatorState(value: 25);
      final a11y = resolveOneUiLinearProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Task',
        semanticsHint: 'Please wait',
      );
      expect(a11y.hint, 'Please wait');
    });
  });
}
