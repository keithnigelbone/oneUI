import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'package:flutter_sample/main.dart';

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    await JioIconCatalog.instance.ensureLoaded();
    await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true);
  });

  testWidgets('DemoApp renders hub with sample demos', (tester) async {
    await tester.pumpWidget(const DemoApp(convexUrl: ''));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.text('OneUI Sample Demos'), findsOneWidget);
    expect(find.text('JioMart Demo'), findsOneWidget);
    expect(find.text('Tira Beauty Demo'), findsOneWidget);
    expect(find.text('PeopleFirst Demo'), findsOneWidget);
    expect(find.text('Open demo'), findsNWidgets(3));
  });

  testWidgets('Open demo navigates to storefront', (tester) async {
    await tester.pumpWidget(const DemoApp(convexUrl: ''));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    await tester.tap(find.text('Open demo').first);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 800));

    expect(find.text('Home'), findsOneWidget);
    expect(find.text('JioMart Demo'), findsOneWidget);
  });

  testWidgets('Open Tira demo shows beauty home', (tester) async {
    await tester.pumpWidget(const DemoApp(convexUrl: ''));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    await tester.tap(find.text('Open demo').at(1));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 800));

    expect(find.text('Tira Beauty Demo'), findsOneWidget);
    expect(find.text('Just Dropped'), findsOneWidget);
  });

  testWidgets('Open PeopleFirst demo shows home dashboard', (tester) async {
    tester.view.physicalSize = const Size(1280, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(const DemoApp(convexUrl: ''));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    await tester.fling(
      find.byType(CustomScrollView),
      const Offset(0, -600),
      1000,
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Open demo').at(2));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 1200));

    expect(find.textContaining('Hello'), findsOneWidget);
    expect(find.textContaining('Quick Links'), findsOneWidget);
    expect(find.text('Calendar'), findsOneWidget);
  });

  testWidgets('PeopleFirst benefits renders without overflow on mobile width',
      (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(const DemoApp(convexUrl: ''));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    await tester.tap(find.text('Open demo').at(2));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 800));

    await tester.tap(find.text('Benefits').last);
    await tester.pumpAndSettle();

    expect(find.textContaining('Retail Gift Voucher'), findsOneWidget);
    expect(find.textContaining('Primary benefit plan'), findsOneWidget);
  });

  testWidgets('PeopleFirst sidebar nav stays in demo', (tester) async {
    tester.view.physicalSize = const Size(1280, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(const DemoApp(convexUrl: ''));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    await tester.tap(find.text('Open demo').at(2));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 1200));

    expect(find.text('PeopleFirst sample'), findsOneWidget);

    await tester.tap(find.text('My Profile').first);
    await tester.pumpAndSettle();

    expect(find.text('PeopleFirst sample'), findsOneWidget);
    expect(find.text('Basic Info'), findsOneWidget);
    expect(find.text('OneUI Sample Demos'), findsNothing);
  });
}
