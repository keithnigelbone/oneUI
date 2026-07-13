import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/pages/component_detail_page.dart';

import '../../support/pump_one_ui_app.dart';

void main() {
  testWidgets('icon-button detail page renders header', (tester) async {
    await tester.pumpWidget(
      pumpOneUiQaApp(
        ComponentDetailPage(slug: 'icon-button', onBack: () {}),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Icon Button'), findsOneWidget);
  });
}
