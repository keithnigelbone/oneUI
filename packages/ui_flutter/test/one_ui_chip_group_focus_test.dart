import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group_focus.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('OneUiChipGroupFocusController registry', () {
    test('focusableNodes excludes nodes that cannot request focus', () {
      final controller = OneUiChipGroupFocusController();
      final a = FocusNode();
      final b = FocusNode(canRequestFocus: false);
      final c = FocusNode();
      controller.register(a);
      controller.register(b);
      controller.register(c);

      expect(controller.focusableNodes, [a, c]);

      a.dispose();
      b.dispose();
      c.dispose();
      controller.dispose();
    });

    test('unregister removes node from traversal list', () {
      final controller = OneUiChipGroupFocusController();
      final a = FocusNode();
      final b = FocusNode();
      controller.register(a);
      controller.register(b);
      controller.unregister(a);

      expect(controller.focusableNodes, [b]);

      b.dispose();
      controller.dispose();
    });
  });

  group('chipGroupArrowShortcuts', () {
    test('horizontal LTR maps right to next', () {
      final controller = OneUiChipGroupFocusController(horizontal: true);
      final map = chipGroupArrowShortcuts(
        controller: controller,
        textDirection: TextDirection.ltr,
      );
      expect(
        map.keys,
        contains(
          isA<SingleActivator>().having(
            (SingleActivator a) => a.trigger,
            'trigger',
            LogicalKeyboardKey.arrowRight,
          ),
        ),
      );
    });

    test('vertical maps down to next', () {
      final controller = OneUiChipGroupFocusController(horizontal: false);
      final map = chipGroupArrowShortcuts(
        controller: controller,
        textDirection: TextDirection.ltr,
      );
      expect(
        map.keys,
        contains(
          isA<SingleActivator>().having(
            (SingleActivator a) => a.trigger,
            'trigger',
            LogicalKeyboardKey.arrowDown,
          ),
        ),
      );
    });

    test('disabled group exposes no shortcuts', () {
      final controller = OneUiChipGroupFocusController(enabled: false);
      expect(
        chipGroupArrowShortcuts(
          controller: controller,
          textDirection: TextDirection.ltr,
        ),
        isEmpty,
      );
    });
  });
}
