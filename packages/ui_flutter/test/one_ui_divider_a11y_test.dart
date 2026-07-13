/// Divider accessibility unit tests — parity with RN `dividerA11y.test.ts`
/// and web `role="separator"` / `aria-orientation` contract.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_divider_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_divider_types.dart';

void main() {
  group('resolveOneUiDividerSemantics — RN getDividerAccessibilityProps', () {
    test('exposes vertical orientation and accessibilityHint', () {
      final a11y = resolveOneUiDividerSemantics(
        orientation: kOneUiDividerVertical,
        accessibilityHint: 'Section break',
      );
      expect(a11y.orientation, kOneUiDividerVertical);
      expect(a11y.hint, 'Section break');
    });

    test('maps horizontal orientation when hint is omitted', () {
      final a11y = resolveOneUiDividerSemantics(
        orientation: kOneUiDividerHorizontal,
      );
      expect(a11y.orientation, kOneUiDividerHorizontal);
      expect(a11y.hint, isNull);
    });

    test('prefers semanticsHint over accessibilityHint', () {
      final a11y = resolveOneUiDividerSemantics(
        orientation: kOneUiDividerHorizontal,
        semanticsHint: 'Primary hint',
        accessibilityHint: 'Secondary hint',
      );
      expect(a11y.hint, 'Primary hint');
    });

    test('falls back to accessibilityHint when semanticsHint is blank', () {
      final a11y = resolveOneUiDividerSemantics(
        orientation: kOneUiDividerHorizontal,
        semanticsHint: '   ',
        accessibilityHint: 'Fallback hint',
      );
      expect(a11y.hint, 'Fallback hint');
    });

    test('omits hint when both hint props are blank', () {
      expect(
        resolveOneUiDividerSemantics(
          orientation: kOneUiDividerVertical,
          semanticsHint: '',
          accessibilityHint: '  ',
        ).hint,
        isNull,
      );
    });
  });

  group('kOneUiDividerLineExcludeFromSemantics — RN DIVIDER_LINE_A11Y', () {
    test('line segments are excluded from the accessibility tree', () {
      // RN: accessible=false, accessibilityElementsHidden=true, aria-hidden=true
      expect(kOneUiDividerLineExcludeFromSemantics, isTrue);
    });
  });
}
