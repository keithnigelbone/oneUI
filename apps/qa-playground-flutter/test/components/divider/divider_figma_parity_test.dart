/// Divider Figma-parity QA suite — `[figma]`.
///
/// Exercises EVERY value of the Figma Divider API against the real widget,
/// asserting actual rendered behaviour (stroke px via `tester.getSize`, rounded
/// caps via the real `BoxDecoration`, line-segment count, centre slot) plus the
/// pure resolution contract. Runs offline on the synthetic measurement harness;
/// per-role STROKE COLOURS (live brand palette) are covered by the Jio goldens.
///
/// Figma API surface (from the design):
///   orientation  horizontal | vertical
///   size         s | m | l            (stroke width)
///   slot/content none | icon | label
///   contentAlign center | start | end
///   appearance   auto | neutral | primary | secondary | sparkle | positive |
///                negative | warning | informative
///   attention    high | medium | low
///   roundCaps    true | false
///
/// Verified facts (probed before writing): stroke s=0.5 m=1 l=1.5px ;
/// roundCaps default TRUE ; center→2 lines, start/end→1 ; auto→neutral.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/divider_harness.dart';

const _kFigmaAppearances = <String>[
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

void main() {
  // ===========================================================================
  // ORIENTATION — horizontal vs vertical.
  // ===========================================================================

  group('[figma] Divider — orientation', () {
    testWidgetsAllPlatforms('[figma] horizontal stroke is the HEIGHT', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(orientation: 'horizontal', size: 'l'));
      expect(dividerStrokePx(tester, horizontal: true), kQaDividerStrokePx['l']);
    });

    testWidgetsAllPlatforms('[figma] vertical stroke is the WIDTH', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(orientation: 'vertical', size: 'l'));
      expect(dividerStrokePx(tester, horizontal: false), kQaDividerStrokePx['l']);
    });

    test('[figma] orientation is carried through state unchanged', () {
      expect(resolveOneUiDividerState(orientation: 'vertical').orientation, 'vertical');
      expect(resolveOneUiDividerState(orientation: 'horizontal').orientation, 'horizontal');
    });
  });

  // ===========================================================================
  // SIZE — s / m / l map to real stroke px.
  // ===========================================================================

  group('[figma] Divider — size', () {
    for (final entry in kQaDividerStrokePx.entries) {
      testWidgetsAllPlatforms('[figma] size=${entry.key} → ${entry.value}px stroke', (tester) async {
        await pumpDividerQaHarness(tester, OneUiDivider(size: entry.key));
        expect(dividerStrokePx(tester, horizontal: true), entry.value);
      });
    }

    test('[figma] unknown size falls back to M', () {
      expect(resolveDividerSize('xxl'), 'm');
      expect(resolveDividerSize(null), 'm');
    });
  });

  // ===========================================================================
  // SLOT / CONTENT — none | icon | label (web `text` alias normalises to label).
  // ===========================================================================

  group('[figma] Divider — slot/content', () {
    testWidgetsAllPlatforms('[figma] content=none → bare line, no slot', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider());
      expect(find.byType(OneUiIcon), findsNothing);
      expect(dividerHiddenLineSegmentCount(tester), 0);
    });

    testWidgetsAllPlatforms('[figma] content=icon renders the icon slot', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'icon', child: OneUiIcon(icon: 'check')),
      );
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] content=label renders the text slot', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', child: 'Section'),
      );
      expect(find.text('Section'), findsOneWidget);
    });

    test('[figma] content normalisation (web text → label; unknown → none)', () {
      expect(normalizeOneUiDividerContent('text'), 'label');
      expect(normalizeOneUiDividerContent('label'), 'label');
      expect(normalizeOneUiDividerContent('icon'), 'icon');
      expect(normalizeOneUiDividerContent('bogus'), 'none');
      expect(normalizeOneUiDividerContent(null), 'none');
    });
  });

  // ===========================================================================
  // CONTENT ALIGN — center | start | end.
  // ===========================================================================

  group('[figma] Divider — contentAlign', () {
    const expectedSegments = {'center': 2, 'start': 1, 'end': 1};
    for (final entry in expectedSegments.entries) {
      testWidgetsAllPlatforms('[figma] align=${entry.key} → ${entry.value} flanking line(s)',
          (tester) async {
        await pumpDividerQaHarness(
          tester,
          OneUiDivider(content: 'label', contentAlign: entry.key, child: 'OR'),
        );
        expect(dividerHiddenLineSegmentCount(tester), entry.value);
      });
    }
  });

  // ===========================================================================
  // APPEARANCE — 8 roles render; auto resolves to neutral.
  // ===========================================================================

  group('[figma] Divider — appearance', () {
    for (final app in _kFigmaAppearances) {
      testWidgetsAllPlatforms('[figma] appearance=$app paints a line', (tester) async {
        await pumpDividerQaHarness(tester, OneUiDivider(appearance: app));
        expect(dividerLineColor(tester), isNotNull);
        expect(
          resolveOneUiDividerState(appearance: app).resolvedAppearance,
          app,
        );
      });
    }

    test('[figma] appearance=auto resolves to neutral', () {
      expect(resolveOneUiDividerState(appearance: 'auto').resolvedAppearance, 'neutral');
      expect(resolveOneUiDividerState().resolvedAppearance, 'neutral');
    });
  });

  // ===========================================================================
  // ATTENTION — high | medium | low shift the stroke colour tier.
  // ===========================================================================

  group('[figma] Divider — attention', () {
    testWidgetsAllPlatforms('[figma] high / medium / low paint distinct colours', (tester) async {
      final colors = <String, Color?>{};
      for (final att in ['high', 'medium', 'low']) {
        await pumpDividerQaHarness(tester, OneUiDivider(attention: att));
        colors[att] = dividerLineColor(tester);
      }
      expect(colors['high'], isNot(colors['low']));
      expect(colors['medium'], isNot(colors['low']));
    });
  });

  // ===========================================================================
  // ROUND CAPS — true | false.
  // ===========================================================================

  group('[figma] Divider — roundCaps', () {
    testWidgetsAllPlatforms('[figma] roundCaps=true → rounded ends', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(roundCaps: true));
      expect(dividerLineIsRounded(tester), isTrue);
    });

    testWidgetsAllPlatforms('[figma] roundCaps=false → square ends', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(roundCaps: false));
      expect(dividerLineIsRounded(tester), isFalse);
    });
  });

  // ===========================================================================
  // FULL MATRIX — orientation × size renders with the right stroke px.
  // ===========================================================================

  group('[figma] Divider — orientation × size matrix', () {
    for (final orientation in ['horizontal', 'vertical']) {
      for (final size in ['s', 'm', 'l']) {
        testWidgetsAllPlatforms('[figma] $orientation / $size', (tester) async {
          await pumpDividerQaHarness(
            tester,
            OneUiDivider(orientation: orientation, size: size),
          );
          final horizontal = orientation == 'horizontal';
          expect(dividerStrokePx(tester, horizontal: horizontal), kQaDividerStrokePx[size]);
        });
      }
    }
  });
}
