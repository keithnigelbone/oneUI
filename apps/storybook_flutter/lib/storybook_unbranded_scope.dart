/// Storybook re-exports — prefer `package:ui_flutter/brand/default_design_system.dart`.
library;

export 'package:ui_flutter/brand/default_design_system.dart';

import 'package:ui_flutter/brand/default_design_system.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/tokens/platform_foundation_config.dart';

NativeDesignSystemPayload storybookUnbrandedDesignSystem({required String activeDimensionKey}) {
  return defaultUnbrandedDesignSystem(activeDimensionKey: activeDimensionKey);
}

NativeDesignSystemPayload mergeStorybookManifestFallback(
  NativeDesignSystemPayload convex, {
  required String activeDimensionKey,
}) {
  return mergeComponentTokenManifestFallback(
    convex,
    activeDimensionKey: activeDimensionKey,
  );
}

NativeTypographySnapshot? storybookUnbrandedNativeTypography({
  required String platformId,
  required String density,
  required NativeDesignSystemPayload designSystem,
  PlatformsFoundationConfig? platformsFoundationConfig,
}) {
  return defaultUnbrandedNativeTypography(
    platformId: platformId,
    density: density,
    designSystem: designSystem,
    platformsFoundationConfig: platformsFoundationConfig,
  );
}
