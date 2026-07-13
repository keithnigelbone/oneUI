import 'package:flutter/material.dart';
import 'package:ui_flutter/brand/one_ui_brand_scope.dart';
import 'package:ui_flutter/convex/one_ui_brand.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'demo_app_settings.dart';
import 'demo_brand_resolve.dart';
import 'demo_responsive.dart';
import 'demo_peoplefirst_flow.dart';
import 'demo_shop_screen.dart';
import 'demo_store_config.dart';
import 'demo_tira_flow.dart';
import 'theme_switcher_bar.dart';

/// CDN sub-themes (JioMart) ship in bundled snapshots — not via Convex theme API.
bool preferCdnBrandProvider(DemoAppSettings settings) {
  if (!settings.usesConvexBrand) return true;
  final theme = settings.themeProp;
  return settings.brandSlug == 'jio' &&
      theme != null &&
      theme.isNotEmpty &&
      theme != 'base';
}

/// Bundled CDN snapshots are keyed for mobile platform only.
const _cdnNativeThemePlatform = 'mobile';

/// Full-screen demo with brand shell, settings toolbar, and storefront.
class DemoExperiencePage extends StatefulWidget {
  const DemoExperiencePage({
    required this.store,
    required this.convexUrl,
    required this.convexBrands,
    super.key,
  });

  final DemoStoreConfig store;
  final String convexUrl;
  final List<OneUiBrand> convexBrands;

  @override
  State<DemoExperiencePage> createState() => _DemoExperiencePageState();
}

class _DemoExperiencePageState extends State<DemoExperiencePage> {
  late DemoAppSettings _settings;

  bool get _isJioMart => widget.store.id == 'jiomart';

  @override
  void initState() {
    super.initState();
    _settings = _settingsForStore(widget.store);
    _bindConvexBrandIfNeeded();
  }

  DemoAppSettings _settingsForStore(DemoStoreConfig store) {
    final view = WidgetsBinding.instance.platformDispatcher.views.first;
    final viewportWidth =
        view.physicalSize.width / view.devicePixelRatio;
    var settings = store.initialSettings.copyWith(
      platformId: initialPlatformIdForViewport(viewportWidth),
    );
    if (store.id == 'jiomart') {
      settings = settings.copyWith(
        brandSlug: 'jio',
        brandPickerLabel: 'Jio',
        clearThemeProp: true,
        accentAppearance: 'primary',
        clearConvexBrandId: true,
      );
    }
    return settings;
  }

  void _bindConvexBrandIfNeeded() {
    if (widget.convexUrl.isEmpty || widget.convexBrands.isEmpty) return;
    if (_isJioMart) return;

    final match = findConvexBrandByPickerLabel(
      widget.convexBrands,
      _settings.brandPickerLabel,
    );
    if (match != null) {
      _settings = _settings.copyWith(
        convexBrandId: match.id,
        brandSlug: match.slug,
        brandPickerLabel: match.name,
      );
    }
  }

  void _onSettingsChanged(DemoAppSettings next) {
    if (_isJioMart) {
      setState(
        () => _settings = next.copyWith(
          brandSlug: 'jio',
          brandPickerLabel: 'Jio',
          clearThemeProp: true,
          accentAppearance: 'primary',
          clearConvexBrandId: true,
        ),
      );
      return;
    }
    setState(() => _settings = next);
  }

  OneUiBrand? get _selectedBrand {
    final id = _settings.convexBrandId;
    if (id == null) return null;
    for (final b in widget.convexBrands) {
      if (b.id == id) return b;
    }
    return null;
  }

  bool _useCdnProvider() =>
      _isJioMart || preferCdnBrandProvider(_settings);

  Widget _brandShell(Widget child) {
    final key = ValueKey<String>(_settings.providerKey);
    if (!_useCdnProvider() &&
        _settings.usesConvexBrand &&
        widget.convexUrl.isNotEmpty &&
        _selectedBrand != null) {
      final brand = _selectedBrand!;
      return OneUiBrandScope(
        key: key,
        convexUrl: widget.convexUrl,
        brandId: brand.id,
        theme: _settings.mode == 'dark' ? 'dark' : 'light',
        density: _settings.density,
        platformId: _settings.platformId,
        nativeThemePlatform: _cdnNativeThemePlatform,
        brandSlug: brand.slug,
        brandName: brand.name,
        primaryHue: brand.primaryHue,
        primaryChroma: brand.primaryChroma,
        child: child,
      );
    }
    return OneUiBrandProvider(
      key: key,
      brand: _settings.brandSlug,
      theme: _settings.themeProp,
      mode: _settings.mode,
      platformId: _settings.platformId,
      density: _settings.density,
      nativeThemePlatform: _cdnNativeThemePlatform,
      brandName: _isJioMart ? 'Jio' : _settings.brandPickerLabel,
      child: child,
    );
  }

  double _spacing(BuildContext context, String token) {
    final scope = OneUiScope.of(context);
    return getSpacingTokenPx(
      spacingName: token,
      platform: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
    );
  }

  Widget _demoChromeHeader(BuildContext context) {
    final pad = getSpacingTokenPx(
      spacingName: '2',
      platform: _settings.platformId,
      density: _settings.density,
      platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
    );
    return OneUiSurface(
      mode: 'minimal',
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.only(left: pad, top: pad, right: pad),
          child: Row(
            children: [
              OneUiIconButton(
                icon: 'arrowLeft',
                semanticsLabel: 'Back to demo list',
                variant: OneUiIconButtonVariant.ghost,
                size: 8,
                onPressed: () => Navigator.of(context).pop(),
              ),
              Expanded(
                child: OneUiText(
                  text: widget.store.hubTitle,
                  variant: OneUiTextVariant.title,
                  size: 's',
                  weight: OneUiTextWeight.high,
                  maxLines: 1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final handheld = isHandheldNativeDemo(context);

    final isPeopleFirst = widget.store.id == 'peoplefirst';

    return _brandShell(
      Scaffold(
        backgroundColor: Colors.transparent,
        body: OneUiSurface(
          mode: 'default',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (!isPeopleFirst) ...[
                Builder(
                  builder: (scoped) => _demoChromeHeader(scoped),
                ),
                Builder(
                  builder: (scoped) {
                    final compactPortal =
                        OneUiScope.of(scoped).platformId.startsWith('S-');
                    if (handheld || compactPortal) {
                      return const SizedBox.shrink();
                    }
                    return DemoSettingsBar(
                      settings: _settings,
                      onChanged: _onSettingsChanged,
                      convexBrands: widget.convexBrands,
                      brandsLoading: false,
                      convexUrl: widget.convexUrl,
                      lockBrand: _isJioMart,
                      lockTheme: _isJioMart,
                    );
                  },
                ),
              ] else
                Builder(
                  builder: (scoped) {
                    if (handheld) return const SizedBox.shrink();
                    return OneUiSurface(
                      mode: 'minimal',
                      padding: EdgeInsets.symmetric(
                        horizontal: _spacing(scoped, '2'),
                        vertical: _spacing(scoped, '1'),
                      ),
                      child: Row(
                        children: [
                          OneUiIconButton(
                            icon: 'arrowLeft',
                            semanticsLabel: 'Back to demo list',
                            variant: OneUiIconButtonVariant.ghost,
                            size: 6,
                            onPressed: () => Navigator.of(scoped).pop(),
                          ),
                          OneUiText(
                            text: 'PeopleFirst sample',
                            variant: OneUiTextVariant.label,
                            size: 'xs',
                            attention: OneUiTextAttention.medium,
                          ),
                        ],
                      ),
                    );
                  },
                ),
              Expanded(
                child: OneUiSurface(
                  mode: 'minimal',
                  child: Builder(
                    builder: (context) {
                      final roles =
                          OneUiSurfaceScope.appearanceRolesForBrand(context);
                      final accent = resolveDemoAccentAppearance(
                        _settings.accentAppearance,
                        roles,
                      );
                      if (widget.store.id == 'tira') {
                        return DemoTiraFlow(
                          config: widget.store,
                          accentAppearance: accent,
                        );
                      }
                      if (widget.store.id == 'peoplefirst') {
                        return DemoPeopleFirstFlow(
                          config: widget.store,
                          accentAppearance: accent,
                        );
                      }
                      return DemoShopScreen(
                        config: widget.store,
                        accentAppearance: accent,
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
