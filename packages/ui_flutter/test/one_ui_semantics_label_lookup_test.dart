/// Unit tests for [oneUiLookupSemanticsLabelByIdentifier].
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_semantics_label_lookup.dart';

void main() {
  testWidgets('resolves label from Semantics identifier anchor', (tester) async {
    late BuildContext probeContext;
    await tester.pumpWidget(
      MaterialApp(
        home: Column(
          children: [
            Semantics(
              container: true,
              identifier: 'caption-id',
              label: 'Upload status',
              child: ExcludeSemantics(
                child: Text('Upload status'),
              ),
            ),
            Builder(
              builder: (context) {
                probeContext = context;
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
      ),
    );
    await tester.pump();
    final handle = tester.ensureSemantics();
    final resolved = oneUiLookupSemanticsLabelByIdentifier(
      probeContext,
      'caption-id',
    );
    handle.dispose();
    expect(resolved, 'Upload status');
  });

  testWidgets('returns null when anchor is missing', (tester) async {
    String? resolved;
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) {
            resolved = oneUiLookupSemanticsLabelByIdentifier(
              context,
              'missing-id',
            );
            return const SizedBox.shrink();
          },
        ),
      ),
    );
    await tester.pump();
    expect(resolved, isNull);
  });
}
