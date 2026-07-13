import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/color_math.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';

/// Mirrors `packages/shared/src/engine/__tests__/surfaceNew.test.ts` core cases.
ColorPalette _greyscale() {
  final palette = <int, String>{};
  for (var i = 0; i < kSurfaceSteps.length; i++) {
    final step = kSurfaceSteps[i];
    final t = i / (kSurfaceSteps.length - 1);
    final v = (t * 255).round();
    final hx = v.toRadixString(16).padLeft(2, '0');
    palette[step] = '#$hx$hx$hx';
  }
  return palette;
}

void main() {
  group('resolveSurface', () {
    final scale = buildScaleDefinition('test', _greyscale(), 1400);

    test('default light/dark', () {
      expect(resolveSurface(kSurfaceDefault, 2500, scale, 1, darkMode: false),
          2500);
      expect(
          resolveSurface(kSurfaceDefault, 2500, scale, 1, darkMode: true), 100);
    });

    test('ghost returns parent', () {
      expect(resolveSurface(kSurfaceGhost, 1400, scale, 1), 1400);
    });

    test('elevated +100 capped', () {
      expect(resolveSurface(kSurfaceElevated, 2000, scale, -1), 2100);
      expect(resolveSurface(kSurfaceElevated, 2500, scale, 1), 2500);
    });

    test('minimal/subtle/moderate offsets', () {
      expect(resolveSurface(kSurfaceMinimal, 2000, scale, -1), 1900);
      expect(resolveSurface(kSurfaceSubtle, 2000, scale, -1), 1800);
      expect(resolveSurface(kSurfaceModerate, 2000, scale, -1), 1700);
      expect(resolveSurface(kSurfaceMinimal, 500, scale, 1), 600);
    });

    test('bold distant parent uses baseStep', () {
      expect(resolveSurface(kSurfaceBold, 2500, scale, -1), 1400);
    });

    test('bold fallback when candidate too close', () {
      final close = buildScaleDefinition('close', _greyscale(), 1500);
      expect(resolveSurface(kSurfaceBold, 1400, close, 1), 700);
    });
  });

  group('resolveTokenSet onBold vs parent content', () {
    test(
        'onBold tinted is re-resolved at bold surface (different from page tinted)',
        () {
      final scale = buildScaleDefinition('test', buildColoredPalette(), 1400);
      final set = resolveTokenSet(scale, 2500, darkMode: false);
      expect(
        set.onBoldContent['tinted']!.blendedHex.toLowerCase(),
        isNot(equals(set.content['tinted']!.blendedHex.toLowerCase())),
      );
    });
  });

  group('preParseRGBPalette — 8-digit #AARRGGBB', () {
    test('#FF0053C8 parses to blue RGB, not fallback grey', () {
      final p = preParseRGBPalette({2400: '#FF0053C8'});
      expect(p[2400], [0x00, 0x53, 0xc8]);
    });

    test('#FFFFFFFF parses as opaque white (CSS RRGG suffix)', () {
      final p = preParseRGBPalette({2500: '#FFFFFFFF'});
      expect(p[2500], [255, 255, 255]);
    });
  });

  group('resolveRolesInsideSurface — single surface-step for all roles', () {
    test(
        'neutral high on primary bold uses container step, not neutral bold step',
        () {
      final primaryPalette = buildColoredPalette();
      final neutralPalette = <int, String>{};
      for (final step in kSurfaceSteps) {
        neutralPalette[step] = primaryPalette[step] == null
            ? '#808080'
            : '#${(255 - int.parse(primaryPalette[step]!.substring(1, 3), radix: 16)).toRadixString(16).padLeft(2, '0')}8888';
      }
      final themeConfig = ThemeConfig(
        appearances: {
          'primary': buildScaleDefinition('primary', primaryPalette, 600),
          'neutral': buildScaleDefinition('neutral', neutralPalette, 1800),
        },
      );

      final wrongPerRole = <String, FlatRoleTokens>{};
      for (final e in themeConfig.appearances.entries) {
        wrongPerRole[e.key] = flattenRoleTokens(
          resolveContextTokenSet(e.value, kSurfaceBold, 2500, false),
        );
      }

      final atContainerStep = resolveRolesInsideSurface(
        themeConfig,
        kSurfaceBold,
        2500,
        false,
        surfaceAppearance: 'primary',
        isRoot: true,
      );

      expect(
        atContainerStep['neutral']!.content['high'],
        isNot(equals(wrongPerRole['neutral']!.content['high'])),
      );
      expect(
        atContainerStep['neutral']!.content['high'],
        equals(
          flattenRoleTokens(
            resolveTokenSet(
              contextScaleForStepLookup(themeConfig.appearances['neutral']!),
              600,
              darkMode: false,
            ),
          ).content['high'],
        ),
      );
    });
  });

  group('contextScaleForStepLookup — anchorBoldToBaseStep', () {
    test('high bold fill inside bold surface contrasts anchored baseStep', () {
      final palette = buildColoredPalette();
      final scale = buildScaleDefinition(
        'primary',
        palette,
        600,
        anchorBoldToBaseStep: true,
      );
      final themeConfig = ThemeConfig(appearances: {'primary': scale});
      final atBoldSurface = resolveRolesInsideSurface(
        themeConfig,
        kSurfaceBold,
        2500,
        false,
        isRoot: true,
      );
      final highFill = atBoldSurface['primary']!.surfaces[kSurfaceBold]!;
      final anchoredBase = palette[600]!.toLowerCase();
      expect(highFill.toLowerCase(), isNot(anchoredBase));
    });
  });

  group('resolveSurfaceStep', () {
    test('root bold honours anchorBoldToBaseStep', () {
      final scale = buildScaleDefinition('primary', buildColoredPalette(), 600,
          anchorBoldToBaseStep: true);
      expect(resolveSurfaceStep(scale, 2500, kSurfaceBold, false, isRoot: true),
          600);
    });

    test('nested bold strips anchor and contrasts container', () {
      final scale = buildScaleDefinition('primary', buildColoredPalette(), 600,
          anchorBoldToBaseStep: true);
      final nested =
          resolveSurfaceStep(scale, 600, kSurfaceBold, false, isRoot: false);
      expect(nested, isNot(600));
    });
  });

  group('resolveContextTokenSet', () {
    test(
        'inner bold contrasts container when anchorBoldToBaseStep (Swadesh / brand-bg parity)',
        () {
      final greyPalette = _greyscale();
      final scale = buildScaleDefinition('primary', greyPalette, 600,
          anchorBoldToBaseStep: true);
      final inner = resolveContextTokenSet(scale, kSurfaceBold, 2500, false);
      expect(inner.parentStep, 600);
      expect(inner.surfaces[kSurfaceBold]!.step, isNot(600));
      expect(
        (inner.surfaces[kSurfaceBold]!.step - inner.parentStep).abs() / 100 >=
            7,
        isTrue,
      );
    });

    test('bold container parentStep is anchored baseStep', () {
      final palette = buildColoredPalette();
      final scale = buildScaleDefinition('mint', palette, 2100,
          anchorBoldToBaseStep: true);
      final inner = resolveContextTokenSet(scale, kSurfaceBold, 2500, false);
      expect(inner.parentStep, 2100);
    });
  });
}
