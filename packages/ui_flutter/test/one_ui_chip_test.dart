import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/chip_slot_kind.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_chip_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_chip_types.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

Widget _chipContextHarness({
  required Widget child,
  String surfaceAppearance = 'secondary',
}) {
  final surface = buildRootSurfaceContext(
    themeConfig: buildStorybookDemoThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return OneUiSurfaceScope(
    value: surface,
    child: OneUiSurface(
      mode: 'subtle',
      appearance: surfaceAppearance,
      child: child,
    ),
  );
}

void main() {
  group('one_ui_chip_types — Chip.shared.ts parity', () {
    test('attention maps to variant', () {
      expect(kChipAttentionToVariant['high'], 'bold');
      expect(kChipAttentionToVariant['medium'], 'subtle');
      expect(kChipAttentionToVariant['low'], 'ghost');
    });

    test('resolveOneUiChipState prefers explicit variant over attention', () {
      final s = resolveOneUiChipState(
        attention: 'low',
        variant: 'bold',
      );
      expect(s.resolvedVariant, 'bold');
    });

    test('defaults variant to bold when unset', () {
      expect(resolveOneUiChipState().resolvedVariant, 'bold');
    });

    test('defaults size to m when unset', () {
      expect(resolveOneUiChipState().size, 'm');
    });

    test('invalid size falls back to m', () {
      expect(resolveChipSize('xl'), 'm');
      expect(resolveOneUiChipState(size: 'xl').size, 'm');
    });

    test('size aliases resolve', () {
      expect(resolveChipSize('small'), 's');
      expect(resolveChipSize('large'), 'l');
    });

    test('inherits group size when chip size is empty', () {
      expect(resolveOneUiChipState(size: '', groupSize: 's').size, 's');
      expect(resolveOneUiChipState(size: '', groupSize: 'l').size, 'l');
    });

    test('explicit chip size wins over group', () {
      expect(resolveOneUiChipState(size: 'l', groupSize: 's').size, 'l');
    });

    test('defaults appearance to secondary when auto', () {
      expect(
        resolveOneUiChipState(appearance: 'auto').resolvedAppearance,
        'secondary',
      );
    });

    test('unset appearance inherits group then resolves', () {
      expect(
        resolveOneUiChipState(groupAppearance: 'primary').resolvedAppearance,
        'primary',
      );
    });

    test('explicit auto ignores group appearance', () {
      expect(
        resolveOneUiChipState(
          appearance: 'auto',
          groupAppearance: 'primary',
        ).resolvedAppearance,
        'secondary',
      );
    });

    test('explicit appearance wins over auto', () {
      expect(
        resolveOneUiChipState(appearance: 'negative').resolvedAppearance,
        'negative',
      );
    });

    test('unselected appearance defaults to neutral', () {
      expect(resolveOneUiChipState().unselectedAppearance, 'neutral');
    });

    test('Figma sizes and appearances', () {
      expect(kOneUiChipFigmaSizes, ['s', 'm', 'l']);
      expect(kOneUiChipAppearances, contains('auto'));
      expect(kOneUiChipAppearances, contains('warning'));
      expect(kOneUiChipAppearances, isNot(contains('sparkle')));
    });

    test('chipSlotIconSizeForChip matches web showcase', () {
      expect(chipSlotIconSizeForChip('s'), '3');
      expect(chipSlotIconSizeForChip('m'), '4');
      expect(chipSlotIconSizeForChip('l'), '5');
    });

    test(
        'chipRoleAppearanceForTokens uses resolved appearance (web Secondary default)',
        () {
      expect(
        chipRoleAppearanceForTokens(
          appearanceProp: 'auto',
          resolvedAppearance: 'secondary',
        ),
        'secondary',
      );
      expect(
        chipRoleAppearanceForTokens(
          appearanceProp: 'primary',
          resolvedAppearance: 'primary',
        ),
        'primary',
      );
    });

    test('chipSlotSurfaceMode only when selected bold/subtle', () {
      expect(
        chipSlotSurfaceMode(selected: false, variant: 'bold'),
        isNull,
      );
      expect(chipSlotSurfaceMode(selected: true, variant: 'bold'), 'bold');
      expect(chipSlotSurfaceMode(selected: true, variant: 'subtle'), 'subtle');
      expect(chipSlotSurfaceMode(selected: true, variant: 'ghost'), isNull);
    });
  });

  group('oneUiChipDataAttrs — Chip.test.tsx parity', () {
    test('encodes size variant appearance and unselected role', () {
      final attrs = oneUiChipDataAttrs(
        resolvedSize: 'm',
        resolvedVariant: 'bold',
        resolvedAppearance: 'negative',
        unselectedAppearance: 'neutral',
        isSelected: false,
      );
      expect(attrs['data-size'], 'm');
      expect(attrs['data-variant'], 'bold');
      expect(attrs['data-appearance'], 'negative');
      expect(attrs['data-unselected-appearance'], 'neutral');
      expect(attrs.containsKey('data-pressed'), isFalse);
    });

    test('selected adds data-pressed like Base UI Toggle', () {
      final attrs = oneUiChipDataAttrs(
        resolvedSize: 's',
        resolvedVariant: 'subtle',
        resolvedAppearance: 'secondary',
        unselectedAppearance: 'neutral',
        isSelected: true,
      );
      expect(attrs.containsKey('data-pressed'), isTrue);
    });

    test('disabled adds data-disabled', () {
      final attrs = oneUiChipDataAttrs(
        resolvedSize: 'l',
        resolvedVariant: 'ghost',
        resolvedAppearance: 'primary',
        unselectedAppearance: 'neutral',
        isSelected: false,
        isDisabled: true,
      );
      expect(attrs.containsKey('data-disabled'), isTrue);
    });

    test('dataPayloadKey mirrors web QA harness format', () {
      final key = oneUiChipDataPayloadKey(
        oneUiChipDataAttrs(
          resolvedSize: 'm',
          resolvedVariant: 'bold',
          resolvedAppearance: 'secondary',
          unselectedAppearance: 'neutral',
          isSelected: true,
        ),
      );
      expect(key, startsWith('oneui-chip'));
      expect(key, contains('data-size=m'));
      expect(key, contains('data-variant=bold'));
      expect(key, contains('data-pressed'));
    });

    test('resolveOneUiChipState embeds dataAttrs on state', () {
      final s = resolveOneUiChipState(
        attention: 'high',
        appearance: 'negative',
        isSelected: true,
      );
      expect(s.dataAttrs['data-variant'], 'bold');
      expect(s.dataAttrs['data-appearance'], 'negative');
      expect(s.dataAttrs.containsKey('data-pressed'), isTrue);
      expect(s.dataPayloadKey, contains('oneui-chip'));
    });
  });

  group('resolveOneUiChipStateInContext — surface inheritance', () {
    testWidgets('auto resolves to parent surface appearance', (tester) async {
      late OneUiChipState captured;
      await tester.pumpWidget(
        _chipContextHarness(
          child: Builder(
            builder: (ctx) {
              captured = resolveOneUiChipStateInContext(
                ctx,
                appearance: 'auto',
              );
              return const SizedBox();
            },
          ),
        ),
      );
      expect(captured.resolvedAppearance, 'secondary');
      expect(captured.unselectedAppearance, 'secondary');
      expect(captured.dataAttrs['data-unselected-appearance'], 'secondary');
    });

    testWidgets('unset appearance inherits group on surface', (tester) async {
      late OneUiChipState captured;
      await tester.pumpWidget(
        _chipContextHarness(
          child: Builder(
            builder: (ctx) {
              captured = resolveOneUiChipStateInContext(
                ctx,
                groupAppearance: 'primary',
              );
              return const SizedBox();
            },
          ),
        ),
      );
      expect(captured.resolvedAppearance, 'primary');
    });
  });

  group('chip_slot_kind — affordance vs badge', () {
    test('classifies counter and indicator as badge', () {
      expect(
          classifyChipSlot(const OneUiCounterBadge(value: 1)), kChipSlotBadge);
      expect(
        classifyChipSlot(const OneUiIndicatorBadge(semanticsLabel: 'dot')),
        kChipSlotBadge,
      );
    });

    test('classifies generic widgets as affordance', () {
      expect(classifyChipSlot(const Text('x')), kChipSlotAffordance);
      expect(classifyChipSlot(null), kChipSlotNone);
    });
  });

  group('one_ui_chip_a11y — ChipA11y.test.ts parity', () {
    test('maps semanticsLabel to accessible label', () {
      final s = resolveOneUiChipSemantics(
        semanticsLabel: 'Filter chip',
        child: 'Filter',
        selected: false,
        disabled: false,
      );
      expect(s.label, 'Filter chip');
      expect(s.selected, isFalse);
      expect(s.enabled, isTrue);
    });

    test('falls back to child text then Chip', () {
      expect(
        resolveOneUiChipSemantics(
                child: 'Tags', selected: true, disabled: false)
            .label,
        'Tags',
      );
      expect(
        resolveOneUiChipSemantics(selected: false, disabled: false).label,
        'Chip',
      );
    });

    test('disabled sets enabled false', () {
      final s = resolveOneUiChipSemantics(
        semanticsLabel: 'x',
        selected: true,
        disabled: true,
      );
      expect(s.enabled, isFalse);
      expect(s.selected, isTrue);
    });
  });
}
