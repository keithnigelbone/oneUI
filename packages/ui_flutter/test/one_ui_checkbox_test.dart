import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/checkbox_color_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/engine/checkbox_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/semantic_icon_material.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_group.dart';

import 'checkbox_test_harness.dart';

ThemeConfig _checkboxTestTheme() {
  return ThemeConfig(
    appearances: {
      'secondary':
          buildScaleDefinition('secondary', buildGreyscalePalette(), 1300),
      'primary': buildScaleDefinition('primary', buildColoredPalette(), 600),
      'neutral': buildScaleDefinition('neutral', buildGreyscalePalette(), 1300),
      'informative':
          buildScaleDefinition('informative', buildColoredPalette(), 600),
    },
  );
}

NativeDesignSystemPayload _ds() => checkboxTestDesignSystem();

void main() {
  group('resolveCheckboxSize — web Checkbox.shared.ts', () {
    test('aliases legacy names', () {
      expect(resolveCheckboxSize('small'), 's');
      expect(resolveCheckboxSize('large'), 'l');
      expect(resolveCheckboxSize('m'), 'm');
    });

    test('rejects unknown values to m', () {
      expect(resolveCheckboxSize('xl'), 'm');
      expect(resolveCheckboxSize('bogus'), 'm');
    });

    test('Figma API size row matches s/m/l', () {
      expect(kOneUiCheckboxSizes, ['s', 'm', 'l']);
    });
  });

  group('resolveCheckboxMetrics — spacing parity', () {
    testWidgets('group vertical gap defaults to Spacing-1-5', (tester) async {
      await tester.pumpWidget(
        pumpCheckboxStoryApp(
          Builder(
            builder: (context) {
              final m = resolveCheckboxMetrics(
                context,
                _ds(),
                size: 'm',
              );
              expect(m.groupVerticalGap, 6);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });
  });

  group('oneUiCheckboxDataAttrs — web Checkbox.tsx dataAttrs', () {
    test('checked vs unchecked vs indeterminate', () {
      expect(
        oneUiCheckboxDataAttrs(
          resolvedSize: 'm',
          resolvedAppearance: 'secondary',
          uncheckedAppearance: 'neutral',
          isReadOnly: false,
          isChecked: true,
          isIndeterminate: false,
        ),
        containsPair('data-checked', ''),
      );
      expect(
        oneUiCheckboxDataAttrs(
          resolvedSize: 'm',
          resolvedAppearance: 'secondary',
          uncheckedAppearance: 'neutral',
          isReadOnly: false,
          isChecked: false,
          isIndeterminate: false,
        ),
        containsPair('data-unchecked', ''),
      );
      expect(
        oneUiCheckboxDataAttrs(
          resolvedSize: 'm',
          resolvedAppearance: 'secondary',
          uncheckedAppearance: 'neutral',
          isReadOnly: false,
          isChecked: false,
          isIndeterminate: true,
        ),
        containsPair('data-indeterminate', ''),
      );
    });

    test('readOnly, unchecked-appearance, disabled, invalid attrs', () {
      final attrs = oneUiCheckboxDataAttrs(
        resolvedSize: 's',
        resolvedAppearance: 'primary',
        uncheckedAppearance: 'positive',
        isReadOnly: true,
        isChecked: false,
        isIndeterminate: false,
        isDisabled: true,
        errorHighlight: true,
      );
      expect(attrs['data-size'], 's');
      expect(attrs['data-appearance'], 'primary');
      expect(attrs['data-unchecked-appearance'], 'positive');
      expect(attrs.containsKey('data-readonly'), isTrue);
      expect(attrs.containsKey('data-disabled'), isTrue);
      expect(attrs.containsKey('data-invalid'), isTrue);
    });

    test('dataPayloadKey mirrors web QA harness format', () {
      final key = oneUiCheckboxDataPayloadKey(
        oneUiCheckboxDataAttrs(
          resolvedSize: 'l',
          resolvedAppearance: 'positive',
          uncheckedAppearance: 'primary',
          isReadOnly: false,
          isChecked: true,
          isIndeterminate: false,
        ),
      );
      expect(key, contains('oneui-checkbox'));
      expect(key, contains('data-size=l'));
      expect(key, contains('data-checked'));
    });
  });

  group(
      'resolveOneUiCheckboxUncheckedAppearance — web data-unchecked-appearance',
      () {
    testWidgets('neutral on page root', (tester) async {
      final theme = _checkboxTestTheme();
      final root = buildRootSurfaceContext(
        themeConfig: theme,
        rootParentStep: 2500,
        darkMode: false,
      );
      late String appearance;

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: Builder(
              builder: (context) {
                appearance = resolveOneUiCheckboxUncheckedAppearance(
                  context,
                  readOnly: false,
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      );

      expect(appearance, 'neutral');
    });

    testWidgets('readOnly forces neutral', (tester) async {
      final theme = _checkboxTestTheme();
      final root = buildRootSurfaceContext(
        themeConfig: theme,
        rootParentStep: 2500,
        darkMode: false,
      );
      late String appearance;

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: Builder(
              builder: (context) {
                appearance = resolveOneUiCheckboxUncheckedAppearance(
                  context,
                  readOnly: true,
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      );

      expect(appearance, 'neutral');
    });
  });

  group('resolveOneUiCheckboxState — RN useCheckboxState', () {
    test('auto maps to secondary', () {
      final state = resolveOneUiCheckboxState(
        appearance: 'auto',
        isChecked: true,
      );
      expect(state.resolvedAppearance, 'secondary');
    });

    test('indeterminate flag preserved', () {
      final state = resolveOneUiCheckboxState(
        isChecked: false,
        indeterminate: true,
      );
      expect(state.isIndeterminate, isTrue);
    });
  });

  group('getCheckboxAccessibilityProps — RN CheckboxA11y.test.ts', () {
    test('mixed when indeterminate', () {
      final a11y = getCheckboxAccessibilityProps(
        label: 'Select all',
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: true,
      );
      expect(a11y.checked, 'mixed');
    });

    test('label fallback from visible label', () {
      final a11y = getCheckboxAccessibilityProps(
        label: 'Accept terms',
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.label, 'Accept terms');
    });

    test('aria-hidden collapses exposure', () {
      final a11y = getCheckboxAccessibilityProps(
        label: 'Hidden',
        ariaHidden: true,
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
        isIndeterminate: false,
      );
      expect(a11y.hidden, isTrue);
      expect(a11y.exposeControl, isFalse);
    });
  });

  testWidgets('readOnly checked uses high fill not brand bold', (tester) async {
    final theme = _checkboxTestTheme();
    final root = buildRootSurfaceContext(
      themeConfig: theme,
      rootParentStep: 2500,
      darkMode: false,
    );
    final ds = _ds();

    late CheckboxResolvedPaint readOnlyChecked;
    late CheckboxResolvedPaint normalChecked;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: ds,
            child: Builder(
              builder: (context) {
                readOnlyChecked = resolveCheckboxPaint(
                  context,
                  ds,
                  state: resolveOneUiCheckboxState(
                    appearance: 'secondary',
                    readOnly: true,
                    isChecked: true,
                  ),
                  pressed: false,
                  hovered: false,
                  roleAppearance: 'secondary',
                  uncheckedRoleAppearance: 'neutral',
                );
                normalChecked = resolveCheckboxPaint(
                  context,
                  ds,
                  state: resolveOneUiCheckboxState(
                    appearance: 'secondary',
                    isChecked: true,
                  ),
                  pressed: false,
                  hovered: false,
                  roleAppearance: 'secondary',
                  uncheckedRoleAppearance: 'neutral',
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      ),
    );

    expect(
        readOnlyChecked.backgroundColor, isNot(normalChecked.backgroundColor));
  });

  group('OneUiCheckbox widget — web Checkbox.test.tsx parity', () {
    testWidgetsAllPlatforms('renders label and toggles on tap', (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Accept terms',
          checked: checked,
          onCheckedChange: (v) => checked = v,
        ),
      );

      expect(find.text('Accept terms'), findsOneWidget);
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    testWidgetsAllPlatforms('description renders beside control',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Subscribe',
          description: 'Weekly digest only.',
        ),
      );
      expect(find.text('Weekly digest only.'), findsOneWidget);
    });

    testWidgetsAllPlatforms('indeterminate shows filled box with minus glyph',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Select all',
          indeterminate: true,
        ),
      );

      expect(find.text('Select all'), findsOneWidget);
      expect(
        find.byWidgetPredicate(
          (w) => w is OneUiSemanticIcon && w.name == 'remove',
        ),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('indeterminate tap selects checked state',
        (tester) async {
      var checked = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Select all',
          indeterminate: true,
          onCheckedChange: (v) => checked = v,
        ),
      );
      await tester.tap(find.text('Select all'));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    testWidgetsAllPlatforms('disabled blocks toggle', (tester) async {
      var changed = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Disabled',
          disabled: true,
          onCheckedChange: (_) => changed = true,
        ),
      );

      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('selected/onSelectedChange RN aliases',
        (tester) async {
      var selected = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'RN alias',
          selected: selected,
          onSelectedChange: (v) => selected = v,
        ),
      );

      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(selected, isTrue);
    });

    testWidgetsAllPlatforms('readOnly blocks toggle', (tester) async {
      var changed = false;
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Read only',
          readOnly: true,
          defaultChecked: true,
          onCheckedChange: (_) => changed = true,
        ),
      );

      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('exposes data-* payload KeyedSubtree on root',
        (tester) async {
      await pumpCheckboxHarness(
        tester,
        OneUiCheckbox(
          label: 'Checkbox',
          appearance: 'primary',
          size: 'm',
          defaultChecked: true,
        ),
      );
      expect(
        find.byWidgetPredicate(
          (w) =>
              w is KeyedSubtree &&
              w.key is ValueKey<String> &&
              (w.key! as ValueKey<String>)
                  .value
                  .contains('oneui-checkbox|data-size=m'),
        ),
        findsOneWidget,
      );
    });
  });

  group('OneUiCheckboxGroup — web CheckboxGroup parity', () {
    testWidgetsAllPlatforms('multi-select toggles values', (tester) async {
      final values = <String>[];
      await pumpCheckboxHarness(
        tester,
        OneUiCheckboxGroup(
          defaultValue: const ['a'],
          onValueChange: (v) => values
            ..clear()
            ..addAll(v),
          children: [
            OneUiCheckbox(value: 'a', label: 'A'),
            OneUiCheckbox(value: 'b', label: 'B'),
          ],
        ),
      );

      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(values, containsAll(['a', 'b']));
    });
  });
}
