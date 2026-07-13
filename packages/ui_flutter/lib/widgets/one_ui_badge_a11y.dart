/// Badge accessibility — `badgeA11y.test.ts` / web `role="status"`.
library;

import 'package:flutter/widgets.dart';

import 'one_ui_avatar.dart';
import 'one_ui_counter_badge.dart';
import 'one_ui_icon.dart';
import 'one_ui_indicator_badge.dart';

class OneUiBadgeSemantics {
  const OneUiBadgeSemantics({
    required this.accessible,
    required this.label,
    this.hint,
    required this.isLiveRegion,
    required this.usesTextRole,
  });

  final bool accessible;
  final String? label;
  final String? hint;

  /// Web `role="status"` / RN `accessibilityLiveRegion: 'polite'`.
  final bool isLiveRegion;

  /// RN `accessibilityRole: 'text'` when visible children exist.
  final bool usesTextRole;
}

/// Resolved a11y plan — mirrors RN `getBadgeRootAccessibilityProps` +
/// `getBadgeVisibleTextAccessibilityProps` + `shouldExposeOffscreenBadgeLabel`.
class OneUiBadgeA11yPlan {
  const OneUiBadgeA11yPlan({
    required this.label,
    this.hint,
    required this.rootAccessible,
    required this.emitAnonymousStatusRegion,
    this.anonymousStatusLabel,
    required this.hideSlotsFromA11y,
    required this.hideVisualTextFromA11y,
    required this.exposeVisibleTextToA11y,
    required this.offscreenBadgeLabel,
    required this.hasPlainTextChild,
    required this.hasWidgetChild,
  });

  final String? label;
  final String? hint;
  final bool rootAccessible;

  /// Web `role="status"` when a widget [child] has no derivable label — AT still
  /// sees a live region (BADGE-A11Y-001); distinct from labelled root access.
  final bool emitAnonymousStatusRegion;

  /// Best-effort label from an immediate widget [child] (e.g. `Text('Beta')`).
  /// Drives [OneUiStatusSemantics] so TalkBack announces label changes.
  final String? anonymousStatusLabel;

  final bool hideSlotsFromA11y;
  final bool hideVisualTextFromA11y;
  final bool exposeVisibleTextToA11y;
  final bool offscreenBadgeLabel;
  final bool hasPlainTextChild;
  final bool hasWidgetChild;
}

/// RN `badgeChildrenArePlainText`.
bool badgeChildrenArePlainText(Object? child) {
  return child is String || child is num;
}

/// Visible plain-text payload — never uses [Object.toString] for widgets.
String? badgePlainTextChild(Object? child) {
  if (child is String) {
    return child.trim().isEmpty ? null : child;
  }
  if (child is num) return child.toString();
  return null;
}

bool badgeChildIsWidget(Object? child) => child is Widget;

/// RN `badgeChildrenExposeAccessibility` — immediate child only.
String? badgeWidgetChildAccessibilityLabel(Widget child) {
  if (child is Text) {
    final data = child.data?.trim();
    if (data != null && data.isNotEmpty) return data;
    final spanText = child.textSpan?.toPlainText(includeSemanticsLabels: false);
    if (spanText != null && spanText.trim().isNotEmpty) return spanText.trim();
  }
  if (child is Semantics) {
    final label = child.properties.label?.trim();
    if (label != null && label.isNotEmpty) return label;
    final value = child.properties.value?.trim();
    if (value != null && value.isNotEmpty) return value;
  }
  return null;
}

void warnUnlabeledWidgetChildOneUiBadge() {
  assert(() {
    debugPrint(
      'OneUiBadge: widget `child` has no derivable accessibility label. '
      'Set `semanticsLabel` or pass plain String/num children so TalkBack '
      'can announce live-region updates (BADGE-A11Y-001).',
    );
    return true;
  }());
}

/// RN `badgeSlotNodeExposesAccessibility`.
bool badgeSlotExposesAccessibility(Widget? slot) {
  if (slot == null) return false;
  if (slot is OneUiCounterBadge) {
    final explicit = slot.semanticsLabel?.trim();
    if (explicit != null && explicit.isNotEmpty) return true;
    if (slot.value == 0 && !slot.showZero) return false;
    return true;
  }
  if (slot is OneUiIndicatorBadge) {
    return slot.semanticsLabel.trim().isNotEmpty;
  }
  if (slot is OneUiAvatar) {
    if (slot.excludeFromSemantics) return false;
    return slot.alt.trim().isNotEmpty;
  }
  if (slot is OneUiIcon) {
    if (slot.excludeFromSemantics == true) return false;
    return slot.semanticsLabel?.trim().isNotEmpty == true;
  }
  return false;
}

bool badgeSlotsExposeAccessibility({Widget? start, Widget? end}) {
  return badgeSlotExposesAccessibility(start) ||
      badgeSlotExposesAccessibility(end);
}

String? resolveOneUiBadgeAccessibilityLabel({
  String? semanticsLabel,
  Object? child,
}) {
  if (semanticsLabel != null && semanticsLabel.trim().isEmpty) {
    assert(() {
      debugPrint(
        'OneUiBadge: `semanticsLabel` must not be whitespace-only.',
      );
      return true;
    }());
  }

  final explicit = semanticsLabel?.trim();
  if (explicit != null && explicit.isNotEmpty) return explicit;
  if (badgeChildrenArePlainText(child)) {
    final text = badgePlainTextChild(child);
    if (text != null && text.isNotEmpty) return text;
  }
  return null;
}

OneUiBadgeA11yPlan resolveOneUiBadgeA11yPlan({
  String? semanticsLabel,
  Object? child,
  String? semanticsHint,
  Widget? start,
  Widget? end,
}) {
  final label = resolveOneUiBadgeAccessibilityLabel(
    semanticsLabel: semanticsLabel,
    child: child,
  );
  final slotsExpose = badgeSlotsExposeAccessibility(start: start, end: end);
  final hasPlainTextChild =
      badgeChildrenArePlainText(child) && badgePlainTextChild(child) != null;
  final hasWidgetChild = badgeChildIsWidget(child);

  final rootAccessible = label != null && !slotsExpose;

  final hideSlotsFromA11y = label != null && !slotsExpose;

  final hideVisualTextFromA11y =
      hasPlainTextChild && label != null && !slotsExpose;

  final exposeVisibleTextToA11y =
      hasPlainTextChild && (slotsExpose || label == null);

  final offscreenBadgeLabel =
      label != null && !hasPlainTextChild && slotsExpose;

  final emitAnonymousStatusRegion =
      label == null && !slotsExpose && !hasPlainTextChild;

  final anonymousStatusLabel = emitAnonymousStatusRegion && child is Widget
      ? badgeWidgetChildAccessibilityLabel(child)
      : null;

  return OneUiBadgeA11yPlan(
    label: label,
    hint: semanticsHint,
    rootAccessible: rootAccessible,
    emitAnonymousStatusRegion: emitAnonymousStatusRegion,
    anonymousStatusLabel: anonymousStatusLabel,
    hideSlotsFromA11y: hideSlotsFromA11y,
    hideVisualTextFromA11y: hideVisualTextFromA11y,
    exposeVisibleTextToA11y: exposeVisibleTextToA11y,
    offscreenBadgeLabel: offscreenBadgeLabel,
    hasPlainTextChild: hasPlainTextChild,
    hasWidgetChild: hasWidgetChild,
  );
}

/// Dev warning — `Badge.tsx` when widget child has no derivable label.
void warnUnlabeledEmptyOneUiBadge() => warnUnlabeledWidgetChildOneUiBadge();

OneUiBadgeSemantics resolveOneUiBadgeSemantics({
  String? semanticsLabel,
  Object? child,
  String? semanticsHint,
  bool hasVisibleText = false,
}) {
  final label = resolveOneUiBadgeAccessibilityLabel(
    semanticsLabel: semanticsLabel,
    child: child,
  );
  return OneUiBadgeSemantics(
    accessible: label != null,
    label: label,
    hint: semanticsHint,
    isLiveRegion: true,
    usesTextRole: hasVisibleText,
  );
}
