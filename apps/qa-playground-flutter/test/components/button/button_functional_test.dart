/// Button functional QA tests — mirrors RN `Button.test.tsx` / web button QA.
///
/// These tests deliberately assert observable behavior (rendered height, slot
/// presence, layout-preserving loading, conditional rules) rather than only
/// "label still appears", so a regression that silently ignores a Figma prop
/// fails here instead of slipping through.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';

import '../../support/components/button_harness.dart';

Finder _buttonRootFinder() => find.byType(OneUiFocusInteractive);

void main() {
  // Preload the Jio Convex fixture before any testWidgets runs. Lazy load
  // from inside the first per-test pumpWidget deadlocks the testWidgets
  // scheduler at scale; setUpAll resolves the fixture in a plain test-zone.
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[smoke] Button — renders without crashing', () {
    testWidgetsAllPlatforms('[smoke] default button renders', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Button'),
      );
      expect(find.text('Button'), findsOneWidget);
    });

    for (final size in ['xs', 's', 'm', 'l']) {
      testWidgetsAllPlatforms('[smoke] size="$size" renders', (tester) async {
        await pumpButtonQaHarnessSettled(
          tester,
          OneUiButton(label: 'Button', sizeAlias: size),
        );
        expect(find.text('Button'), findsOneWidget);
      });
    }
  });

  group('[functional] Button — size honors token (not just smoke)', () {
    // Replaces the previous tautological size loop which only asserted that
    // the label string rendered. Rendered height is `max(minHeight, content)`
    // — pixel-exact assertions would be brittle for `xs`/`s` (text + padding
    // can dominate). Instead we assert ordering invariants that *cannot* hold
    // if the size prop is silently ignored.

    Future<double> renderHeight(WidgetTester tester, String alias) async {
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(label: 'Sz', sizeAlias: alias),
      );
      return tester.getSize(_buttonRootFinder()).height;
    }

    testWidgetsAllPlatforms('[fn] size="l" renders strictly taller than size="xs"', (tester) async {
      final hL = await renderHeight(tester, 'l');
      final hXs = await renderHeight(tester, 'xs');
      expect(hL, greaterThan(hXs),
          reason: 'l must read --Button-minHeight-12 (52) while xs reads --Button-minHeight-6 (32)');
    });

    testWidgetsAllPlatforms('[fn] size is monotonic xs ≤ s ≤ m ≤ l', (tester) async {
      final hXs = await renderHeight(tester, 'xs');
      final hS = await renderHeight(tester, 's');
      final hM = await renderHeight(tester, 'm');
      final hL = await renderHeight(tester, 'l');
      expect(hXs, lessThanOrEqualTo(hS));
      expect(hS, lessThanOrEqualTo(hM));
      expect(hM, lessThanOrEqualTo(hL));
      expect(hXs, lessThan(hL),
          reason: 'distinct seeded minHeights must yield distinct rendered heights');
    });

    testWidgetsAllPlatforms('[fn] size xs label renders wider than tall (pill)', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Add',
          sizeAlias: 'xs',
          attention: OneUiButtonAttention.medium,
        ),
      );
      final size = tester.getSize(_buttonRootFinder());
      expect(size.width, greaterThan(size.height),
          reason: 'xs text button must not collapse to a square/circle — '
              'horizontal padding + label width should exceed min height');
      expect(size.height, greaterThanOrEqualTo(24),
          reason: 'xs honors --Button-minHeight-6 (Spacing-6)');
    });

    testWidgetsAllPlatforms('[fn] size="m" rendered ≥ seeded minHeight (44)', (tester) async {
      final h = await renderHeight(tester, 'm');
      expect(h, greaterThanOrEqualTo(kQaButtonMinHeightByAlias['m']!),
          reason: 'size m must honor --Button-minHeight-10');
    });
  });

  group('[functional] Button — press handlers', () {
    testWidgetsAllPlatforms('[fn] invokes onPressed when tapped', (tester) async {
      var hits = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(label: 'Tap me', onPressed: () => hits++),
      );
      await tester.tap(find.text('Tap me'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] onPress aliases to onPressed', (tester) async {
      var hits = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(label: 'Press', onPress: () => hits++),
      );
      await tester.tap(find.text('Press'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] onClick aliases to onPressed', (tester) async {
      var hits = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(label: 'Click', onClick: () => hits++),
      );
      await tester.tap(find.text('Click'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] onPressed wins over onPress / onClick (precedence)', (tester) async {
      var pressed = 0, press = 0, click = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(
          label: 'Precedence',
          onPressed: () => pressed++,
          onPress: () => press++,
          onClick: () => click++,
        ),
      );
      await tester.tap(find.text('Precedence'));
      await tester.pumpAndSettle();
      expect(pressed, 1, reason: 'onPressed must be invoked first');
      expect(press, 0, reason: 'onPress must not fire when onPressed is set');
      expect(click, 0, reason: 'onClick must not fire when onPressed is set');
    });

    testWidgetsAllPlatforms('[fn] onPress wins over onClick when no onPressed', (tester) async {
      var press = 0, click = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(
          label: 'AliasOrder',
          onPress: () => press++,
          onClick: () => click++,
        ),
      );
      await tester.tap(find.text('AliasOrder'));
      await tester.pumpAndSettle();
      expect(press, 1);
      expect(click, 0);
    });

    testWidgetsAllPlatforms('[fn] disabled does not invoke callback', (tester) async {
      var hits = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(label: 'Off', disabled: true, onPressed: () => hits++),
      );
      await tester.tap(find.text('Off'), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });

    testWidgetsAllPlatforms('[fn] loading does not invoke callback', (tester) async {
      var hits = 0;
      await pumpButtonQaHarness(
        tester,
        OneUiButton(label: 'Busy', loading: true, onPressed: () => hits++),
      );
      await tester.tap(find.text('Busy'), warnIfMissed: false);
      await tester.pump();
      expect(hits, 0);
    });
  });

  group('[smoke] Button — Figma matrix: appearance (all 9 roles + auto)', () {
    for (final appearance in const [
      'auto',
      'neutral',
      'primary',
      'secondary',
      'sparkle',
      'positive',
      'negative',
      'informative',
      'warning',
      'brand-bg',
    ]) {
      testWidgetsAllPlatforms('[smoke] appearance="$appearance" renders', (tester) async {
        await pumpButtonQaHarnessSettled(
          tester,
          OneUiButton(label: 'Save', appearance: appearance),
        );
        expect(find.text('Save'), findsOneWidget);
      });
    }
  });

  group('[functional] Button — attention → variant resolution', () {
    // The Figma `attention` prop maps to the `variant` token. Pixel-level
    // border assertions are brittle (the synthetic test color resolver can
    // return null borderColor), but the pure mapping function IS the contract
    // worth pinning. A regression that re-wires high → ghost fails here.
    test('[fn] oneUiVariantFromAttention pins the Figma mapping', () {
      expect(oneUiVariantFromAttention(OneUiButtonAttention.high), OneUiButtonVariant.bold);
      expect(oneUiVariantFromAttention(OneUiButtonAttention.medium), OneUiButtonVariant.subtle);
      expect(oneUiVariantFromAttention(OneUiButtonAttention.low), OneUiButtonVariant.ghost);
    });

    for (final attention in OneUiButtonAttention.values) {
      testWidgetsAllPlatforms('[smoke] attention=${attention.name} renders', (tester) async {
        await pumpButtonQaHarnessSettled(
          tester,
          OneUiButton(label: 'A', attention: attention),
        );
        expect(find.text('A'), findsOneWidget);
      });
    }
  });

  group('[functional] Button — condensed', () {
    Future<double> renderHeight(WidgetTester tester, String alias, {required bool condensed}) async {
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(label: 'C', sizeAlias: alias, condensed: condensed),
      );
      return tester.getSize(_buttonRootFinder()).height;
    }

    testWidgetsAllPlatforms('[fn] condensed=true is strictly shorter than condensed=false (size l)', (tester) async {
      final hRegular = await renderHeight(tester, 'l', condensed: false);
      final hCondensed = await renderHeight(tester, 'l', condensed: true);
      expect(hCondensed, lessThan(hRegular),
          reason: 'condensed must read --Button-condensedMinHeight-12, not --Button-minHeight-12');
    });

    testWidgetsAllPlatforms('[fn] condensed reads its own token (size m)', (tester) async {
      // Pinned synthetic tokens on a desktop platform — no 44px touch floor —
      // so condensed (36px) must render strictly shorter than regular (44px).
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'C', sizeAlias: 'm', condensed: false),
        designSystem: qaButtonTestDesignSystem(),
        platformId: 'L-1440',
      );
      final hRegular = tester.getSize(_buttonRootFinder()).height;

      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'C', sizeAlias: 'm', condensed: true),
        designSystem: qaButtonTestDesignSystem(),
        platformId: 'L-1440',
      );
      final hCondensed = tester.getSize(_buttonRootFinder()).height;

      expect(hCondensed, lessThan(hRegular),
          reason: 'condensed must read --Button-condensedMinHeight-10 '
              '(${kQaButtonCondensedMinHeightByAlias['m']}), not '
              '--Button-minHeight-10 (${kQaButtonMinHeightByAlias['m']})');
    });

    testWidgetsAllPlatforms(
        '[fn] condensed size m on mobile respects 44px touch floor (may equal regular)',
        (tester) async {
      final hRegular = await renderHeight(tester, 'm', condensed: false);
      final hCondensed = await renderHeight(tester, 'm', condensed: true);
      expect(hRegular, greaterThanOrEqualTo(44));
      expect(hCondensed, greaterThanOrEqualTo(44));
      expect(hCondensed, lessThanOrEqualTo(hRegular),
          reason: 'condensed cannot exceed regular; equality is valid when '
              'both token paths clamp to the WCAG touch floor');
    });

    testWidgetsAllPlatforms('[fn] condensed is a NO-OP when contained=false (Figma rule)', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'A', sizeAlias: 'm', contained: false, condensed: true),
      );
      final hWithCondensed = tester.getSize(_buttonRootFinder()).height;

      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'A', sizeAlias: 'm', contained: false, condensed: false),
      );
      final hWithoutCondensed = tester.getSize(_buttonRootFinder()).height;

      expect(hWithCondensed, hWithoutCondensed,
          reason: 'condensed must not change uncontained button height');
    });
  });

  group('[functional] Button — contained=false (uncontained render path)', () {
    testWidgetsAllPlatforms('[fn] uncontained still renders label and is tappable', (tester) async {
      var hits = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(label: 'Ghosty', contained: false, onPressed: () => hits++),
      );
      expect(find.text('Ghosty'), findsOneWidget);
      await tester.tap(find.text('Ghosty'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[fn] uncontained ignores fullWidth (Figma rule)', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Tight', contained: false, fullWidth: true),
      );
      final w = tester.getSize(_buttonRootFinder()).width;
      expect(w, lessThan(400),
          reason: 'fullWidth must NOT expand width when contained=false');
    });
  });

  group('[functional] Button — fullWidth (contained)', () {
    testWidgetsAllPlatforms('[fn] fullWidth=true expands to parent width', (tester) async {
      const parentW = 320.0;
      await pumpButtonQaHarnessSettled(
        tester,
        const SizedBox(
          width: parentW,
          child: OneUiButton(label: 'Wide', fullWidth: true),
        ),
      );
      final w = tester.getSize(_buttonRootFinder()).width;
      expect(w, parentW,
          reason: 'fullWidth=true must fill its parent box');
    });

    testWidgetsAllPlatforms('[fn] fullWidth=false shrink-wraps', (tester) async {
      const parentW = 320.0;
      await pumpButtonQaHarnessSettled(
        tester,
        const SizedBox(
          width: parentW,
          child: Align(
            alignment: Alignment.centerLeft,
            child: OneUiButton(label: 'Tight'),
          ),
        ),
      );
      final w = tester.getSize(_buttonRootFinder()).width;
      expect(w, lessThan(parentW),
          reason: 'fullWidth=false must shrink-wrap content');
    });
  });

  group('[functional] Button — start / end slots', () {
    testWidgetsAllPlatforms('[fn] start slot renders supplied widget', (tester) async {
      const markerKey = ValueKey('start-icon');
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Go',
          start: Icon(Icons.star, key: markerKey),
        ),
      );
      expect(find.byKey(markerKey), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] end slot renders supplied widget', (tester) async {
      const markerKey = ValueKey('end-icon');
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Next',
          end: Icon(Icons.arrow_forward, key: markerKey),
        ),
      );
      expect(find.byKey(markerKey), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] both slots render simultaneously', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Both',
          start: Icon(Icons.star, key: ValueKey('s')),
          end: Icon(Icons.arrow_forward, key: ValueKey('e')),
        ),
      );
      expect(find.byKey(const ValueKey('s')), findsOneWidget);
      expect(find.byKey(const ValueKey('e')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] CircularProgressIndicator can occupy start slot', (tester) async {
      // The bare `OneUiCircularProgressIndicator()` requires a semanticsLabel
      // OR `ariaHidden: true` — without either, the widget asserts at build
      // time (debug-mode debugPrint). Pass an explicit label so consumers see
      // the canonical, accessible usage pattern. (Live before this fix, this
      // test emitted 3 spinner-a11y warnings per platform and CI swallowed
      // them silently — surfaced when we added `button_warnings_test.dart`.)
      await pumpButtonQaHarness(
        tester,
        const OneUiButton(
          label: 'Sync',
          start: OneUiCircularProgressIndicator(semanticsLabel: 'Syncing'),
        ),
      );
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] deprecated leftIcon / rightIcon still forward', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        // ignore: deprecated_member_use
        const OneUiButton(label: 'Legacy', leftIcon: 'star', rightIcon: 'arrow_forward'),
      );
      expect(find.text('Legacy'), findsOneWidget);
    });
  });

  group('[functional] Button — loading invariants', () {
    testWidgetsAllPlatforms('[fn] loading shows progress indicator', (tester) async {
      await pumpButtonQaHarness(
        tester,
        const OneUiButton(label: 'Busy', loading: true),
      );
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] loading preserves layout of start slot (maintainSize)', (tester) async {
      // Figma rule: "loading hides the start and end slots without altering
      // the button's shape or dimensions". The component wraps slots in
      // Visibility(visible:false, maintainSize:true) — if maintainSize is
      // dropped, the button width collapses.
      const wideStart = SizedBox(
        key: ValueKey('big-start'),
        width: 24,
        height: 24,
        child: Icon(Icons.add),
      );
      await pumpButtonQaHarness(
        tester,
        const OneUiButton(label: 'Hold', start: wideStart, loading: true),
      );
      final visibilities = tester
          .widgetList<Visibility>(find.descendant(
            of: _buttonRootFinder(),
            matching: find.byType(Visibility),
          ))
          .toList();
      expect(visibilities, isNotEmpty,
          reason: 'loading must wrap slot/label children in a Visibility');
      for (final v in visibilities) {
        expect(v.visible, isFalse,
            reason: 'loading-time Visibility must be invisible');
        expect(v.maintainSize, isTrue,
            reason: 'loading-time Visibility MUST maintainSize so the button does not collapse');
      }
    });

    testWidgetsAllPlatforms('[fn] loading width ≥ same-label non-loading width', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Submit', start: Icon(Icons.add)),
      );
      final wIdle = tester.getSize(_buttonRootFinder()).width;

      await pumpButtonQaHarness(
        tester,
        const OneUiButton(label: 'Submit', start: Icon(Icons.add), loading: true),
      );
      final wLoading = tester.getSize(_buttonRootFinder()).width;

      expect(wLoading, greaterThanOrEqualTo(wIdle - 0.5),
          reason: 'loading must not shrink the button (Figma loading rule)');
    });
  });

  group('[functional] Button — semanticButtonType (Form integration)', () {
    testWidgetsAllPlatforms('[fn] submit invokes onPressed when Form validates', (tester) async {
      var submitted = 0;
      final formKey = GlobalKey<FormState>();
      await pumpButtonQaHarnessSettled(
        tester,
        Form(
          key: formKey,
          child: OneUiButton(
            label: 'Send',
            semanticButtonType: OneUiSemanticButtonType.submit,
            onPressed: () => submitted++,
          ),
        ),
      );
      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();
      expect(submitted, 1, reason: 'submit with no validators must fire onPressed');
    });

    // iOS is intentionally excluded for this single test. Flutter's
    // `FormState._validate` posts a SemanticsAnnouncement Timer that
    // fake-async leaves pending past teardown when targeting iOS — a
    // framework quirk, not a button-level issue. Android + linux exercise
    // the identical `_handleActivated` submit branch.
    for (final platform in const [TargetPlatform.android, TargetPlatform.linux]) {
      testWidgets('[fn] submit suppresses onPressed when validation fails (${platform.name})',
          (tester) async {
        debugDefaultTargetPlatformOverride = platform;
        try {
          var submitted = 0;
          await pumpButtonQaHarnessSettled(
            tester,
            Form(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  FormField<bool>(
                    validator: (_) => 'required',
                    builder: (_) => const SizedBox.shrink(),
                  ),
                  OneUiButton(
                    label: 'Send',
                    semanticButtonType: OneUiSemanticButtonType.submit,
                    onPressed: () => submitted++,
                  ),
                ],
              ),
            ),
          );
          // Activate via the Actions intent path so we exercise the submit
          // branch without the pointer recognizer's long-press Timer.
          final ctx = tester.element(find.text('Send'));
          Actions.maybeInvoke(ctx, const ActivateIntent());
          await tester.pump();
          await tester.pump(const Duration(milliseconds: 50));
          expect(submitted, 0,
              reason: 'submit must block onPressed when Form.validate() returns false');
        } finally {
          debugDefaultTargetPlatformOverride = null;
        }
      });
    }

    testWidgetsAllPlatforms('[fn] reset invokes onPressed via Form.reset path', (tester) async {
      var resetCb = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        Form(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(initialValue: 'clean'),
              OneUiButton(
                label: 'Reset',
                semanticButtonType: OneUiSemanticButtonType.reset,
                onPressed: () => resetCb++,
              ),
            ],
          ),
        ),
      );
      await tester.tap(find.text('Reset'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(resetCb, 1, reason: 'reset path must still invoke onPressed');
    });

    // Strengthened version of the above: asserts the form ACTUALLY resets,
    // not just that the user-supplied callback fires. Web `type="reset"`
    // restores form fields to their initialValue — Flutter must mirror.
    testWidgetsAllPlatforms('[fn] reset actually restores TextFormField to initialValue', (tester) async {
      final formKey = GlobalKey<FormState>();
      const initial = 'clean';
      await pumpButtonQaHarnessSettled(
        tester,
        Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(initialValue: initial),
              const OneUiButton(
                label: 'Reset',
                semanticButtonType: OneUiSemanticButtonType.reset,
              ),
            ],
          ),
        ),
      );

      // User edits the field
      await tester.enterText(find.byType(TextFormField), 'dirty');
      await tester.pump();
      expect(find.text('dirty'), findsOneWidget,
          reason: 'precondition: user edit must land in the field');

      // Tap the reset button
      await tester.tap(find.text('Reset'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      expect(find.text(initial), findsOneWidget,
          reason: 'Form.reset() must restore initialValue after the reset button is tapped');
      expect(find.text('dirty'), findsNothing,
          reason: 'edited value must be cleared after reset');
    });
  });

  group('[functional] Button — variants and content', () {
    testWidgetsAllPlatforms('[fn] child overrides label rendering', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(
          label: 'ignored',
          child: const Text('CUSTOM'),
        ),
      );
      expect(find.text('CUSTOM'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] testId attaches ValueKey', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Save', testId: 'save-button'),
      );
      expect(find.byKey(const ValueKey('save-button')), findsOneWidget);
    });
  });

  group('[a11y] Button — touch target ≥ 44×44 (WCAG)', () {
    testWidgetsAllPlatforms('[a11y] default size m meets the 44px minimum', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Tap'),
      );
      final size = tester.getSize(_buttonRootFinder());
      expect(size.height, greaterThanOrEqualTo(44),
          reason: 'default Button (size m) must meet WCAG 2.5.5 Level AAA / CLAUDE.md touch target');
    });

    // Cross-platform / cross-density sweep. WCAG 2.5.5 Level AAA does not
    // care about which viewport the user is on — every primary-action
    // button in the design system must clear 44 px. If any combination
    // fails here, the Convex brand config has a touch-target hole that
    // hits real users.
    //
    // S = small mobile (most common Android/iPhone),
    // M = tablet portrait, L = tablet landscape.
    const platformsToSweep = ['S', 'M', 'L'];
    const densitiesToSweep = ['default', 'compact', 'open'];

    for (final platform in platformsToSweep) {
      for (final density in densitiesToSweep) {
        testWidgetsAllPlatforms(
          '[a11y] size m meets 44px at platform=$platform density=$density',
          (tester) async {
            await pumpButtonQaHarnessSettled(
              tester,
              const OneUiButton(label: 'Tap'),
              platformId: platform,
              density: density,
            );
            final size = tester.getSize(_buttonRootFinder());
            expect(size.height, greaterThanOrEqualTo(44),
                reason:
                    'size m at $platform / $density must meet WCAG 2.5.5 Level AAA. '
                    'If this fails, the brand config has `--Button-minHeight-10` resolving below 44 px '
                    'on the cited platform — fix in Convex, not in the component.');
          },
        );
      }
    }
  });

  group('[functional] Button — loading + custom child widget', () {
    testWidgetsAllPlatforms(
        '[fn] loading with `child:` (not `label:`) hides custom widget with maintainSize',
        (tester) async {
      // Regression guard for the Figma loading rule: when a custom child
      // widget is supplied INSTEAD of a label, loading must still hide it
      // via Visibility(visible:false, maintainSize:true) so the button
      // dimensions are stable. If `child:` skips the preservation wrap, the
      // button collapses to spinner-only width when loading=true.
      const childKey = ValueKey('custom-child');

      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          child: Text('CUSTOM', key: childKey),
        ),
      );
      final idleSize = tester.getSize(_buttonRootFinder());
      expect(find.text('CUSTOM'), findsOneWidget,
          reason: 'baseline: custom child must render when not loading');

      await pumpButtonQaHarness(
        tester,
        const OneUiButton(
          loading: true,
          child: Text('CUSTOM', key: childKey),
        ),
      );

      // The child should still be IN THE TREE (for maintainSize) but
      // hidden by a Visibility ancestor.
      final ancestors = tester
          .widgetList<Visibility>(find.ancestor(
            of: find.byKey(childKey),
            matching: find.byType(Visibility),
          ))
          .toList();
      expect(ancestors, isNotEmpty,
          reason:
              'loading + child: must wrap the custom child in a Visibility — '
              'otherwise the button collapses and the loading rule is violated');
      expect(ancestors.any((v) => v.visible == false && v.maintainSize == true), isTrue,
          reason: 'at least one ancestor Visibility must be (visible=false, maintainSize=true)');

      final loadingSize = tester.getSize(_buttonRootFinder());
      // Allow ±0.5 px tolerance for layout rounding.
      expect(loadingSize.width, greaterThanOrEqualTo(idleSize.width - 0.5),
          reason: 'loading must not collapse the button when a custom child is used');
    });

    testWidgetsAllPlatforms('[fn] loading + child still shows spinner', (tester) async {
      await pumpButtonQaHarness(
        tester,
        const OneUiButton(
          loading: true,
          child: Text('CUSTOM'),
        ),
      );
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget,
          reason: 'loading=true must always render a spinner, regardless of label vs child');
    });
  });
}
