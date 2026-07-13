/// Shared helpers for [OneUiIconRemote] (IO + web).
bool isOneUiIconNetworkSrc(String? value) {
  if (value == null) return false;
  final t = value.trim();
  if (t.isEmpty) return false;
  final uri = Uri.tryParse(t);
  if (uri == null || !uri.hasScheme) return false;
  return uri.scheme == 'http' || uri.scheme == 'https';
}

/// Heuristic: treat URL path as SVG when it ends with `.svg`.
bool isOneUiIconRemoteSvgUrl(String url) {
  final path = Uri.tryParse(url.trim())?.path.toLowerCase() ?? '';
  return path.endsWith('.svg');
}

/// Normalises monochrome SVG markup so [SvgTheme.currentColor] can tint glyphs.
String prepareOneUiRemoteSvgForTint(String xml) {
  if (xml.contains('currentColor')) return xml;
  return xml
      .replaceAllMapped(
        RegExp(r'''fill=["'](?:#000000?|black)["']''', caseSensitive: false),
        (_) => 'fill="currentColor"',
      )
      .replaceAllMapped(
        RegExp(r'''stroke=["'](?:#000000?|black)["']''', caseSensitive: false),
        (_) => 'stroke="currentColor"',
      );
}

bool oneUiRemoteSvgUsesCurrentColor(String xml) {
  return xml.contains('currentColor');
}
