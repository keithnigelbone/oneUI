/// Parses `.env.local`-style lines for Convex URL keys (Storybook / platform parity).
String? parseConvexUrlFromDotEnvSource(String source) {
  const keys = [
    'STORYBOOK_CONVEX_URL',
    'CONVEX_URL',
    'VITE_CONVEX_URL',
    'NEXT_PUBLIC_CONVEX_URL',
  ];
  final map = _parseDotenvLines(source);
  for (final k in keys) {
    final raw = map[k];
    if (raw != null && raw.isNotEmpty) return raw;
  }
  return null;
}

Map<String, String> _parseDotenvLines(String source) {
  final out = <String, String>{};
  final lineRe = RegExp(r'^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$', caseSensitive: false);
  for (final line in source.split(RegExp(r'\r?\n'))) {
    final m = lineRe.firstMatch(line);
    if (m == null) continue;
    final key = m.group(1)!;
    var val = m.group(2)!;
    val = val.replaceAll(RegExp(r'''^['"]|['"]$'''), '');
    out[key] = val;
  }
  return out;
}
