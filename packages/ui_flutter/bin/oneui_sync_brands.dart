#!/usr/bin/env dart
/// CLI: prefetch (Dart) + bake brand snapshots into `ui_flutter` assets.
///
/// Bake step uses the monorepo TS engine (`buildNativeTheme`) — same output as Convex.
/// In a published-only `ui_flutter` consumer repo, run bake from CI that has the
/// OneUI monorepo script, or consume pre-baked snapshots from CDN (future).
library;

import 'dart:io';

import 'package:ui_flutter/cdn/oneui_cdn_prefetch.dart';

Future<void> main(List<String> args) async {
  String? configFile;
  String? cacheDir;
  var offline = false;
  var skipPrefetch = false;

  for (var i = 0; i < args.length; i++) {
    final arg = args[i];
    switch (arg) {
      case '--config':
        configFile = args[++i];
      case '--cache-dir':
        cacheDir = args[++i];
      case '--offline':
        offline = true;
      case '--skip-prefetch':
        skipPrefetch = true;
      case '--help':
      case '-h':
        _printHelp();
        exit(0);
    }
  }

  final resolvedCache = cacheDir ?? '${Directory.current.path}${Platform.pathSeparator}.oneui_cached';

  if (!skipPrefetch) {
    await prefetchOneUiBrandData(
      OneUiCdnPrefetchOptions(
        configFile: configFile ?? 'oneui.brands.json',
        cacheDir: resolvedCache,
        offline: offline,
        projectRoot: Directory.current.path,
      ),
    );
  }

  final packageRoot = _findUiFlutterPackageRoot();
  final monorepoRoot = _findMonorepoRoot(packageRoot);
  final bakeScript = '$monorepoRoot${Platform.pathSeparator}scripts${Platform.pathSeparator}generate-flutter-brand-snapshot.ts';

  if (!File(bakeScript).existsSync()) {
    stderr.writeln(
      '[oneui_sync_brands] Bake script not found at $bakeScript.\n'
      'Run from the OneUI monorepo, or prefetch only:\n'
      '  dart run ui_flutter:oneui_prefetch',
    );
    exit(1);
  }

  stdout.writeln('\n[oneui_sync_brands] baking NativeThemeSnapshot assets…\n');

  final tsx = await _resolveTsx(monorepoRoot);
  final result = await Process.run(
    tsx.executable,
    [
      ...tsx.args,
      'scripts/generate-flutter-brand-snapshot.ts',
      '--cdn-cache',
      resolvedCache,
    ],
    workingDirectory: monorepoRoot,
    runInShell: true,
  );

  stdout.write(result.stdout);
  stderr.write(result.stderr);

  if (result.exitCode != 0) {
    exit(result.exitCode);
  }

  stdout.writeln('\n[oneui_sync_brands] Done. Assets in packages/ui_flutter/assets/brand_data/cdn/');
  stdout.writeln('In main(): await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true);');
}

String _findUiFlutterPackageRoot() {
  // When run via `dart run ui_flutter:oneui_sync_brands`, package root is parent of bin/.
  final script = Platform.script.toFilePath();
  final binDir = File(script).parent;
  if (binDir.path.endsWith('${Platform.pathSeparator}bin')) {
    return binDir.parent.path;
  }
  // Fallback: cwd packages/ui_flutter
  final guess = '${Directory.current.path}${Platform.pathSeparator}packages${Platform.pathSeparator}ui_flutter';
  if (Directory(guess).existsSync()) return guess;
  return Directory.current.path;
}

String _findMonorepoRoot(String packageRoot) {
  var dir = Directory(packageRoot);
  for (var i = 0; i < 6; i++) {
    final script = File('${dir.path}${Platform.pathSeparator}scripts${Platform.pathSeparator}generate-flutter-brand-snapshot.ts');
    if (script.existsSync()) return dir.path;
    if (dir.parent.path == dir.path) break;
    dir = dir.parent;
  }
  return packageRoot;
}

Future<({String executable, List<String> args})> _resolveTsx(String monorepoRoot) async {
  final pnpm = await Process.run(
    'pnpm',
    ['exec', 'tsx', '--version'],
    workingDirectory: monorepoRoot,
    runInShell: true,
  );
  if (pnpm.exitCode == 0) {
    return (executable: 'pnpm', args: ['exec', 'tsx']);
  }
  return (executable: 'pnpm', args: ['exec', 'tsx']);
}

void _printHelp() {
  stdout.writeln('''
oneui_sync_brands — prefetch (Dart) + bake Flutter snapshot assets

Usage:
  dart run ui_flutter:oneui_sync_brands [options]

Options:
  --config <file>     oneui.brands.json path
  --cache-dir <dir>   Cache directory (default: .oneui_cached)
  --offline           Prefetch from cache only
  --skip-prefetch     Only run bake on existing cache
  -h, --help

Requires OneUI monorepo for bake (TS buildNativeTheme). Prefetch alone needs only Dart.
''');
}
