/// InputFeedback types — mirrors `Input.shared.ts` / RN `interface.ts`.
library;

import 'package:flutter/widgets.dart';

/// Figma API size tiers (S / M / L → f8 / f10 / f12).
const List<String> kOneUiInputFeedbackFigmaSizes = ['s', 'm', 'l'];

/// Figma semantic variants.
const List<String> kOneUiInputFeedbackFigmaVariants = [
  'negative',
  'positive',
  'warning',
  'informative',
];

/// Figma attention levels (default `low`).
const List<String> kOneUiInputFeedbackFigmaAttentions = [
  'low',
  'medium',
  'high'
];

/// Semantic colour role.
enum OneUiInputFeedbackVariant {
  negative,
  positive,
  warning,
  informative,
}

/// Visual prominence — low / medium / high.
enum OneUiInputFeedbackAttention { low, medium, high }

/// Figma S / M / L (f8 / f10 / f12).
enum OneUiInputFeedbackSize { s, m, l }

/// Native accessibility role subset.
enum OneUiInputFeedbackRole { alert, status, none }

const kOneUiInputFeedbackVariants = OneUiInputFeedbackVariant.values;
const kOneUiInputFeedbackAttentions = OneUiInputFeedbackAttention.values;
const kOneUiInputFeedbackSizes = OneUiInputFeedbackSize.values;

extension OneUiInputFeedbackVariantX on OneUiInputFeedbackVariant {
  String get wireValue => name;

  String get surfaceRole => switch (this) {
        OneUiInputFeedbackVariant.negative => 'negative',
        OneUiInputFeedbackVariant.positive => 'positive',
        OneUiInputFeedbackVariant.warning => 'warning',
        OneUiInputFeedbackVariant.informative => 'informative',
      };

  String get defaultIconName => switch (this) {
        OneUiInputFeedbackVariant.negative => 'error',
        OneUiInputFeedbackVariant.positive => 'checkCircle',
        OneUiInputFeedbackVariant.warning => 'warning',
        OneUiInputFeedbackVariant.informative => 'info',
      };
}

extension OneUiInputFeedbackSizeX on OneUiInputFeedbackSize {
  String get wireValue => switch (this) {
        OneUiInputFeedbackSize.s => 's',
        OneUiInputFeedbackSize.m => 'm',
        OneUiInputFeedbackSize.l => 'l',
      };

  /// Web `data-size` numeric f-step.
  int get numericStep => switch (this) {
        OneUiInputFeedbackSize.s => 8,
        OneUiInputFeedbackSize.m => 10,
        OneUiInputFeedbackSize.l => 12,
      };
}

/// Accepts t-shirt or numeric f-step (`resolveFeedbackSize` on web).
OneUiInputFeedbackSize resolveOneUiInputFeedbackSize(Object? size) {
  if (size is OneUiInputFeedbackSize) return size;
  if (size is int) {
    if (size <= 8) return OneUiInputFeedbackSize.s;
    if (size >= 12) return OneUiInputFeedbackSize.l;
    return OneUiInputFeedbackSize.m;
  }
  if (size is String) {
    switch (size) {
      case 's':
      case '8':
        return OneUiInputFeedbackSize.s;
      case 'l':
      case '12':
        return OneUiInputFeedbackSize.l;
      case 'm':
      case '10':
        return OneUiInputFeedbackSize.m;
    }
  }
  return OneUiInputFeedbackSize.m;
}

class OneUiInputFeedbackState {
  const OneUiInputFeedbackState({
    required this.resolvedVariant,
    required this.resolvedAttention,
    required this.resolvedSize,
    required this.hasMessage,
    required this.message,
    required this.role,
    required this.liveRegion,
    required this.dataSize,
    required this.dataVariant,
    required this.dataAttention,
  });

  final OneUiInputFeedbackVariant resolvedVariant;
  final OneUiInputFeedbackAttention resolvedAttention;
  final OneUiInputFeedbackSize resolvedSize;
  final bool hasMessage;
  final String? message;
  final OneUiInputFeedbackRole role;
  final OneUiInputFeedbackLiveRegion liveRegion;
  final String dataSize;
  final String dataVariant;
  final String dataAttention;

  /// Web `InputFeedback.tsx` root `data-size` + variant/attention classes parity.
  String get dataPayloadKey =>
      'oneui-input-feedback|data-size=$dataSize|data-variant=$dataVariant|'
      'data-attention=$dataAttention';
}

enum OneUiInputFeedbackLiveRegion { none, polite, assertive }

String? oneUiInputFeedbackResolveMessage({
  String? feedbackMessage,
  Widget? child,
}) {
  if (feedbackMessage != null && feedbackMessage.trim().isNotEmpty) {
    return feedbackMessage.trim();
  }
  if (child is Text) {
    final data = child.data;
    if (data != null && data.trim().isNotEmpty) return data.trim();
  }
  return null;
}

bool oneUiInputFeedbackHasRenderableMessage({
  String? feedbackMessage,
  Widget? child,
}) {
  final message = oneUiInputFeedbackResolveMessage(
    feedbackMessage: feedbackMessage,
    child: child,
  );
  if (message != null && message.isNotEmpty) return true;
  return child != null && child is! Text;
}

OneUiInputFeedbackState resolveOneUiInputFeedbackState({
  OneUiInputFeedbackVariant variant = OneUiInputFeedbackVariant.negative,
  OneUiInputFeedbackAttention attention = OneUiInputFeedbackAttention.low,
  Object? size = OneUiInputFeedbackSize.m,
  String? feedbackMessage,
  Widget? child,
  OneUiInputFeedbackRole? roleOverride,
}) {
  final resolvedSize = resolveOneUiInputFeedbackSize(size);
  final message = oneUiInputFeedbackResolveMessage(
    feedbackMessage: feedbackMessage,
    child: child,
  );
  final hasMessage = oneUiInputFeedbackHasRenderableMessage(
    feedbackMessage: feedbackMessage,
    child: child,
  );

  final role = roleOverride ??
      (variant == OneUiInputFeedbackVariant.negative
          ? OneUiInputFeedbackRole.alert
          : OneUiInputFeedbackRole.status);

  final liveRegion = switch (role) {
    OneUiInputFeedbackRole.alert => OneUiInputFeedbackLiveRegion.assertive,
    OneUiInputFeedbackRole.status => OneUiInputFeedbackLiveRegion.polite,
    OneUiInputFeedbackRole.none => OneUiInputFeedbackLiveRegion.none,
  };

  return OneUiInputFeedbackState(
    resolvedVariant: variant,
    resolvedAttention: attention,
    resolvedSize: resolvedSize,
    hasMessage: hasMessage,
    message: message,
    role: role,
    liveRegion: liveRegion,
    dataSize: '${resolvedSize.numericStep}',
    dataVariant: variant.wireValue,
    dataAttention: attention.name,
  );
}
