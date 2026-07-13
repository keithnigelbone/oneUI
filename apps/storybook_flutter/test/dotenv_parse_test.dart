import 'package:flutter_test/flutter_test.dart';
import 'package:storybook/storybook_dotenv_parse.dart';

void main() {
  test('parseConvexUrlFromDotEnvSource prefers STORYBOOK_CONVEX_URL', () {
    const src = '''
NEXT_PUBLIC_CONVEX_URL=https://a.example
STORYBOOK_CONVEX_URL=https://b.example
''';
    expect(parseConvexUrlFromDotEnvSource(src), 'https://b.example');
  });

  test('parseConvexUrlFromDotEnvSource falls back to CONVEX_URL', () {
    const src = 'CONVEX_URL=https://convex-only.example\n';
    expect(parseConvexUrlFromDotEnvSource(src), 'https://convex-only.example');
  });

  test('parseConvexUrlFromDotEnvSource prefers STORYBOOK_CONVEX_URL over CONVEX_URL', () {
    const src = '''
CONVEX_URL=https://a.example
STORYBOOK_CONVEX_URL=https://b.example
''';
    expect(parseConvexUrlFromDotEnvSource(src), 'https://b.example');
  });

  test('parseConvexUrlFromDotEnvSource falls back to NEXT_PUBLIC_CONVEX_URL', () {
    const src = 'NEXT_PUBLIC_CONVEX_URL=https://only.example\n';
    expect(parseConvexUrlFromDotEnvSource(src), 'https://only.example');
  });
}
