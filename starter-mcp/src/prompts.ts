/**
 * Phase 4 — slash-command prompts.
 * oneui-build-from-prd: orchestrated PRD-to-compliant-screen workflow.
 */
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getPrdTemplate } from './lib/snapshot.js';

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'oneui-build-from-prd',
    {
      title: 'Build a OneUI screen from a PRD',
      description:
        'Orchestrated workflow: given a product requirement, call the OneUI MCP tools in the right order ' +
        '(load invariants → search knowledge → pick components → load brand → write TSX → validate → self-heal) ' +
        'and return a token-compliant, brand-correct, WCAG-AA React component. ' +
        'Invoke with /oneui-build-from-prd in Cursor, Claude Code, or any MCP-capable agent.',
      argsSchema: {
        prd: z.string().describe(
          'The product or feature requirement. EITHER a short free-text description (a paragraph or two), ' +
          'OR a completed OneUI PRD template (from get_prd_template / oneui://prd-template). If you pass a ' +
          'filled template, its Brand & theme, Scope (v1 vs Deferred), Screens & flow, and Acceptance ' +
          'criteria sections drive the build.',
        ),
        brand: z.string().optional().describe(
          'Target brand slug (default: "jio"). Available: jio, tira, reliance, swadesh, oneui-system. Call list_brands() to see all.',
        ),
        route: z.string().optional().describe(
          'Optional route or page context, e.g. "/checkout" or "ProfileScreen". Helps narrow component and layout decisions.',
        ),
      },
    },
    async ({ prd, brand, route }) => {
      const targetBrand = (brand && brand.trim()) ? brand.trim() : 'jio';
      const routeLine = route ? `\nRoute / page context: **${route}**` : '';

      const promptText = [
        '# OneUI build task',
        '',
        '## Requirement',
        prd,
        routeLine,
        '',
        `## Target brand: ${targetBrand}`,
        '',
        '---',
        '',
        '## Your workflow — follow every step in order, do not skip',
        '',
        '### Step 0 — If the requirement is a filled PRD template, parse it first',
        'If the requirement above is a completed OneUI PRD template (has sections like "## 2. Brand & theme",',
        '"## 3. Scope", "## 4. Screens & flow"), extract and obey:',
        '  - **Brand & theme / mode** (§2): if it names a brand and no brand argument was given, use the',
        '    template\'s brand instead of the default; note the theme + light/dark mode for `data-theme` wiring.',
        '  - **Scope v1 (§3)** is exactly what to build. **Deferred (§3a) — DO NOT build** (no validation,',
        '    integrations, auth, error/empty states unless they are in §3). Do not over-build.',
        '  - **Screens & flow (§4)**: build each screen and wire every primary action to its destination route',
        '    in the stated order. **Data (§5)** = use the mock data given. **References (§6)** ground the layout.',
        '  - **Acceptance criteria (§8)** are the stop condition for the self-heal loop.',
        'If it is a short free-text description instead, just proceed to Step 1.',
        '',
        '### Step 1 — Load the invariants (mandatory first step)',
        'Call `get_core_invariants()` and read it in full.',
        'These rules apply to every line of TSX you write:',
        '- **Zero literals.** No hardcoded colours, px sizes, font sizes, weights, or spacing values.',
        '- **Role-explicit typography tokens.** Use `--Body-M-FontSize`, `--Label-S-FontSize`, etc.',
        '  Never `--Typography-Size-*` (legacy). Always pair font-size with a matching line-height token.',
        '- **Font family via token, never a literal.** Set the font with `var(--Typography-Font-Text)`',
        '  (body/label/UI) or `var(--Typography-Font-Heading)` (display/headline/title) — or the role token',
        '  (`--Body-FontFamily`, `--Label-FontFamily`, …). NEVER write a literal typeface like',
        "  `'JioType Var'` or `'Inter'` — the token resolves to JioType Var under Jio and to each brand's font otherwise.",
        '- **Surface wrapping.** Never set `background` / `backgroundColor` inline with a surface token.',
        '  Use `<Surface mode="...">` — child tokens auto-remap, components stay readable on any background.',
        '- **Focus halo.** Interactive components need `--Surface-Halo-Gap` (not `--Surface-Main`) in their focus styles.',
        '- **Shape.** Buttons default to `Shape-Pill`. Other interactive elements default to `Shape-2`.',
        '',
        '### Step 2 — Search relevant guidance',
        `Call \`search_design_system("${prd.slice(0, 80).replace(/"/g, "'")}")\` to surface relevant rules and patterns.`,
        'Always call `get_skill("oneui-design-composition")` — page/layout composition, component selection, typography, spacing.',
        'Call `get_skill("surface")` to decide WHICH surface level each region earns (default-first, restraint).',
        'Call `get_skill("surface-context")` for the surface token-remapping mechanics — the rule models break most often.',
        '',
        '### Step 3 — Select and read every component you plan to use',
        'Call `list_components()` to see what is available.',
        'For **each** component you plan to use, call `get_component_info(name)` and read:',
        '  - `compositionRules.requires` / `allows` / `forbids` — hard constraints, not suggestions.',
        '  - `variantLogic` — which variant to use when.',
        '  - `props` — exact names, types, and defaults. Do not invent props.',
        '',
        '### Step 4 — Load brand tokens',
        `Call \`get_brand_tokens("${targetBrand}", true)\` to read its colour roles and font choices.`,
        'The `rolesOnly=true` flag strips the full 25-step palette and returns just the key role values.',
        '',
        '### Step 5 — Write the TSX',
        'Structure:',
        '```tsx',
        `import '@jds4/oneui-react/styles';`,
        `import '@jds4/oneui-icons-jio';`,
        `import { BrandProvider, Surface, /* components... */ } from '@jds4/oneui-react';`,
        '',
        `export default function MyScreen() {`,
        `  return (`,
        `    <BrandProvider brand="${targetBrand}">`,
        `      {/* layout + components here */}`,
        `    </BrandProvider>`,
        `  );`,
        `}`,
        '```',
        'Rules while writing:',
        '  - Every tinted/dark/coloured background must be a `<Surface mode="...">`, not a `<div style={{}}>` .',
        '  - Use `var(--Spacing-*)` for all spacing, never px literals.',
        '  - Use `var(--Shape-*)` or `var(--Shape-Pill)` for border-radius, never px.',
        '  - Every text element routes its font through a token (never a literal typeface); pair font-size with line-height.',
        '  - Use the attention-level→variant mapping: high=bold, medium=subtle, low=ghost.',
        '',
        '### Step 6 — Validate',
        'Call `validate_oneui_code(tsx)` with the complete TSX you just wrote.',
        '',
        '### Step 7 — Self-heal (up to 3 passes)',
        'For each issue the validator returns:',
        '  - `inline-surface-paint`: replace the inline background with a `<Surface mode="...">` wrapper.',
        '  - `legacy-token`: replace with the role-explicit token shown in the suggestion.',
        '  - `unknown-prop`: remove the prop or rename it to the correct one from the component API.',
        'Re-run `validate_oneui_code` after each round of fixes.',
        'Stop when the validator returns "All clear".',
        '',
        '### Step 8 — Return the result',
        'Return the final validated TSX followed by a concise summary:',
        '  - Components chosen and why (variantLogic decision, attention level).',
        '  - Surface modes applied and where.',
        '  - Any brand-specific token or font overrides used.',
        '  - Accessibility decisions (aria labels, keyboard navigation, touch targets).',
      ].join('\n');

      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: promptText,
            },
          },
        ],
      };
    },
  );

  // Optional convenience: drop the blank PRD template into the chat for the user to fill,
  // then hand the completed template to /oneui-build-from-prd.
  server.registerPrompt(
    'oneui-prd',
    {
      title: 'Start a OneUI PRD',
      description:
        'Drop the OneUI PRD template into the chat to fill in. Once completed, pass it to ' +
        '/oneui-build-from-prd to generate the screens. Invoke with /oneui-prd.',
      argsSchema: {},
    },
    async () => {
      const tpl = getPrdTemplate();
      const body = tpl
        ? `Fill in the PRD template below, then run \`/oneui-build-from-prd\` with the completed template ` +
          `as the \`prd\` argument.\n\n${tpl}`
        : 'PRD template is not available in this snapshot (run `npm run build:snapshot`).';
      return {
        messages: [
          { role: 'user' as const, content: { type: 'text' as const, text: body } },
        ],
      };
    },
  );
}
