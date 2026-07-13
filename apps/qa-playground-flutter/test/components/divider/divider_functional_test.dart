/// Divider functional QA tests — mirrors web `Divider.test.tsx` +
/// `useDividerState`.
///
/// Runs on the synthetic measurement harness (offline). Every behavioural claim
/// reads REAL rendered state: stroke thickness via `tester.getSize`, the line
/// `BoxDecoration` (colour + rounded caps), the rendered centre slot, and the
/// number of decorative line segments — never a bare `findsOneWidget`.
///
/// Probed facts baked in (see harness): stroke S=0.5 / M=1 / L=1.5px ;
/// roundCaps default TRUE ; contentAlign center→2 lines, start/end→1 line ;
/// auto→neutral ; centre slot renders icon/label.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/divider_harness.dart';

void main() {
  group('[smoke] Divider', () {
    testWidgetsAllPlatforms('[smoke] bare horizontal divider renders', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider());
      expect(dividerRootFinder(), findsOneWidget);
      expect(dividerLineFinder(), findsWidgets);
    });

    testWidgetsAllPlatforms('[smoke] vertical divider renders', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(orientation: 'vertical'));
      expect(dividerRootFinder(), findsOneWidget);
    });
  });

  // ===========================================================================
  // SIZE — stroke thickness resolves from --Stroke-S/M/L.
  // ===========================================================================

  group('[functional] Divider — size → stroke', () {
    for (final entry in kQaDividerStrokePx.entries) {
      testWidgetsAllPlatforms('[fn] size=${entry.key} → ${entry.value}px stroke (horizontal)',
          (tester) async {
        await pumpDividerQaHarness(tester, OneUiDivider(size: entry.key));
        expect(dividerStrokePx(tester, horizontal: true), entry.value);
      });
    }

    testWidgetsAllPlatforms('[fn] unset size defaults to M (1px)', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider());
      expect(dividerStrokePx(tester, horizontal: true), kQaDividerStrokePx['m']);
    });

    testWidgetsAllPlatforms('[fn] stroke thickness is strictly increasing s < m < l', (tester) async {
      final px = <String, double>{};
      for (final s in ['s', 'm', 'l']) {
        await pumpDividerQaHarness(tester, OneUiDivider(size: s));
        px[s] = dividerStrokePx(tester, horizontal: true);
      }
      expect(px['s']!, lessThan(px['m']!));
      expect(px['m']!, lessThan(px['l']!));
    });

    testWidgetsAllPlatforms('[fn] vertical stroke is the WIDTH (L = 1.5px)', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(orientation: 'vertical', size: 'l'));
      expect(dividerStrokePx(tester, horizontal: false), kQaDividerStrokePx['l']);
    });
  });

  // ===========================================================================
  // ROUND CAPS — pill-rounded vs square stroke ends.
  // ===========================================================================

  group('[functional] Divider — roundCaps', () {
    testWidgetsAllPlatforms('[fn] roundCaps=true rounds the stroke ends', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(roundCaps: true));
      expect(dividerLineIsRounded(tester), isTrue);
    });

    testWidgetsAllPlatforms('[fn] roundCaps=false squares the stroke ends', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(roundCaps: false));
      expect(dividerLineIsRounded(tester), isFalse);
    });
  });

  // ===========================================================================
  // CONTENT — none | icon | label, with alignment.
  // ===========================================================================

  group('[functional] Divider — content slot', () {
    testWidgetsAllPlatforms('[fn] content=none renders a single bare line', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider());
      // bare divider: the simple stroke is NOT wrapped in ExcludeSemantics.
      expect(dividerHiddenLineSegmentCount(tester), 0);
      expect(find.byType(OneUiIcon), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] content=label renders the centre text', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', child: 'OR'),
      );
      expect(find.text('OR'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] content=icon renders the centre icon', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'icon', child: OneUiIcon(icon: 'check')),
      );
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] content set but empty child falls back to bare line', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', child: '   '),
      );
      // blank child → hasContent false → bare line, no flanking segments.
      expect(dividerHiddenLineSegmentCount(tester), 0);
    });
  });

  group('[functional] Divider — contentAlign', () {
    testWidgetsAllPlatforms('[fn] center → a line on BOTH sides of the slot', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', contentAlign: 'center', child: 'OR'),
      );
      expect(dividerHiddenLineSegmentCount(tester), 2);
    });

    testWidgetsAllPlatforms('[fn] start → a single trailing line', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', contentAlign: 'start', child: 'OR'),
      );
      expect(dividerHiddenLineSegmentCount(tester), 1);
    });

    testWidgetsAllPlatforms('[fn] end → a single leading line', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', contentAlign: 'end', child: 'OR'),
      );
      expect(dividerHiddenLineSegmentCount(tester), 1);
    });

    testWidgetsAllPlatforms('[fn] start positions the label before the line', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', contentAlign: 'start', child: 'OR'),
      );
      // content at start → label centre sits left of the (only) trailing line centre.
      expect(tester.getCenter(find.text('OR')).dx,
          lessThan(tester.getCenter(dividerLineFinder().first).dx));
    });
  });

  // ===========================================================================
  // COLOUR — the line paints a resolved colour, attention shifts it.
  // ===========================================================================

  group('[functional] Divider — colour', () {
    testWidgetsAllPlatforms('[fn] line paints a resolved non-transparent colour', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider());
      expect(dividerLineColor(tester), isNotNull);
      expect(dividerLineColor(tester), isNot(const Color(0x00000000)));
    });

    testWidgetsAllPlatforms('[fn] high attention differs from low attention', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(attention: 'low'));
      final low = dividerLineColor(tester);
      await pumpDividerQaHarness(tester, const OneUiDivider(attention: 'high'));
      final high = dividerLineColor(tester);
      expect(high, isNot(low),
          reason: 'attention drives the stroke colour tier (low → high)');
    });
  });
}
