import 'package:flutter/material.dart';

import '../widgets/one_ui_slider.dart';
import 'slider_showcase.dart';

/// Web `Interactive` story — single slider, drag to change value.
class SliderInteractiveStoryPage extends StatefulWidget {
  const SliderInteractiveStoryPage({super.key});

  @override
  State<SliderInteractiveStoryPage> createState() =>
      _SliderInteractiveStoryPageState();
}

class _SliderInteractiveStoryPageState extends State<SliderInteractiveStoryPage> {
  double _value = 30;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(sliderStoryGap(context, '12')),
        child: SizedBox(
          width: 328,
          child: OneUiSlider(
            value: _value,
            onValueChange: (v) => setState(() => _value = v as double),
            ariaLabel: 'Interactive slider',
          ),
        ),
      ),
    );
  }
}
