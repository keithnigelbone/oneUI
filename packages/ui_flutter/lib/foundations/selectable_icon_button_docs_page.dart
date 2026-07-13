import 'package:flutter/material.dart';

import 'selectable_icon_button_story_catalog.dart';

class SelectableIconButtonDocsPage extends StatelessWidget {
  const SelectableIconButtonDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: buildSelectableIconButtonDocsMerged(context),
    );
  }
}
