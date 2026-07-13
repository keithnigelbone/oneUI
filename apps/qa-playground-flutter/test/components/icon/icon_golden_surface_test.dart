/// Icon visual-regression tests — Surface-context nesting.
///
/// Per CLAUDE.md, Surface Context Awareness is the CORE of the design system.
/// Icons inside `<Surface mode=…>` with `appearance='auto'` must remap their
/// glyph colour against the parent role.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';

import '../../support/components/icon_harness.dart';

const _kSurfaceModes = <String>['bold', 'subtle', 'minimal', 'elevated'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][surface] Icon — inside Surface(mode=X, appearance=primary)', () {
    for (final mode in _kSurfaceModes) {
      for (final emphasis in [
        OneUiIconEmphasis.high,
        OneUiIconEmphasis.medium,
      ]) {
        testWidgets('surface=$mode / emphasis=${emphasis.name}', (tester) async {
          await pumpIconQaHarnessSettled(
            tester,
            OneUiIcon(
              icon: 'heart',
              appearance: 'auto',
              emphasis: emphasis,
              semanticsLabel: 'Like',
            ),
            surfaceMode: mode,
            surfaceAppearance: 'primary',
          );
          await expectLater(
            find.byType(OneUiIcon),
            matchesGoldenFile(
                'goldens/surface/icon_in_surface_${mode}_${emphasis.name}.png'),
          );
        });
      }
    }
  });
}
