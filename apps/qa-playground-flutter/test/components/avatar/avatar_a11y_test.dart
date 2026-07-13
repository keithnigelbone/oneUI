/// Avatar accessibility QA tests — mirrors web `role="img"` + `aria-label`
/// and the resolver contract from `one_ui_avatar_a11y.dart`.
///
/// Validates ACTUAL Semantics tree state, not just resolver returns. The
/// exposed Semantics node must carry `isImage` flag (web role="img"), the
/// resolved label, the optional hint and the `enabled` flag mirroring
/// `disabled`.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';

import '../../support/components/avatar_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // Pure resolver tests
  // ===========================================================================

  group('[a11y] resolveOneUiAvatarSemantics', () {
    test('[a11y] explicit alt becomes label', () {
      final cfg = resolveOneUiAvatarSemantics(alt: 'Jane Doe', isDisabled: false);
      expect(cfg.label, 'Jane Doe');
      expect(cfg.exposed, isTrue);
      expect(cfg.enabled, isTrue);
      expect(cfg.hint, isNull);
    });

    test('[a11y] empty alt is decorative (not exposed)', () {
      final cfg = resolveOneUiAvatarSemantics(alt: '', isDisabled: false);
      expect(cfg.exposed, isFalse);
      expect(cfg.label, isEmpty);
    });

    test('[a11y] whitespace-only alt is decorative', () {
      final cfg = resolveOneUiAvatarSemantics(alt: '   ', isDisabled: false);
      expect(cfg.exposed, isFalse);
    });

    test('[a11y] disabled appends suffix to label', () {
      final cfg = resolveOneUiAvatarSemantics(alt: 'Alice', isDisabled: true);
      expect(cfg.label, 'Alice, disabled');
      expect(cfg.exposed, isTrue);
    });

    test('[a11y] excludeFromSemantics → exposed:false (subtree hidden)', () {
      final cfg = resolveOneUiAvatarSemantics(
        alt: 'Hidden',
        isDisabled: false,
        excludeFromSemantics: true,
      );
      expect(cfg.exposed, isFalse);
    });

    test('[a11y] hint passed through when non-empty', () {
      final cfg = resolveOneUiAvatarSemantics(
        alt: 'Alice',
        isDisabled: false,
        semanticsHint: 'Profile picture',
      );
      expect(cfg.hint, 'Profile picture');
    });

    test('[a11y] whitespace-only hint normalised to null', () {
      final cfg = resolveOneUiAvatarSemantics(
        alt: 'Alice',
        isDisabled: false,
        semanticsHint: '   ',
      );
      expect(cfg.hint, isNull);
    });

    test('[a11y] excludeFromSemantics defeats hint AND label', () {
      final cfg = resolveOneUiAvatarSemantics(
        alt: 'Alice',
        isDisabled: false,
        semanticsHint: 'Decorative',
        excludeFromSemantics: true,
      );
      expect(cfg.exposed, isFalse);
      expect(cfg.hint, isNull);
    });
  });

  // ===========================================================================
  // Widget Semantics tree tests — actual behaviour
  // ===========================================================================

  group('[a11y] Avatar widget — labelled', () {
    testWidgetsAllPlatforms(
      '[a11y] alt exposes Semantics(image: true, label: alt)',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Swapnil Parab',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('Swapnil Parab'), findsOneWidget);
          final data = avatarSemanticsData(tester, semanticsLabel: 'Swapnil Parab');
          expect(data.hasFlag(SemanticsFlag.isImage), isTrue,
              reason: 'labelled Avatar must expose isImage flag (web role="img")');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] hint forwarded to AT',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
            semanticsHint: 'Profile picture',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = avatarSemanticsData(tester, semanticsLabel: 'Alice');
          expect(data.hint, contains('Profile picture'));
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] disabled flips isEnabled flag on the Semantics node',
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
          expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
          expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse,
              reason: 'disabled=true must clear isEnabled flag');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] non-disabled Avatar exposes isEnabled flag',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = avatarSemanticsData(tester, semanticsLabel: 'Alice');
          expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] labelled Avatar does NOT expose isButton or tap action',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = avatarSemanticsData(tester, semanticsLabel: 'Alice');
          expect(data.hasFlag(SemanticsFlag.isButton), isFalse,
              reason: 'Avatar is non-interactive');
          expect(data.hasAction(SemanticsAction.tap), isFalse);
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] labelled Avatar is NOT focusable (no tab stop on Flutter Web)',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = avatarSemanticsData(tester, semanticsLabel: 'Alice');
          expect(data.hasFlag(SemanticsFlag.isFocusable), isFalse,
              reason: 'image role has no tabindex — keyboard skips it');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] inner content (initials Text) excluded — no double announce',
      (tester) async {
        // OneUiAvatar wraps inner Text in ExcludeSemantics so initials are
        // never announced separately from the outer label.
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Jane Doe',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          // Outer label "Jane Doe" exposed exactly once.
          expect(find.bySemanticsLabel('Jane Doe'), findsOneWidget);
          // Initials "JD" must NOT surface as a separate node.
          expect(find.bySemanticsLabel('JD'), findsNothing);
        } finally {
          handle.dispose();
        }
      },
    );
  });

  group('[a11y] Avatar widget — excludeFromSemantics', () {
    testWidgetsAllPlatforms(
      '[a11y] excludeFromSemantics=true hides Avatar from AT',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Jane Doe',
            excludeFromSemantics: true,
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('Jane Doe'), findsNothing,
              reason: 'excludeFromSemantics=true must hide the Avatar from AT');
        } finally {
          handle.dispose();
        }
      },
    );
  });
}
