import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group_types.dart';

void main() {
  group('resolveOneUiChipGroupState — Figma API parity', () {
    test('Figma sizes and container types', () {
      expect(kOneUiChipGroupFigmaSizes, ['s', 'm', 'l']);
      expect(kOneUiChipGroupContainerTypes, ['inline', 'wrap']);
    });

    test('invalid size falls back to m', () {
      expect(resolveOneUiChipGroupState(size: 'xl').resolvedSize, 'm');
    });

    test('containerType inline disables wrap', () {
      expect(
        resolveOneUiChipGroupState(containerType: 'inline').wrap,
        isFalse,
      );
      expect(
        resolveOneUiChipGroupState(containerType: 'inline').containerType,
        'inline',
      );
    });

    test('containerType wrap enables wrap', () {
      expect(resolveOneUiChipGroupState(containerType: 'wrap').wrap, isTrue);
    });

    test('containerType takes precedence over wrap', () {
      expect(
        resolveOneUiChipGroupState(containerType: 'inline', wrap: true).wrap,
        isFalse,
      );
      expect(
        resolveOneUiChipGroupState(containerType: 'wrap', wrap: false).wrap,
        isTrue,
      );
    });

    test('wrap false maps to inline containerType', () {
      expect(
        resolveOneUiChipGroupState(wrap: false).containerType,
        'inline',
      );
    });

    test('dataAttrs encode size orientation containerType and wrap', () {
      final s = resolveOneUiChipGroupState(
        size: 'l',
        containerType: 'inline',
        orientation: 'vertical',
        disabled: true,
      );
      expect(s.dataAttrs['data-size'], 'l');
      expect(s.dataAttrs['data-orientation'], 'vertical');
      expect(s.dataAttrs['data-container-type'], 'inline');
      expect(s.dataAttrs['data-wrap'], 'false');
      expect(s.dataAttrs.containsKey('data-disabled'), isTrue);
      expect(s.dataPayloadKey, startsWith('oneui-chip-group'));
    });

    test('wrap mode omits data-wrap attribute', () {
      final s = resolveOneUiChipGroupState(containerType: 'wrap');
      expect(s.dataAttrs.containsKey('data-wrap'), isFalse);
      expect(s.dataAttrs['data-container-type'], 'wrap');
    });
  });

  group('computeNextChipGroupValues', () {
    test('single select replaces selection', () {
      expect(
        computeNextChipGroupValues(
            [], 'a', const OneUiChipGroupToggleOptions()),
        ['a'],
      );
      expect(
        computeNextChipGroupValues(
            ['a'], 'b', const OneUiChipGroupToggleOptions()),
        ['b'],
      );
    });

    test('single select clears when not required', () {
      expect(
        computeNextChipGroupValues(
            ['a'], 'a', const OneUiChipGroupToggleOptions()),
        [],
      );
    });

    test('required blocks empty selection', () {
      expect(
        computeNextChipGroupValues(
          ['a'],
          'a',
          const OneUiChipGroupToggleOptions(required: true),
        ),
        isNull,
      );
    });

    test('multiple toggles membership', () {
      expect(
        computeNextChipGroupValues(
          ['a'],
          'b',
          const OneUiChipGroupToggleOptions(multiple: true),
        ),
        ['a', 'b'],
      );
      expect(
        computeNextChipGroupValues(
          ['a', 'b'],
          'a',
          const OneUiChipGroupToggleOptions(multiple: true),
        ),
        ['b'],
      );
    });

    test('maxSelections caps adds', () {
      expect(
        computeNextChipGroupValues(
          ['a', 'b'],
          'c',
          const OneUiChipGroupToggleOptions(multiple: true, maxSelections: 2),
        ),
        isNull,
      );
    });
  });

  group('resolveOneUiChipGroupSemantics — ChipGroupA11y.test.ts', () {
    test('maps semanticsLabel to accessible group name', () {
      final p =
          resolveOneUiChipGroupSemantics(semanticsLabel: 'Category filter');
      expect(p.exposeGroup, isTrue);
      expect(p.label, 'Category filter');
    });

    test('is not exposed without a name', () {
      expect(resolveOneUiChipGroupSemantics().exposeGroup, isFalse);
    });

    test('maps accessibilityHint and disabled', () {
      final p = resolveOneUiChipGroupSemantics(
        semanticsLabel: 'Filters',
        accessibilityHint: 'Choose categories',
        disabled: true,
      );
      expect(p.hint, 'Choose categories');
      expect(p.disabled, isTrue);
    });

    test('aria-labelledby alias exposes group and forwards labelledBy', () {
      final p =
          resolveOneUiChipGroupSemantics(ariaLabelledBy: 'chip-group-title');
      expect(p.exposeGroup, isTrue);
      expect(p.labelledBy, 'chip-group-title');
    });

    test('semantics aliases mirror web aria-* and RN accessibilityHint', () {
      final p = getChipGroupAccessibilityProps(
        ariaLabel: 'Categories',
        accessibilityHint: 'Pick one or more',
      );
      expect(p.label, 'Categories');
      expect(p.hint, 'Pick one or more');
    });
  });
}
