import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import '../qa/qa_flutter_test_slugs.dart';
import 'qa_report_paths.dart';

/// Per-case attachment URLs for a failed golden test. Each value is a
/// site-rooted path under `qa-reports/components/<slug>-visual-assets/`.
class QaVisualAssets {
  const QaVisualAssets({
    this.master,
    this.test,
    this.maskedDiff,
    this.isolatedDiff,
  });

  factory QaVisualAssets.fromJson(Map<String, dynamic> json) => QaVisualAssets(
        master: json['master'] as String?,
        test: json['test'] as String?,
        maskedDiff: json['maskedDiff'] as String?,
        isolatedDiff: json['isolatedDiff'] as String?,
      );

  /// `*_masterImage.png` — the checked-in baseline.
  final String? master;

  /// `*_testImage.png` — the actual pixels produced by the failing run.
  final String? test;

  /// `*_maskedDiff.png` — diff with matching pixels masked out.
  final String? maskedDiff;

  /// `*_isolatedDiff.png` — diff isolated to only the differing pixels.
  final String? isolatedDiff;

  bool get isEmpty =>
      master == null && test == null && maskedDiff == null && isolatedDiff == null;
}

class QaReportCase {
  QaReportCase({
    required this.name,
    required this.status,
    required this.tier,
    this.durationMs,
    this.component,
    this.error,
    this.platform,
    this.visualAssets,
  });

  factory QaReportCase.fromJson(Map<String, dynamic> json) {
    final assetsJson = json['visualAssets'];
    final assets = assetsJson is Map<String, dynamic>
        ? QaVisualAssets.fromJson(assetsJson)
        : null;
    return QaReportCase(
      name: json['name'] as String? ?? '',
      status: json['status'] as String? ?? 'unknown',
      tier: json['tier'] as String? ?? '',
      durationMs: json['durationMs'] as int?,
      component: json['component'] as String?,
      error: json['error'] as String?,
      platform: json['platform'] as String?,
      visualAssets: (assets != null && !assets.isEmpty) ? assets : null,
    );
  }

  final String name;
  final String status;
  final String tier;
  final int? durationMs;
  final String? component;
  final String? error;

  /// Target platform the test was overridden to (`android` / `ios` / `linux`)
  /// when using `testWidgetsAllPlatforms`. The Flutter test binding still runs
  /// in a headless software canvas — the platform string just records which
  /// `debugDefaultTargetPlatformOverride` value was active for that run.
  final String? platform;

  /// Populated for failed [golden] tests when the visual report pipeline ran.
  /// `null` for passing tests and for non-visual tiers.
  final QaVisualAssets? visualAssets;

  bool get passed => status == 'passed';
}

class QaReportSuite {
  QaReportSuite({
    required this.passed,
    required this.failed,
    required this.skipped,
    required this.cases,
  });

  factory QaReportSuite.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []);
    }
    final rawCases = json['cases'];
    final cases = <QaReportCase>[];
    if (rawCases is List) {
      for (final row in rawCases) {
        if (row is Map<String, dynamic>) {
          cases.add(QaReportCase.fromJson(row));
        }
      }
    }
    return QaReportSuite(
      passed: json['passed'] as int? ?? 0,
      failed: json['failed'] as int? ?? 0,
      skipped: json['skipped'] as int? ?? 0,
      cases: cases,
    );
  }

  final int passed;
  final int failed;
  final int skipped;
  final List<QaReportCase> cases;
}

class QaReportSummary {
  QaReportSummary({
    required this.ok,
    required this.slug,
    required this.generatedAt,
    required this.functional,
    required this.accessibility,
    required this.smoke,
    required this.catalog,
    required this.e2e,
    required this.visual,
  });

  factory QaReportSummary.fromJson(Map<String, dynamic> json) {
    final suites = json['suites'];
    Map<String, dynamic>? suiteMap;
    if (suites is Map<String, dynamic>) suiteMap = suites;

    return QaReportSummary(
      ok: json['ok'] as bool? ?? false,
      slug: json['slug'] as String? ?? 'flutter-all',
      generatedAt: json['generatedAt'] as String? ?? '',
      functional: QaReportSuite.fromJson(
        suiteMap?['functional'] as Map<String, dynamic>?,
      ),
      accessibility: QaReportSuite.fromJson(
        suiteMap?['accessibility'] as Map<String, dynamic>?,
      ),
      smoke: QaReportSuite.fromJson(
        suiteMap?['smoke'] as Map<String, dynamic>?,
      ),
      catalog: QaReportSuite.fromJson(
        suiteMap?['catalog'] as Map<String, dynamic>?,
      ),
      e2e: QaReportSuite.fromJson(
        suiteMap?['e2e'] as Map<String, dynamic>?,
      ),
      visual: QaReportSuite.fromJson(
        suiteMap?['visual'] as Map<String, dynamic>?,
      ),
    );
  }

  final bool ok;
  final String slug;
  final String generatedAt;
  final QaReportSuite functional;
  final QaReportSuite accessibility;
  final QaReportSuite smoke;
  final QaReportSuite catalog;

  /// On-device integration test results. Empty when no integration_test/ run
  /// has happened — the UI hides the e2e card when [e2e.cases] is empty.
  final QaReportSuite e2e;

  /// Golden / visual regression results ([golden] tier). Empty when the
  /// component has no `_golden_test.dart` — the UI hides the Visual tab.
  final QaReportSuite visual;

  /// Catalog slugs are kebab-case (`checkbox-field`); report JSON uses test folder
  /// names (`checkbox_field`). Match either form.
  static String reportFolderForSlug(String slug) => slug.replaceAll('-', '_');

  static bool caseMatchesComponent(QaReportCase c, String slug) {
    final folder = reportFolderForSlug(slug);
    if (c.component != null) {
      return c.component == folder || c.component == slug;
    }
    final lower = c.name.toLowerCase();
    final slugNeedle = slug.replaceAll('-', '').toLowerCase();
    final folderNeedle = folder.replaceAll('_', '');
    return lower.contains(slug) ||
        lower.contains(folder) ||
        lower.contains(slugNeedle) ||
        lower.contains(folderNeedle);
  }

  List<QaReportCase> casesForComponent(String slug, {String? tier}) {
    final all = [
      ...functional.cases,
      ...accessibility.cases,
      ...smoke.cases,
      ...catalog.cases,
      ...e2e.cases,
      ...visual.cases,
    ];
    return all.where((c) {
      if (!caseMatchesComponent(c, slug)) return false;
      if (tier != null) {
        final tierMatches =
            c.tier == tier || c.name.contains('[$tier]') ||
                // Goldens emit `[golden]` in their group name; map to `visual`.
                (tier == 'visual' && c.name.toLowerCase().contains('[golden]'));
        if (!tierMatches) return false;
      }
      return true;
    }).toList();
  }

  /// Rebuilds suite totals from cases belonging to [slug] only.
  ///
  /// Used when falling back from `flutter-summary.json` so component detail
  /// pages never show full-suite pass/fail counts for another component.
  QaReportSummary scopedForComponent(String slug) {
    final fnCases = casesForComponent(slug, tier: 'fn');
    final smokeCases = casesForComponent(slug, tier: 'smoke');
    final a11yCases = casesForComponent(slug, tier: 'a11y');
    final e2eCases = casesForComponent(slug, tier: 'e2e');
    final visualCases = casesForComponent(slug, tier: 'visual');

    final functional = _suiteFromCases([...fnCases, ...smokeCases]);
    final accessibility = _suiteFromCases(a11yCases);
    final smoke = _suiteFromCases(smokeCases);
    final e2e = _suiteFromCases(e2eCases);
    final visual = _suiteFromCases(visualCases);
    final totalFailed =
        functional.failed + accessibility.failed + smoke.failed + e2e.failed + visual.failed;
    final hasCases = functional.cases.isNotEmpty ||
        accessibility.cases.isNotEmpty ||
        smoke.cases.isNotEmpty ||
        e2e.cases.isNotEmpty ||
        visual.cases.isNotEmpty;

    return QaReportSummary(
      ok: !hasCases || totalFailed == 0,
      slug: slug,
      generatedAt: generatedAt,
      functional: functional,
      accessibility: accessibility,
      smoke: smoke,
      catalog: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
      e2e: e2e,
      visual: visual,
    );
  }

  static QaReportSuite suiteFromCases(List<QaReportCase> cases) => _suiteFromCases(cases);

  static QaReportSuite _suiteFromCases(List<QaReportCase> cases) {
    return QaReportSuite(
      passed: cases.where((c) => c.passed).length,
      failed: cases.where((c) => !c.passed && c.status != 'skipped').length,
      skipped: cases.where((c) => c.status == 'skipped').length,
      cases: cases,
    );
  }

  /// Single source of truth for component detail UI — merges [fn] + [smoke] into
  /// `functional` so header totals match the Functional Tests tab.
  QaReportSummary normalizedForComponent(String slug) {
    final scopedToSlug = this.slug == slug;
    final fnCases =
        scopedToSlug ? functional.cases : casesForComponent(slug, tier: 'fn');
    final smokeCases =
        scopedToSlug ? smoke.cases : casesForComponent(slug, tier: 'smoke');
    final a11yCases =
        scopedToSlug ? accessibility.cases : casesForComponent(slug, tier: 'a11y');
    final e2eCases =
        scopedToSlug ? e2e.cases : casesForComponent(slug, tier: 'e2e');
    final visualCases =
        scopedToSlug ? visual.cases : casesForComponent(slug, tier: 'visual');

    final mergedFunctional = _suiteFromCases([...fnCases, ...smokeCases]);
    final accessibilitySuite = _suiteFromCases(a11yCases);
    final e2eSuite = _suiteFromCases(e2eCases);
    final visualSuite = _suiteFromCases(visualCases);
    final totalFailed = mergedFunctional.failed +
        accessibilitySuite.failed +
        e2eSuite.failed +
        visualSuite.failed;
    final hasCases = mergedFunctional.cases.isNotEmpty ||
        accessibilitySuite.cases.isNotEmpty ||
        e2eSuite.cases.isNotEmpty ||
        visualSuite.cases.isNotEmpty;

    return QaReportSummary(
      ok: !hasCases || totalFailed == 0,
      slug: slug,
      generatedAt: generatedAt,
      functional: mergedFunctional,
      accessibility: accessibilitySuite,
      smoke: _suiteFromCases(smokeCases),
      catalog: catalog,
      e2e: e2eSuite,
      visual: visualSuite,
    );
  }

  /// Loads only `components/{slug}-summary.json` — no full-suite fallback.
  /// Merges in `components/{slug}-e2e-summary.json` and
  /// `components/{slug}-visual-summary.json` when present so the dashboard's
  /// E2E and Visual Tests tabs reflect the latest dedicated runs.
  static Future<QaReportSummary?> loadComponentSummaryOnly(String componentSlug) async {
    final widget = await _tryLoadComponentJson(componentSlug, '-summary.json');
    final e2e = await _tryLoadComponentJson(componentSlug, '-e2e-summary.json');
    final visual = await _tryLoadComponentJson(componentSlug, '-visual-summary.json');

    if (widget == null && e2e == null && visual == null) return null;

    QaReportSummary base = widget ?? e2e ?? visual!;
    if (e2e != null && widget != null) base = base._copyWithE2e(e2e.e2e);
    if (visual != null) base = base._copyWithVisual(visual.visual);
    return base.normalizedForComponent(componentSlug);
  }

  static Future<QaReportSummary?> _tryLoadComponentJson(
    String componentSlug,
    String suffix,
  ) async {
    final paths = [
      'qa-reports/components/$componentSlug$suffix',
      'web/qa-reports/components/$componentSlug$suffix',
    ];
    for (final path in paths) {
      final raw = await _readReportFile(path);
      if (raw == null) continue;
      try {
        final json = jsonDecode(raw);
        if (json is Map<String, dynamic>) {
          return QaReportSummary.fromJson(json);
        }
      } catch (_) {
        // Try next candidate path.
      }
    }
    return null;
  }

  QaReportSummary _copyWithE2e(QaReportSuite newE2e) => QaReportSummary(
        ok: ok && newE2e.failed == 0,
        slug: slug,
        generatedAt: generatedAt,
        functional: functional,
        accessibility: accessibility,
        smoke: smoke,
        catalog: catalog,
        e2e: newE2e,
        visual: visual,
      );

  QaReportSummary _copyWithVisual(QaReportSuite newVisual) => QaReportSummary(
        ok: ok && newVisual.failed == 0,
        slug: slug,
        generatedAt: generatedAt,
        functional: functional,
        accessibility: accessibility,
        smoke: smoke,
        catalog: catalog,
        e2e: e2e,
        visual: newVisual,
      );

  /// Loads the newest synced report for [componentSlug], else a scoped slice of
  /// the full-suite summary when that component has flutter_test coverage.
  ///
  /// Components without test suites (e.g. Bottom Navigation) return `null` so
  /// detail pages do not show another component's pass/fail totals.
  ///
  /// On web, reads from `web/qa-reports/` via HTTP so `sync_reports_to_web.sh`
  /// updates are visible without restarting the dev server.
  static Future<QaReportSummary?> loadFromAssets({String? componentSlug}) async {
    if (componentSlug != null) {
      final componentOnly = await loadComponentSummaryOnly(componentSlug);
      if (componentOnly != null) return componentOnly;

      if (!isQaFlutterTestSlug(componentSlug)) return null;

      final full = await _loadFullSuiteSummary();
      if (full == null) return null;

      final scoped = full.scopedForComponent(componentSlug).normalizedForComponent(componentSlug);
      final hasCases =
          scoped.functional.cases.isNotEmpty || scoped.accessibility.cases.isNotEmpty;
      return hasCases ? scoped : null;
    }

    return _loadFullSuiteSummary();
  }

  static Future<QaReportSummary?> _loadFullSuiteSummary() async {
    final widget = await _tryLoadFullJson('flutter-summary.json');
    final e2e = await _tryLoadFullJson('flutter-e2e-summary.json');
    final visual = await _tryLoadFullJson('flutter-visual-summary.json');

    QaReportSummary? base = widget ?? e2e ?? visual;
    if (base == null) return null;
    if (widget != null && e2e != null) base = base._copyWithE2e(e2e.e2e);
    if (visual != null && base != visual) {
      base = base._copyWithVisual(visual.visual);
    }
    return base;
  }

  static Future<QaReportSummary?> _tryLoadFullJson(String filename) async {
    final paths = [
      'qa-reports/$filename',
      'web/qa-reports/$filename',
    ];
    for (final path in paths) {
      final raw = await _readReportFile(path);
      if (raw == null) continue;
      try {
        final json = jsonDecode(raw);
        if (json is Map<String, dynamic>) {
          return QaReportSummary.fromJson(json);
        }
      } catch (_) {
        // Try next candidate path.
      }
    }
    return null;
  }

  static Future<String?> _readReportFile(String path) async {
    if (kIsWeb) {
      try {
        final uri = qaReportWebUri(path);
        final relative = uri.path.startsWith('/') ? uri.path.substring(1) : uri.path;
        final key = uri.query.isEmpty ? relative : '$relative?${uri.query}';
        return await NetworkAssetBundle(
          Uri.parse('${Uri.base.origin}/'),
        ).loadString(key);
      } catch (_) {
        // Fall through to bundled asset (e.g. offline).
      }
    }
    try {
      final assetPath = path.startsWith('web/') ? path : 'web/$path';
      return await rootBundle.loadString(assetPath);
    } catch (_) {
      return null;
    }
  }
}
