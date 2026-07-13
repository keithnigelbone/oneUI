/// Functional + a11y tests — `Avatar.test.tsx` / RN `avatarA11y.test.ts` parity.
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/avatar_color_resolve.dart';
import 'package:ui_flutter/engine/avatar_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_default_person.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';
import 'package:ui_flutter/widgets/one_ui_slot_parent_appearance.dart';

const _kAllAppearances = [
  'primary',
  'neutral',
  'secondary',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

NativeDesignSystemPayload _avatarDesignSystem(
    {Map<String, String>? sizeOverrides}) {
  final props = <String, dynamic>{
    '--Avatar-borderRadius': '9999px',
    '--Disabled-Opacity': '0.38',
  };
  final sizes = {
    '2xs': '16px',
    'xs': '20px',
    's': '32px',
    'm': '40px',
    'l': '48px',
    'xl': '64px',
    '2xl': '80px',
    'custom': '40px',
  };
  for (final entry in sizes.entries) {
    final px = sizeOverrides?[entry.key] ?? entry.value;
    props['--Avatar-size-${entry.key}'] = px;
    props['--Avatar-iconSize-${entry.key}'] =
        '${(double.parse(px.replaceAll('px', '')) * 0.5).round()}px';
  }
  props['--Avatar-iconSize-2xs'] = '16px';
  props['--Avatar-fontSize-m'] = '12px';
  props['--Avatar-fontWeight'] = '500';
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'densityId': 'default',
      'dimensions': {'--Shape-Pill': '9999px'},
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

ThemeConfig _fullThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in _kAllAppearances)
        role: buildScaleDefinition('Role', grey, 1300),
    },
  );
}

Widget pumpAvatarApp(
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) {
  final root = buildRootSurfaceContext(
    themeConfig: _fullThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return MaterialApp(
    home: OneUiSurfaceScope(
      value: root,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        designSystem: designSystem ?? _avatarDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

Future<void> _pumpLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Future<void> _pumpUntilImageError(WidgetTester tester) async {
  await _pumpLayout(tester);
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 50));
}

double _avatarSide(WidgetTester tester) {
  final boxes = tester.widgetList<SizedBox>(
    find.descendant(
      of: find.byType(OneUiAvatar),
      matching: find.byWidgetPredicate(
        (w) =>
            w is SizedBox &&
            w.width != null &&
            w.height != null &&
            w.width == w.height,
      ),
    ),
  );
  return boxes.first.width!;
}

BoxDecoration _avatarDecoration(WidgetTester tester) {
  return tester
      .widget<DecoratedBox>(
        find.descendant(
          of: find.byType(OneUiAvatar),
          matching: find.byType(DecoratedBox),
        ),
      )
      .decoration as BoxDecoration;
}

void main() {
  group('oneUiAvatarGetInitials', () {
    test('extracts two initials from full name', () {
      expect(oneUiAvatarGetInitials('John Doe'), 'JD');
    });

    test('extracts single initial from single name', () {
      expect(oneUiAvatarGetInitials('John'), 'J');
    });

    test('caps at 2 characters for long names', () {
      expect(oneUiAvatarGetInitials('John Michael Doe'), 'JM');
    });

    test('returns empty string for empty input', () {
      expect(oneUiAvatarGetInitials(''), '');
    });

    test('uppercases initials', () {
      expect(oneUiAvatarGetInitials('jane doe'), 'JD');
    });

    test('handles single character name', () {
      expect(oneUiAvatarGetInitials('J'), 'J');
    });
  });

  group('oneUiResolveAvatarSize', () {
    test('known sizes pass through', () {
      for (final size in kOneUiAvatarSizes) {
        expect(oneUiResolveAvatarSize(size), size);
      }
    });

    test('unknown size falls back to m', () {
      expect(oneUiResolveAvatarSize('huge'), 'm');
      expect(oneUiResolveAvatarSize(''), 'm');
    });
  });

  group('resolveOneUiAvatarStateInContext', () {
    testWidgets('defaults to size m and high attention', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          Builder(
            builder: (context) {
              final s = resolveOneUiAvatarStateInContext(context);
              expect(s.dataSize, 'm');
              expect(s.dataAttention, 'high');
              expect(s.dataContent, 'image');
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });

    testWidgets('auto resolves to primary without slot parent', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          Builder(
            builder: (context) {
              final s = resolveOneUiAvatarStateInContext(
                context,
                appearance: 'auto',
              );
              expect(s.dataAppearance, 'primary');
              expect(s.resolvedAppearance, 'primary');
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });

    testWidgets('auto inherits slot parent appearance', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiSlotParentAppearanceScope(
            appearance: 'secondary',
            child: Builder(
              builder: _slotAutoBuilder,
            ),
          ),
        ),
      );
    });

    testWidgets('text at 2xs resolves to icon content', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          Builder(
            builder: (context) {
              final s = resolveOneUiAvatarStateInContext(
                context,
                content: OneUiAvatarContent.text,
                size: '2xs',
              );
              expect(s.resolvedContent, OneUiAvatarContent.icon);
              expect(s.dataContent, 'icon');
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });

    testWidgets('text with empty alt resolves to icon content', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          Builder(
            builder: (context) {
              final s = resolveOneUiAvatarStateInContext(
                context,
                content: OneUiAvatarContent.text,
                alt: '',
              );
              expect(s.resolvedContent, OneUiAvatarContent.icon);
              expect(s.dataContent, 'icon');
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });

    testWidgets('invalid size resolves to m in dataSize', (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await tester.pumpWidget(
          pumpAvatarApp(
            Builder(
              builder: (context) {
                final s = resolveOneUiAvatarStateInContext(
                  context,
                  size: 'invalid',
                );
                expect(s.dataSize, 'm');
                expect(s.resolvedSize, 'm');
                return const SizedBox.shrink();
              },
            ),
          ),
        );
        expect(captured, isNotNull);
      } finally {
        FlutterError.onError = prev;
      }
    });

    testWidgets('each canonical size passes through dataSize', (tester) async {
      for (final size in kOneUiAvatarSizes) {
        if (size == 'custom') continue;
        await tester.pumpWidget(
          pumpAvatarApp(
            Builder(
              builder: (context) {
                final s = resolveOneUiAvatarStateInContext(
                  context,
                  content: OneUiAvatarContent.text,
                  size: size,
                );
                expect(s.dataSize, size);
                return const SizedBox.shrink();
              },
            ),
          ),
        );
        await tester.pump();
      }
    });

    testWidgets('each appearance resolves dataAppearance', (tester) async {
      for (final role in _kAllAppearances) {
        await tester.pumpWidget(
          pumpAvatarApp(
            Builder(
              builder: (context) {
                final s = resolveOneUiAvatarStateInContext(
                  context,
                  content: OneUiAvatarContent.text,
                  appearance: role,
                );
                expect(s.dataAppearance, role);
                return const SizedBox.shrink();
              },
            ),
          ),
        );
        await tester.pump();
      }
    });
  });

  group('resolveAvatarIconSlotColor', () {
    test('uses text on-colour for icon glyphs (RN parity)', () {
      const colors = AvatarResolvedColors(
        background: Color(0xFF0000FF),
        iconColor: Color(0xFF111111),
        textColor: Color(0xFF222222),
      );
      expect(resolveAvatarIconSlotColor(colors), const Color(0xFF222222));
    });
  });

  group('resolveAvatarColors attention × appearance', () {
    testWidgets('matrix: high/medium/low differ for primary', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          Builder(
            builder: (context) {
              final high = resolveAvatarColors(
                context,
                appearance: 'primary',
                attention: OneUiAvatarAttention.high,
                showingImage: false,
              );
              final medium = resolveAvatarColors(
                context,
                appearance: 'primary',
                attention: OneUiAvatarAttention.medium,
                showingImage: false,
              );
              final low = resolveAvatarColors(
                context,
                appearance: 'primary',
                attention: OneUiAvatarAttention.low,
                showingImage: false,
              );
              expect(low.background, const Color(0x00000000));
              expect(high.background, isNot(equals(low.background)));
              expect(medium.background, isNot(equals(low.background)));
              expect(high.background, isNot(equals(medium.background)));
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });

    testWidgets('matrix: all appearances resolve without throwing',
        (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          Builder(
            builder: (context) {
              for (final role in _kAllAppearances) {
                for (final att in OneUiAvatarAttention.values) {
                  final colors = resolveAvatarColors(
                    context,
                    appearance: role,
                    attention: att,
                    showingImage: false,
                  );
                  expect(colors.background, isA<Color>());
                  expect(colors.iconColor, isA<Color>());
                  expect(colors.textColor, isA<Color>());
                  if (att == OneUiAvatarAttention.low) {
                    expect(colors.background, const Color(0x00000000));
                  } else {
                    expect(colors.background.a, greaterThan(0));
                  }
                }
              }
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });

    testWidgets('showingImage uses transparent background', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          Builder(
            builder: (context) {
              final colors = resolveAvatarColors(
                context,
                appearance: 'primary',
                attention: OneUiAvatarAttention.high,
                showingImage: true,
              );
              expect(colors.background, const Color(0x00000000));
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });
  });

  group('OneUiAvatar widget', () {
    testWidgets('default appearance auto resolves to primary at root',
        (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(content: OneUiAvatarContent.icon, alt: 'User'),
        ),
      );
      await _pumpLayout(tester);
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-avatar|data-content=icon|data-size=m|data-attention=high|data-appearance=primary',
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgets('renders image mode with transparent shell while loading',
        (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.image,
            src: 'https://example.com/photo.jpg',
            alt: 'John Doe',
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(OneUiAvatar), findsOneWidget);
      expect(find.byType(ConvexGapCard), findsNothing);
      // Network may resolve or fail in tests; shell stays transparent only while image shows.
      final hasImage = find.byType(Image).evaluate().isNotEmpty;
      if (hasImage) {
        expect(_avatarDecoration(tester).color, const Color(0x00000000));
      }
    });

    testWidgets('shows default person icon when image fails', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.image,
            src: 'https://invalid.example/broken.jpg',
            alt: 'Jane Smith',
            size: 'xl',
          ),
        ),
      );
      await _pumpUntilImageError(tester);
      expect(find.byType(Image), findsNothing);
      expect(find.byType(OneUiAvatarDefaultPersonIcon), findsOneWidget);
      expect(_avatarDecoration(tester).color, isNot(const Color(0x00000000)));
    });

    testWidgets('shows custom fallback when image fails', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.image,
            src: 'https://invalid.example/broken.jpg',
            alt: 'User',
            fallback: Text('!', key: ValueKey('fallback-icon')),
          ),
        ),
      );
      await _pumpUntilImageError(tester);
      expect(find.byKey(const ValueKey('fallback-icon')), findsOneWidget);
      expect(find.byType(OneUiAvatarDefaultPersonIcon), findsNothing);
    });

    testWidgets('renders text initials', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'Jane Doe',
            size: 'xl',
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.text('JD'), findsOneWidget);
    });

    testWidgets('renders custom fallback for text at xl', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'John',
            size: 'xl',
            fallback: Text('Custom', key: ValueKey('custom')),
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byKey(const ValueKey('custom')), findsOneWidget);
      expect(find.text('J'), findsNothing);
    });

    testWidgets('renders icon variant with custom icon', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            icon: Text('U', key: ValueKey('user-icon')),
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byKey(const ValueKey('user-icon')), findsOneWidget);
    });

    testWidgets('icon variant renders default person when no icon',
        (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            size: 'xl',
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(OneUiAvatarDefaultPersonIcon), findsOneWidget);
    });

    testWidgets('text at 2xs renders icon not initials', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'John Doe',
            size: '2xs',
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.text('JD'), findsNothing);
      expect(find.byType(OneUiAvatarDefaultPersonIcon), findsOneWidget);
    });

    testWidgets('text at xs renders icon not initials', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'John Doe',
            size: 'xs',
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.text('JD'), findsNothing);
      expect(find.byType(OneUiAvatarDefaultPersonIcon), findsOneWidget);
    });

    testWidgets('each size sets container dimension from tokens',
        (tester) async {
      final ds = _avatarDesignSystem();
      for (final size in ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl']) {
        await tester.pumpWidget(
          pumpAvatarApp(
            OneUiAvatar(
                content: OneUiAvatarContent.icon, alt: 'User', size: size),
            designSystem: ds,
          ),
        );
        await _pumpLayout(tester);
        final expected = switch (size) {
          '2xs' => 16.0,
          'xs' => 20.0,
          's' => 32.0,
          'm' => 40.0,
          'l' => 48.0,
          'xl' => 64.0,
          '2xl' => 80.0,
          _ => 40.0,
        };
        expect(_avatarSide(tester), expected);
        await tester.pumpWidget(const SizedBox.shrink());
      }
    });

    testWidgets('custom size uses customSize pixels', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.text,
            alt: 'JD',
            size: 'custom',
            customSize: 48,
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(_avatarSide(tester), 48);
    });

    testWidgets('disabled reduces opacity', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            disabled: true,
            alt: 'Off',
          ),
        ),
      );
      await _pumpLayout(tester);
      final opacity = tester.widget<Opacity>(find.byType(Opacity));
      expect(opacity.opacity, closeTo(0.38, 0.01));
    });

    testWidgets('enabled uses full opacity', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(content: OneUiAvatarContent.icon, alt: 'On'),
        ),
      );
      await _pumpLayout(tester);
      final opacity = tester.widget<Opacity>(find.byType(Opacity));
      expect(opacity.opacity, 1);
    });

    testWidgets('attention levels render for each appearance', (tester) async {
      for (final role in _kAllAppearances) {
        for (final att in OneUiAvatarAttention.values) {
          await tester.pumpWidget(
            pumpAvatarApp(
              OneUiAvatar(
                content: OneUiAvatarContent.text,
                alt: 'JD',
                appearance: role,
                attention: att,
              ),
            ),
          );
          await _pumpLayout(tester);
          expect(find.byType(ConvexGapCard), findsNothing);
          expect(find.byType(OneUiAvatar), findsOneWidget);
        }
      }
    });

    testWidgets('semantics image with alt label', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(content: OneUiAvatarContent.icon, alt: 'John Doe'),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('John Doe'), findsOneWidget);
        final data = tester
            .getSemantics(find.bySemanticsLabel('John Doe'))
            .getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.isImage), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('empty alt is decorative in widget tree', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(const OneUiAvatar(content: OneUiAvatarContent.icon)),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('avatar'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('disabled announces via label suffix', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Alice',
            disabled: true,
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Alice, disabled'), findsOneWidget);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semantics disabled when disabled', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Jane',
            disabled: true,
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('Jane, disabled'))
            .getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('excludeFromSemantics hides avatar', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Hidden',
            excludeFromSemantics: true,
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semanticsHint is forwarded', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'Jane',
            semanticsHint: 'Opens profile',
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('Jane'))
            .getSemanticsData();
        expect(data.hint, 'Opens profile');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('testId attaches ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            testId: 'avatar-root',
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byKey(const ValueKey('avatar-root')), findsOneWidget);
    });

    testWidgets('testId exposed via Semantics.identifier', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.icon,
            alt: 'User',
            testId: 'avatar-root',
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final node = tester.getSemantics(find.byType(OneUiAvatar));
        expect(node.getSemanticsData().identifier, 'avatar-root');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('invalid appearance resolves to primary', (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await tester.pumpWidget(
          pumpAvatarApp(
            Builder(
              builder: (context) {
                final s = resolveOneUiAvatarStateInContext(
                  context,
                  appearance: 'destructive',
                );
                expect(s.resolvedAppearance, 'primary');
                expect(s.dataAppearance, 'primary');
                return const SizedBox.shrink();
              },
            ),
          ),
        );
        expect(captured, isNotNull);
      } finally {
        FlutterError.onError = prev;
      }
    });

    testWidgets('unknown size jumbo renders same width as m', (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await tester.pumpWidget(
          pumpAvatarApp(
            const OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'Alice',
              size: 'jumbo',
            ),
          ),
        );
        await _pumpLayout(tester);
        expect(captured, isNotNull);
        expect(find.byType(ConvexGapCard), findsNothing);
        final jumboWidth = tester.getSize(
          find.descendant(
            of: find.byType(OneUiAvatar),
            matching: find.byType(SizedBox),
          ).first,
        ).width;

        await tester.pumpWidget(
          pumpAvatarApp(
            const OneUiAvatar(
              content: OneUiAvatarContent.icon,
              alt: 'Alice',
              size: 'm',
            ),
          ),
        );
        await _pumpLayout(tester);
        final mWidth = tester.getSize(
          find.descendant(
            of: find.byType(OneUiAvatar),
            matching: find.byType(SizedBox),
          ).first,
        ).width;
        expect(jumboWidth, mWidth);
      } finally {
        FlutterError.onError = prev;
      }
    });

    testWidgets('whitespace-only src skips image load', (tester) async {
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
            content: OneUiAvatarContent.image,
            alt: 'Alice',
            src: '   ',
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(Image), findsNothing);
      expect(find.byType(OneUiAvatarDefaultPersonIcon), findsOneWidget);
    });

    testWidgets('2xs with iconSize 100% resolves without gap card', (tester) async {
      final props = <String, dynamic>{
        '--Avatar-borderRadius': '9999px',
        '--Avatar-size-2xs': '16px',
        '--Avatar-iconSize-2xs': '100%',
      };
      final ds = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': props,
        'dimensionContexts': <dynamic>[],
        'activeDimensionKey': 'S:default',
        'activeDimensionContext': {
          'platformId': 'S',
          'densityId': 'default',
          'dimensions': {'--Shape-Pill': '9999px'},
          'gridMargin': '16px',
          'gridGutter': '12px',
        },
      })!;
      await tester.pumpWidget(
        pumpAvatarApp(
          const OneUiAvatar(
              content: OneUiAvatarContent.icon, size: '2xs', alt: 'User'),
          designSystem: ds,
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.byType(OneUiAvatarDefaultPersonIcon), findsOneWidget);
    });

    testWidgets('shows ConvexGapCard without design system', (tester) async {
      final root = buildRootSurfaceContext(
        themeConfig: _fullThemeConfig(),
        rootParentStep: 2500,
        darkMode: false,
      );
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await tester.pumpWidget(
          MaterialApp(
            home: OneUiSurfaceScope(
              value: root,
              child: const OneUiScope(
                platformId: 'S',
                density: 'default',
                child: Scaffold(
                  body: Center(child: OneUiAvatar(content: OneUiAvatarContent.icon)),
                ),
              ),
            ),
          ),
        );
        await _pumpLayout(tester);
        expect(captured, isNotNull);
        expect(find.byType(ConvexGapCard), findsOneWidget);
      } finally {
        FlutterError.onError = prev;
      }
    });
  });

  group('resolveAvatarMetrics', () {
    testWidgets('returns null without design system', (tester) async {
      final root = buildRootSurfaceContext(
        themeConfig: _fullThemeConfig(),
        rootParentStep: 2500,
        darkMode: false,
      );
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: const OneUiScope(
              platformId: 'S',
              density: 'default',
              child: SizedBox.shrink(),
            ),
          ),
        ),
      );
      final ctx = tester.element(find.byType(SizedBox));
      expect(resolveAvatarMetrics(ctx, size: 'm'), isNull);
    });
  });
}

Widget _slotAutoBuilder(BuildContext context) {
  final s = resolveOneUiAvatarStateInContext(context, appearance: 'auto');
  expect(s.resolvedAppearance, 'secondary');
  return const SizedBox.shrink();
}
