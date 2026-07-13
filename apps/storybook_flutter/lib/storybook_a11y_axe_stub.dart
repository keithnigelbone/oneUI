import 'storybook_a11y_report.dart';

/// Non-web: axe does not run against a DOM (aligns with **`@storybook/addon-a11y`** only on web).
Future<AxeAuditBundle> runAxeWcagAudit() async {
  return AxeAuditBundle(
    axeUnavailableReason:
        'DOM **axe-core** runs on Flutter **web** only. On mobile/desktop, rely on '
        '`Semantics()` (TalkBack/VoiceOver) plus the semantics overlay toggle — WCAG DOM rules '
        '(`color-contrast`, `aria-*` against HTML) mirror web Storybook when you run Flutter web '
        'or Chromium.',
    violations: [],
    passes: [],
    incomplete: [],
  );
}
