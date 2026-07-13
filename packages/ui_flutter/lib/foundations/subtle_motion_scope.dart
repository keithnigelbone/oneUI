import 'package:flutter/widgets.dart';

import '../engine/native_design_system_payload.dart';
import '../theme/one_ui_scope.dart';

/// Mirrors web Storybook `subtleMotion` — zeroes scale/fill settle durations while
/// keeping colour transitions on `--Motion-Duration-XS`.
NativeDesignSystemPayload designSystemWithSubtleMotion(
  NativeDesignSystemPayload base, {
  bool touchSlider = false,
}) {
  final merged = Map<String, String>.from(base.componentCustomProperties);
  if (touchSlider) {
    merged['--Motion-Duration-M'] = '0ms';
  } else {
    merged['--Motion-Duration-L'] = '0ms';
    merged['--Motion-Duration-M'] = '0ms';
  }
  return NativeDesignSystemPayload(
    componentCustomProperties: merged,
    dimensionContexts: base.dimensionContexts,
    activeDimensionKey: base.activeDimensionKey,
    activeDimensionContext: base.activeDimensionContext,
  );
}

/// Re-wraps [child] with a design-system override when [subtleMotion] is true.
Widget oneUiSubtleMotionScope({
  required BuildContext context,
  required bool subtleMotion,
  required Widget child,
  bool touchSlider = false,
}) {
  if (!subtleMotion) return child;
  final scope = OneUiScope.of(context);
  final base = OneUiScope.designSystemOf(context);
  if (base == null) return child;
  return OneUiScope(
    platformId: scope.platformId,
    density: scope.density,
    nativeTypography: OneUiScope.nativeTypographyOf(context),
    designSystem: designSystemWithSubtleMotion(base, touchSlider: touchSlider),
    child: child,
  );
}
