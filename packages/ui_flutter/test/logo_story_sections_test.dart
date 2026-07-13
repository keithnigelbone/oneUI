import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/logo_default_story_page.dart';
import 'package:ui_flutter/foundations/logo_docs_page.dart';
import 'package:ui_flutter/foundations/logo_foundations_page.dart';
import 'package:ui_flutter/foundations/logo_interactive_story_page.dart';
import 'package:ui_flutter/foundations/logo_story_catalog.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';

import 'logo_test_harness.dart';

void main() {
  group('Logo Storybook pages', () {
    testWidgets('Docs page renders with logos', (tester) async {
      await pumpLogoStoryHarness(tester, const LogoDocsPage());
      expect(find.text('Logo'), findsOneWidget);
      expect(find.byType(OneUiLogo), findsWidgets);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    testWidgets('Default story page renders centered brand logo',
        (tester) async {
      await pumpLogoStoryHarness(tester, const LogoDefaultStoryPage());
      expect(find.text('Controls'), findsNothing);
      expect(find.byType(OneUiLogo), findsOneWidget);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    testWidgets('Interactive story page renders controls and logo',
        (tester) async {
      await pumpLogoStoryHarness(tester, const LogoInteractiveStoryPage());
      expect(find.text('Controls'), findsOneWidget);
      expect(find.byType(OneUiLogo), findsOneWidget);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    for (final story in kLogoStoryNavOrder) {
      if (story == LogoFoundationStory.docs ||
          story == LogoFoundationStory.defaultStory ||
          story == LogoFoundationStory.interactive) {
        continue;
      }

      testWidgets('${story.sidebarTitle} foundations page renders logos',
          (tester) async {
        await pumpLogoStoryHarness(
          tester,
          LogoFoundationsPage(story: story),
        );
        expect(find.text(story.title), findsOneWidget);
        expect(find.byType(OneUiLogo), findsWidgets);
        expect(find.byType(ConvexGapCard), findsNothing);
      });
    }

    testWidgets('Image Fallback section shows fallback widgets',
        (tester) async {
      await pumpLogoStoryHarness(
        tester,
        const LogoFoundationsPage(story: LogoFoundationStory.imageFallback),
      );
      expect(find.text('broken src + fallback'), findsOneWidget);
      expect(find.text('empty + fallback'), findsOneWidget);
      expect(find.text('?'), findsOneWidget);
    });

    testWidgets('Surface Context section renders all surface modes',
        (tester) async {
      await pumpLogoStoryHarness(
        tester,
        const LogoFoundationsPage(story: LogoFoundationStory.surfaceContext),
      );
      for (final mode in [
        'default',
        'minimal',
        'subtle',
        'moderate',
        'bold',
        'elevated'
      ]) {
        expect(find.textContaining(mode), findsOneWidget);
      }
      expect(find.byType(OneUiLogo), findsWidgets);
    });
  });
}
