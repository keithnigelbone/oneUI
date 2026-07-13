/// InputDynamicText types — mirrors `Input.shared.ts` / RN `interface.ts`.
library;

import 'one_ui_input_types.dart';

export 'one_ui_input_types.dart' show OneUiInputLabelSize;

/// Figma API row sizes (S / M / L).
const List<String> kOneUiInputDynamicTextFigmaSizes = ['s', 'm', 'l'];

/// `aria-live` on leading copy (character counts).
enum OneUiInputDynamicTextAriaLive { off, polite, assertive }

/// Validates t-shirt size; unknown values fall back to `'m'`.
OneUiInputLabelSize oneUiResolveInputDynamicTextSize(Object? size) {
  if (size is OneUiInputLabelSize) return size;
  if (size is String) {
    switch (size.trim().toLowerCase()) {
      case 's':
        return OneUiInputLabelSize.s;
      case 'l':
        return OneUiInputLabelSize.l;
      case 'm':
        return OneUiInputLabelSize.m;
    }
  }
  return OneUiInputLabelSize.m;
}

/// Resolved row state — RN `useInputDynamicTextState`.
class OneUiInputDynamicTextState {
  const OneUiInputDynamicTextState({
    required this.size,
    required this.hasContent,
    required this.hasEnd,
    required this.trailingOnly,
    required this.isEmpty,
    required this.isDisabled,
    required this.dataSize,
    required this.dataDisabled,
  });

  final OneUiInputLabelSize size;
  final bool hasContent;
  final bool hasEnd;
  final bool trailingOnly;
  final bool isEmpty;
  final bool isDisabled;
  final String dataSize;
  final bool dataDisabled;

  /// Web `InputDynamicText.tsx` root `data-size` / `data-disabled` parity.
  String get dataPayloadKey => 'oneui-input-dynamic-text|data-size=$dataSize'
      '${dataDisabled ? '|data-disabled=true' : ''}';
}

bool oneUiInputDynamicTextIsNonEmpty(String? value) =>
    value != null && value.trim().isNotEmpty;

OneUiInputDynamicTextState resolveOneUiInputDynamicTextState({
  String? content,
  String? end,
  Object? size = OneUiInputLabelSize.m,
  bool disabled = false,
}) {
  final resolvedSize = oneUiResolveInputDynamicTextSize(size);
  final hasContent = oneUiInputDynamicTextIsNonEmpty(content);
  final hasEnd = oneUiInputDynamicTextIsNonEmpty(end);
  return OneUiInputDynamicTextState(
    size: resolvedSize,
    hasContent: hasContent,
    hasEnd: hasEnd,
    trailingOnly: !hasContent && hasEnd,
    isEmpty: !hasContent && !hasEnd,
    isDisabled: disabled,
    dataSize: resolvedSize.name,
    dataDisabled: disabled,
  );
}

/// Body typography step per Figma row size.
String oneUiInputDynamicTextBodySize(OneUiInputLabelSize size) {
  return switch (size) {
    OneUiInputLabelSize.s => 'XS',
    OneUiInputLabelSize.m => 'S',
    OneUiInputLabelSize.l => 'M',
  };
}

/// Trailing `Button` f-step — web `LABEL_TO_BUTTON_SIZE`.
int oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize size) {
  return switch (size) {
    OneUiInputLabelSize.s => 8,
    OneUiInputLabelSize.m => 10,
    OneUiInputLabelSize.l => 12,
  };
}
