import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:ui_flutter/brand/one_ui_brand_scope.dart';
import 'package:ui_flutter/convex/convex.dart';
import 'package:ui_flutter/storybook.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';

import 'catalog/qa_catalog.dart';
import 'pages/catalog_page.dart';
import 'pages/component_detail_page.dart';
import 'qa/use_catalog_test_stability.dart';
import 'shell/qa_convex_env.dart';
import 'shell/qa_insecure_tls_stub.dart'
    if (dart.library.io) 'shell/qa_insecure_tls_io.dart';
import 'shell/qa_playground_chip_toolbar.dart';
import 'shell/qa_playground_scope.dart';
import 'shell/qa_playground_toolbar_state.dart';
import 'shell/qa_web_link.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (kIsWeb) {
    usePathUrlStrategy();
  }
  await JioIconCatalog.instance.ensureLoaded();
  final convexUrl = await resolveQaPlaygroundConvexUrl();
  enableInsecureTlsForConvexIfRequested(convexUrl);
  runApp(QaPlaygroundApp(convexUrl: convexUrl));
}

class QaPlaygroundApp extends StatefulWidget {
  const QaPlaygroundApp({required this.convexUrl, super.key});

  final String convexUrl;

  @override
  State<QaPlaygroundApp> createState() => _QaPlaygroundAppState();
}

class _QaPlaygroundAppState extends State<QaPlaygroundApp> with WidgetsBindingObserver {
  late String? _selectedSlug = initialSlugFromUri();
  late final QaPlaygroundToolbarState _toolbarState = QaPlaygroundToolbarState();
  late final CatalogTestStabilityController _stabilityController =
      CatalogTestStabilityController(
    slugs: kQaCatalogEntries.map((e) => e.slug).toList(),
  );

  List<OneUiBrand> _brands = const [];
  bool _brandsLoading = true;
  BrandsListStatus _brandsListStatus = BrandsListStatus.ok;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _stabilityController.startPolling();
    _loadBrands();
  }

  Future<void> _loadBrands() async {
    final result = await fetchBrandsList(widget.convexUrl);
    if (!mounted) return;
    setState(() {
      _brands = result.brands;
      _brandsListStatus = result.status;
      _brandsLoading = false;
      // Mirror web qa-playground (QaPlaygroundBrandShell.tsx): when no brand is
      // selected — or the persisted brand isn't in the list — auto-pick the
      // Jio default. Deliberately NO fallback to `brands.first`: if Jio isn't
      // seeded we'd otherwise persist some arbitrary brand (e.g. Tira) and the
      // user would be stuck on it forever. Leaving brandId empty surfaces the
      // missing-Jio state via the "No brand" dropdown entry.
      final hasValidBrand = _toolbarState.brandId.isNotEmpty &&
          result.brands.any((b) => b.id == _toolbarState.brandId);
      if (!hasValidBrand) {
        final jio = _findJioBrand(result.brands);
        if (jio != null) {
          _toolbarState.setBrand(jio.id);
        } else if (_toolbarState.brandId.isNotEmpty) {
          _toolbarState.setBrand('');
        }
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _stabilityController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _stabilityController.refresh();
    }
  }

  OneUiBrand? get _selectedBrand {
    for (final b in _brands) {
      if (b.id == _toolbarState.brandId) return b;
    }
    return null;
  }

  void _openComponent(String slug) {
    setState(() => _selectedSlug = slug);
    qaPushPath('/c/$slug');
  }

  void _backToCatalog() {
    setState(() => _selectedSlug = null);
  }

  void _onToolbarChanged() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final onDetail = _selectedSlug != null;

    return QaPlaygroundBrandShell(
      convexUrl: widget.convexUrl,
      toolbarState: _toolbarState,
      selectedBrand: _selectedBrand,
      child: CatalogTestStabilityScope(
        controller: _stabilityController,
        child: MaterialApp(
          title: 'OneUI Flutter QA Playground',
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0A59F7)),
            useMaterial3: true,
          ),
          darkTheme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF0A59F7),
              brightness: Brightness.dark,
            ),
            useMaterial3: true,
          ),
          themeMode: _toolbarState.isDark ? ThemeMode.dark : ThemeMode.light,
          home: Builder(
            builder: (context) {
              final scheme = Theme.of(context).colorScheme;
              final brandLoading =
                  OneUiBrandLoadState.maybeOf(context)?.loading == true &&
                      _toolbarState.brandId.isNotEmpty;

              return Scaffold(
                body: Stack(
                  fit: StackFit.expand,
                  children: [
                    Column(
                      children: [
                        QaPlaygroundChipToolbar(
                          state: _toolbarState,
                          convexUrl: widget.convexUrl,
                          brands: _brands,
                          brandsLoading: _brandsLoading,
                          brandsListStatus: _brandsListStatus,
                          onChanged: _onToolbarChanged,
                        ),
                        Expanded(
                          child: QaResponsivePlatformSync(
                            toolbarState: _toolbarState,
                            convexUrl: widget.convexUrl,
                            child: onDetail
                                ? ComponentDetailPage(
                                    slug: _selectedSlug!,
                                    onBack: _backToCatalog,
                                  )
                                : CatalogPage(onOpenComponent: _openComponent),
                          ),
                        ),
                      ],
                    ),
                    if (brandLoading)
                      Positioned.fill(
                        child: ColoredBox(
                          color: scheme.surface.withValues(alpha: 0.72),
                          child: const Center(
                            child: OneUiCircularProgressIndicator(
                              variant: 'indeterminate',
                              size: 'M',
                              appearance: 'primary',
                              ariaHidden: true,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

/// Picks the Jio brand from a Convex `brands:list` payload across the slug /
/// name variants we've seen in the wild. Canonical seed is
/// `{ slug: 'jio-default', name: 'Jio Default' }` ([kJioAlphaBrandSlug]), but
/// user-edited Convex deployments often have a shorter `slug: 'jio',
/// name: 'Jio'` row instead. Returns null when no match — caller leaves the
/// brand empty rather than picking some arbitrary other brand.
OneUiBrand? _findJioBrand(List<OneUiBrand> brands) {
  for (final b in brands) {
    if (b.slug == kJioAlphaBrandSlug) return b;
  }
  for (final b in brands) {
    if (b.slug == 'jio') return b;
  }
  for (final b in brands) {
    final n = b.name.toLowerCase().trim();
    if (n == 'jio' || n == 'jio default') return b;
  }
  return null;
}

String? initialSlugFromUri() {
  // Mobile / desktop: `--dart-define=INITIAL_SLUG=<slug>` boots straight into a
  // component, bypassing the catalog. Used by run_dev_mobile.sh when a second
  // positional argument is passed.
  const initialSlug = String.fromEnvironment('INITIAL_SLUG', defaultValue: '');
  if (initialSlug.isNotEmpty) return initialSlug;

  if (!kIsWeb) return null;
  final path = Uri.base.path;
  if (path.startsWith('/c/') && path.length > 3) {
    return path.substring(3).split('/').first;
  }
  return null;
}
