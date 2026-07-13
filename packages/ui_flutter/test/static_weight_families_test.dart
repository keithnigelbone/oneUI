import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/static_weight_families.dart';

void main() {
  group('static_weight_families', () {
    test('buildStaticWeightFamilyMap produces Prefix-Suffix keys', () {
      final map = buildStaticWeightFamilyMap('JioTypeUI');
      expect(map[400], 'JioTypeUI-Regular');
      expect(map[700], 'JioTypeUI-Bold');
      expect(map[900], 'JioTypeUI-Black');
    });

    test('snapToStandardCssWeight rounds to nearest 100', () {
      expect(snapToStandardCssWeight(456), 500);
      expect(snapToStandardCssWeight(850), 900);
      expect(snapToStandardCssWeight(50), 100);
      expect(snapToStandardCssWeight(950), 900);
    });

    test('typographySlotForRole maps roles to slots', () {
      expect(typographySlotForRole('label'), 'primary');
      expect(typographySlotForRole('body'), 'primary');
      expect(typographySlotForRole('headline'), 'secondary');
      expect(typographySlotForRole('code'), 'code');
    });

    test('resolveStaticWeightFamily snaps before lookup', () {
      final map = buildStaticWeightFamilyMap('JioTypeUI');
      expect(resolveStaticWeightFamily(map, 680), 'JioTypeUI-Bold');
      expect(resolveStaticWeightFamily(null, 700), isNull);
    });

    test('mergeStaticWeightFamilyConfig merges prefix and explicit overrides',
        () {
      final merged = mergeStaticWeightFamilyConfig(
        prefix: {'primary': 'JioTypeUI'},
        explicit: {
          'primary': {700: 'Custom-Bold'},
        },
      );
      expect(merged?['primary']?[400], 'JioTypeUI-Regular');
      expect(merged?['primary']?[700], 'Custom-Bold');
    });

    test(
        'staticWeightFamiliesFromTypographyConfig unwraps typographyV2 envelope',
        () {
      final families = staticWeightFamiliesFromTypographyConfig({
        'typographyV2': {
          'fontSelection': {'textFontId': 'preset:jiotype'}
        },
        'staticWeightFamilyPrefix': {
          'primary': 'JioTypeUI',
          'secondary': 'JioTypeUI'
        },
      });
      expect(families?['primary']?[700], 'JioTypeUI-Bold');
      expect(families?['secondary']?[900], 'JioTypeUI-Black');
    });
  });
}
