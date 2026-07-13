/// Reads Convex deployment URL from compile-time `--dart-define` values.
///
/// Prefer `CONVEX_URL`; falls back to `NEXT_PUBLIC_CONVEX_URL` (parity with web `.env.local`).
String resolveConvexUrlFromEnvironment() {
  const primary = String.fromEnvironment('CONVEX_URL');
  if (primary.isNotEmpty) return primary;
  const nextPublic = String.fromEnvironment('NEXT_PUBLIC_CONVEX_URL');
  if (nextPublic.isNotEmpty) return nextPublic;
  return '';
}
