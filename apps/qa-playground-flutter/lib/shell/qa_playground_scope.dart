import 'package:flutter/material.dart';
import 'package:ui_flutter/brand/one_ui_brand_scope.dart';
import 'package:ui_flutter/convex/one_ui_brand.dart';
import 'package:ui_flutter/utils/viewport_to_platform.dart';

import 'qa_playground_toolbar_state.dart';

/// Convex-backed brand scope — same wiring as Flutter Storybook [OneUiBrandScope].
class QaPlaygroundBrandShell extends StatelessWidget {
  const QaPlaygroundBrandShell({
    required this.convexUrl,
    required this.toolbarState,
    required this.selectedBrand,
    required this.child,
    super.key,
  });

  final String convexUrl;
  final QaPlaygroundToolbarState toolbarState;
  final OneUiBrand? selectedBrand;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final brand = selectedBrand;

    return OneUiBrandScope(
      convexUrl: convexUrl,
      brandId: toolbarState.brandId,
      theme: toolbarState.convexTheme,
      density: toolbarState.density,
      platformId: toolbarState.v2PlatformForScope,
      nativeThemePlatform: toolbarState.nativeSnapshotPlatformFromToolbar(),
      brandSlug: brand?.slug,
      brandName: brand?.name,
      primaryHue: brand?.primaryHue,
      primaryChroma: brand?.primaryChroma,
      applyTiraCapsulePatch: true,
      // Do not pass [loading] here — it builds a Stack above MaterialApp (no
      // Directionality). Storybook handles brand loading inside MaterialApp instead.
      child: child,
    );
  }
}

/// Syncs responsive viewport → V2 platform + Convex native platform (Storybook parity).
class QaResponsivePlatformSync extends StatefulWidget {
  const QaResponsivePlatformSync({
    required this.toolbarState,
    required this.convexUrl,
    required this.child,
    super.key,
  });

  final QaPlaygroundToolbarState toolbarState;
  final String convexUrl;
  final Widget child;

  @override
  State<QaResponsivePlatformSync> createState() => _QaResponsivePlatformSyncState();
}

class _QaResponsivePlatformSyncState extends State<QaResponsivePlatformSync> {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final v2 = widget.toolbarState.effectiveV2Platform(width);

        if (widget.toolbarState.breakpoint == 'responsive' &&
            widget.toolbarState.brandId.isNotEmpty &&
            widget.convexUrl.isNotEmpty &&
            width.isFinite &&
            width > 0) {
          final plat = nativeThemePlatformArgFromV2Id(viewportToV2PlatformId(width));
          if (plat != widget.toolbarState.nativeConvexPlatformArg) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (!mounted) return;
              widget.toolbarState.applyNativeConvexPlatformArg(plat);
              setState(() {});
            });
          }
        }

        if (v2 != widget.toolbarState.v2PlatformForScope) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (!mounted) return;
            widget.toolbarState.syncV2PlatformForScope(v2);
            setState(() {});
          });
        }

        return widget.child;
      },
    );
  }
}
