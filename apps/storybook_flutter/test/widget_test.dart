import 'package:flutter_test/flutter_test.dart';
import 'package:storybook/main.dart';

void main() {
  testWidgets('Storybook shell builds', (WidgetTester tester) async {
    await tester.pumpWidget(const StorybookApp(convexUrl: ''));
    expect(find.text('Storybook'), findsWidgets);
  });
}
