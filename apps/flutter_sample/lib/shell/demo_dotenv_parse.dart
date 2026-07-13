/// Minimal `.env.local` parser for `CONVEX_URL` / `NEXT_PUBLIC_CONVEX_URL`.
String? parseConvexUrlFromDotEnvSource(String source) {
  for (final line in source.split('\n')) {
    final trimmed = line.trim();
    if (trimmed.isEmpty || trimmed.startsWith('#')) continue;
    final eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    final key = trimmed.substring(0, eq).trim();
    var value = trimmed.substring(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    if (key == 'CONVEX_URL' ||
        key == 'NEXT_PUBLIC_CONVEX_URL' ||
        key == 'STORYBOOK_CONVEX_URL') {
      if (value.isNotEmpty) return value;
    }
  }
  return null;
}
