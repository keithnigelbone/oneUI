/// Avatar visual-regression tests — DARK MODE.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';

import '../../support/components/avatar_harness.dart';

const _kDarkAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][dark] Avatar — attention × appearance (dark)', () {
    for (final attention in OneUiAvatarAttention.values) {
      for (final app in _kDarkAppearances) {
        testWidgets('${attention.name} / $app (dark)', (tester) async {
          await pumpAvatarQaHarnessSettled(
            tester,
            OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'User',
              attention: attention,
              appearance: app,
            ),
            darkMode: true,
          );
          await expectLater(
            find.byType(OneUiAvatar),
            matchesGoldenFile(
                'goldens/dark/avatar_dark_${attention.name}_$app.png'),
          );
        });
      }
    }
  });
}
