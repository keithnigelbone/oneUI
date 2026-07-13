/// Logo visual-regression tests — LIGHT. Captures golden PNGs of the real
/// rendered mark/wordmark across the Figma matrix: every size preset (XS…XL),
/// mark vs full variant geometry, and the disabled opacity state.
///
/// The content is a deterministic inline SVG (zero network), while the
/// surrounding TOKENS (logo `currentColor` → `--Logo-color` / `--Primary-Bold`,
/// size px) resolve from the real Jio fixture — byte-identical to the
/// qa-playground:flutter app.
///
/// REQUIRES NETWORK (Convex Jio fixture). Generate baselines with:
///   flutter test --update-goldens test/components/logo/logo_golden_test.dart
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import '../../support/components/logo_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // sizes — 5 baselines
  group('[golden] Logo — sizes', () {
    for (final size in [
      OneUiLogoSize.xs,
      OneUiLogoSize.s,
      OneUiLogoSize.m,
      OneUiLogoSize.l,
      OneUiLogoSize.xl,
    ]) {
      testWidgets('size ${size.name}', (tester) async {
        await pumpLogoJioHarness(
          tester,
          OneUiLogo(alt: 'x', size: size, svgContent: kQaLogoMarkSvg),
          width: 120,
          height: 120,
        );
        await expectLater(
          logoShellBoxFinder().first,
          matchesGoldenFile('goldens/logo_size_${size.name}.png'),
        );
      });
    }
  });

  // variants — 2 baselines
  group('[golden] Logo — variants', () {
    testWidgets('mark (square)', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', variant: OneUiLogoVariant.mark, size: OneUiLogoSize.xl, svgContent: kQaLogoMarkSvg),
        width: 120,
        height: 120,
      );
      await expectLater(
        logoShellBoxFinder().first,
        matchesGoldenFile('goldens/logo_variant_mark.png'),
      );
    });

    testWidgets('full (wordmark)', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', variant: OneUiLogoVariant.full, size: OneUiLogoSize.xl, svgContent: kQaLogoWordmarkSvg),
        width: 240,
        height: 120,
      );
      await expectLater(
        logoShellBoxFinder().first,
        matchesGoldenFile('goldens/logo_variant_full.png'),
      );
    });
  });

  // state — 1 baseline
  group('[golden] Logo — state', () {
    testWidgets('disabled (opacity)', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', size: OneUiLogoSize.xl, disabled: true, svgContent: kQaLogoMarkSvg),
        width: 120,
        height: 120,
      );
      await expectLater(
        logoRootFinder(),
        matchesGoldenFile('goldens/logo_state_disabled.png'),
      );
    });
  });
}
