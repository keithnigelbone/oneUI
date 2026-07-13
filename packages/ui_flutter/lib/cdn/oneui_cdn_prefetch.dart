/// Pure-Dart brand-data prefetch — same URLs and config as `@oneui/native-cdn`.
library;

import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import 'oneui_cdn_urls.dart';

/// Per-brand entry in `oneui.brands.json`.
typedef OneUiBrandConfigEntry = Object?;

class OneUiCdnPrefetchOptions {
  const OneUiCdnPrefetchOptions({
    this.cdnUrl,
    this.brands,
    this.configFile = 'oneui.brands.json',
    this.projectRoot,
    this.cacheDir,
    this.offline = false,
    this.httpClient,
  });

  final String? cdnUrl;
  final Map<String, OneUiBrandConfigEntry>? brands;
  final String configFile;
  final String? projectRoot;
  final String? cacheDir;
  final bool offline;
  final http.Client? httpClient;
}

class OneUiPrefetchVariantResult {
  const OneUiPrefetchVariantResult({
    required this.brand,
    required this.variant,
    required this.ok,
    required this.bytes,
    required this.cacheFile,
  });

  final String brand;
  final String variant;
  final bool ok;
  final int bytes;
  final String cacheFile;
}

class OneUiPrefetchResult {
  const OneUiPrefetchResult({
    required this.variants,
    required this.cacheDir,
    required this.manifestFile,
  });

  final List<OneUiPrefetchVariantResult> variants;
  final String cacheDir;
  final String manifestFile;
}

class _ResolvedBrandEntry {
  _ResolvedBrandEntry({required this.version, required this.subBrands});

  final String version;
  final List<String> subBrands;
}

class _ResolvedOptions {
  _ResolvedOptions({
    required this.cdnUrl,
    required this.brands,
    required this.cacheDir,
    required this.offline,
  });

  final String cdnUrl;
  final Map<String, _ResolvedBrandEntry> brands;
  final String cacheDir;
  final bool offline;
}

_ResolvedBrandEntry _normalizeEntry(OneUiBrandConfigEntry raw) {
  if (raw is String) {
    return _ResolvedBrandEntry(
        version: raw.isEmpty ? 'latest' : raw, subBrands: []);
  }
  if (raw is Map) {
    final m = Map<String, dynamic>.from(raw);
    final subs = m['subBrands'];
    return _ResolvedBrandEntry(
      version: (m['version'] as String?) ?? 'latest',
      subBrands: subs is List
          ? subs.map((e) => '$e').toList(growable: false)
          : const [],
    );
  }
  return _ResolvedBrandEntry(version: 'latest', subBrands: const []);
}

Map<String, dynamic>? _readJsonFile(String path) {
  final file = File(path);
  if (!file.existsSync()) return null;
  try {
    return jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
  } on Object {
    return null;
  }
}

_ResolvedOptions _resolveOptions(OneUiCdnPrefetchOptions opts) {
  final projectRoot = opts.projectRoot ?? Directory.current.path;
  final configPath = '$projectRoot${Platform.pathSeparator}${opts.configFile}';
  final fileCfg = _readJsonFile(configPath);

  final cdnUrl = opts.cdnUrl ??
      Platform.environment['ONEUI_CDN_URL'] ??
      (fileCfg?['cdnUrl'] as String?) ??
      '';
  if (cdnUrl.isEmpty) {
    throw StateError(
      '[oneui_flutter_cdn] cdnUrl not set. Pass cdnUrl, set ONEUI_CDN_URL, or add it to $configPath.',
    );
  }

  final rawBrands =
      opts.brands ?? (fileCfg?['brands'] as Map<String, dynamic>?) ?? {};
  if (rawBrands.isEmpty) {
    throw StateError(
      '[oneui_flutter_cdn] no brands configured. Pass brands or list them in $configPath.',
    );
  }

  final brands = <String, _ResolvedBrandEntry>{};
  for (final entry in rawBrands.entries) {
    brands[entry.key] = _normalizeEntry(entry.value);
  }

  final cacheDir =
      opts.cacheDir ?? '$projectRoot${Platform.pathSeparator}.oneui_cached';

  return _ResolvedOptions(
    cdnUrl: cdnUrl,
    brands: brands,
    cacheDir: cacheDir,
    offline: opts.offline,
  );
}

String _brandDataRoot(String cacheDir) =>
    '$cacheDir${Platform.pathSeparator}brand-data';

String _brandJsonPath(String cacheDir, String brand) =>
    '${_brandDataRoot(cacheDir)}${Platform.pathSeparator}$brand${Platform.pathSeparator}latest.json';

String _subBrandJsonPath(String cacheDir, String brand, String sub) =>
    '${_brandDataRoot(cacheDir)}${Platform.pathSeparator}$brand${Platform.pathSeparator}sub-brands${Platform.pathSeparator}$sub${Platform.pathSeparator}latest.json';

void _ensureDir(String dir) {
  Directory(dir).createSync(recursive: true);
}

bool _hasKey(String text, String key) {
  try {
    final parsed = jsonDecode(text);
    return parsed is Map && parsed.containsKey(key);
  } on Object {
    return false;
  }
}

Future<String?> _fetchJsonText({
  required http.Client client,
  required String url,
  required String cacheFile,
  required String expectKey,
  required bool offline,
  required void Function(String message) warn,
}) async {
  if (offline) {
    final file = File(cacheFile);
    if (file.existsSync()) return file.readAsStringSync();
    warn('[oneui_flutter_cdn] offline: no cache for $url');
    return null;
  }

  try {
    final res = await client.get(Uri.parse(url));
    if (res.statusCode == 404) {
      final file = File(cacheFile);
      if (file.existsSync()) file.deleteSync();
      warn('[oneui_flutter_cdn] $url → 404 (absent on CDN); skipped');
      return null;
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      final file = File(cacheFile);
      warn(
        '[oneui_flutter_cdn] $url → HTTP ${res.statusCode}; '
        '${file.existsSync() ? 'using cache' : 'skipped'}',
      );
    } else {
      final text = utf8.decode(res.bodyBytes);
      if (_hasKey(text, expectKey)) return text;
      final file = File(cacheFile);
      warn(
        '[oneui_flutter_cdn] $url missing "$expectKey"; '
        '${file.existsSync() ? 'using cache' : 'skipped'}',
      );
    }
  } on Object catch (e) {
    final file = File(cacheFile);
    warn(
      '[oneui_flutter_cdn] $url fetch failed: $e; '
      '${file.existsSync() ? 'using cache' : 'skipped'}',
    );
  }

  final file = File(cacheFile);
  return file.existsSync() ? file.readAsStringSync() : null;
}

void _writeFlutterManifest(String cacheDir, List<Map<String, String>> entries) {
  final manifest = {
    'schemaVersion': 1,
    'generator': 'oneui_flutter_cdn prefetch',
    'entries': entries,
  };
  final path = '$cacheDir${Platform.pathSeparator}manifest.json';
  File(path).writeAsStringSync(
      '${const JsonEncoder.withIndent('  ').convert(manifest)}\n');
}

/// Downloads brand JSON from the CDN into [cacheDir]/`brand-data/` (default `.oneui_cached`).
///
/// On-disk layout matches `@oneui/native-cdn` (`latest.json` filenames). Never throws on
/// fetch failure; 404 deletes stale cache.
Future<OneUiPrefetchResult> prefetchOneUiBrandData([
  OneUiCdnPrefetchOptions options = const OneUiCdnPrefetchOptions(),
]) async {
  final r = _resolveOptions(options);
  final client = options.httpClient ?? http.Client();
  final ownsClient = options.httpClient == null;

  final variants = <OneUiPrefetchVariantResult>[];
  final manifestEntries = <Map<String, String>>[];

  void info(String msg) => stdout.writeln(msg);
  void warn(String msg) => stderr.writeln(msg);

  info(
      '[oneui_flutter_cdn] prefetching brand-data → ${r.cacheDir}${r.offline ? ' (offline)' : ''}');
  _ensureDir(_brandDataRoot(r.cacheDir));

  try {
    for (final brandEntry in r.brands.entries) {
      final brand = brandEntry.key;
      final entry = brandEntry.value;

      final parentFile = _brandJsonPath(r.cacheDir, brand);
      final parentUrl =
          resolveOneUiBrandUrl(r.cdnUrl, brand, null, version: entry.version);
      final parentText = await _fetchJsonText(
        client: client,
        url: parentUrl,
        cacheFile: parentFile,
        expectKey: 'foundation',
        offline: r.offline,
        warn: warn,
      );

      if (parentText != null) {
        _ensureDir(Directory(parentFile).parent.path);
        File(parentFile).writeAsStringSync(parentText);
        info('  ✓ $brand/latest.json');
        variants.add(OneUiPrefetchVariantResult(
          brand: brand,
          variant: 'base',
          ok: true,
          bytes: parentText.length,
          cacheFile: parentFile,
        ));
        manifestEntries.add({
          'brand': brand,
          'variant': 'base',
          'kind': 'brand',
          'relativePath': 'brand-data/$brand/latest.json',
        });
      } else {
        info('  ✗ $brand/latest.json');
        variants.add(OneUiPrefetchVariantResult(
          brand: brand,
          variant: 'base',
          ok: false,
          bytes: 0,
          cacheFile: parentFile,
        ));
      }

      for (final sub in entry.subBrands) {
        final subFile = _subBrandJsonPath(r.cacheDir, brand, sub);
        final subUrl =
            resolveOneUiBrandUrl(r.cdnUrl, brand, sub, version: entry.version);
        final subText = await _fetchJsonText(
          client: client,
          url: subUrl,
          cacheFile: subFile,
          expectKey: 'themeData',
          offline: r.offline,
          warn: warn,
        );

        if (subText != null) {
          _ensureDir(Directory(subFile).parent.path);
          File(subFile).writeAsStringSync(subText);
          info('    ✓ $brand/sub-brands/$sub/latest.json');
          variants.add(OneUiPrefetchVariantResult(
            brand: brand,
            variant: sub,
            ok: true,
            bytes: subText.length,
            cacheFile: subFile,
          ));
          manifestEntries.add({
            'brand': brand,
            'variant': sub,
            'kind': 'theme',
            'relativePath': 'brand-data/$brand/sub-brands/$sub/latest.json',
          });
        } else {
          info('    ✗ $brand/sub-brands/$sub/latest.json');
          variants.add(OneUiPrefetchVariantResult(
            brand: brand,
            variant: sub,
            ok: false,
            bytes: 0,
            cacheFile: subFile,
          ));
        }
      }
    }

    final manifestFile = '${r.cacheDir}${Platform.pathSeparator}manifest.json';
    _writeFlutterManifest(r.cacheDir, manifestEntries);

    final okCount = variants.where((v) => v.ok).length;
    info(
        '[oneui_flutter_cdn] $okCount/${variants.length} variant(s) ready → $manifestFile');

    return OneUiPrefetchResult(
      variants: variants,
      cacheDir: r.cacheDir,
      manifestFile: manifestFile,
    );
  } finally {
    if (ownsClient) {
      client.close();
    }
  }
}
