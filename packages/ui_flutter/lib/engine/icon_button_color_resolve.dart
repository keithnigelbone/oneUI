import 'package:flutter/material.dart';

import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';

/// Resolved fill / icon colours — `IconButton.module.css` `--_ib-*` cascade.
class IconButtonResolvedColors {
  const IconButtonResolvedColors({
    required this.background,
    required this.foreground,
    required this.backgroundPressed,
    this.backgroundHover,
    this.backgroundPressedFill,
    required this.stateLayerHover,
    required this.stateLayerPressed,
    this.borderColor,
  });

  final Color background;
  final Color foreground;

  /// Optional explicit `--IconButton-backgroundColor-*-pressed` override only.
  final Color backgroundPressed;

  /// Optional explicit `--IconButton-backgroundColor-*-hover` override only.
  final Color? backgroundHover;

  /// Alias for [backgroundPressed] when an explicit pressed fill override exists.
  final Color? backgroundPressedFill;
  final Color stateLayerHover;
  final Color stateLayerPressed;
  final Color? borderColor;
}

Color? _resolveIconButtonTokenColor(
  BuildContext context,
  NativeDesignSystemPayload ds,
  String? raw, {
  required String appearance,
}) {
  return resolveButtonTokenColor(context, ds, raw, appearance: appearance);
}

Color? _explicitIconButtonFillOverride(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String appearance,
}) {
  return resolveButtonPaintFromComponentKeys(
    context,
    ds,
    keys: keys,
    appearance: appearance,
  );
}

Color _fallbackStateLayer(Color source, {required double opacity}) {
  return source.withValues(alpha: opacity);
}

Color _resolveIconButtonStateLayer(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required FlatRoleTokens role,
  required String appearance,
  required List<String> componentKeys,
  required String roleLayerToken,
  required Color fallbackSource,
  required double fallbackOpacity,
}) {
  final fromComponent = resolveButtonPaintFromComponentKeys(
    context,
    ds,
    keys: componentKeys,
    appearance: appearance,
  );
  if (fromComponent != null && fromComponent.a > 0) {
    return fromComponent;
  }

  final fromRole = _resolveIconButtonTokenColor(
    context,
    ds,
    roleLayerToken,
    appearance: appearance,
  );
  if (fromRole != null && fromRole.a > 0) {
    return fromRole;
  }

  return _fallbackStateLayer(fallbackSource, opacity: fallbackOpacity);
}

IconButtonResolvedColors resolveIconButtonColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiIconButtonVariantKind variant,
  required String appearance,
}) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);
  final variantKey = switch (variant) {
    OneUiIconButtonVariantKind.bold => 'bold',
    OneUiIconButtonVariantKind.subtle => 'subtle',
    OneUiIconButtonVariantKind.ghost => 'ghost',
  };
  final useRoleSlots = appearance == 'primary';
  final roleLabel = oneUiAppearanceCssLabel(appearance);

  Color? fromComponent(List<String> keys) =>
      resolveButtonPaintFromComponentKeys(
        context,
        ds,
        keys: keys,
        appearance: appearance,
      );

  switch (variant) {
    case OneUiIconButtonVariantKind.bold:
      final bgDefault = fromComponent([
            '--IconButton-backgroundColor-$variantKey',
            if (useRoleSlots) '--IconButton-roleBold',
          ]) ??
          oneUiHexColor(role.surfaces[kSurfaceBold]!);
      final bgPressedOverride = _explicitIconButtonFillOverride(
        context,
        ds,
        keys: ['--IconButton-backgroundColor-bold-pressed'],
        appearance: appearance,
      );
      final bgPressed = bgPressedOverride ??
          fromComponent([
            if (useRoleSlots) '--IconButton-roleBoldPressed',
          ]) ??
          _resolveIconButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Bold-Pressed',
            appearance: appearance,
          ) ??
          oneUiHexColor(
              role.states['boldPressed'] ?? role.surfaces[kSurfaceBold]!);
      final onBoldHigh = oneUiHexColor(
          role.onBoldContent['high'] ?? role.onBoldContent['tintedA11y']!);
      return IconButtonResolvedColors(
        background: bgDefault,
        foreground: fromComponent([
              '--IconButton-iconColor-$variantKey',
              '--IconButton-iconColor',
              if (useRoleSlots) '--IconButton-roleBoldHigh',
            ]) ??
            oneUiHexColor(role.onBoldContent['tintedA11y']!),
        backgroundPressed: bgPressed,
        backgroundPressedFill: bgPressedOverride,
        backgroundHover: _explicitIconButtonFillOverride(
          context,
          ds,
          keys: ['--IconButton-backgroundColor-bold-hover'],
          appearance: appearance,
        ),
        stateLayerHover: _resolveIconButtonStateLayer(
          context,
          ds,
          role: role,
          appearance: appearance,
          componentKeys: [
            '--IconButton-stateLayer-bold-hover',
            if (useRoleSlots) '--IconButton-stateLayer-hover',
          ],
          roleLayerToken: '--$roleLabel-Bold-Hover-Layer',
          fallbackSource: onBoldHigh,
          fallbackOpacity: 0.08,
        ),
        stateLayerPressed: _resolveIconButtonStateLayer(
          context,
          ds,
          role: role,
          appearance: appearance,
          componentKeys: [
            '--IconButton-stateLayer-bold-pressed',
            if (useRoleSlots) '--IconButton-stateLayer-pressed',
          ],
          roleLayerToken: '--$roleLabel-Bold-Pressed-Layer',
          fallbackSource: onBoldHigh,
          fallbackOpacity: 0.12,
        ),
        borderColor: fromComponent([
          '--IconButton-borderColor-$variantKey',
          '--IconButton-borderColor',
        ]),
      );
    case OneUiIconButtonVariantKind.subtle:
      final bgDefault = fromComponent([
            '--IconButton-backgroundColor-$variantKey',
            if (useRoleSlots) '--IconButton-roleSubtle',
          ]) ??
          oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
      final bgPressedOverride = _explicitIconButtonFillOverride(
        context,
        ds,
        keys: ['--IconButton-backgroundColor-subtle-pressed'],
        appearance: appearance,
      );
      final bgPressed = bgPressedOverride ??
          fromComponent([
            if (useRoleSlots) '--IconButton-roleSubtlePressed',
          ]) ??
          _resolveIconButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Subtle-Pressed',
            appearance: appearance,
          ) ??
          oneUiHexColor(
              role.states['subtlePressed'] ?? role.surfaces[kSurfaceSubtle]!);
      final contentHigh = oneUiHexColor(role.content['high']!);
      return IconButtonResolvedColors(
        background: bgDefault,
        foreground: fromComponent([
              '--IconButton-iconColor-$variantKey',
              '--IconButton-iconColor',
              if (useRoleSlots) '--IconButton-roleTintedA11y',
            ]) ??
            oneUiHexColor(role.content['tintedA11y']!),
        backgroundPressed: bgPressed,
        backgroundPressedFill: bgPressedOverride,
        backgroundHover: _explicitIconButtonFillOverride(
          context,
          ds,
          keys: ['--IconButton-backgroundColor-subtle-hover'],
          appearance: appearance,
        ),
        stateLayerHover: _resolveIconButtonStateLayer(
          context,
          ds,
          role: role,
          appearance: appearance,
          componentKeys: [
            '--IconButton-stateLayer-subtle-hover',
            if (useRoleSlots) '--IconButton-stateLayer-hover',
          ],
          roleLayerToken: '--$roleLabel-Subtle-Hover-Layer',
          fallbackSource: contentHigh,
          fallbackOpacity: 0.08,
        ),
        stateLayerPressed: _resolveIconButtonStateLayer(
          context,
          ds,
          role: role,
          appearance: appearance,
          componentKeys: [
            '--IconButton-stateLayer-subtle-pressed',
            if (useRoleSlots) '--IconButton-stateLayer-pressed',
          ],
          roleLayerToken: '--$roleLabel-Subtle-Pressed-Layer',
          fallbackSource: contentHigh,
          fallbackOpacity: 0.12,
        ),
        borderColor: fromComponent([
          '--IconButton-borderColor-$variantKey',
          '--IconButton-borderColor',
        ]),
      );
    case OneUiIconButtonVariantKind.ghost:
      final bgPressedOverride = _explicitIconButtonFillOverride(
        context,
        ds,
        keys: ['--IconButton-backgroundColor-ghost-pressed'],
        appearance: appearance,
      );
      final bgPressed = bgPressedOverride ??
          fromComponent([
            if (useRoleSlots) '--IconButton-rolePressed',
          ]) ??
          _resolveIconButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Subtle-Pressed',
            appearance: appearance,
          ) ??
          _resolveIconButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Pressed',
            appearance: appearance,
          ) ??
          oneUiHexColor(
              role.states['subtlePressed'] ?? role.surfaces[kSurfaceSubtle]!);
      final contentHigh = oneUiHexColor(role.content['high']!);
      return IconButtonResolvedColors(
        background: fromComponent(['--IconButton-backgroundColor-ghost']) ??
            const Color(0x00000000),
        foreground: fromComponent(['--IconButton-iconColor-ghost']) ??
            fromComponent([if (useRoleSlots) '--IconButton-roleTintedA11y']) ??
            oneUiHexColor(role.content['tintedA11y']!),
        backgroundPressed: bgPressed,
        backgroundPressedFill: bgPressedOverride,
        backgroundHover: _explicitIconButtonFillOverride(
          context,
          ds,
          keys: ['--IconButton-backgroundColor-ghost-hover'],
          appearance: appearance,
        ),
        stateLayerHover: _resolveIconButtonStateLayer(
          context,
          ds,
          role: role,
          appearance: appearance,
          componentKeys: [
            '--IconButton-stateLayer-ghost-hover',
            if (useRoleSlots) '--IconButton-stateLayer-hover',
          ],
          roleLayerToken: '--$roleLabel-Hover-Layer',
          fallbackSource: contentHigh,
          fallbackOpacity: 0.08,
        ),
        stateLayerPressed: _resolveIconButtonStateLayer(
          context,
          ds,
          role: role,
          appearance: appearance,
          componentKeys: [
            '--IconButton-stateLayer-ghost-pressed',
            if (useRoleSlots) '--IconButton-stateLayer-pressed',
          ],
          roleLayerToken: '--$roleLabel-Pressed-Layer',
          fallbackSource: contentHigh,
          fallbackOpacity: 0.12,
        ),
        borderColor: fromComponent([
              '--IconButton-borderColor-ghost',
              '--IconButton-borderColor',
              if (useRoleSlots) '--IconButton-roleStrokeLow',
            ]) ??
            (role.content['strokeLow'] != null
                ? oneUiHexColor(role.content['strokeLow']!)
                : null),
      );
  }
}

enum OneUiIconButtonVariantKind { bold, subtle, ghost }
