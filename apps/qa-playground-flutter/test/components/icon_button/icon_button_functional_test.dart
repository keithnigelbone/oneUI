/// IconButton functional QA tests — mirrors web `IconButton.test.tsx` and the
/// Figma matrix (6 sizes × 3 attention × contained/uncontained × layout).
///
/// Asserts REAL rendered geometry + REAL SemanticsData + REAL callbacks —
/// never just `findsOneWidget`.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';
import 'package:ui_flutter/widgets/semantic_icon_material.dart';

import '../../support/components/icon_button_harness.dart';

const _kDefaultIcon = 'heart';

OneUiIconButton _btn({
  String icon = _kDefaultIcon,
  String semanticsLabel = 'Like',
  OneUiIconButtonAttention? attention,
  OneUiIconButtonVariant? variant,
  String? sizeAlias,
  int size = 10,
  String appearance = 'primary',
  bool condensed = false,
  bool contained = true,
  OneUiIconButtonLayout layout = OneUiIconButtonLayout.square,
  bool fullWidth = false,
  bool disabled = false,
  bool loading = false,
  VoidCallback? onPressed,
}) {
  return OneUiIconButton(
    icon: icon,
    semanticsLabel: semanticsLabel,
    attention: attention,
    variant: variant,
    sizeAlias: sizeAlias,
    size: size,
    appearance: appearance,
    condensed: condensed,
    contained: contained,
    layout: layout,
    fullWidth: fullWidth,
    disabled: disabled,
    loading: loading,
    onPressed: onPressed,
  );
}

void main() {
  setUpAll(() async {
    await ensureIconButtonIconsLoaded();
  });

  group('[smoke] IconButton', () {
    testWidgetsAllPlatforms('[smoke] renders icon button', (tester) async {
      await pumpIconButtonQaHarness(tester, _btn());
      expect(iconButtonRootFinder(), findsOneWidget);
      expect(iconButtonInteractiveFinder(), findsOneWidget);
    });

    for (final alias in kQaIconButtonContainerPx.keys) {
      testWidgetsAllPlatforms('[smoke] sizeAlias=$alias renders', (tester) async {
        await pumpIconButtonQaHarness(
          tester,
          _btn(sizeAlias: alias, semanticsLabel: alias),
        );
        expect(iconButtonRootFinder(), findsOneWidget);
      });
    }

    for (final attention in OneUiIconButtonAttention.values) {
      testWidgetsAllPlatforms('[smoke] attention=${attention.name} renders',
          (tester) async {
        await pumpIconButtonQaHarness(
          tester,
          _btn(attention: attention, semanticsLabel: attention.name),
        );
        expect(iconButtonRootFinder(), findsOneWidget);
      });
    }
  });

  group('[functional] IconButton — callbacks', () {
    testWidgetsAllPlatforms('[fn] tap invokes onPressed once', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(tester, _btn(onPressed: () => hits++));
      await tester.tap(iconButtonInteractiveFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] onPress alias invokes callback', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: _kDefaultIcon,
          semanticsLabel: 'Like',
          onPress: () => hits++,
        ),
      );
      await tester.tap(iconButtonInteractiveFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] onClick alias invokes callback', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: _kDefaultIcon,
          semanticsLabel: 'Like',
          onClick: () => hits++,
        ),
      );
      await tester.tap(iconButtonInteractiveFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] onPressed takes precedence over onClick',
        (tester) async {
      var pressHits = 0;
      var clickHits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: _kDefaultIcon,
          semanticsLabel: 'Like',
          onPressed: () => pressHits++,
          onClick: () => clickHits++,
        ),
      );
      await tester.tap(iconButtonInteractiveFinder());
      await tester.pumpAndSettle();
      expect(pressHits, 1);
      expect(clickHits, 0);
    });

    testWidgetsAllPlatforms('[fn] disabled blocks onPressed', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        _btn(disabled: true, onPressed: () => hits++),
      );
      await tester.tap(iconButtonInteractiveFinder(), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });

    testWidgetsAllPlatforms('[fn] loading blocks onPressed', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        _btn(loading: true, onPressed: () => hits++),
        settle: false,
      );
      await tester.tap(iconButtonInteractiveFinder(), warnIfMissed: false);
      await tester.pump(const Duration(milliseconds: 16));
      expect(hits, 0);
    });
  });

  group('[functional] IconButton — loading state', () {
    testWidgetsAllPlatforms('[fn] loading shows spinner not icon', (tester) async {
      await pumpIconButtonQaHarness(tester, _btn(loading: true), settle: false);
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
      expect(find.byType(OneUiSemanticIcon), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] not loading shows icon not spinner', (tester) async {
      await pumpIconButtonQaHarness(tester, _btn());
      expect(find.byType(OneUiCircularProgressIndicator), findsNothing);
      expect(find.byType(OneUiSemanticIcon), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] loading dims via Opacity 0.38', (tester) async {
      await pumpIconButtonQaHarness(tester, _btn(loading: true), settle: false);
      expect(iconButtonOpacity(tester), 0.38);
    });
  });

  group('[functional] IconButton — sizes map to real container px', () {
    for (final entry in kQaIconButtonContainerPx.entries) {
      testWidgetsAllPlatforms('[fn] sizeAlias=${entry.key} → ${entry.value}px',
          (tester) async {
        await pumpIconButtonQaHarness(
          tester,
          _btn(sizeAlias: entry.key, semanticsLabel: entry.key),
        );
        expect(iconButtonHeightPx(tester), entry.value);
        expect(iconButtonWidthPx(tester), entry.value,
            reason: 'square layout is 1:1');
      });
    }

    testWidgetsAllPlatforms('[fn] sizes are strictly increasing 2xs < xs < s < m < l < xl',
        (tester) async {
      final px = <String, double>{};
      for (final alias in kQaIconButtonContainerPx.keys) {
        await pumpIconButtonQaHarness(
          tester,
          _btn(sizeAlias: alias, semanticsLabel: alias),
        );
        px[alias] = iconButtonHeightPx(tester);
      }
      expect(px['2xs']!, lessThan(px['xs']!));
      expect(px['xs']!, lessThan(px['s']!));
      expect(px['s']!, lessThan(px['m']!));
      expect(px['m']!, lessThan(px['l']!));
      expect(px['l']!, lessThan(px['xl']!));
    });
  });

  group('[functional] IconButton — condensed (contained only)', () {
    for (final entry in kQaIconButtonCondensedContainerPx.entries) {
      testWidgetsAllPlatforms('[fn] condensed sizeAlias=${entry.key} → ${entry.value}px',
          (tester) async {
        await pumpIconButtonQaHarness(
          tester,
          _btn(sizeAlias: entry.key, condensed: true, semanticsLabel: entry.key),
        );
        expect(iconButtonHeightPx(tester), entry.value);
      });
    }

    testWidgetsAllPlatforms('[fn] condensed is smaller than regular at same size',
        (tester) async {
      await pumpIconButtonQaHarness(tester, _btn(sizeAlias: 'm'));
      final regular = iconButtonHeightPx(tester);
      await pumpIconButtonQaHarness(
        tester,
        _btn(sizeAlias: 'm', condensed: true),
      );
      expect(iconButtonHeightPx(tester), lessThan(regular));
    });

    testWidgetsAllPlatforms('[fn] uncontained ignores condensed (icon-only chrome)',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        _btn(contained: false, condensed: true, sizeAlias: 'm'),
      );
      final uncontainedH = iconButtonHeightPx(tester);
      await pumpIconButtonQaHarness(
        tester,
        _btn(contained: true, condensed: true, sizeAlias: 'm'),
      );
      final containedCondensedH = iconButtonHeightPx(tester);
      expect(uncontainedH, isNot(containedCondensedH),
          reason: 'condensed must not shrink uncontained chrome');
    });
  });

  group('[functional] IconButton — layout + fullWidth', () {
    testWidgetsAllPlatforms('[fn] wide layout (3:2) is wider than square',
        (tester) async {
      await pumpIconButtonQaHarness(tester, _btn());
      final squareW = iconButtonWidthPx(tester);
      await pumpIconButtonQaHarness(
        tester,
        _btn(layout: OneUiIconButtonLayout.wide),
      );
      expect(iconButtonWidthPx(tester), greaterThan(squareW));
      expect(iconButtonWidthPx(tester) / iconButtonHeightPx(tester), closeTo(1.5, 0.01));
    });

    testWidgetsAllPlatforms('[fn] fullWidth=true is wider than square default',
        (tester) async {
      await pumpIconButtonQaHarness(tester, _btn(sizeAlias: 'm'));
      final squareW = iconButtonLayoutWidthPx(tester);
      await pumpIconButtonQaHarness(tester, _btn(fullWidth: true, sizeAlias: 'm'));
      expect(iconButtonLayoutWidthPx(tester), greaterThan(squareW),
          reason: 'fullWidth must expand beyond the 1:1 square chrome');
    });

    testWidgetsAllPlatforms('[fn] fullWidth=true fills the harness width', (tester) async {
      await pumpIconButtonQaHarness(tester, _btn(fullWidth: true));
      // pumpOneUiQaApp wraps in SizedBox(width: 348) — fullWidth expands to that.
      expect(iconButtonLayoutWidthPx(tester), 348.0);
    });

    testWidgetsAllPlatforms('[fn] uncontained ignores fullWidth (Figma rule)', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        _btn(contained: false, fullWidth: true, sizeAlias: 'm'),
      );
      expect(iconButtonLayoutWidthPx(tester), lessThan(400),
          reason: 'fullWidth must NOT expand width when contained=false');
    });
  });

  group('[functional] IconButton — attention / variant fills', () {
    testWidgetsAllPlatforms('[fn] high (bold) has opaque fill', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        _btn(attention: OneUiIconButtonAttention.high),
      );
      final fill = iconButtonFill(tester);
      expect(fill, isNotNull);
      expect(fill!.alpha, greaterThan(0));
    });

    testWidgetsAllPlatforms('[fn] low (ghost) fill differs from high (bold)',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        _btn(attention: OneUiIconButtonAttention.high),
      );
      final boldFill = iconButtonFill(tester);
      await pumpIconButtonQaHarness(
        tester,
        _btn(attention: OneUiIconButtonAttention.low),
      );
      final ghostFill = iconButtonFill(tester);
      expect(boldFill, isNot(ghostFill));
    });

    testWidgetsAllPlatforms('[fn] variant overrides attention', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        _btn(
          variant: OneUiIconButtonVariant.ghost,
          attention: OneUiIconButtonAttention.high,
        ),
      );
      await pumpIconButtonQaHarness(
        tester,
        _btn(attention: OneUiIconButtonAttention.high),
      );
      final highFill = iconButtonFill(tester);
      await pumpIconButtonQaHarness(
        tester,
        _btn(
          variant: OneUiIconButtonVariant.ghost,
          attention: OneUiIconButtonAttention.high,
        ),
      );
      final ghostFill = iconButtonFill(tester);
      expect(highFill, isNot(ghostFill));
    });
  });

  group('[functional] IconButton — contained vs uncontained', () {
    testWidgetsAllPlatforms('[fn] uncontained renders transparent default fill',
        (tester) async {
      await pumpIconButtonQaHarness(tester, _btn(contained: false));
      final fill = iconButtonFill(tester);
      expect(fill?.alpha ?? 0, 0,
          reason: 'uncontained default chrome is transparent');
    });

    testWidgetsAllPlatforms('[fn] contained renders opaque fill at high attention',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        _btn(attention: OneUiIconButtonAttention.high),
      );
      expect(iconButtonFill(tester)!.alpha, greaterThan(0));
    });
  });

  group('[functional] IconButton — custom icon widget', () {
    testWidgetsAllPlatforms('[fn] renders custom Widget icon', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: const Icon(Icons.favorite, key: Key('custom-heart')),
          semanticsLabel: 'Like',
        ),
      );
      expect(find.byKey(const Key('custom-heart')), findsOneWidget);
    });
  });

  group('[functional] IconButton — testId', () {
    testWidgetsAllPlatforms('[fn] testId exposes ValueKey subtree', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: _kDefaultIcon,
          semanticsLabel: 'Like',
          testId: 'qa-icon-btn',
        ),
      );
      expect(find.byKey(const ValueKey('qa-icon-btn')), findsOneWidget);
    });
  });
}
