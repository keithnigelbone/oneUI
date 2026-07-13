import '../engine/native_design_system_payload.dart';

/// Convex often persists **Actions → outline / quiet emphasis** (`componentThemes.actionEmphasis`):
/// High attention uses **`--Button-backgroundColor-bold: transparent`** and draws chrome via
/// `::after` inset stroke on web. For Flutter previews that should match **solid** presets,
/// strip outline-style bold overrides so widgets fall through to role palettes.
///
/// Does **not** change Convex payloads or web Storybook.

const List<String> _stripButtonBoldOutline = [
  '--Button-backgroundColor-bold',
  '--Button-backgroundColor-bold-hover',
  '--Button-backgroundColor-bold-pressed',
  '--Button-textColor-bold',
  '--Button-borderColor-bold',
  '--Button-cssDecorationColor-bold',
  '--Button-cssDecorationInsetStrokeWidth-bold',
  '--Button-cssDecorationStrokeStyle-bold',
];

const List<String> _stripIconButtonBoldOutline = [
  '--IconButton-backgroundColor-bold',
  '--IconButton-backgroundColor-bold-hover',
  '--IconButton-backgroundColor-bold-pressed',
  '--IconButton-iconColor-bold',
  '--IconButton-borderColor-bold',
  '--IconButton-cssDecorationColor-bold',
  '--IconButton-cssDecorationInsetStrokeWidth-bold',
  '--IconButton-cssDecorationStrokeStyle-bold',
];

bool _looksTransparentFill(String raw) {
  final t = raw.trim().toLowerCase();
  if (t == 'transparent') return true;
  if (t == 'rgba(0, 0, 0, 0)' || t == 'rgba(0,0,0,0)') return true;
  if (t.length == 9 && t.startsWith('#')) {
    return int.tryParse(t.substring(1, 3), radix: 16) == 0;
  }
  return false;
}

/// Returns a cloned [NativeDesignSystemPayload] when stripping ran; otherwise [ds] unchanged.
NativeDesignSystemPayload normalizeSolidHighAttention(
    NativeDesignSystemPayload ds) {
  final btnBgRaw =
      ds.componentCustomProperties['--Button-backgroundColor-bold'];
  final ibBgRaw =
      ds.componentCustomProperties['--IconButton-backgroundColor-bold'];
  final stripButton = btnBgRaw != null && _looksTransparentFill(btnBgRaw);
  final stripIcon = ibBgRaw != null && _looksTransparentFill(ibBgRaw);
  if (!stripButton && !stripIcon) {
    return ds;
  }

  final next = Map<String, String>.from(ds.componentCustomProperties);
  if (stripButton) {
    for (final k in _stripButtonBoldOutline) {
      next.remove(k);
    }
  }
  if (stripIcon) {
    for (final k in _stripIconButtonBoldOutline) {
      next.remove(k);
    }
  }

  return NativeDesignSystemPayload(
    componentCustomProperties: next,
    dimensionContexts: ds.dimensionContexts,
    activeDimensionKey: ds.activeDimensionKey,
    activeDimensionContext: ds.activeDimensionContext,
  );
}

bool _retailTiraCapsuleSlugOrName(
    {required String? slug, required String? name}) {
  final s = (slug ?? '').trim().toLowerCase();
  final n = (name ?? '').trim().toLowerCase();
  if (s == 'tira' || n == 'tira') return true;
  if (s.startsWith('tira-')) return true;
  return false;
}

/// Tira retail persists smaller Actions `borderRadius` tokens. Server-side `nativeTheme` /
/// `buildAllComponentCSS` coerce to **`var(--Shape-Pill)`**. This clone aligns Flutter when
/// pointed at Convex that does not yet include that patch.
NativeDesignSystemPayload normalizeTiraRetailCapsuleButtons(
  NativeDesignSystemPayload ds, {
  required String? slug,
  required String? name,
}) {
  if (!_retailTiraCapsuleSlugOrName(slug: slug, name: name)) return ds;
  final next = Map<String, String>.from(ds.componentCustomProperties);
  next['--Button-borderRadius'] = 'var(--Shape-Pill)';
  next['--IconButton-borderRadius'] = 'var(--Shape-Pill)';
  next['--SelectableSingleTextButton-borderRadius'] = 'var(--Shape-Pill)';
  next['--SelectableIconButton-borderRadius'] = 'var(--Shape-Pill)';
  next['--SingleTextButton-borderRadius'] = 'var(--Shape-Pill)';
  return NativeDesignSystemPayload(
    componentCustomProperties: next,
    dimensionContexts: ds.dimensionContexts,
    activeDimensionKey: ds.activeDimensionKey,
    activeDimensionContext: ds.activeDimensionContext,
  );
}
