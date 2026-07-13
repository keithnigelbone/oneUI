/// Cap-ratio + translate math — port of `TouchSlider.shared.ts` / `.test.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/touch_slider_cap_ratio.dart';

void main() {
  const trackLength = 138.0;
  const thickness = 32.0;

  group('computeTouchSliderCapRatio', () {
    test('matches Figma 138×32 geometry', () {
      expect(
        computeTouchSliderCapRatio(trackLength, thickness),
        closeTo(16 / 138, 0.0001),
      );
    });
  });

  group('isTouchSliderStartSlotOnRail', () {
    final capRatio = computeTouchSliderCapRatio(trackLength, thickness);

    test('sharp @ min greys start slot on rail', () {
      expect(isTouchSliderStartSlotOnRail(0, capRatio, 'sharp'), isTrue);
    });

    test('rounded never greys start slot', () {
      expect(isTouchSliderStartSlotOnRail(0, capRatio, 'rounded'), isFalse);
    });

    test('sharp @ 50% fill is on fill not rail', () {
      expect(isTouchSliderStartSlotOnRail(0.5, capRatio, 'sharp'), isFalse);
    });
  });

  group('touchSliderFillExtentPx', () {
    test('value 50 fills exactly half the track', () {
      expect(
        touchSliderFillExtentPx(
          fillRatio: 0.5,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'rounded',
          hasStartSlot: true,
        ),
        trackLength / 2,
      );
    });

    test('rounded + start @ min keeps one cap thickness', () {
      expect(
        touchSliderFillExtentPx(
          fillRatio: 0,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'rounded',
          hasStartSlot: true,
        ),
        thickness,
      );
    });

    test('sharp @ min is empty', () {
      expect(
        touchSliderFillExtentPx(
          fillRatio: 0,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'sharp',
          hasStartSlot: true,
        ),
        0,
      );
    });
  });

  group('touchSliderVerticalTranslateFraction', () {
    test('value 0 slides fill fully off bottom (translate 100%)', () {
      expect(
        touchSliderVerticalTranslateFraction(
          fillRatio: 0,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'sharp',
          hasStartSlot: false,
        ),
        1.0,
      );
    });

    test('value 100 parks fill at top (translate 0%)', () {
      expect(
        touchSliderVerticalTranslateFraction(
          fillRatio: 1,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'sharp',
          hasStartSlot: false,
        ),
        0.0,
      );
    });

    test('value 50 is halfway (translate 50%)', () {
      expect(
        touchSliderVerticalTranslateFraction(
          fillRatio: 0.5,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'sharp',
          hasStartSlot: false,
        ),
        0.5,
      );
    });

    test('rounded + start @ min clamps cap under icon', () {
      final ceiling = 1.0 - thickness / trackLength;
      expect(
        touchSliderVerticalTranslateFraction(
          fillRatio: 0,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'rounded',
          hasStartSlot: true,
        ),
        closeTo(ceiling, 0.0001),
      );
    });
  });

  group('touchSliderHorizontalTranslateFraction', () {
    test('value 0 slides fill fully off left', () {
      expect(
        touchSliderHorizontalTranslateFraction(
          fillRatio: 0,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'sharp',
          hasStartSlot: false,
        ),
        -1.0,
      );
    });

    test('value 100 parks fill flush right', () {
      expect(
        touchSliderHorizontalTranslateFraction(
          fillRatio: 1,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'sharp',
          hasStartSlot: false,
        ),
        0.0,
      );
    });
  });
}
