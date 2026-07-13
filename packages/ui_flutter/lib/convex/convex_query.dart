/// Convex HTTP envelopes use `{"status":"success","value": ... }`.
///
/// Nested JSON objects from [jsonDecode] are often `Map<dynamic,dynamic>`; normalize to
/// `Map<String,dynamic>` so parsers that expect string keys are not skipped.
Map<String, dynamic>? convexQuerySuccessValue(Object? raw) {
  if (raw == null || raw is! Map) return null;
  return Map<String, dynamic>.from(raw);
}
