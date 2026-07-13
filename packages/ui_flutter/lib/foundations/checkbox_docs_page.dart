import 'package:flutter/material.dart';

import 'checkbox_brand_bind.dart';
import 'checkbox_story_catalog.dart';

class CheckboxDocsPage extends StatelessWidget {
  const CheckboxDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    bindCheckboxBrandScope(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Checkbox',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Multi-state control. `appearance` drives border and checked-state fill '
            '(`auto` → secondary). Use `label` and optional `description` for visible copy.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          buildCheckboxDocsMerged(context),
        ],
      ),
    );
  }
}
