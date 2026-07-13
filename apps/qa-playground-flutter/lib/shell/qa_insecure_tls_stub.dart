/// Web build target: no `dart:io` available, no [HttpOverrides] to install.
/// Browser HTTPS goes through the OS / browser trust store, which already
/// trusts corporate inspection CAs (Zscaler, Netskope) if the user added them
/// to their system keychain. Nothing to do here.
void enableInsecureTlsForConvexIfRequested(String convexUrl) {}
