/**
 * redteam.ts
 *
 * The seed evasion corpus for the AST validator. Each fixture is a parsed,
 * alias-resolved artifact AST that an adversarial (or buggy) generator might
 * produce, paired with the violation code the validator MUST raise. P3
 * (VAL-06) extends this corpus; the validator's job is to block every entry.
 *
 * These exist to PROVE the validator is structural, not substring-based: the
 * headline case is the aliased non-Jio import (`Button as X` from `shadcn`),
 * which a `.includes('shadcn')` check would catch by accident but a
 * `.includes('Button')` allowlist would wave through — only alias resolution
 * gets it right (Pitfall 4 / T-01-07).
 */

import type { ArtifactAst } from '../astValidator';

export interface RedTeamFixture {
  /** Stable name for the test report. */
  name: string;
  /** What evasion this fixture exercises. */
  description: string;
  /** The parsed artifact handed to `validateAst`. */
  ast: ArtifactAst;
  /** The blocking violation code the validator MUST raise. */
  expectedBlockingCode: string;
}

export const REDTEAM_FIXTURES: readonly RedTeamFixture[] = [
  {
    name: 'aliased-non-jio-import',
    description:
      'import { Button as X } from "shadcn" — the alias hides the non-Jio source from a naive name allowlist; only structural source resolution blocks it.',
    expectedBlockingCode: 'non-jio-import',
    ast: {
      imports: [{ source: 'shadcn', imported: 'Button', local: 'X' }],
      root: {
        id: 'r',
        kind: 'component',
        // The tree references the alias `X`, which is bound to the non-Jio
        // source. Both the import and the component resolution must block.
        type: 'X',
        props: {},
        children: [],
      },
    },
  },
  {
    name: 'tailwind-import',
    description: 'A direct tailwindcss import is non-Jio and must be blocked (VAL-02).',
    expectedBlockingCode: 'non-jio-import',
    ast: {
      imports: [{ source: 'tailwindcss', imported: 'default', local: 'tw' }],
      root: { id: 'r', kind: 'text', text: 'hello' },
    },
  },
  {
    name: 'raw-element-node',
    description:
      'A raw <div> ElementASTNode smuggled into the tree — markup-free guard defence-in-depth (T-01-08).',
    expectedBlockingCode: 'raw-element',
    ast: {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: {
        id: 'r',
        kind: 'element',
        tag: 'div',
        props: { style: 'background: red' },
        children: [],
      },
    },
  },
  {
    name: 'unregistered-component',
    description:
      'A made-up <FancyHero/> component not in the registry — component gap + blocking (VAL-03).',
    expectedBlockingCode: 'unregistered-component',
    ast: {
      imports: [{ source: '@oneui/ui/components/FancyHero', imported: 'FancyHero', local: 'FancyHero' }],
      root: { id: 'r', kind: 'component', type: 'FancyHero', props: {}, children: [] },
    },
  },
  {
    name: 'known-drift-component',
    description:
      'A <Modal/> excluded from the generatable set due to known metadata drift — gap + blocking.',
    expectedBlockingCode: 'unregistered-component',
    ast: {
      imports: [{ source: '@oneui/ui/components/Modal', imported: 'Modal', local: 'Modal' }],
      root: { id: 'r', kind: 'component', type: 'Modal', props: {}, children: [] },
    },
  },
  {
    name: 'invalid-prop-on-valid-component',
    description:
      'A registered <Button/> with a fabricated prop not in its meta allowlist — blocking + repair suggestion (VAL-03).',
    expectedBlockingCode: 'invalid-prop',
    ast: {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: {
        id: 'r',
        kind: 'component',
        type: 'Button',
        props: { madeUpProp: 'x' },
        children: [],
      },
    },
  },
  // -------------------------------------------------------------------------
  // VAL-04 / VAL-05 evasion vectors — literal smuggling now caught by the
  // promoted blocking literal hook (Plan 03-01, Task 1).
  // -------------------------------------------------------------------------
  {
    name: 'inline-hex-on-visual-prop',
    description:
      'A registered <Button/> carrying an inline hex colour literal in className — the value bypasses the Jio token system (VAL-04). Always-allowed prop so the ONLY thing under test is the literal hook.',
    expectedBlockingCode: 'literal-value-hook',
    ast: {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: {
        id: 'r',
        kind: 'component',
        type: 'Button',
        props: { className: 'color: #ff0000' },
        children: [],
      },
    },
  },
  {
    name: 'fake-var-token',
    description:
      'A `var(--NotAToken)` whose token is NOT in the manifest allowlist — a literal dressed up as a Jio token; the BRAND_ALLOWED_REGEX escape hatch rejects it (VAL-04).',
    expectedBlockingCode: 'literal-value-hook',
    ast: {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: {
        id: 'r',
        kind: 'component',
        type: 'Button',
        props: { className: 'background: var(--NotAToken)' },
        children: [],
      },
    },
  },
  {
    name: 'dynamic-classname-literal',
    description:
      'A computed/dynamic className string carrying a px literal — smuggling a hardcoded dimension through the always-allowed className escape (VAL-04).',
    expectedBlockingCode: 'literal-value-hook',
    ast: {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: {
        id: 'r',
        kind: 'component',
        type: 'Button',
        props: { className: 'pad-12px gap-8px' },
        children: [],
      },
    },
  },
  {
    name: 'aliased-non-jio-font-import',
    description:
      'An aliased non-Jio font package import (`import Inter as F from "@fontsource/inter"`) — alias resolution catches the non-Jio source exactly like the headline shadcn case (VAL-02/VAL-05).',
    expectedBlockingCode: 'non-jio-import',
    ast: {
      imports: [{ source: '@fontsource/inter', imported: 'Inter', local: 'F' }],
      root: { id: 'r', kind: 'text', text: 'styled with a smuggled font' },
    },
  },
  {
    name: 'aliased-non-jio-icon-import',
    description:
      'An aliased non-Jio icon package import (`import { Rocket as Ic } from "lucide-react"`) — structural source resolution blocks the icon smuggling (VAL-02/VAL-05).',
    expectedBlockingCode: 'non-jio-import',
    ast: {
      imports: [{ source: 'lucide-react', imported: 'Rocket', local: 'Ic' }],
      root: { id: 'r', kind: 'component', type: 'Ic', props: {}, children: [] },
    },
  },
];
