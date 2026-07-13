import 'package:flutter/material.dart';

import '../engine/chip_color_resolve.dart';
import '../engine/chip_size_resolve.dart';
import '../engine/chip_slot_kind.dart';
import '../engine/focus_ring_resolve.dart';
import '../engine/motion_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../utils/touch_target_a11y.dart';
import '../engine/badge_slot_context.dart';
import 'badge_slot_utils.dart';
import 'badge_surface_immune_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_chip_a11y.dart';
import 'one_ui_chip_types.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_icon.dart';
import 'one_ui_chip_group_scope.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'one_ui_surface.dart';

export 'one_ui_chip_types.dart';
export 'one_ui_chip_a11y.dart';

/// Callback — web/RN `onSelectedChange(selected, eventDetails?)`.
typedef OneUiChipSelectedChange = void Function(bool selected,
    [Object? eventDetails]);

/// Web `Chip.module.css` `:focus-visible` — inner halo uses `--Surface-Halo-Gap`,
/// not the chip fill. Unselected chips with a visible resting tint keep fill-colour
/// gap so the ring blends; selected and transparent chips use the parent surface.
Color? chipFocusRingInnerGapOverride(
  BuildContext context, {
  required Color restingFill,
  required bool selected,
}) {
  if (restingFill.a == 0 || selected) {
    return resolveSurfaceHaloGapFromScope(context);
  }
  return restingFill;
}

/// Token-backed toggle chip — `Chip.tsx` / `Chip.native.tsx`.
class OneUiChip extends StatefulWidget {
  const OneUiChip({
    super.key,
    this.child,

    /// Empty — inherit [OneUiChipGroup] `size` (web/RN: chip has no size prop by default).
    this.size = '',
    this.variant,
    this.attention,
    this.appearance,
    this.selected,
    this.defaultSelected = false,
    this.onSelectedChange,
    this.value,
    this.disabled = false,
    this.start,
    this.end,
    this.semanticsLabel,
    this.ariaLabel,
    String? semanticsHint,
    String? accessibilityHint,
    String? testId,
    String? testID,
    this.autofocus = false,
    this.forceFocusRing = false,
  })  : semanticsHint = semanticsHint ?? accessibilityHint,
        testId = testId ?? testID;

  final Object? child;
  final OneUiChipSize size;
  final OneUiChipVariant? variant;
  final OneUiChipAttention? attention;
  final OneUiChipAppearance? appearance;
  final bool? selected;
  final bool defaultSelected;
  final OneUiChipSelectedChange? onSelectedChange;
  final String? value;
  final bool disabled;
  final Widget? start;
  final Widget? end;
  final String? semanticsLabel;
  final String? ariaLabel;
  final String? semanticsHint;
  final String? testId;
  final bool autofocus;
  final bool forceFocusRing;

  @override
  State<OneUiChip> createState() => _OneUiChipState();
}

class _OneUiChipState extends State<OneUiChip> {
  late bool _uncontrolledSelected;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _uncontrolledSelected = widget.defaultSelected;
  }

  @override
  void didUpdateWidget(OneUiChip oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selected == null &&
        oldWidget.defaultSelected != widget.defaultSelected) {
      _uncontrolledSelected = widget.defaultSelected;
    }
  }

  bool get _isSelected {
    final group = OneUiChipGroupScope.selectionOf(context);
    final inGroup = group != null &&
        widget.value != null &&
        widget.value!.trim().isNotEmpty;
    if (inGroup) {
      return group.isSelected(widget.value!.trim());
    }
    return widget.selected ?? _uncontrolledSelected;
  }

  void _toggle() {
    final group = OneUiChipGroupScope.selectionOf(context);
    final chipValue = widget.value?.trim();
    final inGroup = group != null && chipValue != null && chipValue.isNotEmpty;

    if (inGroup) {
      if (widget.disabled) return;
      group.toggleValue(chipValue);
      widget.onSelectedChange?.call(
        group.isSelected(chipValue),
      );
      return;
    }

    if (widget.disabled) return;
    final next = !_isSelected;
    if (widget.selected == null) {
      setState(() => _uncontrolledSelected = next);
    }
    widget.onSelectedChange?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed Chip without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final groupDefaults = OneUiChipGroupScope.defaultsOf(context);
    final state = resolveOneUiChipStateInContext(
      context,
      size: widget.size,
      variant: widget.variant ?? groupDefaults.variant,
      attention: widget.attention,
      appearance: widget.appearance,
      disabled: widget.disabled || groupDefaults.disabled,
      groupSize: groupDefaults.size,
      groupVariant: groupDefaults.variant,
      groupAppearance: groupDefaults.appearance,
      groupDisabled: groupDefaults.disabled,
      isSelected: _isSelected,
    );

    final roleAppearance = chipRoleAppearanceForTokens(
      appearanceProp: widget.appearance,
      resolvedAppearance: state.resolvedAppearance,
    );

    final startKind = classifyChipSlot(widget.start);
    final endKind = classifyChipSlot(widget.end);
    final layout = resolveChipLayout(
      context,
      ds,
      size: state.size,
      hasStart: widget.start != null,
      hasEnd: widget.end != null,
      startKind: startKind,
      endKind: endKind,
    );

    final idlePaint = resolveChipPaint(
      context,
      ds,
      state: state,
      selected: _isSelected,
      pressed: false,
      roleAppearance: roleAppearance,
    );
    final focusRing = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: roleAppearance,
      innerGapColorOverride: chipFocusRingInnerGapOverride(
        context,
        restingFill: idlePaint.background,
        selected: _isSelected,
      ),
    );
    final tapMotion = resolveOneUiTapMotionSpec(
      context,
      ds,
      sizeIsXs: state.size == 's',
      fullWidthTapScale: false,
    );

    final scope = OneUiScope.of(context);
    final touchTargetMin = resolveTouchTargetMinPx(
      ds,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: OneUiScope.nativeTypographyOf(context),
    );
    final hitTestPadding = resolvePressableHitPaddingForControl(
      height: layout.height,
      touchTargetMinPx: touchTargetMin,
      platformId: scope.platformId,
    );

    final a11y = resolveOneUiChipSemantics(
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
      child: widget.child,
      semanticsHint: widget.semanticsHint,
      selected: _isSelected,
      disabled: state.isDisabled,
    );

    final slotSurface = chipSlotSurfaceMode(
      selected: _isSelected,
      variant: state.resolvedVariant,
    );

    final borderRadius = BorderRadius.circular(layout.borderRadius);

    Widget buildChrome(Animation<double> press) {
      final pressed = press.value > 0.5;
      final paint = pressed
          ? resolveChipPaint(
              context,
              ds,
              state: state,
              selected: _isSelected,
              pressed: true,
              roleAppearance: roleAppearance,
            )
          : _hovered && !state.isDisabled
              ? resolveChipPaint(
                  context,
                  ds,
                  state: state,
                  selected: _isSelected,
                  pressed: false,
                  hovered: true,
                  roleAppearance: roleAppearance,
                )
              : resolveChipPaint(
                  context,
                  ds,
                  state: state,
                  selected: _isSelected,
                  pressed: false,
                  roleAppearance: roleAppearance,
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

      final row = <Widget>[];
      if (widget.start != null) {
        row.add(
          _ChipSlot(
            slotKind: startKind,
            roleAppearance: roleAppearance,
            surfaceMode: slotSurface,
            slotIconColor: paint.slotIconColor,
            immune: isSurfaceImmuneSlotWidget(widget.start),
            child: widget.start!,
          ),
        );
      }
      final label = widget.child?.toString();
      if (label != null && label.isNotEmpty) {
        row.add(
          ExcludeSemantics(
            child: Text(
              label,
              style: layout.labelStyle.copyWith(
                color: paint.foreground,
                height: 1,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textHeightBehavior: const TextHeightBehavior(
                applyHeightToFirstAscent: false,
                applyHeightToLastDescent: false,
              ),
            ),
          ),
        );
      }
      if (widget.end != null) {
        row.add(
          _ChipSlot(
            slotKind: endKind,
            roleAppearance: roleAppearance,
            surfaceMode: slotSurface,
            slotIconColor: paint.slotIconColor,
            immune: isSurfaceImmuneSlotWidget(widget.end),
            child: widget.end!,
          ),
        );
      }

      final mq = MediaQuery.maybeOf(context);
      final animateColors = tapMotion.useDiscreteAnimation(mq);

      return Opacity(
        opacity: state.isDisabled ? disabledOpacity : 1,
        child: SizedBox(
          height: layout.height,
          child: AnimatedContainer(
            duration: animateColors
                ? Duration(milliseconds: tapMotion.durationMs)
                : Duration.zero,
            curve: tapMotion.curve,
            decoration: BoxDecoration(
              color: paint.background,
              borderRadius: borderRadius,
              border: Border.all(
                color: paint.borderColor,
                width: paint.borderWidth,
              ),
            ),
            child: Padding(
              padding: layout.padding,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                spacing: layout.gap,
                children: row,
              ),
            ),
          ),
        ),
      );
    }

    final body = OneUiFocusInteractive(
      semanticsLabel: a11y.label,
      semanticsHint: a11y.hint,
      enabled: a11y.enabled,
      onPressed: state.isDisabled ? null : _toggle,
      onHoverChanged: state.isDisabled
          ? null
          : (hovered) => setState(() => _hovered = hovered),
      borderRadius: borderRadius,
      focusRing: focusRing,
      tapMotion: tapMotion,
      autofocus: widget.autofocus,
      forceFocusRing: widget.forceFocusRing,
      hitTestPadding: hitTestPadding,
      pressAnimationBuilder: (ctx, press) => buildChrome(press),
    );

    final tid = widget.testId?.trim();

    Widget result = Semantics(
      button: true,
      selected: a11y.selected,
      enabled: a11y.enabled,
      label: a11y.label,
      hint: a11y.hint,
      identifier: tid != null && tid.isNotEmpty ? tid : null,
      onTap: state.isDisabled ? null : _toggle,
      child: KeyedSubtree(
        key: ValueKey<String>(state.dataPayloadKey),
        child: OneUiSlotParentAppearanceScope(
          appearance: roleAppearance,
          // Inner [OneUiFocusInteractive] also declares button semantics; exclude
          // so assistive tech sees one node with `selected` (toggle) state.
          child: ExcludeSemantics(child: body),
        ),
      ),
    );

    if (tid != null && tid.isNotEmpty) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }
}

class _ChipSlot extends StatelessWidget {
  const _ChipSlot({
    required this.child,
    required this.slotKind,
    required this.roleAppearance,
    required this.slotIconColor,
    required this.immune,
    this.surfaceMode,
  });

  final Widget child;
  final ChipSlotKind slotKind;
  final String roleAppearance;
  final Color slotIconColor;
  final bool immune;
  final String? surfaceMode;

  @override
  Widget build(BuildContext context) {
    // Web `.start`/`.end { --Icon-color: var(--_ch-default-accent-a11y) }` /
    // RN `ComponentSlotIconContext` — [OneUiIcon] must not use default `high` emphasis.
    Widget slot = BadgeSlotIconColorScope(
      color: slotIconColor,
      child: IconTheme.merge(
        data: IconThemeData(color: slotIconColor),
        child: child,
      ),
    );

    if (immune) {
      slot = BadgeSurfaceImmuneScope(child: slot);
    }

    // RN `ChipSlot` + web `data-surface` on `.start`/`.end`: context only for
    // affordances (icon/avatar). Badges use `data-context-boundary` — no fill box.
    if (surfaceMode != null && slotKind != kChipSlotBadge) {
      slot = OneUiSurface(
        mode: surfaceMode!,
        appearance: roleAppearance,
        transparentBackground: true,
        child: slot,
      );
    }

    return ExcludeSemantics(child: slot);
  }
}

/// Showcase helper — semantic icon in start slot.
class OneUiChipSlotIcon extends StatelessWidget {
  const OneUiChipSlotIcon({super.key, required this.name, this.size = '2'});

  final String name;
  final String size;

  @override
  Widget build(BuildContext context) {
    return OneUiIcon(icon: name, size: size, excludeFromSemantics: true);
  }
}
