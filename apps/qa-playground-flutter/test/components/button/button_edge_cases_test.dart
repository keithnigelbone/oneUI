/// Button — edge-case verification tests.
///
/// Covers the audit items that were unconfirmed at filing time. Each test
/// here verifies a code path inspection finding against actual runtime
/// behaviour. If the test passes, the audit item can be closed as
/// "not a bug" with confidence. If it fails, the audit item is a real
/// bug — file a ticket with the failure as evidence.
///
/// Items covered:
///   - OneUI-266 (A11y): autofocus + nested Dialog focus relinquish.
///     Verifies a Button with `autofocus: true` correctly gives up
///     primary focus when a Dialog opens above it. Bug would manifest as
///     focus staying on the underlying button even though the Dialog is
///     active, breaking keyboard / screen-reader navigation.
///   - OneUI-267 (A11y): loading + start-icon AT chatter on Flutter web.
///     Verifies that when a Button is `loading: true` with a `start:`
///     icon, the Semantics tree announces ONLY "Loading" — the icon's
///     visible-but-hidden glyph must be excluded from semantics. Bug
///     would manifest as duplicated announcements: "icon name" + "Loading"
///     on the same tap target.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';

import '../../support/components/button_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[a11y] Button — autofocus + nested Dialog focus relinquish (OneUI-266)', () {
    testWidgetsAllPlatforms(
      '[a11y] autofocused button gives up primary focus when a Dialog opens',
      (tester) async {
        final navKey = GlobalKey<NavigatorState>();
        final dialogButtonKey = GlobalKey();

        await pumpButtonQaHarnessSettled(
          tester,
          Builder(
            builder: (context) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const OneUiButton(label: 'AutoFocused', autofocus: true),
                  OneUiButton(
                    label: 'Open Dialog',
                    onPressed: () {
                      showDialog<void>(
                        context: context,
                        builder: (_) => AlertDialog(
                          content: OneUiButton(
                            key: dialogButtonKey,
                            label: 'InsideDialog',
                            autofocus: true,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              );
            },
          ),
        );

        // Precondition: the autofocused button owns primary focus.
        final autoFocusedHasFocus = FocusManager.instance.primaryFocus
                ?.debugLabel
                ?.contains('AutoFocused') ??
            false;
        expect(autoFocusedHasFocus, isTrue,
            reason: 'precondition: autofocused button must claim focus on first frame');

        // Open the dialog.
        await tester.tap(find.text('Open Dialog'));
        await tester.pumpAndSettle();

        // After the dialog opens, the underlying button must NOT still hold
        // primary focus — Flutter's focus traversal must transfer focus
        // into the dialog scope. THIS is the user-facing concern of
        // OneUI-266: if the underlying button kept focus, AT navigation
        // (TalkBack / VoiceOver) would be stuck on the hidden button.
        //
        // Note: we intentionally do NOT assert that the dialog's child
        // claims focus — that's framework-driven (Flutter's focus
        // traversal) and can be flaky under `pumpAndSettle` in widget
        // tests. The Button's contract is only to relinquish, which is
        // what this assertion covers.
        final underlyingStillHasFocus = FocusManager.instance.primaryFocus
                ?.debugLabel
                ?.contains('AutoFocused') ??
            false;
        expect(underlyingStillHasFocus, isFalse,
            reason:
                'OneUI-266: when a Dialog opens, the underlying autofocused Button '
                'must relinquish primary focus to the dialog\'s focus scope. '
                'Failure means AT navigation (TalkBack/VoiceOver) is stuck on '
                'the hidden button.');

        // Tidy up so the test teardown doesn't leak a route.
        navKey.currentState?.maybePop();
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] focus returns to underlying button after Dialog closes',
      (tester) async {
        late BuildContext capturedContext;
        await pumpButtonQaHarnessSettled(
          tester,
          Builder(builder: (context) {
            capturedContext = context;
            return const OneUiButton(label: 'Origin', autofocus: true);
          }),
        );

        expect(
          FocusManager.instance.primaryFocus?.debugLabel?.contains('Origin'),
          isTrue,
          reason: 'precondition: autofocused button owns focus before dialog',
        );

        // Open + close a dialog
        final future = showDialog<void>(
          context: capturedContext,
          builder: (_) => const AlertDialog(content: Text('Modal')),
        );
        await tester.pumpAndSettle();
        Navigator.of(capturedContext).pop();
        await future;
        await tester.pumpAndSettle();

        // After the dialog closes, the underlying button SHOULD regain focus
        // (Flutter's default focus-restoration behaviour). This is a check
        // that OneUiButton doesn't interfere with that restoration.
        final originRegained = FocusManager.instance.primaryFocus
                ?.debugLabel
                ?.contains('Origin') ??
            false;
        expect(originRegained, isTrue,
            reason:
                'OneUI-266: after a Dialog closes, focus must return to the '
                'previously-focused button. Failure means OneUiButton is '
                'interfering with Flutter\'s focus-restoration.');
      },
    );
  });

  group('[a11y] Button — loading + start-icon Semantics tree (OneUI-267)', () {
    testWidgetsAllPlatforms(
      '[a11y] loading + start-icon — Semantics announces "Loading" only, not the icon label',
      (tester) async {
        // The bug under verification: when loading=true is combined with a
        // start: icon, does the Semantics tree announce BOTH the icon's
        // semanticLabel AND "Loading"? AT chatter would be the user-facing
        // failure.
        await pumpButtonQaHarness(
          tester,
          const OneUiButton(
            label: 'Submit',
            loading: true,
            start: OneUiIcon(
              icon: 'check',
              emphasis: OneUiIconEmphasis.high,
              semanticsLabel: 'success-glyph',
            ),
          ),
        );

        // Pull the Button's semantics node and inspect it.
        withSemanticsHandle(tester, () {
          final node = tester.getSemantics(buttonSemanticsFinder());
          final data = node.getSemanticsData();

          // The button's a11y contract during loading:
          //   - hint MUST contain "Loading"
          //   - the icon's semanticLabel MUST NOT appear in either label
          //     or hint (the icon must be excluded from Semantics during
          //     loading, even though its layout space is preserved)
          expect(data.hint, contains('Loading'),
              reason:
                  'OneUI-267 precondition: loading state must add a "Loading" hint');

          final fullText = '${data.label} ${data.hint}';
          expect(fullText, isNot(contains('success-glyph')),
              reason:
                  'OneUI-267: the start icon\'s semanticLabel ("success-glyph") '
                  'MUST be excluded from Semantics during loading. AT users '
                  'should hear "Submit. Loading", not "Submit. success-glyph. Loading".');
        });
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] loading + start-icon — exactly one Semantics tap target on the Button subtree',
      (tester) async {
        // A duplicate-button gotcha: if Button's loading overlay nests a
        // second Semantics node with its own tap action, AT users hear the
        // button twice. This test asserts the subtree has exactly one
        // `SemanticsAction.tap`-capable node.
        await pumpButtonQaHarness(
          tester,
          const OneUiButton(
            label: 'Submit',
            loading: true,
            start: OneUiIcon(icon: 'check', semanticsLabel: 'success-glyph'),
          ),
        );

        withSemanticsHandle(tester, () {
          // Walk the semantics subtree rooted at the button and count nodes
          // exposing a tap action. The loading-state Button is disabled
          // (interactive=false), so we expect ZERO tap actions on the tree —
          // a non-zero count would indicate AT users can still tap the
          // hidden button.
          final root = tester.getSemantics(buttonSemanticsFinder());
          var tapNodeCount = 0;
          void walk(SemanticsNode? node) {
            if (node == null) return;
            final d = node.getSemanticsData();
            if (d.hasAction(SemanticsAction.tap)) tapNodeCount++;
            node.visitChildren((child) {
              walk(child);
              return true;
            });
          }

          walk(root);
          expect(tapNodeCount, 0,
              reason:
                  'OneUI-267 part 2: a loading Button must expose ZERO tap actions '
                  'in its Semantics subtree (button is disabled). A non-zero count '
                  'means AT users can still activate a button that is supposed to '
                  'be inert during loading.');
        });
      },
    );
  });
}
