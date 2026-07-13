/// Avatar visual-regression tests — INSIDE SURFACE.
///
/// Validates that `appearance: 'auto'` properly inherits Surface context and
/// remaps tokens. Each baseline is the auto-resolved avatar against the
/// parent Surface.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';

import '../../support/components/avatar_harness.dart';

const _kSurfaceModes = <String>['subtle', 'bold'];
const _kSurfaceAppearances = <String>['primary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][surface] Avatar — appearance:auto inherits surface', () {
    for (final mode in _kSurfaceModes) {
      for (final app in _kSurfaceAppearances) {
        testWidgets('mode=$mode / appearance=$app', (tester) async {
          await pumpAvatarQaHarnessSettled(
            tester,
            const OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'User',
              appearance: 'auto',
              attention: OneUiAvatarAttention.high,
            ),
            surfaceMode: mode,
            surfaceAppearance: app,
          );
          await expectLater(
            find.byType(OneUiAvatar),
            matchesGoldenFile('goldens/surface/avatar_surface_${mode}_$app.png'),
          );
        });
      }
    }
  });
}
