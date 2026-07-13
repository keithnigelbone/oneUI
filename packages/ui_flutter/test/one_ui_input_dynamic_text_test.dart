/// InputDynamicText tests — RN `InputDynamicTextA11y.test.ts` + widget parity (web + mobile).
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text_types.dart';

import 'input_internals_test_harness.dart';

void main() {
  group('oneUiResolveInputDynamicTextSize', () {
    test('passes s/m/l and falls back to m', () {
      expect(oneUiResolveInputDynamicTextSize('s'), OneUiInputLabelSize.s);
      expect(oneUiResolveInputDynamicTextSize('m'), OneUiInputLabelSize.m);
      expect(oneUiResolveInputDynamicTextSize('l'), OneUiInputLabelSize.l);
      expect(oneUiResolveInputDynamicTextSize('xl'), OneUiInputLabelSize.m);
      expect(oneUiResolveInputDynamicTextSize(OneUiInputLabelSize.l),
          OneUiInputLabelSize.l);
    });
  });

  group('Figma API constants', () {
    test('documents s/m/l row sizes', () {
      expect(kOneUiInputDynamicTextFigmaSizes, ['s', 'm', 'l']);
    });
  });

  group('resolveOneUiInputDynamicTextState — RN useInputDynamicTextState', () {
    test('defaults size to m and reports both slots empty', () {
      final s = resolveOneUiInputDynamicTextState();
      expect(s.size, OneUiInputLabelSize.m);
      expect(s.hasContent, isFalse);
      expect(s.hasEnd, isFalse);
      expect(s.isEmpty, isTrue);
      expect(s.trailingOnly, isFalse);
      expect(s.isDisabled, isFalse);
    });

    test('treats whitespace-only content as empty', () {
      final s = resolveOneUiInputDynamicTextState(content: '   ', end: '   ');
      expect(s.isEmpty, isTrue);
      expect(s.hasContent, isFalse);
      expect(s.hasEnd, isFalse);
    });

    test('flags trailingOnly when only the end slot has content', () {
      final s = resolveOneUiInputDynamicTextState(
        end: 'Clear',
        size: OneUiInputLabelSize.l,
      );
      expect(s.size, OneUiInputLabelSize.l);
      expect(s.trailingOnly, isTrue);
      expect(s.isEmpty, isFalse);
      expect(s.hasEnd, isTrue);
    });

    test('forwards disabled flag', () {
      final s = resolveOneUiInputDynamicTextState(
        content: '0 / 280',
        end: 'Clear',
        disabled: true,
      );
      expect(s.isDisabled, isTrue);
      expect(s.hasContent, isTrue);
      expect(s.hasEnd, isTrue);
    });

    test('content-only row is not trailingOnly', () {
      final s = resolveOneUiInputDynamicTextState(content: '12 / 100');
      expect(s.hasContent, isTrue);
      expect(s.trailingOnly, isFalse);
    });

    test('encodes web data-size and data-disabled on state', () {
      final s = resolveOneUiInputDynamicTextState(
        content: 'Dynamic text',
        end: 'Helper Button',
        size: 'l',
        disabled: true,
      );
      expect(s.dataSize, 'l');
      expect(s.dataDisabled, isTrue);
      expect(s.dataPayloadKey, contains('data-size=l'));
      expect(s.dataPayloadKey, contains('data-disabled=true'));
    });
  });

  group(
      'resolveOneUiInputDynamicTextLiveRegion — RN resolveAccessibilityLiveRegion',
      () {
    test('maps polite and assertive to live region', () {
      expect(
        resolveOneUiInputDynamicTextLiveRegion(
            OneUiInputDynamicTextAriaLive.polite),
        isTrue,
      );
      expect(
        resolveOneUiInputDynamicTextLiveRegion(
            OneUiInputDynamicTextAriaLive.assertive),
        isTrue,
      );
    });

    test('maps off to no live region', () {
      expect(
        resolveOneUiInputDynamicTextLiveRegion(
            OneUiInputDynamicTextAriaLive.off),
        isFalse,
      );
      expect(resolveOneUiInputDynamicTextLiveRegion(null), isFalse);
    });
  });

  group('resolveOneUiInputDynamicTextContentA11y', () {
    test('no live region by default', () {
      final a11y = resolveOneUiInputDynamicTextContentA11y();
      expect(a11y.liveRegion, isFalse);
    });

    test('forwards polite live region', () {
      final a11y = resolveOneUiInputDynamicTextContentA11y(
        ariaLive: OneUiInputDynamicTextAriaLive.polite,
      );
      expect(a11y.liveRegion, isTrue);
    });
  });

  group('typography + button size mapping', () {
    test('body size steps per Figma row', () {
      expect(oneUiInputDynamicTextBodySize(OneUiInputLabelSize.s), 'XS');
      expect(oneUiInputDynamicTextBodySize(OneUiInputLabelSize.m), 'S');
      expect(oneUiInputDynamicTextBodySize(OneUiInputLabelSize.l), 'M');
    });

    test('trailing button f-steps', () {
      expect(oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize.s), 8);
      expect(oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize.m), 10);
      expect(oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize.l), 12);
    });
  });

  group('OneUiInputDynamicText widget — functionality', () {
    testWidgets('renders content and trailing button', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(
            content: '0 / 280 characters',
            end: 'Helper Button',
          ),
        ),
      );
      await pumpInputInternalsLayout(tester);
      expect(find.text('0 / 280 characters'), findsOneWidget);
      expect(trailingDynamicTextButtonFinder(), findsOneWidget);
      expect(find.text('Helper Button'), findsOneWidget);
    });

    testWidgets('returns shrink when empty', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(const OneUiInputDynamicText()),
      );
      await pumpInputInternalsLayout(tester);
      expect(find.byType(OneUiInputDynamicText), findsOneWidget);
      expect(trailingDynamicTextButtonFinder(), findsNothing);
      expect(find.byType(SizedBox), findsWidgets);
    });

    testWidgets('content-only omits trailing button', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(content: '0/100 characters'),
        ),
      );
      await tester.pump();
      expect(find.text('0/100 characters'), findsOneWidget);
      expect(trailingDynamicTextButtonFinder(), findsNothing);
    });

    testWidgets('end-only aligns trailing button', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(end: 'Help'),
        ),
      );
      await tester.pump();
      expect(trailingDynamicTextButtonFinder(), findsOneWidget);
      expect(find.text('Help'), findsOneWidget);
    });

    testWidgets('default payload encodes m size', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(
            content: 'Dynamic text',
            end: 'Helper Button',
          ),
        ),
      );
      await tester.pump();
      expect(
        find.byKey(
          const ValueKey<String>('oneui-input-dynamic-text|data-size=m'),
        ),
        findsOneWidget,
      );
    });

    testWidgets('string size alias resolves in widget', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(
            size: 'l',
            content: 'Large row',
          ),
        ),
      );
      await tester.pump();
      expect(
        find.byKey(
          const ValueKey<String>('oneui-input-dynamic-text|data-size=l'),
        ),
        findsOneWidget,
      );
    });

    testWidgets('testId exposes ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(
            content: 'x',
            testId: 'dynamic-text',
          ),
        ),
      );
      await tester.pump();
      expect(find.byKey(const ValueKey('dynamic-text')), findsOneWidget);
    });

    testWidgets('onEndClick invokes callback', (tester) async {
      var tapped = false;
      await tester.pumpWidget(
        pumpInputInternalsApp(
          OneUiInputDynamicText(
            end: 'Clear',
            onEndClick: () => tapped = true,
          ),
        ),
      );
      await tester.pump();
      await tester.tap(trailingDynamicTextButtonFinder());
      await pumpInputInternalsLayout(tester);
      expect(tapped, isTrue);
    });
  });

  group('OneUiInputDynamicText semantics — web + mobile parity', () {
    testWidgetsAllPlatforms('polite aria-live on leading copy', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(
            content: 'Updating: 12 / 100 characters',
            ariaLive: OneUiInputDynamicTextAriaLive.polite,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expectSemanticsLiveRegions(tester, count: 1);
        expect(find.text('Updating: 12 / 100 characters'), findsOneWidget);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('assertive aria-live on leading copy',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(
            content: 'Count',
            ariaLive: OneUiInputDynamicTextAriaLive.assertive,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expectSemanticsLiveRegions(tester, count: 1);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('no live region when aria-live omitted',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(content: 'Static copy'),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(semanticsWithLiveRegionFinder(), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('endAriaLabel surfaces on trailing button',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(
            end: 'Helper Button',
            endAriaLabel: 'Open helper',
          ),
        ),
      );
      await pumpInputInternalsLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = trailingDynamicTextButtonSemantics(tester);
        expect(data.label, contains('Open helper'));
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('accessibilityHint on trailing button',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(
            end: 'Help',
            endAriaLabel: 'Help action',
            accessibilityHint: 'Opens contextual help',
          ),
        ),
      );
      await pumpInputInternalsLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = trailingDynamicTextButtonSemantics(tester);
        expect(data.label, contains('Help action'));
        expect(data.hint, contains('Opens contextual help'));
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('disabled trailing button is not enabled',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputDynamicText(
            end: 'Clear',
            endAriaLabel: 'Clear field',
            disabled: true,
          ),
        ),
      );
      await pumpInputInternalsLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = trailingDynamicTextButtonSemantics(tester);
        expect(data.label, contains('Clear field'));
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });
  });
}
