/// LPI border-radius / stadium cap resolution (Figma track vs indicator split).
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/lpi_size_resolve.dart';

void main() {
  group('[fn] resolveLpiTrackBorderRadiusPx', () {
    test('[fn] roundCaps false → square track (0)', () {
      expect(
        resolveLpiTrackBorderRadiusPx(roundCaps: false, trackHeightPx: 10),
        0,
      );
    });

    test('[fn] roundCaps true → pill track (height/2)', () {
      expect(
        resolveLpiTrackBorderRadiusPx(roundCaps: true, trackHeightPx: 10),
        5,
      );
    });
  });

  group('[fn] resolveLpiIndicatorBorderRadiusPx (deprecated)', () {
    test('[fn] stadium fallback at half height', () {
      expect(resolveLpiIndicatorBorderRadiusPx(trackHeightPx: 10), 5);
      expect(resolveLpiIndicatorBorderRadiusPx(trackHeightPx: 14), 7);
    });

    test('[fn] zero track height → 0', () {
      expect(resolveLpiIndicatorBorderRadiusPx(trackHeightPx: 0), 0);
    });
  });
}
