#!/usr/bin/env dart
/// CLI: prefetch brand JSON from CDN (pure Dart — no npm).
///
/// ```bash
/// dart run ui_flutter:oneui_prefetch
/// dart run ui_flutter:oneui_prefetch --config oneui.brands.json --cache-dir .oneui_cached
/// dart run ui_flutter:oneui_prefetch --offline
/// ```
library;

import 'dart:io';

import 'package:ui_flutter/cdn/oneui_cdn_prefetch.dart';

Future<void> main(List<String> args) async {
  String? configFile;
  String? cacheDir;
  String? cdnUrl;
  String? projectRoot;
  var offline = false;

  for (var i = 0; i < args.length; i++) {
    final arg = args[i];
    switch (arg) {
      case '--config':
        configFile = args[++i];
      case '--cache-dir':
        cacheDir = args[++i];
      case '--cdn-url':
        cdnUrl = args[++i];
      case '--project-root':
        projectRoot = args[++i];
      case '--offline':
        offline = true;
      case '--help':
      case '-h':
        _printHelp();
        exit(0);
    }
  }

  try {
    await prefetchOneUiBrandData(
      OneUiCdnPrefetchOptions(
        configFile: configFile ?? 'oneui.brands.json',
        cacheDir: cacheDir,
        cdnUrl: cdnUrl,
        projectRoot: projectRoot,
        offline: offline,
      ),
    );
  } on StateError catch (e) {
    stderr.writeln(e.message);
    exit(1);
  }
}

void _printHelp() {
  stdout.writeln('''
oneui_prefetch — download One UI brand JSON from CDN (Dart)

Usage:
  dart run ui_flutter:oneui_prefetch [options]

Options:
  --config <file>       Brand config (default: oneui.brands.json)
  --cache-dir <dir>     Output cache (default: .oneui_cached)
  --cdn-url <url>       Override CDN base URL
  --project-root <dir>  Project root (default: cwd)
  --offline             Use existing cache only
  -h, --help            Show this help

Next step (bake snapshots into Flutter assets):
  dart run ui_flutter:oneui_sync_brands
''');
}
