import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../brand/one_ui_brand_scope.dart';
import '../engine/bottom_navigation_color_resolve.dart';
import '../engine/bottom_navigation_size_resolve.dart';
import '../engine/focus_ring_resolve.dart';
import '../engine/motion_css_static.dart';
import '../engine/motion_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_bottom_nav_item_a11y.dart';
import 'one_ui_bottom_navigation_scope.dart';
import 'one_ui_bottom_navigation_types.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_icon.dart';
import 'one_ui_icon_types.dart';

/// Single item inside [OneUiBottomNavigation] — `BottomNavItem.tsx` / RN peer.
class OneUiBottomNavItem extends StatefulWidget {
  const OneUiBottomNavItem({
    required this.icon,
    super.key,
    this.activeIcon,
    this.label,
    this.value,
    this.active,
    this.href,
    this.onPressed,
    this.onClick,
    this.onTap,
    this.disabled = false,
    this.appearance,
    this.labelType,
    this.type,
    this.semanticsLabel,
    this.ariaLabel,
    this.accessibilityLabel,
    this.semanticsHint,
    this.accessibilityHint,
    this.forceFocusRing = false,
    this.testId,
    this.testID,
  });

  /// Semantic icon name (`String`) or custom glyph (`Widget`).
  final Object icon;

  final Object? activeIcon;
  final String? label;
  final String? value;
  final bool? active;
  final String? href;
  final VoidCallback? onPressed;

  /// Web `onClick` — fires before parent [OneUiBottomNavigation.onValueChange].
  final VoidCallback? onClick;
  final VoidCallback? onTap;
  final bool disabled;
  final OneUiBottomNavigationAppearance? appearance;

  /// Per-item label layout override (web `labelType`).
  final OneUiBottomNavigationLabelType? labelType;

  /// Figma BottomNav.Item `type` — alias for [labelType].
  final String? type;
  final String? semanticsLabel;
  final String? ariaLabel;
  final String? accessibilityLabel;
  final String? semanticsHint;
  final String? accessibilityHint;
  final bool forceFocusRing;
  final String? testId;
  final String? testID;

  @override
  State<OneUiBottomNavItem> createState() => _OneUiBottomNavItemState();
}

class _OneUiBottomNavItemState extends State<OneUiBottomNavItem> {
  bool _hovered = false;

  void _handlePress() {
    if (widget.disabled) return;
    widget.onTap?.call();
    widget.onClick?.call();
    widget.onPressed?.call();
    final nav = OneUiBottomNavigationScope.defaultsOf(context);
    final itemValue = widget.value?.trim();
    if (itemValue != null && itemValue.isNotEmpty) {
      nav.onValueChange?.call(itemValue);
    }
  }

  @override
  Widget build(BuildContext context) {
    OneUiScope.of(context);
    OneUiBrandLoadState.maybeOf(context);
    OneUiSurfaceScope.maybeOf(context);
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed BottomNavItem without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final nav = OneUiBottomNavigationScope.defaultsOf(context);
    final parentAppearance =
        OneUiSurfaceScope.maybeOf(context)?.parentAppearance;
    final itemState = resolveOneUiBottomNavItemState(
      labelType: widget.labelType,
      type: widget.type,
      parentLabelType: nav.labelType,
      appearance: widget.appearance,
      parentAppearance: nav.appearance,
      parentSurfaceAppearance: parentAppearance,
      active: widget.active,
      value: widget.value,
      parentValue: nav.value,
      inNavigationGroup: nav.inNavigationGroup,
      disabled: widget.disabled,
      context: context,
    );
    final labelType = itemState.labelType;
    final resolvedAppearance = itemState.resolvedAppearance;
    final isActive = itemState.isActive;

    if (kDebugMode && labelType == kOneUiBottomNavLabelNone) {
      final resolvedLabel = resolveOneUiBottomNavItemAccessibilityLabel(
        semanticsLabel: widget.semanticsLabel,
        ariaLabel: widget.ariaLabel,
        accessibilityLabel: widget.accessibilityLabel,
        label: widget.label,
        value: widget.value,
      );
      if (resolvedLabel.isEmpty) {
        assert(() {
          debugPrint(
            'OneUiBottomNavItem: provide semanticsLabel, label, or value when '
            'labelType is "none" so each tab has a unique accessible name.',
          );
          return true;
        }());
      }
    }

    final showLabel = labelType != kOneUiBottomNavLabelNone &&
        widget.label != null &&
        widget.label!.isNotEmpty;

    final layout = resolveBottomNavigationLayout(
      context,
      ds,
      labelType: labelType,
    );
    final shellHeight = _effectiveBottomNavItemShellHeight(
      layout: layout,
      labelType: labelType,
      showLabel: showLabel,
    );
    final colors = resolveBottomNavigationColors(
      context,
      ds,
      appearance: resolvedAppearance,
    );

    final effectiveIcon = isActive && widget.activeIcon != null
        ? widget.activeIcon!
        : widget.icon;
    final iconSizeKey = labelType == kOneUiBottomNavLabelNone ? '6' : '5';
    final iconEmphasis =
        isActive ? OneUiIconEmphasis.tintedA11y : OneUiIconEmphasis.low;

    final labelColor = bottomNavLabelColor(isActive: isActive, colors: colors);
    final innerBg =
        _hovered && !widget.disabled ? colors.hover : Colors.transparent;

    final focusRing = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: 'informative',
    );

    final a11y = resolveOneUiBottomNavItemSemantics(
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
      accessibilityLabel: widget.accessibilityLabel,
      label: widget.label,
      value: widget.value,
      semanticsHint: widget.semanticsHint,
      accessibilityHint: widget.accessibilityHint,
      href: widget.href,
      isActive: isActive,
      disabled: widget.disabled,
    );

    final disabledOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Disabled-Opacity') ??
            ds.componentCustomProperties['--Disabled-Opacity'],
        platformId: OneUiScope.of(context).platformId,
        density: OneUiScope.of(context).density,
        platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
      );
      return double.tryParse(raw ?? '') ?? 0.5;
    }();

    final borderRadius = BorderRadius.circular(layout.borderRadius);
    final stateLayerRadius =
        BorderRadius.circular(layout.stateLayerBorderRadius);
    final testId = widget.testId ?? widget.testID;

    Widget buildInner(BuildContext context, Animation<double> press) {
      final pressed = press.value > 0.5;
      final stateBg = pressed && !widget.disabled ? colors.pressed : innerBg;

      return AnimatedContainer(
        duration: layout.transitionDuration,
        curve: _transitionCurve(context, ds),
        constraints: BoxConstraints(minHeight: shellHeight),
        padding: EdgeInsets.all(layout.itemPadding),
        child: AnimatedContainer(
          duration: layout.transitionDuration,
          curve: _transitionCurve(context, ds),
          decoration: BoxDecoration(
            color: stateBg,
            borderRadius: stateLayerRadius,
          ),
          padding: EdgeInsets.symmetric(vertical: layout.innerPaddingVertical),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ExcludeSemantics(
                child: _BottomNavIcon(
                  icon: effectiveIcon,
                  appearance: resolvedAppearance,
                  emphasis: iconEmphasis,
                  size: iconSizeKey,
                  boxSize: layout.iconSize,
                  testId: testId == null ? null : '$testId-icon',
                ),
              ),
              if (showLabel) ...[
                SizedBox(height: layout.innerGap),
                ExcludeSemantics(
                  child: SizedBox(
                    height: labelType == kOneUiBottomNavLabel2Line
                        ? layout.label2LineBoxHeight
                        : null,
                    child: Text(
                      widget.label!,
                      style: layout.labelStyle.copyWith(color: labelColor),
                      maxLines: labelType == kOneUiBottomNavLabel2Line ? 2 : 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.center,
                      textHeightBehavior: const TextHeightBehavior(
                        applyHeightToFirstAscent: false,
                        applyHeightToLastDescent: false,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      );
    }

    Widget item = OneUiFocusInteractive(
      semanticsLabel: a11y.label,
      semanticsHint: a11y.hint,
      enabled: !widget.disabled,
      onPressed: _handlePress,
      onHoverChanged: widget.disabled
          ? null
          : (hovered) => setState(() => _hovered = hovered),
      borderRadius: borderRadius,
      focusRing: focusRing,
      forceFocusRing: widget.forceFocusRing,
      pressAnimationBuilder: buildInner,
    );

    item = Semantics(
      selected: a11y.selected,
      link: a11y.linkUrl != null,
      linkUrl: a11y.linkUrl,
      child: item,
    );

    item = Opacity(
      opacity: widget.disabled ? disabledOpacity : 1,
      child: item,
    );

    if (testId != null) {
      item = Semantics(
        identifier: testId,
        child: item,
      );
    }

    return KeyedSubtree(
      key: ValueKey<String>(itemState.dataPayloadKey),
      child: item,
    );
  }
}

double _effectiveBottomNavItemShellHeight({
  required BottomNavigationResolvedLayout layout,
  required OneUiBottomNavigationLabelType labelType,
  required bool showLabel,
}) {
  var inner = layout.iconSize;
  if (showLabel && labelType != kOneUiBottomNavLabelNone) {
    inner += layout.innerGap;
    if (labelType == kOneUiBottomNavLabel2Line) {
      inner += layout.label2LineBoxHeight;
    } else {
      final fontSize = layout.labelStyle.fontSize ?? 12;
      inner += fontSize * (layout.labelStyle.height ?? 1);
    }
  }
  final minHeight =
      inner + (layout.innerPaddingVertical * 2) + (layout.itemPadding * 2);
  return math.max(layout.itemHeight, minHeight);
}

class _BottomNavIcon extends StatelessWidget {
  const _BottomNavIcon({
    required this.icon,
    required this.appearance,
    required this.emphasis,
    required this.size,
    required this.boxSize,
    this.testId,
  });

  final Object icon;
  final String appearance;
  final OneUiIconEmphasis emphasis;
  final String size;
  final double boxSize;
  final String? testId;

  @override
  Widget build(BuildContext context) {
    if (icon is Widget) {
      return SizedBox(
        width: boxSize,
        height: boxSize,
        child: IconTheme.merge(
          data: IconThemeData(size: boxSize),
          child: Center(child: icon as Widget),
        ),
      );
    }
    return OneUiIcon(
      icon: icon,
      size: size,
      appearance: appearance,
      emphasis: emphasis,
      excludeFromSemantics: true,
      testId: testId,
    );
  }
}

/// Web export alias.
typedef OneUiBottomNavItemProps = OneUiBottomNavItem;

Curve _transitionCurve(BuildContext context, NativeDesignSystemPayload ds) {
  final scope = OneUiScope.of(context);
  final raw = ds.rawComponentCascade([
    '--BottomNavItem-transitionEasing',
    '--Motion-Easing-Transition-Moderate',
  ]);
  final resolved = ds.resolveCSSValue(
    raw ?? 'var(--Motion-Easing-Transition-Moderate)',
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
    nativeTypography: OneUiScope.nativeTypographyOf(context),
  );
  return curveFromMotionCss(
    resolved ??
        convexMotionCSSValue('--Motion-Easing-Transition-Moderate') ??
        '',
    OneUiTapMotionSpec.defaults.curve,
  );
}
