import 'package:ui_flutter/convex/breakpoint_labels.dart';
import 'package:ui_flutter/tokens/dimension_scale.dart';
import 'package:ui_flutter/utils/viewport_to_platform.dart';

import 'qa_local_storage_stub.dart'
    if (dart.library.html) 'qa_local_storage_web.dart';

enum QaThemeChoice {
  light('Light'),
  dark('Dark');

  const QaThemeChoice(this.label);
  final String label;
}

// `-v3` retires the value saved by the first iteration of the Jio-default
// auto-pick, which fell back to `brands.first` (Tira on most dev convexes)
// when no row had `slug == 'jio-default'`. That stale Tira id stuck around
// under `-v2`. Bumping again lets the strict matcher in `main.dart`
// (`_findJioBrand`) start from a clean slate; subsequent user picks persist
// under this key normally.
const _lsBrandId = 'oneui-qa-flutter-brand-id-v3';
const _lsTheme = 'oneui-qa-flutter-theme';
const _lsBreakpoint = 'oneui-qa-flutter-breakpoint';
const _lsDensity = 'oneui-qa-flutter-density';
const _lsAccentAppearance = 'oneui-qa-flutter-accent-appearance';

/// Toolbar state — parity with Flutter Storybook `main.dart` globals.
class QaPlaygroundToolbarState {
  QaPlaygroundToolbarState({
    String? brandId,
    QaThemeChoice? theme,
    String? breakpoint,
    String? density,
    String? accentAppearance,
    String? v2PlatformForScope,
  })  : brandId = brandId ?? _loadBrandId(),
        theme = theme ?? _loadTheme(),
        breakpoint = breakpoint ?? _loadBreakpoint(),
        density = density ?? _loadDensity(),
        accentAppearance = accentAppearance ?? _loadAccentAppearance(),
        v2PlatformForScope = v2PlatformForScope ?? _initialV2Platform(_loadBreakpoint());

  /// Empty string = **No brand** (unbranded manifest).
  String brandId;
  QaThemeChoice theme;
  String breakpoint;
  String density;
  String accentAppearance;
  String v2PlatformForScope;

  /// Convex `nativeTheme` platform arg when breakpoint is responsive.
  String? nativeConvexPlatformArg;

  bool get isDark => theme == QaThemeChoice.dark;
  String get convexTheme => isDark ? 'dark' : 'light';

  void persist() {
    qaSaveString(_lsBrandId, brandId);
    qaSaveString(_lsTheme, theme.name);
    qaSaveString(_lsBreakpoint, breakpoint);
    qaSaveString(_lsDensity, density);
    qaSaveString(_lsAccentAppearance, accentAppearance);
  }

  void setBrand(String? id) {
    brandId = id ?? '';
    if (brandId.isEmpty || breakpoint == 'responsive') {
      nativeConvexPlatformArg = null;
    }
    if (breakpoint != 'responsive') {
      v2PlatformForScope = v2PlatformFromBreakpointWidth(
        int.tryParse(breakpoint) ?? 360,
      );
    }
    persist();
  }

  void setBreakpoint(String value) {
    breakpoint = value;
    if (value == 'responsive') {
      nativeConvexPlatformArg = null;
    } else {
      v2PlatformForScope = v2PlatformFromBreakpointWidth(int.tryParse(value) ?? 360);
    }
    persist();
  }

  void setDensity(String value) {
    density = densityIds.contains(value) ? value : 'default';
    persist();
  }

  void setTheme(QaThemeChoice value) {
    theme = value;
    persist();
  }

  void setAccentAppearance(String value) {
    accentAppearance = value;
    persist();
  }

  /// Clamp stored accent to roles available on the active brand snapshot.
  String resolveAccentAppearance(List<String> configuredRoles) {
    if (configuredRoles.isEmpty) return accentAppearance;
    if (configuredRoles.contains(accentAppearance)) return accentAppearance;
    if (configuredRoles.contains('primary')) return 'primary';
    if (configuredRoles.contains('neutral')) return 'neutral';
    return configuredRoles.first;
  }

  void toggleTheme() {
    setTheme(isDark ? QaThemeChoice.light : QaThemeChoice.dark);
  }

  String nativeSnapshotPlatformFromToolbar() {
    if (breakpoint == 'responsive') {
      return nativeConvexPlatformArg ?? 'desktop';
    }
    final w = int.tryParse(breakpoint) ?? 360;
    return nativeThemePlatformArgFromV2Id(v2PlatformFromBreakpointWidth(w));
  }

  String effectiveV2Platform(double contentWidth) {
    if (breakpoint == 'responsive') {
      return viewportToV2PlatformId(contentWidth);
    }
    return v2PlatformFromBreakpointWidth(int.tryParse(breakpoint) ?? 360);
  }

  void syncV2PlatformForScope(String v2) {
    if (v2PlatformForScope != v2) v2PlatformForScope = v2;
  }

  void applyNativeConvexPlatformArg(String plat) {
    if (breakpoint != 'responsive') return;
    nativeConvexPlatformArg = plat;
  }

  static String _loadBrandId() => qaLoadString(_lsBrandId) ?? '';

  static QaThemeChoice _loadTheme() {
    final raw = qaLoadString(_lsTheme);
    return raw == 'dark' ? QaThemeChoice.dark : QaThemeChoice.light;
  }

  static String _loadBreakpoint() {
    final raw = qaLoadString(_lsBreakpoint);
    if (raw != null && kOneUiBreakpointValues.contains(raw)) return raw;
    return 'responsive';
  }

  static String _loadDensity() {
    final raw = qaLoadString(_lsDensity);
    if (raw != null && densityIds.contains(raw)) return raw;
    return 'default';
  }

  static String _loadAccentAppearance() {
    return qaLoadString(_lsAccentAppearance) ?? 'primary';
  }

  static String _initialV2Platform(String breakpoint) {
    if (breakpoint == 'responsive') return 'L';
    return v2PlatformFromBreakpointWidth(int.tryParse(breakpoint) ?? 360);
  }
}
