import 'package:flutter/material.dart';

/// Maps design-system numeric weights to [FontWeight] (foundation preview).
FontWeight foundationFontWeight(int v) {
  return switch (v) {
    900 => FontWeight.w900,
    850 => FontWeight.w800,
    800 => FontWeight.w800,
    750 => FontWeight.w700,
    700 => FontWeight.w700,
    600 => FontWeight.w600,
    500 => FontWeight.w500,
    _ => FontWeight.w400,
  };
}

String roleTitleLabel(String role) {
  return role[0].toUpperCase() + role.substring(1);
}

/// Same copy as React `ROLE_DESCRIPTIONS` in `Typography.stories.tsx`.
const Map<String, String> kTypographyRoleDescriptions = {
  'display': 'Hero / marketing moments. Brand-customizable f-steps.',
  'headline': 'Section introductions. Brand-customizable f-steps.',
  'title': 'Sub-section titles with +1 line-height offset.',
  'body': 'Long-form content. Emphasis weights, +3 line-height offset.',
  'label': 'UI labels and captions. Eight sizes, including 3XS.',
  'code': 'Monospace code samples. Uses `--Typography-Font-Code`.',
};
