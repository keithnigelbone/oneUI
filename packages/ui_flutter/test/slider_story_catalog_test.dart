import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/slider_story_catalog.dart';

void main() {
  test('kSliderStoryNavOrder includes Figma validation sections', () {
    expect(
      kSliderStoryNavOrder.map((s) => s.title).toList(),
      [
        'Docs',
        'Default',
        'Appearances',
        'States',
        'Types',
        'Sizes',
        'Knob Styles',
        'Knob States',
        'With Steps',
        'With Slots',
        'Figma Matrix',
        'Vertical',
        'Surface Context',
        'Motion',
        'Interactive',
      ],
    );
  });
}
