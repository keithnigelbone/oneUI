import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/default_jio_brand_snapshot.dart';
import 'package:ui_flutter/brand/one_ui_brand_provider.dart';
import 'package:ui_flutter/tokens/jio_type_font.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('bundled Jio brand loads and resolves JioType Variable', () async {
    await ensureOneUiBrandDefaultsLoaded();
    final snap = DefaultJioBrandSnapshot.forMode('light');
    expect(snap, isNotNull);
    expect(snap!.typography, isNotNull);
    final primary = snap.typography!['fontFamilies']?['primary'];
    expect(isJioTypeFamilyName(primary?.toString()), isTrue);
  });
}
