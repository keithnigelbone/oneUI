/// Avatar functional QA tests — mirrors web `Avatar.tsx` and the Figma matrix
/// (8 sizes × 3 attentions × 9 appearances × 3 content types × disabled).
///
/// Validates ACTUAL behaviour:
///   - `tester.getSize` measures the rendered container + glyph dimensions.
///   - Disabled state asserted via Opacity widget inspection.
///   - Appearance / size / attention / content resolution asserted via the
///     data-attribute key the widget actually emits.
///   - Initials extraction validated against ACTUAL Text widget output.
///   - Surface inheritance read off the resolved data-appearance string.
///   - Image error fallback exercised by passing an empty / bogus src.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';

import '../../support/components/avatar_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // Smoke — renders without crashing across the Figma matrix
  // ===========================================================================

  group('[smoke] Avatar — renders without crashing', () {
    testWidgetsAllPlatforms('[smoke] default renders', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(alt: 'User'),
      );
      expect(find.byType(OneUiAvatar), findsOneWidget);
    });

    for (final size in kOneUiAvatarSizes.where((s) => s != 'custom')) {
      testWidgetsAllPlatforms('[smoke] size="$size" renders', (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            size: size,
          ),
        );
        expect(find.byType(OneUiAvatar), findsOneWidget);
      });
    }

    for (final attention in OneUiAvatarAttention.values) {
      testWidgetsAllPlatforms('[smoke] attention=${attention.name} renders',
          (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            attention: attention,
          ),
        );
        expect(find.byType(OneUiAvatar), findsOneWidget);
      });
    }

    for (final app in kOneUiAvatarFigmaAppearances) {
      testWidgetsAllPlatforms('[smoke] appearance="$app" renders', (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            appearance: app,
          ),
        );
        expect(find.byType(OneUiAvatar), findsOneWidget);
      });
    }

    for (final content in OneUiAvatarContent.values) {
      testWidgetsAllPlatforms('[smoke] content=${content.name} renders',
          (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          OneUiAvatar(
            content: content,
            alt: 'Swapnil Parab',
          ),
        );
        expect(find.byType(OneUiAvatar), findsOneWidget);
      });
    }
  });

  // ===========================================================================
  // Size — measure ACTUAL rendered dimensions, not just smoke
  // ===========================================================================

  group('[functional] Avatar — size honours token (not just smoke)', () {
    Future<Size> renderContainerSize(WidgetTester tester, String size) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'User',
          size: size,
        ),
      );
      // The outermost SizedBox wraps the body at exact `containerPx × containerPx`.
      final box = find.descendant(
        of: avatarRootFinder(),
        matching: find.byType(SizedBox),
      ).first;
      return tester.getSize(box);
    }

    testWidgetsAllPlatforms(
      '[fn] 2xs < xs < s < m < l < xl < 2xl (strict ordering)',
      (tester) async {
        final dims = <String, double>{};
        for (final size in ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl']) {
          dims[size] = (await renderContainerSize(tester, size)).width;
        }
        expect(dims['2xs']!, lessThan(dims['xs']!),
            reason: '2xs must render strictly smaller than xs');
        expect(dims['xs']!, lessThan(dims['s']!));
        expect(dims['s']!, lessThan(dims['m']!));
        expect(dims['m']!, lessThan(dims['l']!));
        expect(dims['l']!, lessThan(dims['xl']!));
        expect(dims['xl']!, lessThan(dims['2xl']!));
      },
    );

    testWidgetsAllPlatforms(
      '[fn] container is square (width == height) for every size',
      (tester) async {
        for (final size in ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl']) {
          final dim = await renderContainerSize(tester, size);
          expect(dim.width, dim.height,
              reason: 'Avatar at size=$size must be square (circular pill)');
        }
      },
    );

    // NOTE: "unknown size falls back to m" lives in the regression suite as
    // [AVT-FN-011] — the rendered avatar contradicts the resolver because
    // `_collectGaps` runs on raw `widget.size` and adds a gap for the missing
    // `--Avatar-iconSize-jumbo` (no `m` fallback in that cascade), so the
    // component renders `ConvexGapCard` instead of the 40 px `m` avatar.

    testWidgetsAllPlatforms(
      '[fn] customSize honoured when size="custom"',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            size: 'custom',
            customSize: 56,
          ),
        );
        final box = find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(SizedBox),
        ).first;
        expect(tester.getSize(box).width, 56,
            reason: 'customSize must control container px exactly');
      },
    );
  });

  // ===========================================================================
  // Shape — pill (circular)
  // ===========================================================================

  group('[functional] Avatar — border radius (pill)', () {
    testWidgetsAllPlatforms(
      '[fn] DecoratedBox shape is pill (radius ≥ side/2) for non-image content',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Swapnil Parab',
          ),
        );
        // Container is 40 px at size=m; pill needs ≥ 20 px radius.
        final decorated = tester.widget<DecoratedBox>(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(DecoratedBox),
        ));
        final dec = decorated.decoration as BoxDecoration;
        final radius = dec.borderRadius?.resolve(TextDirection.ltr).topLeft.x ?? 0;
        expect(radius, greaterThanOrEqualTo(20),
            reason: 'Avatar must be pill-shaped (radius ≥ side/2)');
      },
    );
  });

  // ===========================================================================
  // Content resolution
  // ===========================================================================

  group('[functional] Avatar — content resolution', () {
    testWidgetsAllPlatforms(
      '[fn] content=text at size=m renders initials from alt',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Swapnil Parab',
          ),
        );
        expect(find.text('SP'), findsOneWidget,
            reason: 'Text content must render uppercase initials from alt');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] content=text single-word alt → single initial',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Madonna',
          ),
        );
        expect(find.text('M'), findsOneWidget,
            reason: 'Single-word alt must render single uppercase initial');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] content=text three-word alt → first 2 initials',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Mary Jane Watson',
          ),
        );
        expect(find.text('MJ'), findsOneWidget,
            reason: 'Multi-word alt must take only the first 2 word initials');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] content=text at 2xs forced → icon (text unreadable at 16 px)',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Swapnil Parab',
            size: '2xs',
          ),
        );
        // Bug-free behaviour: data-content must end up "icon" not "text".
        final keys = tester.widgetList<KeyedSubtree>(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(KeyedSubtree),
        ));
        final hasIconKey = keys.any(
            (k) => k.key.toString().contains('data-content=icon'));
        expect(hasIconKey, isTrue,
            reason: 'Text content at 2xs must be downgraded to icon (resolver guard)');
        // SP must NOT be visible — it was downgraded to icon glyph.
        expect(find.text('SP'), findsNothing);
      },
    );

    testWidgetsAllPlatforms(
      '[fn] content=text at xs forced → icon (text unreadable at 20 px)',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Swapnil Parab',
            size: 'xs',
          ),
        );
        final keys = tester.widgetList<KeyedSubtree>(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(KeyedSubtree),
        ));
        final hasIconKey = keys.any(
            (k) => k.key.toString().contains('data-content=icon'));
        expect(hasIconKey, isTrue);
        expect(find.text('SP'), findsNothing);
      },
    );

    testWidgetsAllPlatforms(
      '[fn] content=image with empty src → falls through to non-image branch',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.image,
            alt: 'User',
            src: '',
          ),
        );
        // No NetworkImage in the tree because src is empty.
        expect(find.byType(Image), findsNothing,
            reason: 'Empty src must not attempt an image load');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] content=icon uses default person silhouette when icon prop is null',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
          ),
        );
        // Body must contain a DecoratedBox (the fill); the inner is the default
        // person SVG. Just assert the no-text branch is taken.
        expect(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(DecoratedBox),
        ), findsAtLeastNWidgets(1));
        expect(find.text('U'), findsNothing,
            reason: 'content=icon must not render initials');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] custom widget icon renders',
      (tester) async {
        const customKey = ValueKey('custom-glyph');
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            icon: SizedBox(key: customKey, width: 12, height: 12),
          ),
        );
        expect(find.byKey(customKey), findsOneWidget);
      },
    );
  });

  // ===========================================================================
  // Appearance resolution — data-appearance key reflects the resolver outcome
  // ===========================================================================

  group('[functional] Avatar — appearance resolution', () {
    testWidgetsAllPlatforms(
      '[fn] appearance=auto outside Surface resolves to "primary"',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            appearance: 'auto',
          ),
        );
        final keys = tester.widgetList<KeyedSubtree>(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(KeyedSubtree),
        ));
        final hasPrimaryKey = keys.any(
            (k) => k.key.toString().contains('data-appearance=primary'));
        expect(hasPrimaryKey, isTrue,
            reason: 'appearance=auto outside Surface must resolve to "primary"');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] appearance=auto inside Surface(appearance: negative) inherits "negative"',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            appearance: 'auto',
          ),
          surfaceMode: 'subtle',
          surfaceAppearance: 'negative',
        );
        final keys = tester.widgetList<KeyedSubtree>(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(KeyedSubtree),
        ));
        final hasNegativeKey = keys.any(
            (k) => k.key.toString().contains('data-appearance=negative'));
        expect(hasNegativeKey, isTrue,
            reason: 'auto inside Surface must inherit the parent appearance');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] explicit appearance wins over Surface inheritance',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            appearance: 'positive',
          ),
          surfaceMode: 'subtle',
          surfaceAppearance: 'negative',
        );
        final keys = tester.widgetList<KeyedSubtree>(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(KeyedSubtree),
        ));
        final hasPositive = keys.any(
            (k) => k.key.toString().contains('data-appearance=positive'));
        expect(hasPositive, isTrue,
            reason: 'Explicit appearance must override Surface inheritance');
      },
    );

    for (final app in kOneUiAvatarFigmaAppearances) {
      testWidgetsAllPlatforms(
        '[fn] explicit appearance="$app" encoded in data key',
        (tester) async {
          await pumpAvatarQaHarnessSettled(
            tester,
            OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'User',
              appearance: app,
            ),
          );
          final keys = tester.widgetList<KeyedSubtree>(find.descendant(
            of: avatarRootFinder(),
            matching: find.byType(KeyedSubtree),
          ));
          final hasMatch = keys.any(
              (k) => k.key.toString().contains('data-appearance=$app'));
          expect(hasMatch, isTrue,
              reason: 'Resolver must echo explicit appearance into data key');
        },
      );
    }
  });

  // ===========================================================================
  // Attention — encoded in key
  // ===========================================================================

  group('[functional] Avatar — attention encoded', () {
    for (final attention in OneUiAvatarAttention.values) {
      testWidgetsAllPlatforms(
        '[fn] attention=${attention.name} in data key',
        (tester) async {
          await pumpAvatarQaHarnessSettled(
            tester,
            OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'User',
              attention: attention,
            ),
          );
          final keys = tester.widgetList<KeyedSubtree>(find.descendant(
            of: avatarRootFinder(),
            matching: find.byType(KeyedSubtree),
          ));
          final hasMatch = keys.any((k) =>
              k.key.toString().contains('data-attention=${attention.name}'));
          expect(hasMatch, isTrue);
        },
      );
    }
  });

  // ===========================================================================
  // Disabled state
  // ===========================================================================

  group('[functional] Avatar — disabled state', () {
    testWidgetsAllPlatforms('[fn] disabled=true applies Opacity<1', (tester) async {
      await pumpAvatarQaHarnessSettled(
        tester,
        const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'User',
          disabled: true,
        ),
      );
      final opacity = tester.widget<Opacity>(find.descendant(
        of: avatarRootFinder(),
        matching: find.byType(Opacity),
      ).first);
      expect(opacity.opacity, lessThan(1.0),
          reason: 'disabled=true must apply opacity < 1');
    });

    testWidgetsAllPlatforms(
      '[fn] disabled=false renders full opacity',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
          ),
        );
        final opacity = tester.widget<Opacity>(find.descendant(
          of: avatarRootFinder(),
          matching: find.byType(Opacity),
        ).first);
        expect(opacity.opacity, 1.0);
      },
    );
  });

  // ===========================================================================
  // testId
  // ===========================================================================

  group('[functional] Avatar — testId', () {
    testWidgetsAllPlatforms(
      '[fn] testId attaches a ValueKey at the outer subtree',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            testId: 'qa-avatar',
          ),
        );
        expect(find.byKey(const ValueKey('qa-avatar')), findsOneWidget);
      },
    );

    testWidgetsAllPlatforms(
      '[fn] whitespace-only testId is ignored',
      (tester) async {
        await pumpAvatarQaHarnessSettled(
          tester,
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            testId: '   ',
          ),
        );
        expect(find.byKey(const ValueKey('   ')), findsNothing);
      },
    );
  });

  // ===========================================================================
  // Initials extraction — pure resolver
  // ===========================================================================

  group('[functional] Avatar — initials extraction', () {
    test('[fn] full name → 2-char uppercase', () {
      expect(oneUiAvatarGetInitials('Swapnil Parab'), 'SP');
    });
    test('[fn] single name → 1-char uppercase', () {
      expect(oneUiAvatarGetInitials('Madonna'), 'M');
    });
    test('[fn] 3-word name → first 2 initials uppercase', () {
      expect(oneUiAvatarGetInitials('Mary Jane Watson'), 'MJ');
    });
    test('[fn] leading / trailing whitespace stripped', () {
      expect(oneUiAvatarGetInitials('  Swapnil   Parab  '), 'SP');
    });
    test('[fn] empty alt → empty initials', () {
      expect(oneUiAvatarGetInitials(''), '');
    });
    test('[fn] whitespace-only alt → empty initials', () {
      expect(oneUiAvatarGetInitials('   '), '');
    });
    test('[fn] already-uppercase initials preserved', () {
      expect(oneUiAvatarGetInitials('SP'), 'S');
    });
    test('[fn] non-latin initials preserved', () {
      expect(oneUiAvatarGetInitials('क ख'), 'क ख'.split(' ').map((p) => p[0]).take(2).join().toUpperCase());
    });
  });

  // ===========================================================================
  // Size validation
  // ===========================================================================

  group('[functional] Avatar — size validation', () {
    test('[fn] canonical sizes round-trip', () {
      for (final s in kOneUiAvatarSizes) {
        expect(oneUiResolveAvatarSize(s), s);
      }
    });
    test('[fn] mixed case normalised to lowercase', () {
      expect(oneUiResolveAvatarSize('XS'), 'xs');
      expect(oneUiResolveAvatarSize('2XL'), '2xl');
    });
    test('[fn] unknown falls back to m', () {
      expect(oneUiResolveAvatarSize('gigantic'), 'm');
    });
  });
}
