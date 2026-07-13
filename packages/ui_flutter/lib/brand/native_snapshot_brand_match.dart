import '../engine/native_theme_snapshot.dart';

/// Convex may echo [NativeThemeSnapshot.brandId] as a plain id or `table/id` — tolerate both.
bool nativeSnapshotBrandMatchesSelection(
    NativeThemeSnapshot snap, String requestedBrandId) {
  final sid = snap.brandId?.trim();
  if (sid == null || sid.isEmpty) return true;
  if (requestedBrandId.isEmpty) return false;
  if (sid == requestedBrandId) return true;
  String lastSeg(String x) {
    final idx = x.lastIndexOf('/');
    return idx >= 0 && idx < x.length - 1 ? x.substring(idx + 1) : x;
  }

  return lastSeg(sid) == lastSeg(requestedBrandId);
}
