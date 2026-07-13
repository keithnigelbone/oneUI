import 'package:flutter/material.dart';

import 'radio_brand_bind.dart';
import 'radio_story_catalog.dart';

class RadioDocsPage extends StatelessWidget {
  const RadioDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    bindRadioBrandScope(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Radio',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Single-select control. `appearance` drives border and checked fill '
            '(`auto` → secondary). Use `OneUiRadioGroup` for mutual exclusion.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          buildRadioDocsMerged(context),
        ],
      ),
    );
  }
}
