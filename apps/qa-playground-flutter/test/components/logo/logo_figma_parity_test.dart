/// Logo Figma parity QA tests — every value of the Figma API, measured offline.
///
/// Figma API (source of truth — [Logo #36]):
///   - `size`: XS | S | M | L | XL | custom  → real laid-out box px
///   - `interactive`: true | false           → real button vs static img role
///
/// Each Figma value is exercised against the REAL widget and asserted on real
/// rendered state (the laid-out `Size`, the focus-interactive button, the
/// semantics flags) — not a snapshot. Size enum wire/alias mappings are checked
/// against the real `resolveOneUiLogoSize` / `oneUiLogoSizeWire` so the t-shirt
/// labels round-trip exactly as Figma emits them.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import '../../support/components/logo_harness.dart';

void main() {
  setUp(clearLogoNetworkCache);
  tearDown(clearLogoNetworkCache);

  // ===========================================================================
  // size — the full XS…XL + custom set.
  // ===========================================================================

  group('[figma] Logo — size enum', () {
    test('[figma] Figma size set is exactly xs/s/m/l/xl/custom', () {
      expect(kOneUiLogoFigmaSizes, ['xs', 's', 'm', 'l', 'xl', 'custom']);
    });

    test('[figma] uppercase t-shirt labels normalise to the canonical enum', () {
      expect(resolveOneUiLogoSize('XS'), OneUiLogoSize.xs);
      expect(resolveOneUiLogoSize('S'), OneUiLogoSize.s);
      expect(resolveOneUiLogoSize('M'), OneUiLogoSize.m);
      expect(resolveOneUiLogoSize('L'), OneUiLogoSize.l);
      expect(resolveOneUiLogoSize('XL'), OneUiLogoSize.xl);
      expect(resolveOneUiLogoSize('CUSTOM'), OneUiLogoSize.custom);
    });

    test('[figma] lowercase wire values normalise to the canonical enum', () {
      for (final wire in kOneUiLogoFigmaSizes) {
        expect(resolveOneUiLogoSize(wire), isA<OneUiLogoSize>());
      }
    });

    test('[figma] unknown size falls back to m', () {
      expect(resolveOneUiLogoSize('jumbo'), OneUiLogoSize.m);
      expect(resolveOneUiLogoSize(null), OneUiLogoSize.m);
    });

    test('[figma] wire value round-trips for every size', () {
      expect(oneUiLogoSizeWire(OneUiLogoSize.xs), 'xs');
      expect(oneUiLogoSizeWire(OneUiLogoSize.s), 's');
      expect(oneUiLogoSizeWire(OneUiLogoSize.m), 'm');
      expect(oneUiLogoSizeWire(OneUiLogoSize.l), 'l');
      expect(oneUiLogoSizeWire(OneUiLogoSize.xl), 'xl');
      expect(oneUiLogoSizeWire(OneUiLogoSize.custom), 'custom');
    });
  });

  // ===========================================================================
  // size — rendered box geometry per Figma value (ascending, distinct).
  // ===========================================================================

  group('[figma] Logo — rendered size box', () {
    for (final entry in kQaLogoSizePx.entries) {
      testWidgetsAllPlatforms('[figma] size=${entry.key.name} renders ${entry.value.toInt()}px',
          (tester) async {
        await pumpLogoQaHarness(
          tester,
          OneUiLogo(alt: 'x', size: entry.key, svgContent: kQaLogoMarkSvg),
        );
        expect(logoBoxSize(tester).height, entry.value);
      });
    }

    testWidgetsAllPlatforms('[figma] sizes are strictly ascending xs<s<m<l<xl', (tester) async {
      final order = [
        OneUiLogoSize.xs,
        OneUiLogoSize.s,
        OneUiLogoSize.m,
        OneUiLogoSize.l,
        OneUiLogoSize.xl,
      ];
      double? prev;
      for (final size in order) {
        await pumpLogoQaHarness(
          tester,
          OneUiLogo(alt: 'x', size: size, svgContent: kQaLogoMarkSvg),
        );
        final h = logoBoxSize(tester).height;
        if (prev != null) {
          expect(h, greaterThan(prev), reason: '${size.name} must be larger than the previous step');
        }
        prev = h;
      }
    });

    testWidgetsAllPlatforms('[figma] size=custom honours an arbitrary pixel size', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'x', size: OneUiLogoSize.custom, customSize: 72, svgContent: kQaLogoMarkSvg),
      );
      expect(logoBoxSize(tester).height, 72);
    });
  });

  // ===========================================================================
  // interactive — true vs false.
  // ===========================================================================

  group('[figma] Logo — interactive', () {
    testWidgetsAllPlatforms('[figma] interactive=false → static img landmark', (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'Acme', svgContent: kQaLogoMarkSvg));
      withSemanticsHandle(tester, () {
        final data = logoRootSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isImage), isTrue);
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse);
      });
      expect(logoInteractiveFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[figma] interactive=true (+ handler + alt) → actionable button', (tester) async {
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'Home', interactive: true, onPress: () {}, svgContent: kQaLogoMarkSvg),
      );
      expect(logoInteractiveFinder(), findsOneWidget);
      withSemanticsHandle(tester, () {
        expect(logoRootSemantics(tester).hasFlag(SemanticsFlag.isButton), isTrue);
      });
    });
  });
}
