import 'package:flutter/material.dart';

import 'logo_showcase.dart';

/// Web `Default` — centered brand logo (no controls panel).
class LogoDefaultStoryPage extends StatelessWidget {
  const LogoDefaultStoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: logoDefaultSection(context),
    );
  }
}
