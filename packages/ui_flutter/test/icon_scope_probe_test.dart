import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    await JioIconCatalog.instance.ensureLoaded();
  });

  testWidgets('bare MaterialApp — no OneUi scopes', (tester) async {
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: OneUiIcon(icon: 'heart'))),
    );
    expect(tester.takeException(), isNull);
    expect(find.byType(OneUiIcon), findsOneWidget);
  });

  testWidgets('OneUiScope only — no surface scope', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiScope(
          platformId: 'S',
          density: 'default',
          child:
              Scaffold(body: OneUiIcon(icon: 'heart', appearance: 'primary')),
        ),
      ),
    );
    expect(tester.takeException(), isNull);
    expect(find.byType(OneUiIcon), findsOneWidget);
  });

  testWidgets('OneUiScope + designSystem — no surface scope', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiScope(
          platformId: 'S',
          density: 'default',
          designSystem: NativeDesignSystemPayload(
            componentCustomProperties: const {
              '--Icon-color-high': 'var(--Primary-High)',
            },
            dimensionContexts: const [],
            activeDimensionKey: 'S:default',
          ),
          child:
              Scaffold(body: OneUiIcon(icon: 'heart', appearance: 'primary')),
        ),
      ),
    );
    expect(tester.takeException(), isNull);
    expect(find.byType(OneUiIcon), findsOneWidget);
  });
}
