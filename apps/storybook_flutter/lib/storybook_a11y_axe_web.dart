// ignore_for_file: avoid_web_libraries_in_flutter

/// Flutter **web**: load **axe-core** from CDN and mirror `vitest` / Storybook **`a11y`**
/// config (`wcag21aa` tags + suppressed `aria-command-name`).
library;

import 'dart:async';
import 'dart:js_interop';
import 'dart:js_interop_unsafe';

import 'package:web/web.dart';

import 'storybook_a11y_report.dart';

Future<AxeAuditBundle> runAxeWcagAudit() async {
  final violations = <StorybookA11yItem>[];
  final passes = <StorybookA11yItem>[];
  final incomplete = <StorybookA11yItem>[];

  try {
    await _ensureAxeLoaded();

    final global = globalContext;
    final axe = global['axe'];
    if (axe == null) {
      return AxeAuditBundle(
        violations: violations,
        passes: passes,
        incomplete: incomplete,
        scriptError: 'axe global missing after script load.',
      );
    }

    final opts = <String, Object?>{
      'runOnly': <String, Object>{
        'type': 'tag',
        'values': <String>[
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
        ],
      },
      'rules': <String, Map<String, bool>>{
        'aria-command-name': <String, bool>{'enabled': false},
      },
    }.jsify();

    final doc = global['document'];
    final promise = (axe as JSObject).callMethod<JSPromise>(
      'run'.toJS,
      doc,
      opts,
    );
    final raw = await promise.toDart;
    final dart = raw.dartify();

    void ingestList(
      String key,
      List<StorybookA11yItem> target, {
      int maxItems = 9999,
    }) {
      final list = (dart is Map ? dart[key] : null) as List<dynamic>?;
      if (list == null) return;
      var taken = 0;
      for (final e in list) {
        if (taken >= maxItems) break;
        if (e is! Map) continue;
        taken++;
        final id = e['id']?.toString() ?? 'rule';
        final help = e['help']?.toString() ?? id;
        final desc = e['description']?.toString();
        var count = 1;
        final nodes = e['nodes'];
        if (nodes is List) count = nodes.length.clamp(1, 9999);
        target.add(
          StorybookA11yItem(
            ruleId: id,
            help: help,
            description: desc,
            instanceCount: count,
            engine: StorybookA11yEngine.axe,
          ),
        );
      }
    }

    if (dart is Map) {
      ingestList('violations', violations);
      ingestList('passes', passes, maxItems: 200);
      ingestList('incomplete', incomplete);
    }

    return AxeAuditBundle(
      violations: violations,
      passes: passes,
      incomplete: incomplete,
    );
  } catch (e, _) {
    return AxeAuditBundle(
      violations: violations,
      passes: passes,
      incomplete: incomplete,
      scriptError: '$e',
    );
  }
}

Future<void> _ensureAxeLoaded() async {
  if (globalContext.has('axe')) return;

  final c = Completer<void>();
  final script = document.createElement('script') as HTMLScriptElement;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';

  script.addEventListener(
    'load',
    ((Event _) {
      if (!c.isCompleted) c.complete();
    }).toJS,
  );
  script.addEventListener(
    'error',
    ((Event _) {
      if (!c.isCompleted) {
        c.completeError(StateError('Failed to load axe-core script'));
      }
    }).toJS,
  );

  document.head!.appendChild(script);
  await c.future.timeout(
    const Duration(seconds: 15),
    onTimeout: () => throw TimeoutException('axe-core load timeout'),
  );
}
