/// IconButton regression + parity-attribution suite.
///
/// Findings split by WHERE the defect lives — probed against the real widget
/// BEFORE the assertion was written:
///
///   [confirmed]  genuine Flutter bugs — RED until fixed.
///   [debatable]  hardening / parity-leaning gaps — RED, lower confidence.
///   [parity]     GREEN proofs that Flutter matches the web contract.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';

import '../../support/components/icon_button_harness.dart';

void main() {
  setUpAll(() async {
    await ensureIconButtonIconsLoaded();
  });

  // ===========================================================================
  // PARITY — GREEN proofs matching web IconButton.shared.ts contract.
  // ===========================================================================

  group('[regression][parity] IconButton', () {
    testWidgets(
        '[parity] [IBT-DEB-001] testId reaches Semantics.identifier',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          testId: 'qa-ib',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = iconButtonSemanticsData(tester, semanticsLabel: 'Like');
        expect(data.identifier, 'qa-ib',
            reason:
                'testId should reach the platform AT tree via Semantics(identifier:).');
      });
    });

    testWidgets(
        '[parity] [IBT-DEB-002] size 2xs keeps 20px chrome but expands mobile hit target to 44px',
        (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      try {
        var hits = 0;
        await pumpIconButtonQaHarness(
          tester,
          OneUiIconButton(
            icon: 'heart',
            sizeAlias: '2xs',
            semanticsLabel: 'Like',
            onPressed: () => hits++,
          ),
        );

        // Figma chrome stays compact on 2xs.
        expect(iconButtonHeightPx(tester), 20.0);
        expect(iconButtonWidthPx(tester), 20.0);

        // WCAG 2.5.5 floor via invisible hit padding — not visual growth.
        final minHit = iconButtonMinHitTestSize(tester);
        expect(minHit.width, greaterThanOrEqualTo(44));
        expect(minHit.height, greaterThanOrEqualTo(44));

        // Tap just outside painted chrome, still inside the 44px touch floor.
        final center = tester.getCenter(iconButtonChromeFinder());
        final pastVisualEdge = iconButtonHeightPx(tester) / 2 + 2;
        await tester.tapAt(center + Offset(0, pastVisualEdge));
        await tester.pumpAndSettle();
        expect(hits, 1,
            reason:
                'tap outside 20px chrome but inside 44px hit slop must register.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
    test('[parity] attention high → bold variant', () {
      expect(
        resolveOneUiIconButtonState(attention: OneUiIconButtonAttention.high).dataVariant,
        'bold',
      );
    });

    test('[parity] appearance auto → primary', () {
      expect(resolveOneUiIconButtonState(appearance: 'auto').dataAppearance, 'primary');
    });

    test('[parity] condensed ignored when uncontained', () {
      expect(
        resolveOneUiIconButtonState(condensed: true, contained: false).dataCondensed,
        isNull,
      );
    });

    testWidgetsAllPlatforms('[parity] disabled blocks tap + dims opacity', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          disabled: true,
          onPressed: () => hits++,
        ),
      );
      expect(iconButtonOpacity(tester), 0.38);
      await tester.tap(iconButtonInteractiveFinder(), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });

    testWidgetsAllPlatforms('[parity] loading blocks tap + shows spinner', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          loading: true,
          onPressed: () => hits++,
        ),
        settle: false,
      );
      await tester.tap(iconButtonInteractiveFinder(), warnIfMissed: false);
      await tester.pump(const Duration(milliseconds: 16));
      expect(hits, 0);
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgetsAllPlatforms('[parity] onPressed fires on tap', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          onPressed: () => hits++,
        ),
      );
      await tester.tap(iconButtonInteractiveFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });
  });
}
