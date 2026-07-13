/// Avatar visual-regression tests — captures golden PNGs across every
/// meaningful Figma matrix combination.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';

import '../../support/components/avatar_harness.dart';

const _kAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // attention × appearance matrix (size=m, content=icon) — 24 baselines
  group('[golden] Avatar — appearance × attention matrix (size=m / icon)', () {
    for (final attention in OneUiAvatarAttention.values) {
      for (final app in _kAppearances) {
        testWidgets('${attention.name} / $app', (tester) async {
          await pumpAvatarQaHarnessSettled(
            tester,
            OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'User',
              attention: attention,
              appearance: app,
            ),
          );
          await expectLater(
            find.byType(OneUiAvatar),
            matchesGoldenFile('goldens/avatar_${attention.name}_$app.png'),
          );
        });
      }
    }
  });

  // Size sweep (appearance=primary / attention=medium / icon) — 7 baselines
  group('[golden] Avatar — size sweep (primary / medium / icon)', () {
    for (final size in ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl']) {
      testWidgets('size=$size', (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            size: size,
            appearance: 'primary',
            attention: OneUiAvatarAttention.medium,
          ),
        );
        await expectLater(
          find.byType(OneUiAvatar),
          matchesGoldenFile('goldens/avatar_size_$size.png'),
        );
      });
    }
  });

  // Content sweep at size=m — image / icon / text — 3 baselines
  group('[golden] Avatar — content sweep (size=m / primary / high)', () {
    testWidgets('content=text', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.text,
          alt: 'Swapnil Parab',
          appearance: 'primary',
          attention: OneUiAvatarAttention.high,
        ),
      );
      await expectLater(
        find.byType(OneUiAvatar),
        matchesGoldenFile('goldens/avatar_content_text.png'),
      );
    });

    testWidgets('content=icon', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'User',
          appearance: 'primary',
          attention: OneUiAvatarAttention.high,
        ),
      );
      await expectLater(
        find.byType(OneUiAvatar),
        matchesGoldenFile('goldens/avatar_content_icon.png'),
      );
    });
  });

  group('[golden] Avatar — disabled state', () {
    testWidgets('disabled=true / high / primary', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'User',
          appearance: 'primary',
          attention: OneUiAvatarAttention.high,
          disabled: true,
        ),
      );
      await expectLater(
        find.byType(OneUiAvatar),
        matchesGoldenFile('goldens/avatar_disabled_high.png'),
      );
    });

    testWidgets('disabled=true / medium / secondary', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'User',
          appearance: 'secondary',
          attention: OneUiAvatarAttention.medium,
          disabled: true,
        ),
      );
      await expectLater(
        find.byType(OneUiAvatar),
        matchesGoldenFile('goldens/avatar_disabled_medium.png'),
      );
    });
  });

  group('[golden] Avatar — customSize', () {
    testWidgets('customSize=56 / primary / high', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'User',
          size: 'custom',
          customSize: 56,
          appearance: 'primary',
          attention: OneUiAvatarAttention.high,
        ),
      );
      await expectLater(
        find.byType(OneUiAvatar),
        matchesGoldenFile('goldens/avatar_custom_56.png'),
      );
    });
  });
}
