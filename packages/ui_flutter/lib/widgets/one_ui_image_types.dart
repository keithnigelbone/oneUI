/// Portable Image API — mirrors `Image.shared.ts` / `interface.ts` (RN subset).
library;

import 'package:flutter/foundation.dart';

/// Browser `loading` / Figma code-only — no-op on IO; accepted for API parity.
enum OneUiImageLoadingStrategy {
  auto,
  lazy,
  eager,
}

extension OneUiImageLoadingStrategyX on OneUiImageLoadingStrategy {
  static OneUiImageLoadingStrategy fromWire(String? raw) {
    switch (raw?.trim().toLowerCase()) {
      case 'lazy':
        return OneUiImageLoadingStrategy.lazy;
      case 'eager':
        return OneUiImageLoadingStrategy.eager;
      case 'error':
      case 'empty':
      case 'auto':
      default:
        return OneUiImageLoadingStrategy.auto;
    }
  }
}

enum OneUiImageAspectRatio {
  auto,
  r1x1,
  r1x2,
  r2x1,
  r2x3,
  r3x2,
  r3x4,
  r4x3,
  r9x16,
  r16x9,
  r9x21,
  r21x9,
}

/// Canonical resize modes (RN + Flutter). Extended CSS keywords map to [cover].
enum OneUiImageObjectFit {
  cover,
  contain,
  fill,
  none,
  scaleDown,
}

extension OneUiImageAspectRatioX on OneUiImageAspectRatio {
  /// Wire value: `16:9`, `auto`, …
  String get wireValue => switch (this) {
        OneUiImageAspectRatio.auto => 'auto',
        OneUiImageAspectRatio.r1x1 => '1:1',
        OneUiImageAspectRatio.r1x2 => '1:2',
        OneUiImageAspectRatio.r2x1 => '2:1',
        OneUiImageAspectRatio.r2x3 => '2:3',
        OneUiImageAspectRatio.r3x2 => '3:2',
        OneUiImageAspectRatio.r3x4 => '3:4',
        OneUiImageAspectRatio.r4x3 => '4:3',
        OneUiImageAspectRatio.r9x16 => '9:16',
        OneUiImageAspectRatio.r16x9 => '16:9',
        OneUiImageAspectRatio.r9x21 => '9:21',
        OneUiImageAspectRatio.r21x9 => '21:9',
      };

  static OneUiImageAspectRatio fromWire(String? raw) {
    switch (raw) {
      case '1:1':
        return OneUiImageAspectRatio.r1x1;
      case '1:2':
        return OneUiImageAspectRatio.r1x2;
      case '2:1':
        return OneUiImageAspectRatio.r2x1;
      case '2:3':
        return OneUiImageAspectRatio.r2x3;
      case '3:2':
        return OneUiImageAspectRatio.r3x2;
      case '3:4':
        return OneUiImageAspectRatio.r3x4;
      case '4:3':
        return OneUiImageAspectRatio.r4x3;
      case '9:16':
        return OneUiImageAspectRatio.r9x16;
      case '16:9':
        return OneUiImageAspectRatio.r16x9;
      case '9:21':
        return OneUiImageAspectRatio.r9x21;
      case '21:9':
        return OneUiImageAspectRatio.r21x9;
      default:
        return OneUiImageAspectRatio.auto;
    }
  }

  /// Flutter [AspectRatio.aspectRatio] value; `null` when [auto].
  double? get numeric => switch (this) {
        OneUiImageAspectRatio.auto => null,
        OneUiImageAspectRatio.r1x1 => 1,
        OneUiImageAspectRatio.r1x2 => 0.5,
        OneUiImageAspectRatio.r2x1 => 2,
        OneUiImageAspectRatio.r2x3 => 2 / 3,
        OneUiImageAspectRatio.r3x2 => 1.5,
        OneUiImageAspectRatio.r3x4 => 0.75,
        OneUiImageAspectRatio.r4x3 => 4 / 3,
        OneUiImageAspectRatio.r9x16 => 9 / 16,
        OneUiImageAspectRatio.r16x9 => 16 / 9,
        OneUiImageAspectRatio.r9x21 => 9 / 21,
        OneUiImageAspectRatio.r21x9 => 21 / 9,
      };
}

extension OneUiImageObjectFitX on OneUiImageObjectFit {
  static OneUiImageObjectFit resolve(
      {OneUiImageObjectFit? fit, OneUiImageObjectFit? objectFit}) {
    return fit ?? objectFit ?? OneUiImageObjectFit.cover;
  }

  /// Figma `container` → CSS `contain`. Extended CSS keywords map to [cover]
  /// (web-only passthrough — no Flutter equivalent).
  static OneUiImageObjectFit fromWire(String? raw) {
    switch (raw?.trim().toLowerCase()) {
      case 'contain':
      case 'container':
        return OneUiImageObjectFit.contain;
      case 'fill':
        return OneUiImageObjectFit.fill;
      case 'none':
        return OneUiImageObjectFit.none;
      case 'scale-down':
        return OneUiImageObjectFit.scaleDown;
      case 'cover':
        return OneUiImageObjectFit.cover;
      case 'inherit':
      case 'initial':
      case 'revert':
      case 'revert-layer':
      case 'unset':
      default:
        return OneUiImageObjectFit.cover;
    }
  }

  static OneUiImageObjectFit normalize({
    OneUiImageObjectFit? fit,
    OneUiImageObjectFit? objectFit,
    String? fitWire,
    String? objectFitWire,
    OneUiImageObjectFit fallback = OneUiImageObjectFit.cover,
  }) {
    if (fit != null) return fit;
    if (objectFit != null) return objectFit;
    if (fitWire != null) return fromWire(fitWire);
    if (objectFitWire != null) return fromWire(objectFitWire);
    return fallback;
  }
}

/// Resolved state — web `useImageState` / RN `useImageState`.
class OneUiImageResolvedState {
  const OneUiImageResolvedState({
    required this.isInteractive,
    required this.isActionable,
    required this.isDisabled,
    required this.aspectRatio,
    required this.resolvedObjectFit,
  });

  final bool isInteractive;
  final bool isActionable;
  final bool isDisabled;
  final OneUiImageAspectRatio aspectRatio;
  final OneUiImageObjectFit resolvedObjectFit;

  Map<String, String> get dataAttributes => {
        if (aspectRatio != OneUiImageAspectRatio.auto)
          'data-aspect-ratio': aspectRatio.wireValue,
      };
}

OneUiImageResolvedState resolveOneUiImageState({
  OneUiImageAspectRatio aspectRatio = OneUiImageAspectRatio.auto,
  bool interactive = false,
  bool disabled = false,
  OneUiImageObjectFit? fit,
  OneUiImageObjectFit? objectFit,
  VoidCallback? onPress,
  VoidCallback? onClick,
}) {
  final isDisabled = disabled;
  final isInteractive = interactive && !isDisabled;
  final isActionable = isInteractive && (onPress != null || onClick != null);
  return OneUiImageResolvedState(
    isInteractive: isInteractive,
    isActionable: isActionable,
    isDisabled: isDisabled,
    aspectRatio: aspectRatio,
    resolvedObjectFit:
        OneUiImageObjectFitX.resolve(fit: fit, objectFit: objectFit),
  );
}
