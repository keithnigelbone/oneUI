/// IconButton Figma-parity QA suite — `[figma]`.
///
/// Exercises EVERY value of the Figma IconButton API against the real widget,
/// asserting actual rendered behaviour on the synthetic measurement harness
/// (offline). Per-role FILL COLOURS are covered by Jio goldens.
///
/// Figma API surface:
///   size        2xs | xs | s | m | l | xl
///   attention   high | medium | low
///   appearance  auto | neutral | primary | secondary | negative | positive |
///               informative | warning
///   shape       1:1 | 3:2
///   condensed   true | false  (contained only)
///   contained   true | false
///   fullWidth   true | false  (contained only)
///   disabled    true | false
///   loading     true | false
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';

import '../../support/components/icon_button_harness.dart';

void main() {
  // Preload the SVG icon catalog in real-async setUpAll. Without this, the first
  // `pumpIconButtonQaHarness` triggers a lazy `ensureIconButtonIconsLoaded()`
  // inside the fake-async testWidgets zone, where the asset load never completes
  // and the test hangs to the 10-minute timeout (see functional/a11y suites).
  setUpAll(() async {
    await ensureIconButtonIconsLoaded();
  });

  group('[figma] IconButton — size', () {
    for (final entry in kQaIconButtonContainerPx.entries) {
      testWidgetsAllPlatforms('[figma] size=${entry.key} → ${entry.value}px chrome',
          (tester) async {
        await pumpIconButtonQaHarness(
          tester,
          OneUiIconButton(
            icon: 'heart',
            sizeAlias: entry.key,
            semanticsLabel: entry.key,
          ),
        );
        expect(iconButtonHeightPx(tester), entry.value);
      });
    }

    testWidgetsAllPlatforms('[figma] default size is m (40px)', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(icon: 'heart', semanticsLabel: 'Like'),
      );
      expect(iconButtonHeightPx(tester), kQaIconButtonContainerPx['m']);
    });
  });

  group('[figma] IconButton — attention', () {
    test('[figma] attention→variant mapping (IconButton.shared.ts)', () {
      expect(
        resolveOneUiIconButtonState(
          attention: OneUiIconButtonAttention.high,
        ).dataVariant,
        'bold',
      );
      expect(
        resolveOneUiIconButtonState(
          attention: OneUiIconButtonAttention.medium,
        ).dataVariant,
        'subtle',
      );
      expect(
        resolveOneUiIconButtonState(
          attention: OneUiIconButtonAttention.low,
        ).dataVariant,
        'ghost',
      );
    });

    for (final attention in OneUiIconButtonAttention.values) {
      testWidgetsAllPlatforms('[figma] attention=${attention.name} renders',
          (tester) async {
        await pumpIconButtonQaHarness(
          tester,
          OneUiIconButton(
            icon: 'heart',
            attention: attention,
            semanticsLabel: attention.name,
          ),
        );
        expect(iconButtonInteractiveFinder(), findsOneWidget);
      });
    }

    testWidgetsAllPlatforms('[figma] high vs low fill differs', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          attention: OneUiIconButtonAttention.high,
          semanticsLabel: 'High',
        ),
      );
      final highFill = iconButtonFill(tester);
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          attention: OneUiIconButtonAttention.low,
          semanticsLabel: 'Low',
        ),
      );
      expect(highFill, isNot(iconButtonFill(tester)));
    });
  });

  group('[figma] IconButton — appearance', () {
    for (final app in kQaIconButtonFigmaAppearances) {
      testWidgetsAllPlatforms('[figma] appearance=$app renders contained button',
          (tester) async {
        await pumpIconButtonQaHarness(
          tester,
          OneUiIconButton(
            icon: 'heart',
            appearance: app,
            semanticsLabel: app,
          ),
        );
        expect(iconButtonFill(tester), isNotNull);
      });
    }

    test('[figma] appearance=auto resolves to primary', () {
      expect(resolveOneUiIconButtonState(appearance: 'auto').dataAppearance, 'primary');
    });
  });

  group('[figma] IconButton — shape / layout', () {
    testWidgetsAllPlatforms('[figma] shape 1:1 is square', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(icon: 'heart', semanticsLabel: 'Like'),
      );
      expect(iconButtonWidthPx(tester), iconButtonHeightPx(tester));
    });

    testWidgetsAllPlatforms('[figma] shape 3:2 is 1.5× wider', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          layout: OneUiIconButtonLayout.wide,
          semanticsLabel: 'Like',
        ),
      );
      expect(iconButtonWidthPx(tester) / iconButtonHeightPx(tester), closeTo(1.5, 0.01));
    });

    test('[figma] wide layout emits data-layout 3:2', () {
      expect(
        resolveOneUiIconButtonState(layout: OneUiIconButtonLayout.wide).dataLayout,
        '3:2',
      );
    });
  });

  group('[figma] IconButton — condensed (contained only)', () {
    testWidgetsAllPlatforms('[figma] condensed shrinks container', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(icon: 'heart', semanticsLabel: 'Like'),
      );
      final regular = iconButtonHeightPx(tester);
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          condensed: true,
          semanticsLabel: 'Like',
        ),
      );
      expect(iconButtonHeightPx(tester), lessThan(regular));
    });

    test('[figma] condensed ignored when uncontained', () {
      expect(
        resolveOneUiIconButtonState(condensed: true, contained: false).dataCondensed,
        isNull,
      );
    });
  });

  group('[figma] IconButton — contained / fullWidth', () {
    testWidgetsAllPlatforms('[figma] uncontained has transparent fill', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          contained: false,
          semanticsLabel: 'Like',
        ),
      );
      expect(iconButtonFill(tester)?.alpha ?? 0, 0);
    });

    testWidgetsAllPlatforms('[figma] fullWidth expands beyond square chrome', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(icon: 'heart', semanticsLabel: 'Like'),
      );
      final squareW = iconButtonLayoutWidthPx(tester);
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          fullWidth: true,
          semanticsLabel: 'Like',
        ),
      );
      expect(iconButtonLayoutWidthPx(tester), greaterThan(squareW));
    });
  });

  group('[figma] IconButton — disabled', () {
    testWidgetsAllPlatforms('[figma] disabled dims via Opacity 0.38', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          disabled: true,
          semanticsLabel: 'Like',
        ),
      );
      expect(iconButtonOpacity(tester), 0.38);
    });

    testWidgetsAllPlatforms('[figma] enabled opacity is 1.0', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(icon: 'heart', semanticsLabel: 'Like'),
      );
      expect(iconButtonOpacity(tester), 1.0);
    });
  });

  group('[figma] IconButton — loading', () {
    testWidgetsAllPlatforms('[figma] loading replaces icon with spinner', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          loading: true,
          semanticsLabel: 'Like',
        ),
        settle: false,
      );
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
    });

    test('[figma] loading emits data-loading', () {
      expect(resolveOneUiIconButtonState(loading: true).dataLoading, isTrue);
    });
  });
}
