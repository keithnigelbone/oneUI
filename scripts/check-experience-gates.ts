/**
 * check-experience-gates.ts
 *
 * Phase-2 Experience Lab CI gate. Runs the two enforcement suites that make the
 * Phase-2 guarantees provable rather than conventional, and hard-fails CI on any
 * divergence (drift or a broken compiler):
 *
 *   1. REG-04 — the registry freshness gate
 *      (`queryRegistry.freshness.test.ts` in `@oneui/experience-builder-registry`).
 *      Re-derives the Lab registry from the live Jio catalog x generated metadata
 *      and hard-fails on ANY added/removed/changed component id or per-item
 *      props/variants/slots metadata divergence (D-10). Closes the registry/
 *      metadata drift surface flagged in `.planning/codebase/CONCERNS.md`.
 *
 *   2. GEN-06 — the compiler acceptance triad
 *      (`compiler.test.ts` in `@oneui/experience-builder-agents`). Proves the
 *      IR -> AST -> React + Jio CSS compiler credential-free (D-08): the emitted
 *      module type-checks + its `@oneui/ui` imports resolve, the AST allowlist
 *      validator passes on the compiled output, and the codegen string snapshot
 *      is stable.
 *
 * Both are pure, deterministic, and credential-free (no ANTHROPIC_API_KEY, no
 * network). The gate exits non-zero the moment either suite fails — that is the
 * hard-fail CI relies on. Wired into `pnpm ci:gates` so registry/compiler drift
 * can never slip past CI (T-02-15).
 */

import { execFileSync } from 'node:child_process';

/** One enforcement suite to run: a pnpm filter + a vitest filename filter. */
interface Gate {
  /** Human-readable gate name (REQ id + what it guards). */
  readonly label: string;
  /** The workspace package the suite lives in. */
  readonly filter: string;
  /** The vitest filename filter selecting just this suite. */
  readonly testFilter: string;
}

const GATES: readonly Gate[] = [
  {
    label: 'REG-04 registry freshness (derive-equals-live, D-10)',
    filter: '@oneui/experience-builder-registry',
    testFilter: 'freshness',
  },
  {
    label: 'GEN-06 compiler acceptance triad (D-08)',
    filter: '@oneui/experience-builder-agents',
    testFilter: 'compiler',
  },
];

function runGate(gate: Gate): boolean {
  // eslint-disable-next-line no-console
  console.log(`\n▶ check:experience-gates — running ${gate.label}`);
  try {
    execFileSync(
      'pnpm',
      ['--filter', gate.filter, 'test', gate.testFilter],
      { stdio: 'inherit' },
    );
    return true;
  } catch {
    // execFileSync throws on a non-zero exit; vitest already printed the diff.
    return false;
  }
}

function main(): void {
  const failures: string[] = [];
  for (const gate of GATES) {
    if (!runGate(gate)) failures.push(gate.label);
  }

  if (failures.length === 0) {
    // eslint-disable-next-line no-console
    console.log(
      '\n✓ check:experience-gates — REG-04 freshness + GEN-06 acceptance passed',
    );
    process.exit(0);
  }

  // eslint-disable-next-line no-console
  console.error(
    `\n✗ check:experience-gates — ${failures.length} Phase-2 gate(s) failed:\n  ` +
      `${failures.join('\n  ')}\n\n` +
      'A failure here means the Lab registry has drifted from the live Jio ' +
      'component metadata (REG-04) or the IR->React+Jio-CSS compiler is broken ' +
      '(GEN-06). Fix the divergence — do NOT bypass this gate.',
  );
  process.exit(1);
}

main();
