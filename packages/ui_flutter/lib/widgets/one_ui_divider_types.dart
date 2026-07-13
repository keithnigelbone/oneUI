/// Types for [OneUiDivider] — parity with Figma API table + Convex tokens.
library;

import 'package:flutter/widgets.dart';

import 'one_ui_text_types.dart';

typedef OneUiDividerOrientation = String;
typedef OneUiDividerSize = String;
typedef OneUiDividerContentAlign = String;
typedef OneUiDividerContent = String;
typedef OneUiDividerAppearance = String;
typedef OneUiDividerAttention = String;

const String kOneUiDividerHorizontal = 'horizontal';
const String kOneUiDividerVertical = 'vertical';

const String kOneUiDividerSizeS = 's';
const String kOneUiDividerSizeM = 'm';
const String kOneUiDividerSizeL = 'l';

/// Figma API stroke sizes (S / M / L).
const List<OneUiDividerSize> kOneUiDividerFigmaSizes = [
  kOneUiDividerSizeS,
  kOneUiDividerSizeM,
  kOneUiDividerSizeL,
];

const String kOneUiDividerContentNone = 'none';
const String kOneUiDividerContentIcon = 'icon';

/// Figma `slot=Label` — canonical slot value.
const String kOneUiDividerContentLabel = 'label';

/// Web `content="text"` alias — normalises to [kOneUiDividerContentLabel].
const String kOneUiDividerContentText = 'text';

/// Figma API slot values (`none` / `icon` / `label`).
const List<OneUiDividerContent> kOneUiDividerFigmaSlots = [
  kOneUiDividerContentNone,
  kOneUiDividerContentIcon,
  kOneUiDividerContentLabel,
];

const String kOneUiDividerAlignCenter = 'center';
const String kOneUiDividerAlignStart = 'start';
const String kOneUiDividerAlignEnd = 'end';

/// Figma API appearance roles (`auto` resolves to neutral at runtime).
const List<OneUiDividerAppearance> kOneUiDividerAppearances = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

/// Figma default — rounded stroke ends.
const bool kOneUiDividerRoundCapsDefault = true;

/// Figma slot — centre icon is always 16px (`Icon` size `4`).
const String kOneUiDividerIconSize = '4';

/// Figma label slot — Label XS Medium.
const String kOneUiDividerTextVariant = 'label';
const String kOneUiDividerTextSize = 'XS';
const String kOneUiDividerTextWeight = 'medium';

OneUiDividerSize resolveDividerSize(OneUiDividerSize? size) {
  if (size == null || size.isEmpty) return kOneUiDividerSizeM;
  return kOneUiDividerFigmaSizes.contains(size) ? size : kOneUiDividerSizeM;
}

/// True when centre content should render (Figma slot ≠ `none` + non-empty child).
bool oneUiDividerHasChildren(Object? child) {
  if (child == null) return false;
  if (child is String) return child.trim().isNotEmpty;
  if (child is num) return true;
  if (child is Widget) return true;
  return false;
}

/// Normalise Figma `label` / web `text`; unknown values fall back to `none`.
OneUiDividerContent normalizeOneUiDividerContent(OneUiDividerContent? content) {
  if (content == null || content.isEmpty) return kOneUiDividerContentNone;
  return switch (content) {
    kOneUiDividerContentLabel ||
    kOneUiDividerContentText =>
      kOneUiDividerContentLabel,
    kOneUiDividerContentIcon => kOneUiDividerContentIcon,
    kOneUiDividerContentNone => kOneUiDividerContentNone,
    _ => kOneUiDividerContentNone,
  };
}

class OneUiDividerState {
  const OneUiDividerState({
    required this.orientation,
    required this.size,
    required this.content,
    required this.contentAlign,
    required this.resolvedAppearance,
    required this.attention,
    required this.roundCaps,
    required this.hasContent,
    required this.dataAttrs,
  });

  final OneUiDividerOrientation orientation;
  final OneUiDividerSize size;
  final OneUiDividerContent content;
  final OneUiDividerContentAlign contentAlign;
  final String resolvedAppearance;
  final OneUiDividerAttention attention;
  final bool roundCaps;
  final bool hasContent;

  /// Figma-aligned `data-*` attributes on the root separator.
  final Map<String, String> dataAttrs;

  String get dataPayloadKey => oneUiDividerDataPayloadKey(dataAttrs);
}

Map<String, String> oneUiDividerDataAttrs({
  required OneUiDividerOrientation orientation,
  required OneUiDividerSize size,
  required OneUiDividerAttention attention,
  required OneUiDividerContent content,
  required bool roundCaps,
}) {
  return {
    'data-orientation': orientation,
    'data-size': size,
    'data-attention': attention,
    'data-content': content,
    'data-round-caps': roundCaps ? 'true' : 'false',
  };
}

String oneUiDividerDataPayloadKey(Map<String, String> attrs) {
  final buffer = StringBuffer('oneui-divider');
  for (final entry in attrs.entries) {
    buffer.write('|${entry.key}');
    if (entry.value.isNotEmpty) {
      buffer.write('=${entry.value}');
    }
  }
  return buffer.toString();
}

/// Resolves explicit appearance — web `DividerAppearance` union / RN `interface.ts`.
///
/// `auto` → `neutral`. Unknown roles report in debug and fall back to `neutral`
/// so release builds stay lenient (Flutter has no compile-time union).
String resolveOneUiDividerAppearance(String appearance) {
  final raw = appearance.trim();
  if (raw.isEmpty || raw == 'auto') return 'neutral';
  if (kOneUiDividerAppearances.contains(raw) && raw != 'auto') return raw;
  assert(() {
    FlutterError.reportError(
      FlutterErrorDetails(
        exception: FlutterError(
          'OneUiDivider: unknown appearance "$raw"; falling back to "neutral". '
          'Valid roles: ${kOneUiDividerAppearances.join(', ')}.',
        ),
        library: 'ui_flutter',
        context: ErrorDescription('while resolving OneUiDivider appearance'),
      ),
    );
    return true;
  }());
  return 'neutral';
}

OneUiDividerState resolveOneUiDividerState({
  OneUiDividerOrientation orientation = kOneUiDividerHorizontal,
  OneUiDividerSize? size,
  OneUiDividerContent content = kOneUiDividerContentNone,
  Object? child,
  OneUiDividerContentAlign contentAlign = kOneUiDividerAlignCenter,
  OneUiDividerAppearance appearance = 'auto',
  OneUiDividerAttention attention = 'low',
  bool roundCaps = kOneUiDividerRoundCapsDefault,
}) {
  final resolvedSize = resolveDividerSize(size);
  final resolvedContent = normalizeOneUiDividerContent(content);
  final resolvedAppearance = resolveOneUiDividerAppearance(appearance);
  final hasContent = resolvedContent != kOneUiDividerContentNone &&
      oneUiDividerHasChildren(child);
  final dataAttrs = oneUiDividerDataAttrs(
    orientation: orientation,
    size: resolvedSize,
    attention: attention,
    content: resolvedContent,
    roundCaps: roundCaps,
  );

  return OneUiDividerState(
    orientation: orientation,
    size: resolvedSize,
    content: resolvedContent,
    contentAlign: contentAlign,
    resolvedAppearance: resolvedAppearance,
    attention: attention,
    roundCaps: roundCaps,
    hasContent: hasContent,
    dataAttrs: dataAttrs,
  );
}

String oneUiDividerAttentionToIconEmphasis(OneUiDividerAttention attention) {
  return switch (attention) {
    'high' => 'high',
    'medium' => 'medium',
    _ => 'low',
  };
}

OneUiTextAttention oneUiDividerAttentionToTextAttention(
    OneUiDividerAttention attention) {
  return switch (attention) {
    'high' => OneUiTextAttention.high,
    'medium' => OneUiTextAttention.medium,
    _ => OneUiTextAttention.low,
  };
}
