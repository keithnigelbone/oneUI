import 'dart:async';

import 'package:flutter/widgets.dart';

import '../reports/qa_report_summary.dart';
import 'component_test_stability.dart';
import 'qa_flutter_test_slugs.dart';

/// Polls ingested flutter-summary.json and maps each catalog slug to stability.
class CatalogTestStabilityController extends ChangeNotifier {
  CatalogTestStabilityController({required this.slugs});

  final List<String> slugs;
  Map<String, QaComponentTestStability> _stabilityBySlug = {};
  bool _loading = true;
  Timer? _pollTimer;

  Map<String, QaComponentTestStability> get stabilityBySlug => _stabilityBySlug;
  bool get loading => _loading;

  ({int stable, int unstable, int underDevelopment, int total}) get counts =>
      countCatalogByTestStability(slugs, _stabilityBySlug);

  Future<void> refresh() async {
    // Per-component summaries are freshest; fall back to full-suite JSON once.
    final fullSummary = await QaReportSummary.loadFromAssets();
    final entries = await Future.wait(
      slugs.map((slug) async {
        final perComponent = await QaReportSummary.loadComponentSummaryOnly(slug);
        QaReportSummary? summary = perComponent;
        if (summary == null && isQaFlutterTestSlug(slug) && fullSummary != null) {
          final scoped = fullSummary.scopedForComponent(slug).normalizedForComponent(slug);
          final hasCases =
              scoped.functional.cases.isNotEmpty || scoped.accessibility.cases.isNotEmpty;
          if (hasCases) summary = scoped;
        }
        return MapEntry(slug, getComponentTestStability(slug, summary));
      }),
    );
    _stabilityBySlug = Map.fromEntries(entries);
    _loading = false;
    notifyListeners();
  }

  void startPolling({Duration interval = const Duration(seconds: 15)}) {
    refresh();
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(interval, (_) => refresh());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}

class CatalogTestStabilityScope extends InheritedNotifier<CatalogTestStabilityController> {
  const CatalogTestStabilityScope({
    required CatalogTestStabilityController controller,
    required super.child,
    super.key,
  }) : super(notifier: controller);

  static CatalogTestStabilityController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<CatalogTestStabilityScope>();
    assert(scope != null, 'CatalogTestStabilityScope not found');
    return scope!.notifier!;
  }
}
