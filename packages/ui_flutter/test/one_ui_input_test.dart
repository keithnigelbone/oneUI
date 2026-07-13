/// Input unit + widget tests — parity with
/// `packages/ui-native/src/components/Input/InputA11y.test.ts` and
/// `packages/ui/src/components/Input/Input.test.tsx` (container stories).
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';
import 'package:ui_flutter/ui_flutter.dart';

FlatRoleTokens _minimalFlatRole() {
  return const FlatRoleTokens(
    surfaces: {
      kSurfaceBold: '#aa0000',
      kSurfaceSubtle: '#eeeeee',
      kSurfaceMinimal: '#f5f5f5',
    },
    content: {
      'high': '#111111',
      'low': '#666666',
      'medium': '#444444',
      'strokeMedium': '#999999',
    },
    onBoldContent: {'high': '#ffffff', 'tintedA11y': '#ffffff'},
    onSubtleContent: {},
    states: {'hover': '#dddddd'},
  );
}

NativeDesignSystemPayload _minimalInputDesignSystem() {
  final props = <String, dynamic>{
    '--Input-borderWidth': '1px',
    '--Input-borderWidthFocus': '2px',
    '--Input-disabledOpacity': '0.4',
    '--Input-rootStackGap': '6px',
    '--Input-slotGap': '6px',
    '--Stroke-M': '1px',
    '--Spacing-0-5': '2px',
    '--Spacing-0': '0px',
    '--Spacing-1-5': '6px',
    '--Spacing-2': '8px',
    '--Spacing-3': '12px',
    '--Spacing-4': '16px',
    '--Spacing-5': '20px',
    '--Spacing-6': '24px',
    '--Spacing-8': '32px',
    '--Spacing-10': '40px',
    '--Spacing-12': '48px',
    '--Shape-2': '8px',
    '--Shape-3': '12px',
    '--Shape-Pill': '9999px',
  };

  for (final sz in ['8', '10', '12']) {
    props['--Input-height-$sz'] = '40px';
    props['--Input-paddingHorizontal-$sz'] = '12px';
    props['--Input-paddingVertical-$sz'] = '6px';
    props['--Input-borderRadius-$sz'] = '8px';
    props['--Input-iconSize-$sz'] = '16px';
  }

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-1': '4px',
        '--Spacing-1-5': '6px',
        '--Spacing-2': '8px',
        '--Spacing-3': '12px',
        '--Spacing-4': '16px',
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-8': '32px',
        '--Spacing-10': '40px',
        '--Spacing-12': '48px',
        '--Shape-2': '8px',
        '--Shape-3': '12px',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

NativeTypographySnapshot _minimalTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
        'L': {'fontSize': 16, 'lineHeight': 22},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'body': {
      'sizes': {
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
        'L': {'fontSize': 16, 'lineHeight': 22},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

ThemeConfig _minimalThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'positive',
        'negative',
        'warning',
        'informative',
      ])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

Widget pumpInputApp(Widget child) {
  final surface = buildRootSurfaceContext(
    themeConfig: _minimalThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );

  return MaterialApp(
    home: OneUiSurfaceScope(
      value: surface,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        nativeTypography: _minimalTypography(),
        designSystem: _minimalInputDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

Finder _textFieldSemanticsFinder() {
  return find.byWidgetPredicate(
    (w) => w is Semantics && (w.properties.textField ?? false),
  );
}

SemanticsNode _inputSemanticsNode(WidgetTester tester) {
  return tester.getSemantics(_textFieldSemanticsFinder().first);
}

SemanticsData _inputSemanticsData(WidgetTester tester) {
  return _inputSemanticsNode(tester).getSemanticsData();
}

void main() {
  group('resolveOneUiInputNumericSize — RN resolveInputSize parity', () {
    test('defaults unknown to 10 (m)', () {
      expect(resolveOneUiInputNumericSize(null), 10);
      expect(resolveOneUiInputNumericSize(7), 10);
    });

    test('passes through valid f-steps', () {
      expect(resolveOneUiInputNumericSize(6), 6);
      expect(resolveOneUiInputNumericSize(8), 8);
      expect(resolveOneUiInputNumericSize(10), 10);
      expect(resolveOneUiInputNumericSize(12), 12);
    });

    test('maps xs to dedicated f6 tier (RN parity)', () {
      expect(resolveOneUiInputNumericSize('xs'), 6);
      expect(resolveOneUiInputNumericSize(OneUiInputSize.xs), 6);
    });

    test('maps t-shirt aliases', () {
      expect(resolveOneUiInputNumericSize('s'), 8);
      expect(resolveOneUiInputNumericSize('m'), 10);
      expect(resolveOneUiInputNumericSize('l'), 12);
    });

    test('maps legacy small/medium/large', () {
      expect(resolveOneUiInputNumericSize('small'), 8);
      expect(resolveOneUiInputNumericSize('medium'), 10);
      expect(resolveOneUiInputNumericSize('large'), 12);
    });
  });

  group('inputSizeToLabelSize — RN parity', () {
    test('maps numeric f-steps to label tiers', () {
      expect(oneUiInputSizeToLabelSize(8), OneUiInputLabelSize.s);
      expect(oneUiInputSizeToLabelSize(10), OneUiInputLabelSize.m);
      expect(oneUiInputSizeToLabelSize(12), OneUiInputLabelSize.l);
    });
  });

  group('resolveOneUiInputAppearance — web useInputState parity', () {
    test('auto and unset resolve to secondary without parent', () {
      expect(
          resolveOneUiInputAppearance(OneUiInputAppearance.auto), 'secondary');
      expect(resolveOneUiInputAppearance(null), 'secondary');
    });

    test('auto inherits parent appearance from Surface', () {
      expect(
        resolveOneUiInputAppearance(
          OneUiInputAppearance.auto,
          parentAppearance: 'positive',
        ),
        'positive',
      );
    });

    test('brand-bg parent falls back to secondary', () {
      expect(
        resolveOneUiInputAppearance(
          OneUiInputAppearance.auto,
          parentAppearance: 'brand-bg',
        ),
        'secondary',
      );
    });

    test('passes explicit roles', () {
      expect(
          resolveOneUiInputAppearance(OneUiInputAppearance.primary), 'primary');
      expect(resolveOneUiInputAppearance(OneUiInputAppearance.negative),
          'negative');
    });
  });

  group('Figma API constants', () {
    test('documents xs–l sizes and nine appearance roles', () {
      expect(kOneUiInputFigmaSizes, ['xs', 's', 'm', 'l']);
      expect(kOneUiInputFigmaAppearances.length, 8);
      expect(kOneUiInputFigmaAppearances, contains('secondary'));
      expect(kOneUiInputFigmaAppearances, contains('informative'));
    });
  });

  group('resolveOneUiInputTextInputOptions — RN resolveTextInputType parity',
      () {
    test('maps email/number/tel/url', () {
      expect(
        resolveOneUiInputTextInputOptions('email').keyboardType,
        TextInputType.emailAddress,
      );
      expect(
        resolveOneUiInputTextInputOptions('number').keyboardType,
        TextInputType.number,
      );
      expect(
        resolveOneUiInputTextInputOptions('tel').keyboardType,
        TextInputType.phone,
      );
      expect(
        resolveOneUiInputTextInputOptions('url').keyboardType,
        TextInputType.url,
      );
    });

    test('password enables obscureText', () {
      final opts = resolveOneUiInputTextInputOptions('password');
      expect(opts.obscureText, isTrue);
      expect(oneUiInputObscureText('password'), isTrue);
    });

    test('text and search use default keyboard', () {
      expect(resolveOneUiInputTextInputOptions('text').obscureText, isFalse);
      expect(resolveOneUiInputTextInputOptions('search').obscureText, isFalse);
      expect(resolveOneUiInputTextInputOptions(null).obscureText, isFalse);
    });
  });

  group('resolveOneUiInputState — RN useInputState parity', () {
    test('detects populated slots including deprecated addons', () {
      expect(resolveOneUiInputState(start: 'x').hasAnySlot, isTrue);
      expect(resolveOneUiInputState(end2: 'kg').hasAnySlot, isTrue);
      expect(resolveOneUiInputState(leftAddon: 'L').hasAnySlot, isTrue);
      expect(resolveOneUiInputState(rightAddon: 'R').hasAnySlot, isTrue);
      expect(resolveOneUiInputState().hasAnySlot, isFalse);
    });

    test('encodes web data-* payload on state', () {
      final state = resolveOneUiInputState(
        size: 'm',
        appearance: OneUiInputAppearance.secondary,
        attention: OneUiInputAttention.high,
        shape: OneUiInputShape.pill,
        disabled: true,
        readOnly: true,
        errorHighlight: true,
      );
      expect(state.dataSize, '10');
      expect(state.dataAppearance, 'secondary');
      expect(state.dataAttention, 'high');
      expect(state.dataShape, 'pill');
      expect(state.dataDisabled, isTrue);
      expect(state.dataInvalid, isTrue);
      expect(state.dataReadOnly, isTrue);
      expect(state.dataPayloadKey, contains('data-size=10'));
      expect(state.dataPayloadKey, contains('data-disabled=true'));
      expect(state.dataPayloadKey, contains('data-invalid=true'));
      expect(state.dataPayloadKey, contains('data-readonly=true'));
    });

    test('error highlight from errorHighlight or ariaInvalid', () {
      expect(resolveOneUiInputState().hasErrorHighlight, isFalse);
      expect(resolveOneUiInputState(errorHighlight: true).hasErrorHighlight,
          isTrue);
      expect(
          resolveOneUiInputState(ariaInvalid: true).hasErrorHighlight, isTrue);
    });

    test('forwards disabled and readOnly', () {
      final state = resolveOneUiInputState(disabled: true, readOnly: true);
      expect(state.isDisabled, isTrue);
      expect(state.isReadOnly, isTrue);
    });

    test('normalises size aliases', () {
      final state = resolveOneUiInputState(size: 'l');
      expect(state.numericSize, 12);
      expect(state.labelSize, OneUiInputLabelSize.l);
    });
  });

  group('resolveOneUiInputAccessibility — RN getInputAccessibilityProps parity',
      () {
    test('prefers accessibilityLabel over ariaLabel', () {
      final cfg = resolveOneUiInputAccessibility(
        accessibilityLabel: 'Native name',
        ariaLabel: 'Web name',
        isDisabled: false,
        isReadOnly: false,
        type: 'text',
      );
      expect(cfg.label, 'Native name');
    });

    test('accepts aria-label alias alone', () {
      final cfg = resolveOneUiInputAccessibility(
        ariaLabel: 'Phone number',
        isDisabled: false,
        isReadOnly: false,
        type: 'text',
      );
      expect(cfg.label, 'Phone number');
    });

    test('trims whitespace from explicit label', () {
      final cfg = resolveOneUiInputAccessibility(
        accessibilityLabel: '  Email  ',
        isDisabled: false,
        isReadOnly: false,
        type: 'text',
      );
      expect(cfg.label, 'Email');
    });

    test('omits explicit label when whitespace-only', () {
      expect(
        resolveOneUiInputAccessibility(
          isDisabled: false,
          isReadOnly: false,
          type: 'text',
        ).label,
        isNull,
      );
      expect(
        resolveOneUiInputAccessibility(
          accessibilityLabel: '   ',
          isDisabled: false,
          isReadOnly: false,
          type: 'text',
        ).label,
        isNull,
      );
    });

    test('uses visible label when no explicit a11y name (web labeled field)',
        () {
      final cfg = resolveOneUiInputAccessibility(
        visibleLabel: 'Email',
        isDisabled: false,
        isReadOnly: false,
        type: 'text',
      );
      expect(cfg.label, 'Email');
    });

    test('disabled marks field not enabled; readOnly stays enabled', () {
      expect(
        resolveOneUiInputAccessibility(
          isDisabled: true,
          isReadOnly: false,
          type: 'text',
        ).enabled,
        isFalse,
      );
      expect(
        resolveOneUiInputAccessibility(
          isDisabled: false,
          isReadOnly: true,
          type: 'text',
        ).enabled,
        isTrue,
      );
      expect(
        resolveOneUiInputAccessibility(
          isDisabled: false,
          isReadOnly: true,
          type: 'text',
        ).readOnly,
        isTrue,
      );
    });

    test('aria-hidden collapses exposure', () {
      final cfg = resolveOneUiInputAccessibility(
        ariaHidden: true,
        isDisabled: false,
        isReadOnly: false,
        type: 'text',
      );
      expect(cfg.exposed, isFalse);
      expect(cfg.hidden, isTrue);
    });

    test('password type sets obscured', () {
      final cfg = resolveOneUiInputAccessibility(
        isDisabled: false,
        isReadOnly: false,
        type: 'password',
      );
      expect(cfg.obscured, isTrue);
    });

    test('forwards placeholder as hint', () {
      final cfg = resolveOneUiInputAccessibility(
        placeholder: 'you@example.com',
        isDisabled: false,
        isReadOnly: false,
        type: 'text',
      );
      expect(cfg.hint, 'you@example.com');
    });

    test('accessibilityHint wins over placeholder', () {
      final cfg = resolveOneUiInputAccessibility(
        accessibilityHint: 'Activates voice search',
        placeholder: 'Search',
        isDisabled: false,
        isReadOnly: false,
        type: 'text',
      );
      expect(cfg.hint, 'Activates voice search');
    });

    test('forwards required + aria-describedby + aria-invalid', () {
      final cfg = resolveOneUiInputAccessibility(
        ariaDescribedBy: 'help-id other-id',
        ariaInvalid: true,
        required: true,
        isDisabled: false,
        isReadOnly: false,
        type: 'text',
      );
      expect(cfg.isRequired, isTrue);
      expect(cfg.ariaDescribedBy, 'help-id other-id');
      expect(cfg.describedByNodeIds, {'help-id', 'other-id'});
      expect(cfg.validationResult, SemanticsValidationResult.invalid);
    });
  });

  group('resolveInputPaint — RN inputPaintFor / web CSS parity', () {
    final role = _minimalFlatRole();
    final negative = _minimalFlatRole();
    const borders = InputBorderWidths(
      idle: 1,
      focus: 2,
      disabledOpacity: 0.4,
      rootStackGap: 6,
    );

    Future<(BuildContext, NativeDesignSystemPayload)> paintHarness(
      WidgetTester tester,
    ) async {
      late BuildContext ctx;
      await tester.pumpWidget(
        pumpInputApp(
          Builder(
            builder: (context) {
              ctx = context;
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      return (ctx, OneUiScope.designSystemOf(ctx)!);
    }

    testWidgets('medium attention idle is transparent with hairline border',
        (tester) async {
      final (ctx, ds) = await paintHarness(tester);
      final paint = resolveInputPaint(
        context: ctx,
        designSystem: ds,
        appearance: 'secondary',
        role: role,
        errorRole: negative,
        attention: OneUiInputAttention.medium,
        borders: borders,
        hasFocus: false,
        hasError: false,
        isDisabled: false,
        isHovered: false,
      );
      expect(paint.background, Colors.transparent);
      expect(paint.layoutBorderWidth, 1);
      expect(paint.paddingShrink, 0);
    });

    testWidgets('high attention idle uses subtle fill and no border',
        (tester) async {
      final (ctx, ds) = await paintHarness(tester);
      final paint = resolveInputPaint(
        context: ctx,
        designSystem: ds,
        appearance: 'secondary',
        role: role,
        errorRole: negative,
        attention: OneUiInputAttention.high,
        borders: borders,
        hasFocus: false,
        hasError: false,
        isDisabled: false,
        isHovered: false,
      );
      expect(paint.layoutBorderWidth, 0);
      expect(paint.background, isNot(Colors.transparent));
    });

    testWidgets('focus grows border to focus width — RN inputPaintFor',
        (tester) async {
      final (ctx, ds) = await paintHarness(tester);
      final paint = resolveInputPaint(
        context: ctx,
        designSystem: ds,
        appearance: 'secondary',
        role: role,
        errorRole: negative,
        attention: OneUiInputAttention.medium,
        borders: borders,
        hasFocus: true,
        hasError: false,
        isDisabled: false,
        isHovered: false,
      );
      expect(paint.layoutBorderWidth, 2);
      expect(paint.paddingShrink, 1);
      expect(paint.ringColor, isNotNull);
      expect(paint.background, Colors.transparent);
    });

    testWidgets('high attention focus grows border like RN', (tester) async {
      final (ctx, ds) = await paintHarness(tester);
      final paint = resolveInputPaint(
        context: ctx,
        designSystem: ds,
        appearance: 'secondary',
        role: role,
        errorRole: negative,
        attention: OneUiInputAttention.high,
        borders: borders,
        hasFocus: true,
        hasError: false,
        isDisabled: false,
        isHovered: false,
      );
      expect(paint.layoutBorderWidth, 2);
      expect(paint.paddingShrink, 2);
      expect(paint.background, isNot(Colors.transparent));
    });

    testWidgets('error idle keeps hairline; focus error grows border',
        (tester) async {
      final (ctx, ds) = await paintHarness(tester);
      final idleError = resolveInputPaint(
        context: ctx,
        designSystem: ds,
        appearance: 'secondary',
        role: role,
        errorRole: negative,
        attention: OneUiInputAttention.medium,
        borders: borders,
        hasFocus: false,
        hasError: true,
        isDisabled: false,
        isHovered: false,
      );
      expect(idleError.layoutBorderWidth, 1);
      expect(idleError.paddingShrink, 0);

      final focusError = resolveInputPaint(
        context: ctx,
        designSystem: ds,
        appearance: 'secondary',
        role: role,
        errorRole: negative,
        attention: OneUiInputAttention.medium,
        borders: borders,
        hasFocus: true,
        hasError: true,
        isDisabled: false,
        isHovered: false,
      );
      expect(focusError.layoutBorderWidth, 2);
      expect(focusError.paddingShrink, 1);
    });

    testWidgets('disabled suppresses effective focus paint', (tester) async {
      final (ctx, ds) = await paintHarness(tester);
      final paint = resolveInputPaint(
        context: ctx,
        designSystem: ds,
        appearance: 'secondary',
        role: role,
        errorRole: negative,
        attention: OneUiInputAttention.medium,
        borders: borders,
        hasFocus: true,
        hasError: false,
        isDisabled: true,
        isHovered: false,
      );
      expect(paint.layoutBorderWidth, 1);
      expect(paint.paddingShrink, 0);
    });

    testWidgets('[INP-VIS-001] readOnly suppresses hover fill', (tester) async {
      final (ctx, ds) = await paintHarness(tester);
      final idle = resolveInputPaint(
        context: ctx,
        designSystem: ds,
        appearance: 'secondary',
        role: role,
        errorRole: negative,
        attention: OneUiInputAttention.medium,
        borders: borders,
        hasFocus: false,
        hasError: false,
        isDisabled: false,
        isHovered: false,
        isReadOnly: true,
      );
      final hovered = resolveInputPaint(
        context: ctx,
        designSystem: ds,
        appearance: 'secondary',
        role: role,
        errorRole: negative,
        attention: OneUiInputAttention.medium,
        borders: borders,
        hasFocus: false,
        hasError: false,
        isDisabled: false,
        isHovered: true,
        isReadOnly: true,
      );
      expect(hovered.background, idle.background);
    });
  });

  group('OneUiInput widget — functional (web Input.test parity)', () {
    testWidgets('renders placeholder', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(const OneUiInput(placeholder: 'Standalone')),
      );
      await tester.pumpAndSettle();
      expect(find.text('Standalone'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    });

    testWidgets('calls onChanged with typed value', (tester) async {
      final values = <String>[];
      await tester.pumpWidget(
        pumpInputApp(
          OneUiInput(placeholder: 'Test', onChanged: values.add),
        ),
      );
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField), 'hi');
      await tester.pumpAndSettle();
      expect(values.join(), 'hi');
    });

    testWidgets('disabled prevents editing', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
              placeholder: 'Test', disabled: true, value: 'locked'),
        ),
      );
      await tester.pumpAndSettle();
      final field = tester.widget<TextField>(find.byType(TextField));
      expect(field.enabled, isFalse);
    });

    testWidgets('readOnly keeps value visible', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(value: 'Read only', readOnly: true),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Read only'), findsOneWidget);
      expect(tester.widget<TextField>(find.byType(TextField)).readOnly, isTrue);
    });

    testWidgets('[INP-FN-001] readOnly shell tap focuses control',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(value: 'Read only', readOnly: true),
        ),
      );
      await tester.pumpAndSettle();
      final field = tester.widget<TextField>(find.byType(TextField));
      expect(field.focusNode!.hasFocus, isFalse);
      await tester.tap(find.byType(OneUiInput));
      await tester.pump();
      expect(field.focusNode!.hasFocus, isTrue);
    });

    testWidgets('[INP-FN-002] forwards name to TextField restorationId',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(name: 'email', placeholder: 'you@example.com'),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        tester.widget<TextField>(find.byType(TextField)).restorationId,
        'email',
      );
    });

    testWidgets('renders integrated label and description', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            label: 'Email',
            description: 'We never share it.',
            placeholder: 'you@example.com',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('We never share it.'), findsOneWidget);
    });

    testWidgets('renders all four slots', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            placeholder: 'Slotted',
            start: Text('S1', key: Key('s1')),
            start2: Text('S2', key: Key('s2')),
            end: Text('E1', key: Key('e1')),
            end2: Text('E2', key: Key('e2')),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('s1')), findsOneWidget);
      expect(find.byKey(const Key('s2')), findsOneWidget);
      expect(find.byKey(const Key('e1')), findsOneWidget);
      expect(find.byKey(const Key('e2')), findsOneWidget);
    });

    testWidgets('semantic icon slots render', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            placeholder: 'Icons',
            start: OneUiIcon(icon: 'heart', size: '4'),
            end: OneUiIcon(icon: 'microphone', size: '4'),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(OneUiIcon), findsNWidgets(2));
    });

    testWidgets('sizes xs/s/m/l render without gap card', (tester) async {
      for (final size in ['xs', 's', 'm', 'l', 6, 8, 10, 12]) {
        await tester.pumpWidget(
          pumpInputApp(OneUiInput(placeholder: 'Sized', size: size)),
        );
        await tester.pumpAndSettle();
        expect(find.byType(ConvexGapCard), findsNothing);
        expect(find.byType(TextField), findsOneWidget);
      }
    });

    testWidgets('default payload encodes m size and secondary appearance',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(const OneUiInput(placeholder: 'Default')),
      );
      await tester.pumpAndSettle();
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-input|data-size=10|data-appearance=secondary|'
            'data-attention=medium|data-shape=default',
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgets('leftAddon and rightAddon render like start/end',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            placeholder: 'Addons',
            leftAddon: Text('L', key: Key('left')),
            rightAddon: Text('R', key: Key('right')),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('left')), findsOneWidget);
      expect(find.byKey(const Key('right')), findsOneWidget);
    });

    testWidgets('pill shape renders', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(placeholder: 'Pill', shape: OneUiInputShape.pill),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(TextField), findsOneWidget);
    });

    testWidgets('password uses obscure text', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(const OneUiInput(type: 'password', placeholder: 'Secret')),
      );
      await tester.pumpAndSettle();
      expect(
          tester.widget<TextField>(find.byType(TextField)).obscureText, isTrue);
    });

    testWidgets('password renders built-in visibility toggle', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(const OneUiInput(type: 'password', placeholder: 'Secret')),
      );
      await tester.pumpAndSettle();
      expect(find.byType(OneUiIconButton), findsOneWidget);
      expect(
          tester.widget<TextField>(find.byType(TextField)).obscureText, isTrue);
    });

    testWidgets('email keyboard type', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(const OneUiInput(type: 'email', placeholder: 'Email')),
      );
      await tester.pumpAndSettle();
      expect(
        tester.widget<TextField>(find.byType(TextField)).keyboardType,
        TextInputType.emailAddress,
      );
    });

    testWidgets('renders ConvexGapCard without designSystem', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: buildRootSurfaceContext(
              themeConfig: _minimalThemeConfig(),
              rootParentStep: 2500,
              darkMode: false,
            ),
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              nativeTypography: _minimalTypography(),
              designSystem: null,
              child: const Scaffold(
                body: OneUiInput(placeholder: 'Broken'),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(ConvexGapCard), findsOneWidget);
      expect(find.byType(TextField), findsNothing);
    });

    testWidgets('testId attaches ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(placeholder: 'x', testId: 'email-input'),
        ),
      );
      expect(find.byKey(const ValueKey('email-input')), findsOneWidget);
    });

    testWidgets('[INP-DEB-001] testId exposed via Semantics.identifier',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            testId: 'qa-input',
            ariaLabel: 'Email',
            placeholder: 'email',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(_inputSemanticsData(tester).identifier, 'qa-input');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('focus keeps shell interior transparent — accent border only',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(placeholder: 'Placeholder', size: 'm'),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();

      final shell = tester.widget<AnimatedContainer>(
        find.descendant(
          of: find.byType(OneUiInput),
          matching: find.byType(AnimatedContainer),
        ),
      );
      final deco = shell.decoration! as BoxDecoration;
      expect(deco.color, Colors.transparent);
      expect(deco.border!.top.width, 2);

      final decorator =
          tester.widget<InputDecorator>(find.byType(InputDecorator));
      expect(decorator.decoration.isCollapsed, isTrue);
    });

    testWidgets('caret-only focus uses transparent text selection colour',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(placeholder: 'Placeholder', size: 'm'),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();

      final selectionStyle = tester.widget<DefaultSelectionStyle>(
        find.descendant(
          of: find.byType(OneUiInput),
          matching: find.byType(DefaultSelectionStyle),
        ),
      );
      expect(selectionStyle.selectionColor, Colors.transparent);
    });

    testWidgets('onFocus and onBlur fire', (tester) async {
      var focused = false;
      var blurred = false;
      await tester.pumpWidget(
        pumpInputApp(
          OneUiInput(
            placeholder: 'Focus me',
            autofocus: true,
            onFocus: () => focused = true,
            onBlur: () => blurred = true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(focused, isTrue);

      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      FocusManager.instance.primaryFocus?.unfocus();
      await tester.pumpAndSettle();
      expect(blurred, isTrue);
    });
  });

  group('OneUiInput semantics — RN InputA11y + web a11y parity', () {
    testWidgets('exposes text field with explicit accessibilityLabel',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            accessibilityLabel: 'Email address',
            placeholder: 'you@example.com',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Email address'), findsOneWidget);
        final data = _inputSemanticsData(tester);
        expect(data.hasFlag(SemanticsFlag.isTextField), isTrue);
        expect(data.label, contains('Email address'));
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('visible label maps to semantics (web getByLabelText)',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(label: 'Email', placeholder: 'you@example.com'),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Email'), findsWidgets);
        final data = _inputSemanticsData(tester);
        expect(data.hasFlag(SemanticsFlag.isTextField), isTrue);
        expect(data.label, contains('Email'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('prefers accessibilityLabel over visible label',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            label: 'Visible',
            accessibilityLabel: 'Screen reader name',
            placeholder: 'x',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Screen reader name'), findsOneWidget);
        expect(
            _inputSemanticsData(tester).label, contains('Screen reader name'));
        expect(_inputSemanticsData(tester).label, isNot(contains('Visible')));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('ariaLabel alias matches accessibilityLabel', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(ariaLabel: 'Phone number', placeholder: 'x'),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Phone number'), findsOneWidget);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('placeholder surfaces as semantics hint', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(const OneUiInput(placeholder: 'you@example.com')),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = _inputSemanticsData(tester);
        expect(data.hint, contains('you@example.com'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('disabled marks field not enabled', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            accessibilityLabel: 'Off',
            placeholder: 'x',
            disabled: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = _inputSemanticsData(tester);
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets(
        '[INP-A11Y-001] readOnly stays enabled in AT (web readonly + RN a11y)',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            accessibilityLabel: 'Read only field',
            value: 'locked',
            readOnly: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = _inputSemanticsData(tester);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
        expect(data.hasFlag(SemanticsFlag.isReadOnly), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('password field is obscured in semantics', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            accessibilityLabel: 'Password',
            type: 'password',
            placeholder: '••••',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(_inputSemanticsData(tester).hasFlag(SemanticsFlag.isObscured),
            isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('accessibilityHint surfaces on semantics tree', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            accessibilityLabel: 'Search',
            accessibilityHint: 'Activates voice search',
            placeholder: 'Search',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(_inputSemanticsData(tester).hint,
            contains('Activates voice search'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('required sets isRequired semantics flag', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            accessibilityLabel: 'Email',
            placeholder: 'x',
            required: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(_inputSemanticsData(tester).hasFlag(SemanticsFlag.isRequired),
            isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('invalid uses validationResult not value string',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            accessibilityLabel: 'Email',
            placeholder: 'x',
            ariaInvalid: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = _inputSemanticsData(tester);
        expect(data.validationResult, SemanticsValidationResult.invalid);
        expect(data.value, isNot('invalid'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('aria-describedby exposes controlsNodes id set',
        (tester) async {
      await tester.pumpWidget(
        pumpInputApp(
          const OneUiInput(
            accessibilityLabel: 'Email',
            placeholder: 'x',
            ariaDescribedBy: 'help-id other-id',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = _inputSemanticsData(tester);
        expect(data.controlsNodes, contains('help-id'));
        expect(data.controlsNodes, contains('other-id'));
      } finally {
        handle.dispose();
      }
    });
  });

  group('resolveInputSizeMetrics — brand shape tokens', () {
    testWidgets(
        'Shape-0 (Reliance-style) resolves to 0px corners, not manifest fallback',
        (tester) async {
      final props = Map<String, String>.from(
        _minimalInputDesignSystem().componentCustomProperties,
      );
      props['--Input-borderRadius-10'] = 'var(--Shape-0)';
      props['--Input-borderRadius'] = 'var(--Shape-0)';

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: buildRootSurfaceContext(
              themeConfig: _minimalThemeConfig(),
              rootParentStep: 2500,
              darkMode: false,
            ),
            child: OneUiScope(
              platformId: 'L',
              density: 'default',
              nativeTypography: _minimalTypography(),
              designSystem: NativeDesignSystemPayload(
                componentCustomProperties: props,
                dimensionContexts: const [],
                activeDimensionKey: 'L:default',
              ),
              child:
                  const Scaffold(body: OneUiInput(placeholder: 'x', size: 'm')),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final ctx = tester.element(find.byType(OneUiInput));
      final metrics = resolveInputSizeMetrics(
        ctx,
        OneUiScope.designSystemOf(ctx)!,
        numericSize: 10,
        pillShape: false,
      );
      expect(metrics, isNotNull);
      expect(metrics!.borderRadius, 0);
    });
  });

  group('resolveInputSizeMetrics — token cascade', () {
    testWidgets('resolves metrics for S/M/L under scope', (tester) async {
      await tester.pumpWidget(
        pumpInputApp(const OneUiInput(placeholder: 'x', size: 'm')),
      );
      await tester.pumpAndSettle();

      final context = tester.element(find.byType(OneUiInput));
      final ds = OneUiScope.designSystemOf(context)!;

      for (final numeric in [8, 10, 12]) {
        final metrics = resolveInputSizeMetrics(
          context,
          ds,
          numericSize: numeric,
          pillShape: false,
        );
        expect(metrics, isNotNull);
        expect(metrics!.minHeight, greaterThan(0));
        expect(metrics.borderRadius, greaterThan(0));
        expect(metrics.iconSize, greaterThan(0));
      }
    });
  });
}
