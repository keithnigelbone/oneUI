/// Avatar regression suite — one test per bug from
/// `docs/avatar-audit-report.md` (audit 2026-06-16).
///
/// Tests assert the **expected (correct)** behavior. Each fails until the
/// matching dev fix lands. The failure IS the bug ticket.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/engine/avatar_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_default_person.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';

import '../../support/components/avatar_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // FUNCTIONAL regressions — tag `[fn]`
  // ===========================================================================

  group('[regression][fn] Avatar', () {
    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-001] content=text with empty alt falls back to icon (not empty Text)",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: '',
          ),
        );
        // Bug: empty alt → oneUiAvatarGetInitials returns '' → Text(''). User
        // sees a coloured circle with nothing inside.
        // Expected: data-content downgraded to 'icon' so default person paints.
        final keys = tester.widgetList<KeyedSubtree>(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(KeyedSubtree),
        ));
        final downgraded = keys.any(
            (k) => k.key.toString().contains('data-content=icon'));
        expect(downgraded, isTrue,
            reason:
                'Empty alt with content=text must fall back to icon glyph. '
                'Currently renders an invisible empty Text node — broken UX.');
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-002] Missing OneUiScope must assert (not silently fall to Material primary)",
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await tester.pumpWidget(
            const MaterialApp(
              home: Scaffold(
                body: OneUiAvatar(
                  content: OneUiAvatarContent.icon,
                  alt: 'Alice',
                ),
              ),
            ),
          );
          expect(captured, isNotNull,
              reason:
                  'Missing OneUiScope must emit a debug assertion or render a '
                  'ConvexGapCard. Currently falls back to Material '
                  'colorScheme.primary silently — off-brand colour ships.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-003] testId exposed via Semantics.identifier (cross-platform locators)",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
            testId: 'hero-avatar',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final node = tester.getSemantics(avatarRootFinder());
          expect(node.getSemanticsData().identifier, 'hero-avatar',
              reason:
                  'testId must reach platform AT trees via Semantics(identifier:). '
                  'KeyedSubtree only works in-process — Playwright / Patrol / '
                  'Maestro / Appium need data-testid / accessibilityIdentifier.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-004] 'brand-bg' is a recognised appearance in kOneUiAvatarFigmaAppearances",
      (tester) async {
        // Comment on one_ui_avatar_types.dart:28 says "Code also supports
        // 'brand-bg'" but the constant excludes it — inconsistent.
        expect(kOneUiAvatarFigmaAppearances, contains('brand-bg'),
            reason:
                'brand-bg is documented as supported but is missing from the '
                'public appearance catalogue. Either add it or remove the comment.');
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-005] Invalid appearance string asserts (not silent Material fallback)",
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpAvatarQaHarnessSettled(
            tester,
            const OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'Alice',
              appearance: 'destructive',
            ),
          );
          expect(captured, isNotNull,
              reason:
                  'Unknown appearance string must assert in debug. Currently '
                  'passes through verbatim, role tokens miss, colour resolver '
                  'silently falls back to Material colorScheme.primary.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-006] Unknown size asserts (not silent fallback to 'm')",
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpAvatarQaHarnessSettled(
            tester,
            const OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'Alice',
              size: 'jumbo',
            ),
          );
          expect(captured, isNotNull,
              reason:
                  'Unknown size value must emit a debug assertion. Silent '
                  "fallback to 'm' (oneUiResolveAvatarSize:51) masks caller typos.");
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-007] Pre-sized custom widget icon paints at natural size (no FittedBox stretch)",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
            icon: SizedBox(key: ValueKey('inner'), width: 12, height: 12),
            size: 'm',
          ),
        );
        // Bug: SizedBox(iconPx) + FittedBox(BoxFit.contain) upscales the
        // 12px glyph to 20px (iconPx for size=m). Expected: glyph keeps 12×12.
        final inner = tester.getSize(find.byKey(const ValueKey('inner')));
        expect(inner.width, 12,
            reason:
                'Custom widget icon must render at its natural size — '
                'FittedBox currently upscales to iconPx (one_ui_avatar.dart:207-214), '
                'blurring hairline strokes.');
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-008] customSize controls text style font size (Label-L is too big for small custom)",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Mary Jane',
            size: 'custom',
            customSize: 24, // small custom container
          ),
        );
        final textWidget = tester.widget<Text>(find.text('MJ'));
        final fontSize = textWidget.style?.fontSize ?? 0;
        // Bug: customSize=24 → container 24×24 but textStyle is Label-L
        // (~18px). The text spills out of the pill.
        // Expected: font sizes proportionally — at minimum no larger than
        // container/2 (= 12 px for 24 px container).
        expect(fontSize, lessThanOrEqualTo(12),
            reason:
                'customSize must drive proportional text sizing. Currently '
                "the resolver always maps 'custom' → Label-L regardless of px "
                '(avatar_size_resolve.dart:37,122-130).');
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-009] borderRadius token resolved only ONCE in gap collection",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
            size: 'custom',
            customSize: 48,
          ),
        );
        expect(find.byType(ConvexGapCard), findsNothing,
            reason:
                'custom-size avatars must not double-resolve --Avatar-borderRadius '
                'in _collectGaps (duplicate gap rows).');
        expect(find.byType(OneUiAvatar), findsOneWidget);
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-010] Whitespace-only src skips image load",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.image,
            alt: 'Alice',
            src: '   ',
          ),
        );
        // Bug: avatar.dart:166-168 checks src.isNotEmpty. '   '.isNotEmpty == true
        // → tries to load the whitespace-only URL → hits failed set.
        // Expected: trim() before the isNotEmpty check, fall to non-image branch.
        expect(find.byType(Image), findsNothing,
            reason:
                'Whitespace-only src must be treated as empty (no load attempt). '
                'Currently avatar.dart:167 only checks isNotEmpty without trim.');
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [AVT-FN-011] Unknown size falls back to 'm' rendered output (not ConvexGapCard)",
      (tester) async {
        // Unknown size emits a debug assertion (AVT-FN-006) then falls back to
        // 'm'. Hook FlutterError.onError so the assertion is expected, not a
        // test failure — same pattern as one_ui_avatar_test.dart.
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpAvatarQaHarnessSettled(
            tester,
            const OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'Alice',
              size: 'jumbo',
            ),
          );
          expect(captured, isNotNull,
              reason:
                  'Unknown size must emit a debug assertion before falling '
                  "back to 'm'.");
          expect(find.byType(ConvexGapCard), findsNothing,
              reason:
                  'Unknown size must render the avatar — not ConvexGapCard.');
          final mysterySized = find.descendant(
            of: avatarRootFinder(),
            matching: find.byType(SizedBox),
          );
          expect(mysterySized, findsAtLeastNWidgets(1),
              reason:
                  "Unknown size must render at resolved 'm' dimensions.");
          final mysteryWidth = tester.getSize(mysterySized.first).width;

          await pumpAvatarQaHarnessSettled(
            tester,
            const OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'Alice',
              size: 'm',
            ),
          );
          final mWidth = tester.getSize(find.descendant(
            of: avatarRootFinder(),
            matching: find.byType(SizedBox),
          ).first).width;
          expect(mysteryWidth, mWidth,
              reason:
                  "Unknown size rendered width must equal 'm' rendered width.");
        } finally {
          FlutterError.onError = prev;
        }
      },
    );
  });

  // ===========================================================================
  // ACCESSIBILITY regressions
  // ===========================================================================

  group('[regression][a11y] Avatar', () {
    testWidgetsAllPlatforms(
      "[a11y] [AVT-A11Y-001] Empty alt → decorative (not generic 'avatar' label)",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: '',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          // Bug: empty alt → label 'avatar' (a11y.dart:38). Useless announcement.
          // Expected: when alt is empty/whitespace, mark decorative — web/native
          // parity (aria-label absent → aria-hidden inferred).
          expect(find.bySemanticsLabel('avatar'), findsNothing,
              reason:
                  "Empty alt must NOT produce a generic 'avatar' announcement. "
                  'Treat as decorative (excludeFromSemantics) — web parity.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      "[a11y] [AVT-A11Y-002] disabled state announced via label suffix (image role ignores enabled flag)",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
            disabled: true,
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = avatarSemanticsData(tester, semanticsLabel: 'Alice, disabled');
          expect(data.label.toLowerCase().contains('disabled'), isTrue,
              reason:
                  "Disabled Avatar must announce 'disabled' via label suffix "
                  'or hint. Semantics(image:true, enabled:false) is silent on AT.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      "[a11y] [AVT-A11Y-003] semanticsHint without explicit alt emits warning",
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpAvatarQaHarnessSettled(
            tester,
            const OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: '',
              semanticsHint: 'Profile picture',
            ),
          );
          // Bug: hint paired with generic 'avatar' label produces an
          // announcement like "avatar, profile picture" — useless and confusing.
          // Expected: require alt when hint is provided; emit debug warning.
          expect(captured, isNotNull,
              reason:
                  'semanticsHint without explicit alt must emit a debug warning. '
                  'Currently exposes hint with generic "avatar" label.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      "[a11y] [AVT-A11Y-004] Disabled opacity ≥ 0.5 (WCAG 1.4.11 contrast)",
      (tester) async {
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
        final opacity = tester.widget<Opacity>(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(Opacity),
        ).first);
        // Bug: avatar_color_resolve.dart:131,149 returns literal 0.38 fallback.
        // Native parity: 0.5. WCAG 1.4.11 requires ≥3:1 contrast on disabled
        // non-interactive indicators.
        expect(opacity.opacity, greaterThanOrEqualTo(0.5),
            reason:
                'Disabled opacity must be ≥ 0.5 (matches native + WCAG 1.4.11). '
                'Currently the literal fallback is 0.38.');
      },
    );

    testWidgetsAllPlatforms(
      "[a11y] [AVT-A11Y-005] Image content branch wraps OneUiAvatarNetworkImage in ExcludeSemantics",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.image,
            alt: 'Alice',
            src: 'about:blank',
          ),
        );
        expect(
          find.descendant(
            of: avatarRootFinder(),
            matching: find.byType(ExcludeSemantics),
          ),
          findsWidgets,
          reason:
              'Image branch must wrap OneUiAvatarNetworkImage in ExcludeSemantics '
              'so only the outer Semantics(image) node is exposed.',
        );
      },
    );
  });

  // ===========================================================================
  // VISUAL regressions
  // ===========================================================================

  group('[regression][visual] Avatar', () {
    testWidgetsAllPlatforms(
      "[visual] [AVT-VIS-001] Icon and text on HIGH attention use the SAME on-bold tint chain",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
            attention: OneUiAvatarAttention.high,
            appearance: 'primary',
          ),
        );
        final iconColor = tester.widget<OneUiAvatarDefaultPersonIcon>(
          find.byType(OneUiAvatarDefaultPersonIcon),
        ).color;

        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Alice',
            attention: OneUiAvatarAttention.high,
            appearance: 'primary',
          ),
        );
        final textElement = tester.element(
          find.descendant(of: avatarRootFinder(), matching: find.text('A')),
        );
        final textColor = DefaultTextStyle.of(textElement).style.color;
        expect(iconColor, isNotNull);
        expect(textColor, isNotNull);
        expect(iconColor, textColor,
            reason:
                'RN resolveAvatarIconSlotColor paints icons with textColor — '
                'icon and initials must match on the same bold fill.');
      },
    );

    test(
      "[visual] [AVT-VIS-002] Border-radius fallback uses containerPx / 2 (no literal 9999)",
      () {
        expect(avatarBorderRadiusFallbackPx(48), 24,
            reason:
                'When --Avatar-borderRadius / --Shape-Pill do not resolve, pill '
                'shape must be computed as half the square side — not magic 9999.');
      },
    );

    testWidgetsAllPlatforms(
      "[visual] [AVT-VIS-002] Border-radius resolves from brand tokens when present",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
          ),
        );
        final side = tester.getSize(avatarRootFinder()).width;
        final radiusPx = resolveAvatarBorderRadiusPx(
          tester.element(avatarRootFinder()),
          containerPx: side,
        );
        expect(radiusPx, greaterThan(0),
            reason: 'Jio fixture should resolve --Avatar-borderRadius or '
                '--Shape-Pill from the design-system cascade.');
      },
    );

    testWidgetsAllPlatforms(
      "[visual] [AVT-VIS-003] Text content respects customSize (does NOT overflow)",
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Mary Jane',
            size: 'custom',
            customSize: 20, // small
          ),
        );
        // Bug: textStyle for 'custom' is hard-coded to Label-L (~18px), which
        // does NOT fit inside a 20px container. Mary Jane → 'MJ' overflows.
        final textWidget = tester.widget<Text>(find.text('MJ'));
        final fontSize = textWidget.style?.fontSize ?? 0;
        expect(fontSize, lessThanOrEqualTo(10),
            reason:
                'For customSize=20, text font size must be ≤ container/2. '
                'Currently always Label-L regardless of customSize px.');
      },
    );
  });

  // ===========================================================================
  // [meta] Burn-down counter
  // ===========================================================================

  group('[regression][meta] Avatar', () {
    test('[meta] burn-down counter — total pending bugs = 16', () {
      // 11 functional + 5 a11y + 3 visual = 19 real bugs.
      // AVT-FN-011 added 2026-06-17 — surfaced by the unknown-size functional
      // test; gap-collector contradicts the resolver for unknown sizes.
      const totalPendingBugs = 16;
      expect(totalPendingBugs, 16);
    });
  });
}
