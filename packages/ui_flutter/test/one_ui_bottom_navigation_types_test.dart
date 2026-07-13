/// Pure-function parity — Figma API + RN/web `BottomNavigation.shared.ts`.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation_types.dart';

void main() {
  group('normalizeOneUiBottomNavLabelType — Figma BottomNav.label', () {
    test('maps Figma 1Line / 2Line / none', () {
      expect(normalizeOneUiBottomNavLabelType(kOneUiBottomNavFigmaLabel1Line),
          kOneUiBottomNavLabel1Line);
      expect(normalizeOneUiBottomNavLabelType(kOneUiBottomNavFigmaLabel2Line),
          kOneUiBottomNavLabel2Line);
      expect(
          normalizeOneUiBottomNavLabelType('none'), kOneUiBottomNavLabelNone);
    });

    test('maps Figma item type aliases', () {
      expect(
        normalizeOneUiBottomNavLabelType(kOneUiBottomNavItemTypeLabel1Line),
        kOneUiBottomNavLabel1Line,
      );
      expect(
        normalizeOneUiBottomNavLabelType(kOneUiBottomNavItemTypeLabel2Line),
        kOneUiBottomNavLabel2Line,
      );
      expect(
        normalizeOneUiBottomNavLabelType(kOneUiBottomNavItemTypeLabelFalse),
        kOneUiBottomNavLabelNone,
      );
    });

    test('defaults unknown values to 1line', () {
      expect(
          normalizeOneUiBottomNavLabelType('bogus'), kOneUiBottomNavLabel1Line);
      expect(normalizeOneUiBottomNavLabelType(null), kOneUiBottomNavLabel1Line);
    });
  });

  group('resolveOneUiBottomNavigationState — Figma BottomNav', () {
    test('defaults labelType to 1line and encodes item count', () {
      final state = resolveOneUiBottomNavigationState(itemCount: 3);
      expect(state.labelType, kOneUiBottomNavLabel1Line);
      expect(state.resolvedAppearance, 'primary');
      expect(state.dataAttrs, {
        'data-items': '3',
        'data-label-type': kOneUiBottomNavLabel1Line,
        'data-appearance': 'primary',
      });
      expect(state.dataPayloadKey, contains('data-items=3'));
    });

    test('accepts Figma 2Line label on parent', () {
      final state = resolveOneUiBottomNavigationState(
        labelType: kOneUiBottomNavFigmaLabel2Line,
        itemCount: 4,
      );
      expect(state.labelType, kOneUiBottomNavLabel2Line);
      expect(state.dataAttrs['data-label-type'], kOneUiBottomNavLabel2Line);
    });
  });

  group('resolveOneUiBottomNavItemState — Figma BottomNav.Item', () {
    test('explicit active wins over value matching', () {
      final state = resolveOneUiBottomNavItemState(
        active: true,
        value: 'search',
        parentValue: 'home',
        inNavigationGroup: true,
      );
      expect(state.isActive, isTrue);
      expect(state.dataAttrs.containsKey('data-active'), isTrue);
    });

    test('Figma type labelFalse hides labels via label type none', () {
      final state = resolveOneUiBottomNavItemState(
        type: kOneUiBottomNavItemTypeLabelFalse,
        parentLabelType: kOneUiBottomNavLabel1Line,
        inNavigationGroup: true,
      );
      expect(state.labelType, kOneUiBottomNavLabelNone);
      expect(state.dataAttrs['data-label-type'], kOneUiBottomNavLabelNone);
    });

    test('data-disabled when item disabled', () {
      final state = resolveOneUiBottomNavItemState(
        inNavigationGroup: true,
        disabled: true,
      );
      expect(state.dataAttrs.containsKey('data-disabled'), isTrue);
    });

    test('dataPayloadKey encodes item attrs', () {
      final state = resolveOneUiBottomNavItemState(
        type: kOneUiBottomNavItemTypeLabel1Line,
        appearance: 'secondary',
        active: true,
        inNavigationGroup: true,
      );
      expect(state.dataPayloadKey, contains('oneui-bottom-nav-item'));
      expect(state.dataPayloadKey, contains('data-appearance=secondary'));
    });
  });

  group('clampOneUiBottomNavChildren — RN clampBottomNavigationChildren', () {
    test('passes through up to five items unchanged', () {
      final items = List<Widget>.generate(
        kOneUiBottomNavMaxItems,
        (i) => Text('tab-$i', key: Key('tab-$i')),
      );
      final clamped = clampOneUiBottomNavChildren(items);
      expect(clamped, hasLength(kOneUiBottomNavMaxItems));
      expect((clamped.first as Text).data, 'tab-0');
      expect((clamped.last as Text).data, 'tab-4');
    });

    test('clamps six items to five', () {
      final items = List<Widget>.generate(6, (i) => Text('tab-$i'));
      final clamped = clampOneUiBottomNavChildren(items);
      expect(clamped, hasLength(kOneUiBottomNavMaxItems));
      expect((clamped.last as Text).data, 'tab-4');
      expect(clamped.any((w) => (w as Text).data == 'tab-5'), isFalse);
    });
  });

  group('resolveOneUiBottomNavItemActive — web BottomNavItem parity', () {
    test('explicit active wins over parent value inside navigation group', () {
      expect(
        resolveOneUiBottomNavItemActive(
          active: true,
          value: 'search',
          parentValue: 'home',
          inNavigationGroup: true,
        ),
        isTrue,
      );
      expect(
        resolveOneUiBottomNavItemActive(
          active: false,
          value: 'home',
          parentValue: 'home',
          inNavigationGroup: true,
        ),
        isFalse,
      );
    });

    test('value matching applies when active is unset', () {
      expect(
        resolveOneUiBottomNavItemActive(
          value: 'home',
          parentValue: 'home',
          inNavigationGroup: true,
        ),
        isTrue,
      );
      expect(
        resolveOneUiBottomNavItemActive(
          value: 'search',
          parentValue: 'home',
          inNavigationGroup: true,
        ),
        isFalse,
      );
    });

    test('BN-FN-002 padded values match with symmetric trim', () {
      expect(
        resolveOneUiBottomNavItemActive(
          value: ' home ',
          parentValue: 'home',
          inNavigationGroup: true,
        ),
        isTrue,
      );
      expect(
        resolveOneUiBottomNavItemActive(
          value: ' home ',
          parentValue: 'search',
          inNavigationGroup: true,
        ),
        isFalse,
      );
    });

    test('explicit active applies when parent has no selection', () {
      expect(
        resolveOneUiBottomNavItemActive(
          active: true,
          value: 'search',
          parentValue: null,
          inNavigationGroup: true,
        ),
        isTrue,
      );
      expect(
        resolveOneUiBottomNavItemActive(
          active: true,
          value: 'search',
          parentValue: '',
          inNavigationGroup: true,
        ),
        isTrue,
      );
    });

    test('resolveOneUiBottomNavigationAppearance maps auto to primary', () {
      expect(resolveOneUiBottomNavigationAppearance(null), 'primary');
      expect(resolveOneUiBottomNavigationAppearance('auto'), 'primary');
      expect(
        resolveOneUiBottomNavigationAppearance('auto',
            parentAppearance: 'secondary'),
        'secondary',
      );
      expect(resolveOneUiBottomNavigationAppearance('sparkle'), 'sparkle');
    });
  });

  group('kOneUiBottomNavFigmaItemCounts', () {
    test('lists 2 through 5', () {
      expect(kOneUiBottomNavFigmaItemCounts, [2, 3, 4, 5]);
    });
  });
}
