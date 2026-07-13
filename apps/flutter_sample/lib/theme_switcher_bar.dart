import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:ui_flutter/convex/one_ui_brand.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'demo_app_settings.dart';
import 'demo_brand_resolve.dart';

double _spacing(BuildContext context, String token) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: token,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

/// Plain [Text] for [DropdownButton] items — overlay routes sit outside [OneUiScope].
TextStyle _dropdownItemStyle(BuildContext context) {
  final base = Theme.of(context).textTheme.labelMedium;
  return (base ?? const TextStyle()).copyWith(
    fontFamily: 'system-ui',
    fontSize: base?.fontSize ?? 13,
    height: 1.25,
  );
}

/// Settings toolbar — dropdowns for Brand, Theme, Scheme, Platform, Density.
class DemoSettingsBar extends StatelessWidget {
  const DemoSettingsBar({
    required this.settings,
    required this.onChanged,
    required this.convexBrands,
    required this.brandsLoading,
    required this.convexUrl,
    this.lockBrand = false,
    this.lockTheme = false,
    super.key,
  });

  final DemoAppSettings settings;
  final ValueChanged<DemoAppSettings> onChanged;
  final List<OneUiBrand> convexBrands;
  final bool brandsLoading;
  final String convexUrl;
  final bool lockBrand;
  final bool lockTheme;

  bool get _showCdnThemeDropdown =>
      !settings.usesConvexBrand || settings.brandSlug == 'jio';

  bool get _convexOnline => convexUrl.isNotEmpty && convexBrands.isNotEmpty;

  void _applyBrandPicker(String label) {
    if (_convexOnline) {
      final match = findConvexBrandByPickerLabel(convexBrands, label);
      if (match != null) {
        onChanged(
          settings.copyWith(
            brandPickerLabel: label,
            convexBrandId: match.id,
            brandSlug: match.slug,
            clearThemeProp: match.slug != 'jio' && match.slug != 'jio-default',
          ),
        );
        return;
      }
    }
    final slug = cdnBrandSlugForPickerLabel(label);
    onChanged(
      settings.copyWith(
        brandPickerLabel: label,
        brandSlug: slug,
        clearConvexBrandId: true,
        clearThemeProp: label == 'Jio',
        accentAppearance: label == 'Jio' ? 'primary' : settings.accentAppearance,
      ),
    );
  }

  void _applyPlatform(String platformId) {
    onChanged(settings.copyWith(platformId: platformId));
  }

  void _applyScheme(String mode) {
    onChanged(settings.copyWith(mode: mode));
  }

  void _applyDensity(String density) {
    onChanged(settings.copyWith(density: density));
  }

  void _applyThemeVariant(String variant) {
    if (variant == 'jiomart') {
      onChanged(
        settings.copyWith(
          clearConvexBrandId: true,
          brandSlug: 'jio',
          brandPickerLabel: 'Jio',
          themeProp: 'jiomart',
        ),
      );
      return;
    }
    onChanged(
      settings.copyWith(
        themeProp: variant == 'base' ? null : variant,
        clearThemeProp: variant == 'base',
      ),
    );
  }

  Widget _dropdownField({
    required BuildContext context,
    required String label,
    required String value,
    required List<({String id, String label})> options,
    required ValueChanged<String> onSelected,
    required double minWidth,
    bool enabled = true,
  }) {
    final gap = _spacing(context, '1');
    final itemStyle = _dropdownItemStyle(context);
    final resolved =
        options.any((o) => o.id == value) ? value : options.first.id;

    return SizedBox(
      width: minWidth,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          OneUiText(
            text: label,
            variant: OneUiTextVariant.label,
            size: 'xs',
            weight: OneUiTextWeight.medium,
            attention: OneUiTextAttention.medium,
          ),
          SizedBox(height: gap),
          DecoratedBox(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(_spacing(context, '2')),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context)
                      .shadowColor
                      .withOpacity(0.08),
                  blurRadius: _spacing(context, '1'),
                  offset: Offset(0, _spacing(context, '0-5')),
                ),
              ],
            ),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: _spacing(context, '2')),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  isDense: true,
                  borderRadius:
                      BorderRadius.circular(_spacing(context, '2')),
                  menuMaxHeight:
                      _spacing(context, '40') + _spacing(context, '32'),
                  value: resolved,
                  style: itemStyle,
                  items: [
                    for (final o in options)
                      DropdownMenuItem<String>(
                        value: o.id,
                        child: Text(
                          o.label,
                          style: itemStyle,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                  ],
                  selectedItemBuilder: (ctx) => [
                    for (final o in options)
                      Align(
                        alignment: AlignmentDirectional.centerStart,
                        child: Text(
                          o.label,
                          style: itemStyle,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                  ],
                  onChanged: enabled
                      ? (next) {
                          if (next != null) onSelected(next);
                        }
                      : null,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final padH = _spacing(context, '4');
    final padV = _spacing(context, '3');
    final gap = _spacing(context, '3');
    final fieldMin = _spacing(context, '32');

    final brandOptions = [
      for (final name in kDemoBrandPickerOptions)
        (id: name, label: name),
    ];

    final variantOptions = _showCdnThemeDropdown
        ? listOneUiCdnBrandVariants(
            settings.brandSlug,
            platform: nativeThemePlatformArgFromV2Id(settings.platformId),
            density: settings.density,
            mode: settings.mode,
          )
        : <OneUiBrandVariantOption>[];
    final variants = variantOptions.isEmpty
        ? defaultOneUiBrandVariantOptions
        : variantOptions;
    final variantValue = settings.themeProp ?? 'base';

    final themeDropdownOptions = [
      for (final v in variants) (id: v.variant, label: v.label),
    ];

    return OneUiSurface(
      mode: 'subtle',
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(padH, padV, padH, padV),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (kIsWeb && convexUrl.isEmpty)
                Padding(
                  padding: EdgeInsets.only(bottom: gap),
                  child: OneUiText(
                    text:
                        'Convex offline — CDN Jio only. Run with --dart-define-from-file=../../.env.local for full brands.',
                    variant: OneUiTextVariant.label,
                    size: 'xs',
                    attention: OneUiTextAttention.medium,
                  ),
                ),
              if (brandsLoading)
                const OneUiText(
                  text: 'Loading brands…',
                  variant: OneUiTextVariant.label,
                  size: 'xs',
                )
              else
                Wrap(
                  spacing: gap,
                  runSpacing: gap,
                  crossAxisAlignment: WrapCrossAlignment.end,
                  children: [
                    _dropdownField(
                      context: context,
                      label: 'Brand',
                      value: settings.brandPickerLabel,
                      options: brandOptions,
                      onSelected: _applyBrandPicker,
                      minWidth: fieldMin,
                      enabled: !lockBrand,
                    ),
                    if (_showCdnThemeDropdown &&
                        themeDropdownOptions.isNotEmpty &&
                        !lockTheme)
                      _dropdownField(
                        context: context,
                        label: 'Theme',
                        value: variantValue,
                        options: themeDropdownOptions,
                        onSelected: _applyThemeVariant,
                        minWidth: _spacing(context, '24'),
                      )
                    else if (lockTheme)
                      _dropdownField(
                        context: context,
                        label: 'Theme',
                        value: 'base',
                        options: const [
                          (id: 'base', label: 'Base (Jio)'),
                        ],
                        onSelected: (_) {},
                        minWidth: _spacing(context, '24'),
                        enabled: false,
                      ),
                    _dropdownField(
                      context: context,
                      label: 'Scheme',
                      value: settings.mode,
                      options: kDemoSchemeOptions,
                      onSelected: _applyScheme,
                      minWidth: _spacing(context, '20'),
                    ),
                    _dropdownField(
                      context: context,
                      label: 'Platform',
                      value: settings.platformId,
                      options: kDemoPlatformOptions,
                      onSelected: _applyPlatform,
                      minWidth: fieldMin,
                    ),
                    _dropdownField(
                      context: context,
                      label: 'Density',
                      value: settings.density,
                      options: kDemoDensityOptions,
                      onSelected: _applyDensity,
                      minWidth: _spacing(context, '24'),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
