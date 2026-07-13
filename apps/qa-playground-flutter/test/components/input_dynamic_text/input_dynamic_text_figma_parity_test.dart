/// InputDynamicText Figma-parity QA suite — `[figma]`.
///
/// Exercises every Figma API value against the real widget on the synthetic
/// measurement harness (offline). Per-role COLOURS are covered by Jio goldens.
///
/// Figma API surface:
///   size      s | m | l  → body XS/S/M + button f8/f10/f12
///   content   Text | none
///   end       none | Button
///   disabled  true | false
///   aria-live off | polite | assertive
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text_types.dart';

import '../../support/components/input_dynamic_text_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputDynamicTextIconsLoaded();
  });

  group('[figma] InputDynamicText — size', () {
    for (final entry in {
      's': OneUiInputLabelSize.s,
      'm': OneUiInputLabelSize.m,
      'l': OneUiInputLabelSize.l,
    }.entries) {
      testWidgetsAllPlatforms(
          '[figma] size=${entry.key} → body ${oneUiInputDynamicTextBodySize(entry.value)}',
          (tester) async {
        await pumpInputDynamicTextQaHarness(
          tester,
          OneUiInputDynamicText(
            size: entry.key,
            content: 'Count ${entry.key}',
          ),
        );
        // PROBED: leading Text fontSize from rendered TextStyle.
        final style =
            inputDynamicTextLeadingTextStyle(tester, 'Count ${entry.key}');
        expect(style.fontSize, kQaInputDynamicTextBodyFontSizePx[entry.value]);
      });

      final buttonStep = oneUiInputDynamicTextButtonSizeStep(entry.value);
      testWidgetsAllPlatforms(
          '[figma] size=${entry.key} → button f$buttonStep condensed height (S-360 touch clamp)',
          (tester) async {
        await pumpInputDynamicTextQaHarness(
          tester,
          OneUiInputDynamicText(
            size: entry.key,
            content: '0/100',
            end: 'Go',
          ),
        );
        // PROBED: trailing button height — token f-step, clamped to 44px on S-360.
        expect(
          inputDynamicTextHelperButtonHeightPx(tester),
          closeTo(expectedInputDynamicTextHelperButtonHeightPx(buttonStep), 2),
        );
      });
    }

    test('[figma] body size step mapping', () {
      expect(oneUiInputDynamicTextBodySize(OneUiInputLabelSize.s), 'XS');
      expect(oneUiInputDynamicTextBodySize(OneUiInputLabelSize.m), 'S');
      expect(oneUiInputDynamicTextBodySize(OneUiInputLabelSize.l), 'M');
    });

    test('[figma] button f-step mapping', () {
      expect(oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize.s), 8);
      expect(oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize.m), 10);
      expect(oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize.l), 12);
    });
  });

  group('[figma] InputDynamicText — content slot', () {
    testWidgetsAllPlatforms('[figma] content=Text renders leading copy',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(content: '0 / 100 characters'),
      );
      expect(find.text('0 / 100 characters'), findsOneWidget);
      expect(inputDynamicTextHelperButtonFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[figma] content=none omits leading copy',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(end: 'Helper Button'),
      );
      // PROBED: no Expanded leading slot — only the trailing button renders.
      expect(inputDynamicTextHasLeadingContent(tester), isFalse);
      expect(inputDynamicTextHelperButtonFinder(), findsOneWidget);
    });
  });

  group('[figma] InputDynamicText — end slot', () {
    testWidgetsAllPlatforms('[figma] end=Button renders trailing action',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: 'Dynamic text',
          end: 'Helper Button',
        ),
      );
      expect(find.text('Helper Button'), findsOneWidget);
      expect(inputDynamicTextHelperButtonFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] end=none omits trailing button',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(content: '0/100 characters'),
      );
      expect(inputDynamicTextHelperButtonFinder(), findsNothing);
    });
  });

  group('[figma] InputDynamicText — trailingOnly', () {
    testWidgetsAllPlatforms('[figma] end-only aligns trailing end',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(end: 'Clear'),
      );
      // PROBED: Row mainAxisAlignment == end when trailingOnly.
      expect(inputDynamicTextRowAlignment(tester), MainAxisAlignment.end);
      expect(
        resolveOneUiInputDynamicTextState(end: 'Clear').trailingOnly,
        isTrue,
      );
    });

    testWidgetsAllPlatforms('[figma] content+end uses spaceBetween',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: '12 / 100',
          end: 'Help',
        ),
      );
      expect(
          inputDynamicTextRowAlignment(tester), MainAxisAlignment.spaceBetween);
      expect(
        resolveOneUiInputDynamicTextState(content: '12 / 100', end: 'Help')
            .trailingOnly,
        isFalse,
      );
    });
  });

  group('[figma] InputDynamicText — isEmpty', () {
    testWidgetsAllPlatforms('[figma] empty content+end renders shrink',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(),
      );
      expect(
        resolveOneUiInputDynamicTextState().isEmpty,
        isTrue,
      );
      expect(find.text('Helper Button'), findsNothing);
      expect(inputDynamicTextHelperButtonFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[figma] whitespace-only slots are empty',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(content: '   ', end: '  '),
      );
      expect(
        resolveOneUiInputDynamicTextState(content: '   ', end: '  ').isEmpty,
        isTrue,
      );
      expect(inputDynamicTextHelperButtonFinder(), findsNothing);
    });
  });

  group('[figma] InputDynamicText — disabled', () {
    testWidgetsAllPlatforms('[figma] disabled dims leading copy colour',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: 'Locked',
          disabled: false,
        ),
      );
      final enabledColor =
          inputDynamicTextLeadingTextStyle(tester, 'Locked').color;

      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: 'Locked',
          disabled: true,
        ),
      );
      final disabledColor =
          inputDynamicTextLeadingTextStyle(tester, 'Locked').color;
      // PROBED: disabled content colour differs from enabled.
      expect(disabledColor, isNot(equals(enabledColor)));
    });

    testWidgetsAllPlatforms('[figma] disabled blocks helper button tap',
        (tester) async {
      var hits = 0;
      await pumpInputDynamicTextQaHarness(
        tester,
        OneUiInputDynamicText(
          end: 'Clear',
          disabled: true,
          onEndClick: () => hits++,
        ),
      );
      await tester.tap(inputDynamicTextHelperInteractiveFinder(),
          warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });
  });

  group('[figma] InputDynamicText — aria-live', () {
    for (final live in OneUiInputDynamicTextAriaLive.values) {
      testWidgetsAllPlatforms('[figma] aria-live=${live.name}', (tester) async {
        await pumpInputDynamicTextQaHarness(
          tester,
          OneUiInputDynamicText(
            content: 'Count ${live.name}',
            ariaLive: live,
          ),
        );
        withSemanticsHandle(tester, () {
          final expected = live != OneUiInputDynamicTextAriaLive.off;
          if (expected) {
            expect(inputDynamicTextLiveRegionFinder(), findsOneWidget);
          } else {
            expect(inputDynamicTextLiveRegionFinder(), findsNothing);
          }
        });
      });
    }

    test('[figma] aria-live resolver parity', () {
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
      expect(
        resolveOneUiInputDynamicTextLiveRegion(
            OneUiInputDynamicTextAriaLive.off),
        isFalse,
      );
    });
  });
}
