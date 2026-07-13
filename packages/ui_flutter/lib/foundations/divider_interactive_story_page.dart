import 'package:flutter/material.dart';

import 'divider_brand_bind.dart';
import '../widgets/one_ui_divider.dart';

/// Web `Interactive` story — bare separator for accessibility smoke check.
class DividerInteractiveStoryPage extends StatelessWidget {
  const DividerInteractiveStoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    bindDividerBrandScope(context);
    final brandKey = dividerBrandScopeKey(context);
    return Center(
      child: dividerBrandKeyed(
        context,
        instanceKey: 'interactive-preview',
        child: KeyedSubtree(
          key: ValueKey('divider-interactive-$brandKey'),
          child: const OneUiDivider(
            content: kOneUiDividerContentNone,
            testId: 'divider-root',
          ),
        ),
      ),
    );
  }
}
