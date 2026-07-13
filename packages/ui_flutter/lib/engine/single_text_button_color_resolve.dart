import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';
import '../utils/one_ui_hex_color.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Resolved fill / label colours — `SingleTextButton.module.css` `--_stb-*` cascade.
typedef SingleTextButtonResolvedColors = ButtonResolvedColors;

/// Attention keys in CSS are `high` / `medium` / `low` (not bold/subtle/ghost).
enum OneUiSingleTextButtonAttentionKind { high, medium, low }

/// Role palette for paint — configured appearances use surface engine; extended
/// roles (tertiary/quaternary) without `themeConfig` entries mirror web CSS
/// `var(--Role-*, var(--Surface-Bold))` via neutral tokens at the active surface step.
FlatRoleTokens resolveSingleTextButtonRoleTokens(
  BuildContext context,
  String appearance,
) {
  final key = normalizeAppearanceRoleKey(appearance);
  final scope = OneUiSurfaceScope.of(context);
  if (scope.themeConfig.appearances.containsKey(key)) {
    return OneUiSurfaceScope.tokensForAppearance(context, appearance);
  }
  return OneUiSurfaceScope.tokensForAppearance(context, 'neutral');
}

Color? _fromComponent(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String appearance,
}) {
  return resolveColorFromComponentPropertyKeys(
    context,
    ds,
    keys: keys,
    appearance: appearance,
  );
}

Color? _roleTokenColor(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String appearance,
  required String suffix,
}) {
  final label = oneUiAppearanceCssLabel(appearance);
  return resolveButtonTokenColor(
    context,
    ds,
    'var(--$label-$suffix)',
    appearance: appearance,
  );
}

SingleTextButtonResolvedColors resolveSingleTextButtonColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiSingleTextButtonAttentionKind attention,
  required String appearance,
}) {
  final role = resolveSingleTextButtonRoleTokens(context, appearance);
  final attentionKey = attention.name;
  final useRoleSlots = appearance == 'primary';

  switch (attention) {
    case OneUiSingleTextButtonAttentionKind.high:
      final bgDefault = _fromComponent(
            context,
            ds,
            keys: [
              '--SingleTextButton-backgroundColor-$attentionKey',
              if (useRoleSlots) '--SingleTextButton-roleBold',
            ],
            appearance: appearance,
          ) ??
          _roleTokenColor(context, ds, appearance: appearance, suffix: 'Bold') ??
          oneUiHexColor(role.surfaces[kSurfaceBold]!);
      final bgPressed = _fromComponent(
            context,
            ds,
            keys: [
              '--SingleTextButton-backgroundColor-$attentionKey-pressed',
              if (useRoleSlots) '--SingleTextButton-roleBoldPressed',
            ],
            appearance: appearance,
          ) ??
          _roleTokenColor(
            context,
            ds,
            appearance: appearance,
            suffix: 'Bold-Pressed',
          ) ??
          oneUiHexColor(
              role.states['boldPressed'] ?? role.surfaces[kSurfaceBold]!);
      return SingleTextButtonResolvedColors(
        background: bgDefault,
        foreground: _fromComponent(
              context,
              ds,
              keys: [
                '--SingleTextButton-textColor-$attentionKey',
                if (useRoleSlots) '--SingleTextButton-roleBoldHigh',
              ],
              appearance: appearance,
            ) ??
            _roleTokenColor(
              context,
              ds,
              appearance: appearance,
              suffix: 'Bold-TintedA11y',
            ) ??
            oneUiHexColor(role.onBoldContent['tintedA11y']!),
        backgroundPressed: bgPressed,
        backgroundHover: _fromComponent(
              context,
              ds,
              keys: [
                '--SingleTextButton-backgroundColor-$attentionKey-hover',
                if (useRoleSlots) '--SingleTextButton-roleBoldHover',
              ],
              appearance: appearance,
            ) ??
            _roleTokenColor(
              context,
              ds,
              appearance: appearance,
              suffix: 'Bold-Hover',
            ),
      );
    case OneUiSingleTextButtonAttentionKind.medium:
      final bgDefault = _fromComponent(
            context,
            ds,
            keys: [
              '--SingleTextButton-backgroundColor-$attentionKey',
              if (useRoleSlots) '--SingleTextButton-roleSubtle',
            ],
            appearance: appearance,
          ) ??
          _roleTokenColor(context, ds, appearance: appearance, suffix: 'Subtle') ??
          oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
      final bgPressed = _fromComponent(
            context,
            ds,
            keys: [
              '--SingleTextButton-backgroundColor-$attentionKey-pressed',
              if (useRoleSlots) '--SingleTextButton-roleSubtlePressed',
            ],
            appearance: appearance,
          ) ??
          _roleTokenColor(
            context,
            ds,
            appearance: appearance,
            suffix: 'Subtle-Pressed',
          ) ??
          oneUiHexColor(
              role.states['subtlePressed'] ?? role.surfaces[kSurfaceSubtle]!);
      return SingleTextButtonResolvedColors(
        background: bgDefault,
        foreground: _fromComponent(
              context,
              ds,
              keys: [
                '--SingleTextButton-textColor-$attentionKey',
                if (useRoleSlots) '--SingleTextButton-roleTintedA11y',
              ],
              appearance: appearance,
            ) ??
            _roleTokenColor(
              context,
              ds,
              appearance: appearance,
              suffix: 'TintedA11y',
            ) ??
            oneUiHexColor(role.content['tintedA11y']!),
        backgroundPressed: bgPressed,
        backgroundHover: _fromComponent(
              context,
              ds,
              keys: [
                '--SingleTextButton-backgroundColor-$attentionKey-hover',
                if (useRoleSlots) '--SingleTextButton-roleSubtleHover',
              ],
              appearance: appearance,
            ) ??
            _roleTokenColor(
              context,
              ds,
              appearance: appearance,
              suffix: 'Subtle-Hover',
            ),
      );
    case OneUiSingleTextButtonAttentionKind.low:
      final tintedA11y = _fromComponent(
            context,
            ds,
            keys: [
              '--SingleTextButton-textColor-$attentionKey',
              if (useRoleSlots) '--SingleTextButton-roleTintedA11y',
            ],
            appearance: appearance,
          ) ??
          _roleTokenColor(
            context,
            ds,
            appearance: appearance,
            suffix: 'TintedA11y',
          ) ??
          oneUiHexColor(role.content['tintedA11y']!);
      final bgPressed = _fromComponent(
            context,
            ds,
            keys: [
              '--SingleTextButton-backgroundColor-$attentionKey-pressed',
              if (useRoleSlots) '--SingleTextButton-rolePressed',
            ],
            appearance: appearance,
          ) ??
          _roleTokenColor(
            context,
            ds,
            appearance: appearance,
            suffix: 'Pressed',
          ) ??
          _roleTokenColor(
            context,
            ds,
            appearance: appearance,
            suffix: 'Subtle-Pressed',
          ) ??
          oneUiHexColor(
              role.states['pressed'] ?? role.surfaces[kSurfaceSubtle]!);
      return SingleTextButtonResolvedColors(
        background: _fromComponent(
              context,
              ds,
              keys: ['--SingleTextButton-backgroundColor-$attentionKey'],
              appearance: appearance,
            ) ??
            const Color(0x00000000),
        foreground: tintedA11y,
        backgroundPressed: bgPressed,
        backgroundHover: _fromComponent(
              context,
              ds,
              keys: [
                '--SingleTextButton-backgroundColor-$attentionKey-hover',
                if (useRoleSlots) '--SingleTextButton-roleHover',
              ],
              appearance: appearance,
            ) ??
            _roleTokenColor(
              context,
              ds,
              appearance: appearance,
              suffix: 'Hover',
            ) ??
            oneUiHexColor(
                role.states['hover'] ?? role.surfaces[kSurfaceMinimal]!),
      );
  }
}

/// Inset stroke for outline emphasis — web `.singleTextButton::after`.
Border? resolveSingleTextButtonCssDecorationBorder(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiSingleTextButtonAttentionKind attention,
  required String appearance,
  required Color fallbackStroke,
}) {
  if (attention != OneUiSingleTextButtonAttentionKind.high) return null;

  final scope = OneUiScope.of(context);
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);

  final insetW = ds.resolveComponentLengthPxCascade(
    [
      '--SingleTextButton-cssDecorationInsetStrokeWidth',
    ],
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
  );
  if (insetW == null || insetW <= 0) return null;

  final rawDeco = ds.rawComponentCascade([
    '--SingleTextButton-cssDecorationColor',
  ]);
  Color? strokeColor;
  if (rawDeco != null) {
    strokeColor = resolveButtonTokenColor(
      context,
      ds,
      rawDeco,
      appearance: appearance,
    );
    final concrete = ds.resolveCSSValue(
      rawDeco,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );
    if (strokeColor == null &&
        concrete != null &&
        concrete.trim().toLowerCase() == 'currentcolor') {
      strokeColor = fallbackStroke;
    }
  }
  strokeColor ??= fallbackStroke;
  if (strokeColor.a <= 0) return null;
  return Border.all(width: insetW, color: strokeColor);
}
