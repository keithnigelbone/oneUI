import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';
import 'package:ui_flutter/engine/radio_color_resolve.dart';
import 'package:ui_flutter/engine/radio_size_resolve.dart';

ThemeConfig _radioTestTheme() {
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

NativeDesignSystemPayload _ds() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Stroke-M': '1px',
      '--Stroke-XL': '2px',
      '--Focus-Outline-Width': '2px',
      '--Disabled-Opacity': '0.5',
      '--Radio-boxSize-m': '20px',
      '--Radio-dotSize-m': '10px',
      '--Radio-roleBold': 'var(--Secondary-Bold)',
      '--Radio-roleBoldHigh': 'var(--Secondary-Bold-TintedA11y)',
      '--Radio-roleStrokeMedium': 'var(--Secondary-Stroke-Medium)',
      '--Spacing-4': '16px',
      '--Spacing-5': '20px',
      '--Spacing-2-5': '10px',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': <String, String>{},
    },
  })!;
}

void main() {
  test('resolveRadioSize aliases legacy names', () {
    expect(resolveRadioSize('small'), 's');
    expect(resolveRadioSize('large'), 'l');
    expect(resolveRadioSize('m'), 'm');
  });

  test('resolveRadioSize rejects unknown values to m', () {
    expect(resolveRadioSize('xl'), 'm');
    expect(resolveRadioSize('bogus'), 'm');
  });

  test('Figma API size row matches s/m/l', () {
    expect(kOneUiRadioSizes, ['s', 'm', 'l']);
  });

  group('resolveRadioMetrics — web label gap parity', () {
    testWidgets('labelGap matches web Spacing-1-5 / 2 / 2-5 per size',
        (tester) async {
      final root = buildRootSurfaceContext(
        themeConfig: _radioTestTheme(),
        rootParentStep: 2500,
        darkMode: false,
      );
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: _ds(),
              child: Builder(
                builder: (context) {
                  expect(
                    resolveRadioMetrics(context, _ds(), size: 's').labelGap,
                    6,
                  );
                  expect(
                    resolveRadioMetrics(context, _ds(), size: 'm').labelGap,
                    8,
                  );
                  expect(
                    resolveRadioMetrics(context, _ds(), size: 'l').labelGap,
                    10,
                  );
                  return const SizedBox.shrink();
                },
              ),
            ),
          ),
        ),
      );
    });
  });

  group('oneUiRadioDataAttrs — RN useRadioState dataAttrs', () {
    test('checked state encodes data-checked', () {
      final attrs = oneUiRadioDataAttrs(
        resolvedSize: 'm',
        resolvedAppearance: 'primary',
        isReadOnly: false,
        isChecked: true,
        uncheckedAppearance: 'neutral',
      );
      expect(attrs['data-size'], 'm');
      expect(attrs['data-appearance'], 'primary');
      expect(attrs.containsKey('data-checked'), isTrue);
      expect(attrs.containsKey('data-unchecked'), isFalse);
      expect(attrs['data-unchecked-appearance'], 'neutral');
    });

    test('readOnly unchecked encodes data-readonly and neutral unchecked role',
        () {
      final attrs = oneUiRadioDataAttrs(
        resolvedSize: 's',
        resolvedAppearance: 'secondary',
        isReadOnly: true,
        isChecked: false,
        uncheckedAppearance: 'neutral',
      );
      expect(attrs.containsKey('data-readonly'), isTrue);
      expect(attrs.containsKey('data-unchecked'), isTrue);
    });

    test('dataPayloadKey mirrors web QA harness format', () {
      final key = oneUiRadioDataPayloadKey(
        oneUiRadioDataAttrs(
          resolvedSize: 'l',
          resolvedAppearance: 'positive',
          isReadOnly: false,
          isChecked: false,
          uncheckedAppearance: 'primary',
          isDisabled: true,
        ),
      );
      expect(key, contains('oneui-radio'));
      expect(key, contains('data-size=l'));
      expect(key, contains('data-unchecked-appearance=primary'));
      expect(key, contains('data-disabled'));
    });
  });

  test('resolveOneUiRadioState maps auto to secondary', () {
    final state = resolveOneUiRadioState(
      appearance: 'auto',
      isChecked: true,
    );
    expect(state.resolvedAppearance, 'secondary');
  });

  testWidgets('readOnly checked uses high fill not brand bold', (tester) async {
    final theme = _radioTestTheme();
    final root = buildRootSurfaceContext(
      themeConfig: theme,
      rootParentStep: 2500,
      darkMode: false,
    );
    final ds = _ds();

    late RadioResolvedPaint readOnlyChecked;
    late RadioResolvedPaint normalChecked;

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
                readOnlyChecked = resolveRadioPaint(
                  context,
                  ds,
                  state: resolveOneUiRadioState(
                    appearance: 'secondary',
                    readOnly: true,
                    isChecked: true,
                  ),
                  pressed: false,
                  hovered: false,
                  roleAppearance: 'secondary',
                  uncheckedRoleAppearance: 'neutral',
                );
                normalChecked = resolveRadioPaint(
                  context,
                  ds,
                  state: resolveOneUiRadioState(
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
    expect(
      readOnlyChecked.indicatorColor,
      isNot(readOnlyChecked.backgroundColor),
    );
  });

  test('getRadioAccessibilityProps readOnly allows focus but not tap', () {
    final a11y = getRadioAccessibilityProps(
      label: 'Option',
      isDisabled: false,
      isReadOnly: true,
      isChecked: false,
    );
    expect(a11y.canTap, isFalse);
    expect(a11y.exposeControl, isTrue);
  });

  test('required forwards to semantics model', () {
    final a11y = getRadioAccessibilityProps(
      ariaLabel: 'Terms',
      required: true,
      isDisabled: false,
      isReadOnly: false,
      isChecked: false,
    );
    expect(a11y.isRequired, isTrue);
  });

  testWidgets('checked fill follows appearance role not Radio-role slot',
      (tester) async {
    final theme = ThemeConfig(
      appearances: {
        'primary': buildScaleDefinition('primary', buildColoredPalette(), 600),
        'secondary':
            buildScaleDefinition('secondary', buildGreyscalePalette(), 1800),
        'neutral':
            buildScaleDefinition('neutral', buildGreyscalePalette(), 1300),
      },
    );
    final root = buildRootSurfaceContext(
      themeConfig: theme,
      rootParentStep: 2500,
      darkMode: false,
    );
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{
        '--Stroke-M': '1px',
        '--Radio-roleBold': 'var(--Primary-Bold)',
        '--Radio-roleBoldHigh': 'var(--Primary-Bold-TintedA11y)',
        '--Radio-roleStrokeMedium': 'var(--Primary-Stroke-Medium)',
      },
      'dimensionContexts': <dynamic>[],
      'activeDimensionKey': 'S:default',
      'activeDimensionContext': {
        'platformId': 'S',
        'density': 'default',
        'dimensions': <String, String>{},
      },
    })!;

    late Color primaryFill;
    late Color secondaryFill;

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
                final primaryState = resolveOneUiRadioState(
                  appearance: 'primary',
                  isChecked: true,
                );
                final secondaryState = resolveOneUiRadioState(
                  appearance: 'secondary',
                  isChecked: true,
                );
                primaryFill = resolveRadioPaint(
                  context,
                  ds,
                  state: primaryState,
                  pressed: false,
                  hovered: false,
                  roleAppearance: 'primary',
                  uncheckedRoleAppearance: 'neutral',
                ).backgroundColor;
                secondaryFill = resolveRadioPaint(
                  context,
                  ds,
                  state: secondaryState,
                  pressed: false,
                  hovered: false,
                  roleAppearance: 'secondary',
                  uncheckedRoleAppearance: 'neutral',
                ).backgroundColor;
                return const SizedBox();
              },
            ),
          ),
        ),
      ),
    );

    expect(primaryFill, isNot(equals(secondaryFill)));
  });

  test('getRadioAccessibilityProps disabled blocks tap', () {
    final a11y = getRadioAccessibilityProps(
      isDisabled: true,
      isReadOnly: false,
      isChecked: false,
    );
    expect(a11y.canTap, isFalse);
  });

  testWidgets('RadioGroup selects one option', (tester) async {
    final root = buildRootSurfaceContext(
      themeConfig: _radioTestTheme(),
      rootParentStep: 2500,
      darkMode: false,
    );

    var selected = 'a';
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: _ds(),
            child: StatefulBuilder(
              builder: (context, setState) {
                return OneUiRadioGroup(
                  value: selected,
                  onValueChange: (v) => setState(() => selected = v),
                  children: [
                    OneUiRadio(value: 'a', child: 'A'),
                    OneUiRadio(value: 'b', child: 'B'),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('B'));
    await tester.pump();
    expect(selected, 'b');
  });

  group('resolveOneUiRadioUncheckedAppearance — web data-unchecked-appearance',
      () {
    testWidgets('readOnly always uses neutral', (tester) async {
      final root = buildRootSurfaceContext(
        themeConfig: _radioTestTheme(),
        rootParentStep: 2500,
        darkMode: false,
      );
      late String appearance;
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root.copyWith(
              surfaceDepth: 1,
              parentAppearance: 'primary',
            ),
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: _ds(),
              child: Builder(
                builder: (context) {
                  appearance = resolveOneUiRadioUncheckedAppearance(
                    context,
                    readOnly: true,
                  );
                  return const SizedBox();
                },
              ),
            ),
          ),
        ),
      );
      expect(appearance, 'neutral');
    });

    testWidgets('nested surface inherits parent appearance when not readOnly',
        (tester) async {
      final root = buildRootSurfaceContext(
        themeConfig: _radioTestTheme(),
        rootParentStep: 2500,
        darkMode: false,
      );
      late String appearance;
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root.copyWith(
              surfaceDepth: 1,
              parentAppearance: 'positive',
            ),
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: _ds(),
              child: Builder(
                builder: (context) {
                  appearance = resolveOneUiRadioUncheckedAppearance(
                    context,
                    readOnly: false,
                  );
                  return const SizedBox();
                },
              ),
            ),
          ),
        ),
      );
      expect(appearance, 'positive');
    });
  });

  testWidgets('exposes data-* payload KeyedSubtree', (tester) async {
    final root = buildRootSurfaceContext(
      themeConfig: _radioTestTheme(),
      rootParentStep: 2500,
      darkMode: false,
    );
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: _ds(),
            child: OneUiRadio(
              label: 'Option',
              appearance: 'primary',
              size: 'm',
              defaultChecked: true,
            ),
          ),
        ),
      ),
    );
    expect(
      find.byWidgetPredicate(
        (w) =>
            w is KeyedSubtree &&
            w.key is ValueKey<String> &&
            (w.key! as ValueKey<String>)
                .value
                .contains('oneui-radio|data-size=m'),
      ),
      findsOneWidget,
    );
  });

  testWidgets('renders label and description when provided', (tester) async {
    final root = buildRootSurfaceContext(
      themeConfig: _radioTestTheme(),
      rootParentStep: 2500,
      darkMode: false,
    );
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: _ds(),
            child: OneUiRadio(
              label: 'Radio',
              description: 'Helper copy',
            ),
          ),
        ),
      ),
    );
    expect(find.text('Radio'), findsOneWidget);
    expect(find.text('Helper copy'), findsOneWidget);
  });

  testWidgets('standalone Radio toggles uncontrolled', (tester) async {
    final root = buildRootSurfaceContext(
      themeConfig: _radioTestTheme(),
      rootParentStep: 2500,
      darkMode: false,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: _ds(),
            child: OneUiRadio(
              defaultChecked: false,
              ariaLabel: 'solo',
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.bySemanticsLabel('solo'));
    await tester.pump();
    final semantics = tester.getSemantics(find.bySemanticsLabel('solo'));
    expect(semantics.hasFlag(SemanticsFlag.isChecked), isTrue);
  });

  Future<void> _pumpRadioHarness(WidgetTester tester, Widget child) async {
    final root = buildRootSurfaceContext(
      themeConfig: _radioTestTheme(),
      rootParentStep: 2500,
      darkMode: false,
    );
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: _ds(),
            child: child,
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('forwards testId to keyed subtree', (tester) async {
    await _pumpRadioHarness(
      tester,
      const OneUiRadio(
        testId: 'qa-radio-root',
        label: 'QA',
      ),
    );
    expect(find.byKey(const ValueKey('qa-radio-root')), findsOneWidget);
  });

  testWidgets('testId exposed via Semantics.identifier', (tester) async {
    await _pumpRadioHarness(
      tester,
      const OneUiRadio(
        testId: 'qa-radio',
        label: 'QA',
      ),
    );
    final handle = tester.ensureSemantics();
    try {
      final data = tester
          .getSemantics(find.byKey(const ValueKey('qa-radio')))
          .getSemanticsData();
      expect(data.identifier, 'qa-radio');
    } finally {
      handle.dispose();
    }
  });

  testWidgets('required exposes hasRequiredState on semantics', (tester) async {
    await _pumpRadioHarness(
      tester,
      const OneUiRadio(
        ariaLabel: 'Terms',
        required: true,
      ),
    );
    final handle = tester.ensureSemantics();
    try {
      final data = tester
          .getSemantics(find.bySemanticsLabel('Terms'))
          .getSemanticsData();
      expect(data.hasFlag(SemanticsFlag.isRequired), isTrue);
    } finally {
      handle.dispose();
    }
  });

  testWidgets('Space selects focused standalone radio', (tester) async {
    await _pumpRadioHarness(
      tester,
      const OneUiRadio(
        defaultChecked: false,
        ariaLabel: 'solo',
        autofocus: true,
      ),
    );
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    final semantics = tester.getSemantics(find.bySemanticsLabel('solo'));
    expect(semantics.hasFlag(SemanticsFlag.isChecked), isTrue);
  });

  testWidgets('expands touch target when parent has room', (tester) async {
    await _pumpRadioHarness(
      tester,
      const SizedBox(
        width: 100,
        child: OneUiRadio(ariaLabel: 'Only'),
      ),
    );
    final controlSize = tester.getSize(
      find.descendant(
        of: find.byType(OneUiRadio),
        matching: find.byType(GestureDetector).first,
      ),
    );
    expect(controlSize.width, greaterThanOrEqualTo(44));
    expect(controlSize.height, greaterThanOrEqualTo(44));
  });

  testWidgets('arrow down selects next option in group', (tester) async {
    String? selected;
    await _pumpRadioHarness(
      tester,
      OneUiRadioGroup(
        defaultValue: 'a',
        onValueChange: (v) => selected = v,
        ariaLabel: 'Pick',
        children: const [
          OneUiRadio(value: 'a', label: 'A', autofocus: true),
          OneUiRadio(value: 'b', label: 'B'),
        ],
      ),
    );
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pumpAndSettle();
    expect(selected, 'b');
  });
}
