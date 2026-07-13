import 'package:flutter/material.dart';

import 'text_story_catalog.dart';

/// Docs route — merged sections (web autodocs).
class TextDocsPage extends StatelessWidget {
  const TextDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Text',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Inline / block text spanning all 6 typography roles, role-specific size scales, '
            'canonical multi-accent appearance, attention levels, and surface-context-aware '
            'colour. Typography resolves through Convex `nativeTheme.typography` (including '
            '`scriptVariants` and `fontFamilies.script`); colours through `OneUiSurfaceScope`. '
            'Supports `lang` / `script` / `language`, `href` for link semantics, and `aria-hidden`.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          buildTextDocsMerged(context),
        ],
      ),
    );
  }
}
