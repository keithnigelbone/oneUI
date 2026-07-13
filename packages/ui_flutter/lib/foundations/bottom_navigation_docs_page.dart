import 'package:flutter/material.dart';

import 'bottom_navigation_brand_bind.dart';
import 'bottom_navigation_story_catalog.dart';

class BottomNavigationDocsPage extends StatelessWidget {
  const BottomNavigationDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    bindBottomNavigationBrandScope(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'BottomNavigation',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Bottom navigation bar for mobile and tablet surfaces. Holds 2–5 evenly '
            'distributed items, each with an icon and optional label. Uses a shared '
            'context to coordinate the active item and label layout across children.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          buildBottomNavigationDocsMerged(context),
        ],
      ),
    );
  }
}
