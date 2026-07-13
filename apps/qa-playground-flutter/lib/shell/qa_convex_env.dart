import 'qa_convex_env_vm.dart'
    if (dart.library.html) 'qa_convex_env_stub.dart' as _env_files;

/// Resolves Convex URL — same order as Flutter Storybook [resolveStorybookConvexUrl].
Future<String> resolveQaPlaygroundConvexUrl() async {
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
