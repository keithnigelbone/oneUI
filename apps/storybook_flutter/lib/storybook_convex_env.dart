import 'storybook_convex_env_vm.dart'
    if (dart.library.html) 'storybook_convex_env_stub.dart' as _env_files;

/// Resolves the Convex HTTP URL for Flutter Storybook.
///
/// **Order** (aligned with `apps/storybook/.storybook/main.ts`):
/// 1. Compile-time `--dart-define` / `--dart-define-from-file=../../.env.local`
///    keys: `CONVEX_URL`, `STORYBOOK_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_URL`
/// 2. On **VM** platforms only: parse the same `.env.local` files Storybook loads
///    (repo root, `apps/storybook`, `apps/storybook_flutter`, plus cwd variants).
///
/// **Web**: browsers cannot read `.env.local` from disk. Use the root script
/// `pnpm storybook:flutter:web`, which passes `--dart-define-from-file` pointing
/// at the repo `.env.local` (same mechanism as wiring env without hard-coding URLs).
///
/// A Convex deployment URL is public; keep real secrets in env / Convex rules.
Future<String> resolveStorybookConvexUrl() async {
  // Each call must be const with a literal name — required on web (dart2js/ddc).
  const convexUrl = String.fromEnvironment('CONVEX_URL', defaultValue: '');
  if (convexUrl.isNotEmpty) return convexUrl;
  const storybookConvexUrl = String.fromEnvironment(
    'STORYBOOK_CONVEX_URL',
    defaultValue: '',
  );
  if (storybookConvexUrl.isNotEmpty) return storybookConvexUrl;
  const nextPublicConvexUrl = String.fromEnvironment(
    'NEXT_PUBLIC_CONVEX_URL',
    defaultValue: '',
  );
  if (nextPublicConvexUrl.isNotEmpty) return nextPublicConvexUrl;

  final fromEnv = _env_files.readConvexUrlFromEnvFiles();
  if (fromEnv != null && fromEnv.isNotEmpty) return fromEnv;
  return '';
}
