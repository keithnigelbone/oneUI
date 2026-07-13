import type { Result } from 'axe-core';

/** Plain-English explanations for axe rules shown in reports and test failures. */
export const AXE_RULE_PLAIN: Record<string, string> = {
  'button-name':
    'A button has no accessible name — screen readers only hear “button” with no label. Add visible text, aria-label, or aria-labelledby.',
  'role-img-alt':
    'An icon is exposed as an image (role="img") without a name. Decorative icons should be aria-hidden; meaningful icons need aria-label.',
  'image-alt':
    'An image is missing alternative text, so assistive technology cannot describe it.',
  'color-contrast':
    'Foreground and background colours do not meet WCAG AA minimum contrast.',
};

export function plainAxeViolationLine(v: Result): string {
  const plain = AXE_RULE_PLAIN[v.id] ?? v.description;
  const count = v.nodes?.length ?? 0;
  let targetHint = '';
  if (count === 1 && v.nodes?.[0]?.target) {
    const t = v.nodes[0].target;
    targetHint = ` Element: ${Array.isArray(t) ? t.join(' ') : String(t)}.`;
  } else if (count > 1) {
    targetHint = ` ${count} elements affected.`;
  }
  return `${plain}${targetHint} (Rule: ${v.id}, ${v.impact ?? 'unknown'} impact).`;
}

export function formatAxeViolationsPlain(violations: Result[]): string {
  if (violations.length === 0) return 'No accessibility violations found.';
  return violations.map(plainAxeViolationLine).join('\n\n');
}

/** One-line summary for dashboard “Reason” column from a Playwright error body. */
export function summarizeAxeFailureMessage(error: string | undefined): string | undefined {
  if (!error) return undefined;
  const clean = error.replace(/\u001b\[[0-9;]*m/g, '');
  for (const [ruleId, plain] of Object.entries(AXE_RULE_PLAIN)) {
    if (clean.includes(ruleId) || clean.includes(plain.slice(0, 40))) {
      return plain;
    }
  }
  const axeLine = clean.match(/\[(?:critical|serious|moderate)\][^\n]+/i)?.[0];
  if (axeLine) return axeLine.replace(/^\[[^\]]+\]\s*/i, '').trim();
  const line = clean
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith('expect(') && !l.startsWith('Received'));
  return line?.slice(0, 280);
}
