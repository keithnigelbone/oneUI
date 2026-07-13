/// Maps viewport width to the V2 platform id used by [dimension_scale.dart].
///
/// Thresholds match [viewportToV2PlatformId] in
/// `packages/shared/src/utils/dimensionCSS.ts` and web `PlatformContext`.
String viewportToV2PlatformId(double viewportWidth) {
  if (viewportWidth <= 767) return 'S';
  if (viewportWidth <= 1023) return 'M';
  return 'L';
}

/// Storybook fixed canvas widths → V2 platform ids (`DEFAULT_PLATFORMS_CONFIG` breakpoints).
String v2PlatformFromBreakpointWidth(int width) {
  switch (width) {
    case 360:
      return 'S';
    case 768:
      return 'M';
    case 1024:
    case 1440:
    case 1920:
      return 'L';
    default:
      return viewportToV2PlatformId(width.toDouble());
  }
}

/// Args for Convex `nativeTheme:getNativeThemeSnapshot` / TS [NativeThemeContext.platform].
///
/// Mirrors `buildNativeTheme` mapping: `S` → `mobile`, tablet breakpoints → `tablet`, desktop → `desktop`.
String nativeThemePlatformArgFromV2Id(String v2PlatformId) {
  switch (v2PlatformId) {
    case 'S':
      return 'mobile';
    case 'M':
      return 'tablet';
    case 'L':
      return 'desktop';
    default:
      return 'mobile';
  }
}
