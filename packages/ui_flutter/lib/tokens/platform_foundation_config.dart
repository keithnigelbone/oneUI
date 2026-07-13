/// JSON shape for `PlatformsFoundationConfig` (Convex `platforms.config`).
/// Parsed from `getBrandOverviewData.platforms.config`.

final class PlatformsFoundationConfig {
  const PlatformsFoundationConfig({
    required this.platforms,
    this.defaultPlatform = 'web',
    this.defaultDensity = 'default',
  });

  final List<PlatformEntry> platforms;
  final String defaultPlatform;
  final String defaultDensity;

  static PlatformsFoundationConfig? tryParse(Object? raw) {
    if (raw == null) return null;
    final map = raw is Map<String, dynamic>
        ? raw
        : (raw is Map ? Map<String, dynamic>.from(raw) : null);
    if (map == null) return null;
    final pl = map['platforms'];
    if (pl is! List<dynamic>) return null;
    final entries = <PlatformEntry>[];
    for (final e in pl) {
      final em = e is Map<String, dynamic>
          ? e
          : (e is Map ? Map<String, dynamic>.from(e) : null);
      if (em == null) continue;
      final p = PlatformEntry.tryParse(em);
      if (p != null) entries.add(p);
    }
    if (entries.isEmpty) return null;
    return PlatformsFoundationConfig(
      platforms: entries,
      defaultPlatform: map['defaultPlatform'] as String? ?? 'web',
      defaultDensity: map['defaultDensity'] as String? ?? 'default',
    );
  }
}

final class PlatformEntry {
  const PlatformEntry({
    required this.id,
    required this.label,
    required this.isEnabled,
    required this.breakpoints,
    required this.densityConfigs,
  });

  final String id;
  final String label;
  final bool isEnabled;
  final List<PlatformBreakpoint> breakpoints;
  final List<PlatformDensityConfig> densityConfigs;

  static PlatformEntry? tryParse(Map<String, dynamic> m) {
    final id = m['id'] as String?;
    final label = m['label'] as String? ?? id ?? '';
    if (id == null) return null;
    final isEnabled = m['isEnabled'] as bool? ?? true;

    final bpRaw = m['breakpoints'];
    final breakpoints = <PlatformBreakpoint>[];
    if (bpRaw is List<dynamic>) {
      for (final b in bpRaw) {
        final bm = b is Map<String, dynamic>
            ? b
            : (b is Map ? Map<String, dynamic>.from(b) : null);
        if (bm == null) continue;
        final bp = PlatformBreakpoint.tryParse(bm);
        if (bp != null) breakpoints.add(bp);
      }
    }

    var densityConfigs = <PlatformDensityConfig>[];
    final dcRaw = m['densityConfigs'];
    if (dcRaw is List<dynamic>) {
      for (final d in dcRaw) {
        final dm = d is Map<String, dynamic>
            ? d
            : (d is Map ? Map<String, dynamic>.from(d) : null);
        if (dm == null) continue;
        final dc = PlatformDensityConfig.tryParse(dm);
        if (dc != null) densityConfigs.add(dc);
      }
    }
    if (densityConfigs.isEmpty) {
      densityConfigs =
          List<PlatformDensityConfig>.from(_fallbackWebDensityConfigs);
    }

    return PlatformEntry(
      id: id,
      label: label,
      isEnabled: isEnabled,
      breakpoints: breakpoints,
      densityConfigs: densityConfigs,
    );
  }
}

final class PlatformBreakpoint {
  const PlatformBreakpoint({
    required this.id,
    required this.label,
    required this.viewportWidth,
    required this.isActive,
  });

  final String id;
  final String label;
  final int viewportWidth;
  final bool isActive;

  static PlatformBreakpoint? tryParse(Map<String, dynamic> m) {
    final id = m['id'] as String?;
    final vw = m['viewportWidth'];
    final width = vw is int ? vw : (vw is num ? vw.toInt() : null);
    if (id == null || width == null) return null;
    return PlatformBreakpoint(
      id: id,
      label: m['label'] as String? ?? id,
      viewportWidth: width,
      isActive: m['isActive'] as bool? ?? true,
    );
  }
}

final class PlatformDensityConfig {
  const PlatformDensityConfig({
    required this.density,
    required this.mobile,
    required this.desktop,
  });

  final String density;
  final DensityEndpoint mobile;
  final DensityEndpoint desktop;

  static PlatformDensityConfig? tryParse(Map<String, dynamic> m) {
    final d = m['density'] as String?;
    if (d == null) return null;
    final mob = m['mobile'];
    final desk = m['desktop'];
    final mobMap = mob is Map<String, dynamic>
        ? mob
        : (mob is Map ? Map<String, dynamic>.from(mob) : null);
    final deskMap = desk is Map<String, dynamic>
        ? desk
        : (desk is Map ? Map<String, dynamic>.from(desk) : null);
    if (mobMap == null || deskMap == null) return null;
    final mobile = DensityEndpoint.tryParse(mobMap);
    final desktop = DensityEndpoint.tryParse(deskMap);
    if (mobile == null || desktop == null) return null;
    return PlatformDensityConfig(
      density: d,
      mobile: mobile,
      desktop: desktop,
    );
  }
}

final class DensityEndpoint {
  const DensityEndpoint({required this.baseSize, required this.scaleFactor});

  final double baseSize;
  final double scaleFactor;

  static DensityEndpoint? tryParse(Map<String, dynamic> m) {
    final bs = m['baseSize'];
    final sf = m['scaleFactor'];
    if (bs is! num || sf is! num) return null;
    return DensityEndpoint(baseSize: bs.toDouble(), scaleFactor: sf.toDouble());
  }
}

/// Mirrors `DEFAULT_PLATFORMS_CONFIG` density rows in web `manager.tsx`.
const List<PlatformDensityConfig> _fallbackWebDensityConfigs = [
  PlatformDensityConfig(
    density: 'compact',
    mobile: DensityEndpoint(baseSize: 14, scaleFactor: 1.1),
    desktop: DensityEndpoint(baseSize: 18, scaleFactor: 1.3),
  ),
  PlatformDensityConfig(
    density: 'default',
    mobile: DensityEndpoint(baseSize: 16, scaleFactor: 1.125),
    desktop: DensityEndpoint(baseSize: 20, scaleFactor: 1.185),
  ),
  PlatformDensityConfig(
    density: 'open',
    mobile: DensityEndpoint(baseSize: 17, scaleFactor: 1.15),
    desktop: DensityEndpoint(baseSize: 22, scaleFactor: 1.195),
  ),
];
