import 'package:flutter/material.dart';

export 'convex_gap_card.dart';
export 'one_ui_button_types.dart';

import '../engine/button_color_resolve.dart';
import '../engine/button_decoration.dart';
import '../engine/button_typography_parse.dart';
import '../engine/focus_ring_resolve.dart'
    show resolveOneUiFocusRingSpec, resolveSurfaceHaloGapFromScope;
import '../engine/motion_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/native_typography_snapshot.dart';
import '../engine/surface_engine.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/platform_foundation_config.dart';
import '../utils/one_ui_hex_color.dart';
import '../utils/touch_target_a11y.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_button_types.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_icon_button.dart';
import 'one_ui_icon_button_types.dart';
import 'one_ui_loading_spinner.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'semantic_icon_material.dart';

/// Applies token label colour to arbitrary [child] slots (icons + text).
Widget _oneUiButtonStyledChild(
  Widget child,
  TextStyle style, {
  required Color iconColor,
  bool center = false,
}) {
  final styled = IconTheme.merge(
    data: IconThemeData(color: iconColor, size: style.fontSize),
    child: DefaultTextStyle.merge(style: style, child: child),
  );
  return center ? Center(child: styled) : styled;
}

/// Brand-token `Button` — mirrors web `packages/ui/.../Button` props (Figma-aligned).
///
/// Accessibility (Flutter web + mobile) follows the same model as **`Button.tsx`**
/// (`aria-*` via Base UI) and **`Button.native.tsx`** (`accessibility*` + `aria-*`),
/// mapping to Flutter **`Semantics`**: **`semanticsLabel` ⇔ aria-label /
/// `accessibilityLabel`**, **`semanticsHint` ⇔ supplementary hint**, **`Semantics.enabled` ⇔
/// `aria-disabled`**, **`semanticsBusy` ⇔ `aria-busy`**, **`semanticButtonType` ⇔ `<button type>`**,
/// **`semanticsControlsSemanticsIdentifiers` ⇔ `Semantics.controlsNodes`** (**`aria-controls`**
/// on Flutter web when IDs match **`Semantics(identifier:)`** on targets). Inline description still
/// uses [semanticsHint] (no generic `aria-describedby` on `Semantics(button)` in the embedder yet);
/// **`aria-haspopup`** on a plain **`role="button"`** is not emitted by Flutter web — use Material
/// menu anchors for popup roles. Spinner announces **"Loading"** as its own subtree while the button
/// exposes busy state — mirrored from RN (**`accessible` spinner + `busy`**) and avoids duplicate
/// label chatter.
///
/// Unresolved Convex keys render a debug-only gap placeholder (no Material fallbacks).
class OneUiButton extends StatefulWidget {
  const OneUiButton({
    this.label,
    this.child,
    this.attention,
    this.variant = OneUiButtonVariant.bold,
    this.size = 10,

    /// T-shirt / legacy string size (`xs`, `medium`, …). When non-null/non-empty,
    /// overrides numeric [size] (`Button.shared` parity).
    this.sizeAlias,
    this.appearance = 'auto',
    this.contained = true,
    this.condensed = false,
    this.fullWidth = false,
    this.disabled = false,
    this.loading = false,
    this.start,
    this.end,

    /// Web [`SemanticIconName`] string on `start` — ignored when [start] is set.
    this.startSemanticIcon,
    this.endSemanticIcon,
    @Deprecated('Use startSemanticIcon') this.leftIcon,
    @Deprecated('Use endSemanticIcon') this.rightIcon,
    this.onPressed,

    /// React / RN `onPress` — merged as `onPressed ?? onPress ?? onClick`.
    this.onPress,
    this.onClick,

    /// `false`: use [decoration] directly; pass `decoration: null` to suppress ornaments.
    /// `true` (default): use [OneUiScope.buttonOrnament].
    this.inheritOrnamentFromScope = true,
    this.decoration,
    this.semanticButtonType = OneUiSemanticButtonType.button,

    /// Web `aria-label` / RN **`accessibilityLabel`** — overrides default semantics label.
    this.semanticsLabel,

    /// Supplementary copy for assistive tech ([Semantics.hint]); not an ID list (see
    /// **`Button.native`** — `aria-describedby` IDs map to RN `accessibilityLabelledBy`; Flutter
    /// has no generic `aria-describedby` wiring for `button` nodes today).
    this.semanticsHint,

    /// **Web `aria-controls` / RN `accessibilityControls`** — [Semantics.identifier]
    /// values on the owned region(s).
    this.semanticsControlsSemanticsIdentifiers,

    /// **`aria-expanded`** / RN **`accessibilityState.expanded`** (menus / disclosures).
    this.semanticsExpanded,

    /// **`aria-hidden`** — removes this control from the semantics tree (purely decorative/redundant UI).
    this.excludeFromSemantics = false,
    this.autofocus = false,

    /// Storybook / docs parity with web `[data-force-state="focus"]` — always paint
    /// the focus halo (keyboard Tab + Enter/Space still work without this).
    this.forceFocusRing = false,

    /// RN `testID` / web `data-testid`.
    this.testId,
    super.key,
  }) : assert(label != null || child != null,
            'OneUiButton requires label or child');

  /// Plain-text label (`children` string on web). Ignored when [child] is set.
  final String? label;

  /// Custom label (`ReactNode` on web).
  final Widget? child;

  final OneUiButtonAttention? attention;
  final OneUiButtonVariant variant;

  /// F-step size when [sizeAlias] is null — may include deprecated steps (e.g. 7→8).
  final int size;

  /// When set, wins over numeric [size] for token resolution (`xs`/`m`/…).
  final String? sizeAlias;

  final String appearance;

  /// Default `true`. When `false`, renders the Figma uncontained form: transparent
  /// background, accent/high text, no pill fill — `condensed`, `fullWidth`, and
  /// `decoration` are ignored (web/RN parity).
  final bool contained;
  final bool condensed;
  final bool fullWidth;
  final bool disabled;
  final bool loading;
  final Widget? start;
  final Widget? end;

  /// Web passes icon name strings into `start` / `end`.
  final String? startSemanticIcon;
  final String? endSemanticIcon;

  @Deprecated('Use startSemanticIcon')
  final String? leftIcon;

  @Deprecated('Use endSemanticIcon')
  final String? rightIcon;

  final VoidCallback? onPressed;

  /// Cross-platform alias (React `onPress`).
  final VoidCallback? onPress;

  /// Web alias for the press handler (`onPress ?? onClick` on React).
  final VoidCallback? onClick;

  final bool inheritOrnamentFromScope;
  final ButtonOrnamentConfig? decoration;
  final OneUiSemanticButtonType semanticButtonType;
  final String? semanticsLabel;
  final String? semanticsHint;

  /// **Web `aria-controls` / RN `accessibilityControls`** via [Semantics.controlsNodes].
  final Set<String>? semanticsControlsSemanticsIdentifiers;

  /// Maps to **`Semantics.expanded`** — menu / disclosure parity with **`aria-expanded`** (RN **`accessibilityState.expanded`**).
  final bool? semanticsExpanded;

  /// **`aria-hidden`** — subtree excluded from semantics (AssistiveTech parity with RN **`accessibilityElementsHidden`** on decorator nodes).
  final bool excludeFromSemantics;
  final bool autofocus;

  /// Web `data-force-state="focus"` — informative preview only; production uses real focus.
  final bool forceFocusRing;

  /// RN `testID` / web `data-testid`.
  final String? testId;

  @override
  State<OneUiButton> createState() => _OneUiButtonState();
}

class _OneUiButtonState extends State<OneUiButton> {
  bool _hovered = false;

  String? get _trimmedTestId {
    final tid = widget.testId?.trim();
    if (tid == null || tid.isEmpty) return null;
    return tid;
  }

  /// Ghost / transparent fills must gap-match the parent surface (web
  /// `--Surface-Halo-Gap` inside `[data-surface]`), not the page default.
  Color? _focusRingInnerGapOverride(BuildContext context, Color fillPaint) {
    if (fillPaint.a > 0) return fillPaint;
    return resolveSurfaceHaloGapFromScope(context);
  }

  /// Web/RN tap-scale chain — fullWidth (1%) > XS (7%) > default (3%).
  OneUiTapMotionSpec _buttonTapMotion(
    BuildContext context,
    NativeDesignSystemPayload ds,
  ) {
    return resolveOneUiTapMotionSpec(
      context,
      ds,
      sizeIsXs: _step == 6,
      fullWidthTapScale: widget.contained && widget.fullWidth,
    );
  }

  OneUiButtonVariant get _effectiveVariant => widget.attention != null
      ? oneUiVariantFromAttention(widget.attention!)
      : widget.variant;

  static String _variantSuffix(OneUiButtonVariant v) =>
      oneUiVariantCssSuffix(v);

  int get _step => oneUiResolveButtonSizeStep(
      size: widget.size, sizeAlias: widget.sizeAlias);

  String get _resolvedAppearance =>
      resolveOneUiButtonAppearance(context, widget.appearance);

  String? _trimmedNonEmpty(String? s) {
    final t = s?.trim();
    if (t == null || t.isEmpty) return null;
    return t;
  }

  String? get _effectiveStartIconName =>
      _trimmedNonEmpty(widget.startSemanticIcon) ??
      _trimmedNonEmpty(widget.leftIcon);

  String? get _effectiveEndIconName =>
      _trimmedNonEmpty(widget.endSemanticIcon) ??
      _trimmedNonEmpty(widget.rightIcon);

  Widget? get _slotStart {
    if (widget.start != null) return widget.start;
    final n = _effectiveStartIconName;
    return n != null ? OneUiSemanticIcon(n, semanticLabel: '') : null;
  }

  Widget? get _slotEnd {
    if (widget.end != null) return widget.end;
    final n = _effectiveEndIconName;
    return n != null ? OneUiSemanticIcon(n, semanticLabel: '') : null;
  }

  /// Web `SlotParentAppearanceProvider` — nested Icon/Avatar inherit button role.
  Widget _wrapButtonSlot(Widget slot) {
    return OneUiSlotParentAppearanceScope(
      appearance: _resolvedAppearance,
      child: slot,
    );
  }

  /// Figma loading spec — hide slots/label but preserve layout (`visibility:hidden` on web).
  Widget _preserveLayoutWhenLoading({required Widget child}) {
    if (!widget.loading) return child;
    return Visibility(
      visible: false,
      maintainState: true,
      maintainAnimation: true,
      maintainSize: true,
      child: child,
    );
  }

  Widget _buildLoadingSpinner(Color strokeColor) {
    return Semantics(
      label: 'Loading',
      child: OneUiLoadingSpinner(
        appearance: _resolvedAppearance,
        size: oneUiButtonLoadingSpinnerSize(_step),
        strokeColor: strokeColor,
      ),
    );
  }

  Widget _wrapLoadingOverlay(Widget row, Color spinnerStroke) {
    if (!widget.loading) return row;
    return Stack(
      alignment: Alignment.center,
      clipBehavior: Clip.none,
      children: [
        row,
        _buildLoadingSpinner(spinnerStroke),
      ],
    );
  }

  void _handleActivated() {
    final cb = widget.onPressed ?? widget.onPress ?? widget.onClick;
    switch (widget.semanticButtonType) {
      case OneUiSemanticButtonType.submit:
        final state = Form.maybeOf(context);
        if (state != null && !state.validate()) return;
        cb?.call();
      case OneUiSemanticButtonType.reset:
        Form.maybeOf(context)?.reset();
        cb?.call();
      case OneUiSemanticButtonType.button:
        cb?.call();
    }
  }

  List<String> _collectGaps(
      BuildContext context, NativeDesignSystemPayload ds) {
    final gaps = <String>[];
    final typo = OneUiScope.nativeTypographyOf(context);
    if (typo == null) {
      gaps.add('Convex: nativeTypography missing on OneUiScope');
    }

    final surface = OneUiSurfaceScope.maybeOf(context);
    if (surface == null) {
      gaps.add('OneUiSurfaceScope missing');
    } else if (!isOneUiButtonAppearanceConfigured(context, widget.appearance)) {
      gaps.add('theme has no appearance "${widget.appearance}"');
    }

    final labelKey = oneUiLabelSizeCssKey(_step);
    final sz = '$_step';
    final scope = OneUiScope.maybeOf(context);
    final plat = scope?.platformId;
    final den = scope?.density;
    final pc = scope?.platformsFoundationConfig;

    if (typo != null &&
        typo.emphasisStyle('label', labelKey, emphasis: 'high') == null) {
      gaps.add(
          'nativeTypography.label.sizes.$labelKey missing (emphasis high)');
    }

    ds.resolveComponentLengthPxCascade(
      ['--Button-borderRadius'],
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    if (widget.condensed) {
      ds.resolveComponentLengthPxCascade(
        ['--Button-condensedMinHeight-$sz'],
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      ds.resolveComponentLengthPxCascade(
        ['--Button-condensedPaddingVertical-$sz'],
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      ds.resolveComponentLengthPxCascade(
        [
          '--Button-condensedPaddingHorizontalStart-$sz',
          '--Button-condensedPaddingHorizontal-$sz',
        ],
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      ds.resolveComponentLengthPxCascade(
        [
          '--Button-condensedPaddingHorizontalEnd-$sz',
          '--Button-condensedPaddingHorizontal-$sz',
        ],
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
    } else {
      ds.resolveComponentLengthPxCascade(
        ['--Button-minHeight-$sz', '--Button-minHeight'],
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      ds.resolveComponentLengthPxCascade(
        ['--Button-paddingVertical-$sz', '--Button-paddingVertical'],
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      final padStartKeys = _slotStart != null
          ? [
              '--Button-paddingHorizontalStart-$sz-slot',
              '--Button-paddingHorizontalStart-$sz',
              '--Button-paddingHorizontalStart',
              '--Button-paddingHorizontal-$sz',
              '--Button-paddingHorizontal',
            ]
          : [
              '--Button-paddingHorizontalStart-$sz',
              '--Button-paddingHorizontalStart',
              '--Button-paddingHorizontal-$sz',
              '--Button-paddingHorizontal',
            ];
      ds.resolveComponentLengthPxCascade(
        padStartKeys,
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      final padEndKeys = _slotEnd != null
          ? [
              '--Button-paddingHorizontalEnd-$sz-slot',
              '--Button-paddingHorizontalEnd-$sz',
              '--Button-paddingHorizontalEnd',
              '--Button-paddingHorizontal-$sz',
              '--Button-paddingHorizontal',
            ]
          : [
              '--Button-paddingHorizontalEnd-$sz',
              '--Button-paddingHorizontalEnd',
              '--Button-paddingHorizontal-$sz',
              '--Button-paddingHorizontal',
            ];
      ds.resolveComponentLengthPxCascade(
        padEndKeys,
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
    }

    if (_slotStart != null || _slotEnd != null) {
      ds.resolveComponentLengthPxCascade(
        ['--Button-iconSize-$sz', '--Button-iconSize'],
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
    }

    ds.resolveComponentLengthPxCascade(
      ['--Button-borderWidth-${_variantSuffix(_effectiveVariant)}'],
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    final tt = ds.rawComponentCascade(['--Button-textTransform']);
    if (tt == null) {
      gaps.add('missing --Button-textTransform');
    } else {
      final r = ds.resolveCSSValue(
        tt,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      if (r == null || !NativeDesignSystemPayload.isConcreteCssValue(r)) {
        gaps.add('unresolved --Button-textTransform: $tt → $r');
      }
    }

    final ls = ds.rawComponentCascade(['--Button-letterSpacing']);
    if (ls == null) {
      gaps.add('missing --Button-letterSpacing');
    } else {
      final r = ds.resolveCSSValue(
        ls,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      if (r == null || !NativeDesignSystemPayload.isConcreteCssValue(r)) {
        gaps.add('unresolved --Button-letterSpacing: $ls → $r');
      }
    }

    return gaps;
  }

  List<String> _collectUncontainedGaps(
      BuildContext context, NativeDesignSystemPayload ds) {
    final gaps = <String>[];
    final typo = OneUiScope.nativeTypographyOf(context);
    if (typo == null) {
      gaps.add('Convex: nativeTypography missing on OneUiScope');
    }

    final surface = OneUiSurfaceScope.maybeOf(context);
    if (surface == null) {
      gaps.add('OneUiSurfaceScope missing');
    } else if (!isOneUiButtonAppearanceConfigured(context, widget.appearance)) {
      gaps.add('theme has no appearance "${widget.appearance}"');
    }

    final labelKey = oneUiLabelSizeCssKey(_step);
    if (typo != null &&
        typo.emphasisStyle('label', labelKey, emphasis: 'high') == null) {
      gaps.add(
          'nativeTypography.label.sizes.$labelKey missing (emphasis high)');
    }

    return gaps;
  }

  /// Web `LinkButton.module.css` per-size fallbacks when `--LinkButton-*` is unset.
  String _linkButtonSpacingFallback(String metric, {required int step}) {
    return switch (metric) {
      'minHeight' || 'iconSize' => switch (step) {
          6 => '3-5',
          8 => '4',
          12 => '6',
          _ => '5',
        },
      'paddingHorizontal' => '0-5',
      // Web: flat `var(--LinkButton-iconGap, var(--Spacing-1))` at every size.
      'iconGap' => '1',
      _ => '5',
    };
  }

  double _linkButtonLengthPx(
    NativeDesignSystemPayload ds, {
    required List<String> keys,
    required String platformId,
    required String density,
    PlatformsFoundationConfig? platformsFoundationConfig,
    NativeTypographySnapshot? nativeTypography,
    required String spacingFallback,
  }) {
    return _gapPx(
          ds,
          keys,
          platformId: platformId,
          density: density,
          platformsFoundationConfig: platformsFoundationConfig,
          nativeTypography: nativeTypography,
        ) ??
        resolveSpacingPx(
          designSystem: ds,
          platformsConfig: platformsFoundationConfig,
          platformId: platformId,
          density: density,
          spacingName: spacingFallback,
        );
  }

  /// `LinkButton.module.css` default: `var(--LinkButton-borderRadius, var(--Shape-2))`.
  double _linkButtonBorderRadiusFallback(
    NativeDesignSystemPayload ds,
    String platformId,
    String density,
    PlatformsFoundationConfig? platformsFoundationConfig,
  ) {
    final shape2Raw =
        ds.dimensionContextFor(platformId, density)?.dimensions['--Shape-2'];
    if (shape2Raw != null) {
      final parsed = ds.parsePx(shape2Raw);
      if (parsed != null) return parsed;
    }
    return resolveFStepPx(
      designSystem: ds,
      platformsConfig: platformsFoundationConfig,
      platformId: platformId,
      density: density,
      step: 'f4',
    );
  }

  Widget _buildUncontained(BuildContext context, NativeDesignSystemPayload ds) {
    final scope = OneUiScope.of(context);
    final plat = scope.platformId;
    final den = scope.density;
    final pc = scope.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context)!;
    final effective = _effectiveVariant;
    final variantKind = switch (effective) {
      OneUiButtonVariant.bold => OneUiButtonVariantKind.bold,
      OneUiButtonVariant.subtle => OneUiButtonVariantKind.subtle,
      OneUiButtonVariant.ghost => OneUiButtonVariantKind.ghost,
    };
    final colors = resolveUncontainedButtonColors(
      context,
      variant: variantKind,
      appearance: _resolvedAppearance,
    );

    final labelKey = oneUiLabelSizeCssKey(_step);
    var labelStyle = typo.emphasisStyle('label', labelKey, emphasis: 'high')!;
    labelStyle = labelStyle.copyWith(
      fontFamily: typo.fontFamilyPrimaryOrBundled,
      color: colors.foreground,
      decoration: TextDecoration.none,
    );

    final sz = '$_step';
    // Web parity: `contained={false}` delegates to LinkButton — read `--LinkButton-*`
    // from `componentCustomProperties` (brand overrides), not hardcoded spacing.
    final padH = _linkButtonLengthPx(
      ds,
      keys: ['--LinkButton-paddingHorizontal'],
      platformId: plat,
      density: den,
      platformsFoundationConfig: pc,
      nativeTypography: typo,
      spacingFallback:
          _linkButtonSpacingFallback('paddingHorizontal', step: _step),
    );
    final tokenMinH = _linkButtonLengthPx(
      ds,
      keys: ['--LinkButton-minHeight-$sz', '--LinkButton-minHeight'],
      platformId: plat,
      density: den,
      platformsFoundationConfig: pc,
      nativeTypography: typo,
      spacingFallback: _linkButtonSpacingFallback('minHeight', step: _step),
    );
    final touchTargetMin = _touchTargetMinPx(
      ds,
      platformId: plat,
      density: den,
      platformsFoundationConfig: pc,
      nativeTypography: typo,
    );
    final minH = _effectiveButtonMinHeight(
      tokenMinHeight: tokenMinH,
      touchTargetMinPx: touchTargetMin,
      platformId: plat,
    );
    final cornerRadius = _gapPx(
          ds,
          ['--LinkButton-borderRadius'],
          platformId: plat,
          density: den,
          platformsFoundationConfig: pc,
          nativeTypography: typo,
        ) ??
        _linkButtonBorderRadiusFallback(ds, plat, den, pc);

    final iconSize = (_slotStart != null || _slotEnd != null)
        ? _linkButtonLengthPx(
            ds,
            keys: ['--LinkButton-iconSize-$sz', '--LinkButton-iconSize'],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo,
            spacingFallback:
                _linkButtonSpacingFallback('iconSize', step: _step),
          )
        : null;

    final iconGap = _linkButtonLengthPx(
      ds,
      keys: ['--LinkButton-iconGap'],
      platformId: plat,
      density: den,
      platformsFoundationConfig: pc,
      nativeTypography: typo,
      spacingFallback: _linkButtonSpacingFallback('iconGap', step: _step),
    );
    final gapStart = iconGap;
    final gapEnd = iconGap;

    final plain = widget.label ?? '';
    final dispLabel = plain;

    final disabledOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Disabled-Opacity',
                platformId: plat, density: den) ??
            ds.componentCustomProperties['--Disabled-Opacity'],
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      return double.tryParse(raw ?? '') ?? 0.38;
    }();

    final interactive = !(widget.disabled || widget.loading);
    final bgAmbient = interactive && _hovered
        ? colors.backgroundHover
        : const Color(0x00000000);

    Widget buildBody(Color fillPaint) {
      return ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: minH,
          minWidth: touchTargetMin,
        ),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: fillPaint,
            borderRadius: BorderRadius.circular(cornerRadius),
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: padH),
            child: _wrapLoadingOverlay(
              Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_slotStart != null) ...[
                    _preserveLayoutWhenLoading(
                      child: SizedBox(
                        width: iconSize,
                        height: iconSize,
                        child: IconTheme.merge(
                          data: IconThemeData(
                              color: colors.foreground, size: iconSize),
                          child: _wrapButtonSlot(_slotStart!),
                        ),
                      ),
                    ),
                    SizedBox(width: gapStart),
                  ],
                  Flexible(
                    fit: FlexFit.loose,
                    child: widget.loading
                        ? ExcludeSemantics(
                            child: _preserveLayoutWhenLoading(
                              child: widget.child != null
                                  ? _oneUiButtonStyledChild(
                                      widget.child!,
                                      labelStyle,
                                      iconColor: colors.foreground,
                                    )
                                  : Text(
                                      dispLabel,
                                      style: labelStyle,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                            ),
                          )
                        : widget.child != null
                            ? _oneUiButtonStyledChild(
                                widget.child!,
                                labelStyle,
                                iconColor: colors.foreground,
                              )
                            : Text(
                                dispLabel,
                                style: labelStyle,
                                overflow: TextOverflow.ellipsis,
                              ),
                  ),
                  if (_slotEnd != null) ...[
                    SizedBox(width: gapEnd),
                    _preserveLayoutWhenLoading(
                      child: SizedBox(
                        width: iconSize,
                        height: iconSize,
                        child: IconTheme.merge(
                          data: IconThemeData(
                              color: colors.foreground, size: iconSize),
                          child: _wrapButtonSlot(_slotEnd!),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              colors.foreground,
            ),
          ),
        ),
      );
    }

    final semanticsLabelEffective =
        widget.semanticsLabel?.trim().isNotEmpty == true
            ? widget.semanticsLabel!.trim()
            : (dispLabel.trim().isNotEmpty ? dispLabel.trim() : 'Button');

    final tapMotion = _buttonTapMotion(context, ds);

    final focusPaint = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: _resolvedAppearance,
      innerGapColorOverride: _focusRingInnerGapOverride(context, bgAmbient),
    );

    final disabledBody = Opacity(
      opacity: widget.disabled || widget.loading ? disabledOpacity : 1,
      child: buildBody(bgAmbient),
    );

    final interactiveBody = OneUiFocusInteractive(
      semanticsLabel: semanticsLabelEffective,
      semanticsHint: widget.semanticsHint,
      semanticsBusy: widget.loading,
      semanticsExpanded: widget.semanticsExpanded,
      semanticsControlsSemanticsIdentifiers:
          widget.semanticsControlsSemanticsIdentifiers,
      semanticsIdentifier: _trimmedTestId,
      enabled: interactive,
      onPressed: interactive ? _handleActivated : null,
      onHoverChanged:
          interactive ? (hovered) => setState(() => _hovered = hovered) : null,
      borderRadius: BorderRadius.circular(cornerRadius),
      focusRing: focusPaint,
      tapMotion: tapMotion,
      autofocus: widget.autofocus,
      forceFocusRing: widget.forceFocusRing,
      pressAnimationBuilder: interactive
          ? (context, press) {
              final fill =
                  Color.lerp(bgAmbient, colors.backgroundPressed, press.value)!;
              final inner = Opacity(
                opacity:
                    widget.disabled || widget.loading ? disabledOpacity : 1,
                child: buildBody(fill),
              );
              return inner;
            }
          : null,
      child: interactive ? null : disabledBody,
    );

    Widget result = interactiveBody;

    if (widget.excludeFromSemantics) {
      result = ExcludeSemantics(child: result);
    }

    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }

  double? _gapPx(
    NativeDesignSystemPayload ds,
    List<String> keys, {
    required String platformId,
    required String density,
    PlatformsFoundationConfig? platformsFoundationConfig,
    NativeTypographySnapshot? nativeTypography,
  }) {
    return ds.resolveComponentLengthPxCascade(
      keys,
      platformId: platformId,
      density: density,
      platformsConfig: platformsFoundationConfig,
      nativeTypography: nativeTypography,
    );
  }

  double _touchTargetMinPx(
    NativeDesignSystemPayload ds, {
    required String platformId,
    required String density,
    PlatformsFoundationConfig? platformsFoundationConfig,
    NativeTypographySnapshot? nativeTypography,
  }) {
    return resolveTouchTargetMinPx(
      ds,
      platformId: platformId,
      density: density,
      platformsConfig: platformsFoundationConfig,
      nativeTypography: nativeTypography,
    );
  }

  double _effectiveButtonMinHeight({
    required double tokenMinHeight,
    required double touchTargetMinPx,
    required String platformId,
  }) {
    return enforceButtonTouchMinHeight(
      tokenMinHeight: tokenMinHeight,
      touchTargetMinPx: touchTargetMinPx,
      platformId: platformId,
    );
  }

  double _iconGapPx(
      NativeDesignSystemPayload ds, OneUiScope scope, String side) {
    final sz = '$_step';
    final raw = ds.rawComponentCascade([
      '--Button-iconGap${side == 'start' ? 'Start' : 'End'}-$sz',
      '--Button-iconGap${side == 'start' ? 'Start' : 'End'}',
      '--Button-iconGap',
    ]);
    final px = raw != null
        ? ds.parsePx(
            ds.resolveCSSValue(
              raw,
              platformId: scope.platformId,
              density: scope.density,
              platformsConfig: scope.platformsFoundationConfig,
              nativeTypography: scope.nativeTypography,
            ),
            platformId: scope.platformId,
            density: scope.density,
            platformsConfig: scope.platformsFoundationConfig,
            nativeTypography: scope.nativeTypography,
          )
        : null;
    if (px != null) return px;
    return resolveSpacingPx(
      designSystem: ds,
      platformsConfig: scope.platformsFoundationConfig,
      platformId: scope.platformId,
      density: scope.density,
      spacingName: _step == 6 || _step == 8 ? '1' : '1-5',
    );
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed Button without Convex `nativeTheme:getNativeThemeSnapshot.designSystem`.',
          'Web Storybook injects the same `--Button-*` values as CSS (`useBrandCSSNew`); React Native gets `buildNativeTheme`; Flutter reads the flat `componentCustomProperties` map from this snapshot (schema v2).',
          'Fix: run the latest Convex backend from this repo (`npx convex dev` or deploy) so `packages/convex/convex/nativeTheme.ts` returns `designSystem`. See docs/native-design-system-payload.md.',
          'If the brand is selected but this persists, the snapshot may be null (no color foundation) or JSON failed to parse — check the browser/network response for `nativeTheme:getNativeThemeSnapshot`.',
        ],
      );
    }

    if (!widget.contained) {
      final uncontainedGaps = _collectUncontainedGaps(context, ds);
      if (uncontainedGaps.isNotEmpty) {
        return oneUiConvexGapPlaceholder(uncontainedGaps);
      }
      return _buildUncontained(context, ds);
    }

    final gaps = _collectGaps(context, ds);
    if (gaps.isNotEmpty) {
      return oneUiConvexGapPlaceholder(gaps);
    }

    final scope = OneUiScope.of(context);
    final pc = scope.platformsFoundationConfig;
    final plat = scope.platformId;
    final den = scope.density;
    final typo = OneUiScope.nativeTypographyOf(context)!;
    final labelKey = oneUiLabelSizeCssKey(_step);
    var labelStyle = typo.emphasisStyle('label', labelKey, emphasis: 'high')!;
    labelStyle =
        labelStyle.copyWith(fontFamily: typo.fontFamilyPrimaryOrBundled);
    final effective = _effectiveVariant;

    final variantKind = switch (effective) {
      OneUiButtonVariant.bold => OneUiButtonVariantKind.bold,
      OneUiButtonVariant.subtle => OneUiButtonVariantKind.subtle,
      OneUiButtonVariant.ghost => OneUiButtonVariantKind.ghost,
    };
    final colors = resolveButtonColors(
      context,
      ds,
      variant: variantKind,
      appearance: _resolvedAppearance,
    );

    final sz = '$_step';

    final radius = _gapPx(ds, ['--Button-borderRadius'],
        platformId: plat,
        density: den,
        platformsFoundationConfig: pc,
        nativeTypography: typo)!;
    final tokenMinH = widget.condensed
        ? _gapPx(ds, ['--Button-condensedMinHeight-$sz'],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo)!
        : _gapPx(ds, ['--Button-minHeight-$sz', '--Button-minHeight'],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo)!;
    final touchTargetMin = _touchTargetMinPx(
      ds,
      platformId: plat,
      density: den,
      platformsFoundationConfig: pc,
      nativeTypography: typo,
    );
    final minH = _effectiveButtonMinHeight(
      tokenMinHeight: tokenMinH,
      touchTargetMinPx: touchTargetMin,
      platformId: plat,
    );
    final padV = widget.condensed
        ? _gapPx(ds, ['--Button-condensedPaddingVertical-$sz'],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo)!
        : _gapPx(
            ds, ['--Button-paddingVertical-$sz', '--Button-paddingVertical'],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo)!;

    final padL = widget.condensed
        ? _gapPx(
            ds,
            [
              '--Button-condensedPaddingHorizontalStart-$sz',
              '--Button-condensedPaddingHorizontal-$sz',
            ],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo)!
        : _gapPx(
            ds,
            _slotStart != null
                ? [
                    '--Button-paddingHorizontalStart-$sz-slot',
                    '--Button-paddingHorizontalStart-$sz',
                    '--Button-paddingHorizontalStart',
                    '--Button-paddingHorizontal-$sz',
                    '--Button-paddingHorizontal',
                  ]
                : [
                    '--Button-paddingHorizontalStart-$sz',
                    '--Button-paddingHorizontalStart',
                    '--Button-paddingHorizontal-$sz',
                    '--Button-paddingHorizontal',
                  ],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo,
          )!;

    final padR = widget.condensed
        ? _gapPx(
            ds,
            [
              '--Button-condensedPaddingHorizontalEnd-$sz',
              '--Button-condensedPaddingHorizontal-$sz',
            ],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo)!
        : _gapPx(
            ds,
            _slotEnd != null
                ? [
                    '--Button-paddingHorizontalEnd-$sz-slot',
                    '--Button-paddingHorizontalEnd-$sz',
                    '--Button-paddingHorizontalEnd',
                    '--Button-paddingHorizontal-$sz',
                    '--Button-paddingHorizontal',
                  ]
                : [
                    '--Button-paddingHorizontalEnd-$sz',
                    '--Button-paddingHorizontalEnd',
                    '--Button-paddingHorizontal-$sz',
                    '--Button-paddingHorizontal',
                  ],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo,
          )!;

    final bw = _gapPx(
      ds,
      ['--Button-borderWidth-${_variantSuffix(effective)}'],
      platformId: plat,
      density: den,
      platformsFoundationConfig: pc,
      nativeTypography: typo,
    )!;

    final bgPressed = colors.backgroundPressed;
    Border? border = colors.borderColor != null && bw > 0
        ? Border.all(color: colors.borderColor!, width: bw)
        : null;

    // Web `Button.module.css` `.button::after` — **outline** emphasis sets
    // `--Button-borderWidth-bold: 0` and draws the pill edge with
    // `--Button-cssDecorationInsetStrokeWidth-bold` (inset border). Flutter
    // previously only read `borderWidth` / `borderColor`, so High attention
    // looked like plain text for brands on outline (e.g. Reliance, Tira) while
    // **solid** Jio/Swadesh still showed a filled bold surface.
    if (border == null && effective == OneUiButtonVariant.bold) {
      final insetW = ds.resolveComponentLengthPxCascade(
        [
          '--Button-cssDecorationInsetStrokeWidth-${_variantSuffix(effective)}',
          '--Button-cssDecorationInsetStrokeWidth',
        ],
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      if (insetW != null && insetW > 0) {
        final rawDecoColor = ds.rawComponentCascade([
          '--Button-cssDecorationColor-${_variantSuffix(effective)}',
          '--Button-cssDecorationColor',
        ]);
        Color? strokeColor;
        if (rawDecoColor != null) {
          strokeColor = resolveButtonTokenColor(
            context,
            ds,
            rawDecoColor,
            appearance: _resolvedAppearance,
          );
          final concrete = ds.resolveCSSValue(
            rawDecoColor,
            platformId: plat,
            density: den,
            platformsConfig: pc,
            nativeTypography: typo,
          );
          if (strokeColor == null &&
              concrete != null &&
              concrete.trim().toLowerCase() == 'currentcolor') {
            strokeColor = colors.foreground;
          }
        }
        strokeColor ??= colors.foreground;
        if (strokeColor.a > 0) {
          border = Border.all(width: insetW, color: strokeColor);
        }
      }
    }

    final interactive = !(widget.disabled || widget.loading);

    final bgAmbient = interactive && _hovered && colors.backgroundHover != null
        ? colors.backgroundHover!
        : colors.background;

    var fgAmbient = colors.foreground;
    if (effective == OneUiButtonVariant.ghost && interactive && _hovered) {
      fgAmbient = colors.foregroundHover ?? colors.foreground;
    }

    final ttRaw = ds.rawComponentCascade(['--Button-textTransform'])!;
    final ttResolved = ds.resolveCSSValue(
      ttRaw,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    )!;
    final plain = widget.label ?? '';
    final dispLabel = buttonDisplayLabelForTextTransform(ttResolved, plain);

    final lsRaw = ds.rawComponentCascade(['--Button-letterSpacing'])!;
    final lsResolved = ds.resolveCSSValue(
      lsRaw,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    )!;
    final letterSpacing = buttonLetterSpacingPxFromCss(
      lsResolved,
      fontSizePx: labelStyle.fontSize ?? 14,
    );

    final style = labelStyle.copyWith(
      letterSpacing: letterSpacing,
      color: fgAmbient,
    );

    final iconSize = (_slotStart != null || _slotEnd != null)
        ? _gapPx(ds, ['--Button-iconSize-$sz', '--Button-iconSize'],
            platformId: plat,
            density: den,
            platformsFoundationConfig: pc,
            nativeTypography: typo)
        : null;

    final gapStart = _iconGapPx(ds, scope, 'start');
    final gapEnd = _iconGapPx(ds, scope, 'end');

    final disabledOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Disabled-Opacity',
                platformId: plat, density: den) ??
            ds.componentCustomProperties['--Disabled-Opacity'],
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      return double.tryParse(raw ?? '') ?? 0.38;
    }();

    final effectiveOrnament = widget.inheritOrnamentFromScope
        ? scope.buttonOrnament
        : widget.decoration;
    final ornament = effectiveOrnament;
    final margins = ornament != null
        ? buttonOrnamentMargins(
            ds: ds,
            minHeightPx: minH,
            ornament: ornament,
            platformId: plat,
            density: den,
          )
        : (left: 0.0, right: 0.0);
    final ornamentHeightScale = ornament != null
        ? buttonOrnamentHeightScale(ds, platformId: plat, density: den)
        : 1.0;
    // Web `ButtonDecoration.tsx`: `height: calc((100% + 2 * --_btn-bw) * ornamentHeightScale)`
    // where `100%` is the rendered button — not token `minHeight`. Using `minH` alone misses
    // size L + slots when the row exceeds the min-height token.

    BorderRadius coreBorderRadius() {
      final o = ornament;
      if (o == null) return BorderRadius.circular(radius);
      final cr = Radius.circular(radius);
      return BorderRadius.only(
        topLeft: o.showLeft ? Radius.zero : cr,
        bottomLeft: o.showLeft ? Radius.zero : cr,
        topRight: o.showRight ? Radius.zero : cr,
        bottomRight: o.showRight ? Radius.zero : cr,
      );
    }

    Widget buildChrome(Color fillPaint) {
      Color? ornamentStrokeColor;
      var ornamentStrokeWidthPx = 0.0;
      if (ornament != null) {
        final suf = _variantSuffix(effective);
        var insetW = ds.resolveComponentLengthPxCascade(
          [
            '--Button-cssDecorationInsetStrokeWidth-$suf',
            '--Button-cssDecorationInsetStrokeWidth',
          ],
          platformId: plat,
          density: den,
          platformsConfig: pc,
          nativeTypography: typo,
        );
        if ((insetW == null || insetW < 0.25) &&
            effective == OneUiButtonVariant.ghost) {
          insetW = bw;
        }
        ornamentStrokeWidthPx = insetW ?? 0;
        if (ornamentStrokeWidthPx > 0.25) {
          final rawStroke = ds.rawComponentCascade([
            '--Button-cssDecorationColor-$suf',
            '--Button-cssDecorationColor',
          ]);
          if (rawStroke != null) {
            ornamentStrokeColor = resolveButtonTokenColor(
              context,
              ds,
              rawStroke,
              appearance: _resolvedAppearance,
            );
            final concrete = ds.resolveCSSValue(
              rawStroke,
              platformId: plat,
              density: den,
              platformsConfig: pc,
              nativeTypography: typo,
            );
            if (ornamentStrokeColor == null &&
                concrete != null &&
                concrete.trim().toLowerCase() == 'currentcolor') {
              ornamentStrokeColor = fgAmbient;
            }
          }
          ornamentStrokeColor ??= fgAmbient;
          final osc = ornamentStrokeColor;
          if (osc.a <= (8 / 255)) {
            ornamentStrokeColor = null;
            ornamentStrokeWidthPx = 0;
          }
        }
      }

      final ornamentLayers = ornament != null
          ? resolveButtonOrnamentLayers(
              ornament: ornament,
              bodyFill: fillPaint,
              ornamentStrokeColor: ornamentStrokeColor,
              ornamentStrokeWidthPx: ornamentStrokeWidthPx,
            )
          : null;

      final coreButton = ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: minH,
          minWidth: widget.fullWidth ? double.infinity : touchTargetMin,
        ),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: fillPaint,
            borderRadius: coreBorderRadius(),
            border: border,
          ),
          child: Padding(
            padding: EdgeInsets.fromLTRB(padL, padV, padR, padV),
            child: _wrapLoadingOverlay(
              Row(
                mainAxisSize:
                    widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_slotStart != null) ...[
                    _preserveLayoutWhenLoading(
                      child: SizedBox(
                        width: iconSize,
                        height: iconSize,
                        child: IconTheme.merge(
                          data: IconThemeData(color: fgAmbient, size: iconSize),
                          child: _wrapButtonSlot(_slotStart!),
                        ),
                      ),
                    ),
                    SizedBox(width: gapStart),
                  ],
                  Flexible(
                    fit: widget.fullWidth ? FlexFit.tight : FlexFit.loose,
                    child: widget.loading
                        ? ExcludeSemantics(
                            child: _preserveLayoutWhenLoading(
                              child: widget.child != null
                                  ? _oneUiButtonStyledChild(
                                      widget.child!,
                                      style,
                                      iconColor: fgAmbient,
                                      center: true,
                                    )
                                  : Text(
                                      dispLabel,
                                      style: style,
                                      textAlign: TextAlign.center,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                            ),
                          )
                        : widget.child != null
                            ? _oneUiButtonStyledChild(
                                widget.child!,
                                style,
                                iconColor: fgAmbient,
                                center: true,
                              )
                            : Text(
                                dispLabel,
                                style: style,
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.ellipsis,
                              ),
                  ),
                  if (_slotEnd != null) ...[
                    SizedBox(width: gapEnd),
                    _preserveLayoutWhenLoading(
                      child: SizedBox(
                        width: iconSize,
                        height: iconSize,
                        child: IconTheme.merge(
                          data: IconThemeData(color: fgAmbient, size: iconSize),
                          child: _wrapButtonSlot(_slotEnd!),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              fgAmbient,
            ),
          ),
        ),
      );

      final leftBarW =
          ornament != null && ornamentLayers?.left != null && margins.left > 0
              ? margins.left
              : 0.0;
      final rightBarW =
          ornament != null && ornamentLayers?.right != null && margins.right > 0
              ? margins.right
              : 0.0;

      if (leftBarW <= 0 && rightBarW <= 0) {
        return widget.fullWidth
            ? SizedBox(width: double.infinity, child: coreButton)
            : coreButton;
      }

      /// Web aligns ornament edges using `calc(100% - var(--Stroke-S, 0.5px))`; match sub-pixel tuck.
      final strokeSx = lengthPrimitiveSansPlatformDims('--Stroke-S');
      final strokeAlignPx = _gapPx(ds, ['--Stroke-S'],
              platformId: plat,
              density: den,
              platformsFoundationConfig: pc,
              nativeTypography: typo) ??
          ds.parsePx(
            strokeSx!,
            platformId: plat,
            density: den,
            platformsConfig: pc,
            nativeTypography: typo,
          )!;

      // Web `.button`: margin-left/right reserve layout space while ornaments overlap in-flow visually.
      //
      // Ornaments must be [Positioned] — plain [Align] in a [Stack] expands to the parent's max width,
      // so wide parents (Storybook sections) pinned brackets to screen edges with a hollow center.
      // Only [coreButton] stays non-positioned so the stack shrink-wraps to label + padding width.
      return Padding(
        padding: EdgeInsets.only(left: leftBarW, right: rightBarW),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            if (ornamentLayers?.left != null && leftBarW > 0)
              Positioned(
                left: -leftBarW + strokeAlignPx,
                top: 0,
                bottom: 0,
                width: leftBarW,
                child: LayoutBuilder(
                  builder: (context, c) {
                    final stackH = c.maxHeight.isFinite && c.maxHeight > 0
                        ? c.maxHeight
                        : minH;
                    final ornamentH = (stackH + 2 * bw) * ornamentHeightScale;
                    return Align(
                      alignment: Alignment.center,
                      child: SizedBox(
                        width: leftBarW,
                        height: ornamentH,
                        child: buttonOrnamentSideRendered(
                          data: ornamentLayers!.left!,
                          width: leftBarW,
                          height: ornamentH,
                        ),
                      ),
                    );
                  },
                ),
              ),
            if (ornamentLayers?.right != null && rightBarW > 0)
              Positioned(
                right: strokeAlignPx - rightBarW,
                top: 0,
                bottom: 0,
                width: rightBarW,
                child: LayoutBuilder(
                  builder: (context, c) {
                    final stackH = c.maxHeight.isFinite && c.maxHeight > 0
                        ? c.maxHeight
                        : minH;
                    final ornamentH = (stackH + 2 * bw) * ornamentHeightScale;
                    return Align(
                      alignment: Alignment.center,
                      child: SizedBox(
                        width: rightBarW,
                        height: ornamentH,
                        child: buttonOrnamentSideRendered(
                          data: ornamentLayers!.right!,
                          width: rightBarW,
                          height: ornamentH,
                        ),
                      ),
                    );
                  },
                ),
              ),
            widget.fullWidth
                ? SizedBox(width: double.infinity, child: coreButton)
                : coreButton,
          ],
        ),
      );
    }

    final disabledBody = Opacity(
      opacity: widget.disabled || widget.loading ? disabledOpacity : 1,
      child: widget.fullWidth
          ? SizedBox(
              width: double.infinity, child: buildChrome(colors.background))
          : buildChrome(colors.background),
    );

    final semanticsLabelEffective =
        widget.semanticsLabel?.trim().isNotEmpty == true
            ? widget.semanticsLabel!.trim()
            : (dispLabel.trim().isNotEmpty ? dispLabel.trim() : 'Button');

    final tapMotion = _buttonTapMotion(context, ds);

    final focusPaint = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: _resolvedAppearance,
      innerGapColorOverride: _focusRingInnerGapOverride(context, bgAmbient),
    );

    final interactiveBody = OneUiFocusInteractive(
      semanticsLabel: semanticsLabelEffective,
      semanticsHint: widget.semanticsHint,
      semanticsBusy: widget.loading,
      semanticsExpanded: widget.semanticsExpanded,
      semanticsControlsSemanticsIdentifiers:
          widget.semanticsControlsSemanticsIdentifiers,
      semanticsIdentifier: _trimmedTestId,
      enabled: interactive,
      onPressed: interactive ? _handleActivated : null,
      onHoverChanged:
          interactive ? (hovered) => setState(() => _hovered = hovered) : null,
      borderRadius: BorderRadius.circular(radius),
      focusRing: focusPaint,
      tapMotion: tapMotion,
      autofocus: widget.autofocus,
      forceFocusRing: widget.forceFocusRing,
      pressAnimationBuilder: interactive
          ? (context, press) {
              final fill = Color.lerp(bgAmbient, bgPressed, press.value)!;
              final inner = Opacity(
                opacity:
                    widget.disabled || widget.loading ? disabledOpacity : 1,
                child: buildChrome(fill),
              );
              return widget.fullWidth
                  ? SizedBox(width: double.infinity, child: inner)
                  : inner;
            }
          : null,
      child: interactive ? null : disabledBody,
    );

    Widget result = interactiveBody;

    if (widget.excludeFromSemantics) {
      result = ExcludeSemantics(child: result);
    }

    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }
}

/// Placeholder heart icon for slot stories (web `SlotIcon` / RN `IcFavorite`).
class OneUiButtonSlotIcon extends StatelessWidget {
  const OneUiButtonSlotIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return const Icon(Icons.favorite, semanticLabel: '');
  }
}
