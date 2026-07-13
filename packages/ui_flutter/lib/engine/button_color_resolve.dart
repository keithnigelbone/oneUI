import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Resolved fill / label colours for [OneUiButton] — mirrors web `Button.module.css`
/// `--_btn-*` / `--Button-role*` / `--Button-backgroundColor*` cascade.
class ButtonResolvedColors {
  const ButtonResolvedColors({
    required this.background,
    required this.foreground,
    required this.backgroundPressed,
    this.backgroundHover,
    this.foregroundHover,
    this.borderColor,
  });

  final Color background;
  final Color foreground;

  /// Web `:active` / `--Button-*-pressed` + `--*-Bold-Pressed` / `--*-Subtle-Pressed` / `--*-Pressed`.
  final Color backgroundPressed;

  /// Web `:hover` background (ghost: `--Button-backgroundColor-ghost-hover`; bold/subtle optional).
  final Color? backgroundHover;

  /// When [.foreground] alpha is `0` (brand `--Button-textColor-ghost: transparent`),
  /// [.foregroundHover] matches web accent label (`--Button-textColor…`) so Flutter can reveal
  /// the label once hover fill paints.
  final Color? foregroundHover;
  final Color? borderColor;
}

String oneUiAppearanceCssLabel(String role) {
  if (role == 'brand-bg') return 'Brand-Bg';
  if (role.isEmpty) return role;
  return role[0].toUpperCase() + role.substring(1);
}

/// Parses `--Primary-Bold-TintedA11y` → (`primary`, `Bold-TintedA11y`).
(String role, String suffix)? parseSurfaceTokenVar(
    String? cssVar, Iterable<String> roles) {
  if (cssVar == null) return null;
  var v = cssVar.trim();
  if (!v.startsWith('--')) return null;
  v = v.substring(2);

  for (final role in roles) {
    final label = oneUiAppearanceCssLabel(role);
    if (v.startsWith('$label-')) {
      return (role, v.substring(label.length + 1));
    }
  }
  return null;
}

Color? parseCssColorString(String? raw) {
  if (raw == null) return null;
  final t = raw.trim();
  if (t.isEmpty) return null;
  if (t.toLowerCase() == 'transparent') {
    return const Color(0x00000000);
  }
  if (t.startsWith('#')) return oneUiHexColor(t);
  return _parseRgbaCssColor(t);
}

Color? _parseRgbaCssColor(String t) {
  final m = RegExp(r'^rgba?\(([^)]+)\)$', caseSensitive: false).firstMatch(t);
  if (m == null) return null;
  final parts = m.group(1)!.split(',').map((e) => e.trim()).toList();
  if (parts.length < 3) return null;
  final r = double.tryParse(parts[0]);
  final g = double.tryParse(parts[1]);
  final b = double.tryParse(parts[2]);
  final a = parts.length >= 4 ? double.tryParse(parts[3]) : 1.0;
  if (r == null || g == null || b == null || a == null) return null;
  return Color.fromRGBO(
    r.round().clamp(0, 255),
    g.round().clamp(0, 255),
    b.round().clamp(0, 255),
    a.clamp(0.0, 1.0),
  );
}

Color? _stateLayerFromRole(FlatRoleTokens role, StateToken token) {
  final raw = role.stateLayers[token];
  if (raw == null || raw.isEmpty) return null;
  return parseCssColorString(raw);
}

Color? _colorFromRoleSuffix(FlatRoleTokens role, String suffix) {
  switch (suffix) {
    case 'Bold':
      return oneUiHexColor(role.surfaces[kSurfaceBold]!);
    case 'Subtle':
      return oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
    case 'Bold-TintedA11y':
      return oneUiHexColor(
          role.onBoldContent['tintedA11y'] ?? role.onBoldContent['high']!);
    case 'Bold-Low':
      return oneUiHexColor(
          role.onBoldContent['low'] ?? role.content['low']!);
    case 'Bold-High':
      return oneUiHexColor(role.onBoldContent['high']!);
    // `--Primary-TintedA11y` (no `Bold-` prefix) is default-surface tinted text —
    // e.g. web outline bold: `--Button-textColor-bold: var(--Primary-TintedA11y)`.
    // Must NOT branch to `onBoldContent`; that maps to readable-on-filled-bold (often ~white).
    case 'TintedA11y':
      return oneUiHexColor(role.content['tintedA11y']!);
    case 'Stroke-Low':
      return oneUiHexColor(role.content['strokeLow']!);
    case 'Stroke-Medium':
      return oneUiHexColor(role.content['strokeMedium']!);
    case 'Medium-Text':
      return oneUiHexColor(role.content['medium']!);
    case 'Low':
      return oneUiHexColor(role.content['low']!);
    case 'High':
      return oneUiHexColor(role.content['high']!);
    case 'Hover':
      return oneUiHexColor(
          role.states['hover'] ?? role.surfaces[kSurfaceMinimal]!);
    case 'Pressed':
      return oneUiHexColor(
          role.states['pressed'] ?? role.surfaces[kSurfaceSubtle]!);
    case 'Bold-Hover':
      return oneUiHexColor(
          role.states['boldHover'] ?? role.surfaces[kSurfaceBold]!);
    case 'Bold-Pressed':
      return oneUiHexColor(
          role.states['boldPressed'] ?? role.surfaces[kSurfaceBold]!);
    case 'Bold-Hover-Layer':
      return _stateLayerFromRole(role, 'boldHover');
    case 'Bold-Pressed-Layer':
      return _stateLayerFromRole(role, 'boldPressed');
    case 'Subtle-Pressed':
      return oneUiHexColor(
          role.states['subtlePressed'] ?? role.surfaces[kSurfaceSubtle]!);
    case 'Subtle-Hover':
      return oneUiHexColor(
          role.states['subtleHover'] ?? role.surfaces[kSurfaceSubtle]!);
    case 'Subtle-Hover-Layer':
      return _stateLayerFromRole(role, 'subtleHover');
    case 'Subtle-Pressed-Layer':
      return _stateLayerFromRole(role, 'subtlePressed');
    case 'Hover-Layer':
      return _stateLayerFromRole(role, 'hover');
    case 'Pressed-Layer':
      return _stateLayerFromRole(role, 'pressed');
    case 'Fill-Default':
      return oneUiHexColor(role.surfaces[kSurfaceDefault]!);
    case 'Fill-Ghost':
      return oneUiHexColor(role.surfaces[kSurfaceGhost]!);
    case 'Fill-Minimal':
      return oneUiHexColor(role.surfaces[kSurfaceMinimal]!);
    case 'Fill-Subtle':
      return oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
    case 'Fill-Moderate':
      return oneUiHexColor(role.surfaces[kSurfaceModerate]!);
    case 'Fill-Bold':
      return oneUiHexColor(role.surfaces[kSurfaceBold]!);
    case 'Fill-Elevated':
      return oneUiHexColor(role.surfaces[kSurfaceElevated]!);
    case 'Fill-Blend':
      return oneUiHexColor(role.surfaces['blend']!);
    default:
      return null;
  }
}

/// Public wrapper for Button / IconButton / SSTB role-suffix fallbacks.
Color? colorFromRoleTokenSuffix(FlatRoleTokens role, String suffix) =>
    _colorFromRoleSuffix(role, suffix);

Color? resolveButtonTokenColor(
  BuildContext context,
  NativeDesignSystemPayload ds,
  String? rawCssValue, {
  required String appearance,
  int recursionDepth = 0,
}) {
  if (rawCssValue == null) return null;
  if (recursionDepth > 8) return null;

  final scope = OneUiScope.of(context);
  final resolved = ds.resolveCSSValue(
    rawCssValue,
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
  if (resolved == null) return null;

  var t = resolved.trim();
  final literal = parseCssColorString(t);
  if (literal != null) return literal;

  /// Engine fills like `--Primary-Bold` normally live **only** in injected brand CSS on web —
  /// not as keys in `designSystem.componentCustomProperties`. Convex often stores
  /// `--Button-roleBold: var(--Primary-Bold)`. `resolveCSSValue` then returns the dangling
  /// `var(--Primary-Bold)` string; peeling matches browser behaviour (token resolves via role palette).
  final peeledEarly = NativeDesignSystemPayload.peelLeadingVar(t);
  if (peeledEarly != null) {
    return resolveButtonTokenColor(
      context,
      ds,
      peeledEarly,
      appearance: appearance,
      recursionDepth: recursionDepth + 1,
    );
  }

  final parsed = parseSurfaceTokenVar(
      t, OneUiSurfaceScope.of(context).themeConfig.appearances.keys);
  if (parsed == null) return null;

  final (roleKey, suffix) = parsed;
  final tokens = OneUiSurfaceScope.tokensForAppearance(context, roleKey);

  return _colorFromRoleSuffix(tokens, suffix);
}

/// Matches web `APPEARANCE_ROLE_VALUE_PATTERN` in `buildComponentOverrideCSS.ts`.
final RegExp _appearanceRoleValuePattern = RegExp(
  r'^(Primary|Secondary|Neutral|Sparkle|Brand-Bg|Positive|Negative|Warning|Informative)-(.*)$',
);

/// Rewrites `var(--Primary-Bold)` → `var(--Negative-Bold)` for [appearance].
///
/// Convex flat maps store primary-scoped family paint (`Primary-Bold`, …). Web
/// rewrites those to appearance-relative `--_btn-*` intermediates before injection;
/// Flutter must remap the role prefix to the active button appearance.
String rewriteButtonAppearanceRelativePaint(String raw, String appearance) {
  var token = raw.trim();
  if (token.isEmpty) return raw;

  final peeled = NativeDesignSystemPayload.peelLeadingVar(token);
  if (peeled != null) {
    token = peeled.trim();
  }
  final unwrapped = token.startsWith('--') ? token.substring(2) : token;
  final match = _appearanceRoleValuePattern.firstMatch(unwrapped);
  if (match == null) return raw;

  final suffix = match.group(2);
  if (suffix == null || suffix.isEmpty) return raw;

  final label = oneUiAppearanceCssLabel(appearance);
  return 'var(--$label-$suffix)';
}

/// Button / IconButton paint lookup — applies [rewriteButtonAppearanceRelativePaint]
/// before token resolution (web `getButtonAppearanceRelativePaintValue` parity).
Color? resolveButtonPaintFromComponentKeys(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String appearance,
}) {
  final ordered = oneUiComponentColorKeyOrder(context, keys);
  final nested = oneUiInsideNestedSurface(context);
  for (final k in ordered) {
    final raw = ds.rawComponentCascade([k]);
    if (raw == null) continue;
    if (nested && oneUiIsRootPinnedLiteral(raw)) continue;
    final rewritten = rewriteButtonAppearanceRelativePaint(raw, appearance);
    final c = resolveButtonTokenColor(
      context,
      ds,
      rewritten,
      appearance: appearance,
    );
    if (c != null) return c;
  }
  return null;
}

/// Web-aligned colour resolution for each attention variant.
ButtonResolvedColors resolveButtonColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiButtonVariantKind variant,
  required String appearance,
}) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);
  final variantKey = switch (variant) {
    OneUiButtonVariantKind.bold => 'bold',
    OneUiButtonVariantKind.subtle => 'subtle',
    OneUiButtonVariantKind.ghost => 'ghost',
  };

  /// `--Button-role*` slots in Convex map are primary-scoped (web remaps via
  /// `.appearanceSecondary` etc.). Only consult them when [appearance] is primary.
  final useRoleSlots = appearance == 'primary';

  Color? fromComponent(List<String> keys) =>
      resolveButtonPaintFromComponentKeys(
        context,
        ds,
        keys: keys,
        appearance: appearance,
      );

  switch (variant) {
    case OneUiButtonVariantKind.bold:
      // Web `.bold { --_btn-bg: var(--Button-backgroundColor-bold, var(--_btn-bold)); }`
      // — never falls through to bare `--Button-backgroundColor` (base slot is for non-variant rules).
      final bgDefault = fromComponent([
            '--Button-backgroundColor-$variantKey',
            if (useRoleSlots) '--Button-roleBold',
          ]) ??
          oneUiHexColor(role.surfaces[kSurfaceBold]!);
      final bgPressed = fromComponent([
            '--Button-backgroundColor-bold-pressed',
            if (useRoleSlots) '--Button-roleBoldPressed',
          ]) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--${oneUiAppearanceCssLabel(appearance)}-Bold-Pressed',
            appearance: appearance,
          ) ??
          oneUiHexColor(
              role.states['boldPressed'] ?? role.surfaces[kSurfaceBold]!);
      return ButtonResolvedColors(
        background: bgDefault,
        foreground: fromComponent([
              '--Button-textColor-$variantKey',
              '--Button-textColor',
              if (useRoleSlots) '--Button-roleBoldHigh',
            ]) ??
            oneUiHexColor(role.onBoldContent['tintedA11y']!),
        backgroundPressed: bgPressed,
        backgroundHover: fromComponent([
              '--Button-backgroundColor-bold-hover',
              if (useRoleSlots) '--Button-roleBoldHover',
            ]) ??
            resolveButtonTokenColor(
              context,
              ds,
              '--${oneUiAppearanceCssLabel(appearance)}-Bold-Hover',
              appearance: appearance,
            ),
        borderColor: fromComponent([
          '--Button-borderColor-$variantKey',
          '--Button-borderColor',
        ]),
      );
    case OneUiButtonVariantKind.subtle:
      final bgDefault = fromComponent([
            '--Button-backgroundColor-$variantKey',
            if (useRoleSlots) '--Button-roleSubtle',
          ]) ??
          oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
      final bgPressed = fromComponent([
            '--Button-backgroundColor-subtle-pressed',
            if (useRoleSlots) '--Button-roleSubtlePressed',
          ]) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--${oneUiAppearanceCssLabel(appearance)}-Subtle-Pressed',
            appearance: appearance,
          ) ??
          oneUiHexColor(
              role.states['subtlePressed'] ?? role.surfaces[kSurfaceSubtle]!);
      return ButtonResolvedColors(
        background: bgDefault,
        foreground: fromComponent([
              '--Button-textColor-$variantKey',
              '--Button-textColor',
              if (useRoleSlots) '--Button-roleTintedA11y',
            ]) ??
            oneUiHexColor(role.content['tintedA11y']!),
        backgroundPressed: bgPressed,
        backgroundHover: fromComponent([
              '--Button-backgroundColor-subtle-hover',
              if (useRoleSlots) '--Button-roleSubtleHover',
            ]) ??
            resolveButtonTokenColor(
              context,
              ds,
              '--${oneUiAppearanceCssLabel(appearance)}-Subtle-Hover',
              appearance: appearance,
            ),
        borderColor: fromComponent([
          '--Button-borderColor-$variantKey',
          '--Button-borderColor',
        ]),
      );
    case OneUiButtonVariantKind.ghost:
      final tintedA11y = oneUiHexColor(role.content['tintedA11y']!);
      Color? accessiblePaint(Color? paint) {
        if (paint == null || paint.a == 0) return null;
        return paint;
      }

      final fgRestRaw = fromComponent(['--Button-textColor-ghost']) ??
          fromComponent([
            if (useRoleSlots) '--Button-roleTintedA11y',
          ]);
      final fgHoverRaw = fromComponent(['--Button-textColor-ghost-hover']) ??
          fromComponent([
            '--Button-textColor',
            if (useRoleSlots) '--Button-roleTintedA11y',
          ]);
      final fgRest = accessiblePaint(fgRestRaw) ?? tintedA11y;
      final fgHover = accessiblePaint(fgHoverRaw) ?? tintedA11y;
      final bgHovered = fromComponent([
            '--Button-backgroundColor-ghost-hover',
            if (useRoleSlots) '--Button-roleHover',
          ]) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--${oneUiAppearanceCssLabel(appearance)}-Subtle-Hover',
            appearance: appearance,
          ) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--${oneUiAppearanceCssLabel(appearance)}-Hover',
            appearance: appearance,
          ) ??
          oneUiHexColor(
              role.states['subtleHover'] ?? role.surfaces[kSurfaceSubtle]!);
      final bgPressed = fromComponent([
            '--Button-backgroundColor-ghost-pressed',
            if (useRoleSlots) '--Button-rolePressed',
          ]) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--${oneUiAppearanceCssLabel(appearance)}-Subtle-Pressed',
            appearance: appearance,
          ) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--${oneUiAppearanceCssLabel(appearance)}-Pressed',
            appearance: appearance,
          ) ??
          oneUiHexColor(
              role.states['subtlePressed'] ?? role.surfaces[kSurfaceSubtle]!);
      return ButtonResolvedColors(
        background: fromComponent(['--Button-backgroundColor-ghost']) ??
            const Color(0x00000000),

        /// Web `.ghost { color: var(--Button-textColor-ghost, var(--_btn-default-accent-a11y)) }`
        /// — no `--Button-textColor` on the default ghost rule.
        foreground: fgRest,
        foregroundHover: fgHover,
        backgroundPressed: bgPressed,
        backgroundHover: bgHovered,
        borderColor: fromComponent([
              '--Button-borderColor-ghost',
              '--Button-borderColor',
              if (useRoleSlots) '--Button-roleStrokeLow',
            ]) ??
            (role.content['strokeLow'] != null
                ? oneUiHexColor(role.content['strokeLow']!)
                : null),
      );
  }
}

/// Mirror of [OneUiButtonVariant] without widget import cycle.
enum OneUiButtonVariantKind { bold, subtle, ghost }

/// Paint for `contained={false}` — mirrors web `Button` → `LinkButton` with
/// `showUnderline={false}` (accent / high text, transparent underline, hover tint).
class UncontainedButtonResolvedColors {
  const UncontainedButtonResolvedColors({
    required this.foreground,
    required this.backgroundHover,
    required this.backgroundPressed,
  });

  final Color foreground;
  final Color backgroundHover;
  final Color backgroundPressed;
}

/// Web `LinkButton` variant colours when delegated from `Button contained={false}`.
UncontainedButtonResolvedColors resolveUncontainedButtonColors(
  BuildContext context, {
  required OneUiButtonVariantKind variant,
  required String appearance,
}) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);
  final fg = switch (variant) {
    OneUiButtonVariantKind.bold ||
    OneUiButtonVariantKind.subtle =>
      oneUiHexColor(role.content['tintedA11y']!),
    OneUiButtonVariantKind.ghost => oneUiHexColor(role.content['high']!),
  };
  return UncontainedButtonResolvedColors(
    foreground: fg,
    backgroundHover:
        oneUiHexColor(role.states['hover'] ?? role.surfaces[kSurfaceMinimal]!),
    backgroundPressed:
        oneUiHexColor(role.states['pressed'] ?? role.surfaces[kSurfaceSubtle]!),
  );
}
