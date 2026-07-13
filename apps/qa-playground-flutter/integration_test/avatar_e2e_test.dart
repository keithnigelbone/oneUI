/// Avatar — on-device integration tests.
///
/// Renders [OneUiAvatar] on the connected emulator / simulator using the
/// same harness widget tests use, exercising real engine behaviour:
///   - real surface-context token remapping
///   - real network image load (Unsplash sample URL) on Android/iOS/desktop
///     and platform-view <img> on Flutter Web
///   - real Semantics announcement (TalkBack/VoiceOver)
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';

import '../test/support/components/avatar_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('Avatar — on-device', () {
    testWidgets('[e2e] default renders pill container', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'Alice',
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiAvatar), findsOneWidget);
    });

    testWidgets(
        '[e2e] all sizes render at strictly increasing dimensions (2xs<xs<s<m<l<xl<2xl)',
        (tester) async {
      final sizes = <String, double>{};
      for (final size in ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl']) {
        await pumpAvatarQaHarnessSettled(
          tester,
          OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
            size: size,
          ),
        );
        await _hold(tester, _demoMode ? 600 : 0);
        // Measure the outer SizedBox emitted by OneUiAvatar with containerPx.
        // Works regardless of which inner glyph path renders (Jio SVG, default
        // person silhouette, or initials Text).
        final shellBox = find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(SizedBox),
        ).first;
        sizes[size] = tester.getSize(shellBox).width;
      }
      expect(sizes.length, 7,
          reason: 'all 7 requested sizes must report a measurable width');
      expect(sizes['2xs']!, lessThan(sizes['xs']!));
      expect(sizes['xs']!, lessThan(sizes['s']!));
      expect(sizes['s']!, lessThan(sizes['m']!));
      expect(sizes['m']!, lessThan(sizes['l']!));
      expect(sizes['l']!, lessThan(sizes['xl']!));
      expect(sizes['xl']!, lessThan(sizes['2xl']!));
    });

    testWidgets('[e2e] each attention level renders distinctly', (tester) async {
      for (final attention in OneUiAvatarAttention.values) {
        await pumpAvatarQaHarnessSettled(
          tester,
          OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice ${attention.name}',
            attention: attention,
          ),
        );
        await _hold(tester);
        expect(find.byType(OneUiAvatar), findsOneWidget);
      }
    });

    testWidgets('[e2e] each appearance renders distinctly', (tester) async {
      for (final app in ['neutral', 'primary', 'negative', 'positive', 'sparkle']) {
        await pumpAvatarQaHarnessSettled(
          tester,
          OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: '$app avatar',
            appearance: app,
          ),
        );
        await _hold(tester);
        expect(find.byType(OneUiAvatar), findsOneWidget);
      }
    });

    testWidgets('[e2e] content=text renders initials from alt', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.text,
          alt: 'Swapnil Parab',
        ),
      );
      await _hold(tester, 2000);
      expect(find.text('SP'), findsOneWidget);
    });

    testWidgets('[e2e] content=text downgraded to icon at 2xs', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.text,
          alt: 'Swapnil Parab',
          size: '2xs',
        ),
      );
      await _hold(tester);
      // Initials must NOT be visible at 2xs — text content downgraded to icon.
      expect(find.text('SP'), findsNothing);
    });

    testWidgets('[e2e] disabled state dims the avatar', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'Alice',
          appearance: 'primary',
          attention: OneUiAvatarAttention.high,
          disabled: true,
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiAvatar), findsOneWidget);
    });

    testWidgets('[e2e] avatar inside Surface auto-adapts colour', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'Alice',
          appearance: 'auto',
          attention: OneUiAvatarAttention.high,
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'positive',
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiAvatar), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode avatar renders without contrast holes',
        (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'Alice',
          appearance: 'primary',
          attention: OneUiAvatarAttention.high,
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiAvatar), findsOneWidget);
    });

    testWidgets('[e2e] image content from real URL loads (Unsplash sample)',
        (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.image,
          alt: 'Alice',
          src: kOneUiAvatarSampleImageUrl,
          size: 'xl',
        ),
      );
      // Real network — give it time to fetch + decode.
      await tester.pump(const Duration(seconds: 4));
      await _hold(tester, 2000);
      expect(find.byType(OneUiAvatar), findsOneWidget);
    });

    testWidgets('[e2e] empty alt avatar still renders (does NOT crash)',
        (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: '',
        ),
      );
      await _hold(tester);
      expect(find.byType(OneUiAvatar), findsOneWidget);
    });

    testWidgets('[e2e] labelled avatar exposes label in AT tree',
        (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'Alice',
        ),
      );
      await _hold(tester, 2000);
      expect(find.bySemanticsLabel('Alice'), findsOneWidget);
    });

    testWidgets('[e2e] testId locator works in-process', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'Alice',
          testId: 'qa-hero',
        ),
      );
      await _hold(tester);
      expect(find.byKey(const ValueKey('qa-hero')), findsOneWidget);
    });
  });
}
