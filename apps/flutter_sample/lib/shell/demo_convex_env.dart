import 'demo_convex_env_vm.dart'
    if (dart.library.html) 'demo_convex_env_stub.dart' as _env_files;

Future<String> resolveDemoConvexUrl() async {
  const convexUrl = String.fromEnvironment('CONVEX_URL', defaultValue: '');
  if (convexUrl.isNotEmpty) return convexUrl;
  const nextPublic = String.fromEnvironment('NEXT_PUBLIC_CONVEX_URL', defaultValue: '');
  if (nextPublic.isNotEmpty) return nextPublic;
  final fromEnv = _env_files.readConvexUrlFromEnvFiles();
  if (fromEnv != null && fromEnv.isNotEmpty) return fromEnv;
  return '';
}
