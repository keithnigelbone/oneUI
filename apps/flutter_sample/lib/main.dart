import 'package:flutter/material.dart';
import 'package:ui_flutter/brand/one_ui_brand_scope.dart';
import 'package:ui_flutter/convex/fetch_brands_list.dart';
import 'package:ui_flutter/convex/one_ui_brand.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'demo_experience_page.dart';
import 'demo_hub_screen.dart';
import 'demo_responsive.dart';
import 'demo_store_config.dart';
import 'shell/demo_convex_env.dart';
import 'shell/demo_insecure_tls_stub.dart'
    if (dart.library.io) 'shell/demo_insecure_tls_io.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await JioIconCatalog.instance.ensureLoaded();
  await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true);
  final convexUrl = await resolveDemoConvexUrl();
  enableDemoInsecureTlsIfRequested(convexUrl);
  runApp(DemoApp(convexUrl: convexUrl));
}

/// OneUI Flutter sample app — demo hub + storefront experiences.
class DemoApp extends StatefulWidget {
  const DemoApp({required this.convexUrl, super.key});

  final String convexUrl;

  @override
  State<DemoApp> createState() => _DemoAppState();
}

class _DemoAppState extends State<DemoApp> {
  List<OneUiBrand> _brands = const [];
  bool _brandsLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBrands();
  }

  Future<void> _loadBrands() async {
    if (widget.convexUrl.isEmpty) {
      setState(() => _brandsLoading = false);
      return;
    }
    final result = await fetchBrandsList(widget.convexUrl);
    if (!mounted) return;
    setState(() {
      _brands = result.brands;
      _brandsLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final view = WidgetsBinding.instance.platformDispatcher.views.first;
    final viewportWidth =
        view.physicalSize.width / view.devicePixelRatio;

    return MaterialApp(
      title: 'OneUI Sample Demos',
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF5F5F5),
        canvasColor: const Color(0xFFF5F5F5),
      ),
      home: Builder(
        builder: (navContext) {
          return OneUiBrandProvider(
            brand: 'jio',
            mode: 'light',
            platformId: initialPlatformIdForViewport(viewportWidth),
            child: Scaffold(
              backgroundColor: Colors.transparent,
              body: OneUiSurface(
                mode: 'default',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_brandsLoading)
                      const Padding(
                        padding: EdgeInsets.all(12),
                        child: OneUiText(
                          text: 'Loading brands…',
                          variant: OneUiTextVariant.label,
                          size: 'xs',
                        ),
                      ),
                    Expanded(
                      child: DemoHubScreen(
                        onOpenStore: (store) {
                          Navigator.of(navContext).push<void>(
                            MaterialPageRoute<void>(
                              builder: (_) => DemoExperiencePage(
                                store: store,
                                convexUrl: widget.convexUrl,
                                convexBrands: _brands,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
