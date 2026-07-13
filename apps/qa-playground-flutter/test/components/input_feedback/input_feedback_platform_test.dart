/// InputFeedback platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// InputFeedback is NON-interactive (no focus, tap, or keyboard). The platform
/// contract is about live-region / alert semantics exposure and layout parity.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import '../../support/components/input_feedback_harness.dart';

const _kMobilePlatforms = [TargetPlatform.android, TargetPlatform.iOS];
const _kWebDesktopPlatforms = [TargetPlatform.linux, TargetPlatform.macOS];

void _onPlatforms(
  List<TargetPlatform> platforms,
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in platforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      debugDefaultTargetPlatformOverride = platform;
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  }
}

void main() {
  setUpAll(() async {
    await ensureInputFeedbackIconsLoaded();
  });

  group('[platform][mobile] InputFeedback', () {
    _onPlatforms(_kMobilePlatforms, '[platform] negative exposes alert role',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedbackMessage: 'Invalid email.'),
      );
      withSemanticsHandle(tester, () {
        // PROBED: TalkBack/VoiceOver reads alert role on the container.
        expect(inputFeedbackProbedRole(tester), SemanticsRole.alert);
      });
    });

    _onPlatforms(
        _kMobilePlatforms, '[platform] positive exposes polite live region',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.positive,
          feedbackMessage: 'Saved.',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(inputFeedbackHasLiveRegion(tester), isTrue);
        expect(inputFeedbackProbedRole(tester), isNot(SemanticsRole.alert));
      });
    });

    _onPlatforms(_kMobilePlatforms, '[platform] message copy is visible',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedbackMessage: 'Required field.'),
      );
      expect(find.text('Required field.'), findsOneWidget);
    });
  });

  group('[platform][web] InputFeedback', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] negative exposes alert role',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedbackMessage: 'Error on desktop.'),
      );
      withSemanticsHandle(tester, () {
        expect(inputFeedbackProbedRole(tester), SemanticsRole.alert);
      });
    });

    _onPlatforms(
        _kWebDesktopPlatforms, '[web] informative uses polite live region',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.informative,
          feedbackMessage: 'Tip for desktop users.',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(inputFeedbackHasLiveRegion(tester), isTrue);
      });
    });

    _onPlatforms(
        _kWebDesktopPlatforms, '[web] feedback is not focusable/interactive',
        (tester) async {
      await pumpInputFeedbackQaHarness(
        tester,
        const OneUiInputFeedback(feedbackMessage: 'Static copy'),
      );
      withSemanticsHandle(tester, () {
        final data = inputFeedbackSemanticsData(tester, label: 'Static copy');
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse);
        expect(data.hasFlag(SemanticsFlag.isTextField), isFalse);
        expect(data.hasFlag(SemanticsFlag.isFocusable), isFalse);
      });
    });
  });
}
