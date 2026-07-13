import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/circular_progress_indicator_default_story_page.dart';
import 'package:ui_flutter/foundations/circular_progress_indicator_docs_page.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';

import 'cpi_test_harness.dart';

/// Mirrors `apps/storybook_flutter` canvas shell (chrome + expanded stack + align).
Widget pumpCpiStorybookShell(Widget story) {
  return pumpCpiApp(
    Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 96),
        Expanded(
          child: Stack(
            fit: StackFit.expand,
            children: [
              Align(
                alignment: Alignment.topCenter,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1168),
                  child: story,
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

void main() {
  group('CircularProgressIndicator Storybook pages', () {
    testWidgets('Default story renders without layout overflow',
        (tester) async {
      await tester.pumpWidget(
        pumpCpiStorybookShell(
          const CircularProgressIndicatorDefaultStoryPage(),
        ),
      );
      await pumpCpiLayout(tester);

      expect(tester.takeException(), isNull);
      expect(find.text('Controls'), findsOneWidget);
      expect(find.text('value: 25'), findsOneWidget);
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
    });

    testWidgets('Docs page renders props table + preview', (tester) async {
      await tester
          .pumpWidget(pumpCpiApp(const CircularProgressIndicatorDocsPage()));
      await pumpCpiLayout(tester);

      expect(find.text('CircularProgressIndicator'), findsOneWidget);
      expect(find.text('variant'), findsWidgets);
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
    });
  });
}
