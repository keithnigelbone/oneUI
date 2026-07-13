import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/widgets.dart';
import 'package:ui_flutter/utils/viewport_to_platform.dart';

/// Handheld native app (iOS/Android phone) — not web, not tablet, not widget tests.
bool isHandheldNativeDemo(BuildContext context) {
  if (kIsWeb) return false;
  return MediaQuery.sizeOf(context).shortestSide < 600;
}

/// Preview frame width parsed from V2 platform ids (`S-360` → 360, `L-1440` → 1440).
double? previewWidthFromPlatformId(String platformId) {
  final parts = platformId.split('-');
  if (parts.length != 2) return null;
  return double.tryParse(parts[1]);
}

/// Default platform from physical viewport (mobile browser, desktop browser, etc.).
String initialPlatformIdForViewport(double viewportWidth) =>
    viewportToV2PlatformId(viewportWidth);

/// Max content width — simulates the selected platform breakpoint on wide browsers.
double shopContentMaxWidth({
  required double viewportWidth,
  required String platformId,
}) {
  // Native apps use the full device width — platform id only affects tokens.
  if (!kIsWeb) return viewportWidth;
  final frame = previewWidthFromPlatformId(platformId);
  if (frame == null) return viewportWidth;
  if (viewportWidth <= frame) return viewportWidth;
  return frame;
}

/// Elevated preview chrome when a **desktop browser** simulates a narrower platform.
bool showPhoneFramePreview({
  required double viewportWidth,
  required String platformId,
  required double contentMaxWidth,
  required double frameGapPx,
}) {
  if (!kIsWeb) return false;
  return viewportWidth > contentMaxWidth + frameGapPx;
}

/// Side-by-side bag / checkout columns — desktop platforms only.
bool isWideCommerceLayout(String platformId) => platformId.startsWith('L-');
