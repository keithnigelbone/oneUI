import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:ui_flutter/convex/breakpoint_labels.dart';
import 'package:ui_flutter/convex/one_ui_brand.dart';
import 'package:ui_flutter/tokens/dimension_scale.dart';

import 'qa_playground_toolbar_state.dart';

/// Storybook-parity toolbar: Brand · Web · Viewport · Density · Theme.
class QaPlaygroundToolbar extends StatelessWidget {
  const QaPlaygroundToolbar({
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

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    String? brandDropdownValue;
    if (state.brandId.isEmpty) {
      brandDropdownValue = '';
    } else if (brandsLoading) {
      brandDropdownValue = state.brandId;
    } else if (brands.any((b) => b.id == state.brandId)) {
      brandDropdownValue = state.brandId;
    }

    String? emptyBrandsHint;
    if (!brandsLoading && brands.isEmpty) {
      if (convexUrl.isEmpty) {
        emptyBrandsHint = kIsWeb
            ? 'No Convex URL in build. Run with --dart-define-from-file=../../.env.local'
            : 'No Convex URL. Add CONVEX_URL to repo `.env.local`.';
      } else {
        emptyBrandsHint = brandsListStatus == BrandsListStatus.error
            ? 'Could not load brands (network or Convex error)'
            : '`brands` table is empty — seed brands in Convex';
      }
    }

    final brandItems = <DropdownMenuItem<String>>[
      const DropdownMenuItem<String>(value: '', child: Text('No brand')),
      if (emptyBrandsHint != null)
        DropdownMenuItem<String>(
          value: '__offline__',
          enabled: false,
          child: Text(emptyBrandsHint, maxLines: 3),
        ),
      ...brands.map(
        (b) => DropdownMenuItem<String>(value: b.id, child: Text(b.name)),
      ),
    ];

    final brandControl = brandsLoading
        ? Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            child: Text(
              'Loading brands…',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: scheme.onSurface,
              ),
            ),
          )
        : DropdownButton<String>(
            value: brandDropdownValue,
            hint: const Text('Brand'),
            underline: const SizedBox.shrink(),
            isDense: true,
            items: brandItems,
            onChanged: (v) {
              if (v == null || v == '__offline__') return;
              state.setBrand(v);
              onChanged();
            },
          );

    return Material(
      color: scheme.surfaceContainerHighest.withValues(alpha: 0.35),
      child: Container(
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: scheme.outlineVariant.withValues(alpha: 0.4))),
        ),
        child: SafeArea(
          bottom: false,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: (brandDropdownValue != null && brandDropdownValue.isNotEmpty)
                        ? scheme.error
                        : scheme.outline,
                  ),
                ),
                const SizedBox(width: 6),
                brandControl,
                _divider(scheme),
                DropdownButton<String>(
                  value: 'web',
                  underline: const SizedBox.shrink(),
                  isDense: true,
                  items: const [
                    DropdownMenuItem(value: 'web', child: Text('Web')),
                  ],
                  onChanged: (_) {},
                ),
                _divider(scheme),
                DropdownButton<String>(
                  value: kOneUiBreakpointValues.contains(state.breakpoint)
                      ? state.breakpoint
                      : 'responsive',
                  underline: const SizedBox.shrink(),
                  isDense: true,
                  items: [
                    for (final v in kOneUiBreakpointValues)
                      DropdownMenuItem(
                        value: v,
                        child: Text(breakpointMenuLabel(v)),
                      ),
                  ],
                  onChanged: (v) {
                    if (v == null) return;
                    state.setBreakpoint(v);
                    onChanged();
                  },
                ),
                _divider(scheme),
                DropdownButton<String>(
                  value: densityIds.contains(state.density) ? state.density : 'default',
                  underline: const SizedBox.shrink(),
                  isDense: true,
                  items: [
                    for (final d in densityIds)
                      DropdownMenuItem(
                        value: d,
                        child: Text(
                          d == 'default' ? 'Default' : d[0].toUpperCase() + d.substring(1),
                        ),
                      ),
                  ],
                  onChanged: (v) {
                    if (v == null) return;
                    state.setDensity(v);
                    onChanged();
                  },
                ),
                _divider(scheme),
                IconButton(
                  tooltip: state.isDark ? 'Light theme' : 'Dark theme',
                  icon: Icon(
                    state.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                  ),
                  onPressed: () {
                    state.toggleTheme();
                    onChanged();
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _divider(ColorScheme scheme) {
    return Container(
      width: 1,
      height: 18,
      margin: const EdgeInsets.symmetric(horizontal: 6),
      color: scheme.outline.withValues(alpha: 0.25),
    );
  }
}
