/// Storybook re-exports — prefer `package:ui_flutter/brand/design_system_normalize.dart`.
library;

export 'package:ui_flutter/brand/design_system_normalize.dart';

import 'package:ui_flutter/brand/design_system_normalize.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';

NativeDesignSystemPayload normalizeStorybookSolidHighAttention(NativeDesignSystemPayload ds) {
  return normalizeSolidHighAttention(ds);
}

NativeDesignSystemPayload normalizeStorybookTiraRetailCapsuleButtons(
  NativeDesignSystemPayload ds, {
  required String? slug,
  required String? name,
}) {
  return normalizeTiraRetailCapsuleButtons(ds, slug: slug, name: name);
}
