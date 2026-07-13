import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/pages/catalog_page.dart';
import 'package:qa_playground_flutter/qa/use_catalog_test_stability.dart';
import 'package:ui_flutter/brand/one_ui_brand_scope.dart';

void main() {
  testWidgets('CatalogPage renders hero title', (tester) async {
    FlutterError.onError = (details) {
      throw details.exception;
    };

    final stability = CatalogTestStabilityController(slugs: const ['button']);

    addTearDown(stability.dispose);

    await tester.binding.setSurfaceSize(const Size(1280, 800));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      OneUiBrandScope(
        platformId: 'L',
        density: 'default',
        theme: 'light',
        child: CatalogTestStabilityScope(
          controller: stability,
          child: MaterialApp(
            home: Scaffold(
              body: Column(
                children: [
                  Expanded(
                    child: CatalogPage(onOpenComponent: (_) {}),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(seconds: 1));

    expect(find.text('OneUI Components'), findsOneWidget);
  });
}
