import 'package:flutter/material.dart';

import '../widgets/one_ui_touch_slider.dart';
import 'touch_slider_showcase.dart';

/// Web `Interactive` story — single touch slider, drag to change value.
class TouchSliderInteractiveStoryPage extends StatefulWidget {
  const TouchSliderInteractiveStoryPage({super.key});

  @override
  State<TouchSliderInteractiveStoryPage> createState() =>
      _TouchSliderInteractiveStoryPageState();
}

class _TouchSliderInteractiveStoryPageState
    extends State<TouchSliderInteractiveStoryPage> {
  double _value = 40;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(touchSliderStoryGap(context, '12')),
        child: OneUiTouchSlider(
          value: _value,
          onValueChange: (v) => setState(() => _value = v),
          ariaLabel: 'Interactive touch slider',
        ),
      ),
    );
  }
}
