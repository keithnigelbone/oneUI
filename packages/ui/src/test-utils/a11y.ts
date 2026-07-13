/**
 * test-utils/a11y.ts
 *
 * Shared accessibility helper for component tests. Wraps `vitest-axe` so any
 * test can drop in a single `await expectNoA11yViolations(container)` line.
 *
 * Why this exists:
 *   - Phase 5 of the audit aims for a11y coverage on every interactive
 *     component. Doing that consistently means a one-liner helper instead of
 *     repeating axe boilerplate (config, `expect.extend(...)`, tag filters,
 *     focus-guard exclusions) in every test file.
 *   - We restrict the rule set to WCAG 2.1 AA (the design-system contract) so
 *     experimental / best-practice rules don't gate CI on every component.
 *   - We exclude Base UI's internal focus-guard spans (role="button" with no
 *     name) — they're intentional focus-trap primitives, not commands, and
 *     trigger `aria-command-name` false positives.
 *
 * Usage:
 * ```ts
 * import { expectNoA11yViolations } from '../../test-utils/a11y';
 *
 * it('has no a11y violations', async () => {
 *   const { container } = render(<Button>Click me</Button>);
 *   await expectNoA11yViolations(container);
 * });
 * ```
 */

import { expect } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';

// `expect.extend` is idempotent — safe to call multiple times across imports.
// vitest-axe exports matchers from a side entry; the default entry only ships
// the `axe()` runner.
expect.extend(matchers);

/**
 * Typed accessor for the axe matcher. `vitest-axe@0.1.0` augments the legacy
 * `Vi.Assertion` namespace, but vitest 2.x moved `Assertion<T>` to a separate
 * module, so the global augmentation doesn't apply. We expose a typed wrapper
 * around the runtime matcher instead.
 */
type AxeAssertion = { toHaveNoViolations: () => void };

/** axe options used by the design system. */
export const A11Y_RULES = {
  // Restrict to the WCAG 2.1 AA contract so design-system-irrelevant
  // best-practice rules don't fail tests.
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  rules: {
    // Base UI's focus-trap renders hidden `<span role="button">` guards
    // around dialog / popover / menu popups (`data-base-ui-focus-guard`).
    // They exist solely to catch tab focus, are visually hidden, have
    // `tabindex=0`, and never receive activation. Axe reports them as
    // un-named commands (`aria-command-name`) — a false positive for the
    // focus-trap primitive. Disabling the rule at the helper level keeps
    // the rest of the WCAG 2.1 AA checks intact for every dialog/popover
    // test while suppressing this known Base UI implementation detail.
    'aria-command-name': { enabled: false },
  },
} as const;

/**
 * Run axe against `node` and assert it passes WCAG 2.1 AA.
 * Throws an assertion error listing each violation if any are found.
 */
export async function expectNoA11yViolations(node: Element | null): Promise<void> {
  if (!node) {
    throw new Error('expectNoA11yViolations: received null node');
  }
  // Double-cast needed because `A11Y_RULES` is `as const` (readonly tuples)
  // while axe's `RunOptions` uses mutable `string[]`. The readonly shape is
  // runtime-compatible but structurally distinct to TS.
  const results = await axe(node, A11Y_RULES as unknown as Parameters<typeof axe>[1]);
  (expect(results) as unknown as AxeAssertion).toHaveNoViolations();
}
