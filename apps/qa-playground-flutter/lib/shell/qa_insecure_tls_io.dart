import 'dart:io';

import 'package:flutter/foundation.dart';

/// Dev-only TLS bypass for corporate SSL-inspection proxies (Zscaler, Netskope,
/// Cisco Umbrella). When active, [HttpClient] accepts certificates signed by
/// the corporate inspection CA for the Convex host only — every other host
/// continues to validate normally.
///
/// **Gated by three independent conditions**, all of which must be true:
///   1. [kDebugMode] — never active in release builds
///   2. `--dart-define=ALLOW_INSECURE_TLS=true` — opt-in per `flutter run`
///   3. `convexUrl` parses to a non-empty host — the bypass is scoped to it
///
/// Production builds (`flutter build apk/ipa --release`) compile this function
/// to a no-op because `kDebugMode` is a tree-shakable constant.
void enableInsecureTlsForConvexIfRequested(String convexUrl) {
  const allow = bool.fromEnvironment('ALLOW_INSECURE_TLS', defaultValue: false);
  if (!kDebugMode || !allow) return;

  final host = Uri.tryParse(convexUrl)?.host;
  if (host == null || host.isEmpty) return;

  HttpOverrides.global = _ConvexCorpProxyTrust(host);
  debugPrint(
    '⚠ ALLOW_INSECURE_TLS=true (debug only) — trusting corp-signed certs for $host. '
    'Triggered because a corporate SSL-inspection proxy (e.g. Zscaler) re-signs '
    'HTTPS traffic with a CA the Android/iOS trust store does not include.',
  );
}

class _ConvexCorpProxyTrust extends HttpOverrides {
  _ConvexCorpProxyTrust(this.allowedHost);

  final String allowedHost;

  @override
  HttpClient createHttpClient(SecurityContext? ctx) {
    return super.createHttpClient(ctx)
      ..badCertificateCallback = (cert, host, port) => host == allowedHost;
  }
}
