import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:ui_flutter/convex/breakpoint_labels.dart';
import 'package:ui_flutter/convex/one_ui_brand.dart';
import 'package:ui_flutter/tokens/appearance_roles.dart';
import 'package:ui_flutter/tokens/dimension_scale.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'qa_playground_toolbar_state.dart';

double _spacing(BuildContext context, String token) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: token,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

/// Horizontal OneUI chip toolbar — Brand · Viewport · Density · Scheme · Appearance.
class QaPlaygroundChipToolbar extends StatelessWidget {
  const QaPlaygroundChipToolbar({
    required this.state,
    required this.convexUrl,
    required this.brands,
    required this.brandsLoading,
    required this.brandsListStatus,
    required this.onChanged,
    super.key,
  });

  final QaPlaygroundToolbarState state;
  final String convexUrl;
  final List<OneUiBrand> brands;
  final bool brandsLoading;
  final BrandsListStatus brandsListStatus;
  final VoidCallback onChanged;

  Widget _section(BuildContext context, String label, Widget chips) {
    final gap = _spacing(context, '2');
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        OneUiText(
          text: label,
          variant: OneUiTextVariant.label,
          size: 'xs',
          weight: OneUiTextWeight.medium,
          attention: OneUiTextAttention.medium,
        ),
        SizedBox(width: gap),
        chips,
      ],
    );
  }

  Widget _divider(BuildContext context) {
    return SizedBox(width: _spacing(context, '4'));
  }

  @override
  Widget build(BuildContext context) {
    final padH = _spacing(context, '4');
    final padV = _spacing(context, '3');
    final appearanceRoles = OneUiSurfaceScope.appearanceRolesForBrand(context);
    final accent = state.resolveAccentAppearance(appearanceRoles);
    if (accent != state.accentAppearance) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        state.setAccentAppearance(accent);
        onChanged();
      });
    }

    final breakpoint =
        kOneUiBreakpointValues.contains(state.breakpoint)
            ? state.breakpoint
            : 'responsive';

    String? emptyBrandsHint;
    if (!brandsLoading && brands.isEmpty) {
      if (convexUrl.isEmpty) {
        emptyBrandsHint = kIsWeb
            ? 'No Convex URL — use --dart-define-from-file=../../.env.local'
            : 'No Convex URL in `.env.local`';
      } else {
        emptyBrandsHint = brandsListStatus == BrandsListStatus.error
            ? 'Could not load brands'
            : 'Convex `brands` table is empty';
      }
    }

    Widget brandChips;
    if (brandsLoading) {
      brandChips = const OneUiText(
        text: 'Loading brands…',
        variant: OneUiTextVariant.label,
        size: 'xs',
      );
    } else if (emptyBrandsHint != null) {
      brandChips = OneUiText(
        text: emptyBrandsHint,
        variant: OneUiTextVariant.label,
        size: 'xs',
        attention: OneUiTextAttention.medium,
      );
    } else {
      final brandValue = state.brandId.isEmpty ? '__none__' : state.brandId;
      brandChips = OneUiChipGroup(
        value: [brandValue],
        onValueChange: (values) {
          final picked = values.isEmpty ? '__none__' : values.last;
          state.setBrand(picked == '__none__' ? '' : picked);
          onChanged();
        },
        children: [
          OneUiChip(value: '__none__', child: 'No brand'),
          for (final b in brands) OneUiChip(value: b.id, child: b.name),
        ],
      );
    }

    return OneUiSurface(
      mode: 'subtle',
      child: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: EdgeInsets.symmetric(horizontal: padH, vertical: padV),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _section(context, 'Brand', brandChips),
              _divider(context),
              _section(
                context,
                'Viewport',
                OneUiChipGroup(
                  value: [breakpoint],
                  onValueChange: (values) {
                    final next = values.isEmpty ? breakpoint : values.last;
                    state.setBreakpoint(next);
                    onChanged();
                  },
                  children: [
                    for (final v in kOneUiBreakpointValues)
                      OneUiChip(
                        value: v,
                        child: breakpointMenuLabel(v),
                      ),
                  ],
                ),
              ),
              _divider(context),
              _section(
                context,
                'Density',
                OneUiChipGroup(
                  value: [state.density],
                  onValueChange: (values) {
                    final next =
                        values.isEmpty ? state.density : values.last;
                    state.setDensity(next);
                    onChanged();
                  },
                  children: [
                    for (final d in densityIds)
                      OneUiChip(
                        value: d,
                        child: d == 'default'
                            ? 'Default'
                            : d[0].toUpperCase() + d.substring(1),
                      ),
                  ],
                ),
              ),
              _divider(context),
              _section(
                context,
                'Scheme',
                OneUiChipGroup(
                  value: [state.theme.name],
                  onValueChange: (values) {
                    final raw = values.isEmpty ? state.theme.name : values.last;
                    state.setTheme(
                      raw == 'dark' ? QaThemeChoice.dark : QaThemeChoice.light,
                    );
                    onChanged();
                  },
                  children: [
                    OneUiChip(value: 'light', child: 'Light'),
                    OneUiChip(value: 'dark', child: 'Dark'),
                  ],
                ),
              ),
              if (appearanceRoles.isNotEmpty) ...[
                _divider(context),
                _section(
                  context,
                  'Appearance',
                  OneUiChipGroup(
                    value: [accent],
                    onValueChange: (values) {
                      final next = values.isEmpty ? accent : values.last;
                      state.setAccentAppearance(next);
                      onChanged();
                    },
                    children: [
                      for (final role in appearanceRoles)
                        OneUiChip(
                          value: role,
                          child: appearanceLabel(role),
                        ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
