/// BottomNavigation functional QA tests — mirrors web `BottomNavigation.tsx` /
/// `BottomNavItem.tsx`, the RN peer, and the Figma matrix:
///
///   BottomNav      → items: 2|3|4|5 × label: 1Line|2Line|none
///   BottomNav.Item → active: true|false × type: label1Line|label2Line|labelFalse
///
/// Validates ACTUAL behaviour, never just smoke:
///   - `tester.getSize` measures rendered item shell heights + Expanded widths.
///   - Selected / disabled / link state read off the real Semantics tree.
///   - labelType / appearance / active resolution asserted via the
///     data-attribute key the widget actually emits (KeyedSubtree ValueKey).
///   - Active icon swap asserted by which icon Key is in the tree.
///   - Callback ordering captured in a list and compared exactly.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation_types.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';

import '../../support/components/bottom_navigation_harness.dart';

const _homeIconKey = Key('home-icon');
const _homeFilledKey = Key('home-filled-icon');

Widget _homeIcon() => const Icon(Icons.home, key: _homeIconKey);
Widget _homeFilledIcon() => const Icon(Icons.home_filled, key: _homeFilledKey);

/// Builds N items with stable values/labels (`Tab 0..N-1`).
List<OneUiBottomNavItem> _items(int count, {String? labelType}) => [
      for (var i = 0; i < count; i++)
        OneUiBottomNavItem(
          value: 'tab-$i',
          icon: 'home',
          label: 'Tab $i',
          labelType: labelType,
        ),
    ];

/// Reads the container's emitted data key (`oneui-bottom-nav|data-items=…`).
String _navDataKey(WidgetTester tester) {
  final keys = tester
      .widgetList<KeyedSubtree>(find.descendant(
        of: bottomNavRootFinder(),
        matching: find.byType(KeyedSubtree),
      ))
      .map((k) => k.key.toString())
      .where((k) => k.contains('oneui-bottom-nav|'));
  expect(keys, isNotEmpty, reason: 'nav must emit a data-payload KeyedSubtree');
  return keys.first;
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // Smoke — renders across the full Figma matrix without a ConvexGapCard
  // ===========================================================================

  group('[smoke] BottomNavigation — renders without crashing', () {
    for (final count in kOneUiBottomNavFigmaItemCounts) {
      testWidgetsAllPlatforms('[smoke] items=$count renders', (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: _items(count),
          ),
        );
        expect(bottomNavRootFinder(), findsOneWidget);
        expect(bottomNavItemCount(tester), count);
        expect(find.textContaining('Convex'), findsNothing,
            reason: 'tokens must resolve — no ConvexGapCard fallback');
      });
    }

    for (final label in kOneUiBottomNavLabelTypes) {
      testWidgetsAllPlatforms('[smoke] label=$label renders', (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            labelType: label,
            children: _items(3),
          ),
        );
        expect(bottomNavRootFinder(), findsOneWidget);
      });
    }

    for (final app in const [
      'primary',
      'secondary',
      'neutral',
      'sparkle',
      'positive',
      'informative',
    ]) {
      testWidgetsAllPlatforms('[smoke] appearance=$app renders', (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            appearance: app,
            children: _items(3),
          ),
        );
        expect(bottomNavRootFinder(), findsOneWidget);
      });
    }
  });

  // ===========================================================================
  // Items layout — equal-width slots + item count encoded
  // ===========================================================================

  group('[functional] BottomNavigation — items layout', () {
    for (final count in kOneUiBottomNavFigmaItemCounts) {
      testWidgetsAllPlatforms(
        '[fn] items=$count share width equally (Figma equal-weight row)',
        (tester) async {
          await pumpBottomNavQaHarnessSettled(
            tester,
            OneUiBottomNavigation(
              semanticsLabel: 'Primary',
              children: _items(count),
            ),
          );
          final widths = [
            for (var i = 0; i < count; i++) bottomNavItemWidth(tester, i),
          ];
          final first = widths.first;
          for (final w in widths) {
            expect((w - first).abs(), lessThan(0.5),
                reason: 'all $count items must render at equal width '
                    '(Expanded flex:1) — got $widths');
          }
        },
      );

      testWidgetsAllPlatforms('[fn] items=$count encoded in data-items key',
          (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: _items(count),
          ),
        );
        expect(_navDataKey(tester), contains('data-items=$count'));
      });
    }

    testWidgetsAllPlatforms(
      '[fn] renders all items when more than five (web renders, dev warns only)',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: _items(6),
          ),
        );
        expect(bottomNavItemCount(tester), 6,
            reason: 'web parity — no clamping, all children render');
        expect(_navDataKey(tester), contains('data-items=6'));
      },
    );

    testWidgetsAllPlatforms('[fn] single item (below Figma min) still renders',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: _items(1),
        ),
      );
      expect(bottomNavItemCount(tester), 1);
    });
  });

  // ===========================================================================
  // Item shell height per label type — measured against synthetic px table
  // ===========================================================================

  group('[functional] BottomNavigation — item height honours label type', () {
    Future<double> measureItemShellHeight(
      WidgetTester tester,
      String labelType,
    ) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: labelType,
          children: const [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
          ],
        ),
        useJioFixture: false,
        designSystem: qaBottomNavTestDesignSystem(),
      );
      // The OUTER AnimatedContainer (built first) carries `height:
      // layout.itemHeight`; its rendered size IS the item shell height.
      final shell = find
          .descendant(
            of: bottomNavItemFinder().first,
            matching: find.byType(AnimatedContainer),
          )
          .first;
      return tester.getSize(shell).height;
    }

    testWidgetsAllPlatforms('[fn] none (56) < 1line (64) < 2line (72)',
        (tester) async {
      final none = await measureItemShellHeight(tester, kOneUiBottomNavLabelNone);
      final one = await measureItemShellHeight(tester, kOneUiBottomNavLabel1Line);
      final two = await measureItemShellHeight(tester, kOneUiBottomNavLabel2Line);
      expect(none, kQaBottomNavItemHeightPx['none']);
      expect(one, kQaBottomNavItemHeightPx['1line']);
      expect(two, kQaBottomNavItemHeightPx['2line']);
      expect(none, lessThan(one));
      expect(one, lessThan(two));
    });
  });

  // ===========================================================================
  // Label visibility per label type
  // ===========================================================================

  group('[functional] BottomNavigation — label visibility', () {
    testWidgetsAllPlatforms('[fn] label=none hides the visible text',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavLabelNone,
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
          ],
        ),
      );
      expect(find.text('Home'), findsNothing,
          reason: 'label=none must not paint the visible label text');
    });

    testWidgetsAllPlatforms('[fn] label=1line shows single-line text (maxLines 1)',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavLabel1Line,
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
          ],
        ),
      );
      final text = tester.widget<Text>(find.text('Home'));
      expect(text.maxLines, 1);
      expect(text.overflow, TextOverflow.ellipsis);
    });

    testWidgetsAllPlatforms('[fn] label=2line allows two lines (maxLines 2)',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavLabel2Line,
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Label can go into 2 lines if needed',
            ),
          ],
        ),
      );
      final text = tester.widget<Text>(find.textContaining('Label can go'));
      expect(text.maxLines, 2,
          reason: 'Figma 2Line label wraps to a 2-line box with ellipsis');
      expect(text.overflow, TextOverflow.ellipsis);
    });
  });

  // ===========================================================================
  // Label type resolution / Figma alias normalization
  // ===========================================================================

  group('[functional] BottomNavigation — label type resolution', () {
    testWidgetsAllPlatforms('[fn] container labelType encoded in data key',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavLabel2Line,
          children: _items(2),
        ),
      );
      expect(_navDataKey(tester), contains('data-label-type=2line'));
    });

    testWidgetsAllPlatforms('[fn] inherits parent labelType (2line) to items',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavLabel2Line,
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
          ],
        ),
      );
      final twoLine = find.descendant(
        of: bottomNavItemFinder(),
        matching: find.byWidgetPredicate(
          (w) => w is Text && w.maxLines == 2,
        ),
      );
      expect(twoLine, findsOneWidget,
          reason: 'item with no labelType inherits parent 2line');
    });

    testWidgetsAllPlatforms('[fn] per-item labelType overrides parent (→ none)',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavLabel1Line,
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Home',
              labelType: kOneUiBottomNavLabelNone,
              semanticsLabel: 'Home',
            ),
          ],
        ),
      );
      expect(find.text('Home'), findsNothing);
      expect(find.bySemanticsLabel('Home'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
      '[fn] Figma item `type` alias (label2Line) maps to 2-line layout',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Label can go into 2 lines',
                type: kOneUiBottomNavItemTypeLabel2Line,
              ),
            ],
          ),
        );
        final text = tester.widget<Text>(find.textContaining('Label can go'));
        expect(text.maxLines, 2,
            reason: 'Figma item type "label2Line" → canonical 2line');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] Figma item `type` alias (labelFalse) hides label',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                type: kOneUiBottomNavItemTypeLabelFalse,
                semanticsLabel: 'Home',
              ),
            ],
          ),
        );
        expect(find.text('Home'), findsNothing,
            reason: 'Figma item type "labelFalse" → canonical none');
      },
    );

    // Pure resolver — every Figma alias collapses to one canonical value.
    test('[fn] normalizeOneUiBottomNavLabelType covers Figma aliases', () {
      expect(normalizeOneUiBottomNavLabelType('1Line'), kOneUiBottomNavLabel1Line);
      expect(normalizeOneUiBottomNavLabelType('2Line'), kOneUiBottomNavLabel2Line);
      expect(normalizeOneUiBottomNavLabelType('label1Line'),
          kOneUiBottomNavLabel1Line);
      expect(normalizeOneUiBottomNavLabelType('label2Line'),
          kOneUiBottomNavLabel2Line);
      expect(normalizeOneUiBottomNavLabelType('labelFalse'),
          kOneUiBottomNavLabelNone);
      expect(normalizeOneUiBottomNavLabelType('none'), kOneUiBottomNavLabelNone);
      // Unknown / empty default to 1line.
      expect(normalizeOneUiBottomNavLabelType(''), kOneUiBottomNavLabel1Line);
      expect(normalizeOneUiBottomNavLabelType('bogus'), kOneUiBottomNavLabel1Line);
      expect(normalizeOneUiBottomNavLabelType(null), kOneUiBottomNavLabel1Line);
    });
  });

  // ===========================================================================
  // Active resolution — explicit, value-based, controlled, uncontrolled
  // ===========================================================================

  group('[functional] BottomNavigation — active resolution', () {
    testWidgetsAllPlatforms('[fn] defaultValue marks the matching tab selected',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'search',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
          ],
        ),
      );
      expectBottomNavTabSelected(tester, 'Search', selected: true);
      expectBottomNavTabSelected(tester, 'Home', selected: false);
    });

    testWidgetsAllPlatforms('[fn] explicit active wins over parent defaultValue',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(
              value: 'search',
              icon: 'search',
              label: 'Search',
              active: true,
            ),
          ],
        ),
      );
      expectBottomNavTabSelected(tester, 'Search', selected: true);
    });

    testWidgetsAllPlatforms('[fn] explicit active applies with no parent value',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(
              value: 'search',
              icon: 'search',
              label: 'Search',
              active: true,
            ),
          ],
        ),
      );
      expectBottomNavTabSelected(tester, 'Search', selected: true);
      expectBottomNavTabSelected(tester, 'Home', selected: false);
    });

    testWidgetsAllPlatforms(
      '[fn] explicit active=false forces deselect even when value matches',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            defaultValue: 'home',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                active: false,
              ),
            ],
          ),
        );
        expectBottomNavTabSelected(tester, 'Home', selected: false,);
      },
    );

    testWidgetsAllPlatforms('[fn] uncontrolled tap updates the selected tab',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
          ],
        ),
      );
      await tester.tap(bottomNavTabFinder('Search'));
      await tester.pumpAndSettle();
      expectBottomNavTabSelected(tester, 'Search', selected: true);
      expectBottomNavTabSelected(tester, 'Home', selected: false);
    });

    testWidgetsAllPlatforms('[fn] controlled mode fires onValueChange',
        (tester) async {
      var value = 'home';
      await pumpBottomNavQaHarnessSettled(
        tester,
        StatefulBuilder(
          builder: (context, setState) => OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            value: value,
            onValueChange: (v) => setState(() => value = v),
            children: const [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
            ],
          ),
        ),
      );
      await tester.tap(bottomNavTabFinder('Search'));
      await tester.pumpAndSettle();
      expect(value, 'search');
      expectBottomNavTabSelected(tester, 'Search', selected: true);
    });

    testWidgetsAllPlatforms(
      '[fn] controlled value is sticky — selection does NOT move until parent updates',
      (tester) async {
        String? lastChange;
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            value: 'home',
            onValueChange: (v) => lastChange = v,
            children: const [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
            ],
          ),
        );
        await tester.tap(bottomNavTabFinder('Search'));
        await tester.pumpAndSettle();
        expect(lastChange, 'search',
            reason: 'change still fires so the parent can decide');
        expectBottomNavTabSelected(tester, 'Home', selected: true,);
        expectBottomNavTabSelected(tester, 'Search', selected: false);
      },
    );
  });

  // ===========================================================================
  // Active icon swap
  // ===========================================================================

  group('[functional] BottomNavigation — active icon swap', () {
    testWidgetsAllPlatforms('[fn] swaps to activeIcon when active', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: _homeIcon(),
              activeIcon: _homeFilledIcon(),
              label: 'Home',
            ),
          ],
        ),
      );
      expect(find.byKey(_homeFilledKey), findsOneWidget);
      expect(find.byKey(_homeIconKey), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] uses base icon when inactive', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'search',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: _homeIcon(),
              activeIcon: _homeFilledIcon(),
              label: 'Home',
            ),
            OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
          ],
        ),
      );
      expect(find.byKey(_homeIconKey), findsOneWidget);
      expect(find.byKey(_homeFilledKey), findsNothing);
    });

    testWidgetsAllPlatforms(
      '[fn] tap flips icon from base → active (uncontrolled)',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            defaultValue: 'search',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: _homeIcon(),
                activeIcon: _homeFilledIcon(),
                label: 'Home',
              ),
              OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
            ],
          ),
        );
        expect(find.byKey(_homeIconKey), findsOneWidget);
        await tester.tap(bottomNavTabFinder('Home'));
        await tester.pumpAndSettle();
        expect(find.byKey(_homeFilledKey), findsOneWidget,
            reason: 'after selecting Home the filled icon must paint');
        expect(find.byKey(_homeIconKey), findsNothing);
      },
    );
  });

  // ===========================================================================
  // Divider
  // ===========================================================================

  group('[functional] BottomNavigation — top divider', () {
    testWidgetsAllPlatforms('[fn] showDivider=true renders the size-S divider',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: _items(2),
        ),
      );
      expect(find.byKey(const Key('oneui-bottom-nav-top-divider')),
          findsOneWidget);
      final divider = tester.widget<OneUiDivider>(find.byType(OneUiDivider));
      expect(divider.size, kOneUiDividerSizeS);
    });

    testWidgetsAllPlatforms('[fn] showDivider=false omits the divider',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          showDivider: false,
          children: _items(2),
        ),
      );
      expect(find.byKey(const Key('oneui-bottom-nav-top-divider')), findsNothing);
    });
  });

  // ===========================================================================
  // Disabled item
  // ===========================================================================

  group('[functional] BottomNavigation — disabled item', () {
    testWidgetsAllPlatforms('[fn] disabled item applies Opacity < 1',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Home',
              disabled: true,
            ),
          ],
        ),
      );
      final opacity = tester.widget<Opacity>(find
          .descendant(
            of: bottomNavItemFinder(),
            matching: find.byType(Opacity),
          )
          .first);
      expect(opacity.opacity, lessThan(1.0));
    });

    testWidgetsAllPlatforms('[fn] disabled item does not fire onValueChange',
        (tester) async {
      String? changed;
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          onValueChange: (v) => changed = v,
          children: const [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Home',
              disabled: true,
            ),
          ],
        ),
      );
      await tester.tap(bottomNavTabFinder('Home'), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(changed, isNull);
    });

    testWidgetsAllPlatforms('[fn] disabled item does not change selection',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(
              value: 'search',
              icon: 'search',
              label: 'Search',
              disabled: true,
            ),
          ],
        ),
      );
      await tester.tap(bottomNavTabFinder('Search'), warnIfMissed: false);
      await tester.pumpAndSettle();
      expectBottomNavTabSelected(tester, 'Home', selected: true);
    });
  });

  // ===========================================================================
  // Callback ordering — onClick / onTap / onPressed fire before onValueChange
  // ===========================================================================

  group('[functional] BottomNavigation — callback ordering', () {
    testWidgetsAllPlatforms('[fn] onClick fires before onValueChange',
        (tester) async {
      final order = <String>[];
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          onValueChange: (_) => order.add('change'),
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Home',
              onClick: () => order.add('click'),
            ),
          ],
        ),
      );
      await tester.tap(bottomNavTabFinder('Home'));
      await tester.pumpAndSettle();
      expect(order, ['click', 'change']);
    });

    testWidgetsAllPlatforms('[fn] onTap then onPressed then onValueChange',
        (tester) async {
      final order = <String>[];
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          onValueChange: (_) => order.add('change'),
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Home',
              onTap: () => order.add('tap'),
              onPressed: () => order.add('press'),
            ),
          ],
        ),
      );
      await tester.tap(bottomNavTabFinder('Home'));
      await tester.pumpAndSettle();
      expect(order, ['tap', 'press', 'change']);
    });

    testWidgetsAllPlatforms('[fn] item with no value still fires onTap/onPressed',
        (tester) async {
      final order = <String>[];
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          onValueChange: (_) => order.add('change'),
          children: [
            OneUiBottomNavItem(
              icon: 'home',
              label: 'Home',
              onTap: () => order.add('tap'),
            ),
          ],
        ),
      );
      await tester.tap(bottomNavTabFinder('Home'));
      await tester.pumpAndSettle();
      expect(order, ['tap'],
          reason: 'no value → no onValueChange, but onTap still fires');
    });
  });

  // ===========================================================================
  // Appearance resolution — data key reflects resolver outcome
  // ===========================================================================

  group('[functional] BottomNavigation — appearance resolution', () {
    testWidgetsAllPlatforms('[fn] explicit appearance encoded on container',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          appearance: 'positive',
          children: _items(2),
        ),
      );
      expect(_navDataKey(tester), contains('data-appearance=positive'));
    });

    testWidgetsAllPlatforms(
      '[fn] default appearance resolves to "primary"',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: _items(2),
          ),
        );
        expect(_navDataKey(tester), contains('data-appearance=primary'));
      },
    );

    // Pure resolver — auto / unset falls to parent then primary.
    test('[fn] resolveOneUiBottomNavigationAppearance fallback chain', () {
      expect(resolveOneUiBottomNavigationAppearance('secondary'), 'secondary');
      expect(resolveOneUiBottomNavigationAppearance('auto'), 'primary');
      expect(resolveOneUiBottomNavigationAppearance(null), 'primary');
      expect(
        resolveOneUiBottomNavigationAppearance('auto',
            parentAppearance: 'positive'),
        'positive',
      );
    });
  });

  // ===========================================================================
  // testId
  // ===========================================================================

  group('[functional] BottomNavigation — testId', () {
    testWidgetsAllPlatforms('[fn] container testId attaches a Semantics identifier',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          testId: 'qa-bottom-nav',
          children: _items(2),
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        final node = tester.getSemantics(
          find.bySemanticsLabel('Primary'),
        );
        // testId is applied as an outer Semantics(identifier:) wrapper.
        expect(
          find
              .byWidgetPredicate(
                (w) => w is Semantics && w.properties.identifier == 'qa-bottom-nav',
              )
              .evaluate(),
          isNotEmpty,
        );
        expect(node, isNotNull);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('[fn] item testId attaches a Semantics identifier',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Home',
              testId: 'qa-tab-home',
            ),
          ],
        ),
      );
      expect(
        find
            .byWidgetPredicate(
              (w) => w is Semantics && w.properties.identifier == 'qa-tab-home',
            )
            .evaluate(),
        isNotEmpty,
      );
    });
  });
}
