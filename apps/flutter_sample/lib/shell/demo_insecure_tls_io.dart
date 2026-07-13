import 'dart:io';

import 'package:flutter/foundation.dart';

/// Debug-only TLS bypass for corporate SSL-inspection proxies on mobile/desktop.
///
/// Scoped to Convex + demo image/CDN hosts only (not a global trust-all).
void enableDemoInsecureTlsIfRequested(String convexUrl) {
  const allow = bool.fromEnvironment('ALLOW_INSECURE_TLS', defaultValue: false);
  if (!kDebugMode || !allow) return;

  final hosts = <String>{
    'cdn1.jiomartjcp.com',
    'images.unsplash.com',
    'myjiostatic.cdn.jio.com',
  };
  final convexHost = Uri.tryParse(convexUrl)?.host;
  if (convexHost != null && convexHost.isNotEmpty) {
    hosts.add(convexHost);
  }

  HttpOverrides.global = _DemoCorpProxyTrust(hosts);
  debugPrint(
    '⚠ ALLOW_INSECURE_TLS=true (debug) — trusting corp-signed certs for: ${hosts.join(', ')}',
  );
}

class _DemoCorpProxyTrust extends HttpOverrides {
  _DemoCorpProxyTrust(this.allowedHosts);

  final Set<String> allowedHosts;

  @override
  HttpClient createHttpClient(SecurityContext? ctx) {
    return super.createHttpClient(ctx)
      ..badCertificateCallback = (cert, host, port) => allowedHosts.contains(host);
  }
}
